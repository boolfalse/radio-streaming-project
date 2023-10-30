
import axios from "axios";
import trackInfoType from "./types/trackInfoType.ts";

export const getErrorMessage = (error: unknown): string => {
    if (error instanceof Error) return error.message
    return String(error)
}

export const timeFormat = (duration: number): string => {
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    const formattedSeconds = (seconds < 10) ? `0${seconds}` : seconds;
    const formattedMinutes = (minutes < 10) ? `0${minutes}` : minutes;

    return `${formattedMinutes}:${formattedSeconds}`;
}

export const getTrackInfo = async (): Promise<{
    success: boolean;
    message: string;
    track: trackInfoType;
}> => {
    try {
        const response: {
            data: trackInfoType
        } = await axios.get('/api/track-info');

        return {
            success: true,
            message: "Track info fetched successfully.",
            track: response.data, // { title, image, duration, difference_in_seconds, time }
        };
    } catch (err) {
        return {
            success: false,
            message: getErrorMessage(err),
            track: { title: '', image: '', duration: 0, difference_in_seconds: 0, time: '' },
        }
    }
}
