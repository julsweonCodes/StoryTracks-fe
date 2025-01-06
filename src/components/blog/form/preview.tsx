import UtilBar from "@/components/common/util-bar";
import { useFormContext } from "@/context/form-context";
import { markdownToHtml } from "@/utils/markdown-to-html";
import Image from "next/image";
import { useEffect, useState } from "react";

interface ContentData {
  title: string;
  description: string;
  images: string[];
}

export default function Preview() {
  const { aiContent, images, aiContentIndex, setImages } = useFormContext();
  const [selectIndex, setSelectIndex] = useState<number>(0);
  const [contentData, setContentData] = useState<ContentData>();
  const [htmlContent, setHtmlContent] = useState<string>();

  useEffect(() => {
    if (aiContent && images && aiContentIndex !== undefined) {
      const data = aiContent[aiContentIndex];
      const imagesData = images?.map((image) => image.previewUrl) || [];
      setContentData({
        title: data.title,
        description: data.content,
        images: imagesData,
      });
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
  }, [selectIndex, images, setImages]);

  useEffect(() => {
    if (contentData)
      (async () => {
        const htmlContent = await markdownToHtml(contentData.description);

        setHtmlContent(htmlContent);
      })();
  }, [contentData]);

  return (
    <div className="relative flex h-full flex-col overflow-hidden">
      <UtilBar />
      {contentData && (
        <div className="relative flex w-full flex-1 flex-col gap-5 divide-y divide-black-secondary overflow-y-auto p-5">
          <h1 className="text-[24px]">{contentData.title}</h1>
          <div className="flex flex-col gap-5 pt-5">
            <div className="flex flex-col gap-3">
              {contentData.images.map((src, index) => (
                <div
                  key={index}
                  className={`relative ${index === selectIndex ? "border-2 border-key-primary" : ""}`}
                  onClick={() => setSelectIndex(index)}
                >
                  <Image
                    src={src}
                    alt="preview"
                    width={350}
                    height={350}
                    className="aspect-square w-full object-cover"
                  />
                  {index === selectIndex && (
                    <div className="text-white absolute left-2 top-2 rounded-md bg-key-primary px-2 py-1 text-[12px] tracking-tight text-black-primary">
                      Set as Default Location
                    </div>
                  )}
                </div>
              ))}
            </div>
            {htmlContent && (
              <div>
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
