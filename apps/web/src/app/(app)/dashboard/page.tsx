// @jsxRuntime classic
import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@tuiton/db";
import { PILLARS } from "@tuiton/shared";
import { getSession } from "@/lib/session";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) return null;

  return (
    <div className="min-h-screen bg-background p-4">
      <header className="mb-8">
        <h1 className="font-serif text-3xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Welcome to your dashboard</p>
      </header>
      <main className="prose max-w-none">
        <p>Your Tuiton dashboard is live!</p>
      </main>
    </div>
  );
}