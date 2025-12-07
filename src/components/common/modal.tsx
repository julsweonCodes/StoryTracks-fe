import { ReactNode, useEffect } from "react";
import ReactDOM from "react-dom";
import { IoClose } from "react-icons/io5";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}

export default function Modal({ open, onClose, children }: ModalProps) {
  const modalRoot = typeof window !== "undefined" ? document.body : null;

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [open]);

  if (!open || !modalRoot) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 flex h-full w-full items-center justify-center bg-black-primary bg-opacity-50 p-6">
      <div
        className="relative flex min-h-[205px] w-full items-center justify-center rounded-lg bg-[#161616] p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
        <button
          className="absolute right-3 top-3 flex h-[44px] w-[44px] items-center justify-center"
          onClick={onClose}
        >
          <IoClose className="text-[#B0B0B0]" size={25} />
        </button>
      </div>
    </div>,
    modalRoot,
  );
}
