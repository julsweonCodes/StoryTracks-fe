import { useState } from "react";
import Modal from "./modal";
import { MdContentCopy, MdCheck } from "react-icons/md";

interface ImageResponse {
  imgId: number;
  postId: number;
  geoLat: string;
  geoLong: string;
  imgPath: string;
  imgFileName: string;
  imgDtm: string;
  rgstDtm: string;
  thumbYn: boolean;
  filePath: string;
}

// Flexible image type that accepts both ImageResponse and partial ImageInfo
type ImageLike =
  | Partial<ImageResponse>
  | {
      id?: string;
      lat?: number;
      lon?: number;
      createDate?: string;
      previewUrl?: string;
      fileName?: string;
      active?: boolean;
      file?: File;
      imgId?: number;
      postId?: number;
      geoLat?: string;
      geoLong?: string;
      imgPath?: string;
      imgFileName?: string;
      filePath?: string;
      thumbYn?: boolean;
      imgDtm?: string;
      rgstDtm?: string;
    };

interface AISummaryModalProps {
  open: boolean;
  onClose: () => void;
  postData: {
    title: string;
    ogText: string;
    blogImgList?: ImageLike[];
  };
}

interface GeneratePayload {
  title: string;
  ogText: string;
  blogImgList: ImageLike[];
  aiGuide: string;
}

export default function AISummaryModal({
  open,
  onClose,
  postData,
}: AISummaryModalProps) {
  const [aiGuide, setAiGuide] = useState("");
  const [generatedSummary, setGeneratedSummary] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);

  const handleGenerate = async () => {
    if (!aiGuide.trim()) {
      setError("Please enter your AI guide");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const payload: GeneratePayload = {
        title: postData.title,
        ogText: postData.ogText,
        blogImgList: postData.blogImgList || [],
        aiGuide,
      };

      console.log("[AISummaryModal] Sending payload:", payload);

      const response = await fetch(
        `/api/backend/ai/generate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );

      if (!response.ok) {
        throw new Error(`Failed to generate summary: ${response.status}`);
      }

      const result = await response.json();
      console.log("[AISummaryModal] API Response:", result);

      // Handle nested response format { data: { aiGenText: "..." } }
      let summary = "";

      if (result.data?.aiGenText && typeof result.data.aiGenText === "string") {
        summary = result.data.aiGenText;
      } else if (result.aiGenText && typeof result.aiGenText === "string") {
        summary = result.aiGenText;
      } else if (result.data && typeof result.data === "string") {
        summary = result.data;
      } else if (result.summary && typeof result.summary === "string") {
        summary = result.summary;
      } else if (result.content && typeof result.content === "string") {
        summary = result.content;
      } else if (typeof result === "string") {
        summary = result;
      }

      setGeneratedSummary(summary);
      setHasGenerated(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to generate summary",
      );
      setGeneratedSummary("");
      setHasGenerated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedSummary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = () => {
    if (generatedSummary) {
      const confirmed = window.confirm(
        "Are you sure you want to close? Generated AI text will be deleted.",
      );
      if (!confirmed) return;
    }

    setAiGuide("");
    setGeneratedSummary("");
    setError(null);
    setCopied(false);
    setHasGenerated(false);
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <div className="flex w-full max-w-2xl flex-col gap-6">
        {/* Section 1: AI Guide Input */}
        <div className="flex flex-col gap-3">
          <label className="text-sm font-medium text-white-primary">
            Tell me how your summary looks like
          </label>
          <textarea
            value={aiGuide}
            onChange={(e) => setAiGuide(e.target.value)}
            placeholder="e.g., Write in a professional tone, Add emojis, Mimic a travel blogger's voice, Keep it casual and friendly..."
            disabled={isLoading}
            className="h-[120px] w-full resize-none rounded-lg border border-[#404040] bg-[#2a2a2a] p-3 text-white-primary focus:border-white-primary focus:outline-none disabled:opacity-50"
          />
        </div>

        {/* Section 2: Generated Summary (only visible after generation) */}
        {generatedSummary && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-white-primary">
                This is your summary
              </label>
              <button
                onClick={handleCopy}
                disabled={!hasGenerated || isLoading}
                className="flex items-center gap-1 rounded-lg bg-[#404040] px-3 py-1 text-xs text-white-primary transition-all hover:bg-[#505050] disabled:cursor-not-allowed disabled:opacity-50"
                title="Copy to clipboard"
              >
                {copied ? (
                  <>
                    <MdCheck size={14} />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <MdContentCopy size={14} />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            <div className="max-h-[200px] overflow-y-auto rounded-lg border border-[#404040] bg-[#2a2a2a] p-3 text-white-primary">
              <div className="whitespace-pre-wrap text-sm text-[#E6E6E6]">
                {generatedSummary}
              </div>
            </div>
          </div>
        )}

        {/* Loading spinner */}
        {isLoading && (
          <div className="flex justify-center py-4">
            <div className="h-6 w-6 animate-spin rounded-full border-4 border-gray-300 border-t-white-primary" />
          </div>
        )}

        {/* Error Message */}
        {error && <div className="text-sm text-red-500">{error}</div>}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleGenerate}
            disabled={isLoading || !aiGuide.trim()}
            className="flex-1 rounded-lg bg-white-primary py-2 font-medium text-black-primary transition-all hover:bg-opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? "Generating..." : "Generate"}
          </button>
          <button
            onClick={handleClose}
            className="flex-1 rounded-lg bg-[#404040] py-2 font-medium text-white-primary transition-all hover:bg-[#505050]"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}
