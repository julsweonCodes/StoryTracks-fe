import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export default function Drawer({ isOpen, onClose, children }: Props) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true); // 클라이언트에서만 렌더링
  }, []);

  if (!isMounted) return null;

  return createPortal(
    <div
      className={`fixed inset-0 z-50 transition-all duration-300 ${
        isOpen
          ? "pointer-events-auto opacity-100"
          : "pointer-events-none opacity-0"
      }`}
    >
      <div
        className={`absolute inset-0 bg-black bg-opacity-50 transition-opacity ${
          isOpen ? "opacity-50" : "opacity-0"
        }`}
        onClick={onClose}
      ></div>

      <div
        className={`bg-white-primary absolute bottom-0 left-0 max-h-[80%] w-full bg-white shadow-lg transition-transform ${
          isOpen ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <button
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-800"
          onClick={onClose}
        >
          Close
        </button>
        <div className="p-4">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
