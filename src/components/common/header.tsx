import { useState, useEffect } from "react";
import MapIcon from "../icons/map";
import Login from "./login";
import { useRouter } from "next/router";
import Avatar, { AvatarFullConfig, genConfig } from "react-nice-avatar";
import Image from "next/image";
import Dropdown from "./dropdown";
import { FiLogOut } from "react-icons/fi";
import { MdHome, MdArticle, MdPerson } from "react-icons/md";
import { useSession, signOut } from "next-auth/react";

export default function Header() {
  const { data: session, status } = useSession();
  const [nickname, setNickname] = useState("User");
  const [profileImg, setProfileImg] = useState<string | null>(null);
  const router = useRouter();
  const [config, setConfig] = useState<Required<AvatarFullConfig>>();

  const isLoggedIn = status === "authenticated";

  const handleLogout = async () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userId");
    localStorage.removeItem("nickname");
    localStorage.removeItem("userProfileImg");
    
    await signOut({ redirect: false });
    alert("You have successfully logged out from your account");
    router.push("/login");
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

  // Update from session when logged in
  useEffect(() => {
    if (isLoggedIn && session?.user) {
      console.log("[HEADER] Session updated:", {
        nickname: session.user.nickname,
        profileImg: session.user.profileImg,
      });
      const displayNickname = session.user.nickname || "User";
      setNickname(displayNickname);
      setProfileImg(session.user.profileImg || null);
      setConfig(genConfig(displayNickname));

      // Also update localStorage for fallback
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("nickname", displayNickname);
      if (session.user.profileImg) {
        localStorage.setItem("userProfileImg", session.user.profileImg);
      }
    } else if (!isLoggedIn) {
      console.log("[HEADER] Not logged in");
      setNickname("User");
      setProfileImg(null);
      setConfig(genConfig("User"));
    }
  }, [session, isLoggedIn]);

  // Listen for profile updates and refresh user data
  useEffect(() => {
    const handleProfileUpdate = () => {
      // Trigger a session refresh by reloading the page
      // Or we could use a more sophisticated cache invalidation strategy
      window.location.reload();
    };

    window.addEventListener("profileUpdated", handleProfileUpdate);
    return () => {
      window.removeEventListener("profileUpdated", handleProfileUpdate);
    };
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
                  <div className="relative h-[24px] w-[24px] overflow-hidden rounded-full bg-[#1a1a1a]">
                    {profileImg ? (
                      <img
                        src={`${process.env.NEXT_PUBLIC_S3_BASE_URL}${profileImg}`}
                        alt="Profile"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      config && <Avatar className="h-full w-full" {...config} />
                    )}
                  </div>
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
