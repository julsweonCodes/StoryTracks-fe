import { useRouter } from "next/router";

interface LoginProps {
  style?: React.CSSProperties; // style Prop 추가
}

export default function Login({ style }: LoginProps) {
  const router = useRouter();

  return (
      <div
        className="z-20 flex h-[48px] items-center justify-between gap-2 border-t border-t-black-secondary bg-black-primary"
      >
        <button
          className="text-white flex h-[10px] w-[94px] items-center justify-center gap-2 rounded-xl bg-transparent"
          style={{ color: "white", ...style }}
          onClick={() => router.push("/login")}
        >
          Log In
        </button>
      </div>
    );
}
