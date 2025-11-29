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
      <div className="w-full max-w-2xl flex flex-col gap-4">
        {/* Title */}
        <h2 className="text-xl font-bold text-white-primary">{title}</h2>

        {/* Prompt Input */}
        <div>
          <label className="block text-sm font-medium text-white-primary mb-2">
            Prompt
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={placeholder}
            disabled={isLoading}
            className="w-full h-24 rounded-lg bg-[#2a2a2a] text-white-primary p-3 border border-[#404040] focus:border-white-primary focus:outline-none disabled:opacity-50"
          />
        </div>

        {/* Error Message */}
        {error && <div className="text-red-500 text-sm">{error}</div>}

        {/* Result Field */}
        {result && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-white-primary">
                Result
              </label>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 px-3 py-1 rounded-lg bg-[#404040] hover:bg-[#505050] text-white-primary text-sm transition-all"
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
            <div className="w-full h-40 rounded-lg bg-[#2a2a2a] text-white-primary p-3 border border-[#404040] overflow-y-auto">
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
            className="flex-1 rounded-lg bg-white-primary text-black-primary font-medium py-2 hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isLoading ? "Generating..." : "Generate"}
          </button>
          <button
            onClick={handleClose}
            className="flex-1 rounded-lg bg-[#404040] text-white-primary font-medium py-2 hover:bg-[#505050] transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}
