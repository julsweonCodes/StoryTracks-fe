import {
  usePostsListQuery,
  mapToLatLng,
  processBlogs,
  ProcessedBlog,
} from "@/hooks/queries/use-posts-list-query";
import Card from "@/components/common/card";
import Drawer from "@/components/common/drawer";
import Header from "@/components/common/header";
import Search from "@/components/common/search";
import SEOHeader from "@/components/common/seo-header";
import Map from "@/components/map";
import { useEffect, useState } from "react";

const formatNumber = (num?: number): string => {
  return num?.toLocaleString() || "0";
};

export default function Home() {
  const [isOpen, setIsOpen] = useState(false);
  const { data } = usePostsListQuery();
  const [processedData, setProcessedData] = useState<ProcessedBlog[]>([]);

  const handleChange = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    if (data) {
      processBlogs(data).then(setProcessedData);
    }
  }, [data]);

  return (
    <div className="flex h-full w-full flex-col">
      <SEOHeader
        title="Story Track - Discover and Share Your Stories"
        description="Welcome to Story Track, the ultimate platform for discovering, sharing, and keeping track of your stories. Join now to explore endless possibilities."
      />
      <div className="z-20">
        <Header />
        <Search />
      </div>
      <div className="relative flex h-full w-full flex-col">
        <div className="h-full w-full flex-1 overflow-hidden">
          <Map markers={mapToLatLng(data)} />
        </div>
        <Drawer
          isOpen={isOpen}
          button={
            <div
              onClick={handleChange}
              className="text-white flex h-[62px] cursor-pointer flex-col items-center justify-between rounded rounded-t-3xl bg-black-primary px-4 py-2"
            >
              <div className="h-[4px] w-[40px] rounded-full bg-white-primary" />
              <span className="text-[14px] text-white-primary">
                Over {formatNumber(data?.length || 0)} posts in Vancouver
              </span>
            </div>
          }
        >
          {processedData?.map((post, index) => (
            <Card
              key={index}
              id={post.postId}
              title={post.title}
              description={post.des}
              src={post.src}
            />
          ))}
        </Drawer>
      </div>
    </div>
  );
}
