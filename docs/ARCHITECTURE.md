# KhelGrid Live Sports Architecture & Mergeability Guide

## 1. Architectural Overview

The **KhelGrid Live Sports Engine** is designed as a standalone, modular subsystem that can run either as an independent micro-frontend/service or be directly merged into the main `khelgrid.com` (`khelgrid-monetization-studio`) repository.

```
┌────────────────────────────────────────────────────────┐
│                   KhelGrid Frontend                    │
│   (LiveScoresView / LiveSportsTicker / MatchCard)      │
└──────────────────────────┬─────────────────────────────┘
                           │ Reactive Subscription / Polling
┌──────────────────────────▼─────────────────────────────┐
│                 LiveSportsEngine                       │
│  - 30s In-Memory Cache (TTL)                           │
│  - Daily Quota Budget Counter (< 100 req/day)          │
│  - Deduplication Engine                                │
└──────────┬───────────────────────────────┬─────────────┘
           │                               │
┌──────────▼───────────┐       ┌───────────▼─────────────┐
│   LifeCycleManager   │       │   SourceRegistry        │
│  - Active-Window Eval│       │  - Legal Licence Audit  │
│  - Auto-Archiving    │       │  - Display vs Redist    │
│  - Stale Flagging    │       │  - Terms Verification   │
└──────────────────────┘       └─────────────────────────┘
           │                               │
┌──────────▼───────────────────────────────▼─────────────┐
│                   Adapter Layer                        │
│   (footballAdapter.ts, cricketAdapter.ts, etc.)        │
└────────────────────────────────────────────────────────┘
```

---

## 2. Why Each Component Was Designed This Way

### A. Separation of Display Rights vs. Redistribution Rights (`SourceRegistry.ts`)
* **Why:** Third-party sports providers (API-Football, CricketData.org) grant developers permission to **display** live scores on their website for free (under quota), but **strictly forbid redistributing raw API payloads** or reselling feeds.
* **Solution:** Every match is bound to a `source_id`. When querying for the website (`displayAllowed = true`), live matches appear. If a public API (`/api/v1/`) queries the dataset, only sources with `redistributeAllowed = true` (KhelGrid's own trials/venues or Cricsheet ODC-By data) are returned.

### B. Lifecycle Auto-Archiving (`LifeCycleManager.ts`)
* **Why:** Across world football, cricket, and grassroots sports, hundreds of fixtures take place daily. If matches never rolled off, the live scores UI would become heavily cluttered with finished, dead scores.
* **Solution:**
  * **LIVE (In-Play):** Given highest priority with a green pulsing badge.
  * **UPCOMING (Next 24h):** Displayed so fans can see kickoff/toss times for today.
  * **RECENT (Concluded within 12h):** Stays visible so users can see final match results.
  * **ARCHIVED (Concluded > 12h ago):** Automatically excluded from the active window view. No manual database pruning required.

### C. Rate Budgeting & $0 Free-Tier Protection (`LiveSportsEngine.ts`)
* **Why:** Free tiers enforce strict daily limits (e.g. 100 requests/day). If an application makes client-side requests on every page refresh, 100 visitors would exhaust the entire daily quota in 5 minutes.
* **Solution:**
  * Client never talks to third-party endpoints directly.
  * Engine keeps an in-memory 30s TTL cache.
  * Engine tracks daily consumption. If requests approach the daily cap, polling gracefully halts and serves the last stored data with transparent attribution and a `lastUpdated` timestamp.

---

## 3. How to Merge into the Main Codebase (`khelgrid-monetization-studio`)

When you are ready to merge this repository into the main website, choose either of these seamless approaches:

### Option 1: Direct Component Import (Recommended)
Copy the `src/` folder into `src/features/live-sports/` in `khelgrid-monetization-studio`:
```tsx
// Inside src/routes/live-scores.tsx
import { LiveScoresView } from "@/features/live-sports";

export function LiveScoresPage() {
  return <LiveScoresView />;
}
```

### Option 2: Embed Sticky Ticker in Global Header
```tsx
// Inside src/components/Navbar.tsx or Header.tsx
import { LiveSportsTicker, liveSportsEngine } from "@/features/live-sports";

export function Header() {
  const [matches, setMatches] = useState([]);
  useEffect(() => {
    liveSportsEngine.getScores().then(d => setMatches(d.matches));
  }, []);

  return (
    <>
      <nav>...</nav>
      <LiveSportsTicker matches={matches} onSelectMatch={...} />
    </>
  );
}
```
