import type { Metadata } from "next";
import { prisma } from "@tuiton/db";
import { getSession } from "@/lib/session";
import { Badge, Card, CardContent, CardHeader, CardTitle } from "@/components/ui";

export const metadata: Metadata = { title: "Leaderboard" };

export default async function LeaderboardPage() {
  const session = await getSession();
  if (!session) return null;

  const [myProfile, topUsers, myRank] = await Promise.all([
    prisma.studentProfile.findUnique({ where: { userId: session.sub } }),
    prisma.user.findMany({
      where: { role: "STUDENT" },
      include: { profile: true },
      orderBy: { profile: { xp: "desc" } },
      take: 50,
    }),
    prisma.user.findMany({
      where: { role: "STUDENT" },
      include: { profile: true },
      orderBy: { profile: { xp: "desc" } },
    }),
  ]);

  const myIndex = myRank.findIndex((u) => u.id === session.sub);
  const myPosition = myIndex >= 0 ? myIndex + 1 : null;

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-serif text-3xl font-semibold tracking-tight">Leaderboard</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Top learners by XP. Complete lessons, challenges, and attend live classes to climb the ranks.
        </p>
      </header>

      {/* My Position */}
      {myPosition && (
        <Card className="border-[rgb(var(--primary)/0.4)] bg-[rgb(var(--primary)/0.05)]">
          <CardContent className="flex items-center justify-between flex-wrap gap-4 pt-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl text-[rgb(var(--primary))]"
                style={{ backgroundColor: "rgb(var(--primary)/0.1)" }}>
                {myPosition}
              </div>
              <div>
                <p className="font-semibold">Your Rank</p>
                <p className="text-sm text-muted-foreground">#{myPosition} of {myRank.length} students</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-muted-foreground">{myProfile?.xp || 0} XP</span>
              <span className="text-muted-foreground">Level {myProfile?.level || 1}</span>
              <span className="text-muted-foreground">🔥 {myProfile?.streak || 0}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Full Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-lg">Top 50</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted-foreground">
                  <th className="pb-2 pr-4 font-medium w-12">Rank</th>
                  <th className="pb-2 pr-4 font-medium">Student</th>
                  <th className="pb-2 pr-4 font-medium">Grade</th>
                  <th className="pb-2 pr-4 font-medium text-right">XP</th>
                  <th className="pb-2 pr-4 font-medium text-right">Level</th>
                  <th className="pb-2 font-medium text-right">Streak</th>
                </tr>
              </thead>
              <tbody>
                {topUsers.map((user, idx) => {
                  const isMe = user.id === session.sub;
                  return (
                    <tr key={user.id} className={`border-b border-border/60 last:border-0 ${isMe ? "bg-[rgb(var(--primary)/0.05)]" : ""}`}>
                      <td className="py-3 pr-4 font-medium">
                        {idx === 0 && <Badge tone="gold">🥇</Badge>}
                        {idx === 1 && <Badge tone="neutral">🥈</Badge>}
                        {idx === 2 && <Badge tone="teal">🥉</Badge>}
                        {idx >= 3 && <span className="text-muted-foreground">#{idx + 1}</span>}
                      </td>
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium"
                            style={{ backgroundColor: `hsl(${user.profile?.avatarHue || 28}, 70%, 50%)`, color: "white" }}>
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <span className={isMe ? "font-semibold" : "font-medium"}>
                            {user.name} {isMe && <Badge tone="gold" className="text-xs ml-1">You</Badge>}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 pr-4 text-muted-foreground">{user.profile?.grade || "—"}</td>
                      <td className="py-3 pr-4 text-right font-medium">{user.profile?.xp || 0}</td>
                      <td className="py-3 pr-4 text-right text-muted-foreground">Lv. {user.profile?.level || 1}</td>
                      <td className="py-3 text-right text-muted-foreground">🔥 {user.profile?.streak || 0}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Badges */}
      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-lg">Recent Badges Earned</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-sm text-muted-foreground mb-3">
            Complete challenges and roadmaps to unlock badges. Your badges appear on your profile.
          </p>
          <div className="flex flex-wrap gap-2">
            {[
              { slug: "first-steps", name: "First Steps", icon: "🌱" },
              { slug: "streak-3", name: "3-Day Streak", icon: "🔥" },
              { slug: "streak-7", name: "Week Warrior", icon: "🔥🔥" },
              { slug: "quiz-ace", name: "Quiz Ace", icon: "🧠" },
              { slug: "code-runner", name: "Code Runner", icon: "💻" },
              { slug: "agent-builder", name: "Agent Builder", icon: "🤖" },
              { slug: "prompt-pro", name: "Prompt Pro", icon: "✨" },
              { slug: "math-master", name: "Math Master", icon: "📐" },
              { slug: "early-bird", name: "Early Bird", icon: "🌅" },
            ].map((b) => (
              <div
                key={b.slug}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/80 transition-colors cursor-default"
              >
                <span className="text-lg">{b.icon}</span>
                <span className="text-sm font-medium">{b.name}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}