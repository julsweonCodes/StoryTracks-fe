import { useRouter } from "next/router";
import { useState } from "react";
import { FaChevronLeft } from "react-icons/fa6";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(""); // 에러 메시지 상태

  const handleBack = () => {
    window.history.back();
  };

  const handleLogin = () => {
    // 예제 로직: 로컬 스토리지를 이용한 간단한 로그인
    if (email !== "john@storytracks.com" && password !== "1234") {
      // 로컬 스토리지에 로그인 상태 저장
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("userEmail", email);
      router.push("/"); // 홈으로 이동
    } else {
      setError("Invalid email or password.");
    }
  };

  const handleForgotPassword = () => {
    router.push("/forgot-password");
  };

  const handleSignUp = () => {
    router.push("/signup");
  };

  return (
    <div
      className="bg-black-primary text-white-primary min-h-screen flex flex-col items-center"
      style={{ position: "relative" }}
    >
      <div
        className="relative mx-4 mb-2 mt-3 flex items-center justify-center"
        style={{
          position: "absolute", // 상단에 고정
          top: 0, // 화면 상단에 위치
          left: 0,
          right: 0,
        }}
      >
        <div
          className="absolute top-10 left-0 flex h-[40px] w-[40px] items-center justify-center rounded-lg bg-[#262626]"
          onClick={handleBack}
        >
          <FaChevronLeft />
        </div>
      </div>

      {/* 나머지 내용 */}
      <div
        className="w-[90%] max-w-[400px]"
        style={{ marginTop: "200px" }} // 상단 여백 추가
      >
      <div
        className="relative mx-4 mb-2 mt-3 flex items-center justify-center"
        style={{
          position: "absolute", // 상단에 고정
          top: 120, // 화면 상단에 위치
          left: 0,
          right: 0,
        }}
      >
        <h1 className="text-[30px] font-bold">Welcome Back! 👋</h1>
      </div>
      <p className="mb-4 text-gray-400 text-center">
        Let’s transform your ideas into shareable content.
      </p>

        {error && <p className="mb-4 text-sm text-red-500">{error}</p>}
        <div className="mb-4 flex items-center rounded-lg bg-[#262626] px-4 py-2">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-transparent pl-2 text-white focus:outline-none"
          />
        </div>
        <div className="mb-2 flex items-center rounded-lg bg-[#262626] px-4 py-2">
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-transparent pl-2 text-white focus:outline-none"
          />
        </div>
        <div className="mb-6 text-right">
          <button
            className="text-sm text-gray-400 hover:text-white"
            onClick={handleForgotPassword}
          >
            Forgot Password?
          </button>
        </div>
        <button
          className="w-full rounded-lg bg-key-primary py-2 text-black-primary font-bold"
          onClick={handleLogin}
        >
          Log in
        </button>
        <p className="mt-4 text-center text-gray-400">
          Don’t Have an Account?{" "}
          <span
            className="text-key-primary cursor-pointer"
            onClick={handleSignUp}
          >
            Sign up
          </span>
        </p>
      </div>
    </div>
  );
}