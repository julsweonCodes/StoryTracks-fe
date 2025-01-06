import { useRouter } from "next/router";
import { useState } from "react";
import { FaChevronLeft } from "react-icons/fa6";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleBack = () => {
    window.history.back();
  };

  const handleLogin = () => {
    if (email === "john@storytracks.com" && password === "1234") {
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("userEmail", email);
      router.push("/");
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
      className="flex min-h-screen flex-col items-center bg-black-primary text-white-primary"
      style={{ position: "relative" }}
    >
      <div className="relative flex w-full items-center justify-start px-5 pt-5">
        <div
          className="flex h-[40px] w-[40px] items-center justify-center rounded-lg bg-[#262626]"
          onClick={handleBack}
        >
          <FaChevronLeft />
        </div>
      </div>
      <div className="w-[90%] max-w-[400px]">
        <div className="relative mx-4 mb-2 mt-3 flex items-center justify-center">
          <h1 className="text-[30px] font-bold">Welcome Back! 👋</h1>
        </div>
        <p className="mb-4 text-center text-[15px] text-gray-400">
          Let’s transform your ideas into shareable content.
        </p>

        {error && <p className="mb-4 text-sm text-red-500">{error}</p>}
        <div className="mb-4 flex items-center rounded-lg bg-[#262626] px-4 py-2">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="text-white w-full bg-transparent pl-2 focus:outline-none"
          />
        </div>
        <div className="mb-2 flex items-center rounded-lg bg-[#262626] px-4 py-2">
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="text-white w-full bg-transparent pl-2 focus:outline-none"
          />
        </div>
        <div className="mb-6 text-right">
          <button
            className="hover:text-white text-sm text-white-primary"
            onClick={handleForgotPassword}
          >
            Forgot Password?
          </button>
        </div>
        <button
          className={`w-full rounded-lg py-2 font-bold text-black-primary ${!email || !password ? "bg-[#5B578A]" : "bg-key-primary"}`}
          disabled={!email || !password}
          onClick={handleLogin}
        >
          Log in
        </button>
        <p className="mt-4 text-center text-gray-400">
          Don’t Have an Account?{" "}
          <span
            className="cursor-pointer text-key-primary"
            onClick={handleSignUp}
          >
            Sign up
          </span>
        </p>
      </div>
    </div>
  );
}
