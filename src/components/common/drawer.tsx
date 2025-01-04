import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface Props {
  isOpen: boolean;
  button?: React.ReactNode;
  children: React.ReactNode;
}

export default function Drawer({ isOpen, button, children }: Props) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true); // 클라이언트에서만 렌더링
  }, []);

  if (!isMounted) return null;

  return (
    <div
      className="bg-black-primary absolute bottom-0 h-full w-full rounded-t-3xl transition-transform"
      style={{
        transform: `translateY(${isOpen ? "0" : "calc(100% - 63px)"})`,
      }}
    >
      {button}
      {children}
    </div>
  );
}
