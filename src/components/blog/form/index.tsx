import Loading from "@/components/common/loading";
import { useFormContext } from "@/context/form-context";
import UploadImage from "./upload-image";
import Preview from "./preview";
import BlogHeader from "@/components/common/blog-header";
import DescriptionHeader from "@/components/common/description-header";
import Description from "./description";

export default function Form() {
  const { activeComponentKey, statusInfo } = useFormContext();

  const components = {
    "upload-image": UploadImage,
    description: Description,
    preview: Preview,
  };

  const headers = {
    "upload-image": BlogHeader,
    description: DescriptionHeader,
    preview: BlogHeader,
  };

  const ActiveComponent =
    components[activeComponentKey] || (() => <div>Invalid component key</div>);
  const Header =
    headers[activeComponentKey] || (() => <div>Invalid header key</div>);

  if (statusInfo?.type) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-5 bg-black p-8 text-center">
        <Loading
          type={statusInfo?.type}
          title={statusInfo?.title}
          description={statusInfo?.description}
        />
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col">
      <Header />
      <ActiveComponent />
    </div>
  );
}
