import { useState } from "react";

interface Props {
  text: string;
}

export default function Toggle({ text }: Props) {
  const [isToggled, setIsToggled] = useState(false);

  const handleToggle = () => {
    setIsToggled((prev) => !prev);
  };

  return (
    <div className="flex items-center justify-between gap-3 rounded-lg bg-[#262626] p-3">
      <span className="text-[12px]">{text}</span>
      <button
        onClick={handleToggle}
        className={`relative inline-flex h-[22px] w-[34px] items-center rounded-full transition-colors ${
          isToggled ? "bg-key-primary" : "bg-[#161616]"
        }`}
      >
        <span
          className={`inline-block h-[18px] w-[18px] transform rounded-full bg-[#333333] transition-transform ${
            isToggled ? "bg-white translate-x-3" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}
