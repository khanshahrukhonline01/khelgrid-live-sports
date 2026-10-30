-- ============================================================================
-- Supabase Migration: 20261030_live_sports_sources_and_matches.sql
-- Description: Creates the sources legal registry, matches table,
--              active-window view (with 12h auto-archiving), and strict RLS.
-- ============================================================================

-- 1. SOURCES REGISTRY
CREATE TABLE IF NOT EXISTS public.sources (
  id text PRIMARY KEY,
  name text NOT NULL,
  licence text NOT NULL,
  terms_url text NOT NULL,
  terms_checked_at timestamptz NOT NULL DEFAULT now(),
  attribution_text text NOT NULL,
  display_allowed boolean NOT NULL DEFAULT false,
  redistribute_allowed boolean NOT NULL DEFAULT false,
  max_requests_per_day integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Seed initial sources
INSERT INTO public.sources (
  id, name, licence, terms_url, terms_checked_at, attribution_text,
  display_allowed, redistribute_allowed, max_requests_per_day
) VALUES 
('khelgrid_internal', 'KhelGrid Proprietary Database', 'Proprietary', 'https://www.khelgrid.com/terms', now(), 'Data provided by KhelGrid', true, true, 1000000),
('api_football', 'API-Football (API-Sports)', 'API-Sports Free Developer Tier', 'https://api-sports.io/terms', now(), 'Data provided by API-Sports', true, false, 100),
('cricapi', 'CricketData.org', 'CricketData Free Developer Tier', 'https://cricketdata.org/terms.aspx', now(), 'Scores powered by CricketData.org', true, false, 100),
('cricsheet', 'Cricsheet.org', 'Open Data Commons Attribution License (ODC-By 1.0)', 'https://cricsheet.org/license/', now(), 'Data from Cricsheet.org (ODC-By 1.0)', true, true, 1000000),
('official_public_notice', 'Official Tournament Circulars', 'Official Public Notice', 'https://www.khelgrid.com/trust-center', now(), 'Official Organizer Notice', true, true, 1000000)
ON CONFLICT (id) DO UPDATE SET
  terms_checked_at = EXCLUDED.terms_checked_at,
  display_allowed = EXCLUDED.display_allowed,
  redistribute_allowed = EXCLUDED.redistribute_allowed;

-- 2. MATCHES TABLE
CREATE TABLE IF NOT EXISTS public.matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id text,
  source_id text NOT NULL REFERENCES public.sources(id) ON DELETE RESTRICT,
  sport text NOT NULL,
  tournament text NOT NULL,
  stage text,
  status text NOT NULL CHECK (status IN ('scheduled', 'live', 'finished', 'postponed', 'cancelled', 'archived')),
  home_team jsonb NOT NULL,
  away_team jsonb NOT NULL,
  match_clock text,
  venue text,
  scheduled_at timestamptz,
  started_at timestamptz,
  ended_at timestamptz,
  last_updated timestamptz NOT NULL DEFAULT now(),
  review_status text NOT NULL DEFAULT 'approved' CHECK (review_status IN ('needs_review', 'approved', 'rejected', 'expired')),
  raw_metadata jsonb DEFAULT '{}'::jsonb
);

CREATE UNIQUE INDEX IF NOT EXISTS matches_source_external_id_unique
  ON public.matches (source_id, external_id)
  WHERE external_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS matches_sport_status_idx ON public.matches (sport, status);
CREATE INDEX IF NOT EXISTS matches_scheduled_at_idx ON public.matches (scheduled_at);

-- 3. ACTIVE LIVE MATCHES VIEW (With 12-Hour Auto-Archiving)
CREATE OR REPLACE VIEW public.active_live_matches AS
SELECT 
  m.*,
  s.name AS source_name,
  s.attribution_text,
  s.display_allowed,
  s.redistribute_allowed
FROM public.matches m
JOIN public.sources s ON m.source_id = s.id
WHERE m.review_status = 'approved'
  AND (
    m.status = 'live'
    OR (m.status = 'scheduled' AND m.scheduled_at >= now() - interval '2 hours' AND m.scheduled_at <= now() + interval '24 hours')
    OR (m.status = 'finished' AND (m.ended_at >= now() - interval '12 hours' OR m.last_updated >= now() - interval '12 hours'))
  );

-- 4. ROW LEVEL SECURITY
ALTER TABLE public.sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY sources_public_read ON public.sources
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY matches_public_display ON public.matches
  FOR SELECT TO anon, authenticated USING (
    review_status = 'approved'
    AND EXISTS (
      SELECT 1 FROM public.sources s
      WHERE s.id = matches.source_id AND s.display_allowed = true
    )
  );

CREATE POLICY matches_service_write ON public.matches
  FOR ALL TO service_role USING (true) WITH CHECK (true);
