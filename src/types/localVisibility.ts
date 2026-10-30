export type LocalProfile = {
  latitude: number;
  longitude: number;
  grid_size: number;
  radius_km: number;
  radius_miles?: number;
  business_domain: string;
  place_id: string;
  matching_domain: string;
};

export type ScanSummary = {
  scan_id: number;
  status: "queued" | "running" | "completed" | "failed";
  finished_at: string | null;
  average_rank: number | null;
  visibility_score: number | null;
  top3_coverage: number | null;
  top10_coverage: number | null;
  ranked_points: number;
  points_total: number;
  error: string;
  /** Only sent to agency admins. */
  cost_usd?: number;
};

export type TrackedKeywordRow = {
  id: number;
  keyword: string;
  scanning: boolean;
  last_error: string;
  latest: ScanSummary | null;
  previous: ScanSummary | null;
};

export type LocalVisibilityOverview = {
  configured: boolean;
  profile: LocalProfile | null;
  limits: { keywords_max: number; scans_per_day: number; scans_today: number; grid_sizes: number[] };
  metrics: {
    average_rank: number | null;
    visibility_score: number | null;
    top3_coverage: number | null;
    top10_coverage: number | null;
    improving: number;
    declining: number;
    stable: number;
  };
  keywords: TrackedKeywordRow[];
};

export type TopResult = { rank: number; title: string; domain: string; rating: number | null; reviews: number | null };

export type GridPoint = {
  row: number;
  col: number;
  latitude: number;
  longitude: number;
  rank: number | null;
  previous_rank: number | null;
  failed: boolean;
  top_results: TopResult[];
};

export type KeywordDetail = {
  keyword: { id: number; keyword: string };
  scanning: boolean;
  scan:
    | (ScanSummary & {
        grid_size: number;
        radius_km: number;
        radius_miles?: number;
        center_latitude: number;
        center_longitude: number;
        points: GridPoint[];
      })
    | null;
  previous: ScanSummary | null;
  history: ScanSummary[];
};

export type ProfileInput = {
  latitude: number;
  longitude: number;
  grid_size: number;
  radius_miles?: number;
  radius_km?: number;
  business_domain?: string;
};
