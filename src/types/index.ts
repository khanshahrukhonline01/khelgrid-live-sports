/**
 * Types & Domain Contracts for KhelGrid Live Sports Engine
 * Strictly follows KhelGrid Zero-Fabrication, Source Registry, and Auto-Archiving Rules.
 */

export type SportType =
  | "All"
  | "Cricket"
  | "Football"
  | "Badminton"
  | "Hockey"
  | "Kabaddi"
  | "Tennis"
  | "Basketball";

export type MatchStatus = "LIVE" | "UPCOMING" | "RECENT" | "ARCHIVED";

export interface SportsTeam {
  name: string;
  code: string;
  score: string;
  logo?: string;
  flag?: string;
}

export interface LegalSource {
  id: string;
  name: string;
  licence: string;
  termsUrl: string;
  termsCheckedAt: string;
  attributionText: string;
  displayAllowed: boolean;
  redistributeAllowed: boolean;
  maxRequestsPerDay: number;
}

export interface SportsMatch {
  id: string;
  externalId?: string;
  sport: SportType;
  tournament: string;
  stage?: string;
  status: MatchStatus;
  teamA: SportsTeam;
  teamB: SportsTeam;
  highlight?: string;
  matchClock?: string;
  venue?: string;
  scheduledAt?: string;
  startedAt?: string;
  endedAt?: string;
  lastUpdated: string;
  sourceId: string;
  sourceName: string;
  attributionText: string;
  displayAllowed: boolean;
  redistributeAllowed: boolean;
  isStale?: boolean;
}

export interface ActiveWindowOptions {
  /** How many hours after conclusion before a match auto-archives off the live view (default: 12) */
  concludedRetentionHours?: number;
  /** How many hours before scheduled start a fixture appears in upcoming (default: 24) */
  upcomingWindowHours?: number;
  /** Stale data threshold in minutes (default: 15 minutes without update during LIVE) */
  staleThresholdMinutes?: number;
}

export interface LiveSportsEngineState {
  matches: SportsMatch[];
  liveMatches: SportsMatch[];
  upcomingMatches: SportsMatch[];
  recentMatches: SportsMatch[];
  archivedMatches: SportsMatch[];
  selectedSport: SportType;
  selectedStatus: "ALL" | MatchStatus;
  searchQuery: string;
  isLoading: boolean;
  isRefreshing: boolean;
  lastUpdated: string | null;
  activeSources: LegalSource[];
  error: string | null;
}
