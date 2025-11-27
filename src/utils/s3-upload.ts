/**
 * S3 Image Upload Service
 * Handles uploading images to AWS S3 and returns file names
 */

const S3_UPLOAD_ENDPOINT = `${process.env.NEXT_PUBLIC_BASE_URL}/s3/upload/blog-images`;

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
    const sanitizedFile = new File([file], sanitizedFileName, { type: file.type });
    formData.append("files", sanitizedFile);
  });

  try {
    const response = await fetch(S3_UPLOAD_ENDPOINT, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to upload images to S3");
    }

    const data = (await response.json()) as S3UploadResponse;
    console.log("[S3] Upload successful, file names:", data.data);

    return data.data; // Returns array of S3 file names
  } catch (error) {
    console.error("[S3] Upload failed:", error);
    throw error;
  }
};
