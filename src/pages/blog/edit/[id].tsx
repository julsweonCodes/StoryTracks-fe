import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import usePostsDetailQuery from "@/hooks/queries/use-posts-detail-query";
import useUpdateBlogPost from "@/hooks/mutations/use-update-blog-post";
import { uploadImagesToS3 } from "@/utils/s3-upload";
import ErrorModal from "@/components/common/error-modal";
import Loading from "@/components/common/loading";
import GeneratorHeader from "@/components/common/generator-header";
import AISummaryModal from "@/components/common/ai-summary-modal";
import Write from "@/components/blog/new-post/sections/write";
import Setting from "@/components/blog/new-post/sections/settings";
import Generator from "@/components/blog/new-post/sections/ai-generator";
import Preview from "@/components/blog/new-post/sections/preview";
import { FormProvider, useFormContext } from "@/context/form-context";

interface StatusInfo {
  type?: "loading" | "success" | "error";
  title?: string;
  description?: string;
}

interface ModalState {
  isOpen: boolean;
  title: string;
  description: string;
}

export default function EditBlogPost() {
  const router = useRouter();
  const { id } = router.query;
  const { data: session } = useSession();
  const { data: postData, isLoading: postLoading } = usePostsDetailQuery(
    id as string,
  );

  const [modal, setModal] = useState<ModalState>({
    isOpen: false,
    title: "",
    description: "",
  });
  const [isAISummaryModalOpen, setIsAISummaryModalOpen] = useState(false);
  const [statusInfo, setStatusInfo] = useState<StatusInfo>({
    type: undefined,
  });

  const { mutate: updateBlogPost } = useUpdateBlogPost({
    onSuccess: (data) => {
      console.log("[EditBlogPost] Post updated successfully:", data);
      setStatusInfo({
        type: "success",
        title: "Post Updated",
        description: "",
      });
      setTimeout(() => {
        router.push(`/blog/${data.postId}`);
      }, 1000);
    },
    onError: (error) => {
      console.error("[EditBlogPost] Failed to update post:", error);
      setStatusInfo({ type: undefined });
      setModal({
        isOpen: true,
        title: "Update Failed",
        description:
          error instanceof Error ? error.message : "Failed to update post",
      });
    },
  });

  if (postLoading || !postData) {
    return (
      <div className="relative flex h-full w-full flex-col">
        <div className="flex flex-1 items-center justify-center">
          <Loading type="loading" />
        </div>
      </div>
    );
  }

  return (
    <FormProvider initialData={postData as any} isEdit={true}>
      <EditPageContent
        session={session}
        modal={modal}
        setModal={setModal}
        statusInfo={statusInfo}
        setStatusInfo={setStatusInfo}
        updateBlogPost={updateBlogPost}
        postId={Number(id)}
        isAISummaryModalOpen={isAISummaryModalOpen}
        setIsAISummaryModalOpen={setIsAISummaryModalOpen}
        postData={postData}
      />
    </FormProvider>
  );
}

interface EditPageContentProps {
  session: any;
  modal: ModalState;
  setModal: (modal: ModalState) => void;
  statusInfo: StatusInfo;
  setStatusInfo: (status: StatusInfo) => void;
  updateBlogPost: (data: any) => void;
  postId: number;
  isAISummaryModalOpen: boolean;
  setIsAISummaryModalOpen: (open: boolean) => void;
  postData?: any;
}

