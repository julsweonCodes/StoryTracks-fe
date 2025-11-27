import Dropdown from "@/components/common/dropdown";
import Header from "@/components/common/header";
import Modal from "@/components/common/modal";
import SEOHeader from "@/components/common/seo-header";
import EditIcon from "@/components/icons/edit";
import Minimalistic from "@/components/icons/minimalistic";
import TrashIcon from "@/components/icons/trash";
import usePostsDetailQuery from "@/hooks/queries/use-posts-detail-query";
import { markdownToHtml } from "@/utils/markdown-to-html";
import { replaceImageFileNamesWithS3Urls } from "@/utils/replace-image-urls";
import { formatLocalizedDateTime } from "@/utils/format-date";
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
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleDone = () => {
    setIsOpen(false);
  };

  const handleDelete = () => {
    setIsDeleteModalOpen(true);
    router.push("/");
  };

  const handleSelect = (option: string) => {
    if (option === "Edit") {
      console.log("handleSelect:", option);
    } else if (option === "Delete") {
      setIsDeleteModalOpen(true);
    }
  };

  useEffect(() => {
    if (router.isReady && isNew === "true") {
      setIsOpen(true);
    }
  }, [router.isReady, isNew]);

  useEffect(() => {
    if (data)
      (async () => {
        console.log("[Blog Detail] Entire response from GET /posts/{id}:", JSON.stringify(data, null, 2));
        console.log("[Blog Detail] blogImgList:", data.blogImgList);
        console.log("[Blog Detail] blogImgList length:", data.blogImgList?.length);
        
        // Step 1: Replace image file names with full S3 URLs
        const s3BaseUrl = process.env.NEXT_PUBLIC_S3_BASE_URL;
        console.log("[Blog Detail] Original ogText:", data.ogText);
        console.log("[Blog Detail] S3 Base URL:", s3BaseUrl);
        
        const ogTextWithImageUrls = replaceImageFileNamesWithS3Urls(
          data.ogText,
          data.blogImgList as any,
          s3BaseUrl || ""
        );
        
        console.log("[Blog Detail] After replaceImageFileNamesWithS3Urls:", ogTextWithImageUrls);

        // Step 2: Convert markdown to HTML
        const htmlContent = await markdownToHtml(ogTextWithImageUrls);
        
        console.log("[Blog Detail] After markdownToHtml:", htmlContent);

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
                  {formatLocalizedDateTime(data.rgstDtm)}
                </span>
              </div>
              {/* <div className="relative" onClick={() => setIsDropDownOpen(true)}>
                <FiMoreVertical size={24} />
              </div> */}
              <div className="relative flex h-full w-5 items-center">
                <Dropdown onSelect={handleSelect}>
                  {[
                    {
                      icon: <EditIcon />,
                      text: "Edit",
                    },
                    { icon: <TrashIcon />, text: "Delete" },
                  ].map((item, index) => (
                    <Dropdown.Option key={index} value={item.text}>
                      <div className="text=[14px] flex h-[38px] w-full items-center gap-2 px-3 tracking-tight text-white-primary">
                        {item.icon}
                        <span>{item.text}</span>
                      </div>
                    </Dropdown.Option>
                  ))}
                </Dropdown>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-5 pt-4">
            <div className="prose">
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
          <Modal
            open={isDeleteModalOpen}
            onClose={() => setIsDeleteModalOpen(false)}
          >
            <div className="flex w-full flex-col items-center justify-between gap-4">
              <div className="flex h-[40px] w-[40px] items-center justify-center rounded-xl bg-[#333333]">
                <TrashIcon color="#A099FF" />
              </div>
              <div className="mb-5 flex flex-col items-center justify-center tracking-tight">
                <h1 className="leading-5 text-white-primary">Delete post</h1>
                <p className="text-center text-[14px] text-[#B0B0B0]">
                  Permanently delete this post? This action cannot be undone.
                </p>
              </div>
              <div className="flex w-full flex-col gap-2">
                <button
                  className="h-[45px] w-full rounded-xl bg-key-primary"
                  onClick={handleDelete}
                >
                  Delete
                </button>
                <button
                  className="h-[45px] w-full rounded-xl bg-[#333333] text-white-primary"
                  onClick={() => setIsDeleteModalOpen(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </Modal>
        </div>
      )}
    </div>
  );
}
