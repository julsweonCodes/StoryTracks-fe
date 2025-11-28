import { useFormContext, ImageInfo } from "@/context/form-context";
import { RiLightbulbFlashLine } from "react-icons/ri";
import { IoClose } from "react-icons/io5";
import UtilBar from "@/components/common/util-bar";
import MagicIcon from "@/components/icons/magic";
import { useState, useRef, ChangeEvent, ReactNode } from "react";
import ImageUploader from "./ai-generator/image-uploader";
import Textarea from "@/components/common/textarea";
import {
  useGenerateMutation,
  GenerateImageInfo,
} from "@/hooks/mutations/use-generate-mutation";
import Loading from "@/components/common/loading";
import { FiCopy, FiCheck } from "react-icons/fi";
import CameraIcon from "@/components/icons/camera";
import TextCircleIcon from "@/components/icons/text-circle";
import Image from "next/image";
import { LuUnderline, LuEye } from "react-icons/lu";
import { PiTextItalic } from "react-icons/pi";

interface AiModalState {
  isOpen: boolean;
  content: string;
  isLoading: boolean;
  error?: string;
}

export default function Write() {
  const {
    setActiveComponentKey,
    description,
    updateDescription,
    images,
    setImages,
    title,
    setTitle,
  } = useFormContext();
  const [showAiPrompt, setShowAiPrompt] = useState(true);
  const [aiModal, setAiModal] = useState<AiModalState>({
    isOpen: false,
    content: "",
    isLoading: false,
  });
  const [copySuccess, setCopySuccess] = useState(false);
  const [showImageUploadModal, setShowImageUploadModal] = useState(false);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [locationModalImage, setLocationModalImage] =
    useState<ImageInfo | null>(null);
  const [locationInput, setLocationInput] = useState({ lat: "", lon: "" });
  const [locationError, setLocationError] = useState("");
  const promptRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { mutate } = useGenerateMutation({
    onSuccess: (data) => {
      setAiModal({
        isOpen: true,
        content: data.genRes1,
        isLoading: false,
      });
    },
    onError: (error) => {
      setAiModal({
        isOpen: true,
        content: "",
        isLoading: false,
        error: "Failed to generate content. Please try again.",
      });
    },
  });

  const handleClosePrompt = () => {
    setShowAiPrompt(false);
  };

  const handleOpenPrompt = () => {
    setShowAiPrompt(true);
  };

  const handleGenerateAi = () => {
    if (images.length === 0 || description.length === 0) return;

    setAiModal({
      isOpen: true,
      content: "",
      isLoading: true,
    });

    const earliestDate = Math.min(
      ...images
        .filter((img) => img.createDate)
        .map((image) => new Date(image.createDate!).getTime()),
    );

    const imgInfo: GenerateImageInfo = {
      geoLat: (images[0]?.lat || 0).toString(),
      geoLong: (images[0]?.lon || 0).toString(),
      imgDtm: new Date(earliestDate).toISOString(),
    };

    mutate({ ogText: description, imgInfo });
  };

  const handleCopyContent = async () => {
    try {
      await navigator.clipboard.writeText(aiModal.content);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleCloseModal = () => {
    setAiModal({
      isOpen: false,
      content: "",
      isLoading: false,
    });
  };

  // Text formatting utilities - work with selected text
  const applyFormatting = (before: string, after: string = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = description.substring(start, end);

    if (!selectedText) return; // Only apply if text is selected

    const newText =
      description.substring(0, start) +
      before +
      selectedText +
      after +
      description.substring(end);

    updateDescription(newText);

    // Restore selection after state update
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + before.length,
        start + before.length + selectedText.length,
      );
    }, 0);
  };

  const applyBold = () => applyFormatting("**", "**");
  const applyItalic = () => applyFormatting("*", "*");
  const applyUnderline = () => applyFormatting("<u>", "</u>");

  // Markdown renderer for preview
  const renderMarkdown = (text: string) => {
    const parts: (string | ReactNode)[] = [];
    let currentIndex = 0;

    // Pattern to match markdown elements, img tags, and img-url tags
    // Matches: **text**, *text*, <u>text</u>, <img>filename</img>, <img-url>URL</img-url>
    const pattern =
      /\*\*(.+?)\*\*|\*(.+?)\*|<u>(.+?)<\/u>|<img>(.+?)<\/img>|<img-url>(.+?)<\/img-url>/g;
    let match: RegExpExecArray | null;

    while ((match = pattern.exec(text)) !== null) {
      // Add text before this match
      if (match.index > currentIndex) {
        parts.push(text.substring(currentIndex, match.index));
      }

      // Add the formatted element
      if (match[1]) {
        // Bold
        parts.push(
          <strong key={parts.length} className="font-bold">
            {match[1]}
          </strong>,
        );
      } else if (match[2]) {
        // Italic
        parts.push(
          <em key={parts.length} className="italic">
            {match[2]}
          </em>,
        );
      } else if (match[3]) {
        // Underline
        parts.push(
          <u key={parts.length} className="underline">
            {match[3]}
          </u>,
        );
      } else if (match[4]) {
        // Image (filename - for preview during editing)
        const filename = match[4];
        // Find the image with matching filename to get previewUrl (data URL from browser)
        const matchedImage = images.find(
          (img) => img.fileName === filename || img.imgFileName === filename,
        );
        parts.push(
          <div key={parts.length} className="my-4">
            <img
              src={matchedImage?.previewUrl || "/placeholder.png"}
              alt={filename}
              className="max-h-96 max-w-full rounded-lg"
            />
          </div>,
        );
      } else if (match[5]) {
        // Image URL (from S3 - for display after fetching)
        parts.push(
          <div key={parts.length} className="my-4">
            <img
              src={match[5]}
              alt="Blog image"
              className="max-h-96 max-w-full rounded-lg"
            />
          </div>,
        );
      }

      currentIndex = pattern.lastIndex;
    }

    // Add remaining text
    if (currentIndex < text.length) {
      parts.push(text.substring(currentIndex));
    }

    return parts.length > 0 ? parts : text;
  };

  const uploadImage = () => {
    setShowImageUploadModal(true);
  };

  const insertImageTag = (imageName: string) => {
    const imageTag = `\n<img>${imageName}</img>\n`;
    updateDescription(description + imageTag);
  };

  const setImageAsThumbnail = (image: ImageInfo) => {
    // Validate if image has metadata
    if (!image.lat || !image.lon) {
      setLocationModalImage(image);
      setLocationInput({ lat: "", lon: "" });
      setLocationError("");
      setShowLocationModal(true);
      return;
    }

    // Mark as thumbnail/active
    const updatedImages = images.map((img) =>
      img.id === image.id
        ? { ...img, active: true }
        : { ...img, active: false },
    );
    setImages(updatedImages);
  };

  const handleGetCurrentLocation = async () => {
    if (!locationModalImage) return;

    setLocationError("");

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;

          // Update the image with current location
          const updatedImages = images.map((img) =>
            img.id === locationModalImage.id
              ? { ...img, lat: latitude, lon: longitude, active: true }
              : { ...img, active: false },
          );
          setImages(updatedImages);

          // Close modal
          setShowLocationModal(false);
          setLocationModalImage(null);
        },
        (error) => {
          console.error("Geolocation error:", error);
          setLocationError(
            "Unable to get your location. Please enter it manually.",
          );
        },
      );
    } else {
      setLocationError("Geolocation is not supported by your browser.");
    }
  };

  const handleManualLocationSubmit = () => {
    if (!locationModalImage) return;

    const lat = parseFloat(locationInput.lat);
    const lon = parseFloat(locationInput.lon);

    // Validate latitude and longitude
    if (isNaN(lat) || isNaN(lon)) {
      setLocationError(
        "Please enter valid numbers for latitude and longitude.",
      );
      return;
    }

    if (lat < -90 || lat > 90) {
      setLocationError("Latitude must be between -90 and 90.");
      return;
    }

    if (lon < -180 || lon > 180) {
      setLocationError("Longitude must be between -180 and 180.");
      return;
    }

    // Update the image with manual location
    const updatedImages = images.map((img) =>
      img.id === locationModalImage.id
        ? { ...img, lat, lon, active: true }
        : { ...img, active: false },
    );
    setImages(updatedImages);

    // Close modal
    setShowLocationModal(false);
    setLocationModalImage(null);
    setLocationInput({ lat: "", lon: "" });
  };

  const deleteImage = (imageId: string) => {
    const imageToDelete = images.find((img) => img.id === imageId);
    const updatedImages = images.filter((img) => img.id !== imageId);
    setImages(updatedImages);

    // Also remove image tags from description
    if (imageToDelete) {
      let newDescription = description;

      // Remove <img>filename</img> tag
      const displayName = imageToDelete.fileName || imageToDelete.imgFileName;
      if (displayName) {
        const imageTag = `<img>${displayName}</img>`;
        newDescription = newDescription.replace(
          new RegExp(`\\n?${imageTag}\\n?`, "g"),
          "\n",
        );
      }

      // Also remove <img-url>URL</img-url> tag if it exists
      const s3Url = imageToDelete.imgPath || imageToDelete.previewUrl;
      if (s3Url) {
        const urlTag = `<img-url>${s3Url}</img-url>`;
        newDescription = newDescription.replace(
          new RegExp(`\\n?${urlTag}\\n?`, "g"),
          "\n",
        );
        // Also try to match S3 URL pattern more loosely
        newDescription = newDescription.replace(
          new RegExp(
            `<img-url>[^<]*${imageToDelete.imgPath?.split("/").pop() || ""}[^<]*</img-url>`,
            "g",
          ),
          "",
        );
      }

      // Clean up multiple newlines
      newDescription = newDescription.replace(/\n\n\n+/g, "\n\n").trim();
      updateDescription(newDescription);
    }
  };

  return (
    <>
      <div className="relative flex h-full w-full flex-col gap-0 overflow-hidden p-5 pb-0">
        {/* Title Section */}
        <div className="mb-4 w-full border-b border-black-secondary pb-3">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="h-[36px] w-full bg-black-primary text-[24px] text-white-primary placeholder:text-[24px] placeholder:text-[#7A7A7A]"
            placeholder="Title"
          />
        </div>

        {/* Button Group - Upload and Text Editing */}
        <div className="mb-4 flex gap-2">
          <button
            onClick={uploadImage}
            className="group relative flex h-[40px] w-[40px] items-center justify-center rounded-lg bg-[#262626] text-white-primary transition-colors hover:bg-[#323232]"
            title="Upload Images"
          >
            <CameraIcon />
            <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded bg-[#444444] px-2 py-1 text-[12px] text-white-primary opacity-0 transition-opacity group-hover:opacity-100">
              Upload Images
            </div>
          </button>
          <button
            onClick={applyBold}
            className="group relative flex h-[40px] w-[40px] items-center justify-center rounded-lg bg-[#262626] text-white-primary transition-colors hover:bg-[#323232]"
            title="Bold (select text first)"
          >
            <span className="text-[18px] font-bold">B</span>
            <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded bg-[#444444] px-2 py-1 text-[12px] text-white-primary opacity-0 transition-opacity group-hover:opacity-100">
              Bold
            </div>
          </button>
          <button
            onClick={applyItalic}
            className="group relative flex h-[40px] w-[40px] items-center justify-center rounded-lg bg-[#262626] text-white-primary transition-colors hover:bg-[#323232]"
            title="Italic (select text first)"
          >
            <PiTextItalic size={18} />
            <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded bg-[#444444] px-2 py-1 text-[12px] text-white-primary opacity-0 transition-opacity group-hover:opacity-100">
              Italic
            </div>
          </button>
          <button
            onClick={applyUnderline}
            className="group relative flex h-[40px] w-[40px] items-center justify-center rounded-lg bg-[#262626] text-white-primary transition-colors hover:bg-[#323232]"
            title="Underline (select text first)"
          >
            <LuUnderline size={18} />
            <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded bg-[#444444] px-2 py-1 text-[12px] text-white-primary opacity-0 transition-opacity group-hover:opacity-100">
              Underline
            </div>
          </button>
          <button
            onClick={() => setShowPreview(true)}
            className="group relative ml-auto flex h-[40px] w-[40px] items-center justify-center rounded-lg bg-[#262626] text-white-primary transition-colors hover:bg-[#323232]"
            title="Preview"
          >
            <LuEye size={18} />
            <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded bg-[#444444] px-2 py-1 text-[12px] text-white-primary opacity-0 transition-opacity group-hover:opacity-100">
              Preview
            </div>
          </button>
        </div>

        {/* Description Section with Inline Image Embedding */}
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto pb-6">
          {/* Textarea - Text Content */}
          <Textarea
            ref={textareaRef}
            value={description}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
              updateDescription(e.target.value)
            }
            placeholderContent={
              <p className="text-[15px] tracking-tight">
                Write a brief description or story about your images. This will
                help the AI generate better content.
                <br />
                <br />
                {`For example: 'A serene beach at sunset, with golden skies and waves gently lapping at the shore.'`}
              </p>
            }
          />

          {/* Preview Images Below Content with Thumbnail Toggle */}
          {images.length > 0 && (
            <div className="flex flex-col gap-2">
              <h4 className="text-[12px] font-semibold uppercase text-[#7A7A7A]">
                Embedded Images ({images.length})
              </h4>
              <div className="flex flex-wrap gap-2">
                {images.map((image, index) => {
                  console.log(
                    `[Write] Rendering image ${index}: id=${image.id}, fileName=${image.fileName}, active=${image.active}`,
                  );
                  return (
                    <div
                      key={image.id}
                      className="group relative flex flex-col"
                    >
                      <div
                        className="relative h-[60px] w-[60px] cursor-pointer overflow-hidden rounded-t-lg border border-[#444444] transition-colors hover:border-key-primary"
                        onClick={() =>
                          insertImageTag(
                            image.fileName || image.imgFileName || "",
                          )
                        }
                        title="Click to insert image tag into description"
                      >
                        <Image
                          src={image.previewUrl || "/placeholder.png"}
                          alt={`Image ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                        {/* Delete Button - Top Right */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteImage(image.id || "");
                          }}
                          className="text-white absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[12px] font-bold transition-colors hover:bg-red-600"
                          title="Delete image"
                        >
                          ×
                        </button>
                      </div>

                      {/* Thumbnail Checkbox - Bottom */}
                      <button
                        onClick={() => setImageAsThumbnail(image)}
                        className="flex h-6 w-full items-center justify-center rounded-b-lg border border-t-0 border-[#444444] bg-[#262626] transition-all hover:bg-[#323232]"
                        title="Set as thumbnail"
                      >
                        <div
                          className={`flex h-4 w-4 items-center justify-center rounded border-2 transition-all ${
                            image.active
                              ? "border-green-500 bg-green-500"
                              : "border-[#7A7A7A]"
                          }`}
                        >
                          {image.active && (
                            <span className="text-white text-xs font-bold">
                              ✓
                            </span>
                          )}
                        </div>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Image Upload Modal Trigger */}
        {showImageUploadModal && (
          <div className="bg-black fixed inset-0 z-50 flex items-center justify-center bg-opacity-50 p-4">
            <div className="relative flex max-h-[80vh] w-full max-w-2xl flex-col overflow-hidden rounded-lg bg-black-primary shadow-2xl">
              <div className="flex items-center justify-between border-b border-black-secondary px-6 py-4">
                <h3 className="text-lg font-semibold text-white-primary">
                  Upload Images
                </h3>
                <button
                  onClick={() => setShowImageUploadModal(false)}
                  className="text-[#A9A9A9] transition-colors hover:text-white-primary"
                >
                  <IoClose size={24} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-6 py-4">
                <ImageUploader
                  onUploadComplete={() => {
                    console.log("Upload complete, closing modal");
                    setShowImageUploadModal(false);
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {!showAiPrompt && (
          <button
            onClick={handleOpenPrompt}
            className="fixed bottom-8 right-8 flex h-[56px] w-[56px] items-center justify-center rounded-full bg-gradient-to-br from-green-300 via-blue-300 to-pink-300 shadow-lg transition-shadow hover:shadow-xl"
          >
            <MagicIcon color="#262626" size={24} />
          </button>
        )}

        {/* AI Prompt Card - Bottom */}
        {showAiPrompt && (
          <div
            ref={promptRef}
            className="mb-4 flex w-full flex-shrink-0 flex-col gap-3 rounded-lg bg-gradient-to-br from-green-300 via-blue-300 to-pink-300 p-4 shadow-lg"
          >
            <div className="flex items-start justify-between">
              <div className="flex h-[40px] w-[40px] flex-shrink-0 items-center justify-center rounded-lg bg-[#262626]">
                <RiLightbulbFlashLine className="text-green-300" size={20} />
              </div>
              <button
                onClick={handleClosePrompt}
                className="flex-shrink-0 transition-transform hover:scale-110"
              >
                <IoClose size={20} className="text-[#262626]" />
              </button>
            </div>
            <div>
              <h4 className="text-[15px] font-semibold text-black-primary">
                Try our new AI feature!
              </h4>
              <p className="text-[12px] tracking-tight text-black-primary">
                Generate a blog post summary using your images and descriptions.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                className="flex h-[48px] flex-1 items-center justify-center gap-2 rounded-lg bg-[#262626] text-white-primary transition-colors hover:bg-[#323232]"
                onClick={handleGenerateAi}
                disabled={images.length === 0 || description.length === 0}
              >
                <MagicIcon color="#ffffff" />
                Generate AI Summary
              </button>
            </div>
          </div>
        )}
      </div>

      {/* AI Results Modal */}
      {aiModal.isOpen && (
        <div className="bg-black fixed inset-0 z-50 flex items-center justify-center bg-opacity-50 p-4">
          <div className="relative flex max-h-[80vh] w-full max-w-2xl flex-col overflow-hidden rounded-lg bg-black-primary shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-black-secondary px-6 py-4">
              <h3 className="text-lg font-semibold text-white-primary">
                AI Generated Summary
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-[#A9A9A9] transition-colors hover:text-white-primary"
              >
                <IoClose size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {aiModal.isLoading ? (
                <div className="flex h-40 items-center justify-center">
                  <Loading type="loading" />
                </div>
              ) : aiModal.error ? (
                <div className="text-center text-red-400">
                  <p>{aiModal.error}</p>
                </div>
              ) : (
                <div className="prose prose-invert max-w-none">
                  <p className="whitespace-pre-wrap text-[14px] leading-6 text-[#E0E0E0]">
                    {aiModal.content}
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            {!aiModal.isLoading && !aiModal.error && (
              <div className="border-t border-black-secondary px-6 py-4">
                <button
                  onClick={handleCopyContent}
                  className="flex h-[48px] w-full items-center justify-center gap-2 rounded-lg bg-key-primary text-black-secondary transition-colors hover:bg-[#9b8fed]"
                >
                  {copySuccess ? (
                    <>
                      <FiCheck size={20} />
                      Copied!
                    </>
                  ) : (
                    <>
                      <FiCopy size={20} />
                      Copy Content
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && (
        <div className="bg-black fixed inset-0 z-50 flex items-center justify-center bg-opacity-50 p-4">
          <div className="relative flex max-h-[80vh] w-full max-w-4xl flex-col overflow-hidden rounded-lg border border-black-secondary bg-black-primary shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-black-secondary px-6 py-4">
              <h3 className="text-lg font-semibold text-white-primary">
                Preview
              </h3>
              <button
                onClick={() => setShowPreview(false)}
                className="flex h-8 w-8 items-center justify-center rounded transition-colors hover:bg-[#323232]"
              >
                <IoClose size={24} className="text-white-primary" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-6">
              {/* Title */}
              {title && (
                <h1 className="mb-6 text-4xl font-bold text-white-primary">
                  {title}
                </h1>
              )}

              {/* Description with markdown rendering */}
              <div className="prose prose-invert max-w-none whitespace-pre-wrap text-[15px] leading-7 text-[#D0D0D0]">
                {renderMarkdown(description)}
              </div>

              {/* Show message if no content */}
              {!title && !description && (
                <div className="text-center text-[#7A7A7A]">
                  <p>Add a title and description to preview your blog post</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Location Metadata Modal */}
      {showLocationModal && (
        <div className="bg-black fixed inset-0 z-50 flex items-center justify-center bg-opacity-50 p-4">
          <div className="relative flex max-h-[80vh] w-full max-w-md flex-col overflow-hidden rounded-lg border border-black-secondary bg-black-primary shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-black-secondary px-6 py-4">
              <h3 className="text-lg font-semibold text-white-primary">
                Set Image Location
              </h3>
              <button
                onClick={() => {
                  setShowLocationModal(false);
                  setLocationModalImage(null);
                  setLocationError("");
                }}
                className="text-[#A9A9A9] transition-colors hover:text-white-primary"
              >
                <IoClose size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-6 py-6">
              <p className="text-[14px] text-[#D0D0D0]">
                This image doesn't have location metadata. Choose how to set it:
              </p>

              {/* Option 1: Auto-detect current location */}
              <button
                onClick={handleGetCurrentLocation}
                className="flex h-[48px] items-center justify-center gap-2 rounded-lg bg-key-primary font-semibold text-black-secondary transition-colors hover:bg-[#9b8fed]"
              >
                📍 Use My Current Location
              </button>

              {/* Divider */}
              <div className="flex items-center gap-2">
                <div className="h-px flex-1 bg-black-secondary"></div>
                <span className="text-[12px] text-[#7A7A7A]">OR</span>
                <div className="h-px flex-1 bg-black-secondary"></div>
              </div>

              {/* Option 2: Manual entry */}
              <div className="flex flex-col gap-3">
                <div>
                  <label className="mb-2 block text-[12px] font-semibold text-[#A9A9A9]">
                    Latitude (-90 to 90)
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    value={locationInput.lat}
                    onChange={(e) =>
                      setLocationInput({
                        ...locationInput,
                        lat: e.target.value,
                      })
                    }
                    placeholder="e.g., 37.7749"
                    className="w-full rounded-lg border border-black-secondary bg-[#262626] px-3 py-2 text-white-primary placeholder:text-[#7A7A7A] focus:border-key-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-[12px] font-semibold text-[#A9A9A9]">
                    Longitude (-180 to 180)
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    value={locationInput.lon}
                    onChange={(e) =>
                      setLocationInput({
                        ...locationInput,
                        lon: e.target.value,
                      })
                    }
                    placeholder="e.g., -122.4194"
                    className="w-full rounded-lg border border-black-secondary bg-[#262626] px-3 py-2 text-white-primary placeholder:text-[#7A7A7A] focus:border-key-primary focus:outline-none"
                  />
                </div>

                <button
                  onClick={handleManualLocationSubmit}
                  className="mt-2 flex h-[48px] items-center justify-center gap-2 rounded-lg bg-[#262626] font-semibold text-white-primary transition-colors hover:bg-[#323232]"
                >
                  ✓ Confirm Location
                </button>
              </div>

              {/* Error message */}
              {locationError && (
                <div className="rounded-lg border border-red-500 bg-red-500 bg-opacity-20 p-3">
                  <p className="text-[13px] text-red-400">{locationError}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
