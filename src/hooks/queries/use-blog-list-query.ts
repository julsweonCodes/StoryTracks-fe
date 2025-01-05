import { useQuery } from "react-query";
import { BASE_URL } from "../utils/fetcher";

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

const useBlgoListQuery = () => {
  return useQuery<Blog[]>({
    queryKey: ["blog-list"],
    queryFn: () => fetch(`${BASE_URL}/blog/list`).then((res) => res.json()),
  });
};

export default useBlgoListQuery;
