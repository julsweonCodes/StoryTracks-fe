import { useMutation, UseMutationOptions } from "react-query";
import axios from "axios";

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
  title: string;
  ogText: string; // Original user description
  aiGenText: string; // AI generated content
  images: ImageMetadata[]; // Images with S3 file names and metadata
}

/**
 * Hook to update an existing blog post
 * Requires user to be the owner of the post
 * Uses JWT from Authorization header for authentication
 */
const useUpdateBlogPost = (
  options: UseMutationOptions<UpdateBlogPostResponse, Error, unknown>,
) => {
  return useMutation({
    mutationKey: "updateBlogPost",
    mutationFn: async (payload: UpdateBlogPostPayload) => {
      console.log("[Update] Starting blog post update...");
      console.log("[Update] Payload:", JSON.stringify(payload, null, 2));
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

      // PUT request to update post (JWT token automatically added by axios interceptor)
      console.log("[Update] Sending update request to backend...");

      const updateUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/posts/${payload.postId}`;
      const updatePayload = {
        title: payload.title,
        ogText: payload.ogText,
        aiGenText: payload.aiGenText,
        images: payload.images,
      };

      console.log("[Update] Request URL:", updateUrl);
      console.log(
        "[Update] Request Payload:",
        JSON.stringify(updatePayload, null, 2),
      );

      try {
        const response = await axios.put(updateUrl, updatePayload);

        console.log("[Update] Blog post updated successfully:", response.data);

        return {
          postId:
            response.data.postId ||
            response.data.data?.postId ||
            payload.postId,
        };
      } catch (error: any) {
        console.error("[Update] Error details:", {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          message: error.message,
        });
        throw error;
      }
    },
    ...options,
  });
};

export default useUpdateBlogPost;
