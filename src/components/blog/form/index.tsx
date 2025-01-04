import Loading from "@/components/common/loading";
import { useFormContext } from "@/context/form-context";
import { ReactElement } from "react";
import UploadImage from "./upload-image";
import Description from "./description";
import Preview from "./preview";

export default function Form() {
  const { activeComponentKey, isLoading } = useFormContext();

  const ActiveComponent = {
    "upload-image": UploadImage,
    description: Description,
    preview: Preview,
  }[activeComponentKey] as () => ReactElement;

  if (isLoading) {
    return (
      <div>
        <Loading />
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      <ActiveComponent />
    </div>
  );
}
