import Image from "next/image";
import { useRouter } from "next/router";

interface Props {
  id: number;
  title: string;
  description: string;
  src: string;
}

export default function Card({ id, title, description, src }: Props) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/blog/${id}`);
  };

  return (
    <div className="flex flex-col gap-3" onClick={handleClick}>
      <div className="flex h-[310px] w-full items-center justify-center overflow-hidden rounded-xl">
        <Image
          src={src}
          width={320}
          height={320}
          alt={title}
          className="w-full rounded-xl"
          style={{
            objectFit: "cover",
            objectPosition: "center",
          }}
        />
      </div>
      <div>
        <h3 className="text-[14px] font-medium text-white-primary">
          Blog post title goes here
        </h3>
        <p className="line-clamp-2 text-[14px] text-[#717375]">
          Lorem ipsum dolor sit amet consectetur. Ornare nullam tincidunt diam
          id nisi feugiat vivamus in. Nunc congue gravida cursus amet posuere
          nunc in sagittis a.
        </p>
      </div>
    </div>
  );
}
