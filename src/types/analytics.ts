export type AnalyticsConnectionStatus =
  | { connected: false }
  | {
      connected: true;
      property_id: string;
      property_name: string;
      website_url: string;
      conversion_events: string[];
      conversions_measurable: boolean;
      connected_at: string;
      last_synced_at: string | null;
      last_sync_error: string | null;
    };

export type AnalyticsOverview = {
  range_days: number;
  conversions_measurable: boolean;
  rows: Array<{ date: string; sessions: number; active_users: number; conversions: number | null }>;
  summary: { sessions: number; active_users: number; conversions: number | null };
  comparison: {
    sessions_delta_pct: number | null;
    active_users_delta_pct: number | null;
    conversions_delta_pct: number | null;
  } | null;
};

export type AnalyticsSnapshot = {
  connected: boolean;
  checkFailed: boolean;
  synced: boolean;
  conversionsMeasurable: boolean;
  sessions: number | null;
  conversions: number | null;
  sessionsDeltaPct: number | null;
  conversionsDeltaPct: number | null;
};
