import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@tuiton/db";
import { getSession } from "@/lib/session";
import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui";

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const rm = await prisma.roadmap.findUnique({ where: { slug } });
  return { title: rm?.title || "Roadmap" };
}

function ModuleCard({ mod, enrollment, userId }: { mod: any; enrollment: boolean; userId: string }) {
  const completedCount = mod.lessons.filter((l: any) => l.progress?.completed).length;
  const total = mod.lessons.length;
  const pct = total > 0 ? Math.round((completedCount / total) * 100) : 0;

  return (
    <Card className="group hover:border-[rgb(var(--primary)/0.4)] transition-colors">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <CardTitle className="font-serif text-lg">{mod.title}</CardTitle>
            <CardDescription className="mt-1">{mod.description}</CardDescription>
          </div>
          <Badge tone={mod.order === 1 ? "gold" : "neutral"}>Module {mod.order}</Badge>
        </div>
        <div className="mt-2 flex items-center gap-3 text-sm text-muted-foreground">
          <span>{total} lessons</span>
          <span>•</span>
          <span>{mod.lessons.reduce((s: number, l: any) => s + (l.xp || 0), 0)} XP</span>
          {enrollment && (
            <>
              <span>•</span>
              <div className="flex-1 max-w-xs">
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-[rgb(var(--primary))]" style={{ width: `${pct}%` }} />
                </div>
              </div>
              <span className="font-medium">{pct}%</span>
            </>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-2">
        {mod.lessons.map((lesson: any) => (
          <Link
            key={lesson.id}
            href={`/roadmaps/${mod.roadmap.slug}/modules/${mod.id}/lessons/${lesson.id}`}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors group"
          >
            <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium"
              style={{ backgroundColor: lesson.kind === "CODING" ? "rgb(var(--accent))" : lesson.kind === "QUIZ" ? "rgb(var(--primary))" : "rgb(var(--muted))", color: lesson.kind === "CODING" || lesson.kind === "QUIZ" ? "white" : "inherit" }}>
              {lesson.kind === "CODING" ? "💻" : lesson.kind === "QUIZ" ? "❓" : lesson.kind === "VIDEO" ? "▶" : "📖"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate group-hover:text-[rgb(var(--primary))] transition-colors">{lesson.title}</p>
              <p className="text-xs text-muted-foreground truncate">{lesson.summary}</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {lesson.progress?.completed && <span className="text-green-600">✓ Done</span>}
              <Badge tone="neutral" className="text-xs">{lesson.kind}</Badge>
              <span>{lesson.xp} XP</span>
            </div>
          </Link>
        ))}
        {!enrollment && (
          <Button className="w-full mt-2" asChild>
            <Link href={`/roadmaps/${mod.roadmap.slug}/enroll`}>Enroll to track progress</Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export default async function RoadmapDetailPage({ params }: Props) {
  const { slug } = await params;
  const session = await getSession();
  if (!session) return null;

  const roadmap = await prisma.roadmap.findUnique({
    where: { slug },
    include: {
      modules: {
        orderBy: { order: "asc" },
        include: {
          lessons: {
            orderBy: { order: "asc" },
            include: {
              progress: session ? { where: { userId: session.sub } } : false,
            },
          },
        },
      },
    },
  });

  if (!roadmap) notFound();

  const enrollment = await prisma.roadmapEnrollment.findUnique({
    where: { userId_roadmapId: { userId: session.sub, roadmapId: roadmap.id } },
  });

  return (
    <div className="space-y-8">
      <header>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Badge tone="neutral">{roadmap.pillar}</Badge>
          <span>•</span>
          <Badge tone="neutral">{roadmap.grade || "All grades"}</Badge>
        </div>
        <h1 className="font-serif text-3xl font-semibold tracking-tight">{roadmap.title}</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">{roadmap.tagline}</p>

        {enrollment && (
          <div className="mt-4 flex items-center gap-4">
            <div className="flex-1 max-w-md">
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-[rgb(var(--primary))] transition-all duration-500" style={{ width: `${enrollment.progressPct}%` }} />
              </div>
            </div>
            <span className="text-sm font-medium">{enrollment.progressPct}% complete</span>
            {enrollment.certified && <Badge tone="gold">Certified</Badge>}
          </div>
        )}
      </header>

      {!enrollment && (
        <Card className="border-[rgb(var(--primary)/0.4)] bg-[rgb(var(--primary)/0.05)]">
          <CardContent className="pt-5">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <p className="font-medium">Not enrolled yet</p>
                <p className="text-sm text-muted-foreground">Enroll to track progress, earn XP, and unlock certificates.</p>
              </div>
              <Button asChild>
                <Link href={`/roadmaps/${roadmap.slug}/enroll`}>Enroll now (free)</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <section>
        <h2 className="mb-4 font-serif text-xl font-semibold">Modules</h2>
        <div className="grid gap-5 lg:grid-cols-2">
          {roadmap.modules.map((mod) => (
            <ModuleCard key={mod.id} mod={mod} enrollment={!!enrollment} userId={session.sub} />
          ))}
        </div>
      </section>
    </div>
  );
}