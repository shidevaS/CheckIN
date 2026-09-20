import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@tuiton/db";
import { getSession } from "@/lib/session";
import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui";

export const metadata: Metadata = { title: "Live Classes" };

export default async function LiveClassesPage() {
  const session = await getSession();
  if (!session) return null;

  const now = new Date();
  const isAdmin = session.role === "ADMIN";

  const [upcoming, past, enrollments] = await Promise.all([
    prisma.liveClass.findMany({
      where: {
        status: { in: ["SCHEDULED", "LIVE"] },
        startsAt: { gte: now },
      },
      orderBy: { startsAt: "asc" },
      include: {
        roadmap: true,
        _count: { select: { attendance: true } },
      },
    }),
    prisma.liveClass.findMany({
      where: {
        startsAt: { lt: now },
      },
      orderBy: { startsAt: "desc" },
      include: {
        roadmap: true,
        _count: { select: { attendance: true } },
      },
      take: 10,
    }),
    isAdmin ? [] : prisma.classAttendance.findMany({
      where: { userId: session.sub },
      select: { classId: true },
    }),
  ]);

  const enrolledIds = new Set(enrollments.map((e) => e.classId));

  return (
    <div className="space-y-10">
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-semibold tracking-tight">Live Classes</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Join scheduled sessions, participate in real-time chat, and watch recordings.
          </p>
        </div>
        {isAdmin && (
          <Button asChild>
            <Link href="/admin/classes/new">Schedule Class</Link>
          </Button>
        )}
      </header>

      {/* Upcoming */}
      <section>
        <h2 className="mb-4 font-serif text-xl font-semibold flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500" />
          Upcoming
        </h2>
        {upcoming.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground">
              No upcoming classes scheduled. Check back soon!
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {upcoming.map((cls) => (
              <ClassCard
                key={cls.id}
                cls={cls}
                isEnrolled={enrolledIds.has(cls.id)}
                isAdmin={isAdmin}
                sessionUser={session}
              />
            ))}
          </div>
        )}
      </section>

      {/* Past / Recordings */}
      <section>
        <h2 className="mb-4 font-serif text-xl font-semibold flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-muted" />
          Past Classes & Recordings
        </h2>
        {past.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground">
              No past classes yet. Recordings will appear here after sessions end.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {past.map((cls) => (
              <ClassCard
                key={cls.id}
                cls={cls}
                isEnrolled={enrolledIds.has(cls.id)}
                isAdmin={isAdmin}
                sessionUser={session}
                isPast={true}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function ClassCard({
  cls,
  isEnrolled,
  isAdmin,
  sessionUser,
  isPast = false,
}: {
  cls: any;
  isEnrolled: boolean;
  isAdmin: boolean;
  sessionUser: { sub: string; name: string; role: string };
  isPast?: boolean;
}) {
  const startsAt = new Date(cls.startsAt);
  const isLive = cls.status === "LIVE";
  const canJoin = isEnrolled || isAdmin;
  const jitsiUrl = `https://meet.jit.si/${cls.roomName}`;

  return (
    <Card className="group hover:border-[rgb(var(--primary)/0.4)] transition-colors">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <CardTitle className="font-serif text-lg flex items-center gap-2">
              {cls.title}
              {isLive && <Badge tone="live" className="animate-pulse">LIVE</Badge>}
              {cls.status === "ENDED" && <Badge tone="neutral">Ended</Badge>}
            </CardTitle>
            <CardDescription className="mt-1">{cls.description}</CardDescription>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <Badge tone="neutral" className="gap-1">
            {cls.roadmap && (
              <>
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cls.roadmap.color }} />
                {cls.roadmap.title}
              </>
            )}
          </Badge>
          <span>
            {startsAt.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
            at {startsAt.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
          </span>
          <span>•</span>
          <span>{cls.durationMin}min</span>
          <span>•</span>
          <span>{cls._count.attendance} attendees</span>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-2">
        {!isPast && !isEnrolled && !isAdmin && (
          <Button className="w-full" onClick={() => alert("Enroll in the roadmap to join this class")}>
            Enroll in Roadmap First
          </Button>
        )}
        {isPast ? (
          <Button variant="outline" className="w-full" asChild disabled={!cls.roomName}>
            <a href={`https://meet.jit.si/${cls.roomName}?#config.prejoinPageEnabled=false`} target="_blank" rel="noopener noreferrer">
              {cls.roomName ? "Watch Recording" : "Recording Unavailable"}
            </a>
          </Button>
        ) : isLive && canJoin ? (
          <Button className="w-full bg-red-600 hover:bg-red-700" asChild>
            <a href={jitsiUrl} target="_blank" rel="noopener noreferrer">Join Live Now</a>
          </Button>
        ) : canJoin ? (
          <Button className="w-full" asChild>
            <a href={`/live/${cls.id}`} target="_blank" rel="noopener noreferrer">Join When Live</a>
          </Button>
        ) : (
          <Button variant="outline" className="w-full" disabled>Join When Live</Button>
        )}
      </CardContent>
    </Card>
  );
}