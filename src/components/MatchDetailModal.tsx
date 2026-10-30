import React, { useState } from "react";
import { X, Clock, MapPin, Trophy, ShieldCheck, Share2, Check, ExternalLink, Sparkles } from "lucide-react";
import type { SportsMatch } from "@/types";
import { shareMatchOnWhatsApp, copyMatchScorecard } from "@/utils/shareUtils";

interface MatchDetailModalProps {
  match: SportsMatch | null;
  onClose: () => void;
}

export const MatchDetailModal: React.FC<MatchDetailModalProps> = ({ match, onClose }) => {
  const [copied, setCopied] = useState(false);
  if (!match) return null;

  const isLive = match.status === "LIVE";
  const isUpcoming = match.status === "UPCOMING";

  const handleShare = () => {
    shareMatchOnWhatsApp(match);
  };

  const handleCopy = async () => {
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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-lg rounded-3xl border border-slate-800 bg-slate-900 p-6 text-slate-100 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xl">
                {match.sport === "Football" ? "⚽" : match.sport === "Cricket" ? "🏏" : "🏆"}
              </span>
              <h3 className="font-bold text-base text-slate-100">{match.tournament}</h3>
            </div>
            {match.stage && <p className="text-xs text-emerald-400 font-medium">{match.stage}</p>}
          </div>

          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-100 transition cursor-pointer"
            aria-label="Close match details"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Teams & Scores Comparison */}
        <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 space-y-4">
          <div className="flex items-center justify-between text-sm sm:text-base font-bold">
            <div className="flex items-center gap-2.5">
              {match.teamA.logo ? (
                <img src={match.teamA.logo} alt="" className="h-6 w-6 object-contain" />
              ) : (
                <span className="text-xl">{match.teamA.flag || "🏆"}</span>
              )}
              <span>{match.teamA.name}</span>
              <span className="text-xs font-mono text-slate-400 uppercase">({match.teamA.code})</span>
            </div>
            <span className="rounded-lg bg-emerald-500/15 px-3 py-1 font-mono text-emerald-400 text-sm font-bold border border-emerald-500/30">
              {match.teamA.score}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm sm:text-base font-bold">
            <div className="flex items-center gap-2.5">
              {match.teamB.logo ? (
                <img src={match.teamB.logo} alt="" className="h-6 w-6 object-contain" />
              ) : (
                <span className="text-xl">{match.teamB.flag || "🏆"}</span>
              )}
              <span>{match.teamB.name}</span>
              <span className="text-xs font-mono text-slate-400 uppercase">({match.teamB.code})</span>
            </div>
            <span className="rounded-lg bg-emerald-500/15 px-3 py-1 font-mono text-emerald-400 text-sm font-bold border border-emerald-500/30">
              {match.teamB.score}
            </span>
          </div>
        </div>

        {/* Highlights / Commentary */}
        {match.highlight && (
          <div className="rounded-xl border border-slate-800/80 bg-slate-800/30 p-3 text-xs space-y-1">
            <span className="font-semibold text-slate-400 uppercase tracking-wider text-[10px]">
              Match Situation
            </span>
            <p className="text-slate-200 leading-relaxed font-mono">{match.highlight}</p>
          </div>
        )}

        {/* Meta details */}
        <div className="grid grid-cols-2 gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Clock className="h-3.5 w-3.5 text-slate-500 shrink-0" />
            <span>Clock: <strong className="text-slate-200">{match.matchClock || "Scheduled"}</strong></span>
          </div>
          {match.venue && (
            <div className="flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5 text-slate-500 shrink-0" />
              <span className="truncate">Venue: <strong className="text-slate-200">{match.venue}</strong></span>
            </div>
          )}
        </div>

        {/* Grassroots Opportunities Bridge */}
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-300">
            <Sparkles className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>Inspired by the match? Play on KhelGrid!</span>
          </div>
          <p className="text-[11px] text-slate-300">
            Discover verified grassroots scouting trials, sports academies, and booking turfs across India.
          </p>
          <div className="pt-1">
            <a
              href={grassrootsUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 hover:underline"
            >
              <span>Explore {match.sport} Trials & Academies on KhelGrid</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>

        {/* Legal Attribution Notice */}
        <div className="rounded-xl border border-slate-800/80 bg-slate-950/80 p-3 text-[11px] text-slate-400 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>Source: <strong className="text-slate-300">{match.sourceName}</strong></span>
          </div>
          <span className="text-[10px] text-slate-400">Attribution Verified</span>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800">
          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/20 hover:bg-emerald-500/30 px-3 py-2 text-xs font-semibold text-emerald-300 transition cursor-pointer"
            >
              <Share2 className="h-3.5 w-3.5" />
              <span>Share on WhatsApp</span>
            </button>

            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-800/80 hover:bg-slate-700 px-3 py-2 text-xs font-semibold text-slate-300 transition cursor-pointer"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : null}
              <span>{copied ? "Copied!" : "Copy Scorecard"}</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl bg-slate-800 hover:bg-slate-700 px-4 py-2 text-xs font-semibold text-slate-200 transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
