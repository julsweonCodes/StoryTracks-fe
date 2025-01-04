import { useEffect, useState } from "react";
import { getAudioStream } from "./get-audio-stream";

interface Props {
  isRecording: boolean;
}

export default function AudioVisualizer({ isRecording }: Props) {
  const [volumeLevel, setVolumeLevel] = useState(0);

  useEffect(() => {
    if (!isRecording) return;
    let animationFrameId: number;

    const fetchAudioData = async () => {
      const { getVolumeLevel } = await getAudioStream();

      const updateVolume = () => {
        const volume = getVolumeLevel();
        console.log("volume", volume);
        setVolumeLevel(volume);
        animationFrameId = requestAnimationFrame(updateVolume);
      };

      updateVolume();
    };

    fetchAudioData();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: 30 }).map((_, index) => {
        const height = Math.max(5, (volumeLevel / 256) * (Math.random() * 50));
        return (
          <div
            key={index}
            style={{
              height: `${height}px`,
              width: "4px",
              backgroundColor: "gray",
              transition: "height 0.1s ease",
            }}
          />
        );
      })}
    </div>
  );
}
