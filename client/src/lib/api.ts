// Barrel file — all FE backend clients re-exported from one place.
// New code should import from "@/lib/api"; submodules in ./api/* are the source.

export * from "./api/core";
export * from "./api/users";
export * from "./api/ai";
export * from "./api/trips";
export * from "./api/bookings";
export * from "./api/destinations";
