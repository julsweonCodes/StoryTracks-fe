import { useMutation, UseMutationOptions } from "react-query";
import axios from "axios";
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
  title: string;
  ogText: string; // Original user description
  aiGenText: string; // AI generated content
  images: ImageMetadata[]; // Images with S3 file names and metadata
}

/**
 * Step 1: Upload images to S3
 * Step 2: Create blog post with S3 image references
 * Uses JWT from Authorization header instead of userId
 */
const usePublishBlogPost = (
  options: UseMutationOptions<PublishBlogPostResponse, Error, unknown>,
) => {
  return useMutation({
    mutationKey: "publishBlogPost",
    mutationFn: async (payload: PublishBlogPostPayload) => {
      console.log("[Publish] Starting blog post publication...");
      console.log("[Publish] Payload:", JSON.stringify(payload, null, 2));

      // Step 2: Create blog post with S3 image references
      console.log("[Publish] Creating blog post with S3 images...");

      const response = await axios.post(
        `/api/backend/posts/create`,
        {
          title: payload.title,
          ogText: payload.ogText,
          aiGenText: payload.aiGenText,
          images: payload.images,
        },
      );

      console.log("[Publish] Blog post created successfully:", response.data);

      // Backend returns: { code: "200", data: 57, message: "Post created", success: true }
      // The postId is directly in data field as a number
      return {
        postId: response.data.data,
      };
    },
    ...options,
  });
};

export default usePublishBlogPost;
