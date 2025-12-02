import { useQuery } from "react-query";
import axios from "axios";
import { DefaultResponse } from "../utils/fetcher";

interface Image {
  imgId: number;
  postId: number;
  geoLat: string;
  geoLong: string;
  imgPath: string;
  imgFileName: string;
  imgDtm: string;
  rgstDtm: string;
  thumbYn: string | null;
  filePath?: string;
}

interface BlogDetail {
  postId: number;
  title: string;
  ogText: string;
  aiGenText: string;
  password?: string;
  rgstDtm: string; // ISO 8601 format from Java OffsetDateTime
  chngDtm: string | null; // ISO 8601 format from Java OffsetDateTime
  blogImgList: Image[];
  userId?: number; // User ID who created the post
  nickname?: string; // User who created the post (use this instead of userNickname)
  profileImg?: string; // Profile image of the user (use this instead of userProfileImg)
  // Fallback fields for compatibility
  userNickname?: string;
  userProfileImg?: string;
}

const usePostsDetailQuery = (id?: string) => {
  return useQuery<BlogDetail>({
    queryKey: ["blog-detail", id],
    queryFn: async () => {
      const response = await axios.get<DefaultResponse<BlogDetail>>(
        `${process.env.NEXT_PUBLIC_BASE_URL}/posts/${id}`,
      );
      return response.data.data;
    },
    enabled: !!id,
  });
};

export default usePostsDetailQuery;
