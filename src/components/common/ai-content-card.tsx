import { useState } from "react";
import MapIcon from "../icons/map";

interface Props {
  data: { content: string };
  index: number;
  isSelecting?: boolean;
}

export default function AiContentCard({ data, index, isSelecting }: Props) {
  return (
    <div
      className={`flex flex-col gap-2 rounded-lg border ${isSelecting ? "border-key-primary outline-key-primary outline" : "border-[#7A7A7A]"} p-4`}
    >
      <div className="flex items-center gap-2">
        <MapIcon />
        <h4 className="text-[12px] tracking-tight text-[#A9A9A9]">
          Content Option {index}
        </h4>
      </div>
      <div>
        <p className="text-[14px] leading-4 text-[#A9A9A9]">{data.content}</p>
      </div>
    </div>
  );
}
