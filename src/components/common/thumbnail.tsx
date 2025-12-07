import Image from "next/image";
import { IoClose } from "react-icons/io5";

interface Props {
  id: string;
  src: string;
  onRemove?: (id: string) => void;
}

export default function Thumbnail({ id, src, onRemove }: Props) {
  const handleRemove = () => {
    if (onRemove) {
      onRemove(id);
    }
  };

  return (
    <div className="relative aspect-square h-full overflow-hidden rounded-lg">
      <Image
        src={src}
        alt="thumbnail"
        layout="fill"
        objectFit="cover"
        objectPosition="center"
      />
      {onRemove && (
        <div
          className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black-secondary"
          onClick={handleRemove}
        >
          <IoClose />
        </div>
      )}
    </div>
  );
}
