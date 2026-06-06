export type FusionEventType = "Tournament" | "Event";

export type FusionEventStatus = "pending" | "earned" | "skipped";

export interface FusionEvent {
  id: string;
  name: string;
  type: FusionEventType;
  startDate: string | null;
  endDate: string | null;
  fragments: number | null;
  leaderboardFragments?: number | null;
  earnedFragments?: number | null;
  gridPosition: number;
  status: FusionEventStatus;
  needsReview: boolean;
  notes?: string;
}

export interface FusionTracker {
  id: string;
  fusionName: string | null;
  dateRange: {
    start: string | null;
    end: string | null;
  };
  requiredFragments: number;
  totalFragments: number;
  events: FusionEvent[];
  createdAt: string;
  updatedAt: string;
  source: "ai" | "imported" | "manual";
}
