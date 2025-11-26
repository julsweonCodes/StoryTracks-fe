import Loading from "@/components/common/loading";
import { useFormContext } from "@/context/form-context";
import Preview from "./preview";
import BlogHeader from "@/components/common/blog-header";
import GeneratorHeader from "@/components/common/generator-header";
import Generator from "./generaltor";
import Write from "./write";
import Setting from "./setting";

export default function Form() {
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
        <div className="fixed bottom-4 right-4 z-50 flex max-w-sm items-center gap-3 rounded-lg border border-[#444444] bg-[#262626] p-4 shadow-lg">
          <div>
            <Loading
              type={statusInfo?.type}
              title={statusInfo?.title}
              description={statusInfo?.description}
              color="#A099FF"
            />
          </div>
        </div>
      )}
    </div>
  );
}
