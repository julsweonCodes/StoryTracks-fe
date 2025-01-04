import Drawer from "@/components/common/drawer";
import Header from "@/components/common/header";
import Search from "@/components/common/search";
import Map from "@/components/map";
import { useEffect, useState } from "react";

export default function Home() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    console.log("isOPen: ", isOpen);
  }, [isOpen]);

  return (
    <div className="flex h-full w-full flex-col">
      <div>
        <Header />
        <Search />
      </div>
      <div className="h-full w-full">
        <Map />
      </div>
      <div>
        <button
          onClick={() => setIsOpen(true)}
          className="rounded bg-blue-500 px-4 py-2 text-white"
        >
          Open Drawer
        </button>
        <Drawer isOpen={isOpen} onClose={() => setIsOpen(false)}>
          <h1 className="text-xl font-bold">Drawer Content</h1>
          <p>This is the content of the drawer.</p>
        </Drawer>
      </div>
      {/* <div className="absolute bottom-4 right-4">
        <div
          className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-blue-500"
          onClick={() => router.push("/blog/new")}
        >
          <FiPlus size={20} className="text-white" />
        </div>
      </div> */}
    </div>
  );
}
