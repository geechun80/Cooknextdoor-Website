"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface ThumbnailButtonProps {
  videoUrl?: string;
  youtubeId?: string;
  thumbnailUrl?: string;
  title?: string;
  className?: string;
}

const getYouTubeThumbnail = (id: string) =>
  `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;

const getYouTubeEmbedUrl = (id: string) =>
  `https://www.youtube.com/embed/${id}?autoplay=1&rel=0`;

export const ThumbnailButton: React.FC<ThumbnailButtonProps> = ({
  videoUrl,
  youtubeId,
  thumbnailUrl,
  title = "Watch how it works",
  className = "",
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [buttonRect, setButtonRect] = useState<DOMRect | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const isYouTube = !!youtubeId;
  const finalThumbnail =
    thumbnailUrl ||
    (isYouTube ? getYouTubeThumbnail(youtubeId!) : undefined);
  const finalVideoUrl = isYouTube && youtubeId
    ? getYouTubeEmbedUrl(youtubeId)
    : videoUrl || "";

  const handleOpenModal = () => {
    if (buttonRef.current) {
      setButtonRect(buttonRef.current.getBoundingClientRect());
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => setIsModalOpen(false);

  const getTransformOrigin = () => {
    if (!buttonRect) return "center center";
    const cx = buttonRect.left + buttonRect.width / 2;
    const cy = buttonRect.top + buttonRect.height / 2;
    return `${cx}px ${cy}px`;
  };

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleCloseModal();
    };
    if (isModalOpen) document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [isModalOpen]);

  // Lock body scroll when modal open
  useEffect(() => {
    document.body.style.overflow = isModalOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isModalOpen]);

  return (
    <>
      <motion.button
        ref={buttonRef}
        initial={{ scale: 1 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleOpenModal}
        aria-label={title}
        className={cn(
          "relative overflow-hidden rounded-2xl",
          "bg-white/10 border border-white/25 hover:bg-white/20",
          "shadow-sm hover:shadow-md transition-all duration-200",
          "group focus:outline-none focus:ring-2 focus:ring-white/40",
          "p-2 w-max cursor-pointer",
          className
        )}
      >
        <div className="flex items-center gap-3 px-2">
          {/* Thumbnail preview */}
          <div className="relative w-[68px] h-[42px] rounded-lg overflow-hidden flex-shrink-0 bg-black/20">
            {finalThumbnail ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={finalThumbnail}
                alt="Video thumbnail"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-white/10" />
            )}
            {/* Play overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="p-1.5 rounded-full bg-white/90 shadow-sm">
                <svg
                  className="w-3 h-3 fill-gray-900 ml-0.5"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
            {isYouTube && (
              <div className="absolute bottom-1 right-1 bg-red-600 text-white text-[7px] font-bold px-1 py-0.5 rounded leading-none">
                YT
              </div>
            )}
          </div>

          {/* Label */}
          <span className="text-white font-semibold text-sm pr-1 whitespace-nowrap">
            {title}
          </span>

          {/* Play icon at end */}
          <svg
            className="w-4 h-4 text-white/70 group-hover:text-white transition-colors flex-shrink-0"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <polygon points="10 8 16 12 10 16 10 8" fill="currentColor" stroke="none" />
          </svg>
        </div>
      </motion.button>

      {/* Video Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={handleCloseModal}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
            aria-label="Video player"
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.1 }}
              transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="relative w-full max-w-4xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/10"
              style={{ transformOrigin: getTransformOrigin() }}
            >
              {/* Close button */}
              <button
                onClick={handleCloseModal}
                className="absolute top-3 right-3 z-10 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white border border-white/20 backdrop-blur-sm transition-all duration-200 cursor-pointer"
                aria-label="Close video"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {isYouTube ? (
                <iframe
                  src={finalVideoUrl}
                  className="w-full h-full"
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                  title={title}
                />
              ) : (
                <video
                  src={finalVideoUrl}
                  controls
                  autoPlay
                  className="w-full h-full"
                />
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ThumbnailButton;
