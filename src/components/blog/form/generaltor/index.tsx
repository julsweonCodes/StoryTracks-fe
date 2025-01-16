import { ChangeEvent, useEffect, useRef, useState } from "react";
import Textarea from "@/components/common/textarea";
import Loading from "@/components/common/loading";
import AiContent from "./ai-content";
import { FaCheck } from "react-icons/fa";
import { AiContentInfo, useFormContext } from "@/context/form-context";
import MicrophoneIcon from "@/components/icons/microphone";
import MagicIcon from "@/components/icons/magic";
import VoiceRecorder from "@/components/common/voice/voice-recorder";
import UploadImage from "./upload-image";
import { RiLightbulbFlashLine } from "react-icons/ri";
import { IoClose } from "react-icons/io5";
import {
  useGenerateMutation,
  transformToAiContentInfo,
  GenerateImageInfo,
} from "@/hooks/mutations/use-generate-mutation";
import FileTextIcon from "@/components/icons/file-text";

const StepTitle = ({ number, title }: { number: number; title: string }) => (
  <div className="flex items-center gap-2">
    <div className="flex h-[26px] w-[26px] items-center justify-center rounded-full bg-[#262626] text-[14px] text-[#B0B0B0]">
      {number}
    </div>
    <h4 className="text-[14px] leading-5 tracking-tight">{title}</h4>
  </div>
);

export default function DescriptionForm() {
  const {
    setActiveComponentKey,
    description,
    updateDescription,
    setAiContent,
    aiContent,
    images,
    aiContentIndex,
    setAiContentIndex,
  } = useFormContext();
  const recorderRef = useRef<HTMLDivElement | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  // const [selected, setSelected] = useState<number | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isNotified, setIsNotified] = useState(true);
  const { mutate } = useGenerateMutation({
    onSuccess: (data) => {
      setIsLoading(false);
      setAiContent([
        {
          title: "",
          content: data.genRes1,
        },
        {
          title: "",
          content: data.genRes2,
        },
        {
          title: "",
          content: data.genRes3,
        },
      ]);
    },
    onError: () => {
      setIsLoading(false);
    },
  });

  const scrollToRecorder = () => {
    if (recorderRef.current) {
      recorderRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  };

  const handleSelect = (index: number) => {
    setAiContentIndex(index);
  };

  const handleAiSubmit = () => {
    setIsLoading(true);
    const earliestDate = Math.min(
      ...images.map((image) => new Date(image.createDate).getTime()),
    );

    const imgInfo: GenerateImageInfo = {
      geoLat: images[0].lat.toString(),
      geoLong: ((images[0].lon)*-1).toString(),  // -1을 곱한이유는 경도의 W에 대응하기위해
      imgDtm: new Date(earliestDate).toISOString(), // ISO 형식으로 변환
    };

    mutate({ ogText: description, imgInfo });
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
        {isNotified && (
          <div className="w-full px-4">
            <div className="flex h-[94px] justify-between gap-2 rounded-lg border border-[#444444] px-5 py-4">
              <RiLightbulbFlashLine className="text-white-primary" size={22} />
              <div className="flex flex-1 flex-col justify-around">
                <h4 className="text-[14px] leading-3 tracking-tight">
                  What to expect
                </h4>
                <p className="text-[12px] leading-4 tracking-tight text-[#A9A9A9]">
                  Image metadata and your description will be used to generate a
                  blog post.
                </p>
              </div>
              <button
                className="h-[20px] w-[20px]"
                onClick={() => setIsNotified(false)}
              >
                <IoClose size={22} className="text-[#A9A9A9]" />
              </button>
            </div>
          </div>
        )}
        {!isAiContent && (
          <div className="mx-4 flex flex-col gap-2">
            <StepTitle number={1} title={`Select Images (${images.length})`} />
            <UploadImage />
          </div>
        )}
        {isAiContent ? (
          <div className="mt-4 flex flex-col gap-2">
            <div className="px-4">
              <StepTitle number={3} title="Select Your Preferred Content" />
            </div>
            <AiContent
              data={aiContent}
              selected={aiContentIndex}
              onSelect={handleSelect}
            />
          </div>
        ) : (
          <div className="relative flex flex-col gap-2 px-4 pb-4">
            <StepTitle number={2} title="Add Image Descriptions" />
            <Textarea
              value={description}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                updateDescription(e.target.value)
              }
              placeholderContent={
                <p className="text-[15px] tracking-tight">
                  {`Tell us a little story about this image! We'll handle the rest to
            generate the perfect blog content.`}
                  <br />
                  <br />
                  {`For example: 'A serene beach at sunset, with golden skies and waves
            gently lapping at the shore.'`}
                </p>
              }
            />
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
                <span className="text-[13px]">Voice to Text</span>
              </div>
            )}
          </div>
        )}
      </div>
      <div className="flex w-full bg-black-primary p-4">
        {isAiContent ? (
          <div className="flex w-full flex-col gap-2">
            <button
              className={`flex h-[48px] w-full items-center justify-center gap-2 rounded-lg text-black-secondary ${aiContentIndex !== undefined ? "bg-key-primary" : "bg-[#5B578A]"}`}
              disabled={aiContentIndex === undefined}
              onClick={handleSubmit}
            >
              <FileTextIcon />
              Use this Content
            </button>
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
          </div>
        ) : (
          <button
            className={`flex h-[48px] w-full items-center justify-center gap-1 rounded-lg text-black-secondary ${description.length > 0 && !isLoading && images.length > 0 ? "bg-key-primary" : "bg-[#5B578A]"}`}
            disabled={
              isLoading || description.length === 0 || images.length === 0
            }
            onClick={handleAiSubmit}
          >
            {isLoading ? (
              <div>
                <Loading type="loading" />
              </div>
            ) : (
              <>
                <MagicIcon />
                Generate Content
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
