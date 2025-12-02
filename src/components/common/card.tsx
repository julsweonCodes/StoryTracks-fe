import Image from "next/image";
import { useRouter } from "next/router";
import { formatLocalizedDateTime } from "@/utils/format-date";
import HeartIcon from "@/components/icons/heart";
import useLikePost from "@/hooks/mutations/use-like-post";
import { useSession } from "next-auth/react";
import { useQueryClient } from "react-query";
import { useState, useEffect } from "react";

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
  isLiked?: boolean;
  onLoginRequired?: () => void;
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
  isLiked = false,
  onLoginRequired,
}: Props) {
  const router = useRouter();
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [localIsLiked, setLocalIsLiked] = useState(isLiked);

  // Update local state when prop changes
  useEffect(() => {
    setLocalIsLiked(isLiked);
  }, [isLiked]);

  const { mutate: toggleLike, isLoading: isLiking } = useLikePost({
    onSuccess: () => {
      queryClient.invalidateQueries(["blog-list"]);
      queryClient.invalidateQueries(["blog-detail", id]);
    },
    onError: (error: Error) => {
      console.error("[Like] Failed to like/unlike post:", error);
      // Revert optimistic update on error
      setLocalIsLiked(!localIsLiked);
    },
  });

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

  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click

    if (!session) {
      onLoginRequired?.();
      return;
    }

    // Optimistic update
    setLocalIsLiked(!localIsLiked);
    toggleLike({
      postId: id,
      isCurrentlyLiked: localIsLiked,
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
      <div className="flex flex-1 flex-col justify-between overflow-hidden">
        {/* Title */}
        <div className="overflow-hidden">
          <h3 className="truncate text-[16px] font-bold text-white-primary">
            {title}
          </h3>

          {/* OG Text Preview */}
          {ogText && (
            <p className="mt-2 line-clamp-2 text-[14px] text-[#717375]">
              {ogText}
            </p>
          )}
        </div>

        {/* User Info & Date - Bottom */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            {profileImg && (
              <Image
                src={`${process.env.NEXT_PUBLIC_S3_BASE_URL}${profileImg}`}
                width={32}
                height={32}
                alt={nickname || "user"}
                className="h-8 w-8 flex-shrink-0 rounded-full"
                style={{
                  objectFit: "cover",
                  objectPosition: "center",
                }}
              />
            )}
            <span className="truncate text-[13px] font-medium text-white-primary">
              {nickname || "Anonymous"}
            </span>
          </div>
          <div className="flex flex-shrink-0 items-center gap-3">
            <span className="text-[12px] text-gray-500">
              {formatLocalizedDateTime(rgstDtm)}
            </span>
            <button
              onClick={handleLikeClick}
              disabled={isLiking}
              className={`transition-all ${
                localIsLiked
                  ? "text-red-500 hover:text-red-600"
                  : "text-gray-400 hover:text-red-500"
              } disabled:opacity-50`}
              aria-label={localIsLiked ? "Unlike post" : "Like post"}
            >
              <HeartIcon filled={localIsLiked} size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
