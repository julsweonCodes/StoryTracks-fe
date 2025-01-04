import { Swiper, SwiperSlide } from "swiper/react";

import "swiper/css";
import "swiper/css/free-mode";

import { FreeMode } from "swiper/modules";
import { useRef, useState } from "react";
import Microphone from "@/components/icons/microphone";
import Magic from "@/components/icons/magic";
import Thumbnail from "@/components/common/thumbnail";
import Textarea from "@/components/common/textarea";
import Loading from "@/components/common/loading";
import AiContent from "./ai-content";

export default function DescriptionForm() {
  const [value, setValue] = useState("");
  const [aiDataMock, setAiDataMock] = useState<{} | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);

  const mockData = [
    {
      title: `Content Option ${1}`,
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    },
    {
      title: `Content Option ${2}`,
      description:
        "The title refers to the  empathy test used to distinguish between humans and androids. The test involves administering a fictional scenario and evaluating the subject's emotional response. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    },
    {
      title: `Content Option ${3}`,
      description:
        "Electric sheep are rare, real animals that people own as status symbols. Owning one is seen as a sign of empathy and a connection to the natural world. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    },
  ];

  const handleSubmit = () => {
    setIsLoading(true);
    setTimeout(() => {
      setAiDataMock(mockData);
      setIsLoading(false);
    }, 2000);
  };

  return (
    <div className="relative flex flex-1 flex-col overflow-hidden">
      <div className="bg-black-primary relative flex w-full flex-1 flex-col gap-4 overflow-y-auto pb-4">
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
              {Array.from({ length: 5 }).map((_, index) => (
                <SwiperSlide key={index} className="aspect-square h-full">
                  <Thumbnail />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
        {aiDataMock ? (
          <AiContent />
        ) : (
          <div className="relative flex flex-col gap-2 px-4">
            <Textarea value={value} setValue={setValue} />
            <div className="flex justify-end gap-1">
              <Microphone />
              <span className="text-[13px]">Speech to Text</span>
            </div>
          </div>
        )}
      </div>
      <div className="bg-black-primary flex w-full p-4">
        <button
          className={`text-black-secondary flex h-[48px] w-full items-center justify-center gap-1 rounded-lg ${value.length > 0 && !isLoading ? "bg-key-primary" : "bg-[#5B578A]"}`}
          disabled={isLoading}
          onClick={handleSubmit}
        >
          {isLoading ? (
            <div>
              <Loading type="loading" />
            </div>
          ) : (
            <>
              <Magic />
              Generate Content with AI
            </>
          )}
        </button>
      </div>
    </div>
  );
}
