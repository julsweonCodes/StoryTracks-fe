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

export default function Write() {
  const { setActiveComponentKey } = useFormContext();
  // const [images, setImages] = useState<Image[]>([]);

  const handleMoveToGenerator = () => {
    setActiveComponentKey("generator");
  };

  return (
    <>
      <UtilBar colorType="dark" />
      <div className="relative flex h-full flex-col gap-6 p-5">
        <div className="w-full border-b border-black-secondary pb-3">
          <input
            type="text"
            className="h-[36px] w-full bg-black-primary text-[24px] text-white-primary placeholder:text-[24px] placeholder:text-[#7A7A7A]"
            placeholder="Title"
          />
        </div>
        <div className="flex w-full flex-col gap-3 rounded-lg bg-gradient-to-br from-green-300 via-blue-300 to-pink-300 p-3 shadow-lg">
          <div className="flex items-start justify-between">
            <div className="flex h-[40px] w-[40px] items-center justify-center rounded-lg bg-[#262626]">
              <RiLightbulbFlashLine className="text-green-300" size={20} />
            </div>
            <button>
              <IoClose size={20} className="text-[#262626]" />
            </button>
          </div>
          <div>
            <h4 className="text-[15px] font-semibold text-black-primary">
              Try our new AI feature!
            </h4>
            <p className="text-[12px] tracking-tight text-black-primary">
              Select a photo to upload with a brief description. The new AI
              feature makes blog posting easier and more convenient!
            </p>
          </div>
          <button
            className="flex h-[48px] w-full items-center justify-center gap-2 rounded-lg bg-[#262626] text-[13px] text-white-primary"
            onClick={handleMoveToGenerator}
          >
            <MagicIcon color="#ffffff" />
            Generate Content with AI
            {/* <input
              id="file-upload"
              type="file"
              multiple
              accept="image/*, .heic"
              className="hidden"
              onChange={handleFileChange}
            /> */}
          </button>
        </div>
      </div>
    </>
  );
}
