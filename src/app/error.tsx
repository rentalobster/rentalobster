"use client";

import { useEffect } from "react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="xp-window w-full max-w-sm">
        <div className="xp-titlebar" style={{ background: "linear-gradient(180deg, #ff7777 0%, #cc0000 100%)" }}>
          <span className="xp-titlebar-text">⛔ RentalObster — Application Error</span>
          <div className="xp-close-btn">✕</div>
        </div>
        <div className="bg-[#ece9d8] p-6 space-y-4">
          <div className="flex gap-3 items-start xp-sunken bg-white p-3">
            <div className="text-4xl flex-shrink-0">⚠️</div>
            <div>
              <div className="font-pixel text-[7px] text-[#000] mb-1">Something went wrong</div>
              <p className="font-retro text-[14px] text-[#555]">
                An unexpected error occurred. Please try again.
              </p>
            </div>
          </div>
          <div className="flex gap-2 justify-center">
            <button
              onClick={reset}
              className="xp-button xp-button-primary text-[7px] px-5 py-2.5"
            >
              ↺ Try Again
            </button>
            <a
              href="/"
              className="xp-button text-[7px] px-5 py-2.5 no-underline"
            >
              🏠 Go Home
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
