import Loading from "@/components/common/loading";
import { useFormContext } from "@/context/form-context";
import Preview from "./sections/preview";
import BlogHeader from "@/components/common/blog-header";
import GeneratorHeader from "@/components/common/generator-header";
import Generator from "./sections/ai-generator";
import Write from "./sections/write";
import Setting from "./sections/settings";

export default function NewPostForm() {
  const { activeComponentKey, statusInfo } = useFormContext();

  const components = {
    write: Write,
    generator: Generator,
    preview: Preview,
    setting: Setting,
  };

  const headers = {
    write: GeneratorHeader,
    generator: GeneratorHeader,
    preview: GeneratorHeader,
    setting: GeneratorHeader,
  };

  const ActiveComponent =
    components[activeComponentKey] || (() => <div>Invalid component key</div>);
  const Header =
    headers[activeComponentKey] || (() => <div>Invalid header key</div>);

  return (
    <div className="relative flex h-full w-full flex-col">
      <Header />
      <ActiveComponent />
      {statusInfo?.type && (
        <div className="absolute left-0 top-0 z-10 flex h-full w-full flex-col items-center justify-center gap-4 bg-black-primary p-10 text-center">
          <Loading
            type={statusInfo?.type}
            title={statusInfo?.title}
            description={statusInfo?.description}
            color="#A099FF"
          />
        </div>
      )}
    </div>
  );
}
