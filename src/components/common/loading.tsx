import { StatusInfo } from "@/context/form-context";
import { FaCheck } from "react-icons/fa";

export default function Loading({ type, title, description }: StatusInfo) {
  return (
    <>
      {type === "loading" ? (
        <div className="relative h-[24px] w-[24px]">
          <div className="border-key-primary absolute left-0 top-0 h-full w-full animate-spin rounded-full border-2 border-t-transparent"></div>
        </div>
      ) : (
        <div className="border-key-primary text-key-primary rounded-full border p-1">
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
