import { useState } from "react";
import PenIcon from "../icons/pen";
import { FiSearch } from "react-icons/fi";

export default function Search() {
  const [isFocused, setIsFocused] = useState(false);
  const [value, setValue] = useState("");

  return (
    <div className="bg-black-primary z-20 flex h-[68px] items-center justify-between gap-2 px-[14px] py-[10px]">
      <div className="relative h-[44px] flex-1">
        {!value && !isFocused && (
          <div className="text-black-tertiary pointer-events-none absolute left-5 top-1/2 flex -translate-y-1/2 items-center gap-3">
            <FiSearch className="text-white-primary" />
            <span>Start your search</span>
          </div>
        )}
        <input
          type="text"
          className="bg-black-secondary text-white-primary h-full w-full rounded-lg px-5"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onChange={(e) => setValue(e.target.value)}
          value={value}
        />
      </div>
      <button className="bg-black-secondary flex aspect-square w-[44px] items-center justify-center rounded-lg text-white">
        <PenIcon />
      </button>
    </div>
  );
}
