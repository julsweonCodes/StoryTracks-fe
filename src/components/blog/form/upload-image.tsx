import { useFormContext } from "@/context/form-context";
import { RiLightbulbFlashLine } from "react-icons/ri";
import { IoClose } from "react-icons/io5";
import UtilBar from "@/components/common/util-bar";
import MagicIcon from "@/components/icons/magic";

// interface Image {
//   name: string;
//   url: string;
//   isValid: boolean;
//   gpsLatitude: typeof gps;
//   createDate: string;
// }

export default function UploadImage() {
  const { setActiveComponentKey, setStatusInfo } = useFormContext();
  // const [images, setImages] = useState<Image[]>([]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    void e;
    // setLoadingText({
    //   title: "Verifying Images",
    //   description: "Checking if the images contain eligible metadata.",
    // });
    setStatusInfo({
      type: "loading",
      title: "Verifying Images",
      description: "Checking if the images contain eligible metadata.",
    });
    // const files = e.target.files;
    // if (!files) return;

    // const imageData: Image[] = [];

    // for (const file of files) {
    //   const metadata = await exifr.parse(file);
    //   const isValid = metadata?.GPSLatitude && metadata?.CreateDate;

    //   const formData = new FormData();
    //   formData.append("file", files[0]); // "file" 키 이름 사용

    //   try {
    //     const response = await fetch("/api/upload", {
    //       method: "POST",
    //       body: formData,
    //     });

    //     if (response.ok) {
    //       const { url } = await response.json();
    //       console.log("Uploaded file URL:", url);
    //       imageData.push({
    //         name: file.name,
    //         url: url,
    //         isValid,
    //         gpsLatitude: metadata?.GPSLatitude,
    //         createDate: dayjs(metadata?.CreateDate).format(
    //           "YYYY-MM-DD HH:mm:ss",
    //         ),
    //       });
    // setStatusInfo({
    //   type: "success",
    //   title: "Successfully Verified",
    //   description:
    //     "3 images have been successfully verified and meet all the requirements.",
    // });
    //     } else {
    //       console.error("Failed to upload file");
    //     }
    //   } catch (error) {
    //     console.error("Error uploading file:", error);
    //   }
    // }

    // setImages((prev) => (prev ? [...prev, ...imageData] : imageData));

    setTimeout(() => {
      setStatusInfo({
        type: "success",
        title: "Successfully Verified",
        description:
          "3 images have been successfully verified and meet all the requirements.",
      });
    }, 3000);

    setTimeout(() => {
      setStatusInfo({ type: undefined });
      setActiveComponentKey("description");
    }, 5000);
  };

  return (
    <>
      <div className="relative mb-[48px] flex h-full flex-col gap-5 p-5">
        <input
          type="text"
          className="h-[36px] w-full border-b border-[#7A7A7A] bg-black-primary text-[24px] text-white-primary placeholder:text-[24px] placeholder:text-[#7A7A7A]"
          placeholder="Title"
        />
        <div className="flex w-full flex-col gap-3 rounded-lg bg-[#262626] p-3">
          <div className="flex items-start justify-between">
            <div className="flex h-[40px] w-[40px] items-center justify-center rounded-lg bg-black-secondary">
              <RiLightbulbFlashLine className="text-key-primary" size={20} />
            </div>
            <button>
              <IoClose size={20} />
            </button>
          </div>
          <div>
            <h4 className="text-[15px] font-medium">Try our new AI feature!</h4>
            <p className="text-[12px] tracking-tight text-black-tertiary">
              Select a photo to upload with a brief description. The new AI
              feature makes blog posting easier and more convenient!
            </p>
          </div>
          <div className="flex h-[48px] w-full items-center justify-center rounded-lg bg-key-primary text-[13px]">
            <label
              htmlFor="file-upload"
              className="flex items-center justify-center gap-2 text-black-primary"
            >
              <MagicIcon />
              Generate Content with AI
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
      </div>
      <UtilBar />
    </>
  );
}
