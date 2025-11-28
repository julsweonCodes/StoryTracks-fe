import Textarea from "@/components/common/textarea";
import UtilBar from "@/components/common/util-bar";
import { useFormContext } from "@/context/form-context";
import { markdownToHtml } from "@/utils/markdown-to-html";
import Image from "next/image";
import { ChangeEvent, useEffect, useState } from "react";

interface ContentData {
  title: string;
  description: string;
  images: Array<{ url: string; isThumb: boolean }>;
}

export default function Preview() {
  const { aiContent, images, aiContentIndex, setImages, setAiContent } =
    useFormContext();
  const [selectIndex, setSelectIndex] = useState<number>(0);
  const [contentData, setContentData] = useState<ContentData>();
  const [htmlContent, setHtmlContent] = useState<string>();
  const [value, setValue] = useState<string>(
    aiContent[aiContentIndex as number].title,
  );

  useEffect(() => {
    setAiContent((prev) =>
      prev.map((item, index) =>
        index === aiContentIndex ? { ...item, title: value } : item,
      ),
    );
  }, [value]);

  useEffect(() => {
    if (aiContent && images && aiContentIndex !== undefined) {
      const data = aiContent[aiContentIndex];
      const imagesData = images
        ?.map((image) => ({
          url: image.previewUrl || "",
          isThumb: image.active || false,
        }))
        .filter((img) => img.url) as Array<{ url: string; isThumb: boolean }>;
      setContentData({
        title: data.title,
        description: data.content,
        images: imagesData,
      });

      (async () => {
        const htmlContent = await markdownToHtml(data.content);
        setHtmlContent(htmlContent);
      })();
    }
  }, [aiContent, images, aiContentIndex]);

  useEffect(() => {
    if (images && images.length > 0) {
      setImages((prev) =>
        prev.map((image, index) => ({
          ...image,
          active: index === selectIndex,
        })),
      );
    }
  }, [selectIndex]);

  useEffect(() => {
    setValue(aiContent[aiContentIndex as number].title);
  }, [aiContent]);

  const autoResize = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target;
    textarea.style.height = "36px";
    textarea.style.height = `${textarea.scrollHeight}px`;
  };

  return (
    <div className="relative flex h-full flex-col overflow-hidden">
      <UtilBar />
      {contentData && (
        <div className="relative flex w-full flex-1 flex-col gap-5 divide-y divide-black-secondary overflow-y-auto p-5">
          <div className="w-full">
            <Textarea
              value={value}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                setValue(e.target.value)
              }
              contentClassName="relative w-full bg-black-primary text-[24px] text-white-primary placeholder:text-[24px] placeholder:text-[#7A7A7A]"
              className="h-[36px] min-h-[36px] w-full overflow-hidden bg-black-primary"
              placeholder="Title"
              onInput={autoResize}
            />
          </div>
          <div className="flex flex-col gap-5 pt-5">
            <div className="flex flex-col gap-3">
              {contentData.images.map((image, index) => (
                <div
                  key={index}
                  className={`relative ${index === selectIndex ? "border-2 border-[#5946D4]" : ""}`}
                  onClick={() => setSelectIndex(index)}
                >
                  {image.url.startsWith("data:") ? (
                    <img
                      src={image.url}
                      alt="preview"
                      className="aspect-square w-full object-cover"
                    />
                  ) : (
                    <Image
                      src={image.url}
                      alt="preview"
                      width={350}
                      height={350}
                      className="aspect-square w-full object-cover"
                    />
                  )}
                  {(index === selectIndex || image.isThumb) && (
                    <div className="text-white absolute left-2 top-2 rounded-md bg-[#5946D4] px-2 py-1 text-[12px] tracking-tight">
                      Featured Image
                    </div>
                  )}
                </div>
              ))}
            </div>
            {htmlContent && (
              <div className="prose">
                <p
                  className="text-[16px] leading-6 tracking-tight"
                  dangerouslySetInnerHTML={{
                    __html: htmlContent || "",
                  }}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
