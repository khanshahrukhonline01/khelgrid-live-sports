# Legal Compliance & Attribution Architecture

**Audited:** October 30, 2026  
**Standard:** KhelGrid AGENTS.md Hard Rules (Legal Data Only, Redistribution Boundaries, Zero-Fabrication)

---

## 1. Non-Negotiable Legal Rules

1. **LEGAL DATA ONLY**:
   * Data is only ingested if its terms explicitly permit the use.
   * Scraped data from Cricbuzz, ESPN Cricinfo, Sofascore, or hidden mobile APIs is **strictly prohibited**.
   * If a provider’s license terms are ambiguous, it is rejected by default.

2. **REDISTRIBUTION FLAG BOUNDARY**:
   * Every ingested match record must link to a valid record in the `sources` registry.
   * Free-tier third-party providers (API-Football, CricketData) permit **display** on your own app/site, but **forbid redistribution** as an API.
   * Therefore:
     * `display_allowed = true` -> Match renders on `khelgrid.com/live-scores`.
     * `redistribute_allowed = false` -> Match is **excluded** from public `/api/v1/` developer endpoints.

3. **AUTHENTICITY & ZERO FAKE SCORES**:
   * No random simulated scores or mock digits are ever labeled as live.
   * Missing fields are left `null`.
   * For sports without legal free-tier developer APIs (Pro Kabaddi League, Hockey India, BWF Badminton), the engine displays **verified pending states** with direct links to official organizers, rather than fabricating numbers.

---

## 2. Audited Sources Registry

| Source ID | Provider / Entity | Governing Licence / Terms | Terms URL | Display Allowed? | Redistribute Allowed? | Attribution Requirement |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `khelgrid_internal` | KhelGrid Grassroots DB | Proprietary | `https://khelgrid.com/terms` | **YES** | **YES** | `"Data provided by KhelGrid"` |
| `api_football` | API-Sports | Free Developer TOS (100 req/day) | `https://api-sports.io/terms` | **YES** | **NO** | `"Data provided by API-Sports"` |
| `cricapi` | CricketData.org | Free Developer TOS (100 req/day) | `https://cricketdata.org/terms.aspx` | **YES** | **NO** | `"Powered by CricketData.org"` |
| `cricsheet` | Cricsheet.org | Open Data Commons (ODC-By 1.0) | `https://cricsheet.org/license/` | **YES** | **YES** | `"Data from Cricsheet.org (ODC-By 1.0)"` |
| `official_public_notice` | SAI / BCCI / Organizers | Public Tournament Circulars / Media Advisory | `https://khelgrid.com/trust-center` | **YES** | **YES** | `"Official Organizer Press Notice"` |

---

## 3. Mandatory User-Facing Attribution

In compliance with provider agreements:
* Every match card and detail modal attributes its source.
* The footer of the live scores page displays the `AttributionBadge` component containing direct links to official licensing terms.
