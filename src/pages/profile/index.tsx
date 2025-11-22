import Header from "@/components/common/header";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Image from "next/image";
import { FaCheck, FaX } from "react-icons/fa6";
import Avatar, { AvatarFullConfig, genConfig } from "react-nice-avatar";

function ValidationIcon({ isFilled }: { isFilled: boolean }) {
  if (isFilled) {
    return <FaCheck className="text-green-500" />;
  }
  return <FaX className="text-gray-500" />;
}

export default function ProfilePage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [id, setId] = useState("");
  const [userId, setUserId] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [birthYmd, setBirthYmd] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [profileImg, setProfileImg] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(false);

  const [editData, setEditData] = useState({
    nickname: "",
    bio: "",
    blogName: "",
  });

  const [config, setConfig] = useState<Required<AvatarFullConfig>>();

  const isNicknameValid =
    editData.nickname.length >= 5 &&
    !/[!@#$%^&*(),.?":{}|<>]/.test(editData.nickname);
  const isBlogNameValid =
    editData.blogName.length > 0 &&
    editData.blogName.length <= 50 &&
    !/[!@#$%^&*(),.?":{}|<>\\/]/.test(editData.blogName);
  const isBioValid = editData.bio.length === 0 || editData.bio.length <= 500;
  const isEditFormValid = isNicknameValid && isBlogNameValid && isBioValid;

  useEffect(() => {
    const loggedInStatus = localStorage.getItem("isLoggedIn");
    if (loggedInStatus !== "true") {
      router.push("/login");
    } else {
      setIsLoggedIn(true);
      const storedId = localStorage.getItem("id") || "";
      const storedUserId = localStorage.getItem("userId") || "";
      const storedNickname = localStorage.getItem("nickname") || "";
      const storedEmail = localStorage.getItem("userEmail") || "";
      const storedBio = localStorage.getItem("userBio") || "";
      const storedBlogName = localStorage.getItem("userBlogName") || "";
      const storedBirthYmd = localStorage.getItem("userBirthYmd") || "";
      const storedProfileImg = localStorage.getItem("userProfileImg");
      setId(storedId);
      setUserId(storedUserId);
      setUserEmail(storedEmail);
      setBirthYmd(storedBirthYmd);
      setProfileImg(storedProfileImg);
      setConfig(genConfig(storedNickname || "User"));
      setEditData({
        nickname: storedNickname,
        bio: storedBio,
        blogName: storedBlogName,
      });
    }
  }, [router]);

  const handleEditChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setEditData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      alert("Only JPG, JPEG, and PNG images are supported");
      return;
    }

    setImageLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(
        `${process.env.BASE_URL}/images/profile/${userId}`,
        {
          method: "POST",
          body: formData,
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage =
          errorData.data?.message || errorData.message || "Upload failed";
        alert("Image Upload Error: " + errorMessage);
        return;
      }

      const imageData = await response.json();
      const imageUrl = imageData.data?.url || imageData.data;

      setProfileImg(imageUrl);
      localStorage.setItem("userProfileImg", imageUrl);
      alert("Profile image updated successfully!");
    } catch (err) {
      const errorMessage =
        "An error occurred during image upload. Please try again.";
      alert("Image Upload Error: " + errorMessage);
      console.error(err);
    } finally {
      setImageLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!isEditFormValid) {
      setError("Please check all fields");
      return;
    }

    setLoading(true);
    try {
      const numericId = Number(id);
      const response = await fetch(
        `${process.env.BASE_URL}/users/${numericId}/profile`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nickname: editData.nickname,
            bio: editData.bio || null,
            blogName: editData.blogName,
            profileImg: profileImg || null,
          }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage =
          errorData.data?.message || errorData.message || "Update failed";
        alert("Update Error: " + errorMessage);
        return;
      }

      // Update localStorage with new values
      localStorage.setItem("nickname", editData.nickname);
      localStorage.setItem("userBio", editData.bio);
      localStorage.setItem("userBlogName", editData.blogName);
      if (profileImg) {
        localStorage.setItem("userProfileImg", profileImg);
      }

      setIsEditing(false);
      alert("Profile updated successfully!");
    } catch (err) {
      const errorMessage = "An error occurred during update. Please try again.";
      alert("Update Error: " + errorMessage);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isLoggedIn) {
    return null;
  }

  return (
    <div className="flex h-full w-full flex-col bg-black-primary text-white-primary">
      <div className="z-20">
        <Header />
      </div>
      <div className="flex flex-1 flex-col items-center justify-start gap-8 overflow-y-auto p-4 pt-8">
        <h1 className="text-[32px] font-bold">My Profile</h1>

        <div className="w-full max-w-md rounded-lg bg-[#262626] p-6">
          <div className="flex flex-col gap-6">
            {/* Profile Image */}
            <div className="flex flex-col items-center gap-3">
              <div className="relative h-[120px] w-[120px] overflow-hidden rounded-full bg-[#1a1a1a]">
                {profileImg ? (
                  <img
                    src={profileImg}
                    alt="Profile"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  config && <Avatar className="h-full w-full" {...config} />
                )}
              </div>
              <label className="cursor-pointer rounded-lg bg-key-primary px-4 py-2 text-[12px] font-bold text-[#0C0C0DB2] transition-opacity hover:opacity-90">
                {imageLoading ? "Uploading..." : "Upload Image"}
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,image/jpeg,image/png,image/jpg"
                  onChange={handleImageUpload}
                  disabled={imageLoading}
                  className="hidden"
                />
              </label>
            </div>

            {/* Immutable Fields - Inline Format */}
            <div className="flex items-center justify-between">
              <span className="text-[14px] text-gray-400">ID</span>
              <span className="text-[16px] text-white-primary">{userId}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[14px] text-gray-400">Email</span>
              <span className="text-[16px] text-white-primary">
                {userEmail}
              </span>
            </div>

            {birthYmd && (
              <div className="flex items-center justify-between">
                <span className="text-[14px] text-gray-400">Birth Date</span>
                <span className="text-[16px] text-white-primary">
                  {birthYmd.slice(0, 4)}-{birthYmd.slice(4, 6)}-
                  {birthYmd.slice(6, 8)}
                </span>
              </div>
            )}

            {/* Editable Fields */}
            {isEditing ? (
              <>
                <div>
                  <label className="text-[14px] text-gray-400">Nickname</label>
                  <input
                    type="text"
                    name="nickname"
                    value={editData.nickname}
                    onChange={handleEditChange}
                    className="mt-2 h-[40px] w-full rounded-lg bg-[#1a1a1a] px-3 text-white-primary focus:outline-none focus:ring-1 focus:ring-key-primary"
                  />
                  {editData.nickname && !isNicknameValid && (
                    <p className="mt-1 text-[12px] text-red-500">
                      {editData.nickname.length < 5
                        ? "Must be at least 5 characters"
                        : "No special characters allowed"}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-[14px] text-gray-400">Blog Name</label>
                  <input
                    type="text"
                    name="blogName"
                    value={editData.blogName}
                    onChange={handleEditChange}
                    className="mt-2 h-[40px] w-full rounded-lg bg-[#1a1a1a] px-3 text-white-primary focus:outline-none focus:ring-1 focus:ring-key-primary"
                  />
                  <p className="text-right text-[12px] text-gray-500">
                    {editData.blogName.length}/50
                  </p>
                  {editData.blogName && !isBlogNameValid && (
                    <p className="mt-1 text-[12px] text-red-500">
                      {editData.blogName.length === 0
                        ? "Blog name is required"
                        : editData.blogName.length > 50
                          ? "Must be under 50 bytes"
                          : "No special characters allowed"}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-[14px] text-gray-400">
                    Bio (Optional)
                  </label>
                  <textarea
                    name="bio"
                    value={editData.bio}
                    onChange={handleEditChange}
                    className="mt-2 min-h-[80px] w-full rounded-lg bg-[#1a1a1a] px-3 py-2 text-white-primary focus:outline-none focus:ring-1 focus:ring-key-primary"
                    maxLength={500}
                  />
                  <p className="text-right text-[12px] text-gray-500">
                    {editData.bio.length}/500
                  </p>
                </div>

                {error && <p className="text-[12px] text-red-500">{error}</p>}

                <div className="flex gap-3">
                  <button
                    className={`h-[48px] flex-1 rounded-lg py-2 font-bold text-[#0C0C0DB2] transition-opacity ${
                      isEditFormValid && !loading
                        ? "cursor-pointer bg-key-primary hover:opacity-90"
                        : "cursor-not-allowed bg-[#5B578A] opacity-50"
                    }`}
                    disabled={!isEditFormValid || loading}
                    onClick={handleSaveProfile}
                  >
                    {loading ? "Saving..." : "Save"}
                  </button>
                  <button
                    className="h-[48px] flex-1 rounded-lg bg-[#404040] py-2 font-bold text-white-primary transition-opacity hover:opacity-90"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-[14px] text-gray-400">Nickname</span>
                  <span className="text-[16px] text-white-primary">
                    {editData.nickname}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[14px] text-gray-400">Blog Name</span>
                  <span className="text-[16px] text-white-primary">
                    {editData.blogName}
                  </span>
                </div>

                {editData.bio && (
                  <div>
                    <label className="text-[14px] text-gray-400">Bio</label>
                    <p className="mt-2 text-[14px] text-white-primary">
                      {editData.bio}
                    </p>
                  </div>
                )}

                <button
                  className="h-[48px] rounded-lg bg-key-primary py-2 font-bold text-[#0C0C0DB2] transition-opacity hover:opacity-90"
                  onClick={() => setIsEditing(true)}
                >
                  Edit Profile
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
