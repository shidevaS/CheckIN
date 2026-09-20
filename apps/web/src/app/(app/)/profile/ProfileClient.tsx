"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Textarea,
  Label,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Separator,
  Avatar,
  AvatarFallback,
  AvatarImage,
  Progress,
} from "@/components/ui";
import { Logo } from "@/components/logo";

interface Project {
  id: string;
  title: string;
  summary: string;
  type: string;
  link: string | null;
  pinned: boolean;
  createdAt: string;
}

interface Certificate {
  id: string;
  slug: string;
  title: string;
  issuer: string;
  issuedAt: string;
}

interface Badge {
  id: string;
  slug: string;
  name: string;
  icon: string;
  description: string;
  xpBonus: number;
}

interface Enrollment {
  id: string;
  progressPct: number;
  certified: boolean;
  roadmap: { id: string; slug: string; title: string; pillar: string; color: string; xpTotal: number };
}

interface XpLog {
  id: string;
  amount: number;
  reason: string;
  itemId: string | null;
  createdAt: string;
}

interface ProfileClientProps {
  initialUser: { id: string; name: string; email: string; headline: string | null; role: string } | null;
  initialProfile: { grade: string | null; school: string | null; city: string | null; bio: string | null; avatarHue: number; xp: number; level: number; streak: number } | null;
  initialProjects: Project[];
  initialCertificates: Certificate[];
  initialBadges: Badge[];
  initialEarnedBadges: string[];
  initialSkillsTree: Record<string, number>;
  initialEnrollments: Enrollment[];
  initialXpLogs: XpLog[];
  sessionUser: { sub: string; name: string; role: string };
}

const PILLARS = [
  { key: "subjects", label: "Core Subjects", color: "teal" },
  { key: "innovation", label: "Innovation", color: "gold" },
];

const TYPE_LABELS: Record<string, string> = {
  "ai-agent": "AI Agent",
  coding: "Coding Project",
  science: "Science Project",
  art: "Art & Design",
  presentation: "Presentation",
};

