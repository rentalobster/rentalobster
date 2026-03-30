import { Github, Twitter, Send } from "lucide-react";

const links = {
  Product: ["Marketplace", "How It Works", "Pricing", "Changelog"],
  Developers: ["API Docs", "Discord Bot", "Telegram Bot", "SDKs"],
  Company: ["About", "Blog", "Careers", "Contact"],
  Legal: ["Privacy Policy", "Terms of Service", "Smart Contract Audit"],
};

export default function Footer() {
  return (
    <footer className="xp-taskbar border-t-2 pt-0 pb-0">
      <div className="xp-window m-4 mb-2">
        <div className="xp-titlebar">
          <span className="xp-titlebar-text">🦞 RentalObster — All rights reserved © 2025</span>
          <div className="flex gap-0.5">
            <div className="w-4 h-3.5 bg-[#d4d0c8] border border-[#404040] flex items-center justify-center text-[8px]"
                 style={{ boxShadow: "inset -1px -1px #808080, inset 1px 1px #fff" }}>_</div>
            <div className="w-4 h-3.5 bg-[#d4d0c8] border border-[#404040] flex items-center justify-center text-[8px]"
                 style={{ boxShadow: "inset -1px -1px #808080, inset 1px 1px #fff" }}>□</div>
            <div className="xp-close-btn">✕</div>
          </div>
        </div>

        <div className="bg-[#ece9d8] p-4">
          <div className="max-w-6xl mx-auto grid grid-cols-2 lg:grid-cols-5 gap-6 mb-6">
            {/* Brand */}
            <div className="col-span-2 lg:col-span-1">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">🦞</span>
                <span className="font-pixel text-[8px] mc-text-gold">RentalObster</span>
              </div>
              <p className="font-retro text-[14px] text-[#555] leading-tight mb-4">
                The decentralized AI agent rental marketplace, powered by Solana.
              </p>
              <div className="flex items-center gap-2">
                <a href="#" className="xp-button p-1.5"><Github className="w-3 h-3" /></a>
                <a href="#" className="xp-button p-1.5"><Twitter className="w-3 h-3" /></a>
                <a href="#" className="xp-button p-1.5"><Send className="w-3 h-3" /></a>
              </div>
            </div>

            {/* Link columns */}
            {Object.entries(links).map(([group, items]) => (
              <div key={group}>
                <div className="font-pixel text-[6px] text-[#000] mb-2">{group}</div>
                <ul className="space-y-1.5">
                  {items.map((item) => (
                    <li key={item}>
                      <a href="#" className="font-retro text-[14px] text-[#555] hover:text-[#0054e3] no-underline transition-colors">
                        ▶ {item}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Status bar */}
          <div className="xp-sunken bg-[#d4d0c8] px-3 py-1 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span className="font-retro text-[13px] text-[#333]">
              © 2025 RentalObster. All rights reserved.
            </span>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-[#55ff55] animate-mc-flicker inline-block" />
              <span className="font-retro text-[13px] text-[#333]">All systems operational</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
