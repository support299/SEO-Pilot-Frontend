export type WordPressStatus =
  | { connected: false }
  | {
      connected: true;
      website_url: string;
      wp_user_name: string;
      status: "connected" | "error" | "revoked";
      connected_at: string;
      last_verified_at: string | null;
      last_error: string | null;
    };

export type WordPressObjectType = "page" | "post";

export type WordPressInventoryItem = {
  id: number;
  object_type: WordPressObjectType;
  title: string;
  slug: string;
  status: string;
  url: string | null;
};

export type ProposedChanges = {
  title?: string;
  meta_description?: string;
};

export type ChangePacketStatus =
  | "awaiting_approval"
  | "approved"
  | "rejected"
  | "applying"
  | "applied"
  | "failed"
  | "stale"
  | "rolled_back"
  | "rollback_blocked";

export type ChangePacket = {
  id: number;
  target_object_type: WordPressObjectType;
  target_object_id: number;
  target_url: string;
  proposed_changes: ProposedChanges;
  reason: string;
  /** "agent" = proposed by an AI agent through the agent API. */
  source: "manual" | "agent";
  agent_name: string;
  status: ChangePacketStatus;
  before_snapshot: Record<string, string> | null;
  after_snapshot: Record<string, string> | null;
  last_error: string;
  created_at: string;
  approved_at: string | null;
  applied_at: string | null;
  rolled_back_at: string | null;
};
