import { useFormContext } from "@/context/form-context";
import { FaChevronLeft } from "react-icons/fa6";
import { LuSettings } from "react-icons/lu";

export default function GeneratorHeader() {
  const {
    setActiveComponentKey,
    updateDescription,
    aiContent,
    setAiContent,
    activeComponentKey,
    setImages,
    setAiContentIndex,
  } = useFormContext();

  const handleCancel = () => {
    if (aiContent.length > 0) {
      setAiContent([]);
      setAiContentIndex(undefined);
    } else {
      setActiveComponentKey("write");
      updateDescription("");
      setImages([]);
    }
  };

  const isGenerator = activeComponentKey === "generator";

  return (
    <div className="relative mx-4 my-2 flex h-[60px] items-center justify-center bg-black-primary text-white-primary">
      <div
        className="absolute left-0 flex h-[40px] w-[40px] items-center justify-center rounded-lg bg-[#262626]"
        onClick={handleCancel}
      >
        <FaChevronLeft />
      </div>
      <h1 className="flex h-[40px] items-center text-[16px] tracking-tight">
        {isGenerator ? "Content Generator" : "Add Description"}
      </h1>
      {isGenerator && (
        <div className="absolute right-0 flex h-[40px] w-[40px] items-center justify-center rounded-lg bg-[#262626]">
          <LuSettings />
        </div>
      )}
    </div>
  );
}
