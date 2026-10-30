import type { SportsMatch } from "@/types";
import { sourceRegistry } from "../SourceRegistry";

interface ScoreboardEndpoint {
  url: string;
  league: string;
}

const FOOTBALL_ENDPOINTS: ScoreboardEndpoint[] = [
  {
    url: "https://site.api.espn.com/apis/site/v2/sports/soccer/ind.1/scoreboard",
    league: "Indian Super League",
  },
  {
    url: "https://site.api.espn.com/apis/site/v2/sports/soccer/eng.1/scoreboard",
    league: "Premier League",
  },
  {
    url: "https://site.api.espn.com/apis/site/v2/sports/soccer/uefa.champions/scoreboard",
    league: "UEFA Champions League",
  },
  {
    url: "https://site.api.espn.com/apis/site/v2/sports/soccer/esp.1/scoreboard",
    league: "La Liga",
  },
];

const SOCCER_HEADER_FEED = "https://site.api.espn.com/apis/personalized/v2/scoreboard/header?sport=soccer";

/**
 * Football Scoreboard Adapter
 * Safely transforms public scoreboard events into standardized SportsMatch records.
 * Attaches the legal source attribution badge.
 */
export async function fetchFootballMatches(timeoutMs = 5000): Promise<SportsMatch[]> {
  const matches: SportsMatch[] = [];
  const source = sourceRegistry.getSource("api_football");
  const seenIds = new Set<string>();

  // 1. Fetch targeted league scoreboards
  const results = await Promise.allSettled(
    FOOTBALL_ENDPOINTS.map(async (ep) => {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);

      try {
        const res = await fetch(ep.url, {
          signal: controller.signal,
          headers: { Accept: "application/json" },
        });
        clearTimeout(timer);
        if (!res.ok) return null;
        return { json: await res.json(), ep };
      } catch {
        clearTimeout(timer);
        return null;
      }
    }),
  );

  for (const item of results) {
    if (item.status !== "fulfilled" || !item.value?.json) continue;
    const { json, ep } = item.value;
    const leagueName = json.leagues?.[0]?.name || ep.league;

    if (Array.isArray(json.events)) {
      for (const ev of json.events) {
        if (seenIds.has(String(ev.id))) continue;
        seenIds.add(String(ev.id));

        const comp = ev.competitions?.[0] || {};
        const comps = comp.competitors || [];
        if (comps.length < 2) continue;

        const home = comps.find((c: any) => c.homeAway === "home") || comps[0];
        const away = comps.find((c: any) => c.homeAway === "away") || comps[1];

        const state = ev.status?.type?.state;
        const isLive = state === "in";
        const isRecent = state === "post";
        const status = isLive ? "LIVE" : isRecent ? "RECENT" : "UPCOMING";

        const homeScore = isLive || isRecent ? String(home.score ?? "0") : "-";
        const awayScore = isLive || isRecent ? String(away.score ?? "0") : "-";

        const clock = isLive
          ? ev.status?.displayClock || `${ev.status?.period || 1}H`
          : isRecent
            ? "FT"
            : ev.status?.type?.shortDetail || "Scheduled";

        const teamAName = home.team?.displayName || home.team?.name || "Team A";
        const teamBName = away.team?.displayName || away.team?.name || "Team B";

        matches.push({
          id: `football-${ev.id || matches.length + 1}`,
          externalId: String(ev.id || ""),
          sport: "Football",
          status,
          tournament: leagueName,
          stage: clock,
          teamA: {
            name: teamAName,
            code: (home.team?.abbreviation || teamAName.slice(0, 3)).toUpperCase(),
            score: homeScore,
            logo: home.team?.logo,
            flag: "⚽",
          },
          teamB: {
            name: teamBName,
            code: (away.team?.abbreviation || teamBName.slice(0, 3)).toUpperCase(),
            score: awayScore,
            logo: away.team?.logo,
            flag: "⚽",
          },
          highlight: `${teamAName} vs ${teamBName} · ${comp.venue?.fullName || comp.venue?.address?.city || leagueName}`,
          matchClock: clock,
          venue: comp.venue?.fullName || comp.venue?.address?.city,
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

  // 2. Fetch global soccer feed to catch any live matches from other active leagues
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const globalRes = await fetch(SOCCER_HEADER_FEED, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });
    clearTimeout(timer);

    if (globalRes.ok) {
      const globalJson = await globalRes.json();
      for (const sp of globalJson.sports || []) {
        for (const lg of sp.leagues || []) {
          for (const ev of lg.events || []) {
            if (seenIds.has(String(ev.id))) continue;
            seenIds.add(String(ev.id));

            const comps = ev.competitors || [];
            if (comps.length < 2) continue;

            const home = comps[0];
            const away = comps[1];

            const state = ev.status || ev.fullStatus?.type?.state;
            const summary = (ev.summary || "").toLowerCase();
            const isLive = state === "in" || summary === "live";
            const isRecent = state === "post" || summary.includes("ft") || summary.includes("result");
            const status = isLive ? "LIVE" : isRecent ? "RECENT" : "UPCOMING";

            const homeScore = isLive || isRecent ? String(home.score ?? "0") : "-";
            const awayScore = isLive || isRecent ? String(away.score ?? "0") : "-";
            const clock = isLive ? (ev.clock || "In Play") : isRecent ? "FT" : "Scheduled";

            const teamAName = home.displayName || home.name || "Team A";
            const teamBName = away.displayName || away.name || "Team B";

            matches.push({
              id: `football-${ev.id}`,
              externalId: String(ev.id),
              sport: "Football",
              status,
              tournament: lg.name || "Football",
              stage: ev.description || clock,
              teamA: {
                name: teamAName,
                code: (home.abbreviation || teamAName.slice(0, 3)).toUpperCase(),
                score: homeScore,
                logo: home.logo,
                flag: "⚽",
              },
              teamB: {
                name: teamBName,
                code: (away.abbreviation || teamBName.slice(0, 3)).toUpperCase(),
                score: awayScore,
                logo: away.logo,
                flag: "⚽",
              },
              highlight: `${teamAName} vs ${teamBName} · ${ev.location || lg.name}`,
              matchClock: clock,
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
    }
  } catch (err) {
    console.warn("[FootballAdapter] Global soccer feed warning:", err);
  }

  return matches;
}
