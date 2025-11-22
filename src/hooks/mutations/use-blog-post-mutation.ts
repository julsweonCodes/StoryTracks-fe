import { useMutation, UseMutationOptions } from "react-query";

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

      data.files.forEach((file, index) => {
        console.log(`files[${index}]`, file);
        formData.append(`files`, file);
      });

      // 텍스트 필드 추가
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
      });

      const blogPost = {
        title: data.title,
        ogText: data.ogText,
        aiGenText: data.aiGenText,
        imgSaveList: data.imgSaveList, // imgSaveList 포함
      };

      const jsonBlob = new Blob([JSON.stringify(blogPost)], {
        type: "application/json",
      });
      formData.append("blogPost", jsonBlob);

      const response = await fetch(`${process.env.BASE_URL}/blog/save`, {
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
