export type HistoryEvent = {
  id: number;
  kind: string;
  summary: string;
  metadata: Record<string, unknown>;
  actor: string | null;
  occurred_at: string;
};

export type ScorePoint = {
  finished_at: string;
  score: number;
};

export type HistoryPage = {
  count: number;
  next: string | null;
  results: HistoryEvent[];
  score_trend: ScorePoint[];
};
