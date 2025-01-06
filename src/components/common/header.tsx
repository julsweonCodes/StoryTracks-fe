import { useState, useEffect } from "react";
import MapIcon from "../icons/map";
import MenuIcon from "../icons/menu";
import Login from "./login";
import { useRouter } from "next/router";

import Avatar, { AvatarFullConfig, genConfig } from "react-nice-avatar";

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false); // 로그인 상태 관리
  const router = useRouter();
  const [config, setConfig] = useState<Required<AvatarFullConfig>>();

  useEffect(() => {
    setConfig(genConfig("John"));
  }, []);

  useEffect(() => {
    // localStorage에서 로그인 여부 확인
    const loggedInStatus = localStorage.getItem("isLoggedIn");
    setIsLoggedIn(loggedInStatus === "true");
  }, []);

  return (
    <header className="flex h-[48px] items-center justify-between bg-black-primary px-[16px] text-key-primary">
      <div className="flex items-center gap-1" onClick={() => router.push("/")}>
        <MapIcon />
        StoryTrack
      </div>
      <div className="flex items-center gap-2">
        <MenuIcon />
        {isLoggedIn ? (
          <div className="flex items-center gap-2">
            {/* <FaUserCircle
              size={24}
              className="text-white"
              style={{ color: "white" }}
            /> */}
            <Avatar className="h-[24px] w-[24px] md:h-24 md:w-24" {...config} />
            <span style={{ color: "white" }}>John</span>
          </div>
        ) : (
          <Login style={{ padding: "0px", margin: "0" }} />
        )}
      </div>
    </header>
  );
}
