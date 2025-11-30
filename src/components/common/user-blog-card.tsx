import Image from "next/image";
import { useRouter } from "next/router";
import { formatLocalizedDateTime } from "@/utils/format-date";

interface Props {
  id: number;
  title: string;
  description: string;
  src: string;
  rgstDtm: string;
  userId?: number;
  nickname?: string;
  profileImg?: string;
}

export default function UserBlogCard({
  id,
  title,
  description,
  src,
  rgstDtm,
  userId,
  nickname,
  profileImg,
}: Props) {
  const router = useRouter();

  const handleClick = () => {
    router.push({
      pathname: `/blog/${id}`,
      query: {
        userId: userId,
        nickname: nickname,
        profileImg: profileImg,
      },
    });
  };

  return (
    <div className="flex cursor-pointer flex-col gap-3" onClick={handleClick}>
      <div className="flex h-[310px] w-full items-center justify-center overflow-hidden rounded-xl bg-[#333333]">
        <Image
          src={src}
          width={320}
          height={320}
          alt={title}
          className="w-full"
          style={{
            objectFit: "cover",
            objectPosition: "center",
          }}
        />
      </div>
      <div>
        <h3 className="text-[14px] font-medium text-white-primary">{title}</h3>
        <p className="line-clamp-2 text-[14px] text-[#717375]">{description}</p>
        <p className="mt-2 text-[12px] text-gray-500">
          {formatLocalizedDateTime(rgstDtm)}
        </p>
      </div>
    </div>
  );
}
