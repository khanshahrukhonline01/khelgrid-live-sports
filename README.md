# KhelGrid Live Sports Center (`@khelgrid/live-sports`)

A modular, scalable, and legally-compliant Live Sports Match Engine and UI suite built for **KhelGrid**.

Designed specifically to power real-time match tracking on `khelgrid.com`, maintain a **$0 running cost**, prevent provider quota burnout, and ensure seamless mergeability into the main website codebase.

---

## 🌟 Key Features

1. **Automated Match Lifecycle & Auto-Archiving**:
   - **In-Play (LIVE)** matches take top visual priority with pulsing status beacons.
   - **Upcoming** matches within a 24-hour window are displayed for today's schedule.
   - **Concluded** matches remain on the live screen for **12 hours** so fans can review final scores.
   - Matches older than 12 hours automatically roll off into the archive without manual deletion.

2. **Strict Legal Compliance & Redistribution Protection**:
   - Incorporates a formal **Source Registry** with audited Terms of Service URLs and audit timestamps.
   - Enforces a hard distinction between **`display_allowed`** (allowed on website) and **`redistribute_allowed`** (allowed in public developer API).
   - Complies with API-Sports, CricketData.org, and Cricsheet licensing.

3. **Zero-Fabrication Standard**:
   - No mock random scores are ever presented as live.
   - Missing fields are left `null`.
   - Sports without public free-tier APIs (Kabaddi, Badminton, Hockey) display honest "Pending Rights / Official Schedule" states with official organizer links.

4. **Rate-Budgeting Protection ($0 Cost Guarantee)**:
   - Client browsers never hit third-party API endpoints directly.
   - The engine includes a 30-second in-memory TTL cache.
   - Daily request budgets (e.g. 100 calls/day on API-Sports) are strictly monitored. If quotas approach limits, background polling gracefully pauses and serves cached data with an accurate `lastUpdated` timestamp.

5. **Ready for Future Website Merge**:
   - Built on React 19, TypeScript, Vite, and Tailwind CSS.
   - Exported as clean modular components (`LiveScoresView`, `LiveSportsTicker`, `MatchCard`, `MatchDetailModal`, `AttributionBadge`, `liveSportsEngine`).

---

## 📁 Repository Structure

```
khelgrid-live-sports/
├── docs/
│   ├── ARCHITECTURE.md            # Why each component exists & how to merge into main site
│   ├── LEGAL_COMPLIANCE.md        # Terms audit, display vs redistribution boundaries
│   └── LIFECYCLE_AND_ARCHIVING.md # Auto-archiving algorithm & rate-budgeting
├── src/
│   ├── components/
│   │   ├── AttributionBadge.tsx   # Mandatory legal attribution banner & terms links
│   │   ├── LiveScoresView.tsx     # Full match center view with sport tabs & search
│   │   ├── LiveSportsTicker.tsx   # Embeddable sticky header/nav sports strip
│   │   ├── MatchCard.tsx          # Responsive match card with logos, clock & score
│   │   └── MatchDetailModal.tsx   # Modal for match info, venue, and squad details
│   ├── services/
│   │   ├── LiveSportsEngine.ts    # Central engine: caching, rate-budgeting, events
│   │   ├── LifeCycleManager.ts    # Active-window filtering & 12h auto-archiving
│   │   ├── SourceRegistry.ts      # Legal sources table & redistribution permissions
│   │   └── adapters/
│   │       ├── footballAdapter.ts # Public scoreboard adapter for ISL, EPL, UCL, La Liga
│   │       └── cricketAdapter.ts  # Official cricket schedule & status adapter
│   ├── types/
│   │   └── index.ts               # Shared domain contracts
│   ├── App.tsx                    # Standalone interactive tester
│   └── index.ts                   # Clean package exports
├── supabase/
│   └── migrations/
│       └── 20261030_live_sports_sources_and_matches.sql
├── package.json
└── vite.config.ts
```

---

## 🚀 Quickstart (Standalone Development)

```bash
# 1. Install dependencies
npm install

# 2. Run local dev server
npm run dev
# Opens at http://localhost:3001
```

---

## 🔗 How to Merge into `khelgrid-monetization-studio`

Whenever you want to merge this module into the main website:

```tsx
// Inside src/routes/live-scores.tsx in khelgrid-monetization-studio:
import { LiveScoresView } from "@/features/live-sports";

export function LiveScoresRoute() {
  return <LiveScoresView />;
}
```

Or embed the sticky ticker into your global navbar:
```tsx
import { LiveSportsTicker, liveSportsEngine } from "@/features/live-sports";

// Place <LiveSportsTicker /> directly below the navigation bar
```
