-- Migration 001: Add bags.fm token columns to agents table
-- Run this in your Supabase SQL Editor after the initial schema.sql

alter table agents add column if not exists token_mint         text;
alter table agents add column if not exists token_symbol       text;
alter table agents add column if not exists token_metadata_url text;
alter table agents add column if not exists token_image_url    text;
alter table agents add column if not exists token_status       text default 'none';
-- token_status values: 'none' | 'pre_launch' | 'active'
