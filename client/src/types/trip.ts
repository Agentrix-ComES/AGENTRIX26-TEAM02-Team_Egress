export type NodeState = "green" | "red" | "purple" | "active";

export type NodeKind =
  | "transport"
  | "stay"
  | "visit"
  | "food"
  | "temple"
  | "activity"
  | "emergency";

export interface TripNode {
  id: string;
  kind: NodeKind;
  title: string;
  location: string;
  start: string;
  end: string;
  state: NodeState;
  description: string;
  cultural?: string;
  risk?: string;
  cost?: number;
  vendor?: string;
  bookingRef?: string;
  warnings?: string[];
  recommendations?: string[];
  emergency?: { name: string; phone: string }[];
  food?: { name: string; cuisine: string; rating: number }[];
}

export interface Trip {
  id: string;
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  travelers: number;
  budget: number;
  currency: string;
  preferences: string[];
  coverImage?: string;
  progress: number;
  nodes: TripNode[];
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "agent";
  agent?: "planner" | "logistics" | "disruption" | "culture" | "orchestrator";
  content: string;
  timestamp: string;
}

export interface Alert {
  id: string;
  severity: "info" | "warning" | "critical";
  title: string;
  body: string;
  source: string;
  affectedNodeId?: string;
  receivedAt: string;
  acknowledged: boolean;
}
