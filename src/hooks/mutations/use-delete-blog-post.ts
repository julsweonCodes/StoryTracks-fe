import { useMutation, UseMutationOptions } from "react-query";
import axios from "axios";

interface DeleteBlogPostResponse {
  postId: number;
}

interface DeleteBlogPostPayload {
  postId: number;
}

/**
 * Hook to delete an existing blog post
 * Only the owner of the post can delete it
 * Uses JWT from Authorization header for authentication
 */
const useDeleteBlogPost = (
  options: UseMutationOptions<DeleteBlogPostResponse, Error, unknown>,
) => {
  return useMutation({
    mutationKey: "deleteBlogPost",
    mutationFn: async (payload: DeleteBlogPostPayload) => {
      console.log("[Delete] Starting blog post deletion...");
      console.log("[Delete] Payload:", JSON.stringify(payload, null, 2));

      // DELETE request (JWT token automatically added by axios interceptor)
      const response = await axios.delete(
        `${process.env.NEXT_PUBLIC_BASE_URL}/posts/${payload.postId}`,
      );

      console.log("[Delete] Blog post deleted successfully:", response.data);

      return {
        postId: response.data.postId || payload.postId,
      };
    },
    ...options,
  });
};

export default useDeleteBlogPost;
