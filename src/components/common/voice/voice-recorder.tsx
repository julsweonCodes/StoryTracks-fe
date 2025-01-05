import { useEffect, useRef, useState } from "react";
import AudioVisualizer from "./audio-visualizer";
import { IoClose } from "react-icons/io5";
import { IoMdCheckmark } from "react-icons/io";

interface Props {
  onClose?: () => void;
  setValue: (text: string) => void;
}

export default function VoiceRecorder({ onClose, setValue }: Props) {
  const [isRecording, setIsRecording] = useState(true);
  const [seconds, setSeconds] = useState(0);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Web Speech API 초기화
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true; // 지속적으로 듣기
      recognition.interimResults = true; // 중간 결과 포함
      recognition.lang = "en-US";

      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map((result) => result[0].transcript)
          .join("");
        console.log("Transcript:", transcript);
        //setValue((prev) => `${prev} ${transcript}`);
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
      };

      /*recognition.onend = () => {
        console.log("Speech recognition ended, restarting...");
        recognition.start(); // 자동 재시작
      };*/

      recognitionRef.current = recognition;
    } else {
      console.error("This browser does not support Web Speech API.");
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [setValue]);

  // 녹음 시작
  const startRecording = () => {
    setIsRecording(true);
    if (recognitionRef.current) {
      console.log("Speech recognition started...");
      recognitionRef.current.start();
    }
  };

  // 녹음 중지
  const stopRecording = () => {
    setIsRecording(false);
    if (recognitionRef.current) {
      console.log("Speech recognition stopped...");
      recognitionRef.current.stop();
    }
    onClose?.(); // 부모 컴포넌트에 녹음 종료 알림
  };

  // 녹음 시간 계산
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRecording) {
      interval = setInterval(() => setSeconds((prev) => prev + 1), 1000);
    }

    return () => clearInterval(interval);
  }, [isRecording]);

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
        onClick={stopRecording}
      >
        <IoMdCheckmark size={15} />
      </div>
    </div>
  );
}