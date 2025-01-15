import { useMutation, UseMutationOptions } from "react-query";
import { BASE_URL } from "../utils/fetcher";

interface BlogPostResponse {
  postId: string;
}

export interface ImageSaveInfo {
  fileName: string;
  geoLat: string;
  geoLong: string;
  imgDtm: string;
  thumbYn: "Y" | "N";
}

interface BlogPost {
  title: string;
  ogText: string;
  aiGenText: string;
  imgSaveList: ImageSaveInfo[];
  files: File[];
}

const useBlogPostMutation = (
  options: UseMutationOptions<BlogPostResponse, Error, unknown>,
) => {
  return useMutation({
    mutationKey: "blogPost",
    mutationFn: async (data: BlogPost) => {
      const formData = new FormData();

      /*// 텍스트 필드 추가
      formData.append("title", data.title);
      formData.append("ogText", data.ogText);
      formData.append("aiGenText", data.aiGenText);

      // 이미지 정보 추가
      data.imgSaveList.forEach((image, index) => {
        formData.append(`imgSaveList[${index}].fileName`, image.fileName);
        formData.append(`imgSaveList[${index}].geoLat`, image.geoLat);
        formData.append(`imgSaveList[${index}].geoLong`, image.geoLong);
        formData.append(`imgSaveList[${index}].imgDtm`, image.imgDtm);
        formData.append(`imgSaveList[${index}].thumbYn`, image.thumbYn);
      });*/

      const blogPost = {
        title: data.title,
        ogText: data.ogText,
        aiGenText: data.aiGenText,
        imgSaveList: data.imgSaveList, // imgSaveList 포함
      };

      // JSON 문자열로 변환하여 FormData에 추가
      formData.append("blogPost", JSON.stringify(blogPost));

      // 파일 추가
      if (data.files && data.files.length > 0) {
        data.files.forEach((file, index) => {
          formData.append(`files[${index}]`, file);
        });
      } else {
        console.error("No files found in the 'files' array");
      }

      for (const [key, value] of formData.entries()) {
        console.log("key", key);
        console.log("value", value);
        if (value instanceof File) {
          console.log(
            `${key}: ${value.name}, size: ${(value.size / 1024 / 1024).toFixed(2)} MB`,
          );
        } else {
          console.log(`${key}: ${value}`);
        }
      }

      const response = await fetch(`${BASE_URL}/blog/save`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload blog post");
      }

      return response.json();
    },
    ...options,
  });
};

export default useBlogPostMutation;
