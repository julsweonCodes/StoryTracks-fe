/**
 * S3 Image Upload Service
 * Handles uploading images to AWS S3 and returns file names
 */

import axios from "axios";

const S3_UPLOAD_ENDPOINT = `${process.env.NEXT_PUBLIC_BASE_URL}/s3/upload/blog-images`;
const S3_PROFILE_UPLOAD_ENDPOINT = `${process.env.NEXT_PUBLIC_BASE_URL}/s3/upload/profile`;

export interface S3UploadResponse {
  success: boolean;
  data: string[]; // Array of S3 file names (e.g., ["1698765432000_photo.jpg", ...])
}

/**
 * Sanitize filename by replacing spaces with underscores (client-side)
 * Best practice for URLs and file handling
 * Replaces non-ASCII characters (Korean, special chars, etc.) with random letters
 */
const sanitizeFileName = (fileName: string): string => {
  // Get file extension
  const lastDotIndex = fileName.lastIndexOf(".");
  const extension = lastDotIndex !== -1 ? fileName.substring(lastDotIndex) : "";
  const nameWithoutExt =
    lastDotIndex !== -1 ? fileName.substring(0, lastDotIndex) : fileName;

  // Helper to generate random letter
  const randomLetter = () => {
    const letters = "abcdefghijklmnopqrstuvwxyz";
    return letters[Math.floor(Math.random() * letters.length)];
  };

  // Replace spaces with underscores
  // Replace non-ASCII characters (Korean, etc.) with random letters
  const sanitized = nameWithoutExt
    .replace(/\s+/g, "_") // spaces to underscores
    .replace(/[^\x00-\x7F]/g, () => randomLetter()) // non-ASCII to random letters
    .replace(/[^a-zA-Z0-9_-]/g, () => randomLetter()) // other special chars to random letters
    .replace(/^[^a-zA-Z0-9]+|[^a-zA-Z0-9]+$/g, ""); // trim non-alphanumeric from start/end

  // If sanitization removed everything, use timestamp
  const finalName = sanitized || `file_${Date.now()}`;

  return finalName + extension;
};

/**
 * Upload images to S3
 * @param files - Array of File objects to upload
 * @returns Promise<string[]> - Array of S3 file names
 */
export const uploadImagesToS3 = async (files: File[]): Promise<string[]> => {
  if (!files || files.length === 0) {
    return [];
  }

  console.log(`[S3] Uploading ${files.length} image(s) to S3...`);

  const formData = new FormData();
  files.forEach((file) => {
    // Sanitize the filename before sending to backend
    const sanitizedFileName = sanitizeFileName(file.name);
    const sanitizedFile = new File([file], sanitizedFileName, {
      type: file.type,
    });
    console.log(
      `[S3] Appending file: ${sanitizedFileName}, size: ${sanitizedFile.size}, type: ${sanitizedFile.type}`,
    );
    formData.append("files", sanitizedFile);
  });

  // Debug: Check FormData contents
  console.log("[S3] FormData entries:");
  for (const [key, value] of formData.entries()) {
    if (value instanceof File) {
      console.log(
        `  ${key}: File(${value.name}, ${value.size} bytes, ${value.type})`,
      );
    } else {
      console.log(`  ${key}:`, value);
    }
  }

  try {
    const response = await axios.post<S3UploadResponse>(
      S3_UPLOAD_ENDPOINT,
      formData,
      {
        headers: {
          // Let browser set Content-Type with boundary
          // This is redundant but explicit
        },
      },
    );

    console.log("[S3] Upload successful, file names:", response.data.data);

    return response.data.data; // Returns array of S3 file names
  } catch (error: any) {
    console.error("[S3] Upload failed:", error);
    console.error("[S3] Error response:", error.response?.data);
    console.error("[S3] Error status:", error.response?.status);
    console.error("[S3] Error headers:", error.response?.headers);
    throw error;
  }
};

/**
 * Upload profile image to S3
 * @param file - File object to upload
 * @returns Promise<string> - S3 file name
 */
export const uploadProfileImageToS3 = async (file: File): Promise<string> => {
  if (!file) {
    throw new Error("No file provided");
  }

  console.log("[S3] Uploading profile image to S3...");

  const formData = new FormData();
  const sanitizedFileName = sanitizeFileName(file.name);
  const sanitizedFile = new File([file], sanitizedFileName, {
    type: file.type,
  });
  formData.append("file", sanitizedFile);

  try {
    const response = await axios.post<{ data: string }>(
      S3_PROFILE_UPLOAD_ENDPOINT,
      formData,
    );

    const fileName = response.data.data;
    console.log("[S3] Profile upload successful, file name:", fileName);

    return fileName;
  } catch (error) {
    console.error("[S3] Profile upload failed:", error);
    throw error;
  }
};
