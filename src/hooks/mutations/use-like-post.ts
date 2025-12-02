import { useMutation, UseMutationOptions } from "react-query";
import axios from "axios";

interface LikePostResponse {
  postId: number;
  isLiked: boolean;
  likeCount: number;
}

interface LikePostParams {
  postId: number;
  isCurrentlyLiked: boolean;
}

/**
 * Hook to like/unlike a blog post
 * Uses axios for automatic JWT token handling via interceptor
 */
const useLikePost = (
  options?: UseMutationOptions<LikePostResponse, Error, LikePostParams>,
) => {
  return useMutation({
    mutationKey: "likePost",
    mutationFn: async ({ postId, isCurrentlyLiked }: LikePostParams) => {
      console.log(
        `[Like] ${isCurrentlyLiked ? "Unliking" : "Liking"} post:`,
        postId,
      );

      // If currently liked, send DELETE to unlike
      // If not liked, send POST to like
      const response = isCurrentlyLiked
        ? await axios.delete(
            `${process.env.NEXT_PUBLIC_BASE_URL}/posts/${postId}/like`,
          )
        : await axios.post(
            `${process.env.NEXT_PUBLIC_BASE_URL}/posts/${postId}/like`,
          );

      console.log(
        `[Like] ${isCurrentlyLiked ? "Unlike" : "Like"} successful:`,
        response.data,
      );

      return response.data.data || response.data;
    },
    ...options,
  });
};

export default useLikePost;
