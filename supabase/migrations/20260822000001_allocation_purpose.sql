-- Migration: Add purpose column to budget_buckets if not already present
-- Supports user-defined purpose/intent for each allocation bucket (e.g. Kingdom giving, emergency cushion)

alter table public.budget_buckets 
add column if not exists purpose text;

-- Add comment describing the column
comment on column public.budget_buckets.purpose is 'User-defined purpose or intent for this allocation envelope.';
