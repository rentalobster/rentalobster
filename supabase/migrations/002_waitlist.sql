-- Migration 002: Waitlist table for agent listing waitlist
create table if not exists waitlist (
  id         uuid primary key default uuid_generate_v4(),
  email      text unique not null,
  name       text,
  created_at timestamptz default now()
);
