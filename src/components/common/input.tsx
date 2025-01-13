import { ReactNode, useRef, useState } from "react";

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: ReactNode;
  placeholderNode?: ReactNode;
}

export default function Input({ icon, placeholderNode, ...inputProps }: Props) {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState("");

  const handleFocus = () => {
    setIsFocused(true);
    inputRef.current?.focus();
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (setValue) {
      setValue(e.target.value);
    }
  };

  //style을 외부에서 들어온것과 내부에서 정의한걸 합쳐서 사용할 수 있음
  const styles = {
    paddingLeft: icon ? "55px" : "0",
    ...inputProps.style,
  };

  return (
    <div className="relative flex h-[56px] rounded-lg bg-[#262626]">
      {icon && (
        <div className="absolute left-0 top-0 flex h-full items-center pl-4">
          {icon}
        </div>
      )}
      {!value && !isFocused && placeholderNode && (
        <div
          className="absolute left-0 top-0 flex flex-col gap-2 p-4 text-[#7A7A7A]"
          style={{ paddingLeft: icon ? "55px" : "0" }}
          onClick={handleFocus}
        >
          {placeholderNode}
        </div>
      )}
      <input
        ref={inputRef}
        className="h-full flex-1 rounded-lg bg-[#262626] px-5"
        onFocus={handleFocus}
        onBlur={handleBlur}
        onChange={handleChange}
        value={value}
        {...inputProps}
        style={styles}
      />
    </div>
  );
}
