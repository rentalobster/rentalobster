import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="xp-window w-full max-w-sm">
        <div className="xp-titlebar">
          <span className="xp-titlebar-text">⚠ Page Not Found — Error 404</span>
          <div className="xp-close-btn">✕</div>
        </div>
        <div className="bg-[#ece9d8] p-6 text-center space-y-4">
          <div className="text-6xl">🦞</div>
          <div className="xp-sunken bg-white p-4 space-y-2">
            <div className="font-pixel text-[10px] mc-text-red">404</div>
            <div className="font-pixel text-[7px] text-[#000]">Page Not Found</div>
            <p className="font-retro text-[14px] text-[#555]">
              This page swam away. It either never existed or has been moved.
            </p>
          </div>
          <Link
            href="/"
            className="xp-button xp-button-primary inline-block text-[7px] px-6 py-2.5 no-underline"
          >
            ▶ Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
