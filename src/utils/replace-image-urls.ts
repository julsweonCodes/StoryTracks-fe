import { ImageInfo } from "@/context/form-context";

/**
 * Extracts image file names from <img>fileName</img> tags in content
 * Returns mapping of original file names to S3 file names
 *
 * @param content - Blog post content with <img>fileName</img> tags
 * @param s3FileNames - Array of S3 file names from upload response
 * @param images - Array of ImageInfo objects (local images)
 * @returns Object mapping original file names to S3 file names
 *
 * Example:
 * - Original content: "<img>photo.jpg</img>"
 * - S3 response: ["1698765432000_photo.jpg"]
 * - Returns: { "photo.jpg": "1698765432000_photo.jpg" }
 */
export const createImageNameMapping = (
  content: string,
  s3FileNames: string[],
  images: ImageInfo[],
): { [key: string]: string } => {
  const mapping: { [key: string]: string } = {};

  // Extract all <img>fileName</img> tags from content
  const imageTagRegex = /<img>(.+?)<\/img>/g;
  let match;
  let uploadedIndex = 0;

  while ((match = imageTagRegex.exec(content)) !== null) {
    const originalFileName = match[1];

    // Find the corresponding image in the images array
    const imageInfo = images.find(
      (img) =>
        img.fileName === originalFileName ||
        img.imgFileName === originalFileName,
    );

    if (imageInfo && uploadedIndex < s3FileNames.length) {
      // Map original file name to S3 file name
      const s3FileName = s3FileNames[uploadedIndex];
      mapping[originalFileName] = s3FileName;
      console.log(`[Mapping] ${originalFileName} -> ${s3FileName}`);
      uploadedIndex++;
    }
  }

  return mapping;
};

/**
 * Replaces <img>fileName</img> tags with S3 file names in content
 * This prepares the content for backend storage
 *
 * @param content - Blog post content with <img>fileName</img> tags
 * @param imageNameMapping - Mapping of original file names to S3 file names
 * @returns Content with file names replaced with S3 file names
 *
 * Example:
 * Input: "<img>photo.jpg</img>"
 * Mapping: { "photo.jpg": "1698765432000_photo.jpg" }
 * Output: "<img>1698765432000_photo.jpg</img>"
 */
export const replaceImageNamesWithS3Names = (
  content: string,
  imageNameMapping: { [key: string]: string },
): string => {
  let result = content;

  Object.entries(imageNameMapping).forEach(([originalName, s3Name]) => {
    const imageTag = `<img>${originalName}</img>`;
    const s3ImageTag = `<img>${s3Name}</img>`;
    result = result.replace(new RegExp(imageTag, "g"), s3ImageTag);
  });

  return result;
};

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
  s3BaseUrl: string,
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
 * Extracts original filename from S3 timestamped filename
 * Backend stores files as: 1763882165078_IMG_5717.JPG
 * We need only the part after the first underscore: IMG_5717.JPG
 *
 * @param s3FileName - Full S3 filename (e.g., "1763882165078_IMG_5717.JPG")
 * @returns Original filename (e.g., "IMG_5717.JPG")
 */
export const extractOriginalFileName = (s3FileName: string): string => {
  const underscoreIndex = s3FileName.indexOf("_");
  if (underscoreIndex === -1) {
    return s3FileName;
  }
  return s3FileName.substring(underscoreIndex + 1);
};

/**
 * Image response type from backend /api/v1/posts/{id}
 */
export interface ImageResponse {
  imgId: number;
  postId: number;
  geoLat: string;
  geoLong: string;
  imgPath: string; // e.g., "posts/1763882165078_IMG_5717.JPG"
  imgFileName?: string; // e.g., "IMG_5717.JPG"
  fileName?: string; // e.g., "IMG_5717.JPG" (alternative field name)
  imgDtm: string;
  rgstDtm: string;
  thumbYn?: boolean | string;
  filePath?: string;
}

/**
 * Converts <img>imgFileName</img> tags to full S3 URLs for display
 * Called when loading blog post data from GET endpoint
 * Replaces image file names with full S3 URLs dynamically
 *
 * @param content - The blog post content with <img>imgFileName</img> tags (e.g., "<img>IMG_5717.JPG</img>")
 * @param blogImgList - Array of ImageResponse from backend POST detail API
 * @param s3BaseUrl - Base URL of S3 bucket (from environment)
 * @returns Content with image tags replaced with full S3 URLs
 *
 * Example:
 * Input content: "<img>IMG_5717.JPG</img>"
 * Image from backend:
 *   - fileName: "IMG_5717.JPG" or imgFileName: "IMG_5717.JPG"
 *   - imgPath: "posts/1763882165078_IMG_5717.JPG"
 * S3 Base URL: "https://storytracks-ap-storage.s3.ap-southeast-2.amazonaws.com/"
 * Output: "<img src="https://storytracks-ap-storage.s3.ap-southeast-2.amazonaws.com/posts/1763882165078_IMG_5717.JPG">"
 */
export const replaceImageFileNamesWithS3Urls = (
  content: string,
  blogImgList: ImageResponse[],
  s3BaseUrl: string,
): string => {
  let result = content;

  // For each image in the blog image list
  blogImgList.forEach((image) => {
    // Get the image file name (could be either imgFileName or fileName)
    const imageFileName = image.imgFileName || image.fileName || "";
    if (!imageFileName) {
      console.warn(
        "[replaceImageFileNamesWithS3Urls] No fileName found for image:",
        image,
      );
      return;
    }

    // Escape special regex characters in filename (important for filenames with spaces, dots, etc.)
    const escapedFileName = imageFileName.replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&",
    );

    // Find <img>imgFileName</img> tag - use /\s*/g to handle spaces around tags
    const imageTagPattern = new RegExp(
      `<img>\\s*${escapedFileName}\\s*</img>`,
      "g",
    );
    // Construct full S3 URL
    const s3Url = `${s3BaseUrl}${image.imgPath}`;
    const urlImageTag = `<img src="${s3Url}">`;

    console.log(
      `[replaceImageFileNamesWithS3Urls] Trying to match pattern: <img>\\s*${escapedFileName}\\s*</img>`,
    );
    console.log(
      `[replaceImageFileNamesWithS3Urls] Pattern matches:`,
      imageTagPattern.test(content),
    );
    console.log(
      `[replaceImageFileNamesWithS3Urls] Replacing with: ${urlImageTag}`,
    );

    // Replace all occurrences
    const beforeReplace = result;
    result = result.replace(imageTagPattern, urlImageTag);

    if (beforeReplace !== result) {
      console.log(
        `[replaceImageFileNamesWithS3Urls] ✓ Successfully replaced ${imageFileName}`,
      );
    } else {
      console.warn(
        `[replaceImageFileNamesWithS3Urls] ✗ No match found for ${imageFileName}`,
      );
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
  images: ImageInfo[],
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
