import UtilBar from "@/components/common/util-bar";
import Image from "next/image";
import { useState } from "react";

export default function Preview() {
  const [isDefaultLocation, setIsDefaultLocation] = useState<number>(0);
  const mockData = {
    title: "Notes from the Road: Everyday Travel Tales",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    image: ["/image1.jpeg", "/image2.jpeg", "/image3.jpeg"],
  };

  return (
    <>
      <div className="relative mb-[48px] flex h-full w-full flex-col gap-5 divide-y divide-black-secondary overflow-y-auto p-5">
        <h1 className="text-[24px]">{mockData.title}</h1>
        <div className="flex flex-col gap-5 pt-5">
          <div className="flex flex-col gap-3">
            {mockData.image.map((src, index) => (
              <div
                key={index}
                className={`relative ${index === isDefaultLocation ? "border-2 border-key-primary" : ""}`}
                onClick={() => setIsDefaultLocation(index)}
              >
                <Image
                  src={src}
                  alt="preview"
                  width={350}
                  height={350}
                  className="aspect-square w-full object-cover"
                />
                {index === isDefaultLocation && (
                  <div className="text-white absolute left-2 top-2 rounded-md bg-key-primary px-2 py-1 text-[12px] tracking-tight text-black-primary">
                    Set as Default Location
                  </div>
                )}
              </div>
            ))}
          </div>
          <div>
            <p className="text-[16px] leading-6 tracking-tight">
              {mockData.description}
            </p>
          </div>
        </div>
      </div>
      <UtilBar />
    </>
  );
}
