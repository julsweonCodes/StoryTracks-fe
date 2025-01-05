import { useState } from "react";
import PenIcon from "../icons/pen";
import { FiSearch } from "react-icons/fi";
import { useRouter } from "next/router";

export default function Search() {
  const [isFocused, setIsFocused] = useState(false);
  const [value, setValue] = useState("");
  const router = useRouter();

  return (
    <div className="z-20 flex h-[69px] items-center justify-between gap-2 border-t border-t-black-secondary bg-black-primary px-[14px] py-[10px]">
      <div className="relative h-[44px] flex-1">
        {!value && !isFocused && (
          <div className="pointer-events-none absolute left-5 top-1/2 flex -translate-y-1/2 items-center gap-3 text-black-tertiary">
            <FiSearch className="text-white-primary" />
            <span>Start your search</span>
          </div>
        )}
        <input
          type="text"
          className="h-full w-full rounded-lg bg-black-secondary px-5 text-white-primary"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onChange={(e) => setValue(e.target.value)}
          value={value}
        />
      </div>
      <button
        className="text-white flex h-full w-[94px] items-center justify-center gap-2 rounded-xl bg-key-primary text-black-primary"
        onClick={() => router.push("/blog/new")}
      >
        <PenIcon /> Post
      </button>
    </div>
  );
}
