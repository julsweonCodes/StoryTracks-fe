import { IoIosArrowDown } from "react-icons/io";
import { RxKeyboard } from "react-icons/rx";

export default function BlogHeader() {
  return (
    <div className="bg-black-primary text-white-primary flex items-center justify-between p-5">
      <RxKeyboard />
      <div className="flex items-center gap-2">
        <h1 className="text-md">Travel</h1>
        <IoIosArrowDown />
      </div>
      <button className="text-md text-[#7A7A7A]">Post</button>
    </div>
  );
}
