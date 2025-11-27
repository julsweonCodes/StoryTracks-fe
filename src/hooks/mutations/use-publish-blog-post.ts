import { useMutation, UseMutationOptions } from "react-query";
import { ImageInfo } from "@/context/form-context";

interface PublishBlogPostResponse {
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

interface PublishBlogPostPayload {
  userId: number; // User ID
  title: string;
  ogText: string; // Original user description
  aiGenText: string; // AI generated content
  images: ImageMetadata[]; // Images with S3 file names and metadata
}

/**
 * Step 1: Upload images to S3
 * Step 2: Create blog post with S3 image references
 */
const usePublishBlogPost = (
  options: UseMutationOptions<PublishBlogPostResponse, Error, unknown>,
) => {
  return useMutation({
    mutationKey: "publishBlogPost",
    mutationFn: async (payload: PublishBlogPostPayload) => {
      console.log("[Publish] Starting blog post publication...");
      console.log("[Publish] Payload:", JSON.stringify(payload, null, 2));
      console.log("[Publish] userId:", payload.userId, "type:", typeof payload.userId);

      // Step 2: Create blog post with S3 image references
      console.log("[Publish] Creating blog post with S3 images...");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/posts/create`,
        {
          method: "POST",
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
        console.error("[Publish] Backend error:", errorData);
        // Show generic error message to user, don't expose backend details
        throw new Error("Failed to create blog post. Please try again.");
      }

      const data = await response.json();
      console.log("[Publish] Blog post created successfully:", data);

      return {
        postId: data.postId || data.data?.postId,
      };
    },
    ...options,
  });
};

export default usePublishBlogPost;
