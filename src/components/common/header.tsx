import { useState, useEffect } from "react";
import MapIcon from "../icons/map";
import MenuIcon from "../icons/menu";
import Login from "./login";
import { FaUserCircle } from "react-icons/fa";

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false); // 로그인 상태 관리

  useEffect(() => {
    // localStorage에서 로그인 여부 확인
    const loggedInStatus = localStorage.getItem("isLoggedIn");
    setIsLoggedIn(loggedInStatus === "true");
  }, []);

  return (
    <header className="bg-black-primary text-key-primary flex h-[48px] items-center justify-between px-[16px]">
      <div className="flex items-center gap-1">
        <MapIcon />
        StoryTrack
      </div>
      <div className="flex items-center gap-2">
        <MenuIcon />
        {isLoggedIn ? (
          <div className="flex items-center gap-2">
            <FaUserCircle size={24} className="text-white" style={{ color: "white" }} />
            <span style={{ color: "white" }}>John</span>
          </div>
        ) : (
          <Login style={{ padding: "0px", margin: "0" }} />
        )}
      </div>
    </header>
  );
}