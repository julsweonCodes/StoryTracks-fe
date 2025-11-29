import { useMutation, UseMutationOptions } from "react-query";

interface UpdateBlogPostResponse {
  postId: number;
}

interface ImageMetadata {
  imgFileName: string; // Original file name (e.g., "photo.jpg")
  imgPath: string; // S3 file path (e.g., "posts/1763882165078_photo.jpg")
  geoLat: string;
  geoLong: string;
  imgDtm: string;
  thumbYn: "Y" | "N";
}

interface UpdateBlogPostPayload {
  postId: number; // ID of post to update
  userId: number; // User ID (for authorization)
  title: string;
  ogText: string; // Original user description
  aiGenText: string; // AI generated content
  images: ImageMetadata[]; // Images with S3 file names and metadata
}

/**
 * Hook to update an existing blog post
 * Requires user to be the owner of the post
 */
const useUpdateBlogPost = (
  options: UseMutationOptions<UpdateBlogPostResponse, Error, unknown>,
) => {
  return useMutation({
    mutationKey: "updateBlogPost",
    mutationFn: async (payload: UpdateBlogPostPayload) => {
      console.log("[Update] Starting blog post update...");
      console.log("[Update] Payload:", JSON.stringify(payload, null, 2));
      console.log(
        "[Update] userId:",
        payload.userId,
        "type:",
        typeof payload.userId,
      );
      console.log("[Update] postId:", payload.postId);

      // Log thumbnail information
      const thumbnailImages = payload.images.filter(
        (img) => img.thumbYn === "Y",
      );
      console.log(
        `[Update] Thumbnail validation: ${thumbnailImages.length} featured image(s)`,
      );
      if (thumbnailImages.length > 0) {
        console.log("[Update] Featured image:", thumbnailImages[0].imgFileName);
      }

      // Log all images with their thumbYn status
      console.log(
        "[Update] Images to update:",
        payload.images.map((img) => ({
          fileName: img.imgFileName,
          thumbYn: img.thumbYn,
          path: img.imgPath,
        })),
      );

      // PUT request to update post
      console.log("[Update] Sending update request to backend...");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/posts/${payload.postId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: payload.userId,
            title: payload.title,
            ogText: payload.ogText,
            aiGenText: payload.aiGenText,
            images: payload.images,
          }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("[Update] Backend error:", errorData);
        // Show generic error message to user, don't expose backend details
        throw new Error("Failed to update blog post. Please try again.");
      }

      const data = await response.json();
      console.log("[Update] Blog post updated successfully:", data);

      return {
        postId: data.postId || data.data?.postId || payload.postId,
      };
    },
    ...options,
  });
};

export default useUpdateBlogPost;
