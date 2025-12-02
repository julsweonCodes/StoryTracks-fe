import { useMutation, UseMutationOptions } from "react-query";
import { useSession } from "next-auth/react";

interface LikePostResponse {
  postId: number;
  isLiked: boolean;
  likeCount: number;
}

/**
 * Hook to like/unlike a blog post
 * Sends JWT token in Authorization header for security
 */
const useLikePost = (
  options: UseMutationOptions<LikePostResponse, Error, number>,
) => {
  const { data: session } = useSession();

  return useMutation({
    mutationKey: "likePost",
    mutationFn: async (postId: number) => {
      console.log("[Like] Starting like/unlike request for post:", postId);

      if (!session?.user?.id) {
        throw new Error("User not authenticated");
      }

      // Get the JWT token from the session
      // Note: The token is automatically included in the session by NextAuth
      // We need to extract it from the session if available
      // If not available in session, you may need to use getSession() server-side
      const token = (session as any)?.token;

      console.log("[Like] Session user ID:", session.user.id);
      console.log("[Like] Has token:", !!token);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/posts/${postId}/like`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // Send JWT in Authorization header
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: JSON.stringify({
            postId: postId,
          }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("[Like] Backend error:", errorData);
        throw new Error(errorData.message || "Failed to like/unlike post");
      }

      const data = await response.json();
      console.log("[Like] Like/unlike successful:", data);

      return data.data || data;
    },
    ...options,
  });
};

export default useLikePost;
