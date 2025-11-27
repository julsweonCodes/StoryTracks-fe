import Thumbnail from "@/components/common/thumbnail";
import GallerySendIcon from "@/components/icons/gallery-send";
import { ImageInfo, useFormContext } from "@/context/form-context";
import ErrorModal from "@/components/common/error-modal";
import exifr from "exifr";
import { useState } from "react";
import { convertToDecimal } from "@/utils/convert-to-decimal";

interface PreviewImage {
  id: string;
  url: string;
}

interface ImageUploaderProps {
  onUploadComplete?: () => void;
}

interface ModalState {
  isOpen: boolean;
  title: string;
  description: string;
}

const IMAGE_LIMIT = 10;

/**
 * Sanitize filename by replacing spaces with underscores
 * Best practice for URLs and file handling
 * @param fileName - Original file name
 * @returns Sanitized file name with spaces replaced by underscores
 */
const sanitizeFileName = (fileName: string): string => {
  return fileName.replace(/\s+/g, "_");
};

export default function ImageUploader({
  onUploadComplete,
}: ImageUploaderProps) {
  const { setImages, images, aiContent } = useFormContext();
  const [isLoading, setIsLoading] = useState(false);
  const [modal, setModal] = useState<ModalState>({
    isOpen: false,
    title: "",
    description: "",
  });

  const createPreview = async (file: File): Promise<PreviewImage> => {
    return new Promise((resolve, reject) => {
      try {
        const reader = new FileReader();

        reader.onload = () => {
          if (typeof reader.result === "string") {
            resolve({
              id: `${file.name}-${Date.now()}`,
              url: reader.result,
            });
          }
        };

        reader.onerror = () => {
          reject(new Error("Failed to read file"));
        };

        reader.readAsDataURL(file);
      } catch (error) {
        reject(error);
      }
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const files = e.target.files;
      if (!files || files.length === 0) return;

      // Check if adding files would exceed limit
      if (images.length >= IMAGE_LIMIT) {
        setModal({
          isOpen: true,
          title: "Image Limit Reached",
          description: `You can only add up to ${IMAGE_LIMIT} images.`,
        });
        return;
      }

      const remainingSlots = IMAGE_LIMIT - images.length;
      const fileArray = Array.from(files).slice(0, remainingSlots);

      if (fileArray.length < files.length) {
        setModal({
          isOpen: true,
          title: "Too Many Images",
          description: `You can only add ${remainingSlots} more image(s). Image limit is ${IMAGE_LIMIT}.`,
        });
      }

      setIsLoading(true);

      const validFiles: ImageInfo[] = [];
      const filesWithoutMetadata: ImageInfo[] = [];
      const invalidFiles: string[] = [];

      for (const file of fileArray) {
        const fileExtension = file.name.split(".").pop()?.toLowerCase();
        if (!["jpg", "jpeg", "png", "heic"].includes(fileExtension || "")) {
          invalidFiles.push(file.name);
          continue;
        }

        const previewInfo = await createPreview(file);
        const metadata = await exifr.parse(file);

        // Accept all images, but mark ones without metadata
        if (metadata?.CreateDate && metadata?.GPSLatitude) {
          validFiles.push({
            id: previewInfo.id,
            fileName: sanitizeFileName(file.name),
            createDate: metadata.CreateDate,
            lat: convertToDecimal(metadata.GPSLatitude, "N"),
            lon: convertToDecimal(metadata.GPSLongitude, "W"),
            previewUrl: previewInfo.url,
            file: file,
            active: false,
          });
        } else {
          // Images without metadata - use current date and default coordinates
          filesWithoutMetadata.push({
            id: previewInfo.id,
            fileName: sanitizeFileName(file.name),
            createDate: new Date().toISOString(),
            lat: 0,
            lon: 0,
            previewUrl: previewInfo.url,
            file: file,
            active: false,
          });
        }
      }

      const allProcessedFiles = [...validFiles, ...filesWithoutMetadata];

      if (invalidFiles.length > 0) {
        alert(
          `The following files were skipped due to invalid format:\n${invalidFiles.join("\n")}`,
        );
      }

      if (filesWithoutMetadata.length > 0) {
        const withoutMetadataNames = filesWithoutMetadata
          .map((f) => f.fileName)
          .join("\n");
        alert(
          `The following images do not have location metadata. You can set the thumbnail image manually:\n${withoutMetadataNames}`,
        );
      }

      setImages((prev) => [...prev, ...allProcessedFiles]);

      setIsLoading(false);
    } catch (error) {
      console.error("Error processing files:", error);
      setIsLoading(false);
      setModal({
        isOpen: true,
        title: "Error",
        description: "An error occurred while processing the images.",
      });
    }
  };

  const handleRemoveImage = (id: string) => {
    setImages((prev) => prev.filter((image) => image.id !== id));
  };

  const canAddMore = images.length < IMAGE_LIMIT;

  return (
    <div className="flex flex-col gap-4">
      {/* Image Limit Info */}
      <div className="text-[12px] text-[#7A7A7A]">
        Images added:{" "}
        <span className="font-semibold text-white-primary">
          {images.length}
        </span>{" "}
        / {IMAGE_LIMIT}
      </div>

      {/* Grid Layout 3x n */}
      <div className="grid grid-cols-3 gap-3">
        {/* Upload Button - Always in top left */}
        {canAddMore && (
          <label
            htmlFor="file-upload"
            className="flex aspect-square cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-[#444444] bg-[#262626] transition-colors hover:border-key-primary hover:bg-[#2d2d2d]"
          >
            <div className="flex flex-col items-center gap-1">
              <GallerySendIcon />
              <span className="text-[10px] text-[#7A7A7A]">Add</span>
            </div>
          </label>
        )}

        {/* Existing Images */}
        {images.map((preview) => (
          <div
            key={preview.id}
            className="group relative aspect-square overflow-hidden rounded-lg border border-[#444444]"
          >
            <Thumbnail
              src={preview.previewUrl as string}
              id={preview.id as string}
              onRemove={aiContent.length > 0 ? undefined : handleRemoveImage}
            />
          </div>
        ))}
      </div>

      {/* Hidden File Input */}
      <input
        id="file-upload"
        type="file"
        multiple
        accept="image/jpeg, image/jpg, image/png, image/heic"
        className="hidden"
        onChange={handleFileChange}
        disabled={!canAddMore || isLoading}
      />

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
