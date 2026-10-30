import type { SportsMatch, SportType, MatchStatus, LegalSource } from "@/types";
import { LifeCycleManager } from "./LifeCycleManager";
import { sourceRegistry } from "./SourceRegistry";
import { fetchFootballMatches } from "./adapters/footballAdapter";
import { fetchCricketMatches } from "./adapters/cricketAdapter";

interface CacheStore {
  data: SportsMatch[];
  fetchedAt: number;
}

const CACHE_TTL_MS = 15 * 1000; // 15 seconds TTL for rapid live updates

/**
 * LiveSportsEngine
 *
 * Central engine for live sports synchronization, legal attribution,
 * rate-quota budgeting, and lifecycle auto-archiving.
 */
export class LiveSportsEngine {
  private static instance: LiveSportsEngine;
  private cache: CacheStore | null = null;
  private subscribers: Set<(matches: SportsMatch[]) => void> = new Set();
  private dailyRequestCounts: Record<string, number> = {};
  private lastResetDay: number = new Date().getDate();

  public static getInstance(): LiveSportsEngine {
    if (!LiveSportsEngine.instance) {
      LiveSportsEngine.instance = new LiveSportsEngine();
    }
    return LiveSportsEngine.instance;
  }

  /**
   * Resets request counters at midnight
   */
  private checkDailyBudgetReset() {
    const today = new Date().getDate();
    if (today !== this.lastResetDay) {
      this.dailyRequestCounts = {};
      this.lastResetDay = today;
    }
  }

  /**
   * Checks if a source has quota remaining for the day
   */
  public canQuerySource(sourceId: string): boolean {
    this.checkDailyBudgetReset();
    const source = sourceRegistry.getSource(sourceId);
    const count = this.dailyRequestCounts[sourceId] || 0;
    return count < source.maxRequestsPerDay;
  }

  /**
   * Records a request made against a source's budget
   */
  public recordRequest(sourceId: string) {
    this.checkDailyBudgetReset();
    this.dailyRequestCounts[sourceId] = (this.dailyRequestCounts[sourceId] || 0) + 1;
  }

  /**
   * Primary fetch method
   */
  public async getScores(options: {
    forceRefresh?: boolean;
    sport?: SportType;
    status?: "ALL" | MatchStatus;
  } = {}): Promise<{
    matches: SportsMatch[];
    liveMatches: SportsMatch[];
    upcomingMatches: SportsMatch[];
    recentMatches: SportsMatch[];
    archivedMatches: SportsMatch[];
    lastUpdated: string;
    sources: LegalSource[];
  }> {
    const now = Date.now();

    // 1. Check cache first
    let rawMatches: SportsMatch[] = [];
    if (!options.forceRefresh && this.cache && now - this.cache.fetchedAt < CACHE_TTL_MS) {
      rawMatches = this.cache.data;
    } else {
      // 2. Query adapters with budget check
      const fetched: SportsMatch[] = [];

      // Football
      if (this.canQuerySource("api_football")) {
        try {
          const fb = await fetchFootballMatches();
          this.recordRequest("api_football");
          fetched.push(...fb);
        } catch (err) {
          console.warn("[LiveSportsEngine] Football adapter warning:", err);
        }
      }

      // Cricket
      try {
        const cr = await fetchCricketMatches();
        fetched.push(...cr);
      } catch (err) {
        console.warn("[LiveSportsEngine] Cricket adapter warning:", err);
      }

      // Deduplicate by team names
      const seen = new Set<string>();
      rawMatches = fetched.filter((m) => {
        const key = `${m.sport}-${m.teamA.name.toLowerCase()}-vs-${m.teamB.name.toLowerCase()}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      this.cache = {
        data: rawMatches,
        fetchedAt: now,
      };

      this.notifySubscribers(rawMatches);
    }

    // 3. Apply Lifecycle Auto-Archiving (Evaluates in-play, 24h upcoming, 12h concluded)
    const evaluated = rawMatches.map((m) => {
      const evalRes = LifeCycleManager.evaluateMatch(m, now);
      return {
        ...m,
        status: evalRes.status,
        isStale: evalRes.isStale,
      };
    });

    const liveMatches = evaluated.filter((m) => m.status === "LIVE");
    const upcomingMatches = evaluated.filter((m) => m.status === "UPCOMING");
    const recentMatches = evaluated.filter((m) => m.status === "RECENT");
    const archivedMatches = evaluated.filter((m) => m.status === "ARCHIVED");

    // Filter by requested sport
    let activeWindow = evaluated.filter((m) => m.status !== "ARCHIVED");
    if (options.sport && options.sport !== "All") {
      activeWindow = activeWindow.filter((m) => m.sport === options.sport);
    }

    // Filter by requested status
    if (options.status && options.status !== "ALL") {
      activeWindow = activeWindow.filter((m) => m.status === options.status);
    }

    // Sort order: LIVE first, then RECENT, then UPCOMING
    const statusWeight = (s: MatchStatus) => (s === "LIVE" ? 3 : s === "RECENT" ? 2 : 1);
    activeWindow.sort((a, b) => statusWeight(b.status) - statusWeight(a.status));

    return {
      matches: activeWindow,
      liveMatches,
      upcomingMatches,
      recentMatches,
      archivedMatches,
      lastUpdated: new Date(this.cache?.fetchedAt || now).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
      sources: sourceRegistry.getAllSources(),
    };
  }

  /**
   * Subscriber pattern for real-time UI components
   */
  public subscribe(callback: (matches: SportsMatch[]) => void): () => void {
    this.subscribers.add(callback);
    return () => {
      this.subscribers.delete(callback);
    };
  }

  private notifySubscribers(matches: SportsMatch[]) {
    this.subscribers.forEach((cb) => {
      try {
        cb(matches);
      } catch (err) {
        console.error("[LiveSportsEngine] Subscriber error:", err);
      }
    });
  }
}

export const liveSportsEngine = LiveSportsEngine.getInstance();
