import { useState, useEffect, useRef } from "react";

const TOTAL_BARS = 29;
const HISTORY_SIZE = 29;
const UPDATE_INTERVAL = 50;

interface Props {
  isRecording: boolean;
  onClose?: () => void;
}

const AudioVisualizer = ({ isRecording: recordingAction, onClose }: Props) => {
  const [isRecording, setIsRecording] = useState(false);
  const [visualData, setVisualData] = useState<number[]>(
    new Array(TOTAL_BARS).fill(0),
  );
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataHistoryRef = useRef<number[]>([]);
  const lastUpdateTimeRef = useRef<number>(0);

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const updateDataHistory = (newValue: number) => {
    const currentTime = Date.now();

    // UPDATE_INTERVAL 밀리초마다만 업데이트
    if (currentTime - lastUpdateTimeRef.current < UPDATE_INTERVAL) {
      return;
    }

    lastUpdateTimeRef.current = currentTime;

    // 새로운 값을 증폭 (더 큰 움직임을 위해)
    const amplifiedValue = Math.min(100, newValue * 1.5);

    dataHistoryRef.current = [...dataHistoryRef.current, amplifiedValue];

    if (dataHistoryRef.current.length > HISTORY_SIZE) {
      dataHistoryRef.current = dataHistoryRef.current.slice(-HISTORY_SIZE);
    }

    const step = dataHistoryRef.current.length / TOTAL_BARS;
    const newVisualData = Array.from({ length: TOTAL_BARS }, (_, i) => {
      const index = Math.floor(i * step);
      // 부드러운 보간을 위해 현재값과 다음값의 가중 평균 사용
      const currentValue = dataHistoryRef.current[index] || 0;
      const nextValue = dataHistoryRef.current[index + 1] || currentValue;
      const weight = i * step - index;
      return currentValue * (1 - weight) + nextValue * weight;
    });

    setVisualData(newVisualData);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const AudioContext =
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      audioContextRef.current = audioContext;
      analyserRef.current = analyser;

      analyser.fftSize = 256; // FFT 크기 증가
      analyser.smoothingTimeConstant = 0.1; // 부드러운 전환을 위한 시간 상수 추가
      const bufferLength = analyser.frequencyBinCount;

      const updateVisualizer = () => {
        if (!analyserRef.current) return;

        const dataArray = new Uint8Array(bufferLength);
        analyserRef.current.getByteFrequencyData(dataArray);

        // 주파수 데이터의 평균값 계산 (저주파 영역에 가중치 부여)
        const weightedSum = Array.from(
          dataArray.slice(0, bufferLength / 4),
        ).reduce(
          (acc, val, idx) => acc + val * (1 - idx / (bufferLength / 4)),
          0,
        );
        const normalizedValue = Math.min(
          100,
          Math.max(0, (weightedSum / (bufferLength / 8)) * 0.7), // 감도 조정
        );

        updateDataHistory(normalizedValue);
        animationFrameRef.current = requestAnimationFrame(updateVisualizer);
      };

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      dataHistoryRef.current = [];
      lastUpdateTimeRef.current = Date.now();
      updateVisualizer();
    } catch (err) {
      console.error("Error accessing microphone:", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream
        .getTracks()
        .forEach((track) => track.stop());
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      setIsRecording(false);
      setVisualData(new Array(TOTAL_BARS).fill(0));
      dataHistoryRef.current = [];
      if (onClose) onClose();
    }
  };

  useEffect(() => {
    if (recordingAction) {
      startRecording();
    } else {
      stopRecording();
    }
  }, [recordingAction]);

  return (
    <div className="flex h-[32px] w-full flex-1 items-center justify-between">
      {visualData.map((value, index) => (
        <div
          key={index}
          className={`min-h-[1px] w-[2px] transform rounded-full ${index > 26 ? "bg-white-primary" : "bg-[#444444]"} transition-all duration-150 ease-out`}
          style={{
            height: `${value}%`,
            opacity: isRecording ? 1 : 0.5,
          }}
        />
      ))}
    </div>
  );
};

export default AudioVisualizer;
