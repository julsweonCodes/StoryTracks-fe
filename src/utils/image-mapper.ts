import {
  ImageInfo,
  ImageResponse,
  PostDetailResponse,
} from "@/context/form-context";

/**
 * Converts backend ImageResponse to frontend ImageInfo
 * Handles the field name differences:
 * - Backend: imgFileName → Frontend: fileName (for display)
 * - Backend: geoLat/geoLong (strings) → Frontend: lat/lon (optional numbers)
 */
export const convertImageResponseToImageInfo = (
  imgResponse: ImageResponse,
): ImageInfo => {
  return {
    imgId: imgResponse.imgId,
    postId: imgResponse.postId,
    imgPath: imgResponse.imgPath,
    imgFileName: imgResponse.imgFileName,
    fileName: imgResponse.imgFileName, // Map for local use
    geoLat: imgResponse.geoLat,
    geoLong: imgResponse.geoLong,
    lat: parseFloat(imgResponse.geoLat) || 0,
    lon: parseFloat(imgResponse.geoLong) || 0,
    thumbYn: imgResponse.thumbYn,
    imgDtm: imgResponse.imgDtm,
    rgstDtm: imgResponse.rgstDtm,
    filePath: imgResponse.filePath,
    previewUrl: imgResponse.filePath, // Use S3 URL as preview
    active: imgResponse.thumbYn === true,
  };
};

/**
 * Converts backend PostDetailResponse to frontend form context values
 * Extracts images, title, and content for editing
 */
export const convertPostDetailResponseToFormData = (
  postResponse: PostDetailResponse,
): {
  title: string;
  description: string;
  images: ImageInfo[];
  aiContent: string;
} => {
  return {
    title: postResponse.title,
    description: postResponse.ogText, // Backend: ogText → Frontend: description
    images: postResponse.blogImgList.map(convertImageResponseToImageInfo),
    aiContent: postResponse.aiGenText || "", // Backend: aiGenText → Frontend: aiContent
  };
};
