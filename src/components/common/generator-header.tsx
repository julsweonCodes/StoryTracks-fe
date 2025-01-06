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
    } else if (activeComponentKey === "generator") {
      setActiveComponentKey("write");
      updateDescription("");
      setImages([]);
    } else if (activeComponentKey === "setting") {
      setActiveComponentKey("generator");
    }
  };

  const handlePublish = () => {
    setActiveComponentKey("generator");
  };

  const titles = {
    generator: "Content Generator",
    write: "Post Editor",
    setting: "Content Settings",
  } as { [key: string]: string };

  const title = titles[activeComponentKey] || "Add Description";

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
        {title}
      </h1>
      {isGenerator && (
        <div
          className="absolute right-0 flex h-[40px] w-[40px] items-center justify-center rounded-lg bg-[#262626]"
          onClick={() => setActiveComponentKey("setting")}
        >
          <LuSettings />
        </div>
      )}
      {activeComponentKey === "write" && (
        <div
          className="absolute right-0 flex h-[40px] w-[78px] items-center justify-center rounded-lg bg-[#262626] text-[14px] leading-4 tracking-tight"
          onClick={handlePublish}
        >
          Publish
        </div>
      )}
    </div>
  );
}
