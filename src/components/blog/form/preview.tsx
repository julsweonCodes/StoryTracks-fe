import { useFormContext } from "@/context/form-context";

export default function Preview() {
  const { setActiveComponentKey } = useFormContext();

  return <div>preview</div>;
}
