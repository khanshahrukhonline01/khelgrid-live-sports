import React from "react";
import { ShieldCheck, ExternalLink } from "lucide-react";
import type { LegalSource } from "@/types";

interface AttributionBadgeProps {
  sources?: LegalSource[];
  className?: string;
}

export const AttributionBadge: React.FC<AttributionBadgeProps> = ({ sources, className = "" }) => {
  return (
    <footer
      className={`rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-xs text-slate-400 backdrop-blur-md ${className}`}
      aria-label="Legal Data Attribution and Licensing Notice"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
          <span className="font-semibold text-slate-200">Legal Source Attribution & Terms Compliance</span>
        </div>
        <span className="text-[11px] text-slate-400">
          Zero-Fake-Scores Policy Enforced · Display-Only License Tier
        </span>
      </div>

      <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-wrap gap-y-2 gap-x-6 text-[11px]">
        <div>
          <span className="text-slate-300 font-medium">Football Data: </span>
          <span>Provided by API-Sports under Developer Tier. </span>
          <a
            href="https://api-sports.io/terms"
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-400 hover:underline inline-flex items-center gap-0.5"
          >
            Terms <ExternalLink className="h-2.5 w-2.5" />
          </a>
        </div>

        <div>
          <span className="text-slate-300 font-medium">Cricket Schedules: </span>
          <span>Official BCCI & CSA Tour Notices / Cricsheet Open Data. </span>
          <a
            href="https://cricsheet.org/license/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-400 hover:underline inline-flex items-center gap-0.5"
          >
            ODC-By 1.0 <ExternalLink className="h-2.5 w-2.5" />
          </a>
        </div>

        <div>
          <span className="text-slate-300 font-medium">Unlicensed Sports (Kabaddi, Badminton, Hockey): </span>
          <span>Displaying verified pending states. Zero fabricated scores.</span>
        </div>
      </div>
    </footer>
  );
};
