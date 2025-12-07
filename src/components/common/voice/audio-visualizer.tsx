import { useFormContext } from "@/context/form-context";
import { useState, useEffect, useRef } from "react";

const TOTAL_BARS = 29;
const HISTORY_SIZE = 29;
const UPDATE_INTERVAL = 50;

type SpeechRecognitionLanguage =
  // 아시아
  | "ko-KR" // 한국어 (대한민국)
  | "ja-JP" // 일본어 (일본)
  | "zh-CN" // 중국어 (중국 - 간체)
  | "zh-TW" // 중국어 (대만 - 번체)
  | "zh-HK" // 중국어 (홍콩 - 번체)
  | "th-TH" // 태국어 (태국)
  | "hi-IN" // 힌디어 (인도)
  | "id-ID" // 인도네시아어 (인도네시아)
  | "ms-MY" // 말레이어 (말레이시아)

  // 유럽
  | "en-GB" // 영어 (영국)
  | "en-US" // 영어 (미국)
  | "en-AU" // 영어 (호주)
  | "en-CA" // 영어 (캐나다)
  | "en-IN" // 영어 (인도)
  | "de-DE" // 독일어 (독일)
  | "fr-FR" // 프랑스어 (프랑스)
  | "fr-CA" // 프랑스어 (캐나다)
  | "it-IT" // 이탈리아어 (이탈리아)
  | "es-ES" // 스페인어 (스페인)
  | "es-MX" // 스페인어 (멕시코)
  | "pt-BR" // 포르투갈어 (브라질)
  | "pt-PT" // 포르투갈어 (포르투갈)
  | "nl-NL" // 네덜란드어 (네덜란드)
  | "ru-RU" // 러시아어 (러시아)
  | "pl-PL" // 폴란드어 (폴란드)
  | "sv-SE" // 스웨덴어 (스웨덴)
  | "da-DK" // 덴마크어 (덴마크)
  | "fi-FI" // 핀란드어 (핀란드)
  | "no-NO" // 노르웨이어 (노르웨이)

  // 아프리카 및 중동
  | "ar-SA" // 아랍어 (사우디아라비아)
  | "ar-EG" // 아랍어 (이집트)
  | "tr-TR" // 터키어 (터키)
  | "fa-IR" // 페르시아어 (이란)
  | "he-IL" // 히브리어 (이스라엘)
  | "af-ZA"; // 아프리칸스어 (남아프리카공화국)

interface Props {
  isRecording: boolean;
  onClose?: () => void;
}

const AudioVisualizer = ({ isRecording: recordingAction, onClose }: Props) => {
  const { updateDescription } = useFormContext();
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
  const recognitionRef = useRef<SpeechRecognition | null>(null);

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

  const initializeSpeechRecognition = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US" as SpeechRecognitionLanguage;

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = Array.from(event.results)
          .map((result) => result[0].transcript)
          .join("");
        console.log("Transcript:", transcript);
        updateDescription(transcript);
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error("Speech recognition error:", event.error);
      };

      recognition.start(); // 음성 인식 시작
      return recognition;
    } else {
      console.error("This browser does not support Web Speech API.");
      return null;
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      audioContextRef.current = audioContext;
      analyserRef.current = analyser;

      analyser.fftSize = 256; // 크기 증가
      analyser.smoothingTimeConstant = 0.1; // 부드러운 전환을 위한 시간 상수 추가
      const bufferLength = analyser.frequencyBinCount;

      const updateVisualizer = () => {
        if (!analyserRef.current) return;

        const dataArray = new Uint8Array(bufferLength);
        analyserRef.current.getByteFrequencyData(dataArray);

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

      recognitionRef.current = initializeSpeechRecognition();
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
      recognitionRef.current?.stop();
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
