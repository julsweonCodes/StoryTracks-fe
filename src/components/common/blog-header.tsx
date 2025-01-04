import { useFormContext } from "@/context/form-context";
import { useRouter } from "next/router";
import { IoIosArrowDown } from "react-icons/io";
import { RxKeyboard } from "react-icons/rx";

export default function BlogHeader() {
  const { activeComponentKey } = useFormContext();
  const router = useRouter();

  const handlePost = () => {
    router.push("/blog/1");
  };

  return (
    <div className="bg-black-primary text-white-primary flex items-center justify-between p-5">
      <RxKeyboard />
      <div className="flex items-center gap-2">
        <h1 className="text-md">Travel</h1>
        <IoIosArrowDown />
      </div>
      <button
        className={`text-md ${activeComponentKey === "preview" ? "text-white-primary" : "text-[#7A7A7A]"}`}
        disabled={activeComponentKey !== "preview"}
        onClick={handlePost}
      >
        Post
      </button>
    </div>
  );
}
