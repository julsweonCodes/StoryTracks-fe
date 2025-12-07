import { FiMoreHorizontal } from "react-icons/fi";
import CameraIcon from "../icons/camera";
import MagicIcon from "../icons/magic";
import ParagraphSpacingIcon from "../icons/paragraph-spacing";
import TextCircleIcon from "../icons/text-circle";

interface Props {
  // position?: "top" | "bottom";
  colorType?: "dark" | "light";
}

export default function UtilBar({
  // position = "bottom",
  colorType = "dark",
}: Props) {
  const color = colorType === "dark" ? "#262626" : "#ffffff";
  const textColor = colorType === "dark" ? "#ffffff" : "#262626";

  return (
    <div
      className={`z-10 flex h-[48px] w-full items-center justify-between px-4 bg-[${color}]`}
    >
      <div className="flex h-full flex-1 items-center gap-5">
        {[
          <MagicIcon key="magic" size={25} color={textColor} />,
          <CameraIcon key="camera" color={textColor} />,
          <TextCircleIcon key="text-circle" color={textColor} />,
          <ParagraphSpacingIcon key="paragraph-spacing" color={textColor} />,
          <FiMoreHorizontal
            key="more-horizontal"
            className={`text-[${textColor}]`}
            size={22}
          />,
        ].map((icon, index) => (
          <div
            key={index}
            className="flex h-[24px] w-[24px] items-center justify-center"
          >
            {icon}
          </div>
        ))}
      </div>
      <div
        className={`flex gap-2 divide-x divide-black-secondary text-[14px] text-[#7F7F7F]`}
      >
        <div>Save Draft</div>
        <div className="pl-1">12</div>
      </div>
    </div>
  );
}
