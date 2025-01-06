import Thumbnail from "@/components/common/thumbnail";
import { Swiper, SwiperSlide } from "swiper/react";
import GallerySendIcon from "@/components/icons/gallery-send";
import { ImageInfo, useFormContext } from "@/context/form-context";
import exifr from "exifr";
import SwiperCore from "swiper";

import "swiper/css";
import "swiper/css/free-mode";

import { FreeMode } from "swiper/modules";
import { useEffect, useRef, useState } from "react";
import { convertToDecimal } from "@/utils/convert-to-decimal";

interface PreviewImage {
  id: string;
  url: string;
}

export default function UploadImage() {
  const { setStatusInfo, setImages, images, aiContent, activeComponentKey } =
    useFormContext();
  const swiperRef = useRef<SwiperCore | null>(null);
  const scrollTrackRef = useRef<HTMLDivElement>(null);
  const [scrollInfo, setScrollInfo] = useState({
    thumbWidth: 0,
    thumbLeft: 0,
  });

  useEffect(() => {
    if (!swiperRef.current || !scrollTrackRef.current) return;

    const updateScrollbar = () => {
      const swiper = swiperRef.current;
      const track = scrollTrackRef.current;
      if (!swiper || !track) return;

      const trackWidth = track.clientWidth;
      const slidesWidth =
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (swiper as any).virtualSize ?? swiper.slides.length * swiper.width;
      const viewportWidth = swiper.width;

      const ratio = Math.min(1, viewportWidth / slidesWidth);
      const thumbWidth = Math.max(40, trackWidth * ratio);

      const maxTravel = trackWidth - thumbWidth;
      const thumbLeft = swiper.progress * maxTravel;

      setScrollInfo({
        thumbWidth,
        thumbLeft,
      });
    };

    const swiper = swiperRef.current;

    updateScrollbar();

    swiper.on("progress", updateScrollbar);
    swiper.on("resize", updateScrollbar);
    swiper.on("slideChange", updateScrollbar);

    return () => {
      swiper.off("progress", updateScrollbar);
      swiper.off("resize", updateScrollbar);
      swiper.off("slideChange", updateScrollbar);
    };
  }, [images, activeComponentKey]);

  const createPreview = async (file: File): Promise<PreviewImage> => {
    return new Promise((resolve, reject) => {
      try {
        const reader = new FileReader();

        reader.onload = () => {
          if (typeof reader.result === "string") {
            resolve({
              id: `${file.name}-${Date.now()}`,
              url: reader.result,
            });
          }
        };

        reader.onerror = () => {
          reject(new Error("Failed to read file"));
        };

        reader.readAsDataURL(file);
      } catch (error) {
        reject(error);
      }
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const files = e.target.files;
      if (!files || files.length === 0) return;

      setStatusInfo({
        type: "loading",
        title: "Verifying Images",
        description: "Checking if the images contain eligible metadata.",
      });

      const fileArray = Array.from(files);
      const validFiles: ImageInfo[] = [];
      const invalidFiles: string[] = [];

      for (const file of fileArray) {
        const fileExtension = file.name.split(".").pop()?.toLowerCase();
        if (!["jpg", "jpeg", "png"].includes(fileExtension || "")) {
          invalidFiles.push(file.name);
          continue;
        }

        const metadata = await exifr.parse(file);
        if (!metadata?.CreateDate || !metadata?.GPSLatitude) {
          invalidFiles.push(file.name);
          continue;
        }

        const previewInfo = await createPreview(file);

        validFiles.push({
          id: previewInfo.id,
          fileName: file.name,
          createDate: metadata.CreateDate,
          lat: convertToDecimal(metadata.GPSLatitude, "N"),
          lon: convertToDecimal(metadata.GPSLongitude, "E"),
          previewUrl: previewInfo.url,
          active: false,
        });

        console.log("file", file);
      }

      if (invalidFiles.length > 0) {
        alert(
          `The following files were skipped due to invalid format or missing metadata:\n${invalidFiles.join("\n")}`,
        );
      }

      // const previewPromises = validFiles.map((fileInfo) => createPreview(fileInfo.file));
      // const newPreviews = await Promise.all(previewPromises);

      setImages((prev) => [...prev, ...validFiles]);

      setStatusInfo({
        type: "success",
        title: "Successfully Verified",
        description: `${validFiles.length} images have been successfully verified and meet all the requirements.`,
      });

      setTimeout(() => {
        setStatusInfo({ type: undefined });
      }, 2000);
    } catch (error) {
      console.error("Error processing files:", error);
      setStatusInfo({
        type: "error",
        title: "Error",
        description: "An error occurred while processing the images.",
      });
      setTimeout(() => {
        setStatusInfo({ type: undefined });
      }, 2000);
    }
  };

  const handleRemoveImage = (id: string) => {
    setImages((prev) => prev.filter((image) => image.id !== id));
  };

  const isAddImages = aiContent.length === 0;
  const isScroll = isAddImages ? images.length > 2 : images.length > 3;

  return (
    <div className="flex flex-col gap-2 rounded-lg bg-[#262626]">
      {images.length > 0 ? (
        <div className="px-4 py-4">
          <div className="relative flex w-full flex-col gap-2">
            <Swiper
              onSwiper={(swiper) => (swiperRef.current = swiper)}
              slidesPerView={3}
              spaceBetween={10}
              freeMode={true}
              modules={[FreeMode]}
              style={{ width: "100%", height: "100%" }}
            >
              {images.map((preview, index) => (
                <SwiperSlide key={index} className="aspect-square h-full">
                  <Thumbnail
                    src={preview.previewUrl as string}
                    id={preview.id as string}
                    onRemove={
                      aiContent.length > 0 ? undefined : handleRemoveImage
                    }
                  />
                </SwiperSlide>
              ))}
              {isAddImages && (
                <SwiperSlide className="aspect-square h-full">
                  <label
                    htmlFor="file-upload"
                    className="flex h-full w-full cursor-pointer items-center justify-center rounded-lg border border-dashed border-[#7A7A7A]"
                  >
                    <GallerySendIcon />
                  </label>
                  <input
                    id="file-upload"
                    type="file"
                    multiple
                    accept="jpeg, jpg, png"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </SwiperSlide>
              )}
            </Swiper>
            {isScroll && (
              <div
                ref={scrollTrackRef}
                className="relative h-[4px] w-full overflow-hidden"
              >
                <div
                  className="absolute h-full rounded-full bg-[#444444] transition-all duration-100"
                  style={{
                    width: `${scrollInfo.thumbWidth}px`,
                    left: `${scrollInfo.thumbLeft}px`,
                  }}
                />
              </div>
            )}
          </div>
        </div>
      ) : (
        <>
          <label
            htmlFor="file-upload"
            className="flex h-[130px] cursor-pointer flex-col items-center justify-center leading-5 tracking-tight text-[#7A7A7A]"
          >
            <GallerySendIcon />
            <h6 className="text-[13px] font-semibold">Click to upload</h6>
            <span className="text-[12px]">
              SVG, PNG, or JPG (max. 800x400px)
            </span>
          </label>
          <input
            id="file-upload"
            type="file"
            multiple
            accept="image/*, .heic"
            className="hidden"
            onChange={handleFileChange}
          />
        </>
      )}
    </div>
  );
}
