import type { SportsMatch } from "@/types";
import { sourceRegistry } from "../SourceRegistry";

const CRICKET_FEED_URL = "https://site.api.espn.com/apis/personalized/v2/scoreboard/header?sport=cricket";

/**
 * Real Live Cricket Adapter
 *
 * Ingests 100% authentic live cricket matches from the international public scoreboard.
 * Never fabricates or invents fake scores.
 * Accurately classifies matches into LIVE (in-play), RECENT (concluded today), and UPCOMING (scheduled).
 */
export async function fetchCricketMatches(timeoutMs = 6000): Promise<SportsMatch[]> {
  const matches: SportsMatch[] = [];
  const source = sourceRegistry.getSource("cricketdata");

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(CRICKET_FEED_URL, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });
    clearTimeout(timer);

    if (!res.ok) {
      console.warn(`[CricketAdapter] Feed returned HTTP ${res.status}`);
      return [];
    }

    const json = await res.json();
    const sports = json.sports || [];

    for (const sportObj of sports) {
      for (const league of sportObj.leagues || []) {
        const leagueName = league.name || "International Cricket";

        for (const ev of league.events || []) {
          const comps = ev.competitors || [];
          if (comps.length < 2) continue;

          const home = comps[0];
          const away = comps[1];

          const summaryLower = (ev.summary || "").toLowerCase();
          const state = ev.status || ev.fullStatus?.type?.state;

          let status: "LIVE" | "RECENT" | "UPCOMING" = "UPCOMING";
          if (
            state === "in" ||
            summaryLower === "live" ||
            summaryLower.includes("stumps") ||
            summaryLower.includes("tea") ||
            summaryLower.includes("lunch") ||
            summaryLower.includes("innings break")
          ) {
            status = "LIVE";
          } else if (
            summaryLower.includes("won") ||
            summaryLower.includes("result") ||
            summaryLower.includes("tied") ||
            summaryLower.includes("abandoned") ||
            state === "post"
          ) {
            status = "RECENT";
          }

          const teamAName = home.displayName || home.name || "Team A";
          const teamBName = away.displayName || away.name || "Team B";

          const homeScore = home.score?.trim() || (status === "UPCOMING" ? "Scheduled" : "-");
          const awayScore = away.score?.trim() || (status === "UPCOMING" ? "Scheduled" : "-");

          const lastNote =
            ev.notes && ev.notes.length > 0 ? ev.notes[ev.notes.length - 1].text : "";
          const highlight =
            ev.fullStatus?.longSummary ||
            lastNote ||
            `${teamAName} vs ${teamBName} · ${ev.location || leagueName}`;

          const matchClock =
            ev.summary ||
            (status === "LIVE" ? "In Play" : status === "RECENT" ? "FT" : "Scheduled");

          matches.push({
            id: `cricket-${ev.id}`,
            externalId: String(ev.id),
            sport: "Cricket",
            status,
            tournament: leagueName,
            stage: ev.description || ev.title || leagueName,
            teamA: {
              name: teamAName,
              code: (home.abbreviation || teamAName.slice(0, 3)).toUpperCase(),
              score: homeScore,
              logo: home.logo,
              flag: "🏏",
            },
            teamB: {
              name: teamBName,
              code: (away.abbreviation || teamBName.slice(0, 3)).toUpperCase(),
              score: awayScore,
              logo: away.logo,
              flag: "🏏",
            },
            highlight,
            matchClock,
            venue: ev.location || undefined,
            scheduledAt: ev.date || undefined,
            lastUpdated: new Date().toISOString(),
            sourceId: source.id,
            sourceName: source.name,
            attributionText: source.attributionText,
            displayAllowed: source.displayAllowed,
            redistributeAllowed: source.redistributeAllowed,
          });
        }
      }
    }
  } catch (err) {
    clearTimeout(timer);
    console.error("[CricketAdapter] Failed to fetch live cricket feed:", err);
  }

  return matches;
}
