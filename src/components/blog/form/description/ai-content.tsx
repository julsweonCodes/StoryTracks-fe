import AiContentCard from "@/components/common/ai-content-card";
import { useState } from "react";

interface Props {
  data: { content: string }[];
  selected: number | null;
  onSelect: (index: number) => void;
}

export default function AiContent({ data, selected, onSelect }: Props) {
  return (
    <div className="mx-4 flex flex-col gap-5 rounded-lg bg-[#262626] p-5">
      <div>
        <h2 className="text-[16px]">Suggested Content</h2>
        <span className="text-[14px] tracking-tight text-[#A9A9A9]">
          {data.length} results with your images and descriptions
        </span>
      </div>
      <div className="flex flex-col gap-4">
        {data.map((item, index) => (
          <div key={index} onClick={() => onSelect(index)}>
            <AiContentCard
              data={item}
              index={index + 1}
              isSelecting={selected === index}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
