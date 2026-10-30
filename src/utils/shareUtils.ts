import type { SportsMatch } from "@/types";

/**
 * Builds formatted text representation of a live match for viral social sharing.
 */
export function formatMatchScorecard(match: SportsMatch): string {
  const sportEmoji =
    match.sport === "Football"
      ? "⚽"
      : match.sport === "Cricket"
        ? "🏏"
        : match.sport === "Basketball"
          ? "🏀"
          : match.sport === "Tennis"
            ? "🎾"
            : "🏆";

  const lines = [
    `${sportEmoji} *${match.teamA.name} vs ${match.teamB.name}*`,
    `🏆 ${match.tournament}${match.stage ? ` · ${match.stage}` : ""}`,
    `📊 Score: *${match.teamA.code}* ${match.teamA.score} - ${match.teamB.score} *${match.teamB.code}*`,
    `⚡ Status: ${match.matchClock || match.status}`,
  ];

  if (match.highlight) {
    lines.push(`💬 _${match.highlight}_`);
  }

  lines.push("", "🔥 Follow ball-by-ball on KhelGrid Live:", "https://khelgrid.com/live-scores");

  return lines.join("\n");
}

/**
 * Triggers 1-click WhatsApp Share
 */
export function shareMatchOnWhatsApp(match: SportsMatch) {
  const text = formatMatchScorecard(match);
  const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

/**
 * Copies match scorecard to clipboard
 */
export async function copyMatchScorecard(match: SportsMatch): Promise<boolean> {
  try {
    const text = formatMatchScorecard(match);
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
