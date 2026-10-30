import React, { useState } from "react";
import { ChevronRight, Clock, Star, Share2, Check, ExternalLink } from "lucide-react";
import type { SportsMatch } from "@/types";
import { shareMatchOnWhatsApp, copyMatchScorecard } from "@/utils/shareUtils";

interface MatchCardProps {
  match: SportsMatch;
  isPinned?: boolean;
  onTogglePin?: () => void;
  onOpenDetails: () => void;
}

export const MatchCard: React.FC<MatchCardProps> = ({
  match,
  isPinned = false,
  onTogglePin,
  onOpenDetails,
}) => {
  const [copied, setCopied] = useState(false);
  const isLive = match.status === "LIVE";
  const isUpcoming = match.status === "UPCOMING";
  const isRecent = match.status === "RECENT";

  const sportIcon =
    match.sport === "Football"
      ? "⚽"
      : match.sport === "Cricket"
        ? "🏏"
        : match.sport === "Basketball"
          ? "🏀"
          : match.sport === "Badminton"
            ? "🏸"
            : match.sport === "Hockey"
              ? "🏑"
              : match.sport === "Tennis"
                ? "🎾"
                : "🏆";

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    shareMatchOnWhatsApp(match);
  };

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const ok = await copyMatchScorecard(match);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const grassrootsUrl =
    match.sport === "Football"
      ? "https://khelgrid.com/trials?sport=Football"
      : match.sport === "Cricket"
        ? "https://khelgrid.com/academies?sport=Cricket"
        : "https://khelgrid.com";

  const grassrootsText =
    match.sport === "Football"
      ? "Explore Football Trials"
      : match.sport === "Cricket"
        ? "Find Cricket Academies"
        : "Grassroots Opportunities";

  return (
    <article
      onClick={onOpenDetails}
      className={`group relative flex flex-col justify-between rounded-2xl border p-4 shadow-sm transition-all cursor-pointer backdrop-blur-sm ${
        isLive
          ? "border-emerald-500/40 bg-slate-900/95 hover:border-emerald-500 hover:shadow-emerald-500/10"
          : "border-slate-800 bg-slate-900/80 hover:border-slate-700 hover:bg-slate-900"
      }`}
    >
      {/* Top Banner: Tournament & Live Status */}
      <div className="flex items-start justify-between gap-2 border-b border-slate-800/80 pb-2.5 text-xs">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="text-base shrink-0">{sportIcon}</span>
            <span className="font-bold text-slate-100 truncate" title={match.tournament}>
              {match.tournament}
            </span>
          </div>
          {match.stage && (
            <p className="text-[11px] text-emerald-400 font-medium truncate mt-0.5">
              {match.stage}
            </p>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase ${
              isLive
                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                : isUpcoming
                  ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                  : "bg-slate-800 text-slate-400 border border-slate-700"
            }`}
          >
            {isLive && <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />}
            {match.status}
          </span>

          {match.isStale && (
            <span className="rounded bg-amber-500/20 text-amber-300 text-[9px] px-1.5 py-0.5 font-mono">
              STALE
            </span>
          )}

          {onTogglePin && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onTogglePin();
              }}
              className="p-1 text-slate-500 hover:text-amber-400 transition cursor-pointer"
              title={isPinned ? "Unpin match" : "Pin favorite match"}
            >
              <Star
                className={`h-4 w-4 transition-colors ${
                  isPinned ? "fill-amber-400 text-amber-400" : "hover:text-amber-400"
                }`}
              />
            </button>
          )}
        </div>
      </div>

      {/* Center: Teams & Scores */}
      <div className="py-3.5 space-y-2.5">
        <div className="flex items-center justify-between text-sm font-bold text-slate-100">
          <div className="flex items-center gap-2 truncate">
            {match.teamA.logo ? (
              <img
                src={match.teamA.logo}
                alt=""
                className="h-4 w-4 object-contain inline-block shrink-0"
              />
            ) : (
              <span className="shrink-0">{match.teamA.flag || sportIcon}</span>
            )}
            <span className="truncate">{match.teamA.name}</span>
            <span className="text-xs font-mono text-slate-500 uppercase">
              ({match.teamA.code})
            </span>
          </div>
          <span
            className={`rounded-md px-2 py-0.5 font-mono text-xs font-bold border ${
              isLive
                ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                : "bg-slate-950 text-slate-300 border-slate-800"
            }`}
          >
            {match.teamA.score}
          </span>
        </div>

        <div className="flex items-center justify-between text-sm font-bold text-slate-100">
          <div className="flex items-center gap-2 truncate">
            {match.teamB.logo ? (
              <img
                src={match.teamB.logo}
                alt=""
                className="h-4 w-4 object-contain inline-block shrink-0"
              />
            ) : (
              <span className="shrink-0">{match.teamB.flag || sportIcon}</span>
            )}
            <span className="truncate">{match.teamB.name}</span>
            <span className="text-xs font-mono text-slate-500 uppercase">
              ({match.teamB.code})
            </span>
          </div>
          <span
            className={`rounded-md px-2 py-0.5 font-mono text-xs font-bold border ${
              isLive
                ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                : "bg-slate-950 text-slate-300 border-slate-800"
            }`}
          >
            {match.teamB.score}
          </span>
        </div>
      </div>

      {/* Highlight commentary */}
      {match.highlight && (
        <div className="rounded-xl bg-slate-950/60 p-2.5 text-[11px] text-slate-300 border border-slate-800/60 mb-2 line-clamp-1">
          {match.highlight}
        </div>
      )}

      {/* Grassroots Bridge Pill */}
      <div className="mb-3">
        <a
          href={grassrootsUrl}
          target="_blank"
          rel="noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-emerald-400/90 hover:text-emerald-300 transition"
        >
          <span>🎯 {grassrootsText} on KhelGrid</span>
          <ExternalLink className="h-2.5 w-2.5" />
        </a>
      </div>

      {/* Footer: Clock, WhatsApp Share & Match Info */}
      <div className="flex items-center justify-between border-t border-slate-800/80 pt-2.5 text-[11px] text-slate-400">
        <div className="flex items-center gap-1.5">
          <Clock className="h-3 w-3 text-slate-500" />
          <span>{match.matchClock || (isUpcoming ? "Upcoming" : "Finished")}</span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* 1-Click WhatsApp Share */}
          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center gap-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 px-2 py-1 text-[10px] font-semibold text-emerald-400 transition cursor-pointer"
            title="Share live scorecard on WhatsApp"
          >
            <Share2 className="h-3 w-3" />
            <span className="hidden sm:inline">WhatsApp</span>
          </button>

          {/* Copy Score Card */}
          <button
            type="button"
            onClick={handleCopy}
            className="rounded-lg border border-slate-800 bg-slate-950 hover:bg-slate-800 p-1 text-slate-400 hover:text-slate-200 transition cursor-pointer"
            title="Copy scorecard to clipboard"
          >
            {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <span className="text-[10px] px-1 font-mono">Copy</span>}
          </button>

          {/* Info Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenDetails();
            }}
            className="inline-flex items-center gap-1 rounded-lg bg-slate-800 hover:bg-emerald-600 hover:text-white px-2 py-1 text-[11px] font-semibold text-slate-300 transition-colors cursor-pointer"
          >
            <span>Details</span>
            <ChevronRight className="h-3 w-3" />
          </button>
        </div>
      </div>
    </article>
  );
};
