import { useFormContext } from "@/context/form-context";
import { FaChevronLeft } from "react-icons/fa6";

export default function DescriptionHeader() {
  const { setActiveComponentKey, updateDescription, aiContent, setAiContent } =
    useFormContext();

  const handleCancel = () => {
    if (aiContent.length > 0) {
      setAiContent([]);
    } else {
      setActiveComponentKey("upload-image");
      updateDescription("");
    }
  };

  return (
    <div className="bg-black-primary text-white-primary relative mx-4 mb-2 mt-3 flex items-center justify-center">
      <div
        className="absolute left-0 flex h-[40px] w-[40px] items-center justify-center rounded-lg bg-[#262626]"
        onClick={handleCancel}
      >
        <FaChevronLeft />
      </div>
      <h1 className="flex h-[40px] items-center text-[16px] tracking-tight">
        Add Description
      </h1>
    </div>
  );
}
