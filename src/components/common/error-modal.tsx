import { IoClose } from "react-icons/io5";

interface ErrorModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  onClose: () => void;
}

export default function ErrorModal({
  isOpen,
  title,
  description,
  onClose,
}: ErrorModalProps) {
  if (!isOpen) return null;

  return (
    <div className="bg-black fixed inset-0 z-50 flex items-center justify-center bg-opacity-50 p-4">
      <div className="relative flex max-h-[80vh] w-full max-w-md flex-col overflow-hidden rounded-lg border border-black-secondary bg-black-primary shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-black-secondary px-6 py-4">
          <h3 className="text-lg font-semibold text-white-primary">{title}</h3>
          <button
            onClick={onClose}
            className="text-[#A9A9A9] transition-colors hover:text-white-primary"
          >
            <IoClose size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <p className="text-[14px] leading-6 text-[#D0D0D0]">{description}</p>
        </div>

        {/* Footer */}
        <div className="border-t border-black-secondary px-6 py-4">
          <button
            onClick={onClose}
            className="flex h-[48px] w-full items-center justify-center rounded-lg bg-key-primary font-semibold text-black-secondary transition-colors hover:bg-[#9b8fed]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
