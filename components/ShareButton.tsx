// components/ShareButton.tsx
"use client";

import React, { useState } from 'react';
// Optionally, you can use Heroicons for icons (install with: npm install @heroicons/react)
import { ClipboardDocumentCheckIcon, ShareIcon } from '@heroicons/react/24/solid';

interface ShareButtonProps {
  url: string;
  message?: string;
}

export default function ShareButton({ url, message }: ShareButtonProps) {
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleShare = async () => {
    // Use the Web Share API if available
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Campus Confessions",
          text: message,
          url,
        });
        setFeedback("Shared successfully!");
      } catch (error) {
        console.error("Error using Web Share API:", error);
        setFeedback("Error sharing. Please try copying the link.");
      }
    } else if (navigator.clipboard) {
      // Fallback: copy the URL to the clipboard
      try {
        await navigator.clipboard.writeText(url);
        setFeedback("Link copied to clipboard!");
      } catch (error) {
        console.error("Clipboard copy failed:", error);
        setFeedback("Failed to copy link.");
      }
    } else {
      setFeedback("Sharing not supported on this browser.");
    }
    // Clear feedback after 3 seconds
    setTimeout(() => setFeedback(null), 3000);
  };

  return (
    <div className="flex flex-col items-center">
      <button
        onClick={handleShare}
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 rounded-md transition"
      >
        <ShareIcon className="w-5 h-5" />
        <span>Share</span>
      </button>
      {feedback && (
        <div className="mt-2 text-sm text-green-300 flex items-center gap-1">
          <ClipboardDocumentCheckIcon className="w-4 h-4" />
          {feedback}
        </div>
      )}
    </div>
  );
}
