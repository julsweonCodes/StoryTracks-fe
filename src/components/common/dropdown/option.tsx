import { ReactNode, useContext } from "react";
import { SelectContext } from "./select-context";

interface Props {
  value: string;
  children: ReactNode;
}

export default function Option({ value, children }: Props) {
  const { changeOption } = useContext(SelectContext);

  return <li onClick={() => changeOption?.(value)}>{children}</li>;
}
