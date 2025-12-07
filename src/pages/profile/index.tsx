import Header from "@/components/common/header";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Image from "next/image";
import { FaCheck, FaX } from "react-icons/fa6";
import Avatar, { AvatarFullConfig, genConfig } from "react-nice-avatar";
import { useSession } from "next-auth/react";

function ValidationIcon({ isFilled }: { isFilled: boolean }) {
  if (isFilled) {
    return <FaCheck className="text-green-500" />;
  }
  return <FaX className="text-gray-500" />;
}

export default function ProfilePage() {
  const router = useRouter();
  const { data: session, status, update } = useSession();
  const isLoggedIn = status === "authenticated";

  // State for editable fields
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [profileImg, setProfileImg] = useState<string | null>(null);
  const [config, setConfig] = useState<Required<AvatarFullConfig>>();

  const [editData, setEditData] = useState({
    nickname: "",
    bio: "",
    blogName: "",
  });

  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const isNicknameValid =
    editData.nickname.length >= 5 &&
    !/[!@#$%^&*(),.?":{}|<>]/.test(editData.nickname);
  const isBlogNameValid =
    editData.blogName.length > 0 &&
    editData.blogName.length <= 50 &&
    !/[!@#$%^&*(),.?":{}|<>\\/]/.test(editData.blogName);
  const isBioValid = editData.bio.length === 0 || editData.bio.length <= 500;
  const isEditFormValid = isNicknameValid && isBlogNameValid && isBioValid;

  // Redirect if not logged in
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Initialize form with session data - only on first load or when NOT editing
  useEffect(() => {
    if (isLoggedIn && session?.user && !isEditing) {
      setProfileImg(session.user.profileImg || null);
      setConfig(genConfig(session.user.nickname || "User"));
      setEditData({
        nickname: session.user.nickname || "",
        bio: session.user.bio || "",
        blogName: session.user.blogName || "",
      });
    }
  }, [session, isLoggedIn, isEditing]);

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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      alert("Only JPG, JPEG, and PNG images are supported");
      return;
    }

    // Store file for later upload and create preview
    setSelectedImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async () => {
    if (!isEditFormValid) {
      setError("Please check all fields");
      return;
    }

    setLoading(true);
    try {
      let finalProfileImg = profileImg;

      // Upload image to S3 if a new one was selected
      if (selectedImageFile) {
        const formData = new FormData();
        formData.append("file", selectedImageFile);

        // Use proxy endpoint to avoid HTTPS mixed content errors
        const uploadResponse = await fetch(
          `/api/backend/s3/upload/profile`,
          {
            method: "POST",
            body: formData,
          },
        );

        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json();
          const errorMessage =
            errorData.data?.message ||
            errorData.message ||
            "Image upload failed";
          alert("Image Upload Error: " + errorMessage);
          setLoading(false);
          return;
        }

        const uploadData = await uploadResponse.json();
        const fileName = uploadData.data || uploadData;

        // Store only the filename (not the full URL)
        finalProfileImg = fileName;

        setProfileImg(finalProfileImg);
        setSelectedImageFile(null);
        setPreviewImage(null);
      }

      // Save profile with image URL to database
      const numericId = Number(session?.user?.id);

      // Create request body with current editData values
      const requestBody = {
        nickname: editData.nickname,
        bio: editData.bio.length === 0 ? null : editData.bio,
        blogName: editData.blogName,
        profileImg: finalProfileImg || null,
      };

      const jsonBody = JSON.stringify(requestBody);

      const response = await fetch(
        `/api/backend/users/${numericId}/profile`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: jsonBody,
        },
      );

      const responseData = await response.json();

      if (!response.ok) {
        const errorMessage =
          responseData.data?.message || responseData.message || "Update failed";
        alert("Update Error: " + errorMessage);
        return;
      }

      // Fetch fresh user data from backend to ensure we have the latest
      const userResponse = await fetch(
        `/api/backend/users/${numericId}/profile`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      let freshUserData = {
        nickname: editData.nickname,
        bio: editData.bio,
        blogName: editData.blogName,
        profileImg: finalProfileImg,
      };

      if (userResponse.ok) {
        const freshData = await userResponse.json();
        const user = freshData.data;

        freshUserData = {
          nickname: user.nickname || editData.nickname,
          bio: user.bio || editData.bio,
          blogName: user.blogName || editData.blogName,
          profileImg: user.profileImg || finalProfileImg,
        };

        // Update the local state with fresh data
        setProfileImg(user.profileImg || null);
        setConfig(genConfig(user.nickname || "User"));
        setEditData({
          nickname: user.nickname || "",
          bio: user.bio || "",
          blogName: user.blogName || "",
        });
      }

      // Call the update function to refresh the session
      // This will trigger NextAuth to refresh the JWT token with new data
      try {
        const syncResponse = await fetch("/api/auth/sync-session", {
          method: "POST",
        });

        if (syncResponse.ok) {
          const syncedData = await syncResponse.json();

          // Update the session with the synced data from the backend
          await update(syncedData);
        } else {
          // Fallback to the freshUserData we already have
          await update(freshUserData);
        }
      } catch (updateError) {
        // Fallback to the freshUserData we already have
        await update(freshUserData);
      }

      // Dispatch custom event to trigger header refresh
      window.dispatchEvent(new Event("profileUpdated"));

      setIsEditing(false);

      // Small delay to ensure session is updated before showing alert
      setTimeout(() => {
        alert("Profile updated successfully!");
      }, 100);
    } catch (err) {
      const errorMessage = "An error occurred during update. Please try again.";
      alert("Update Error: " + errorMessage);
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
                {previewImage ? (
                  <img
                    src={previewImage}
                    alt="Preview"
                    className="h-full w-full object-cover"
                  />
                ) : profileImg ? (
                  <img
                    src={`${process.env.NEXT_PUBLIC_S3_BASE_URL}${profileImg}`}
                    alt="Profile"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  config && <Avatar className="h-full w-full" {...config} />
                )}
              </div>
              {isEditing && (
                <div className="flex gap-2">
                  <label className="cursor-pointer rounded-lg bg-key-primary px-4 py-2 text-[12px] font-bold text-[#0C0C0DB2] transition-opacity hover:opacity-90">
                    {selectedImageFile ? "Change Image" : "Upload Image"}
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,image/jpeg,image/png,image/jpg"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                  {(profileImg || previewImage) && (
                    <button
                      onClick={() => {
                        setProfileImg(null);
                        setPreviewImage(null);
                        setSelectedImageFile(null);
                      }}
                      className="text-white rounded-lg bg-red-600 px-4 py-2 text-[12px] font-bold transition-opacity hover:opacity-90"
                    >
                      Delete Image
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Immutable Fields - Inline Format */}
            <div className="flex items-center justify-between">
              <span className="text-[14px] text-gray-400">ID</span>
              <span className="text-[16px] text-white-primary">
                {session?.user?.userId}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[14px] text-gray-400">Email</span>
              <span className="text-[16px] text-white-primary">
                {session?.user?.email}
              </span>
            </div>

            {session?.user?.birthYmd && (
              <div className="flex items-center justify-between">
                <span className="text-[14px] text-gray-400">Birth Date</span>
                <span className="text-[16px] text-white-primary">
                  {session.user.birthYmd.slice(0, 4)}-
                  {session.user.birthYmd.slice(4, 6)}-
                  {session.user.birthYmd.slice(6, 8)}
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
                  onClick={() => {
                    setIsEditing(true);
                  }}
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
