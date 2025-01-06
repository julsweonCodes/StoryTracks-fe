import { ReactNode } from "react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

export default function Dropdown({ isOpen, onClose, children }: Props) {
  void isOpen;
  void onClose;
  void children;
  return <div></div>;
}
