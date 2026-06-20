import type { NodeKind } from "@/types/trip";
import {
  Train,
  BedDouble,
  Camera,
  UtensilsCrossed,
  Landmark,
  Mountain,
  PhoneCall,
} from "lucide-react";

export function NodeIcon({ kind, className }: { kind: NodeKind; className?: string }) {
  const I = {
    transport: Train,
    stay: BedDouble,
    visit: Camera,
    food: UtensilsCrossed,
    temple: Landmark,
    activity: Mountain,
    emergency: PhoneCall,
  }[kind];
  return <I className={className} />;
}
