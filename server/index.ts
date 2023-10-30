
// modules
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import http from 'http';
import express from 'express';
import openRadio from 'openradio';
import cors from 'cors';
import {Server as SocketIO} from 'socket.io';
import {
    downloadFileFromGoogleDrive,
    getGistFileContent,
    getTrackDuration,
    exitHandler
} from './utils';

// configs
const app = express();
const radio = openRadio();
app.use(cors());
app.use("/", express.static(path.join(__dirname, "..", "dist")));

// constants
const playlistFile = process.env.RADIO_PLAYLIST_FILE || 'tracks';
const backendPort = process.env.VITE_BACKEND_PORT || 3001;
const socketPort = process.env.VITE_SOCKET_PORT || 3000;
const trackPath = path.join(__dirname, '..', 'public', 'radio.mp3');

// socket related
const socketServer = http.createServer(app);
const io = new SocketIO(socketServer, {
    cors: {
        origin: [
            `http://localhost:${backendPort}`,
        ],
    },
    transports: ['websocket'],
});
let trackInfo = {
    title: '',
    image: '',
    duration: 0,
    started_at: 0,
};
let listenersCount = 0;
const manualDelayTrackChangedEventSeconds = 0;

// routes
app.get("/", (req, res) => {
    res.setHeader("Content-Type", "text/html");
    return res.sendFile(path.join(__dirname, "..", "dist", "index.html"));
});
app.get("/api", (req, res) => {
    return res.json({
        message: "API URL-endpoint.",
    });
});
app.get("/api/track-info", (req, res) => {
    const differenceInSeconds = Math.floor(Date.now() / 1000) - trackInfo.started_at;

    return res.status(200).json({
        ...trackInfo,
        difference_in_seconds: differenceInSeconds,
    });
});
app.get('/stream', (req, res) => {
    res.setHeader("Content-Type", "audio/mp3");
    radio.pipe(res);
});
app.get("/*", (_req, res) => {
    return res.json({
        message: "API URL-endpoint not found!",
    });
});

// Handling errors for any other cases from whole application
app.use((err, req, res) => {
    return res.status(500).json({ error: "Something went wrong!" });
});

// create a server
http.createServer((req, res) => {
    res.setHeader("Content-Type", "audio/mp3");
    radio.pipe(res);
});

// listen on port
socketServer.listen(socketPort, () => {
    console.log(`Socket server running at: \x1b[36mhttp://localhost:\x1b[1m${socketPort}/\x1b[0m`);
});

// socket.io
io.on('connection', (socket) => {
    listenersCount++;
    io.emit('listeners_count', listenersCount);
    socket.on('disconnect', () => {
        listenersCount--;
        io.emit('listeners_count', listenersCount);
    });
    if (trackInfo.duration > 0) {
        setTimeout(() => {
            // console.log(`Playing track: ${trackInfo.title}`);
            socket.emit('track_changed', trackInfo);
        }, manualDelayTrackChangedEventSeconds * 1000);
    }
});

app.listen(backendPort, () => {
    console.log(`Backend running at: \x1b[36mhttp://localhost:\x1b[1m${backendPort}/\x1b[0m`);
});

// play track function
const playTrack = () => {
    // check if old track exists, delete it
    if (fs.existsSync(trackPath)) {
        fs.unlinkSync(trackPath);
    }
    // get playlist from gist
    getGistFileContent(process.env.RADIO_GIST_ID, `${playlistFile}.json`)
        .then((data) => {
            if (!data) {
                exitHandler('Playlist file is empty!');
            }

            const playlist = JSON.parse(data);
            const randomNumber = Math.floor(Math.random() * playlist.length);
            // download random track from the source
            downloadFileFromGoogleDrive(playlist[randomNumber].file, trackPath)
                .then(async () => {
                    const duration = await getTrackDuration(trackPath);
                    if (duration === 0) {
                        console.log('Track duration is 0, skipping...');
                        playTrack();
                        return;
                    }

                    radio.play(fs.createReadStream(trackPath));

                    trackInfo.title = playlist[randomNumber].title;
                    trackInfo.image = playlist[randomNumber].image;
                    trackInfo.duration = duration; // playlist[randomNumber].duration;
                    trackInfo.started_at = Math.floor(Date.now() / 1000);

                    setTimeout(() => {
                        console.log(`Playing track: ${trackInfo.title}`);
                        io.sockets.emit('track_changed', trackInfo);
                    }, manualDelayTrackChangedEventSeconds * 1000);
                })
                .catch((err) => {
                    exitHandler(err.message || 'Error while downloading track!');
                });
        })
        .catch((err) => {
            exitHandler(err.message || 'Error while getting playlist!');
        });
}

// play track on start
playTrack();
// play next track when current track ends
radio.on('finish', () => {
    playTrack();
});
