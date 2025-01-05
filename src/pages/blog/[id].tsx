import SEOHeader from "@/components/common/seo-header";
import useBlgoDetailQuery from "@/hooks/queries/use-blog-detail-query";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { FiMoreVertical } from "react-icons/fi";

export default function Detail() {
  const mockData = {
    title: "Notes from the Road: Everyday Travel Tales",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    image: ["/image1.jpeg", "/image2.jpeg", "/image3.jpeg"],
  };

  // 파라미터에서 아이디 축출
  const router = useRouter();
  const { id } = router.query;
  const { data } = useBlgoDetailQuery(id as string);

  useEffect(() => {
    console.log("id: ", id);
  }, [router.isReady, id]);

  return (
    <div className="flex flex-col divide-y divide-black-tertiary overflow-y-auto p-4">
      <SEOHeader
        title={`Explore Stories on Story Track - ${mockData.title}`}
        description={`Dive into ${mockData.title} and discover the story behind it. Read more inspiring blogs on Story Track, your platform for storytelling.`}
      />
      <div className="flex flex-col gap-4 pb-4">
        <div>
          <span className="text-[13px] tracking-tight text-black-tertiary">
            Travel
          </span>
        </div>
        <h1 className="text-[32px] font-medium">{mockData.title}</h1>
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[13px] tracking-tight text-[#E6E6E6]">
              John Doe
            </span>
            <span className="text-[12px] tracking-tight text-black-tertiary">
              2024.12.28. 13:08
            </span>
          </div>
          <div>
            <FiMoreVertical size={24} />
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-5 pt-4">
        <div className="flex flex-col gap-3">
          {mockData.image.map((src, index) => (
            <Image
              key={index}
              src={src}
              width={350}
              height={350}
              alt="image"
              className="aspect-square w-full object-cover"
            />
          ))}
        </div>
        <div>
          <p className="text-[16px] leading-6 tracking-tight">
            {mockData.description}
          </p>
        </div>
      </div>
    </div>
  );
}
