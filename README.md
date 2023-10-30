
## Visualized radio-streaming with React/Vite/Node/FFmpeg/Socket.io

<img src="https://i.imgur.com/KwGKjNj.gif" style="width: 100%"/>


### About:

This is a simple Online Radio app built with React.js, Vite, Node.js, FFmpeg, and Socket.io.

The app is a single-page application that uses the Web Audio API to play audio files.

It gets audio file information from the remote editable document, downloads the appropriate audio file from the cloud, and continuously adds it to the stream. After the song is finished, it is deleted from the server. And repeats this process over and over by selecting some random track from the track list.

Article about this project on [**Medium**](https://medium.com/@boolfalse/visualized-radio-streaming-with-react-vite-node-ffmpeg-socket-io-9ed6feb6fcc3).


### Prerequisites:

- [Node.js](https://nodejs.org/en/download)
- [FFmpeg](https://ffmpeg.org/download.html)


### Installation:

- Download:
```shell
git clone git@github.com:boolfalse/radio-streaming-project.git && cd radio-streaming-project/
```

- Install dependencies:
```shell
npm i && npm i --prefix=server/
```

- Bundle the project:
```shell
npm run build
```

- Setup _**.env**_ credentials:
```dotenv
APP_ENV="development"
VITE_BACKEND_PORT=3001

VITE_SOCKET_PORT=3000
VITE_SOCKET_HOST="http://localhost"

RADIO_GIST_ID="6b66a0065c70a33f95e0e831cb0c7e9f"
RADIO_PLAYLIST_FILE="tracks"
```

- Run the project (by a single command):
```shell
npm run project
```

- Check the result at [http://localhost:3000](http://localhost:3000).


### Author:

- [BoolFalse](https://boolfalse.com/)
