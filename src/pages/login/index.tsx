import Input from "@/components/common/input";
import LockIcon from "@/components/icons/lock";
import SmsIcon from "@/components/icons/sms";
import { useRouter } from "next/router";
import { useState } from "react";
import { FaChevronLeft } from "react-icons/fa6";

export default function LoginPage() {
  const router = useRouter();
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleBack = () => {
    window.history.back();
  };

  const handleLogin = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.BASE_URL}/users/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userId,
          pwd: password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage =
          errorData.data?.message || errorData.message || "Login failed";

        // Show system alert
        alert("Login Error: " + errorMessage);
        return;
      }

      const loginData = await response.json();
      const userData = loginData.data;

      // Store login info
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("id", String(userData.id || ""));
      localStorage.setItem("userEmail", userData.email || "");
      localStorage.setItem("userId", userData.userId || "");
      localStorage.setItem("nickname", userData.nickname || "");
      localStorage.setItem("userBio", userData.bio || "");
      localStorage.setItem("userBlogName", userData.blogName || "");
      localStorage.setItem("userBirthYmd", userData.birthYmd || "");

      router.push("/");
    } catch (err) {
      const errorMessage = "An error occurred during login. Please try again.";
      alert("Login Error: " + errorMessage);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && userId && password && !loading) {
      handleLogin();
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
      className="flex h-screen flex-col items-center gap-5 overflow-y-auto bg-black-primary text-white-primary"
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
          <Input
            icon={<SmsIcon />}
            type="userId"
            placeholder="User ID"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <Input
            icon={<LockIcon />}
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={handleKeyPress}
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
            className={`h-[48px] w-full rounded-lg py-2 font-bold text-[#0C0C0DB2] transition-opacity ${
              !userId || !password || loading
                ? "cursor-not-allowed bg-[#5B578A] opacity-50"
                : "cursor-pointer bg-key-primary hover:opacity-90"
            }`}
            disabled={!userId || !password || loading}
            onClick={handleLogin}
          >
            {loading ? "Logging in..." : "Log in"}
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
