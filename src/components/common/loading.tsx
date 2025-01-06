import { StatusInfo } from "@/context/form-context";
import { FaCheck } from "react-icons/fa";

interface Props extends StatusInfo {
  color?: string;
}

export default function Loading({
  type,
  title,
  description,
  color = "#B4B2FF",
}: Props) {
  return (
    <>
      {type === "loading" ? (
        <div className="relative h-[24px] w-[24px]">
          <div
            className="absolute left-0 top-0 h-full w-full animate-spin rounded-full border-2 border-key-primary border-t-transparent"
            style={{ borderColor: color, borderLeftColor: "transparent" }}
          />
        </div>
      ) : (
        <div
          className={`rounded-full border p-1`}
          style={{ borderColor: color, color }}
        >
          <FaCheck size={12} />
        </div>
      )}
      {title && description ? (
        <div className="flex- flex-col items-center justify-center">
          {title && (
            <h1 className="flex justify-center font-[16px]">{title}</h1>
          )}
          {description && (
            <p className="text-[14px] text-[#A9A9A9]">{description}</p>
          )}
        </div>
      ) : null}
    </>
  );
}
