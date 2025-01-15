import { useFormContext } from "@/context/form-context";
import useBlogPostMutation, {
  ImageSaveInfo,
} from "@/hooks/mutations/use-blog-post-mutation";
import { useRouter } from "next/router";
import { useState } from "react";
import { FaChevronLeft } from "react-icons/fa6";
import { LuSettings } from "react-icons/lu";
import Loading from "./loading";

export default function GeneratorHeader() {
  const {
    setActiveComponentKey,
    description,
    updateDescription,
    aiContent,
    setAiContent,
    activeComponentKey,
    images,
    setImages,
    aiContentIndex,
    setAiContentIndex,
  } = useFormContext();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { mutate } = useBlogPostMutation({
    onSuccess: (data) => {
      setIsLoading(false);
      router.push(`/blog/${data}?new=true`);
    },
    onError: () => {
      setIsLoading(false);
    },
  });

  const handleCancel = () => {
    if (aiContent.length > 0) {
      setAiContent([]);
      setAiContentIndex(undefined);
    } else if (activeComponentKey === "generator") {
      setActiveComponentKey("write");
      updateDescription("");
      setImages([]);
    } else if (activeComponentKey === "setting") {
      setActiveComponentKey("generator");
    } else if (activeComponentKey === "write") {
      router.push("/");
    }
  };

  const handlePost = () => {
    setIsLoading(true);

    console.log("images", images);

    if (images && aiContentIndex !== undefined) {
      console.log("aiContentIndex", aiContentIndex);
      const imgSaveList: ImageSaveInfo[] = images.map((image) => ({
        fileName: image.fileName,
        geoLat: image.lat.toString(),
        geoLong: image.lon.toString(),
        imgDtm: image.createDate,
        thumbYn: image.active ? "Y" : "N",
      }));
      const aiContentResult = aiContent[aiContentIndex];
      const aiGenText = aiContentResult.content;
      const title = aiContentResult.title;
      // const files = images
      //   .flatMap(imageArray => imageArray) // 중첩 배열 풀기
      //   .filter(image => image.previewUrl) // previewUrl 있는 것만 필터링
      //   .map(image => image.previewUrl);

      const files = images.map((image) => image.file);

      console.log("여기서파일추가?", files);

      mutate({ ogText: description, aiGenText, title, imgSaveList, files });
    }
  };

  const handlePublish = () => {
    if (activeComponentKey === "write") {
      setActiveComponentKey("generator");
    } else if (activeComponentKey === "preview") {
      handlePost();
    }
  };

  const titles = {
    generator: "Content Generator",
    write: "Post Editor",
    setting: "Content Settings",
  } as { [key: string]: string };

  const title = titles[activeComponentKey] || "Add Description";

  const isGenerator = activeComponentKey === "generator";

  const isPublish =
    activeComponentKey === "write" || activeComponentKey === "preview";

  return (
    <div className="relative mx-4 my-2 flex h-[60px] items-center justify-center bg-black-primary text-white-primary">
      <div
        className="absolute left-0 flex h-[40px] w-[40px] items-center justify-center rounded-lg bg-[#262626]"
        onClick={handleCancel}
      >
        <FaChevronLeft />
      </div>
      <h1 className="flex h-[40px] items-center text-[16px] tracking-tight">
        {title}
      </h1>
      {isGenerator && (
        <div
          className="absolute right-0 flex h-[40px] w-[40px] items-center justify-center rounded-lg bg-[#262626]"
          onClick={() => setActiveComponentKey("setting")}
        >
          <LuSettings />
        </div>
      )}
      {isPublish && (
        <div
          className="absolute right-0 flex h-[40px] w-[78px] items-center justify-center rounded-lg bg-[#262626] text-[14px] leading-4 tracking-tight"
          onClick={handlePublish}
        >
          {isLoading ? <Loading type="loading" color="#ffffff" /> : "Publish"}
        </div>
      )}
    </div>
  );
}
