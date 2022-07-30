import {
  useState,
  useEffect,
  RefObject,
  Dispatch,
  SetStateAction,
} from "react";
import YouTube from "react-youtube";

export function useYtProgress(
  youtubeRef: RefObject<YouTube>
): [number, Dispatch<SetStateAction<number>>] {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const interval = setInterval(async () => {
      const time = Math.ceil(
        await youtubeRef.current?.internalPlayer.getCurrentTime()
      );
      if (time != progress) setProgress(time);
    }, 1000);
    return () => clearInterval(interval);
  }, [youtubeRef, progress]);
  return [progress, setProgress];
}
