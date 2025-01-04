import { useEffect, useState } from "react";
import AudioVisualizer from "./audio-visualizer";

export default function VoiceRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [time, setTime] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRecording) {
      interval = setInterval(() => setTime((prev) => prev + 1), 1000);
    }

    return () => clearInterval(interval);
  }, [isRecording]);

  const startRecording = () => {
    setIsRecording(true);
  };

  const stopRecording = () => {
    setIsRecording(false);
  };

  return (
    <div className="flex items-center rounded-lg bg-black p-4 text-white">
      <button
        className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-600"
        onClick={isRecording ? stopRecording : startRecording}
      >
        {isRecording ? "X" : "▶️"}
      </button>
      <AudioVisualizer />
      <span className="ml-4">{time}s</span>
    </div>
  );
}
