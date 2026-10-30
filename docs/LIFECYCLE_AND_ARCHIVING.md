# Match Lifecycle, Auto-Archiving & Quota Budgeting

## 1. Automated Match Lifecycle

To prevent the live scores page from filling up with old or stale fixtures across global football, cricket, and domestic leagues, the engine uses a 4-state lifecycle:

```
[SCHEDULED]  (Upcoming within 24h)
     │
     ▼ (Kickoff / Toss)
   [LIVE]    (In-play; Heartbeat checked every 30s)
     │       (If > 15m without heartbeat -> labeled STALE)
     ▼ (Match Concludes)
  [RECENT]   (Kept on active live page for 12 hours)
     │
     ▼ (> 12 hours elapsed since conclusion)
 [ARCHIVED]  (Automatically rolled off active view into archive)
```

---

## 2. Window Definitions

| State | Entry Condition | Retention Duration | Display Visibility |
| :--- | :--- | :--- | :--- |
| **LIVE** | Provider reports status `in-play` / `live` | Until full-time or official conclusion | Highest priority (top of page, animated ping beacon) |
| **UPCOMING** | `scheduled_at` is within the next 24 hours | Until match begins | Middle priority (shows match time and venue) |
| **RECENT** | Match ends (`finished` / `post`) | **12 hours** post-conclusion | Displays final scores, winner highlight |
| **ARCHIVED** | Match ended > **12 hours** ago | Indefinite (stored in DB) | **Excluded** from active live view |

---

## 3. Daily Rate-Quota Budgeting

Free-tier providers enforce strict daily limits (e.g., API-Sports provides 100 free requests per 24 hours).

### Budget Protection Algorithm:
1. **Server-Side Only:** Web visitors NEVER query providers directly. All traffic is served from memory cache (30s TTL) or Supabase.
2. **Quota Counter:** `LiveSportsEngine.dailyRequestCounts[sourceId]` tracks requests made today.
3. **Automated Throttling:**
   * When requests reach 90% of `maxRequestsPerDay`, polling interval drops from 30s to 5 minutes.
   * If `dailyRequestCounts >= maxRequestsPerDay`, network calls completely cease.
   * The UI continues serving the last stored score with a transparent `lastUpdated: "HH:MM:SS"` timestamp, ensuring zero overages and $0 cost.