function EditPageContent({
  session,
  modal,
  setModal,
  statusInfo,
  setStatusInfo,
  updateBlogPost,
  postId,
  isAISummaryModalOpen,
  setIsAISummaryModalOpen,
  postData,
}: EditPageContentProps) {
  const { activeComponentKey, images, title, description, aiContent } =
    useFormContext();
  const [saveRequested, setSaveRequested] = useState(false);

  const components = {
    write: Write,
    generator: Generator,
    preview: Preview,
    setting: Setting,
  };

  /**
   * Validates and prepares images for update
   * Ensures only one thumbnail exists and tracks thumbYn changes
   */
  const validateAndPrepareImages = () => {
    const activeImages = images.filter((img) => img.active);

    // Validate exactly one thumbnail
    if (activeImages.length > 1) {
      throw new Error(
        "Only one featured image is allowed per post. Please select only one thumbnail image.",
      );
    }

    if (activeImages.length === 0) {
      throw new Error(
        "Please select at least one image and mark it as featured.",
      );
    }

    // Map all images to ensure thumbYn is correctly set
    return images.map((img) => ({
      ...img,
      thumbYn: img.active === true, // Convert active boolean to thumbYn boolean
    }));
  };

  const ActiveComponent =
    components[activeComponentKey as keyof typeof components] ||
    (() => <div>Invalid component key</div>);

  // Listen for save event from GeneratorHeader (edit mode)
  useEffect(() => {
    const handleSaveEvent = () => {
      console.log("[EditPageContent] Save event received");
      setSaveRequested(true);
    };

    window.addEventListener("blog-save-requested", handleSaveEvent);
    return () => {
      window.removeEventListener("blog-save-requested", handleSaveEvent);
    };
  }, []);

  // When save is requested, trigger the save logic
  useEffect(() => {
    if (saveRequested) {
      setSaveRequested(false);
      handleSave();
    }
  }, [saveRequested]);

  const handleSave = async () => {
    if (!session?.user?.id) {
      setModal({
        isOpen: true,
        title: "Login Required",
        description: "Please log in to edit posts",
      });
      return;
    }

    if (!title || title.trim() === "") {
      setModal({
        isOpen: true,
        title: "Title Required",
        description: "Please enter a title for your post",
      });
      return;
    }

    if (!description || description.trim() === "") {
      setModal({
        isOpen: true,
        title: "Description Required",
        description: "Please write a description for your post",
      });
      return;
    }

    if (images.length === 0) {
      setModal({
        isOpen: true,
        title: "Images Required",
        description: "Please add at least one image",
      });
      return;
    }

    // Check for thumbnail image (featured image)
    const thumbnailImages = images.filter((img) => img.active);
    if (thumbnailImages.length === 0) {
      setModal({
        isOpen: true,
        title: "Featured Image Required",
        description: "Please select at least one image and mark it as featured",
      });
      return;
    }

    // Ensure only one thumbnail image per post
    if (thumbnailImages.length > 1) {
      setModal({
        isOpen: true,
        title: "Only One Featured Image Allowed",
        description: "Please mark only one image as featured (thumbnail)",
      });
      return;
    }

    const thumbnailImage = thumbnailImages[0];

    // Check that thumbnail image has valid location data
    if (!thumbnailImage.lat || !thumbnailImage.lon) {
      setModal({
        isOpen: true,
        title: "Featured Image Location Required",
        description:
          "Please add location (latitude/longitude) to your featured image",
      });
      return;
    }

    // Verify all images have location data (matching new post validation)
    const imagesWithoutLocation = images.filter(
      (img) =>
        img.lat === undefined ||
        img.lon === undefined ||
        img.lat === null ||
        img.lon === null,
    );
    if (imagesWithoutLocation.length > 0) {
      setModal({
        isOpen: true,
        title: "Image Location Required",
        description: `Please add location (latitude/longitude) to all ${imagesWithoutLocation.length} image(s)`,
      });
      return;
    }

    setStatusInfo({
      type: "loading",
      title: "Updating Post",
      description: "Please wait...",
    });

    try {
      // Separate new uploads from existing images
      const newImages = images.filter(
        (img) => img.file && !img.imgId && !img.imgPath,
      );
      const existingImages = images.filter(
        (img) => img.imgId || img.imgPath || !img.file,
      );

      const uploadedImages: any[] = [];

      // Upload new images
      if (newImages.length > 0) {
        console.log("[EditBlogPost] Uploading new images...");
        const s3Paths = await uploadImagesToS3(
          newImages.map((img) => img.file!),
        );

        s3Paths.forEach((s3Path, idx) => {
          const originalImage = newImages[idx];
          // IMPORTANT: Only use active checkbox state to determine thumbYn
          const thumbYn = originalImage.active === true ? "Y" : "N";

          uploadedImages.push({
            imgFileName: originalImage.fileName,
            imgPath: s3Path,
            geoLat: (originalImage.lat || 0).toString(),
            geoLong: (originalImage.lon || 0).toString(),
            imgDtm:
              originalImage.createDate ||
              originalImage.imgDtm ||
              new Date().toISOString(),
            thumbYn: thumbYn,
          });
        });
      }

      // Combine existing and new images
      const finalImages = [
        ...existingImages.map((img) => {
          // Remove 'posts/' prefix from imgPath if it exists
          // imgPath might be stored as "posts/1764252482248_DSC00348.JPG" but backend expects "1764252482248_DSC00348.JPG"
          let cleanedImgPath = img.imgPath || "";
          if (cleanedImgPath.startsWith("posts/")) {
            cleanedImgPath = cleanedImgPath.substring(6); // Remove "posts/"
          }

          // IMPORTANT: Only use img.active (checkbox state) to determine thumbYn
          // If checkbox is checked (active=true) -> thumbYn="Y"
          // If checkbox is unchecked (active=false) -> thumbYn="N"
          const thumbYn = img.active === true ? ("Y" as const) : ("N" as const);

          const imageData = {
            imgFileName: img.imgFileName || img.fileName || "",
            imgPath: cleanedImgPath,
            geoLat: (img.geoLat || img.lat || 0).toString(),
            geoLong: (img.geoLong || img.lon || 0).toString(),
            imgDtm: img.imgDtm || img.createDate || new Date().toISOString(),
            thumbYn: thumbYn,
          };

          // Log thumbnail status changes
          console.log(
            `[EditBlogPost] Image: ${imageData.imgFileName}`,
            `| Original thumbYn: ${img.thumbYn}`,
            `| Checkbox Active: ${img.active}`,
            `| New thumbYn: ${imageData.thumbYn}`,
          );

          return imageData;
        }),
        ...uploadedImages,
      ];

      // Validate exactly one thumbnail BEFORE sending to backend
      const thumbnailCount = finalImages.filter(
        (img) => img.thumbYn === "Y",
      ).length;

      console.log(
        `[EditBlogPost] Thumbnail count validation: ${thumbnailCount} featured image(s)`,
      );

      if (thumbnailCount !== 1) {
        throw new Error(
          `Invalid thumbnail count: ${thumbnailCount}. Exactly one image must be marked as featured.`,
        );
      }

      console.log(
        "[EditBlogPost] ✓ Validation passed: Exactly 1 thumbnail found",
      );

      const userId =
        typeof session.user.id === "string"
          ? parseInt(session.user.id)
          : session.user.id;

      const aiGenText =
        aiContent && aiContent.length > 0 ? aiContent[0].content : "";

      const payload = {
        postId: postId,
        userId: userId,
        title: title,
        ogText: description,
        aiGenText: aiGenText,
        images: finalImages,
      };

      console.log(
        "[EditBlogPost] Payload to send:",
        JSON.stringify(payload, null, 2),
      );
      console.log("[EditBlogPost] Images count:", finalImages.length);
      console.log("[EditBlogPost] Thumbnail validation:", {
        total: finalImages.length,
        featured: thumbnailCount,
        images: finalImages.map((img) => ({
          fileName: img.imgFileName,
          thumbYn: img.thumbYn,
        })),
      });

      updateBlogPost(payload);
    } catch (error) {
      console.error("[EditBlogPost] Error:", error);
      setStatusInfo({ type: undefined });
      setModal({
        isOpen: true,
        title: "Error",
        description:
          error instanceof Error ? error.message : "An error occurred",
      });
    }
  };

  return (
    <div className="relative flex h-full w-full flex-col">
      <GeneratorHeader />
      <ActiveComponent />
      {statusInfo?.type && (
        <div className="absolute left-0 top-0 z-10 flex h-full w-full flex-col items-center justify-center gap-4 bg-black-primary p-10 text-center">
          <Loading
            type={statusInfo?.type}
            title={statusInfo?.title}
            description={statusInfo?.description}
            color="#A099FF"
          />
        </div>
      )}
      <ErrorModal
        isOpen={modal.isOpen}
        title={modal.title}
        description={modal.description}
        onClose={() => setModal({ ...modal, isOpen: false })}
      />
      <AISummaryModal
        open={isAISummaryModalOpen}
        onClose={() => setIsAISummaryModalOpen(false)}
        postData={{
          title: postData?.title || title,
          ogText: postData?.ogText || description,
          blogImgList: postData?.blogImgList || [],
        }}
      />
    </div>
  );
}
