import Card from "@/components/common/card";
import Drawer from "@/components/common/drawer";
import Header from "@/components/common/header";
import Search from "@/components/common/search";
import Map from "@/components/map";
import { useEffect, useState } from "react";

export default function Home() {
  const [isOpen, setIsOpen] = useState(false);

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
              onClick={() => setIsOpen(!isOpen)}
              className="bg-black-primary flex h-[63px] cursor-pointer flex-col items-center justify-between rounded rounded-t-3xl px-4 py-2 text-white"
            >
              <div className="bg-white-primary h-[4px] w-[40px] rounded-full" />
              <span className="text-white-primary">204 Blog Posts</span>
            </div>
          }
        >
          <div className="bg-black-primary h-full max-h-screen overflow-y-auto p-[18px]">
            <Card />
            <Card />
            <Card />
            <Card />
          </div>
        </Drawer>
      </div>
    </div>
  );
}
