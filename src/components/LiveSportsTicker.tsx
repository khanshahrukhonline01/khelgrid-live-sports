import React, { useRef } from "react";
import { ChevronLeft, ChevronRight, Activity, Flame } from "lucide-react";
import type { SportsMatch } from "@/types";

interface LiveSportsTickerProps {
  matches: SportsMatch[];
  onSelectMatch: (match: SportsMatch) => void;
  className?: string;
}

export const LiveSportsTicker: React.FC<LiveSportsTickerProps> = ({
  matches,
  onSelectMatch,
  className = "",
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const liveCount = matches.filter((m) => m.status === "LIVE").length;

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = direction === "left" ? -280 : 280;
    scrollRef.current.scrollBy({ left: amount, behavior: "smooth" });
  };

  if (matches.length === 0) return null;

  return (
    <div
      className={`relative border-y border-slate-800 bg-slate-950/90 text-slate-100 backdrop-blur-md px-3 py-2 flex items-center gap-3 ${className}`}
      aria-label="Live Sports Scores Strip"
    >
      {/* Live Badge */}
      <div className="flex items-center gap-2 shrink-0 border-r border-slate-800 pr-3">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
        </span>
        <span className="text-xs font-bold tracking-tight text-slate-200 uppercase">Live Pulse</span>
        {liveCount > 0 && (
          <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
            {liveCount} In-Play
          </span>
        )}
      </div>

      {/* Navigation Buttons */}
      <button
        onClick={() => scroll("left")}
        className="p-1 rounded-md text-slate-400 hover:bg-slate-800 hover:text-slate-100 transition shrink-0 hidden sm:block"
        aria-label="Scroll ticker left"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {/* Ticker Row */}
      <div
        ref={scrollRef}
        className="flex items-center gap-3 overflow-x-auto no-scrollbar scroll-smooth flex-1 py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {matches.map((m) => (
          <div
            key={m.id}
            onClick={() => onSelectMatch(m)}
            className="flex items-center gap-2.5 rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-1.5 text-xs shrink-0 hover:border-emerald-500/50 hover:bg-slate-800/80 transition cursor-pointer"
          >
            <span className="font-semibold text-slate-300 truncate max-w-[100px]">{m.teamA.code}</span>
            <span className="font-mono font-bold text-emerald-400">{m.teamA.score}</span>
            <span className="text-slate-600 font-bold">vs</span>
            <span className="font-mono font-bold text-emerald-400">{m.teamB.score}</span>
            <span className="font-semibold text-slate-300 truncate max-w-[100px]">{m.teamB.code}</span>
            <span className="text-[10px] text-slate-500 font-mono ml-1">({m.matchClock || m.status})</span>
          </div>
        ))}
      </div>

      <button
        onClick={() => scroll("right")}
        className="p-1 rounded-md text-slate-400 hover:bg-slate-800 hover:text-slate-100 transition shrink-0 hidden sm:block"
        aria-label="Scroll ticker right"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
};
