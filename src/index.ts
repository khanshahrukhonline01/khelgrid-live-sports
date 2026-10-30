/**
 * KhelGrid Live Sports Package Exports
 * Modular and ready for direct import or merge into khelgrid.com / khelgrid-monetization-studio
 */

// UI Components
export { LiveScoresView } from "./components/LiveScoresView";
export { LiveSportsTicker } from "./components/LiveSportsTicker";
export { MatchCard } from "./components/MatchCard";
export { MatchDetailModal } from "./components/MatchDetailModal";
export { AttributionBadge } from "./components/AttributionBadge";

// Services & Engine
export { liveSportsEngine, LiveSportsEngine } from "./services/LiveSportsEngine";
export { LifeCycleManager } from "./services/LifeCycleManager";
export { sourceRegistry, LEGAL_SOURCES_REGISTRY } from "./services/SourceRegistry";

// Utilities
export { shareMatchOnWhatsApp, copyMatchScorecard, formatMatchScorecard } from "./utils/shareUtils";
export { soundService } from "./utils/soundChime";

// Types
export * from "./types";
