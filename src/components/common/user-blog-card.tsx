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
  nickname?: string;
  profileImg?: string;
  blogName?: string;
  isLiked?: boolean;
  isFollowing?: boolean;
  onLoginRequired?: () => void;
}

export default function UserBlogCard({
  id,
  title,
  description,
  src,
  rgstDtm,
  nickname,
  profileImg,
  blogName,
  isLiked = false,
  isFollowing = false,
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
      <div className="overflow-hidden">
        <div className="flex items-start justify-between gap-2">
          <h3 className="flex-1 truncate text-[14px] font-medium text-white-primary">
            {title}
          </h3>
          <button
            onClick={handleLikeClick}
            disabled={isLiking}
            className={`flex-shrink-0 transition-all ${
              localIsLiked
                ? "text-red-500 hover:text-red-600"
                : "text-gray-400 hover:text-red-500"
            } disabled:opacity-50`}
            aria-label={localIsLiked ? "Unlike post" : "Like post"}
          >
            <HeartIcon filled={localIsLiked} size={18} />
          </button>
        </div>
        <p className="line-clamp-2 text-[14px] text-[#717375]">{description}</p>
        <div className="mt-2 flex items-center justify-between gap-2">
          <p className="text-[12px] text-gray-500">
            {formatLocalizedDateTime(rgstDtm)}
          </p>
          {(blogName || isFollowing) && (
            <div className="flex items-center gap-2">
              {blogName && (
                <span className="truncate text-[11px] text-[#999999]">
                  {blogName}
                </span>
              )}
              {isFollowing && (
                <span className="flex-shrink-0 rounded-md bg-gray-700 px-2 py-0.5 text-[10px] text-gray-300">
                  Following
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
