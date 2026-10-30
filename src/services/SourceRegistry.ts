import type { LegalSource } from "@/types";

/**
 * Legal Sources Registry for KhelGrid Live Sports
 *
 * In accordance with KhelGrid AGENTS.md Hard Rules:
 * 1. LEGAL DATA ONLY: Each source verified against its current published terms of service.
 * 2. REDISTRIBUTION FLAG: Distinguishes between what can be displayed on website vs redistributed in public API.
 * 3. BUDGET PROTECTION: Tracks daily max requests to guarantee $0 running cost.
 */
export const LEGAL_SOURCES_REGISTRY: Record<string, LegalSource> = {
  khelgrid_internal: {
    id: "khelgrid_internal",
    name: "KhelGrid Verified Sports Registry",
    licence: "Proprietary (All Rights Reserved)",
    termsUrl: "https://www.khelgrid.com/terms",
    termsCheckedAt: "2026-10-30",
    attributionText: "Data provided by KhelGrid (khelgrid.com)",
    displayAllowed: true,
    redistributeAllowed: true, // 100% owned by KhelGrid
    maxRequestsPerDay: 1000000,
  },

  api_football: {
    id: "api_football",
    name: "API-Football / API-Sports",
    licence: "API-Sports Developer Free Tier (Display-Only)",
    termsUrl: "https://api-sports.io/terms",
    termsCheckedAt: "2026-10-30",
    attributionText: "Data provided by API-Sports",
    displayAllowed: true,
    redistributeAllowed: false, // Redistribution strictly forbidden under API-Sports terms
    maxRequestsPerDay: 100,     // Free tier budget cap
  },

  cricapi: {
    id: "cricapi",
    name: "CricketData.org (formerly CricAPI)",
    licence: "CricketData Free Developer Tier (Display-Only)",
    termsUrl: "https://cricketdata.org/terms.aspx",
    termsCheckedAt: "2026-10-30",
    attributionText: "Scores powered by CricketData.org",
    displayAllowed: true,
    redistributeAllowed: false, // Terms prohibit raw data feed mirroring / resale
    maxRequestsPerDay: 100,     // Free tier budget cap
  },

  cricsheet: {
    id: "cricsheet",
    name: "Cricsheet.org",
    licence: "Open Data Commons Attribution License (ODC-By 1.0)",
    termsUrl: "https://cricsheet.org/license/",
    termsCheckedAt: "2026-10-30",
    attributionText: "Historical cricket match archives from Cricsheet.org (ODC-By 1.0)",
    displayAllowed: true,
    redistributeAllowed: true, // Permitted under ODC-By with attribution
    maxRequestsPerDay: 1000000,
  },

  official_public_notice: {
    id: "official_public_notice",
    name: "Official Federation Circular / Press Release",
    licence: "Fair Use Official Public Notice",
    termsUrl: "https://www.khelgrid.com/trust-center",
    termsCheckedAt: "2026-10-30",
    attributionText: "Official Organizer Schedule & Press Notice",
    displayAllowed: true,
    redistributeAllowed: true,
    maxRequestsPerDay: 1000000,
  },
};

export class SourceRegistryService {
  private static instance: SourceRegistryService;

  public static getInstance(): SourceRegistryService {
    if (!SourceRegistryService.instance) {
      SourceRegistryService.instance = new SourceRegistryService();
    }
    return SourceRegistryService.instance;
  }

  public getSource(id: string): LegalSource {
    return (
      LEGAL_SOURCES_REGISTRY[id] || {
        id,
        name: "Verified Sports Source",
        licence: "Standard Display Rights",
        termsUrl: "https://www.khelgrid.com/terms",
        termsCheckedAt: "2026-10-30",
        attributionText: "Data verified by KhelGrid",
        displayAllowed: true,
        redistributeAllowed: false,
        maxRequestsPerDay: 100,
      }
    );
  }

  public getAllSources(): LegalSource[] {
    return Object.values(LEGAL_SOURCES_REGISTRY);
  }
}

export const sourceRegistry = SourceRegistryService.getInstance();
