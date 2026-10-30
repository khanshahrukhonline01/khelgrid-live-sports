import type { SportsMatch, MatchStatus, ActiveWindowConfig } from "@/types";

/**
 * Match Lifecycle & Auto-Archiving Manager
 *
 * Implements the automatic active-window filtering and archiving:
 * - In-play games are prioritized as "LIVE".
 * - Stale live games (> 15 minutes without feed heartbeat) are transparently marked as stale.
 * - Concluded games stay visible for 12 hours (RECENT) so fans can see final scores.
 * - Games older than 12 hours post-conclusion are automatically filtered off the live screen
 *   into the historical ARCHIVE, keeping the live interface clean and fast.
 */
export class LifeCycleManager {
  private static defaultConcludedHours = 12;
  private static defaultUpcomingHours = 24;
  private static defaultStaleMinutes = 20;

  /**
   * Evaluates the dynamic operational status of a match based on current time
   */
  public static evaluateMatch(
    match: SportsMatch,
    now: number = Date.now(),
    options: {
      concludedRetentionHours?: number;
      upcomingWindowHours?: number;
      staleThresholdMinutes?: number;
    } = {},
  ): { status: MatchStatus; isStale: boolean; isArchived: boolean } {
    const concludedLimit =
      (options.concludedRetentionHours ?? this.defaultConcludedHours) * 3600 * 1000;
    const staleLimit =
      (options.staleThresholdMinutes ?? this.defaultStaleMinutes) * 60 * 1000;

    const lastUpdatedMs = match.lastUpdated ? new Date(match.lastUpdated).getTime() : now;
    const endedAtMs = match.endedAt ? new Date(match.endedAt).getTime() : null;

    // 1. If explicitly marked finished or ended
    if (match.status === "RECENT" || match.status === "ARCHIVED" || endedAtMs) {
      const benchmarkTime = endedAtMs || lastUpdatedMs;
      const elapsedSinceEnd = now - benchmarkTime;

      if (elapsedSinceEnd > concludedLimit) {
        return { status: "ARCHIVED", isStale: false, isArchived: true };
      }
      return { status: "RECENT", isStale: false, isArchived: false };
    }

    // 2. In-Play / LIVE Matches
    if (match.status === "LIVE") {
      const timeSinceHeartbeat = now - lastUpdatedMs;
      const isStale = timeSinceHeartbeat > staleLimit;
      return { status: "LIVE", isStale, isArchived: false };
    }

    // 3. Upcoming matches
    return { status: "UPCOMING", isStale: false, isArchived: false };
  }

  /**
   * Filters a match list to return ONLY the active window (Live, Upcoming, and Recent within 12h)
   * Automatically drops archived/stale finished matches.
   */
  public static getActiveWindowMatches(
    matches: SportsMatch[],
    now: number = Date.now(),
  ): SportsMatch[] {
    return matches
      .map((match) => {
        const evalResult = this.evaluateMatch(match, now);
        return {
          ...match,
          status: evalResult.status,
          isStale: evalResult.isStale,
        };
      })
      .filter((m) => m.status !== "ARCHIVED");
  }

  /**
   * Returns only matches currently in-play (LIVE)
   */
  public static getLiveOnlyMatches(matches: SportsMatch[], now: number = Date.now()): SportsMatch[] {
    return this.getActiveWindowMatches(matches, now).filter((m) => m.status === "LIVE");
  }

  /**
   * Formats relative human time (e.g. "2 min ago", "just now")
   */
  public static formatRelativeTime(isoString: string, now: number = Date.now()): string {
    const timestamp = new Date(isoString).getTime();
    const diffSec = Math.floor((now - timestamp) / 1000);

    if (diffSec < 60) return "just now";
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return new Date(timestamp).toLocaleDateString([], { month: "short", day: "numeric" });
  }
}
