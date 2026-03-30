-- =========================================================
-- RentalObster — Supabase Schema
-- Run this in your Supabase SQL Editor to set up the DB
-- =========================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─── USERS ───────────────────────────────────────────────
create table if not exists users (
  id           uuid primary key default uuid_generate_v4(),
  wallet       text unique not null,
  username     text,
  avatar_emoji text default '🦞',
  created_at   timestamptz default now()
);

-- ─── AUTH NONCES ─────────────────────────────────────────
create table if not exists auth_nonces (
  wallet     text primary key,
  nonce      text not null,
  expires_at timestamptz not null
);

-- ─── AGENTS ──────────────────────────────────────────────
create table if not exists agents (
  id             uuid primary key default uuid_generate_v4(),
  owner_id       uuid references users(id) on delete cascade,
  name           text not null,
  emoji          text default '🤖',
  category       text not null,
  description    text not null,
  long_desc      text,
  tags           text[] default '{}',
  price_per_hour numeric(10,4) not null,
  is_available   boolean default true,
  total_rentals  int default 0,
  rating_sum     int default 0,
  rating_count   int default 0,
  avg_rating     numeric(3,2) generated always as (
    case when rating_count > 0 then round(rating_sum::numeric / rating_count, 2) else null end
  ) stored,
  response_speed text default '~1s',
  persona        text,              -- system prompt for AI
  webhook_url    text,              -- OpenClaw gateway webhook URL
  hook_token     text,              -- OpenClaw hook token for auth
  created_at     timestamptz default now()
);

-- ─── RENTALS ─────────────────────────────────────────────
create table if not exists rentals (
  id            uuid primary key default uuid_generate_v4(),
  agent_id      uuid references agents(id) on delete cascade,
  renter_id     uuid references users(id) on delete cascade,
  duration_hrs  numeric(8,2) not null,
  total_cost    numeric(10,4) not null,
  platform_fee  numeric(10,4) default 0.02,
  status        text default 'pending',   -- pending | active | completed | disputed | refunded
  session_key   text unique,
  tx_signature  text unique,               -- prevents replay attacks (legacy or nonce_hex)
  escrow_pubkey text unique,               -- on-chain escrow PDA address (escrow mode only)
  started_at    timestamptz,
  ends_at       timestamptz,
  created_at    timestamptz default now()
);

-- ─── REVIEWS ─────────────────────────────────────────────
create table if not exists reviews (
  id         uuid primary key default uuid_generate_v4(),
  rental_id  uuid references rentals(id) on delete cascade unique,  -- one review per rental
  agent_id   uuid references agents(id) on delete cascade,
  renter_id  uuid references users(id) on delete cascade,
  rating     int check (rating >= 1 and rating <= 5),
  comment    text,
  created_at timestamptz default now()
);

-- ─── CHAT MESSAGES ───────────────────────────────────────
create table if not exists chat_messages (
  id          uuid primary key default uuid_generate_v4(),
  rental_id   uuid references rentals(id) on delete cascade,
  role        text not null,   -- 'user' | 'assistant'
  content     text not null,
  created_at  timestamptz default now()
);

-- ─── INDEXES ─────────────────────────────────────────────
create index if not exists idx_agents_category     on agents(category);
create index if not exists idx_agents_is_available on agents(is_available);
create index if not exists idx_agents_owner_id     on agents(owner_id);
create index if not exists idx_rentals_renter_id   on rentals(renter_id);
create index if not exists idx_rentals_agent_id    on rentals(agent_id);
create index if not exists idx_rentals_session_key on rentals(session_key);
create index if not exists idx_rentals_status      on rentals(status);
create index if not exists idx_rentals_tx_sig      on rentals(tx_signature);
create index if not exists idx_rentals_escrow_key  on rentals(escrow_pubkey);
create index if not exists idx_chat_rental_id      on chat_messages(rental_id, created_at);
create index if not exists idx_reviews_agent_id    on reviews(agent_id);

-- ─── RLS POLICIES ────────────────────────────────────────
alter table users         enable row level security;
alter table auth_nonces   enable row level security;
alter table agents        enable row level security;
alter table rentals       enable row level security;
alter table reviews       enable row level security;
alter table chat_messages enable row level security;

-- Public read for agents
create policy "agents_public_read" on agents for select using (true);

-- Public read for reviews
create policy "reviews_public_read" on reviews for select using (true);

-- Service role bypass (our API uses service role key)
create policy "service_all_users"         on users         for all using (true);
create policy "service_all_nonces"        on auth_nonces   for all using (true);
create policy "service_all_agents"        on agents        for all using (true);
create policy "service_all_rentals"       on rentals       for all using (true);
create policy "service_all_reviews"       on reviews       for all using (true);
create policy "service_all_chat"          on chat_messages for all using (true);

-- ─── ATOMIC INCREMENT RPC ────────────────────────────────
-- Used by /api/rentals POST to safely increment total_rentals
create or replace function increment_agent_rentals(agent_id_param uuid)
returns void language sql security definer as $$
  update agents set total_rentals = total_rentals + 1 where id = agent_id_param;
$$;

-- ─── SEED AGENTS ─────────────────────────────────────────
-- Insert a system user for seeded agents
insert into users (id, wallet, username, avatar_emoji) values
  ('00000000-0000-0000-0000-000000000001', 'SYSTEM_SEED_WALLET', 'RentalObster Team', '🦞')
on conflict (wallet) do nothing;

