import { ImageInfo } from "@/context/form-context";

/**
 * Replaces <img>fileName</img> tags with S3 URLs
 * 
 * @param content - The blog post content with <img>fileName</img> tags
 * @param images - Array of ImageInfo objects with S3 paths
 * @param s3BaseUrl - Base URL of S3 bucket (from .env)
 * @returns Content with image tags replaced with S3 URLs
 * 
 * Example:
 * Input: "<img>Screenshot.png</img>"
 * Output: "<img-url>https://bucket.s3.amazonaws.com/posts/1698765432000_Screenshot.png</img-url>"
 */
export const replaceImageUrlsInContent = (
  content: string,
  images: ImageInfo[],
  s3BaseUrl: string
): string => {
  let result = content;

  images.forEach((image) => {
    // Only replace if we have the S3 path
    if (image.imgPath) {
      // Try both fileName (local) and imgFileName (from backend)
      const displayName = image.fileName || image.imgFileName;
      if (!displayName) return;

      const imageTag = `<img>${displayName}</img>`;
      const s3Url = `${s3BaseUrl}/${image.imgPath}`;
      const urlImageTag = `<img-url>${s3Url}</img-url>`;

      // Replace all occurrences
      result = result.replace(new RegExp(imageTag, "g"), urlImageTag);
    }
  });

  return result;
};

/**
 * Replaces <img-url>S3_URL</img-url> tags back to <img>fileName</img> for editing
 * Useful when loading saved content back into the editor
 * 
 * @param content - The blog post content with <img-url>URL</img-url> tags
 * @param images - Array of ImageInfo objects with filenames
 * @returns Content with URL tags converted back to filename tags
 */
export const convertUrlTagsToFilenames = (
  content: string,
  images: ImageInfo[]
): string => {
  let result = content;

  images.forEach((image) => {
    if (image.imgPath) {
      const displayName = image.fileName || image.imgFileName;
      if (!displayName) return;

      const s3BaseUrl = process.env.NEXT_PUBLIC_S3_BASE_URL;
      const fullUrl = `${s3BaseUrl}/${image.imgPath}`;
      const urlImageTag = `<img-url>${fullUrl}</img-url>`;
      const imageTag = `<img>${displayName}</img>`;

      // Replace all occurrences
      result = result.replace(new RegExp(urlImageTag, "g"), imageTag);
    }
  });

  return result;
};

