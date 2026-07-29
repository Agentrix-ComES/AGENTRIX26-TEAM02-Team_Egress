/** Deterministic per-slot pseudo-availability, standing in for a real inventory check. */
export function isAvailable(slotId: string, date: Date) {
  const key = `${slotId}-${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
  let hash = 0
  for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) % 997
  return hash % 5 !== 0
}

/** True if any day in [start, end] (inclusive) is available for this slot. */
export function isAvailableInRange(slotId: string, start: Date, end: Date) {
  const day = new Date(start)
  while (day <= end) {
    if (isAvailable(slotId, day)) return true
    day.setDate(day.getDate() + 1)
  }
  return false
}
