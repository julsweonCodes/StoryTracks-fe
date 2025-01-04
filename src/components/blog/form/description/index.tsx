import { Swiper, SwiperSlide } from "swiper/react";
import { useEffect, useRef, useState } from "react";
import Thumbnail from "@/components/common/thumbnail";
import Textarea from "@/components/common/textarea";
import Loading from "@/components/common/loading";
import AiContent from "./ai-content";
import { FaCheck } from "react-icons/fa";
import { useFormContext } from "@/context/form-context";
import MicrophoneIcon from "@/components/icons/microphone";
import MagicIcon from "@/components/icons/magic";

import "swiper/css";
import "swiper/css/free-mode";

import { FreeMode } from "swiper/modules";
import VoiceRecorder from "@/components/common/voice/voice-recorder";

export default function DescriptionForm() {
  const {
    setActiveComponentKey,
    description,
    updateDescription,
    setAiContent,
    aiContent,
  } = useFormContext();
  const recorderRef = useRef<HTMLDivElement | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  const mockData = [
    {
      content:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    },
    {
      content:
        "The title refers to the  empathy test used to distinguish between humans and androids. The test involves administering a fictional scenario and evaluating the subject's emotional response. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    },
    {
      content:
        "Electric sheep are rare, real animals that people own as status symbols. Owning one is seen as a sign of empathy and a connection to the natural world. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    },
  ];

  const scrollToRecorder = () => {
    if (recorderRef.current) {
      recorderRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  };

  const handleSelect = (index: number) => {
    if (selected === index) {
      setSelected(null);
    } else {
      setSelected(index);
    }
  };

  const handleAiSubmit = () => {
    setIsLoading(true);
    setSelected(null);
    setTimeout(() => {
      setAiContent(mockData);
      setIsLoading(false);
    }, 2000);
  };

  const handleSubmit = () => {
    setActiveComponentKey("preview");
  };

  useEffect(() => {
    if (isRecording) {
      scrollToRecorder();
    }
  }, [isRecording]);

  const isAiContent = aiContent.length > 0;

  return (
    <div className="relative flex flex-1 flex-col overflow-hidden">
      <div className="relative flex w-full flex-1 flex-col gap-4 overflow-y-auto bg-black-primary pb-4">
        <div className="mx-4 flex flex-col gap-2 rounded-lg bg-[#262626] px-4 py-4 pb-4 pt-2">
          <h2 className="text-[14px]">
            <strong className="font-bold">5</strong>&nbsp; images selected
          </h2>
          <div className="relative w-full overflow-hidden">
            <Swiper
              slidesPerView={3}
              spaceBetween={10}
              freeMode={true}
              modules={[FreeMode]}
              style={{ width: "100%", height: "100%" }}
            >
              {[
                "/image1.jpeg",
                "/image2.jpeg",
                "/image3.jpeg",
                "/image1.jpeg",
                "/image2.jpeg",
              ].map((src, index) => (
                <SwiperSlide key={index} className="aspect-square h-full">
                  <Thumbnail src={src} />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
        {isAiContent ? (
          <AiContent
            data={aiContent}
            selected={selected}
            onSelect={handleSelect}
          />
        ) : (
          <div className="relative flex flex-col gap-2 px-4">
            <Textarea value={description} setValue={updateDescription} />
            {isRecording ? (
              <div ref={recorderRef}>
                <VoiceRecorder onClose={() => setIsRecording(false)} />
              </div>
            ) : (
              <div
                className="flex justify-end gap-1"
                onClick={() => setIsRecording(true)}
              >
                <MicrophoneIcon />
                <span className="text-[13px]">Speech to Text</span>
              </div>
            )}
          </div>
        )}
      </div>
      <div className="flex w-full bg-black-primary p-4">
        {isAiContent ? (
          <div className="flex w-full flex-col gap-2">
            <button
              className="flex h-[48px] w-full items-center justify-center gap-2 rounded-lg bg-[#262626] text-white-primary"
              disabled={isLoading}
              onClick={handleAiSubmit}
            >
              {isLoading ? (
                <div>
                  <Loading type="loading" />
                </div>
              ) : (
                <>
                  <MagicIcon color="#ffffff" />
                  Regenerate Content
                </>
              )}
            </button>
            <button
              className={`flex h-[48px] w-full items-center justify-center gap-2 rounded-lg text-black-secondary ${selected !== null ? "bg-key-primary" : "bg-[#5B578A]"}`}
              onClick={handleSubmit}
            >
              <FaCheck size={10} />
              Use this Content
            </button>
          </div>
        ) : (
          <button
            className={`flex h-[48px] w-full items-center justify-center gap-1 rounded-lg text-black-secondary ${description.length > 0 && !isLoading ? "bg-key-primary" : "bg-[#5B578A]"}`}
            disabled={isLoading}
            onClick={handleAiSubmit}
          >
            {isLoading ? (
              <div>
                <Loading type="loading" />
              </div>
            ) : (
              <>
                <MagicIcon />
                Generate Content with AI
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
