import Header from "@/components/common/header";
import Modal from "@/components/common/modal";
import SEOHeader from "@/components/common/seo-header";
import Minimalistic from "@/components/icons/minimalistic";
import usePostsDetailQuery from "@/hooks/queries/use-posts-detail-query";
import { markdownToHtml } from "@/utils/markdown-to-html";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { FiMoreVertical } from "react-icons/fi";

export default function Detail() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { id } = router.query;
  const { data } = usePostsDetailQuery(id as string);
  const [isOpen, setIsOpen] = useState(false);
  const isNew = searchParams.get("new");
  const [htmlContent, setHtmlContent] = useState<string>();

  const handleDone = () => {
    setIsOpen(false);
  };

  useEffect(() => {
    if (router.isReady && isNew === "true") {
      setIsOpen(true);
    }
  }, [router.isReady, isNew]);

  useEffect(() => {
    if (data)
      (async () => {
        const htmlContent = await markdownToHtml(data.aiGenText);

        setHtmlContent(htmlContent);
      })();
  }, [data]);

  return (
    <div className="flex h-full w-full flex-col">
      <div className="z-20">
        <Header />
      </div>
      {data && (
        <div className="flex flex-col divide-y divide-black-tertiary overflow-y-auto p-4">
          <SEOHeader
            title={`Explore Stories on Story Track - ${data.title}`}
            description={`Dive into ${data.title} and discover the story behind it. Read more inspiring blogs on Story Track, your platform for storytelling.`}
          />
          <div className="flex flex-col gap-4 pb-4">
            <div>
              <span className="text-[13px] tracking-tight text-black-tertiary">
                Travel
              </span>
            </div>
            <h1 className="text-[32px] font-medium">{data.title}</h1>
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[13px] tracking-tight text-[#E6E6E6]">
                  John Doe
                </span>
                <span className="text-[12px] tracking-tight text-black-tertiary">
                  2024.12.28. 13:08
                </span>
              </div>
              <div className="relative">
                <FiMoreVertical size={24} />
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-5 pt-4">
            <div className="flex flex-col gap-3">
              {data.blogImgList.map((img, index) => (
                <Image
                  key={index}
                  src={img.imgPath}
                  width={350}
                  height={350}
                  alt="image"
                  className="aspect-square w-full object-cover"
                />
              ))}
            </div>
            <div>
              <p
                className="text-[16px] leading-6 tracking-tight"
                dangerouslySetInnerHTML={{ __html: htmlContent || "" }}
              />
            </div>
          </div>
          <Modal open={isOpen} onClose={handleDone}>
            <div className="flex w-full flex-col items-center justify-between gap-4">
              <div className="flex h-[40px] w-[40px] items-center justify-center rounded-xl bg-[#333333]">
                <Minimalistic />
              </div>
              <div className="flex flex-col items-center justify-center tracking-tight">
                <h1 className="leading-5 text-white-primary">
                  Congratulations!
                </h1>
                <p className="text-[14px] text-[#B0B0B0]">
                  Your AI-powered personalized blog is live
                </p>
              </div>
              <button
                className="h-[45px] w-full rounded-xl bg-key-primary"
                onClick={handleDone}
              >
                Done
              </button>
            </div>
          </Modal>
        </div>
      )}
    </div>
  );
}
