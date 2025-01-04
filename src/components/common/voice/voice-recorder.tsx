import { useEffect, useState } from "react";
import AudioVisualizer from "./audio-visualizer";
import { IoClose } from "react-icons/io5";
import { IoMdCheckmark } from "react-icons/io";

interface Props {
  onClose?: () => void;
}

export default function VoiceRecorder({ onClose }: Props) {
  const [isRecording, setIsRecording] = useState(true);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRecording) {
      interval = setInterval(() => setSeconds((prev) => prev + 1), 1000);
    }

    return () => clearInterval(interval);
  }, [isRecording]);

  const startRecording = () => {
    setIsRecording(true);
  };

  const stopRecording = () => {
    setIsRecording(false);
  };

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  const formatTime = (time: number, isMinutes: boolean = false) => {
    if (isMinutes) return time.toString();
    return time.toString().padStart(2, "0");
  };

  return (
    <div className="text-white flex h-[52px] w-full items-center rounded-lg bg-[#262626] p-4">
      <button
        onClick={stopRecording}
        className="mr-4 h-[32px] w-[32px] rounded-full bg-[#444444] p-2 transition-colors"
      >
        <IoClose />
      </button>
      <AudioVisualizer isRecording={isRecording} onClose={onClose} />
      <span className="ml-4 text-[13px] tracking-tight">
        {formatTime(minutes, true)}:{formatTime(remainingSeconds)}
      </span>
      <div
        className="ml-4 flex h-[32px] w-[32px] items-center justify-center rounded-full bg-key-primary text-black-primary"
        onClick={startRecording}
      >
        <IoMdCheckmark size={15} />
      </div>
    </div>
  );
}
