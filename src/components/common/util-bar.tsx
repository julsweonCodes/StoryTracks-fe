import { FiMoreHorizontal } from "react-icons/fi";
import CameraIcon from "../icons/camera";
import MagicIcon from "../icons/magic";
import ParagraphSpacingIcon from "../icons/paragraph-spacing";
import TextCircleIcon from "../icons/text-circle";

export default function UtilBar() {
  return (
    <div className="fixed bottom-0 left-0 flex h-[48px] w-full items-center justify-between bg-[#F5F5F5] px-4">
      <div className="flex h-full flex-1 items-center gap-5">
        {[
          <MagicIcon size={25} />,
          <CameraIcon />,
          <TextCircleIcon />,
          <ParagraphSpacingIcon />,
          <FiMoreHorizontal className="text-black-primary" size={22} />,
        ].map((icon, index) => (
          <div
            key={index}
            className="flex h-[24px] w-[24px] items-center justify-center"
          >
            {icon}
          </div>
        ))}
      </div>
      <div className="flex gap-2 divide-x text-[14px] text-[#7F7F7F]">
        <div>Save Draft</div>
        <div className="pl-1">12</div>
      </div>
    </div>
  );
}
