import React, {
  type ReactNode,
  useState,
  type PropsWithChildren,
  useEffect,
  useRef,
} from "react";
import MoreIcon from "@/public/images/dot_icon.svg";
import { SelectContext } from "./select-context";
import { FiMoreVertical } from "react-icons/fi";
import Option from "./option";

interface Props {
  onSelect?: (option: string) => void;
  label?: ReactNode;
  itemsClassName?: string;
}

const Dropdown = ({
  onSelect,
  label = (
    <div className="flex h-full w-full items-center">
      <FiMoreVertical size={24} />
    </div>
  ),
  itemsClassName,
  children,
}: PropsWithChildren<Props>) => {
  const [selectedOption, setSelectedOption] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const changeOption = (option: string) => {
    setShowDropdown(false);
    onSelect?.(option);
    setSelectedOption(option);
  };

  useEffect(() => {
    const clickOutsideSelect = (e: Event) => {
      if (!containerRef.current?.contains(e.target as HTMLDivElement)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", clickOutsideSelect);
    return () => {
      document.removeEventListener("mousedown", clickOutsideSelect);
    };
  }, []);

  return (
    <SelectContext.Provider value={{ selectedOption, changeOption }}>
      <button
        type="button"
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center"
      >
        <span>{label}</span>
      </button>
      <div
        ref={containerRef}
        className={`absolute right-0 top-0 z-10 ${itemsClassName}`}
      >
        {showDropdown && (
          <ul className="rounded-lg bg-[#262626]">{children}</ul>
        )}
      </div>
    </SelectContext.Provider>
  );
};

Dropdown.Option = Option;

export default Dropdown;
