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
 */
const sanitizeFileName = (fileName: string): string => {
  return fileName.replace(/\s+/g, "_");
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
    formData.append("files", sanitizedFile);
  });

  try {
    const response = await axios.post<S3UploadResponse>(
      S3_UPLOAD_ENDPOINT,
      formData,
    );

    console.log("[S3] Upload successful, file names:", response.data.data);

    return response.data.data; // Returns array of S3 file names
  } catch (error) {
    console.error("[S3] Upload failed:", error);
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
