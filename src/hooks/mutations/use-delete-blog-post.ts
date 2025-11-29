import { useMutation, UseMutationOptions } from "react-query";

interface DeleteBlogPostResponse {
  postId: number;
}

interface DeleteBlogPostPayload {
  postId: number;
  userId: number;
}

/**
 * Hook to delete an existing blog post
 * Only the owner of the post can delete it
 */
const useDeleteBlogPost = (
  options: UseMutationOptions<DeleteBlogPostResponse, Error, unknown>,
) => {
  return useMutation({
    mutationKey: "deleteBlogPost",
    mutationFn: async (payload: DeleteBlogPostPayload) => {
      console.log("[Delete] Starting blog post deletion...");
      console.log("[Delete] Payload:", JSON.stringify(payload, null, 2));

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/posts/${payload.postId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: payload.userId,
          }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("[Delete] Backend error:", errorData);
        throw new Error(
          errorData.message || "Failed to delete blog post. Please try again.",
        );
      }

      const data = await response.json();
      console.log("[Delete] Blog post deleted successfully:", data);

      return {
        postId: data.postId || payload.postId,
      };
    },
    ...options,
  });
};

export default useDeleteBlogPost;
