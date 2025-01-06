import Loading from "@/components/common/loading";
import { useFormContext } from "@/context/form-context";
import Preview from "./preview";
import BlogHeader from "@/components/common/blog-header";
import GeneratorHeader from "@/components/common/generator-header";
import Generator from "./generaltor";
import Write from "./write";

export default function Form() {
  const { activeComponentKey, statusInfo } = useFormContext();

  const components = {
    write: Write,
    generator: Generator,
    preview: Preview,
  };

  const headers = {
    write: BlogHeader,
    generator: GeneratorHeader,
    preview: BlogHeader,
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
