import Card from "@/components/common/card";
import Drawer from "@/components/common/drawer";
import Header from "@/components/common/header";
import Search from "@/components/common/search";
import Map from "@/components/map";
import { useState } from "react";

export default function Home() {
  const [isOpen, setIsOpen] = useState(false);

  const handleChange = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="flex h-full w-full flex-col">
      <div className="z-20">
        <Header />
        <Search />
      </div>
      <div className="relative flex h-full w-full flex-col">
        <div className="h-full w-full flex-1 overflow-hidden">
          <Map />
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
                Over 1,000 posts in Vancouver
              </span>
            </div>
          }
        >
          {[
            {
              id: 1,
              title: "Blog post title goes here",
              des: "Lorem ipsum dolor sit amet consectetur. Ornare nullam tincidunt diam id nisi feugiat vivamus in. Nunc congue gravida cursus amet posuerenunc in sagittis a.",
              src: "/image1.jpeg",
            },
            {
              id: 1,
              title: "Blog post title goes here",
              des: "Lorem ipsum dolor sit amet consectetur. Ornare nullam tincidunt diam id nisi feugiat vivamus in. Nunc congue gravida cursus amet posuerenunc in sagittis a.",
              src: "/image1.jpeg",
            },
            {
              id: 1,
              title: "Blog post title goes here",
              des: "Lorem ipsum dolor sit amet consectetur. Ornare nullam tincidunt diam id nisi feugiat vivamus in. Nunc congue gravida cursus amet posuerenunc in sagittis a.",
              src: "/image1.jpeg",
            },
          ].map((post, index) => (
            <Card
              key={index}
              id={post.id}
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
