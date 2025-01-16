import { useQuery } from "react-query";
import { DefaultResponse } from "../utils/fetcher";
import { markdownToPlainText } from "@/utils/markdown-to-plain-text";

export interface ProcessedBlog {
  postId: number;
  title: string;
  src: string;
  des: string;
}

interface Blog {
  postId: number;
  title: string;
  ogText: string;
  aiGenText: string;
  password: string;
  rgstDtm: string;
  chngDtm: null;
  thumbHash: {
    thumbGeoLong: string;
    thumbImgPath: string;
    thumbImgId: string;
    thumbGeoLat: string;
  };
}

const usePostsListQuery = () => {
  return useQuery<Blog[]>({
    queryKey: ["blog-list"],
    queryFn: () => fetch(`${BASE_URL}/posts/list`).then((res) => res.json()),
  });
};

// Google Maps LatLngLiteral 타입 변환 함수
const mapToLatLng = (blogs?: Blog[]): google.maps.LatLngLiteral[] => {
  return (
    blogs?.map((blog) => ({
      lat: parseFloat(blog.thumbHash.thumbGeoLat),
      lng: parseFloat(blog.thumbHash.thumbGeoLong),
    })) || []
  );
};

const processBlogs = async (blogs?: Blog[]): Promise<ProcessedBlog[]> => {
  if (!blogs) return [];

  const processedBlogs = await Promise.all(
    blogs.map(async (blog) => ({
      postId: blog.postId,
      title: blog.title,
      src: blog.thumbHash.thumbImgPath,
      des: await markdownToPlainText(blog.aiGenText),
    })),
  );

  return processedBlogs;
};

export { usePostsListQuery, mapToLatLng, processBlogs };
