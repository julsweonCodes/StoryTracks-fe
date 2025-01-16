import { createContext } from "react";

interface ContextValue {
  selectedOption: string;
  changeOption?: (option: string) => void;
}

export const SelectContext = createContext<ContextValue>({
  selectedOption: "",
});
