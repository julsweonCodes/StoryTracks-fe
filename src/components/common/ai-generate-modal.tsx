import { useState } from "react";
import Modal from "./modal";
import { MdContentCopy, MdCheck } from "react-icons/md";

interface AIGenerateModalProps {
  open: boolean;
  onClose: () => void;
  onGenerate: (prompt: string) => Promise<string>;
  title?: string;
  placeholder?: string;
}

export default function AIGenerateModal({
  open,
  onClose,
  onGenerate,
  title = "Generate AI Text",
  placeholder = "Enter a prompt for AI to generate text...",
}: AIGenerateModalProps) {
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError("Please enter a prompt");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const generatedText = await onGenerate(prompt);
      setResult(generatedText);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate text");
      setResult("");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = () => {
    setPrompt("");
    setResult("");
    setError(null);
    setCopied(false);
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <div className="flex w-full max-w-2xl flex-col gap-4">
        {/* Title */}
        <h2 className="text-xl font-bold text-white-primary">{title}</h2>

        {/* Prompt Input */}
        <div>
          <label className="mb-2 block text-sm font-medium text-white-primary">
            Prompt
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={placeholder}
            disabled={isLoading}
            className="h-24 w-full rounded-lg border border-[#404040] bg-[#2a2a2a] p-3 text-white-primary focus:border-white-primary focus:outline-none disabled:opacity-50"
          />
        </div>

        {/* Error Message */}
        {error && <div className="text-sm text-red-500">{error}</div>}

        {/* Result Field */}
        {result && (
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="block text-sm font-medium text-white-primary">
                Result
              </label>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 rounded-lg bg-[#404040] px-3 py-1 text-sm text-white-primary transition-all hover:bg-[#505050]"
                title="Copy to clipboard"
              >
                {copied ? (
                  <>
                    <MdCheck size={16} />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <MdContentCopy size={16} />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            <div className="h-40 w-full overflow-y-auto rounded-lg border border-[#404040] bg-[#2a2a2a] p-3 text-white-primary">
              {result}
            </div>
          </div>
        )}

        {/* Loading Spinner */}
        {isLoading && (
          <div className="flex justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-white-primary" />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            onClick={handleGenerate}
            disabled={isLoading || !prompt.trim()}
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
