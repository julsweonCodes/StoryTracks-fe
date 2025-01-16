import { ReactNode, useRef, useState } from "react";

interface Props extends React.HTMLProps<HTMLTextAreaElement> {
  // value: string;
  // setValue: (value: string) => void;
  // placeholder?: ReactNode;
  contentClassName?: string;
  placeholderContent?: ReactNode;
}

export default function Textarea({
  // value,
  // setValue,
  // placeholder = <DefaultPlaceholder />,
  contentClassName,
  placeholderContent,
  ...textareaProps
}: Props) {
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleFocus = () => {
    setIsFocused(true);
    textareaRef.current?.focus();
  };

  return (
    <div
      className={
        contentClassName
          ? contentClassName
          : "relative aspect-[7/5] overflow-hidden rounded-lg bg-[#262626]"
      }
    >
      {!textareaProps.value && !isFocused && placeholderContent && (
        <div
          className="absolute left-0 top-0 flex flex-col gap-2 p-4 text-[#7A7A7A]"
          onClick={handleFocus}
        >
          {placeholderContent}
        </div>
      )}
      <textarea
        ref={textareaRef}
        name="description"
        id="description"
        className="h-full w-full rounded-lg bg-[#262626] p-5"
        onFocus={handleFocus}
        onBlur={() => setIsFocused(false)}
        // onChange={(e) => setValue(e.target.value)}
        // value={value}
        {...textareaProps}
        style={{ resize: "none" }}
      />
    </div>
  );
}
