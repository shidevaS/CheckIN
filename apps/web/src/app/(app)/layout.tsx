import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { Logo } from "@/components/logo";
import { SignOutButton } from "@/components/sign-out-button";
import { Badge } from "@/components/ui";
import { NotificationsBell } from "@/components/notifications-bell";
import { SWRegistration } from "@/components/sw-registration";
import { PWAInstallPrompt } from "@/components/pwa-install";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");

  const isAdmin = session.role === "ADMIN";

  return (
    <div className="flex min-h-screen flex-col">
      <SWRegistration />
      <PWAInstallPrompt />
      <header className="sticky top-0 z-20 border-b border-border bg-[rgb(var(--card))]">
        <nav className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-5">
          <div className="flex items-center gap-6">
            <Logo href={isAdmin ? "/admin" : "/dashboard"} />
            <div className="hidden items-center gap-1 sm:flex">
              <Link href="/dashboard" className="rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground">
                Dashboard
              </Link>
              <Link href="/roadmaps" className="rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground">
                Roadmaps
              </Link>
              <Link href="/courses" className="rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground">
                Courses
              </Link>
              <Link href="/tutor" className="rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground">
                AI Tutor
              </Link>
              <Link href="/live" className="rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground">
                Live Classes
              </Link>
              <Link href="/challenges" className="rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground">
                Challenges
              </Link>
              <Link href="/leaderboard" className="rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground">
                Leaderboard
              </Link>
              <Link href="/profile" className="rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground">
                Profile
              </Link>
              <Link href="/community" className="rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground">
                Community
              </Link>
              {isAdmin && (
                <Link href="/admin" className="rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground">
                  Admin console
                </Link>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <NotificationsBell />
            <div className="flex items-center gap-2 text-sm">
              <span className="hidden font-medium sm:inline">{session.name}</span>
              <Badge tone={isAdmin ? "gold" : "teal"}>{isAdmin ? "Admin" : "Student"}</Badge>
            </div>
            <SignOutButton />
          </div>
        </nav>
      </header>
      <main className="flex-1">
        <div className="mx-auto w-full max-w-6xl px-5 py-8">{children}</div>
      </main>
    </div>
  );
}