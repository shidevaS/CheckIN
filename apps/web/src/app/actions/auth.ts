"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { prisma, hashPassword, verifyPassword } from "@tuiton/db";
import { createSession, destroySession } from "@/lib/session";

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

const registerSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name."),
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

type ActionResult = { error?: string; redirectTo?: string };

export async function login(input: unknown): Promise<ActionResult> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid login details." };
  }
  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user?.passwordHash || !verifyPassword(password, user.passwordHash)) {
    return { error: "Incorrect email or password." };
  }

  await createSession({ sub: user.id, email: user.email, name: user.name, role: user.role as "STUDENT" | "ADMIN" });

  return { redirectTo: user.role === "ADMIN" ? "/admin" : "/dashboard" };
}

export async function register(input: unknown): Promise<ActionResult> {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please fix the highlighted fields." };
  }
  const { name, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "An account with that email already exists. Try logging in." };
  }

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash: hashPassword(password),
      role: "STUDENT",
      profile: { create: { grade: "", school: "" } },
    },
  });

  await createSession({ sub: user.id, email: user.email, name: user.name, role: "STUDENT" });
  return { redirectTo: "/dashboard" };
}

export async function logout(): Promise<ActionResult> {
  await destroySession();
  return { redirectTo: "/login" };
}