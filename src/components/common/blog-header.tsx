import { useFormContext } from "@/context/form-context";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { IoIosArrowDown } from "react-icons/io";
import { RxKeyboard } from "react-icons/rx";
import Loading from "./loading";
import usePublishBlogPost from "@/hooks/mutations/use-publish-blog-post";
import { uploadImagesToS3 } from "@/utils/s3-upload";
import ErrorModal from "./error-modal";

interface ModalState {
  isOpen: boolean;
  title: string;
  description: string;
}

export default function BlogHeader() {
  const router = useRouter();
  const { data: session } = useSession();
  const {
    activeComponentKey,
    setActiveComponentKey,
    description,
    title,
    images,
  } = useFormContext();

  const [isLoading, setIsLoading] = useState(false);
  const [modal, setModal] = useState<ModalState>({
    isOpen: false,
    title: "",
    description: "",
  });

  const { mutate: publishBlogPost } = usePublishBlogPost({
    onSuccess: (data) => {
      console.log("[Header] Blog post published successfully:", data);
      setIsLoading(false);
      router.push(`/blog/${data.postId}?new=true`);
    },
    onError: (error) => {
      console.error("[Header] Failed to publish blog post:", error);
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
    setActiveComponentKey("generator");
  };

  const handlePublish = async () => {
    if (isLoading) return;
    if (!session?.user?.userId) {
      console.error("[Header] User not logged in");
      setModal({
        isOpen: true,
        title: "Login Required",
        description: "Please log in to create a post",
      });
      return;
    }
    if (!title) {
      console.error("[Header] Title is required");
      setModal({
        isOpen: true,
        title: "Title Required",
        description: "Please enter a title for your post",
      });
      return;
    }

    setIsLoading(true);
    console.log("[Header] Starting publish workflow...");

    try {
      // Step 1: Upload images to S3
      console.log(`[Header] Uploading ${images.length} image(s) to S3...`);
      const imageFiles = images
        .filter((img) => img.file)
        .map((img) => img.file as File);

      let s3FileNames: string[] = [];
      if (imageFiles.length > 0) {
        s3FileNames = await uploadImagesToS3(imageFiles);
        console.log("[Header] S3 upload successful:", s3FileNames);
      }

      // Step 2: Prepare image metadata
      // Use original file names (without timestamp) for the image table
      // Backend will store the full timestamped S3 file name in imgPath
      const imageMetadata = images
        .filter((img) => {
          // Find corresponding S3 file name for this image
          const originalName = img.fileName || "";
          return s3FileNames.some((s3Name) => s3Name.includes(originalName));
        })
        .map((img) => {
          // Find the matching S3 file name
          const originalName = img.fileName || "";
          const s3FileName =
            s3FileNames.find((s3Name) => s3Name.includes(originalName)) ||
            originalName;

          return {
            imgFileName: originalName, // Original file name (e.g., IMG_5717.JPG)
            imgPath: `posts/${s3FileName}`, // S3 path (e.g., posts/1763882165078_IMG_5717.JPG)
            geoLat: (img.lat || 0).toString(),
            geoLong: (img.lon || 0).toString(),
            imgDtm: img.createDate || new Date().toISOString(),
            thumbYn: (img.active ? "Y" : "N") as "Y" | "N",
          };
        });

      // Step 3: Call publish mutation to create blog post
      const userId =
        typeof session.user.id === "string"
          ? parseInt(session.user.id)
          : session.user.id;

      publishBlogPost({
        userId: userId, // Get user ID from session (numeric id, not userId string)
        title: title, // Use page title, not AI generated title
        ogText: description, // Save description as-is with <img>imgFileName</img> tags (original file names only)
        aiGenText: "", // Empty for now (AI content is handled separately)
        images: imageMetadata,
      });
    } catch (error) {
      console.error("[Header] Publish workflow failed:", error);
      setIsLoading(false);
      setModal({
        isOpen: true,
        title: "Upload Failed",
        description:
          error instanceof Error ? error.message : "Failed to upload images",
      });
    }
  };

  return (
    <div
      className={`flex h-[36px] items-center justify-between bg-black-primary p-5 text-white-primary`}
    >
      {activeComponentKey === "preview" ? (
        <div
          className="cursor-pointer text-[14px] tracking-tight transition-opacity hover:opacity-80"
          onClick={handleCancel}
        >
          Cancel
        </div>
      ) : (
        <RxKeyboard onClick={handleCancel} />
      )}
      <div className="flex items-center gap-2">
        <h1 className="text-md">Travel</h1>
        <IoIosArrowDown />
      </div>
      <button
        className={`text-[14px] tracking-tight transition-colors ${
          activeComponentKey === "preview"
            ? "cursor-pointer text-white-primary hover:opacity-80"
            : "cursor-not-allowed text-[#7A7A7A]"
        }`}
        disabled={activeComponentKey !== "preview" || isLoading}
        onClick={handlePublish}
      >
        {isLoading ? <Loading type="loading" color="#ffffff" /> : "Post"}
      </button>

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
