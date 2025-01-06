import Textarea from "@/components/common/textarea";
import Toggle from "@/components/common/toggle";
import { useState } from "react";

export default function Setting() {
  const [value, setValue] = useState<string>("");
  const [active, setActive] = useState<number>();

  const titleStyle = "text-[14px] text-white-primary tracking-tight leading-5";
  return (
    <div className="relative flex h-full w-full flex-col gap-6 overflow-y-auto pb-20">
      <div className="flex flex-col gap-3 p-4">
        <h5 className={titleStyle}>Text Style</h5>
        <Textarea
          value={value}
          setValue={setValue}
          placeholder={
            <p className="leading-5 tracking-tight text-[`1`5px]">
              What would you like Gemini to know about you to provide better
              response?
            </p>
          }
        />
      </div>
      <div className="flex flex-col gap-3 p-4">
        <h5 className={titleStyle}>Tone of voice</h5>
        <div className="inline-flex w-full flex-wrap gap-3">
          {[
            "Polite",
            "Witty",
            "Enthusiastic",
            "Friendly",
            "Informational",
            "Funny",
          ].map((tone, index) => (
            <div
              key={index}
              className={`rounded-lg border border-[#454545] bg-[#262626] px-3 py-2 text-[14px] leading-5 tracking-tight ${active === index ? "bg-key-primary text-[#262626]" : "bg-[#262626] text-white-primary"}`}
              onClick={() => setActive(index)}
            >
              {tone}
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-3 p-4">
        <h5 className={titleStyle}>Text Style</h5>
        <div>
          <Toggle text={"Generate hashtags"} />
          <Toggle text={"Include emoji"} />
        </div>
      </div>
      <div className="fixed bottom-0 left-0 flex w-full gap-5 bg-black-primary p-4 text-[14px]">
        <button className="h-[46px] flex-1 rounded-lg bg-[#333333] leading-5 tracking-tight text-white-primary">
          Reset
        </button>
        <button className="h-[40px] flex-1 rounded-lg bg-key-primary leading-5 tracking-tight text-white-primary">
          Apply
        </button>
      </div>
    </div>
  );
}
