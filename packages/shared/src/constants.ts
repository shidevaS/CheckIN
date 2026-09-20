export const APP_NAME = "Tuiton";
export const APP_TAGLINE = "Tuition meets the AI studio.";

/** Admin accounts created by the seed script (Phase 1, dev). Change passwordHash via login flow. */
export const SEED_ADMINS = [
  { name: "Shivani Pal", email: "shivani@tuiton.app", role: "ADMIN" },
  { name: "Devendra Sharma", email: "devendra@tuiton.app", role: "ADMIN" },
] as const;

/** Demo student used by the seed script. */
export const SEED_STUDENT = { name: "Demo Student", email: "student@tuiton.app", role: "STUDENT" } as const;

/** Default password for seeded admin accounts. */
export const DEFAULT_ADMIN_PASSWORD = "tuiton123";

export const ADMIN_EMAILS = SEED_ADMINS.map((a) => a.email);