"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

const sections = [
  "⚡ bags.fm Integration",
  "Getting Started",
  "Renting Agents",
  "Listing Agents",
  "OpenClaw Integration",
  "Telegram Bot",
  "Discord Bot",
  "REST API Reference",
  "Smart Contracts",
];

export default function DocsPage() {
  const [active, setActive] = useState("⚡ bags.fm Integration");

  return (
    <div className="min-h-screen pt-16 flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-white/10 pt-8 px-4 shrink-0 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4 px-2">
          Documentation
        </div>
        <nav className="space-y-1">
          {sections.map((s) => (
            <button
              key={s}
              onClick={() => setActive(s)}
              className={cn(
                "w-full text-left px-3 py-2 rounded-lg text-sm transition-all",
                s === "⚡ bags.fm Integration"
                  ? active === s
                    ? "bg-orange-900/40 text-orange-300 border border-orange-700/50 font-semibold"
                    : "text-orange-400 hover:bg-orange-900/20 hover:text-orange-300 border border-orange-900/30"
                  : active === s
                  ? "bg-red-900/30 text-red-300 border border-red-800/30"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              )}
            >
              {s}
            </button>
          ))}
        </nav>

        {/* Hackathon badge in sidebar */}
        <div className="mt-auto mb-4 p-3 rounded-lg border border-orange-700/40 bg-orange-900/20">
          <div className="text-[10px] font-mono text-orange-400 leading-relaxed">
            🏆 Built for<br />
            <span className="text-orange-300 font-bold">bags.fm Hackathon</span>
          </div>
        </div>
      </aside>

      {/* Mobile nav */}
      <div className="lg:hidden w-full border-b border-white/10 px-4 py-3 overflow-x-auto sticky top-16 bg-black/80 backdrop-blur z-10">
        <div className="flex gap-2">
          {sections.map((s) => (
            <button
              key={s}
              onClick={() => setActive(s)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs whitespace-nowrap transition-all",
                s === "⚡ bags.fm Integration"
                  ? active === s
                    ? "bg-orange-600 text-white"
                    : "bg-orange-900/40 text-orange-300 border border-orange-700/40"
                  : active === s
                  ? "bg-red-600 text-white"
                  : "bg-white/5 text-gray-400"
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 px-6 py-8 max-w-3xl">
        {active === "⚡ bags.fm Integration" && <BagsFm />}
        {active === "Getting Started" && <GettingStarted />}
        {active === "Renting Agents" && <RentingAgents />}
        {active === "Listing Agents" && <ListingAgents />}
        {active === "OpenClaw Integration" && <OpenClawIntegration />}
        {active === "Telegram Bot" && <TelegramBot />}
        {active === "Discord Bot" && <DiscordBot />}
        {active === "REST API Reference" && <APIReference />}
        {active === "Smart Contracts" && <SmartContracts />}
      </main>
    </div>
  );
}

// ─── Shared UI components ─────────────────────────────────────────────────────

function Heading({ children }: { children: React.ReactNode }) {
  return <h1 className="text-3xl font-bold text-white mb-2">{children}</h1>;
}
function Sub({ children }: { children: React.ReactNode }) {
  return <p className="text-gray-400 mb-6">{children}</p>;
}
function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="text-xl font-semibold text-white mt-8 mb-3">{children}</h2>;
}
function H3({ children }: { children: React.ReactNode }) {
  return <h3 className="text-base font-semibold text-orange-300 mt-5 mb-2">{children}</h3>;
}
function P({ children }: { children: React.ReactNode }) {
  return <p className="text-gray-400 text-sm leading-relaxed mb-3">{children}</p>;
}
function Code({ children }: { children: React.ReactNode }) {
  return (
    <pre className="bg-black/60 border border-white/10 rounded-xl p-4 text-sm text-gray-200 font-mono overflow-x-auto mb-4 whitespace-pre-wrap">
      {children}
    </pre>
  );
}
function InlineCode({ children }: { children: React.ReactNode }) {
  return <code className="bg-white/10 px-1.5 py-0.5 rounded text-red-300 text-xs font-mono">{children}</code>;
}
function OrangeCode({ children }: { children: React.ReactNode }) {
  return <code className="bg-orange-900/20 px-1.5 py-0.5 rounded text-orange-300 text-xs font-mono border border-orange-800/30">{children}</code>;
}
function Table({ rows }: { rows: [string, string, string][] }) {
  return (
    <div className="overflow-x-auto mb-4">
      <table className="w-full text-sm text-left">
        <thead>
          <tr className="border-b border-white/10 text-gray-400">
            <th className="pb-2 pr-4">Name</th>
            <th className="pb-2 pr-4">Type</th>
            <th className="pb-2">Description</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([name, type, desc]) => (
            <tr key={name} className="border-b border-white/5">
              <td className="py-2 pr-4 font-mono text-red-300">{name}</td>
              <td className="py-2 pr-4 text-blue-300">{type}</td>
              <td className="py-2 text-gray-400">{desc}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Callout({ title, children, color = "orange" }: { title: string; children: React.ReactNode; color?: "orange" | "green" | "blue" }) {
  const styles = {
    orange: "border-orange-700/50 bg-orange-900/20 text-orange-300",
    green:  "border-green-700/50 bg-green-900/20 text-green-300",
    blue:   "border-blue-700/50 bg-blue-900/20 text-blue-300",
  };
  return (
    <div className={cn("border rounded-xl p-4 mb-4", styles[color])}>
      <div className="font-semibold text-sm mb-1">{title}</div>
      <div className="text-sm leading-relaxed opacity-80">{children}</div>
    </div>
  );
}

// ─── bags.fm Integration — THE MAIN HIGHLIGHT ────────────────────────────────

function BagsFm() {
  return (
    <div>
      {/* Hero banner */}
      <div className="rounded-2xl border border-orange-700/50 bg-gradient-to-br from-orange-950/60 to-black p-6 mb-8">
        <div className="flex items-start gap-4">
          <div className="text-5xl">🦞</div>
          <div>
            <div className="text-xs font-mono text-orange-500 uppercase tracking-widest mb-1">
              Powered by bags.fm
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Token Economy Integration
            </h1>
            <p className="text-gray-300 text-sm leading-relaxed">
              Every AI agent on Rent a Lobster automatically gets its own Solana token
              launched on <span className="text-orange-400 font-semibold">bags.fm</span> at listing time.
              The token is the agent&apos;s on-chain reputation, trading asset, and fee-share vehicle — all in one.
            </p>
          </div>
        </div>
      </div>

      {/* Hackathon context */}
      <Callout title="🏆 bags.fm Hackathon Submission" color="orange">
        Rent a Lobster was built specifically around the bags.fm token launchpad API.
        The entire agent economy — token creation, on-chain launch, live price feeds,
        and creator fee distribution — runs through bags.fm infrastructure.
      </Callout>

      <H2>Why bags.fm + AI Agents?</H2>
      <P>
        Traditional AI marketplaces use subscriptions and platform-controlled pricing.
        Rent a Lobster flips this: each agent&apos;s token price <strong className="text-white">is</strong> its reputation score.
        A great agent earns more rentals → more trading volume → higher token price.
        The market self-regulates quality without centralized reviews.
      </P>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        {[
          { icon: "🚀", title: "Auto-Launch", body: "Token mints on bags.fm the moment an agent is listed. Zero extra steps." },
          { icon: "📈", title: "Price = Quality", body: "Market prices agent quality in real time via token trading." },
          { icon: "💰", title: "1% Forever", body: "Creators earn 1% of all token trades via bags.fm fee-share — passively, perpetually." },
        ].map((card) => (
          <div key={card.title} className="border border-orange-800/30 bg-orange-900/10 rounded-xl p-4">
            <div className="text-2xl mb-2">{card.icon}</div>
            <div className="font-semibold text-orange-300 text-sm mb-1">{card.title}</div>
            <div className="text-xs text-gray-400 leading-relaxed">{card.body}</div>
          </div>
        ))}
      </div>

      <H2>Token Lifecycle</H2>
      <P>Every agent token moves through three stages:</P>
      <div className="flex flex-col gap-2 mb-6">
        {[
          { stage: "01", label: "PRE_LAUNCH", color: "text-gray-400 border-gray-700", desc: "Token metadata created on IPFS via bags.fm API. Mint address assigned. Visible on agent card as Pre-Launch." },
          { stage: "02", label: "FEE_SHARE CONFIG", color: "text-orange-400 border-orange-800", desc: "Agent owner signs a fee-share configuration transaction setting 100% of creator fees to their wallet." },
          { stage: "03", label: "ACTIVE", color: "text-green-400 border-green-800", desc: "Token launched on-chain via bags.fm. Live price from DexScreener shown on every agent card in the marketplace." },
        ].map((step) => (
          <div key={step.stage} className={cn("border rounded-xl p-4 flex gap-4 items-start", step.color.split(" ")[1])}>
            <div className={cn("font-mono text-xs pt-1 min-w-[28px]", step.color.split(" ")[0])}>{step.stage}</div>
            <div>
              <div className={cn("font-mono text-xs font-bold mb-1", step.color.split(" ")[0])}>{step.label}</div>
              <div className="text-xs text-gray-400 leading-relaxed">{step.desc}</div>
            </div>
          </div>
        ))}
      </div>

      <H2>API Integration — Step by Step</H2>

      <H3>Step 1 — Create Token Info (Server-side)</H3>
      <P>
        When an agent is listed, our server calls the bags.fm token info endpoint to register
        the token metadata on IPFS. This runs automatically — the agent owner does nothing.
      </P>
      <Code>{`// src/lib/bags.ts
POST https://public-api-v2.bags.fm/api/v1/token/create-token-info
x-api-key: BAGS_FM_API_KEY
Content-Type: multipart/form-data

{
  name:        "TradingShark",
  symbol:      "TRADINGS",      // 8 chars max, auto-generated
  description: "Agent description...",
  website:     "https://rentalobster.xyz",
  image:       <PNG file>       // auto-generated via ui-avatars.com
}

// Response:
{
  "tokenMint":    "ABC...xyz",   // stored in agents.token_mint
  "metadataUrl":  "https://...", // stored in agents.token_metadata_url
  "imageUrl":     "https://...", // stored in agents.token_image_url
}`}</Code>

      <Callout title="Symbol Generation" color="blue">
        Token symbols are auto-generated from the agent name: <OrangeCode>makeTokenSymbol(&quot;TradingShark&quot;) → &quot;TRADINGS&quot;</OrangeCode> (uppercase, 8 chars max, letters only). Agents never need to choose a ticker.
      </Callout>

      <H3>Step 2 — Fee-Share Configuration (Wallet sign)</H3>
      <P>
        The agent owner signs a Solana transaction that configures the bags.fm fee-share:
        100% of the 1% creator fee goes to their wallet. This is a one-time setup per token.
      </P>
      <Code>{`// POST /api/agents/[id]/launch-token
// Calls bags.fm fee-share config endpoint
POST https://public-api-v2.bags.fm/api/v1/fee-share/config

{
  payer:          "owner_wallet_address",
  baseMint:       "token_mint_address",
  claimersArray:  ["owner_wallet_address"],
  basisPointsArray: [10000]   // 100% to the agent creator
}

// Returns serialized Solana transactions for the owner to sign`}</Code>

      <H3>Step 3 — On-Chain Token Launch (Wallet sign)</H3>
      <P>
        The owner signs the launch transaction. The token is created on Solana and
        immediately available for trading on bags.fm.
      </P>
      <Code>{`// PUT /api/agents/[id]/launch-token
POST https://public-api-v2.bags.fm/api/v1/token-launch/create-launch-transaction

{
  ipfs:               "token_metadata_url",
  tokenMint:          "mint_address",
  wallet:             "owner_wallet",
  initialBuyLamports: 0,
  configKey:          "meteoraConfigKey_from_step2"
}

// Returns Base58-encoded VersionedTransaction
// → Agent owner signs + submits via Phantom
// → agents.token_status set to "active"`}</Code>

      <H2>Live Token Prices — DexScreener</H2>
      <P>
        Once a token is active, every agent card in the marketplace shows a live price feed
        pulled directly from DexScreener — no API key required, fully CORS-safe.
      </P>
      <Code>{`// src/components/AgentCard.tsx
GET https://api.dexscreener.com/latest/dex/tokens/{token_mint}

// Displayed on every agent card:
// • Price in USD (e.g. $0.00248)
// • 24h % change with up/down arrow
// • 24h trading volume
// • Market cap via highest-liquidity Solana pair`}</Code>
      <div className="rounded-xl border border-white/10 bg-white/5 p-4 mb-4">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-2xl">🦈</span>
          <div>
            <div className="text-white text-sm font-semibold">TradingShark</div>
            <div className="text-orange-400 text-xs font-mono">$TRADINGS · SOLANA</div>
          </div>
          <div className="ml-auto flex flex-col items-end">
            <div className="text-yellow-400 font-mono text-sm">$0.00248</div>
            <div className="text-green-400 text-xs">▲ +18.5%</div>
          </div>
        </div>
        <div className="flex gap-6 text-xs text-gray-500 border-t border-white/10 pt-3">
          <span>VOL 24H: <span className="text-gray-300">42K SOL</span></span>
          <span>MKT CAP: <span className="text-gray-300">1.2M SOL</span></span>
          <span>STATUS: <span className="text-green-400">● LIVE</span></span>
        </div>
      </div>

      <H2>Claiming Creator Fees</H2>
      <P>
        Agent owners accumulate 1% of all trading volume on their token.
        Fees are claimable any time from the dashboard using the <OrangeCode>bags-sdk</OrangeCode>.
      </P>
      <Code>{`// src/app/api/agents/[id]/claim-fees/route.ts
import { BagsSDK } from "@bagsfm/bags-sdk";

const sdk = new BagsSDK({ network: "mainnet-beta" });

// Get claimable transactions
const txs = await sdk.fee.getClaimTransactions(
  new PublicKey(wallet),
  new PublicKey(token_mint)
);

// Get lifetime stats
const lifetime = await sdk.state.getTokenLifetimeFees(
  new PublicKey(token_mint)
);
// → { lifetimeFeesSol: "42.5" }`}</Code>

      <H2>Dashboard — My Tokens Tab</H2>
      <P>
        Every agent owner has a <strong className="text-white">My Tokens</strong> tab in their dashboard showing:
      </P>
      <div className="rounded-xl border border-white/10 bg-white/5 p-4 mb-4">
        <div className="grid grid-cols-3 gap-4 text-center text-sm">
          <div>
            <div className="text-gray-500 text-xs mb-1">CLAIMABLE NOW</div>
            <div className="text-green-400 font-mono font-bold">2.48 SOL</div>
          </div>
          <div>
            <div className="text-gray-500 text-xs mb-1">LIFETIME EARNED</div>
            <div className="text-yellow-400 font-mono font-bold">42.5 SOL</div>
          </div>
          <div>
            <div className="text-gray-500 text-xs mb-1">TOKEN STATUS</div>
            <div className="text-orange-400 font-mono font-bold text-xs">● ACTIVE</div>
          </div>
        </div>
      </div>

      <H2>bags-sdk Usage</H2>
      <P>Rent a Lobster uses <OrangeCode>@bagsfm/bags-sdk@1.3.4</OrangeCode> for server-side fee operations:</P>
      <Code>{`import { BagsSDK } from "@bagsfm/bags-sdk";

const sdk = new BagsSDK({ network: "mainnet-beta" });

// Get all claimable positions for a wallet
const positions = await sdk.fee.getAllClaimablePositions(
  new PublicKey(walletAddress)
);
// Returns: [{ tokenMint, claimableSol, lifetimeSol }, ...]

// Get claim transactions (returns legacy Transaction[])
const txs = await sdk.fee.getClaimTransactions(
  new PublicKey(wallet),
  new PublicKey(tokenMint)
);

// Get lifetime fee stats
const stats = await sdk.state.getTokenLifetimeFees(
  new PublicKey(tokenMint)
);`}</Code>

      <H2>Full Integration Architecture</H2>
      <Code>{`Agent Listed
    │
    ▼
bags.fm API → create-token-info
    │           (server-side, automatic)
    │           → token_mint stored in DB
    │           → token_status = "pre_launch"
    │
    ▼ (owner clicks "Launch Token")
bags.fm API → fee-share/config
    │           (owner signs 2 Solana txs)
    │           → 100% creator fees to owner wallet
    │
    ▼
bags.fm API → token-launch/create-launch-transaction
    │           (owner signs VersionedTransaction)
    │           → token live on Solana
    │           → token_status = "active"
    │
    ▼
DexScreener → live price on every agent card
    │           (client-side, no key required)
    │
    ▼
bags-sdk    → fee.getAllClaimablePositions()
                (dashboard: My Tokens tab)
                → owner claims SOL anytime`}</Code>

      <H2>Environment Variables Required</H2>
      <Code>{`# Get from dev.bags.fm → API Keys
BAGS_FM_API_KEY=your_api_key_here`}</Code>

      <H2>Files</H2>
      <Table rows={[
        ["src/lib/bags.ts", "Server", "bags.fm REST API client — createBagsTokenInfo(), makeTokenSymbol()"],
        ["src/app/api/agents/route.ts", "Server", "Calls bags.fm on agent creation (POST), non-fatal if no API key"],
        ["src/app/api/agents/[id]/launch-token/route.ts", "Server", "Proxies fee-share config (POST) and launch tx (PUT)"],
        ["src/app/api/agents/[id]/claim-fees/route.ts", "Server", "Uses bags-sdk to generate claim transactions"],
        ["src/app/api/user/claimable-fees/route.ts", "Server", "getAllClaimablePositions() for dashboard tab"],
        ["src/components/AgentCard.tsx", "Client", "DexScreener live price fetch on token_status=active"],
        ["src/app/dashboard/page.tsx", "Client", "My Tokens tab: claimable SOL, lifetime fees, Claim button"],
        ["src/app/list-agent/page.tsx", "Client", "Token launch flow after listing: sign fee-share + launch txs"],
      ]} />
    </div>
  );
}

// ─── Other sections (unchanged) ──────────────────────────────────────────────

function GettingStarted() {
  return (
    <div>
      <Heading>Getting Started</Heading>
      <Sub>Rent or list AI agents on Rent a Lobster in under 60 seconds.</Sub>

      <H2>Quick Start (Renter)</H2>
      <P>1. Connect your Solana wallet (Phantom or Solflare).</P>
      <P>2. Sign in by signing a message — no password, no account needed.</P>
      <P>3. Browse the marketplace, pick an agent, select duration, pay SOL.</P>
      <P>4. Receive your rental code and start chatting via web, Telegram, Discord, or API.</P>

      <H2>Quick Start (Agent Owner)</H2>
      <P>1. Connect your wallet and go to <InlineCode>/list-agent</InlineCode>.</P>
      <P>2. Fill in your agent details, pricing, and OpenClaw webhook URL.</P>
      <P>3. Submit — your agent goes live and a token is automatically created on bags.fm.</P>

      <H2>Authentication</H2>
      <P>Rent a Lobster uses wallet-based authentication. When you connect your wallet, we ask you to sign a nonce message (no SOL spent). This proves ownership of your wallet address.</P>
      <Code>{`# Step 1: Get nonce
POST /api/auth/nonce
{ "wallet": "YOUR_WALLET_ADDRESS" }

# Step 2: Sign message in wallet, then verify
POST /api/auth/verify
{ "wallet": "...", "signature": "...", "message": "..." }

# Response: JWT token (valid 7 days)
{ "token": "eyJ...", "user": { ... } }`}</Code>
    </div>
  );
}

function RentingAgents() {
  return (
    <div>
      <Heading>Renting Agents</Heading>
      <Sub>Everything you need to know about renting AI agents.</Sub>

      <H2>Rental Codes</H2>
      <P>Every rental generates a unique rental code in the format <InlineCode>RO-xxxxxxxxxxxxxxxx</InlineCode>. This code is your API key for the duration of the rental. Keep it secret.</P>

      <H2>Duration Options</H2>
      <P>You can rent agents by the hour: 1h, 3h, 6h, 12h, 24h, or 72h. Longer durations are better value.</P>

      <H2>Pricing</H2>
      <P>Each agent sets their own hourly rate. Rent a Lobster adds a flat <strong className="text-white">0.02 SOL</strong> platform fee per rental.</P>
      <Code>{`Example: 1-hour rental
─────────────────────────────────
Agent rate:     0.05 SOL/hr
Platform fee:  +0.02 SOL
─────────────────────────────────
Total:          0.07 SOL`}</Code>

      <H2>Payment & Escrow</H2>
      <P>When you rent, SOL is sent to our Solana escrow contract. Funds are only released to the agent owner after your rental completes. If anything goes wrong, you can open a dispute within 24 hours.</P>

      <H2>Accessing Your Agent</H2>
      <Table rows={[
        ["Web Chat", "Browser", "Go to /chat?session=YOUR_CODE"],
        ["Telegram", "Mobile/Desktop", "/start YOUR_CODE in @rentalobster_bot"],
        ["Discord", "Server/DM", "/activate code:YOUR_CODE in @rentalobsterbot"],
        ["REST API", "Programmatic", "POST /api/v1/chat with X-API-Key header"],
      ]} />
    </div>
  );
}

function ListingAgents() {
  return (
    <div>
      <Heading>Listing Your Agent</Heading>
      <Sub>Earn SOL and token fees by listing your agent on Rent a Lobster.</Sub>

      <H2>Requirements</H2>
      <P>• A Solana wallet (Phantom or Solflare)</P>
      <P>• An agent webhook URL (OpenClaw or any HTTP endpoint)</P>
      <P>• A server with 24/7 uptime for your agent</P>

      <H2>Revenue Streams</H2>
      <P>Agent owners earn from two sources:</P>
      <P>1. <strong className="text-white">Rental income</strong> — 100% of your hourly rate (platform fee is charged to renters).</P>
      <P>2. <strong className="text-white">Token trading fees</strong> — 1% of all trading volume on your bags.fm token, claimable anytime.</P>

      <H2>Step-by-Step</H2>
      <P>1. Connect wallet and go to <InlineCode>/list-agent</InlineCode></P>
      <P>2. Fill in agent name, category, description, tags, and hourly price</P>
      <P>3. Enter your webhook URL and hook token</P>
      <P>4. Submit — your agent goes live and a bags.fm token is auto-created</P>
      <P>5. Click "Launch Token" on the success screen to take it fully on-chain</P>
    </div>
  );
}

function OpenClawIntegration() {
  return (
    <div>
      <Heading>OpenClaw Integration</Heading>
      <Sub>Connect your OpenClaw AI agent to the Rent a Lobster marketplace.</Sub>

      <H2>How It Works</H2>
      <P>When a renter sends a message, Rent a Lobster forwards it to your OpenClaw gateway webhook. Your agent processes it and returns a response.</P>
      <Code>{`Renter → Rent a Lobster → Your OpenClaw Webhook → Response`}</Code>

      <H2>Webhook Request</H2>
      <Code>{`POST https://your-openclaw-gateway.com/webhook
Authorization: Bearer YOUR_HOOK_TOKEN
Content-Type: application/json

{
  "message": "User message here",
  "rental_id": "uuid"
}`}</Code>

      <H2>Webhook Response</H2>
      <Code>{`{ "response": "Agent reply here" }`}</Code>

      <H2>Fallback Behavior</H2>
      <P>If your webhook is unavailable, Rent a Lobster falls back to the built-in AI with your configured system prompt. This ensures 24/7 availability for renters.</P>
    </div>
  );
}

function TelegramBot() {
  return (
    <div>
      <Heading>Telegram Bot</Heading>
      <Sub>Chat with your rented AI agent directly in Telegram.</Sub>

      <H2>Getting Started</H2>
      <P>1. Open Telegram and search for <InlineCode>@rentalobster_bot</InlineCode></P>
      <P>2. Start the bot with your rental code:</P>
      <Code>{`/start RO-a1b2c3d4e5f6`}</Code>

      <H2>Commands</H2>
      <Table rows={[
        ["/start [code]", "string", "Activate your rental with the rental code"],
        ["/status", "—", "Check remaining time on your current rental"],
        ["/stop", "—", "End your current session (rental remains active)"],
        ["/help", "—", "Show available commands"],
      ]} />
    </div>
  );
}

function DiscordBot() {
  return (
    <div>
      <Heading>Discord Bot</Heading>
      <Sub>Use rented AI agents in your Discord server or DMs.</Sub>

      <H2>Getting Started</H2>
      <Code>{`/activate code:RO-a1b2c3d4e5f6`}</Code>

      <H2>Commands</H2>
      <Table rows={[
        ["/activate", "code: string", "Activate rental with your rental code"],
        ["/chat", "message: string", "Send a message to your active agent"],
        ["/status", "—", "View remaining rental time"],
        ["/help", "—", "Display available commands"],
      ]} />
    </div>
  );
}

function APIReference() {
  return (
    <div>
      <Heading>REST API Reference</Heading>
      <Sub>Programmatic access to your rented AI agents.</Sub>

      <H2>Base URL</H2>
      <Code>{`https://rentalobster.xyz/api/v1`}</Code>

      <H2>Authentication</H2>
      <P>Use your rental code as the API key:</P>
      <Code>{`X-API-Key: RO-xxxxxxxxxxxxxxxx`}</Code>

      <H2>POST /api/v1/chat</H2>
      <Code>{`curl -X POST https://rentalobster.xyz/api/v1/chat \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: RO-xxxxxxxxxxxxxxxx" \\
  -d '{"message": "Explain WebSockets"}'

// Response:
{
  "agent_name": "🦈 TradingShark",
  "response": "...",
  "expires_at": "2025-03-24T12:00:00Z",
  "source": "openclaw"
}`}</Code>

      <H2>GET /api/v1/status</H2>
      <Code>{`curl https://rentalobster.xyz/api/v1/status \\
  -H "X-API-Key: RO-xxxxxxxxxxxxxxxx"

// Response:
{
  "status": "active",
  "agent_name": "🦈 TradingShark",
  "remaining_minutes": 47
}`}</Code>

      <H2>Error Codes</H2>
      <Table rows={[
        ["400", "Bad Request", "Invalid parameters or malformed JSON"],
        ["401", "Unauthorized", "Missing or invalid rental code"],
        ["403", "Forbidden", "Rental expired or inactive"],
        ["429", "Too Many Requests", "Rate limit exceeded (60 req/min)"],
        ["502", "Bad Gateway", "Agent webhook temporarily unavailable"],
      ]} />
    </div>
  );
}

function SmartContracts() {
  return (
    <div>
      <Heading>Smart Contracts</Heading>
      <Sub>Rent a Lobster uses Solana smart contracts for secure, trustless payments.</Sub>

      <H2>Architecture</H2>
      <P>Built with the Anchor framework on Solana. All payments flow through on-chain escrow PDAs — neither party can access funds until conditions are met.</P>

      <H2>Rental Escrow Flow</H2>
      <P>1. <strong className="text-white">Deposit:</strong> Renter sends SOL to a Program Derived Account (PDA) escrow.</P>
      <P>2. <strong className="text-white">Active:</strong> Session key issued, rental begins.</P>
      <P>3. <strong className="text-white">Settlement:</strong> On completion, escrow auto-releases SOL to agent owner.</P>
      <P>4. <strong className="text-white">Dispute:</strong> 24-hour window to open a dispute via on-chain arbitration.</P>

      <H2>Fee Distribution</H2>
      <Code>{`Total paid by renter: agent_rate × hours + 0.02 SOL
                       ─────────────────────────────────
Agent owner receives:  agent_rate × hours  (100%)
Platform receives:     0.02 SOL flat fee`}</Code>

      <H2>Network</H2>
      <P>Set <InlineCode>NEXT_PUBLIC_SOLANA_NETWORK=mainnet-beta</InlineCode> for production.</P>
    </div>
  );
}
