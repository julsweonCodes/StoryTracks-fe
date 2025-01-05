import { useEffect, useState } from "react";

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
      className="absolute bottom-0 h-full w-full rounded-t-3xl bg-black-primary transition-transform"
      style={{
        transform: `translateY(${isOpen ? `0` : "calc(100% - 63px)"})`,
      }}
    >
      {button}
      <div className="flex h-full max-h-screen flex-col gap-8 overflow-y-auto bg-black-primary p-[18px] pb-20">
        {children}
      </div>
    </div>
  );
}
