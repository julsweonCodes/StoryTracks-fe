import { useEffect, useState, useRef } from "react";

interface Props {
  isOpen: boolean;
  button?: React.ReactNode;
  children: React.ReactNode;
  onNearEnd?: () => void;
  onRefetch?: () => void;
  showRefetchButton?: boolean;
  isLoadingMore?: boolean;
}

export default function Drawer({
  isOpen,
  button,
  children,
  onNearEnd,
  onRefetch,
  showRefetchButton,
  isLoadingMore,
}: Props) {
  const [isMounted, setIsMounted] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMounted(true); // 클라이언트에서만 렌더링
  }, []);

  // Handle scroll to detect when near the end
  const handleScroll = () => {
    if (!scrollContainerRef.current || !onNearEnd) return;

    const { scrollHeight, scrollTop, clientHeight } =
      scrollContainerRef.current;
    const distanceFromBottom = scrollHeight - (scrollTop + clientHeight);

    // Trigger when within 500px from bottom
    if (distanceFromBottom < 500) {
      onNearEnd();
    }
  };

  if (!isMounted) return null;

  return (
    <div
      className="absolute bottom-0 h-full w-full rounded-t-3xl bg-black-primary transition-transform"
      style={{
        transform: `translateY(${isOpen ? `0` : "calc(100% - 63px)"})`,
      }}
    >
      {button}
      <div className="relative h-full max-h-screen">
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex h-full flex-col gap-8 overflow-y-auto bg-black-primary p-[18px] pb-20"
        >
          {children}
        </div>

        {/* Refetch button in bottom right - positioned absolutely */}
        {showRefetchButton && (
          <button
            onClick={onRefetch}
            disabled={isLoadingMore}
            className="absolute bottom-8 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-key-primary text-black-primary shadow-lg transition-opacity hover:opacity-90 disabled:opacity-50"
            title="Load more posts"
          >
            {isLoadingMore ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-black-primary border-t-transparent" />
            ) : (
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 14l-7 7m0 0l-7-7m7 7V3"
                />
              </svg>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
