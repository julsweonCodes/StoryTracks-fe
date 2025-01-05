import { useFormContext } from "@/context/form-context";
import { useRouter } from "next/router";
import { IoIosArrowDown } from "react-icons/io";
import { RxKeyboard } from "react-icons/rx";

export default function BlogHeader() {
  const { activeComponentKey, setActiveComponentKey } = useFormContext();
  const router = useRouter();

  const handleCancel = () => {
    setActiveComponentKey("description");
  };

  const handlePost = () => {
    router.push("/blog/1");
  };

  return (
    <div
      className={`flex h-[36px] items-center justify-between bg-black-primary p-5 text-white-primary`}
    >
      {activeComponentKey === "preview" ? (
        <div className="text-[14px] tracking-tight" onClick={handleCancel}>
          Cancel
        </div>
      ) : (
        <RxKeyboard />
      )}
      <div className="flex items-center gap-2">
        <h1 className="text-md">Travel</h1>
        <IoIosArrowDown />
      </div>
      <button
        className={`text-[14px] tracking-tight ${activeComponentKey === "preview" ? "text-white-primary" : "text-[#7A7A7A]"}`}
        disabled={activeComponentKey !== "preview"}
        onClick={handlePost}
      >
        Post
      </button>
    </div>
  );
}
