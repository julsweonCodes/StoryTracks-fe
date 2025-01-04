import { useFormContext } from "@/context/form-context";
import { useEffect, useState } from "react";
import exifr, { gps } from "exifr";
import dayjs, { Dayjs } from "dayjs";
import { FiX } from "react-icons/fi";

interface Image {
  name: string;
  url: string;
  isValid: boolean;
  gpsLatitude: typeof gps;
  createDate: string;
}

export default function UploadImage() {
  const { setActiveComponentKey } = useFormContext();
  const [images, setImages] = useState<Image[]>([]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const imageData: Image[] = [];

    for (const file of files) {
      const metadata = await exifr.parse(file);
      const isValid = metadata?.GPSLatitude && metadata?.CreateDate;

      const formData = new FormData();
      formData.append("file", files[0]); // "file" 키 이름 사용

      try {
        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          const { url } = await response.json();
          console.log("Uploaded file URL:", url);
          imageData.push({
            name: file.name,
            url: url,
            isValid,
            gpsLatitude: metadata?.GPSLatitude,
            createDate: dayjs(metadata?.CreateDate).format(
              "YYYY-MM-DD HH:mm:ss",
            ),
          });
        } else {
          console.error("Failed to upload file");
        }
      } catch (error) {
        console.error("Error uploading file:", error);
      }
    }

    setImages((prev) => (prev ? [...prev, ...imageData] : imageData));
  };

  useEffect(() => {
    console.log("images: ", images);
  }, [images]);

  return (
    <div className="flex h-full flex-col items-center justify-center p-5">
      <div className="w-full flex-1 overflow-hidden">
        {images.length === 0 ? (
          <div className="flex h-full w-full flex-col items-center justify-center">
            <div className="h-36 w-full">
              <label
                htmlFor="file-upload"
                className="flex h-full w-full cursor-pointer items-center justify-center rounded-lg bg-green-500 px-6 py-3 font-semibold text-white shadow-md transition duration-300 hover:bg-green-600"
              >
                Upload Files
              </label>
              <input
                id="file-upload"
                type="file"
                multiple
                accept="image/*, .heic"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          </div>
        ) : (
          <div className="grid h-full w-full grid-cols-3 gap-4 overflow-y-auto">
            {images.map((image, index) => (
              <div
                key={index}
                className="relative aspect-square rounded-lg bg-green-300"
              >
                <img
                  src={image.url}
                  alt={image.name}
                  className="h-full w-full rounded object-cover"
                />
                <div className="absolute right-0 top-0 p-2">
                  <div
                    className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-black"
                    onClick={() => {
                      setImages((prev) => prev.filter((_, i) => i !== index));
                    }}
                  >
                    <FiX className="text-white" />
                  </div>
                </div>
              </div>
            ))}
            <div className="aspect-square rounded-lg bg-green-300">
              <label
                htmlFor="file-upload"
                className="flex h-full w-full cursor-pointer items-center justify-center rounded-lg bg-green-500 px-6 py-3 font-semibold text-white shadow-md transition duration-300 hover:bg-green-600"
              >
                +
              </label>
              <input
                id="file-upload"
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          </div>
        )}
      </div>
      <div className="grid h-20 w-full grid-cols-2 gap-5 bg-red-300 p-2">
        <div
          className="col-span-1 col-start-2 flex cursor-pointer items-center justify-center rounded-lg bg-slate-400"
          onClick={() => setActiveComponentKey("description")}
        >
          Next
        </div>
      </div>
    </div>
  );
}
