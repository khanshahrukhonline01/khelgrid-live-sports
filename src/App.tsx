import React from "react";
import { LiveScoresView } from "./components/LiveScoresView";

export function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-emerald-500 selection:text-white">
      {/* Top Brand Nav */}
      <header className="border-b border-slate-800 bg-slate-950/80 sticky top-0 z-40 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 h-14">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚡</span>
            <span className="font-black text-lg tracking-wider text-slate-100">
              KHEL<span className="text-emerald-400">GRID</span>
            </span>
            <span className="rounded-md bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
              LIVE SPORTS ENGINE
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span className="hidden sm:inline">Zero-Fake-Scores Standard</span>
            <a
              href="https://github.com/khanshahrukhonline01/khelgrid-live-sports"
              target="_blank"
              rel="noreferrer"
              className="rounded-lg bg-slate-800 hover:bg-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-200 transition"
            >
              GitHub Repo
            </a>
          </div>
        </div>
      </header>

      {/* Main Live Sports Component */}
      <main>
        <LiveScoresView />
      </main>
    </div>
  );
}

export default App;
