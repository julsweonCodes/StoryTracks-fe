import { useQuery } from "react-query";
import { DefaultResponse } from "../utils/fetcher";
import { markdownToPlainText } from "@/utils/markdown-to-plain-text";

interface PaginatedBlogResponse {
  content: Blog[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
  };
  totalPages: number;
  totalElements: number;
  last: boolean;
  size: number;
  number: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  numberOfElements: number;
  first: boolean;
  empty: boolean;
}

export interface ProcessedBlog {
  postId: number;
  title: string;
  src: string;
  des: string;
  rgstDtm: string;
}

interface Blog {
  postId: number;
  title: string;
  ogText: string | null;
  aiGenText: string;
  // password: string;
  rgstDtm: string; // ISO 8601 format from Java OffsetDateTime
  chngDtm: string | null; // ISO 8601 format from Java OffsetDateTime
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
    queryFn: () =>
      fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/posts/feed`)
        .then((res) => res.json())
        .then((response: PaginatedBlogResponse) => response.content),
  });
};

// Google Maps LatLngLiteral 타입 변환 함수
const mapToLatLng = (blogs?: Blog[]): google.maps.LatLngLiteral[] => {
  return (
    blogs?.map((blog) => ({
      lat: blog.thumbHash ? parseFloat(blog.thumbHash.thumbGeoLat) : 37.7749,
      lng: blog.thumbHash ? parseFloat(blog.thumbHash.thumbGeoLong) : -122.4194,
    })) || []
  );
};

const processBlogs = async (blogs?: Blog[]): Promise<ProcessedBlog[]> => {
  if (!blogs) return [];

  const processedBlogs = await Promise.all(
    blogs.map(async (blog) => ({
      postId: blog.postId,
      title: blog.title,
      src: `${process.env.NEXT_PUBLIC_S3_BASE_URL}${blog.thumbHash?.thumbImgPath || ""}`,
      des: await markdownToPlainText(blog.aiGenText),
      rgstDtm: blog.rgstDtm,
    })),
  );

  return processedBlogs;
};

export { usePostsListQuery, mapToLatLng, processBlogs };