insert into agents (owner_id, name, emoji, category, description, long_desc, tags, price_per_hour, is_available, total_rentals, rating_sum, rating_count, response_speed, persona) values
(
  '00000000-0000-0000-0000-000000000001',
  'CodeCrustacean', '🦀', 'Coding',
  'Full-stack code generation, debugging, and architecture advice. Supports 30+ languages.',
  'CodeCrustacean is a senior-level full-stack engineer AI that excels at writing clean, production-ready code. Specializes in TypeScript, Python, Rust, Go, and React. Can review architecture, debug complex issues, and write tests.',
  ARRAY['TypeScript','Python','Rust','Debugging'],
  0.05, true, 312, 1528, 312, '~1.2s',
  'You are CodeCrustacean, a senior full-stack software engineer AI agent on RentalObster. You write clean, production-ready code. You are precise, helpful, and always explain your reasoning. You specialize in TypeScript, Python, Rust, and React.'
),
(
  '00000000-0000-0000-0000-000000000001',
  'DeepDiver', '🐙', 'Research',
  'Advanced web research, summarization, and fact-checking with real-time data access.',
  'DeepDiver is a research powerhouse that can analyze complex topics, summarize papers, fact-check claims, and compile comprehensive reports. Ideal for market research, competitive analysis, and academic work.',
  ARRAY['Research','Analysis','Summaries','Reports'],
  0.04, true, 204, 979, 204, '~0.9s',
  'You are DeepDiver, an expert research analyst AI agent on RentalObster. You excel at breaking down complex topics, synthesizing information, and providing well-structured, accurate research summaries. Always cite your reasoning clearly.'
),
(
  '00000000-0000-0000-0000-000000000001',
  'QuillFish', '🐡', 'Writing',
  'Professional copywriting, blog posts, SEO content, and creative storytelling.',
  'QuillFish crafts compelling written content for any purpose. From SEO blog posts to creative fiction, ad copy to technical documentation — your words, elevated.',
  ARRAY['SEO','Blog','Creative','Copywriting'],
  0.03, true, 178, 844, 178, '~0.8s',
  'You are QuillFish, a professional creative writer and copywriter AI agent on RentalObster. You craft compelling, engaging content tailored to the user''s voice and goals. You understand SEO, storytelling, and persuasive writing.'
),
(
  '00000000-0000-0000-0000-000000000001',
  'TradingShark', '🦈', 'Trading',
  'On-chain trading signals, portfolio analysis, and DeFi strategy recommendations.',
  'TradingShark provides sharp DeFi and crypto trading insights. Portfolio breakdowns, yield farming strategies, on-chain data interpretation, and risk analysis — all in real time.',
  ARRAY['DeFi','Signals','Portfolio','Risk'],
  0.08, true, 509, 2494, 509, '~0.5s',
  'You are TradingShark, a DeFi and cryptocurrency trading analyst AI agent on RentalObster. You provide sharp, actionable trading insights, portfolio analysis, and DeFi strategy recommendations. Always include risk disclaimers.'
),
(
  '00000000-0000-0000-0000-000000000001',
  'DataOctopus', '🐚', 'Data',
  'Complex data analysis, visualization scripts, and ML model training pipelines.',
  'DataOctopus dives deep into datasets, writes analysis pipelines, creates visualization code, and guides ML model development. Python, pandas, sklearn, PyTorch — all in its tentacles.',
  ARRAY['ML','Python','Pandas','Visualization'],
  0.06, true, 133, 638, 133, '~1.5s',
  'You are DataOctopus, a data science and ML engineering AI agent on RentalObster. You write clean data analysis code, explain statistical concepts, and help build machine learning pipelines. You prefer Python and modern data science libraries.'
),
(
  '00000000-0000-0000-0000-000000000001',
  'SupportClam', '🐌', 'Support',
  '24/7 customer support automation, ticket routing, and FAQ generation.',
  'SupportClam handles customer inquiries with patience and precision. Great for drafting support responses, building FAQ docs, triaging tickets, and training support teams.',
  ARRAY['Support','Automation','FAQ','Tickets'],
  0.02, true, 89, 415, 89, '~0.4s',
  'You are SupportClam, a customer support specialist AI agent on RentalObster. You respond to customer inquiries with empathy, clarity, and professionalism. You help draft support responses, create FAQs, and handle escalations gracefully.'
),
(
  '00000000-0000-0000-0000-000000000001',
  'LegalLobster', '⚖️', 'Legal',
  'Contract drafting, legal research, and compliance guidance (not legal advice).',
  'LegalLobster helps with contract templates, legal research summaries, compliance checklists, and understanding legal documents. Always reminds you to consult a real attorney for binding matters.',
  ARRAY['Contracts','Compliance','Research','Drafting'],
  0.07, true, 67, 318, 67, '~1.0s',
  'You are LegalLobster, a legal research and drafting AI agent on RentalObster. You help users understand contracts, draft templates, and research legal topics. Always clarify that you provide information, not legal advice, and users should consult a licensed attorney for binding matters.'
),
(
  '00000000-0000-0000-0000-000000000001',
  'DesignCrab', '🎨', 'Design',
  'UI/UX guidance, design system creation, and Tailwind/CSS code generation.',
  'DesignCrab brings aesthetic intelligence. Generate beautiful Tailwind components, review UI/UX flows, build design system tokens, and get pixel-perfect feedback on your interfaces.',
  ARRAY['UI/UX','Tailwind','CSS','Design Systems'],
  0.04, true, 201, 964, 201, '~0.7s',
  'You are DesignCrab, a UI/UX designer and frontend developer AI agent on RentalObster. You create beautiful, accessible interface designs, write Tailwind CSS code, and provide detailed design feedback. You have exceptional taste and technical precision.'
)
on conflict do nothing;
