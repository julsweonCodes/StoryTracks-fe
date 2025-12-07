import { useFormContext } from "@/context/form-context";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { FaChevronLeft } from "react-icons/fa6";
import { LuSettings } from "react-icons/lu";
import Loading from "./loading";
import usePublishBlogPost from "@/hooks/mutations/use-publish-blog-post";
import { uploadImagesToS3 } from "@/utils/s3-upload";
import ErrorModal from "./error-modal";

interface ModalState {
  isOpen: boolean;
  title: string;
  description: string;
}

export default function GeneratorHeader() {
  const {
    setActiveComponentKey,
    description,
    title,
    activeComponentKey,
    images,
    isEdit,
  } = useFormContext();
  const router = useRouter();
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [modal, setModal] = useState<ModalState>({
    isOpen: false,
    title: "",
    description: "",
  });

  const { mutate: publishBlogPost } = usePublishBlogPost({
    onSuccess: (data) => {
      console.log("[GeneratorHeader] Blog post published successfully:", data);
      setIsLoading(false);
      // Pass user info in query params to avoid refetch
      // @ts-ignore - custom session fields from NextAuth config
      const userNickname = session?.user?.nickname || "Anonymous";
      // @ts-ignore - custom session fields from NextAuth config
      const userProfileImg = session?.user?.profileImg || "";
      const userId = session?.user?.id || "";
      console.log("[GeneratorHeader] Session data:", {
        userId,
        userNickname,
        userProfileImg,
        sessionUserFull: session?.user,
      });
      const redirectUrl = `/blog/${data.postId}?new=true&userId=${userId}&nickname=${encodeURIComponent(userNickname)}&profileImg=${encodeURIComponent(userProfileImg)}`;
      console.log("[GeneratorHeader] Redirecting to:", redirectUrl);
      router.push(redirectUrl);
    },
    onError: (error) => {
      console.error("[GeneratorHeader] Failed to publish blog post:", error);
      setIsLoading(false);
      setModal({
        isOpen: true,
        title: "Failed to Publish",
        description:
          error instanceof Error ? error.message : "Unknown error occurred",
      });
    },
  });

  const handleCancel = () => {
    if (activeComponentKey === "preview") {
      setActiveComponentKey("generator");
    } else if (activeComponentKey === "generator") {
      setActiveComponentKey("write");
    } else if (activeComponentKey === "setting") {
      setActiveComponentKey("generator");
    } else if (activeComponentKey === "write") {
      router.push("/");
    }
  };

  const handlePublish = async () => {
    if (isLoading) return;

    console.log("[GeneratorHeader] Publish button clicked, isEdit:", isEdit);

    // If in edit mode, dispatch a custom event for the edit page to handle
    if (isEdit) {
      console.log("[GeneratorHeader] In edit mode - dispatching save event");
      const saveEvent = new CustomEvent("blog-save-requested", {
        detail: { title, description, images },
      });
      window.dispatchEvent(saveEvent);
      return;
    }

    // Original new post publish logic
    console.log("[GeneratorHeader] In create mode - publishing new post");
    console.log("[GeneratorHeader] Title value:", title);
    console.log("[GeneratorHeader] Description value:", description.length);
    console.log("[GeneratorHeader] Images count:", images.length);
    console.log("[GeneratorHeader] Session userId:", session?.user?.userId);

    if (!session?.user?.userId) {
      console.error("[GeneratorHeader] User not logged in");
      setModal({
        isOpen: true,
        title: "Login Required",
        description: "Please log in to create a post",
      });
      return;
    }
    if (!title || title.trim() === "") {
      console.error("[GeneratorHeader] Title is required or empty");
      setModal({
        isOpen: true,
        title: "Title Required",
        description: "Please enter a title for your post",
      });
      return;
    }
    if (!description || description.trim() === "") {
      console.error("[GeneratorHeader] Description is required or empty");
      setModal({
        isOpen: true,
        title: "Description Required",
        description: "Please write a description for your post",
      });
      return;
    }

    const thumbnailImage = images.find((img) => img.active);
    if (!thumbnailImage) {
      console.error("[GeneratorHeader] Thumbnail image is required");
      setModal({
        isOpen: true,
        title: "Thumbnail Required",
        description:
          "Please select at least one image and mark it as thumbnail",
      });
      return;
    }

    setIsLoading(true);
    console.log("[GeneratorHeader] Starting publish workflow...");

    try {
      // Step 1: Upload images to S3
      console.log(
        `[GeneratorHeader] Uploading ${images.length} image(s) to S3...`,
      );
      const imageFiles = images
        .filter((img) => img.file)
        .map((img) => img.file as File);

      let s3FileNames: string[] = [];
      if (imageFiles.length > 0) {
        s3FileNames = await uploadImagesToS3(imageFiles);
        console.log("[GeneratorHeader] S3 upload successful:", s3FileNames);
      }

      // Step 3: Prepare image metadata
      const imageMetadata = images
        .filter((img) => {
          const originalName = img.fileName || "";
          return s3FileNames.some((s3Name) => s3Name.includes(originalName));
        })
        .map((img) => {
          const originalName = img.fileName || "";
          const s3FileName =
            s3FileNames.find((s3Name) => s3Name.includes(originalName)) ||
            originalName;

          // Extract original filename without timestamp prefix
          // S3 filename format: "1764252482248_DSC00348.JPG"
          // We want to save: "DSC00348.JPG"
          const extractedFileName =
            s3FileName.split("_").slice(1).join("_") || originalName;

          return {
            imgFileName: extractedFileName,
            imgPath: s3FileName,
            geoLat: (img.lat || 0).toString(),
            geoLong: (img.lon || 0).toString(),
            imgDtm: img.createDate || new Date().toISOString(),
            thumbYn: (img.active ? "Y" : "N") as "Y" | "N",
          };
        });

      // Step 4: Call publish mutation
      // JWT auth is handled by Authorization header in usePublishBlogPost hook
      publishBlogPost({
        title: title,
        ogText: description,
        aiGenText: "",
        images: imageMetadata,
      });
    } catch (error) {
      console.error("[GeneratorHeader] Publish workflow failed:", error);
      setIsLoading(false);
      // Errors are already handled by mutation onError callback
    }
  };

  const titles = {
    generator: "Content Generator",
    write: "Post Editor",
    setting: "Content Settings",
  } as { [key: string]: string };

  const headerTitle = titles[activeComponentKey] || "Add Description";

  const isGenerator = activeComponentKey === "generator";

  const isPublish =
    activeComponentKey === "write" || activeComponentKey === "preview";

  return (
    <div className="relative mx-4 my-2 flex h-[60px] items-center justify-center bg-black-primary text-white-primary">
      <div
        className="absolute left-0 flex h-[40px] w-[40px] items-center justify-center rounded-lg bg-[#262626]"
        onClick={handleCancel}
      >
        <FaChevronLeft />
      </div>
      <h1 className="flex h-[40px] items-center text-[16px] tracking-tight">
        {headerTitle}
      </h1>
      {isGenerator && (
        <div
          className="absolute right-0 flex h-[40px] w-[40px] items-center justify-center rounded-lg bg-[#262626]"
          onClick={() => setActiveComponentKey("setting")}
        >
          <LuSettings />
        </div>
      )}
      {isPublish && (
        <div
          className="absolute right-0 flex h-[40px] w-[78px] cursor-pointer items-center justify-center rounded-lg bg-[#262626] text-[14px] leading-4 tracking-tight transition-colors hover:bg-[#323232]"
          onClick={handlePublish}
        >
          {isLoading ? <Loading type="loading" color="#ffffff" /> : "Publish"}
        </div>
      )}

      {/* Error Modal */}
      <ErrorModal
        isOpen={modal.isOpen}
        title={modal.title}
        description={modal.description}
        onClose={() => setModal({ ...modal, isOpen: false })}
      />
    </div>
  );
}
