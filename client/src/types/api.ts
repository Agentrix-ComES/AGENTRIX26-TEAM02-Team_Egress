export interface ItineraryItem {
  type: "hotel" | "activity" | "transport" | "meal";
  time: string | null;
  title: string;
  location: string | null;
  notes: string | null;
  metadata: Record<string, unknown>;
}

export interface ItineraryDay {
  date: string | null;
  location: string | null;
  items: ItineraryItem[];
}

export interface Itinerary {
  destination: string | null;
  start_date: string | null;
  end_date: string | null;
  days: ItineraryDay[];
}

export interface ChatRequest {
  message: string;
  conversation_id?: string;
  user_id?: string;
  preferences?: string[];
  destination?: string;
  start_date?: string;
  end_date?: string;
}

export interface ChatResponse {
  conversation_id: string;
  run_id: string;
  reply: string;
  plan_changed: boolean;
  itinerary: Itinerary | null;
}
