import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Search,
  RefreshCw,
  Volume2,
  VolumeX,
  Flame,
  Radio,
  Clock,
  Sparkles,
  Calendar,
  X,
  AlertCircle,
} from "lucide-react";
import type { SportsMatch, SportType, MatchStatus, LegalSource } from "@/types";
import { liveSportsEngine } from "@/services/LiveSportsEngine";
import { MatchCard } from "./MatchCard";
import { MatchDetailModal } from "./MatchDetailModal";
import { AttributionBadge } from "./AttributionBadge";
import { LiveSportsTicker } from "./LiveSportsTicker";

const SPORTS_LIST: { name: SportType; icon: string }[] = [
  { name: "All", icon: "⚡" },
  { name: "Football", icon: "⚽" },
  { name: "Cricket", icon: "🏏" },
  { name: "Badminton", icon: "🏸" },
  { name: "Hockey", icon: "🏑" },
  { name: "Kabaddi", icon: "🤼" },
  { name: "Tennis", icon: "🎾" },
  { name: "Basketball", icon: "🏀" },
];

export const LiveScoresView: React.FC = () => {
  const [matches, setMatches] = useState<SportsMatch[]>([]);
  const [selectedSport, setSelectedSport] = useState<SportType>("All");
  const [selectedStatus, setSelectedStatus] = useState<"ALL" | MatchStatus>("LIVE");
  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [activeModalMatch, setActiveModalMatch] = useState<SportsMatch | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [sources, setSources] = useState<LegalSource[]>([]);
  const [pinnedIds, setPinnedIds] = useState<Set<string>>(new Set());

  // Load scores from engine
  const loadScores = useCallback(async (force = false) => {
    setIsRefreshing(true);
    try {
      const data = await liveSportsEngine.getScores({ forceRefresh: force });
      setMatches(data.matches);
      setLastUpdated(data.lastUpdated);
      setSources(data.sources);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadScores(false);
    // Auto-poll every 30 seconds
    const timer = setInterval(() => {
      loadScores(false);
    }, 30000);
    return () => clearInterval(timer);
  }, [loadScores]);

  // Toggle Pinned
  const togglePin = (matchId: string) => {
    setPinnedIds((prev) => {
      const next = new Set(prev);
      if (next.has(matchId)) next.delete(matchId);
      else next.add(matchId);
      return next;
    });
  };

  // Filter calculations
  const filteredMatches = useMemo(() => {
    return matches.filter((m) => {
      // 1. Sport
      if (selectedSport !== "All" && m.sport !== selectedSport) return false;

      // 2. Status
      if (selectedStatus !== "ALL" && m.status !== selectedStatus) return false;

      // 3. Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const searchable = `${m.tournament} ${m.teamA.name} ${m.teamA.code} ${m.teamB.name} ${m.teamB.code} ${m.stage || ""} ${m.venue || ""}`.toLowerCase();
        if (!searchable.includes(q)) return false;
      }

      return true;
    });
  }, [matches, selectedSport, selectedStatus, searchQuery]);

  // Current sport match subset
  const currentSportMatches = useMemo(() => {
    if (selectedSport === "All") return matches;
    return matches.filter((m) => m.sport === selectedSport);
  }, [matches, selectedSport]);

  const liveCount = useMemo(() => currentSportMatches.filter((m) => m.status === "LIVE").length, [currentSportMatches]);
  const upcomingCount = useMemo(() => currentSportMatches.filter((m) => m.status === "UPCOMING").length, [currentSportMatches]);
  const recentCount = useMemo(() => currentSportMatches.filter((m) => m.status === "RECENT").length, [currentSportMatches]);
  const allCount = currentSportMatches.length;

  // Pinned vs Regular
  const { pinnedList, regularList } = useMemo(() => {
    const pinned: SportsMatch[] = [];
    const regular: SportsMatch[] = [];
    for (const m of filteredMatches) {
      if (pinnedIds.has(m.id)) pinned.push(m);
      else regular.push(m);
    }
    return { pinnedList: pinned, regularList: regular };
  }, [filteredMatches, pinnedIds]);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-3 sm:px-6 lg:px-8 py-6">
      {/* Top Banner / Hero */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight">
              KhelGrid Live Sports Center
            </h1>
            {liveCount > 0 && (
              <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 text-xs font-bold text-emerald-400">
                {liveCount} Live Now
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400">
            Real-time live scores, tournament fixtures, and automated auto-archiving. Zero fake data.
          </p>
        </div>

        {/* Toolbar: Refresh, Audio, Last Updated */}
        <div className="flex items-center gap-2 shrink-0">
          {lastUpdated && (
            <span className="text-[11px] font-mono text-slate-500 hidden sm:inline">
              Updated: {lastUpdated}
            </span>
          )}

          <button
            onClick={() => loadScores(true)}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-slate-100 transition disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin text-emerald-400" : ""}`} />
            <span>{isRefreshing ? "Updating..." : "Refresh"}</span>
          </button>

          <button
            onClick={() => setSoundEnabled((p) => !p)}
            className={`p-2 rounded-xl border transition cursor-pointer ${
              soundEnabled
                ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-400"
                : "border-slate-800 bg-slate-900 text-slate-500 hover:text-slate-300"
            }`}
            title={soundEnabled ? "Mute audio alerts" : "Enable score chimes"}
          >
            {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Embedded Live Pulse Ticker */}
      <LiveSportsTicker matches={matches} onSelectMatch={(m) => setActiveModalMatch(m)} />

      {/* Horizontal Sports Filter Selector */}
      <nav aria-label="Sports categories" className="no-scrollbar flex items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
        {SPORTS_LIST.map((sp) => {
          const isSelected = selectedSport === sp.name;
          const count =
            sp.name === "All"
              ? matches.length
              : matches.filter((m) => m.sport === sp.name).length;

          return (
            <button
              key={sp.name}
              onClick={() => setSelectedSport(sp.name)}
              className={`flex shrink-0 items-center gap-2 rounded-2xl border px-3.5 py-2 text-xs sm:text-sm font-semibold transition cursor-pointer ${
                isSelected
                  ? "border-emerald-500 bg-emerald-600 text-white shadow-lg shadow-emerald-500/20"
                  : "border-slate-800 bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              }`}
            >
              <span>{sp.icon}</span>
              <span>{sp.name}</span>
              <span className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                isSelected ? "bg-white/20 text-white" : "bg-slate-800 text-slate-400"
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Search & Status Sub-Filter Row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-3 backdrop-blur-md">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search teams, tournament or venue…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 rounded-xl bg-slate-950 border border-slate-800 pl-9 pr-8 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto [scrollbar-width:none]">
          {[
            { id: "LIVE", label: "In-Play", count: liveCount, isLive: true },
            { id: "ALL", label: "All Active", count: allCount },
            { id: "UPCOMING", label: "Scheduled (24h)", count: upcomingCount },
            { id: "RECENT", label: "Results (12h)", count: recentCount },
          ].map((tab) => {
            const isSelected = selectedStatus === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedStatus(tab.id as any)}
                className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
                  isSelected
                    ? "bg-slate-800 text-emerald-400 border border-emerald-500/30"
                    : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                }`}
              >
                {tab.isLive && (
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                )}
                <span>{tab.label}</span>
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                    isSelected
                      ? "bg-emerald-500/20 text-emerald-300"
                      : "bg-slate-800 text-slate-400"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Auto-Archiving Rule Notice */}
      <div className="flex items-center justify-between rounded-xl border border-slate-800/80 bg-slate-900/40 px-3.5 py-2 text-[11px] text-slate-400">
        <div className="flex items-center gap-2">
          <Clock className="h-3.5 w-3.5 text-emerald-400" />
          <span>
            <strong>Smart Auto-Archiving Active:</strong> Matches conclude and automatically roll off into the archive after 12 hours.
          </span>
        </div>
        <span className="font-mono text-slate-500 hidden sm:inline">Clean view guaranteed</span>
      </div>

      {/* Pinned Section */}
      {pinnedList.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-amber-400">
            Pinned Matches ({pinnedList.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pinnedList.map((m) => (
              <MatchCard
                key={m.id}
                match={m}
                isPinned={true}
                onTogglePin={() => togglePin(m.id)}
                onOpenDetails={() => setActiveModalMatch(m)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Regular Active Matches Grid */}
      <div className="space-y-3">
        {regularList.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {regularList.map((m) => (
              <MatchCard
                key={m.id}
                match={m}
                isPinned={pinnedIds.has(m.id)}
                onTogglePin={() => togglePin(m.id)}
                onOpenDetails={() => setActiveModalMatch(m)}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-12 text-center space-y-3">
            <AlertCircle className="mx-auto h-8 w-8 text-slate-500" />
            <h3 className="font-bold text-slate-200">
              {selectedStatus === "LIVE"
                ? `No ${selectedSport !== "All" ? selectedSport : ""} matches in-play right now`
                : "No matches found for current filter"}
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {selectedStatus === "LIVE"
                ? "Matches will automatically appear here with pulsing green indicators once in-play."
                : "No fixtures match your criteria right now. Check back shortly."}
            </p>
            {selectedStatus === "LIVE" && upcomingCount > 0 && (
              <div className="pt-2">
                <button
                  onClick={() => setSelectedStatus("UPCOMING")}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-500 transition cursor-pointer"
                >
                  View Scheduled Upcoming Matches ({upcomingCount})
                </button>
              </div>
            )}
            {selectedStatus !== "ALL" && (
              <div className="pt-1">
                <button
                  onClick={() => setSelectedStatus("ALL")}
                  className="text-xs text-emerald-400 hover:underline cursor-pointer"
                >
                  Or view all {allCount} active matches
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Match Details Modal */}
      <MatchDetailModal
        match={activeModalMatch}
        onClose={() => setActiveModalMatch(null)}
      />

      {/* Legal Attribution Notice */}
      <AttributionBadge sources={sources} />
    </div>
  );
};
