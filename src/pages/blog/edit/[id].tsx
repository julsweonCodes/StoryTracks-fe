import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import usePostsDetailQuery from "@/hooks/queries/use-posts-detail-query";
import useUpdateBlogPost from "@/hooks/mutations/use-update-blog-post";
import { uploadImagesToS3 } from "@/utils/s3-upload";
import ErrorModal from "@/components/common/error-modal";
import Loading from "@/components/common/loading";
import GeneratorHeader from "@/components/common/generator-header";
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
}

function EditPageContent({
  session,
  modal,
  setModal,
  statusInfo,
  setStatusInfo,
  updateBlogPost,
  postId,
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
    const thumbnailImage = images.find((img) => img.active);
    if (!thumbnailImage) {
      setModal({
        isOpen: true,
        title: "Featured Image Required",
        description: "Please select at least one image and mark it as featured",
      });
      return;
    }

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
          uploadedImages.push({
            imgFileName: originalImage.fileName,
            imgPath: s3Path,
            geoLat: (originalImage.lat || 0).toString(),
            geoLong: (originalImage.lon || 0).toString(),
            imgDtm:
              originalImage.createDate ||
              originalImage.imgDtm ||
              new Date().toISOString(),
            thumbYn:
              originalImage.active || originalImage.thumbYn === true
                ? "Y"
                : "N",
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

          return {
            imgFileName: img.imgFileName || img.fileName || "",
            imgPath: cleanedImgPath,
            geoLat: (img.geoLat || img.lat || 0).toString(),
            geoLong: (img.geoLong || img.lon || 0).toString(),
            imgDtm: img.imgDtm || img.createDate || new Date().toISOString(),
            thumbYn:
              img.active || img.thumbYn === true
                ? ("Y" as const)
                : ("N" as const),
          };
        }),
        ...uploadedImages,
      ];

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
      console.log("[EditBlogPost] Images details:", finalImages);

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
    </div>
  );
}
