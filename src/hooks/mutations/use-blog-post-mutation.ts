import { useMutation, UseMutationOptions } from "react-query";
import { BASE_URL, DefaultResponse } from "../utils/fetcher";

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
}

const useBlogPostMutation = (
  options: UseMutationOptions<
    DefaultResponse<BlogPostResponse>,
    Error,
    unknown
  >,
) => {
  return useMutation({
    mutationKey: "blogPost",
    mutationFn: async (data: BlogPost) => {
      const response = await fetch(`${BASE_URL}/blog/save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      return response.json();
    },
    ...options,
  });
};

export default useBlogPostMutation;
