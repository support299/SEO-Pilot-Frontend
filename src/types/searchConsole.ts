export type ConnectionStatus =
  | { connected: false }
  | { connected: true; site_url: string; connected_at: string; last_synced_at: string | null; last_sync_error: string | null };

export type DailyMetricRow = {
  date: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
};

export type PeriodSummary = {
  clicks: number;
  impressions: number;
  ctr: number | null;
  average_position: number | null;
};

export type PeriodComparison = {
  clicks_delta_pct: number | null;
  impressions_delta_pct: number | null;
  ctr_delta_pct: number | null;
  position_delta: number | null;
};

export type Overview = {
  range_days: number;
  rows: DailyMetricRow[];
  summary: PeriodSummary;
  comparison: PeriodComparison | null;
};

export type TopQuery = { query: string; clicks: number; impressions: number; ctr: number; position: number };
export type TopPage = { page: string; clicks: number; impressions: number; ctr: number; position: number };

export const RANGE_OPTIONS = [7, 28, 90] as const;
export type RangeDays = (typeof RANGE_OPTIONS)[number];
