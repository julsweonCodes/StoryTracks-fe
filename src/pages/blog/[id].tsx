import Dropdown from "@/components/common/dropdown";
import Header from "@/components/common/header";
import Modal from "@/components/common/modal";
import SEOHeader from "@/components/common/seo-header";
import EditIcon from "@/components/icons/edit";
import Minimalistic from "@/components/icons/minimalistic";
import TrashIcon from "@/components/icons/trash";
import HeartIcon from "@/components/icons/heart";
import usePostsDetailQuery from "@/hooks/queries/use-posts-detail-query";
import useDeleteBlogPost from "@/hooks/mutations/use-delete-blog-post";
import useLikePost from "@/hooks/mutations/use-like-post";
import useFollowUser from "@/hooks/mutations/use-follow-user";
import { markdownToHtml } from "@/utils/markdown-to-html";
import { replaceImageFileNamesWithS3Urls } from "@/utils/replace-image-urls";
import { formatLocalizedDateTime } from "@/utils/format-date";
import Image from "next/image";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useQueryClient } from "react-query";

export default function Detail() {
  const router = useRouter();
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [htmlContent, setHtmlContent] = useState<string>();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [userNickname, setUserNickname] = useState<string | null>(null);
  const [userProfileImg, setUserProfileImg] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  // Extract query params from router
  const { id, nickname, profileImg } = router.query;
  const { data } = usePostsDetailQuery(id as string);
  const [isOpen, setIsOpen] = useState(false);
  const isNew = router.query.new;

  // Like mutation
  const { mutate: toggleLike, isLoading: isLiking } = useLikePost({
    onSuccess: () => {
      // Invalidate and refetch the post detail to get updated like status
      queryClient.invalidateQueries(["blog-detail", id]);
      // Invalidate feed lists so like status updates when user navigates back
      queryClient.invalidateQueries(["blog-list"]);
      // Optimistically toggle the UI
      setIsLiked(!isLiked);
    },
    onError: (error: Error) => {
      console.error("[Like] Failed to like/unlike post:", error);
    },
  });

  // Follow mutation
  const { mutate: toggleFollow, isLoading: isFollowingLoading } = useFollowUser(
    {
      onSuccess: () => {
        // Invalidate and refetch the post detail to get updated follow status
        queryClient.invalidateQueries(["blog-detail", id]);
        // Optimistically toggle the UI
        setIsFollowing(!isFollowing);
      },
      onError: (error: Error) => {
        console.error("[Follow] Failed to follow/unfollow user:", error);
      },
    },
  );

  // Update user info when query params or API data changes
  useEffect(() => {
    // Use query params first, fallback to API data
    const finalNickname =
      (nickname as string) ||
      data?.nickname ||
      data?.userNickname ||
      "Anonymous";
    const finalProfileImg =
      (profileImg as string) || data?.profileImg || data?.userProfileImg || "";

    setUserNickname(finalNickname);
    setUserProfileImg(finalProfileImg);

    // Update isLiked state from API data
    if (data?.isLiked !== undefined) {
      setIsLiked(data.isLiked);
    }

    // Update isFollowing state from API data
    if (data?.isFollowed !== undefined) {
      setIsFollowing(data.isFollowed);
    }
  }, [nickname, profileImg, data]);

  // Handle like button click
  const handleLikeClick = () => {
    // Check if user is logged in
    if (!session) {
      setIsLoginModalOpen(true);
      return;
    }

    // Toggle like/unlike
    toggleLike({
      postId: Number(id),
      isCurrentlyLiked: isLiked,
    });
  };

  // Handle follow button click
  const handleFollowClick = () => {
    // Check if user is logged in
    if (!session) {
      setIsLoginModalOpen(true);
      return;
    }

    // Don't allow following yourself
    if (
      data?.userId &&
      session?.user?.id &&
      Number(session.user.id) === data.userId
    ) {
      return;
    }

    // Toggle follow/unfollow
    if (data?.userId) {
      toggleFollow({
        userId: data.userId,
        isCurrentlyFollowing: isFollowing,
      });
    }
  };

  const { mutate: deleteBlogPost, isLoading: isDeleting } = useDeleteBlogPost({
    onSuccess: () => {
      setIsDeleteModalOpen(false);
      router.push("/");
    },
    onError: (error: Error) => {
      console.error("[Delete] Failed to delete post:", error);
      setDeleteError(error.message);
    },
  });

  const handleDone = () => {
    setIsOpen(false);
  };

  const handleDeleteConfirm = async () => {
    try {
      setDeleteError(null);

      deleteBlogPost({
        postId: Number(id),
      });
    } catch (error) {
      console.error("[Delete] Error during deletion:", error);
      setDeleteError("An unexpected error occurred. Please try again.");
    }
  };

  const handleSelect = (option: string) => {
    if (option === "Edit") {
      router.push(`/blog/edit/${id}`);
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
        // Step 1: Replace image file names with full S3 URLs
        const s3BaseUrl = process.env.NEXT_PUBLIC_S3_BASE_URL;

        const ogTextWithImageUrls = replaceImageFileNamesWithS3Urls(
          data.ogText,
          data.blogImgList as any,
          s3BaseUrl || "",
        );

        // Step 2: Convert markdown to HTML
        const htmlContent = await markdownToHtml(ogTextWithImageUrls);

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
            <h1 className="text-[32px] font-medium">{data.title}</h1>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* Profile Image and User Info - Clickable */}
                <button
                  onClick={() => {
                    if (data?.userId) {
                      router.push(`/user-blog-home?id=${data.userId}`);
                    }
                  }}
                  className="flex items-center gap-3 transition-opacity hover:opacity-80"
                >
                  {userProfileImg ? (
                    <div className="relative h-[40px] w-[40px] overflow-hidden rounded-full bg-[#2a2a2a]">
                      <Image
                        src={`${process.env.NEXT_PUBLIC_S3_BASE_URL}${userProfileImg}`}
                        alt={userNickname || "User"}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex h-[40px] w-[40px] items-center justify-center rounded-full bg-[#333333] text-[#999999]">
                      👤
                    </div>
                  )}
                  {/* User Info */}
                  <div className="flex flex-col items-start">
                    <span className="text-[13px] font-medium tracking-tight text-[#E6E6E6]">
                      {userNickname || "Anonymous"}
                    </span>
                    <span className="text-[12px] tracking-tight text-black-tertiary">
                      {formatLocalizedDateTime(data.rgstDtm)}
                    </span>
                    {data?.blogName && (
                      <span className="mt-1 text-[11px] tracking-tight text-[#999999]">
                        {data.blogName}
                      </span>
                    )}
                  </div>
                </button>
                {/* Follow Button - Only show if not viewing own post */}
                {(() => {
                  const isOwnPost =
                    session?.user?.id &&
                    data?.userId &&
                    Number(session.user.id) === data.userId;
                  return !isOwnPost && session ? (
                    <button
                      onClick={handleFollowClick}
                      disabled={isFollowingLoading}
                      className={`ml-3 rounded-lg px-4 py-1.5 text-[12px] font-medium transition-all ${
                        isFollowing
                          ? "border border-gray-600 bg-transparent text-gray-300 hover:border-gray-500 hover:bg-gray-800"
                          : "bg-white-primary text-black-primary hover:bg-opacity-90"
                      } disabled:opacity-50`}
                    >
                      {isFollowing ? "Following" : "Follow"}
                    </button>
                  ) : null;
                })()}
              </div>
              <div className="flex items-center gap-3">
                {/* Like Button */}
                <button
                  onClick={handleLikeClick}
                  disabled={isLiking}
                  className={`flex items-center justify-center transition-all ${
                    isLiked
                      ? "text-red-500 hover:text-red-600"
                      : "text-gray-400 hover:text-red-500"
                  } disabled:opacity-50`}
                  aria-label={isLiked ? "Unlike post" : "Like post"}
                >
                  <HeartIcon filled={isLiked} size={24} />
                </button>
                {/* Only show edit/delete dropdown if current user is the post owner */}
                {(() => {
                  const isOwner =
                    session?.user?.id &&
                    data?.userId &&
                    Number(session.user.id) === data.userId;
                  return isOwner ? (
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
                            <div className="text=[14px] flex h-[38px] w-full items-center gap-2 px-3 tracking-tight text-white-primary hover:bg-[#262626]">
                              {item.icon}
                              <span>{item.text}</span>
                            </div>
                          </Dropdown.Option>
                        ))}
                      </Dropdown>
                    </div>
                  ) : null;
                })()}
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
              {deleteError && (
                <div className="mb-4 rounded-lg bg-red-500/20 p-3 text-sm text-red-400">
                  {deleteError}
                </div>
              )}
              <div className="flex w-full flex-col gap-2">
                <button
                  className="h-[45px] w-full rounded-xl bg-key-primary disabled:opacity-50"
                  onClick={handleDeleteConfirm}
                  disabled={isDeleting}
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </button>
                <button
                  className="h-[45px] w-full rounded-xl bg-[#333333] text-white-primary disabled:opacity-50"
                  onClick={() => {
                    setIsDeleteModalOpen(false);
                    setDeleteError(null);
                  }}
                  disabled={isDeleting}
                >
                  Cancel
                </button>
              </div>
            </div>
          </Modal>
          {/* Login Prompt Modal */}
          <Modal
            open={isLoginModalOpen}
            onClose={() => setIsLoginModalOpen(false)}
          >
            <div className="flex w-full flex-col items-center justify-between gap-4">
              <div className="flex h-[40px] w-[40px] items-center justify-center rounded-xl bg-[#333333]">
                <HeartIcon filled={false} size={24} className="text-red-500" />
              </div>
              <div className="mb-5 flex flex-col items-center justify-center tracking-tight">
                <h1 className="leading-5 text-white-primary">Login Required</h1>
                <p className="text-center text-[14px] text-[#B0B0B0]">
                  You need to be logged in to like posts
                </p>
              </div>
              <div className="flex w-full flex-col gap-2">
                <button
                  className="h-[45px] w-full rounded-xl bg-key-primary"
                  onClick={() => router.push("/login")}
                >
                  Go to Login
                </button>
                <button
                  className="h-[45px] w-full rounded-xl bg-[#333333] text-white-primary"
                  onClick={() => setIsLoginModalOpen(false)}
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