export default function ProfileClient({
  initialUser,
  initialProfile,
  initialProjects,
  initialCertificates,
  initialBadges,
  initialEarnedBadges,
  initialSkillsTree,
  initialEnrollments,
  initialXpLogs,
  sessionUser,
}: ProfileClientProps) {
  const [user] = useState(initialUser);
  const [profile] = useState(initialProfile);
  const [projects, setProjects] = useState(initialProjects);
  const [certificates] = useState(initialCertificates);
  const [badges] = useState(initialBadges);
  const [earnedBadges] = useState(initialEarnedBadges);
  const [skillsTree] = useState(initialSkillsTree);
  const [enrollments] = useState(initialEnrollments);
  const [xpLogs] = useState(initialXpLogs);
  const [activeTab, setActiveTab] = useState("overview");
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [showAddProject, setShowAddProject] = useState(false);
  const [newProject, setNewProject] = useState({ title: "", summary: "", type: "ai-agent", link: "" });

  const xp = profile?.xp || 0;
  const level = profile?.level || 1;
  const streak = profile?.streak || 0;
  const xpForNextLevel = level * 100;
  const progressPct = Math.min((xp % xpForNextLevel) / xpForNextLevel * 100, 100);

  const totalXpEarned = xpLogs.reduce((sum, log) => sum + log.amount, 0);

  const handleAddProject = async () => {
    if (!newProject.title.trim()) return;
    const res = await fetch("/api/profile/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newProject),
    });
    if (res.ok) {
      const project = await res.json();
      setProjects((prev) => [project, ...prev]);
      setShowAddProject(false);
      setNewProject({ title: "", summary: "", type: "ai-agent", link: "" });
    }
  };

  const handleUpdateProject = async (project: Project) => {
    const res = await fetch(`/api/profile/projects/${project.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(project),
    });
    if (res.ok) {
      setProjects((prev) => prev.map((p) => (p.id === project.id ? project : p)));
      setEditingProject(null);
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (!confirm("Delete this project?")) return;
    const res = await fetch(`/api/profile/projects/${id}`, { method: "DELETE" });
    if (res.ok) {
      setProjects((prev) => prev.filter((p) => p.id !== id));
    }
  };

  const handlePinProject = async (id: string, pinned: boolean) => {
    const res = await fetch(`/api/profile/projects/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pinned }),
    });
    if (res.ok) {
      setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, pinned } : p)));
    }
  };

  const getAvatarStyle = (hue: number) => ({
    backgroundColor: `hsl(${hue}, 70%, 50%)`,
    color: "white",
  });

  return (
    <div className="space-y-8">
      {/* Profile Header */}
      <Card className="bg-gradient-to-br from-[rgb(var(--card))] to-[rgb(var(--muted))/0.3]">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || "user"}`} alt={user?.name || ""} />
                <AvatarFallback className="text-3xl font-bold" style={getAvatarStyle(profile?.avatarHue || 28)}>
                  {user?.name?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="font-serif text-3xl font-semibold">{user?.name}</h1>
                  <Badge tone={profile?.level && profile.level >= 10 ? "gold" : "teal"}>Level {level}</Badge>
                  {sessionUser.role === "ADMIN" && <Badge tone="gold">Admin</Badge>}
                </div>
                <p className="text-muted-foreground mt-1">{user?.email}</p>
                {user?.headline && <p className="text-primary mt-1 italic">{user.headline}</p>}
                <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <span>📍 {profile?.city || "Global"}</span>
                  <span>🏫 {profile?.school || "Self-taught"}</span>
                  <span>🎓 Grade {profile?.grade || "—"}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-center md:text-left">
              <div className="p-4 bg-[rgb(var(--primary)/0.1)] rounded-xl min-w-[100px]">
                <p className="text-3xl font-bold text-[rgb(var(--primary))]">{xp.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Total XP</p>
              </div>
              <div className="p-4 bg-[rgb(var(--accent))/0.1)] rounded-xl min-w-[100px]">
                <p className="text-3xl font-bold text-[rgb(var(--accent))]">{streak}</p>
                <p className="text-xs text-muted-foreground">Day Streak 🔥</p>
              </div>
              <div className="p-4 bg-[rgb(var(--muted))] rounded-xl min-w-[100px]">
                <p className="text-3xl font-bold">{certificates.length}</p>
                <p className="text-xs text-muted-foreground">Certificates</p>
              </div>
              <div className="p-4 bg-[rgb(var(--muted))] rounded-xl min-w-[100px]">
                <p className="text-3xl font-bold">{earnedBadges.length}</p>
                <p className="text-xs text-muted-foreground">Badges</p>
              </div>
            </div>
          </div>

          {/* XP Progress */}
          <div className="mt-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Progress to Level {level + 1}</span>
              <span className="font-medium">{xp % xpForNextLevel} / {xpForNextLevel} XP</span>
            </div>
            <Progress value={progressPct} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
          <TabsTrigger value="skills">Skill Tree</TabsTrigger>
          <TabsTrigger value="certificates">Certificates</TabsTrigger>
          <TabsTrigger value="badges">Badges</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Bio */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="font-serif text-lg">About Me</CardTitle>
                <CardDescription>Share your learning journey</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => setActiveTab("portfolio")}>Edit Profile</Button>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground whitespace-pre-wrap">{profile?.bio || "No bio yet. Add one in your portfolio to share your story!"}</p>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="font-serif text-lg">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {xpLogs.slice(0, 10).map((log) => (
                  <div key={log.id} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-[rgb(var(--primary))]" style={{ backgroundColor: "rgb(var(--primary)/0.1)" }}>
                      +{log.amount}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{log.reason}</p>
                      <p className="text-sm text-muted-foreground">{new Date(log.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
                {xpLogs.length === 0 && <p className="text-center text-muted-foreground py-4">No activity yet. Start a roadmap or challenge!</p>}
              </div>
            </CardContent>
          </Card>

          {/* Roadmap Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="font-serif text-lg">Your Roadmaps</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                {enrollments.map((e) => (
                  <Link key={e.id} href={`/roadmaps/${e.roadmap.slug}`} className="p-4 rounded-lg border border-border hover:border-[rgb(var(--primary))/0.5] transition-colors">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: e.roadmap.color }}>
                        {e.roadmap.pillar === "subjects" ? "📚" : "🚀"}
                      </div>
                      <span className="font-medium">{e.roadmap.title}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-[rgb(var(--primary))] transition-all" style={{ width: `${e.progressPct}%` }} />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>{e.progressPct}% complete</span>
                      <span>{e.certified ? "✅ Certified" : "In progress"}</span>
                    </div>
                  </Link>
                ))}
                {enrollments.length === 0 && <p className="text-center text-muted-foreground py-4 col-span-2">No roadmaps enrolled yet. <Link href="/roadmaps" className="text-[rgb(var(--primary))] underline">Browse roadmaps</Link></p>}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Portfolio Tab */}
        <TabsContent value="portfolio" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif text-xl font-semibold">Portfolio Showcase</h2>
              <p className="text-muted-foreground">Showcase your AI agents, coding projects, and creative work</p>
            </div>
            <Button onClick={() => setShowAddProject(true)}>+ Add Project</Button>
          </div>

          {showAddProject && (
            <Card className="border-[rgb(var(--primary))/0.5]">
              <CardHeader><CardTitle className="font-serif text-lg">Add New Project</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label>Title</Label>
                    <Input value={newProject.title} onChange={(e) => setNewProject({ ...newProject, title: e.target.value })} placeholder="My AI Agent" />
                  </div>
                  <div>
                    <Label>Type</Label>
                    <select value={newProject.type} onChange={(e) => setNewProject({ ...newProject, type: e.target.value })} className="w-full rounded-lg border border-border bg-background px-3 py-2">
                      {Object.entries(TYPE_LABELS).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <Label>Summary</Label>
                  <Textarea value={newProject.summary} onChange={(e) => setNewProject({ ...newProject, summary: e.target.value })} placeholder="What does it do? What did you learn?" rows={3} />
                </div>
                <div>
                  <Label>Link (GitHub, demo, etc.)</Label>
                  <Input value={newProject.link} onChange={(e) => setNewProject({ ...newProject, link: e.target.value })} placeholder="https://..." />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleAddProject} disabled={!newProject.title.trim()}>Add Project</Button>
                  <Button variant="outline" onClick={() => { setShowAddProject(false); setNewProject({ title: "", summary: "", type: "ai-agent", link: "" }); }}>Cancel</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {editingProject && (
            <Card className="border-[rgb(var(--accent))/0.5]">
              <CardHeader><CardTitle className="font-serif text-lg">Edit Project</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label>Title</Label>
                    <Input value={editingProject.title} onChange={(e) => setEditingProject({ ...editingProject, title: e.target.value })} />
                  </div>
                  <div>
                    <Label>Type</Label>
                    <select value={editingProject.type} onChange={(e) => setEditingProject({ ...editingProject, type: e.target.value })} className="w-full rounded-lg border border-border bg-background px-3 py-2">
                      {Object.entries(TYPE_LABELS).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <Label>Summary</Label>
                  <Textarea value={editingProject.summary} onChange={(e) => setEditingProject({ ...editingProject, summary: e.target.value })} rows={3} />
                </div>
                <div>
                  <Label>Link</Label>
                  <Input value={editingProject.link || ""} onChange={(e) => setEditingProject({ ...editingProject, link: e.target.value })} />
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => handleUpdateProject(editingProject)}>Save</Button>
                  <Button variant="outline" onClick={() => setEditingProject(null)}>Cancel</Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <Card key={project.id} className={project.pinned ? "ring-2 ring-[rgb(var(--primary))/0.5]" : ""}>
                <CardContent className="pt-5 space-y-3">
                  <div className="flex items-start justify-between">
                    <Badge tone={project.pinned ? "gold" : "neutral"} variant={project.pinned ? "default" : "outline"}>
                      {project.pinned ? "📌 Pinned" : TYPE_LABELS[project.type] || project.type}
                    </Badge>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => handlePinProject(project.id, !project.pinned)}>
                        {project.pinned ? "📌" : "📍"}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setEditingProject(project)}>✏️</Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteProject(project.id)}>🗑️</Button>
                    </div>
                  </div>
                  <h3 className="font-semibold">{project.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">{project.summary}</p>
                  {project.link && (
                    <a href={project.link} target="_blank" rel="noopener noreferrer" className="text-sm text-[rgb(var(--primary))] underline hover:no-underline">
                      View Project →
                    </a>
                  )}
                  <p className="text-xs text-muted-foreground">{new Date(project.createdAt).toLocaleDateString()}</p>
                </CardContent>
              </Card>
            ))}
            {projects.length === 0 && (
              <div className="col-span-full text-center py-12 border-2 border-dashed border-border rounded-xl">
                <p className="text-muted-foreground mb-4">No projects yet. Click &ldquo;Add Project&rdquo; to showcase your work!</p>
                <Button onClick={() => setShowAddProject(true)}>+ Add Your First Project</Button>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Skill Tree Tab */}
        <TabsContent value="skills" className="space-y-6">
          <div>
            <h2 className="font-serif text-xl font-semibold">Skill Tree</h2>
            <p className="text-muted-foreground">Track your mastery across subjects and innovation strands</p>
          </div>

          {PILLARS.map((pillar) => {
            const pillarSkills = Object.entries(skillsTree).filter(([key]) => key.startsWith(pillar.key));
            return (
              <Card key={pillar.key}>
                <CardHeader>
                  <CardTitle className="font-serif text-lg flex items-center gap-2">
                    <span className="w-6 h-6 rounded flex items-center justify-center text-white text-sm" style={{ backgroundColor: pillar.color === "teal" ? "rgb(var(--accent))" : "rgb(var(--primary))" }}>
                      {pillar.key === "subjects" ? "📚" : "🚀"}
                    </span>
                    {pillar.label}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-0">
                  {pillarSkills.length === 0 ? (
                    <p className="text-center text-muted-foreground py-4">Complete lessons and challenges to unlock skills in this pillar.</p>
                  ) : (
                    pillarSkills.map(([skill, progress]) => (
                      <div key={skill} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium capitalize">{skill.replace(`${pillar.key}.`, "").replace(/-/g, " ")}</span>
                          <span className="text-muted-foreground">{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        {/* Certificates Tab */}
        <TabsContent value="certificates" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif text-xl font-semibold">Certificates</h2>
              <p className="text-muted-foreground">Verified completion certificates for roadmaps</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {certificates.map((cert) => (
              <Card key={cert.id} className="relative overflow-hidden">
                <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-[rgb(var(--primary))/0.1] to-transparent" />
                <CardContent className="relative p-6 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-3xl">📜</span>
                    <span className="text-xs font-medium text-[rgb(var(--primary))] uppercase tracking-wide">{cert.issuer}</span>
                  </div>
                  <h3 className="font-serif text-xl font-semibold">{cert.title}</h3>
                  <p className="text-sm text-muted-foreground">Issued {new Date(cert.issuedAt).toLocaleDateString()}</p>
                  <div className="pt-2 border-t border-border/50">
                    <code className="text-xs text-muted-foreground font-mono">{cert.slug}</code>
                  </div>
                </CardContent>
              </Card>
            ))}
            {certificates.length === 0 && (
              <div className="col-span-full text-center py-12 border-2 border-dashed border-border rounded-xl">
                <p className="text-muted-foreground mb-4">No certificates yet. Complete a roadmap to earn one!</p>
                <Link href="/roadmaps"><Button>Browse Roadmaps</Button></Link>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Badges Tab */}
        <TabsContent value="badges" className="space-y-6">
          <div>
            <h2 className="font-serif text-xl font-semibold">Badges & Achievements</h2>
            <p className="text-muted-foreground">Earn badges by completing challenges, maintaining streaks, and mastering skills</p>
          </div>

          <div className="flex flex-wrap gap-3">
            {badges.map((badge) => {
              const isEarned = earnedBadges.includes(badge.slug);
              return (
                <div
                  key={badge.slug}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${isEarned ? "border-[rgb(var(--primary))/0.5] bg-[rgb(var(--primary))/0.05]" : "border-border/50 opacity-60"}`}
                >
                  <span className="text-2xl">{badge.icon}</span>
                  <div>
                    <p className="font-medium">{badge.name} {isEarned && <span className="ml-2 text-xs text-green-600">✓ Earned</span>}</p>
                    <p className="text-xs text-muted-foreground">{badge.description}</p>
                    {badge.xpBonus > 0 && <p className="text-xs text-[rgb(var(--accent))]">+{badge.xpBonus} XP bonus</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}