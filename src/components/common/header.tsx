import { useState, useEffect } from "react";
import MapIcon from "../icons/map";
import Login from "./login";
import { useRouter } from "next/router";
import Avatar, { AvatarFullConfig, genConfig } from "react-nice-avatar";
import Image from "next/image";
import Dropdown from "./dropdown";
import { FiLogOut } from "react-icons/fi";
import { MdHome, MdArticle, MdPerson } from "react-icons/md";

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false); // 로그인 상태 관리
  const [nickname, setNickname] = useState("User"); // 사용자 닉네임
  const router = useRouter();
  const [config, setConfig] = useState<Required<AvatarFullConfig>>();

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userId");
    localStorage.removeItem("nickname");
    setIsLoggedIn(false);
    setNickname("User");
    alert("You have successfully logged out from your account");
  };

  const handleMenuSelect = (option: string) => {
    if (option === "Home") {
      router.push("/");
    } else if (option === "My Blog") {
      router.push("/user-blog-home");
    } else if (option === "Profile") {
      router.push("/profile");
    }
  };

  useEffect(() => {
    // localStorage에서 로그인 여부 및 닉네임 확인
    const loggedInStatus = localStorage.getItem("isLoggedIn");
    const savedNickname = localStorage.getItem("nickname");
    setIsLoggedIn(loggedInStatus === "true");
    setNickname(savedNickname || "User");
    setConfig(genConfig(savedNickname || "User"));
  }, []);

  return (
    <header className="flex h-[48px] items-center justify-between bg-black-primary pl-[16px] text-key-primary">
      <div className="flex items-center gap-1" onClick={() => router.push("/")}>
        <MapIcon />
        StoryTrack
      </div>
      <div className="flex items-center gap-2">
        {isLoggedIn ? (
          <div className="relative">
            <Dropdown
              onSelect={(option) => {
                if (option === "Logout") {
                  handleLogout();
                } else {
                  handleMenuSelect(option);
                }
              }}
              itemsClassName="absolute right-0 top-12 w-[150px] bg-black-primary overflow-hidden rounded-lg shadow-lg z-50"
              label={
                <div className="flex cursor-pointer items-center gap-2 pr-[16px]">
                  <Image
                    src="/icons/profile.png"
                    width={24}
                    height={24}
                    alt="profile"
                  />
                  <span style={{ color: "white" }}>{nickname}</span>
                </div>
              }
            >
              <Dropdown.Option value="Home">
                <div className="flex h-[38px] w-full items-center gap-2 px-3 tracking-tight text-white-primary hover:bg-[#262626]">
                  <MdHome size={18} />
                  <span>Home</span>
                </div>
              </Dropdown.Option>
              <Dropdown.Option value="My Blog">
                <div className="flex h-[38px] w-full items-center gap-2 px-3 tracking-tight text-white-primary hover:bg-[#262626]">
                  <MdArticle size={18} />
                  <span>My Blog</span>
                </div>
              </Dropdown.Option>
              <Dropdown.Option value="Profile">
                <div className="flex h-[38px] w-full items-center gap-2 px-3 tracking-tight text-white-primary hover:bg-[#262626]">
                  <MdPerson size={18} />
                  <span>Profile</span>
                </div>
              </Dropdown.Option>
              <div className="h-[1px] bg-[#404040]"></div>
              <Dropdown.Option value="Logout">
                <div className="flex h-[38px] w-full items-center gap-2 px-3 tracking-tight text-white-primary hover:bg-[#262626]">
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
