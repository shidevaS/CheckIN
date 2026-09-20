import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@tuiton/db";
import { getSession } from "@/lib/session";
import { PILLARS } from "@tuiton/shared";
import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui";

export const metadata: Metadata = { title: "Learning Roadmaps" };

function PillarSection({ pillar, roadmaps, enrollments }: { pillar: (typeof PILLARS)[number]; roadmaps: any[]; enrollments: Map<string, number> }) {
  const pillarRoadmaps = roadmaps.filter((r) => r.pillar === pillar.id);
  if (pillarRoadmaps.length === 0) return null;

  return (
    <section className="space-y-4">
      <h2 className="font-serif text-xl font-semibold flex items-center gap-2">
        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: pillarRoadmaps[0]?.color || "#166534" }} />
        {pillar.label}
      </h2>
      <p className="text-sm text-muted-foreground">{pillar.tagline}</p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {pillarRoadmaps.map((rm) => (
          <Card key={rm.id} className="group hover:border-[rgb(var(--primary)/0.4)] transition-colors">
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <CardTitle className="font-serif text-lg">{rm.title}</CardTitle>
                  <CardDescription className="mt-1">{rm.tagline}</CardDescription>
                </div>
                <div className="w-3 h-3 rounded-full flex-shrink-0 mt-1" style={{ backgroundColor: rm.color }} />
              </div>
              <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                <Badge tone="neutral">{rm.grade || "All"}</Badge>
                <span>{rm.modules?.length || 0} modules</span>
                <span>•</span>
                <span>{rm.lessons?.length || 0} lessons</span>
                <span>•</span>
                <span>~{rm.xpTotal || 0} XP</span>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[rgb(var(--primary))] transition-all duration-500"
                      style={{ width: `${enrollments.get(rm.id) || 0}%` }}
                    />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {enrollments.get(rm.id) ? `${enrollments.get(rm.id)}% complete` : "Not started"}
                  </p>
                </div>
                <Button size="sm" asChild>
                  <Link href={`/roadmaps/${rm.slug}`}>Open</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

export default async function RoadmapsPage() {
  const session = await getSession();
  if (!session) return null;

  const [roadmaps, enrollmentsData] = await Promise.all([
    prisma.roadmap.findMany({
      where: { published: true },
      orderBy: [{ pillar: "asc" }, { order: "asc" }],
      include: { modules: { include: { lessons: true } } },
    }),
    prisma.roadmapEnrollment.findMany({
      where: { userId: session.sub },
      select: { roadmapId: true, progressPct: true },
    }),
  ]);

  const enrollments = new Map(enrollmentsData.map((e) => [e.roadmapId, e.progressPct]));

  return (
    <div className="space-y-10">
      <header>
        <h1 className="font-serif text-3xl font-semibold tracking-tight">Learning Roadmaps</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Structured paths from basics to mastery. Pick a pillar, enroll, and track your progress.
        </p>
      </header>

      {PILLARS.map((pillar) => (
        <PillarSection key={pillar.id} pillar={pillar} roadmaps={roadmaps} enrollments={enrollments} />
      ))}

      <section>
        <h2 className="mb-4 font-serif text-xl font-semibold">Your Enrollments</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from(enrollments.entries()).map(([roadmapId, progress]) => {
            const rm = roadmaps.find((r) => r.id === roadmapId);
            if (!rm) return null;
            return (
              <Card key={roadmapId} className="group hover:border-[rgb(var(--primary)/0.4)] transition-colors">
                <CardHeader>
                  <CardTitle className="font-serif text-lg">{rm.title}</CardTitle>
                  <CardDescription>{rm.tagline}</CardDescription>
                </CardHeader>
                <CardContent className="pt-0 space-y-3">
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[rgb(var(--primary))] transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{progress}% complete</span>
                    <Button size="sm" asChild>
                      <Link href={`/roadmaps/${rm.slug}`}>Continue</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
}