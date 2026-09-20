/** Role of a user account. Admins are the hosts/teachers (Shivani, Devendra). */
export type Role = "STUDENT" | "ADMIN";

export const Roles = { STUDENT: "STUDENT", ADMIN: "ADMIN" } as const;

/** A signed-in actor, serialized into the session JWT. */
export type SessionUser = {
  sub: string;
  email: string;
  name: string;
  role: Role;
  iat?: number;
  exp?: number;
};

export type ChallengeCadence = "DAILY" | "WEEKLY" | "MONTHLY";
export type SubmissionStatus = "SUBMITTED" | "UNDER_REVIEW" | "APPROVED" | "REJECTED";

/** The two pillars of the product. */
export const PILLARS = [
  { id: "subjects", label: "Subjects", tagline: "Board & school tuition — Maths, Science, English, SST." },
  { id: "innovation", label: "Innovation Lab", tagline: "Coding, prompt engineering, AI tools, app-building, cyber basics." },
] as const;

export type PillarId = (typeof PILLARS)[number]["id"];