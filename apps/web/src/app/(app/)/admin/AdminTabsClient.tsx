"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger, Card, CardContent, CardHeader, CardTitle, Badge, Button, Input, Label, Textarea, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Separator, Switch } from "@/components/ui";

interface AdminTabsClientProps {
  users: any[];
  submissionsCount: number;
  challengesCount: number;
  roadmaps: any[];
  liveClasses: any[];
  forumTopics: any[];
}

export default function AdminTabsClient({
  users,
  submissionsCount,
  challengesCount,
  roadmaps,
  liveClasses,
  forumTopics,
}: AdminTabsClientProps) {
  const [activeTab, setActiveTab] = useState("users");
  const admins = users.filter((u) => u.role === "ADMIN");
  const students = users.filter((u) => u.role === "STUDENT");

  return (
    <>
      <section className="grid grid-cols-2 gap-4 sm:grid-cols-6">
        {[
          { label: "Accounts", value: String(users.length), tone: "neutral" },
          { label: "Students", value: String(students.length), tone: "teal" },
          { label: "Admins", value: String(admins.length), tone: "gold" },
          { label: "Challenges", value: String(challengesCount), tone: "gold" },
          { label: "Submissions", value: String(submissionsCount), tone: "teal" },
          { label: "Roadmaps", value: String(roadmaps.length), tone: "neutral" },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="pt-5">
              <p className="font-serif text-2xl font-semibold leading-none">{s.value}</p>
              <p className="mt-1.5 text-xs uppercase tracking-wide text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="roadmaps">Roadmaps</TabsTrigger>
          <TabsTrigger value="challenges">Challenges</TabsTrigger>
          <TabsTrigger value="submissions">Submissions</TabsTrigger>
          <TabsTrigger value="liveclasses">Live Classes</TabsTrigger>
          <TabsTrigger value="community">Community</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-serif text-lg">All Users</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs text-muted-foreground">
                    <th className="pb-2 pr-4 font-medium">Name</th>
                    <th className="pb-2 pr-4 font-medium">Email</th>
                    <th className="pb-2 pr-4 font-medium">Role</th>
                    <th className="pb-2 pr-4 font-medium">Grade</th>
                    <th className="pb-2 pr-4 font-medium">XP</th>
                    <th className="pb-2 pr-4 font-medium">Level</th>
                    <th className="pb-2 pr-4 font-medium">Streak</th>
                    <th className="pb-2 pr-4 font-medium">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b border-border/60 last:border-0">
                      <td className="py-2 pr-4 font-medium">{u.name}</td>
                      <td className="py-2 pr-4 text-muted-foreground">{u.email}</td>
                      <td className="py-2 pr-4">
                        <Badge tone={u.role === "ADMIN" ? "gold" : "teal"}>{u.role}</Badge>
                      </td>
                      <td className="py-2 pr-4 text-muted-foreground">{u.profile?.grade || "—"}</td>
                      <td className="py-2 pr-4 font-medium">{u.profile?.xp || 0}</td>
                      <td className="py-2 pr-4 text-muted-foreground">Lv. {u.profile?.level || 1}</td>
                      <td className="py-2 pr-4 text-muted-foreground">🔥 {u.profile?.streak || 0}</td>
                      <td className="py-2 text-muted-foreground">{new Date(u.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Roadmaps Tab */}
        <TabsContent value="roadmaps" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif text-xl font-semibold">Roadmaps</h2>
              <p className="text-muted-foreground">Manage learning roadmaps and modules</p>
            </div>
            <Button onClick={() => window.open("/admin/roadmaps/new", "_blank")}>+ New Roadmap</Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {roadmaps.map((r) => (
              <Card key={r.id} className={r.published ? "" : "border-yellow-500/50 bg-yellow-50/30"}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="font-serif text-lg">{r.title}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">{r.tagline}</p>
                    </div>
                    <Badge tone={r.pillar === "subjects" ? "teal" : "gold"}>{r.pillar}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 pt-0">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Badge tone={"neutral"} variant="outline">{r._count.modules} modules</Badge>
                    <Badge tone={"neutral"} variant="outline">{r._count.enrollments} students</Badge>
                    <Badge tone={r.published ? "teal" : "gold"} variant={r.published ? "default" : "outline"}>
                      {r.published ? "Published" : "Draft"}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">Grade: {r.grade || "All"} · XP Total: {r.xpTotal}</div>
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" asChild>
                      <a href={`/roadmaps/${r.slug}`} target="_blank">View</a>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <a href={`/admin/roadmaps/${r.id}/edit`}>Edit</a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Challenges Tab */}
        <TabsContent value="challenges" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif text-xl font-semibold">Challenges</h2>
              <p className="text-muted-foreground">Manage daily, weekly, and monthly challenges</p>
            </div>
            <Button onClick={() => window.open("/admin/challenges/new", "_blank")}>+ New Challenge</Button>
          </div>
          <Card>
            <CardContent className="pt-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs text-muted-foreground">
                    <th className="pb-2 pr-4 font-medium">Title</th>
                    <th className="pb-2 pr-4 font-medium">Kind</th>
                    <th className="pb-2 pr-4 font-medium">Cadence</th>
                    <th className="pb-2 pr-4 font-medium">Difficulty</th>
                    <th className="pb-2 pr-4 font-medium">Strand</th>
                    <th className="pb-2 pr-4 font-medium">XP</th>
                    <th className="pb-2 pr-4 font-medium">Status</th>
                    <th className="pb-2 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {true && <tr><td colSpan={8} className="py-8 text-center text-muted-foreground">Loaded via API</td></tr>}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Submissions Tab */}
        <TabsContent value="submissions" className="space-y-6">
          <div>
            <h2 className="font-serif text-xl font-semibold">Challenge Submissions</h2>
            <p className="text-muted-foreground">Review and grade pending submissions</p>
          </div>
          <Card>
            <CardContent className="pt-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs text-muted-foreground">
                    <th className="pb-2 pr-4 font-medium">Student</th>
                    <th className="pb-2 pr-4 font-medium">Challenge</th>
                    <th className="pb-2 pr-4 font-medium">Kind</th>
                    <th className="pb-2 pr-4 font-medium">Status</th>
                    <th className="pb-2 pr-4 font-medium">Score</th>
                    <th className="pb-2 pr-4 font-medium">XP Awarded</th>
                    <th className="pb-2 pr-4 font-medium">Submitted</th>
                    <th className="pb-2 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {true && <tr><td colSpan={8} className="py-8 text-center text-muted-foreground">Loaded via API</td></tr>}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Live Classes Tab */}
        <TabsContent value="liveclasses" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif text-xl font-semibold">Live Classes</h2>
              <p className="text-muted-foreground">Schedule and manage live Jitsi classes</p>
            </div>
            <Button onClick={() => window.open("/admin/liveclasses/new", "_blank")}>+ Schedule Class</Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {liveClasses.map((c) => (
              <Card key={c.id} className={c.status === "LIVE" ? "ring-2 ring-[rgb(var(--primary))]" : c.status === "ENDED" ? "opacity-70" : ""}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="font-serif text-lg">{c.title}</CardTitle>
                    <Badge tone={c.status === "LIVE" ? "teal" : c.status === "ENDED" ? "neutral" : "gold"}>{c.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 pt-0">
                  <p className="text-sm text-muted-foreground line-clamp-2">{c.description}</p>
                  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                    <span>📅 {new Date(c.startsAt).toLocaleString()}</span>
                    <span>⏱️ {c.durationMin} min</span>
                    <span>👥 {c._count.attendance} attended</span>
                    <span>🏠 {c.roomName}</span>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" asChild>
                      <a href={`/live/${c.id}`} target="_blank">Join/View</a>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <a href={`/admin/liveclasses/${c.id}/edit`}>Edit</a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Community Tab */}
        <TabsContent value="community" className="space-y-6">
          <div>
            <h2 className="font-serif text-xl font-semibold">Community Moderation</h2>
            <p className="text-muted-foreground">Moderate forum topics and comments</p>
          </div>
          <div className="space-y-4">
            {forumTopics.map((t) => (
              <Card key={t.id}>
                <CardContent className="pt-5">
                  <div className="flex items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold">{t.title}</h3>
                        <Badge tone="neutral" variant="outline">{t.tag}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{t.body}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span>{t.user?.name || "Unknown"}</span>
                        <span>·</span>
                        <time>{new Date(t.createdAt).toLocaleString()}</time>
                        <span>·</span>
                        <span>💬 {t._count.comments} comments</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <a href={`/community#topic-${t.id}`} target="_blank">View</a>
                      </Button>
                      <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50 border-red-200">Delete</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {forumTopics.length === 0 && <p className="text-center text-muted-foreground py-8">No forum topics yet.</p>}
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-serif text-lg">Platform Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Maintenance Mode</p>
                  <p className="text-sm text-muted-foreground">Disable student access for maintenance</p>
                </div>
                <Switch id="maintenance" />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">New Registrations</p>
                  <p className="text-sm text-muted-foreground">Allow new student sign-ups</p>
                </div>
                <Switch id="registrations" defaultChecked />
              </div>
              <Separator />
              <div className="space-y-4">
                <Label>Default Daily XP Cap</Label>
                <Input type="number" defaultValue="200" className="w-32" />
              </div>
              <Separator />
              <div className="space-y-4">
                <Label>Announcement Banner</Label>
                <Textarea placeholder="Markdown supported. Shown on all student dashboards." rows={3} />
              </div>
              <Button>Save Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}