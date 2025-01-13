import Input from "@/components/common/input";
import LockIcon from "@/components/icons/lock";
import SmsIcon from "@/components/icons/sms";
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
    // if (email === "admin" && password === "1234") {
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("userEmail", email);
    router.push("/");
    // } else {
    //   setError("Invalid email or password.");
    // }
  };

  const handleForgotPassword = () => {
    router.push("/forgot-password");
  };

  const handleSignUp = () => {
    router.push("/signup");
  };

  return (
    <div
      className="flex min-h-screen flex-col items-center gap-5 bg-black-primary text-white-primary"
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
      <div className="flex w-[90%] flex-col gap-5">
        <div>
          <div className="relative flex items-center justify-center">
            <h1 className="text-[22px] font-bold">Welcome Back! 👋</h1>
          </div>
          <p className="text-center text-[15px] text-gray-400">
            Let’s transform your ideas into shareable content.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Input
            icon={<SmsIcon />}
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            icon={<LockIcon />}
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="text-right">
            <button
              className="hover:text-white text-[13px] tracking-normal text-white-primary"
              onClick={handleForgotPassword}
            >
              Forgot Password?
            </button>
          </div>
          <button
            className={`h-[48px] w-full rounded-lg py-2 font-bold text-[#0C0C0DB2] ${!email || !password ? "bg-[#5B578A]" : "bg-key-primary"}`}
            disabled={!email || !password}
            onClick={handleLogin}
          >
            Log in
          </button>
          <p className="text-center text-[13px] text-gray-400">
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
    </div>
  );
}
