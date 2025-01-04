import { useRouter } from "next/router";
import { FiPlus } from "react-icons/fi";

export default function Home() {
  const router = useRouter();

  return (
    <div>
      <h1>Home</h1>
      <div className="absolute bottom-4 right-4">
        <div
          className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-blue-500"
          onClick={() => router.push("/blog/new")}
        >
          <FiPlus size={20} className="text-white" />
        </div>
      </div>
    </div>
  );
}
