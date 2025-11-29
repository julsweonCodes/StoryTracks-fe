import Image from "next/image";
import { useRouter } from "next/router";
import { formatLocalizedDateTime } from "@/utils/format-date";

interface Props {
  id: number;
  title: string;
  description: string;
  src: string;
  rgstDtm: string;
  ogText?: string;
  userId?: number;
  nickname?: string;
  profileImg?: string;
}

export default function Card({
  id,
  title,
  description,
  src,
  rgstDtm,
  ogText,
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
    <div
      className="flex cursor-pointer gap-4 rounded-lg bg-[#222222] p-4"
      onClick={handleClick}
    >
      {/* Thumbnail - Left Side */}
      <div className="flex h-[240px] w-[240px] flex-shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#333333]">
        <Image
          src={src}
          width={240}
          height={240}
          alt={title}
          className="h-full w-full"
          style={{
            objectFit: "cover",
            objectPosition: "center",
          }}
        />
      </div>

      {/* Content - Right Side */}
      <div className="flex flex-1 flex-col justify-between">
        {/* Title */}
        <div>
          <h3 className="text-[16px] font-bold text-white-primary">{title}</h3>

          {/* OG Text Preview */}
          {ogText && (
            <p className="mt-2 line-clamp-2 text-[14px] text-[#717375]">
              {ogText}
            </p>
          )}
        </div>

        {/* User Info & Date - Bottom */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {profileImg && (
              <Image
                src={`${process.env.NEXT_PUBLIC_S3_BASE_URL}${profileImg}`}
                width={32}
                height={32}
                alt={nickname || "user"}
                className="h-8 w-8 rounded-full"
                style={{
                  objectFit: "cover",
                  objectPosition: "center",
                }}
              />
            )}
            <span className="text-[13px] font-medium text-white-primary">
              {nickname || "Anonymous"}
            </span>
          </div>
          <span className="text-[12px] text-gray-500">
            {formatLocalizedDateTime(rgstDtm)}
          </span>
        </div>
      </div>
    </div>
  );
}
