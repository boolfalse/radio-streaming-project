
import React from 'react';
import VisualizerInterface from './../interfaces/VisualizerInterface.ts';
import {getErrorMessage} from "../utils.ts";

function Visualizer({
                        isPlaying,
                        isTrackInfoReceived
                    }: VisualizerInterface) {
    const [isAudioPlaying, setIsAudioPlaying] = React.useState(isPlaying);
    const streamUrl = `http://localhost:${import.meta.env.VITE_BACKEND_PORT}/stream`;

    const [audioElement, setAudioElement] = React.useState<HTMLAudioElement | null>(null);
    const [analyser, setAnalyser] = React.useState<AnalyserNode | null>(null);
    const [dataArray, setDataArray] = React.useState<Uint8Array>(new Uint8Array([]));
    const visualizerRef = React.useRef<HTMLCanvasElement | null>(null);
    const audioContextRef = React.useRef<AudioContext | null>(null);

    React.useEffect(() => {
        if (isTrackInfoReceived) {
            audioContextRef.current = new AudioContext();
            const analyserNode = audioContextRef.current?.createAnalyser();
            analyserNode.fftSize = 128;
            const bufferLength = analyserNode.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);

            if ("destination" in audioContextRef.current) {
                analyserNode.connect(audioContextRef.current.destination);
            }
            setAnalyser(analyserNode);
            setDataArray(dataArray);

            return () => {
                analyserNode.disconnect();
            };
        }
    }, [isTrackInfoReceived]);

    React.useEffect(() => {
        if (audioElement && analyser) {
            if (audioContextRef.current && "createMediaElementSource" in audioContextRef.current) {
                const sourceNode = audioContextRef.current.createMediaElementSource(audioElement);
                sourceNode.connect(analyser);
            }
        }
    }, [audioElement, analyser]);

    React.useEffect(() => {
        if (analyser) {
            const renderVisualization = () => {
                if (visualizerRef.current) {
                    const canvas: HTMLCanvasElement | null = visualizerRef.current;
                    if ("getContext" in canvas) {
                        const canvasContext = canvas.getContext('2d');

                        if (canvasContext) {
                            const { width, height } = canvas;

                            analyser.getByteFrequencyData(dataArray);

                            canvasContext.clearRect(0, 0, width, height);

                            const barWidth = width / dataArray.length;
                            const barHeightMultiplier = height / 255;
                            canvasContext.globalAlpha = 0.5;
                            for (let i = 0; i < dataArray.length; i++) {
                                const barHeight = dataArray[i] * barHeightMultiplier;
                                const x = i * barWidth;
                                const y = 0;
                                canvasContext.fillStyle = `hsl(${i * 2}, 100%, 50%)`;
                                canvasContext.fillRect(x, y, barWidth, barHeight);
                            }

                            requestAnimationFrame(renderVisualization);
                        }
                    }
                }
            };

            renderVisualization();
        }
    }, [analyser, dataArray]);

    React.useEffect(() => {
        handleTogglePlay().then(r => r).catch(err => {
            console.error(getErrorMessage(err));
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isPlaying]);

    const handleTogglePlay = async () => {
        await audioContextRef.current?.resume();
        if (audioElement) {
            if (isAudioPlaying) {
                audioElement.pause();
            } else {
                await audioElement.play();
            }
            setIsAudioPlaying(!isAudioPlaying);
        }
    };

    return (
        <div>
            <div id="visualizer-container">
                <canvas id="visualizer" ref={visualizerRef} style={{position: "fixed", zIndex: 1}} />
            </div>
            {isTrackInfoReceived && (
                <audio crossOrigin='anonymous' ref={setAudioElement} controls style={{ display: 'none' }}>
                    <source src={streamUrl} type='audio/mpeg' />
                    <track kind='captions' />
                </audio>
            )}
        </div>
    );
}

export default Visualizer;
