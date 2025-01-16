import { useState, useEffect } from "react";
import MapIcon from "../icons/map";
import MenuIcon from "../icons/menu";
import Login from "./login";
import { useRouter } from "next/router";
import Avatar, { AvatarFullConfig, genConfig } from "react-nice-avatar";
import Image from "next/image";
import Dropdown from "./dropdown";
import { FiLogOut } from "react-icons/fi";

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false); // 로그인 상태 관리
  const router = useRouter();
  const [config, setConfig] = useState<Required<AvatarFullConfig>>();

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    setIsLoggedIn(false);
  };

  const handleSelect = (option: string) => {
    if (option === "Logout") {
      handleLogout();
    }
  };

  useEffect(() => {
    setConfig(genConfig("John"));
  }, []);

  useEffect(() => {
    // localStorage에서 로그인 여부 확인
    const loggedInStatus = localStorage.getItem("isLoggedIn");
    setIsLoggedIn(loggedInStatus === "true");
  }, []);

  return (
    <header className="flex h-[48px] items-center justify-between bg-black-primary pl-[16px] text-key-primary">
      <div className="flex items-center gap-1" onClick={() => router.push("/")}>
        <MapIcon />
        StoryTrack
      </div>
      <div className="flex items-center gap-2">
        <MenuIcon />
        {isLoggedIn ? (
          <div className="relative flex items-center">
            {/* <Avatar className="h-[24px] w-[24px]" {...config} /> */}
            <Dropdown
              onSelect={handleSelect}
              itemsClassName="absolute right-1 top-8 w-[100px] bg-black-primary overflow-hidden rounded-lg shadow-lg"
              label={
                <div className="flex items-center gap-2 pr-[16px]">
                  <Image
                    src="/icons/profile.png"
                    width={24}
                    height={24}
                    alt="profile"
                  />
                  <span style={{ color: "white" }}>John</span>
                </div>
              }
            >
              <Dropdown.Option value="Logout">
                <div className="text=[10px] flex h-[38px] w-full items-center gap-2 px-3 tracking-tight text-white-primary">
                  <FiLogOut />
                  <span>Logout</span>
                </div>
              </Dropdown.Option>
            </Dropdown>
          </div>
        ) : (
          <div className="pr-[16px]">
            <Login style={{ padding: "0px", margin: "0" }} />
          </div>
        )}
      </div>
    </header>
  );
}
