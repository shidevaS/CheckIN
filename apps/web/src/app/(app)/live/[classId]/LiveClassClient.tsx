"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Textarea, Label } from "@/components/ui";

interface ClassData {
  id: string;
  title: string;
  description: string;
  hostName: string;
  startsAt: string;
  durationMin: number;
  roomName: string;
  status: string;
  roadmap: { title: string; color: string } | null;
  _count: { attendance: number; chat: number };
}

interface LiveClassClientProps {
  initialClass: ClassData;
  sessionUser: { sub: string; name: string; role: string };
}

export default function LiveClassClient({ initialClass, sessionUser }: LiveClassClientProps) {
  const [cls] = useState(initialClass);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [messageKind, setMessageKind] = useState<"CHAT" | "QUESTION">("CHAT");
  const [isJoined, setIsJoined] = useState(false);
  const [showChat, setShowChat] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const jitsiUrl = `https://meet.jit.si/${cls.roomName}#config.prejoinPageEnabled=false&config.startWithAudioMuted=true&config.startWithVideoMuted=true&interfaceConfig.APP_NAME="Tuiton Live Class"&interfaceConfig.TOOLBAR_BUTTONS=["microphone","camera","desktop","chat","recording","livestreaming","etherpad","sharedvideo","settings","raisehand","videoquality","filmstrip","invite","feedback","stats","shortcuts","tileview","fullscreen"]`;

  useEffect(() => {
    fetchChat();
    checkAttendance();
    const interval = setInterval(fetchChat, 5000);
    return () => clearInterval(interval);
  }, [cls.id]);

  const fetchChat = async () => {
    try {
      const res = await fetch(`/api/live/${cls.id}/chat`);
      if (res.ok) {
        const data = await res.json();
        setChatMessages(data.messages || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const checkAttendance = async () => {
    try {
      const res = await fetch(`/api/live/${cls.id}/attend`);
      if (res.ok) {
        const data = await res.json();
        setIsJoined(data.joined);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleJoin = async () => {
    await fetch(`/api/live/${cls.id}/attend`, { method: "POST" });
    setIsJoined(true);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    await fetch(`/api/live/${cls.id}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: newMessage, kind: messageKind }),
    });
    setNewMessage("");
    fetchChat();
  };

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const startsAt = new Date(cls.startsAt);
  const isLive = cls.status === "LIVE";
  const isPast = cls.status === "ENDED" || startsAt < new Date();

  return (
    <div className="space-y-6">
      <header>
        <nav className="mb-4 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <Link href="/live" className="hover:underline">Live Classes</Link>
          <span>/</span>
          <span className="text-foreground font-medium">{cls.title}</span>
        </nav>

        <div className="flex items-center gap-2 mb-2">
          {cls.roadmap && (
            <Badge tone="neutral" className="gap-1">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cls.roadmap.color }} />
              {cls.roadmap.title}
            </Badge>
          )}
          {isLive && <Badge tone="live" className="animate-pulse">LIVE NOW</Badge>}
          {!isLive && !isPast && <Badge tone="neutral">Scheduled</Badge>}
          {isPast && <Badge tone="neutral">Ended</Badge>}
        </div>

        <h1 className="font-serif text-3xl font-semibold tracking-tight">{cls.title}</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">{cls.description}</p>

        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <span>Host: {cls.hostName}</span>
          <span>•</span>
          <span>
            {startsAt.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
            at {startsAt.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
          </span>
          <span>•</span>
          <span>{cls.durationMin} min</span>
          <span>•</span>
          <span>{cls._count.attendance} attendees</span>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-4">
        <div className="lg:col-span-3 space-y-6">
          {/* Jitsi Embed */}
          <Card className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="font-serif text-lg">Live Session</CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => window.open(jitsiUrl, "_blank", "noopener,noreferrer")}>
                    Open in New Tab
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setShowChat(!showChat)}>
                    {showChat ? "Hide Chat" : "Show Chat"}
                  </Button>
                </div>
              </div>
              <CardDescription>
                {isLive
                  ? "The class is live now. Join the session and participate in chat."
                  : isPast
                  ? "This class has ended. You can watch the recording below."
                  : "The class will start at the scheduled time above."}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="aspect-video bg-zinc-950 relative">
                <iframe
                  ref={iframeRef}
                  src={jitsiUrl}
                  className="w-full h-full"
                  frameBorder="0"
                  allow="camera; microphone; fullscreen; clipboard-read; clipboard-write"
                  title="Tuiton Live Class"
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-downloads allow-modals"
                />
                {!isLive && (
                  <div className="absolute inset-0 flex items-center justify-center bg-zinc-950/90 z-10">
                    <div className="text-center p-8">
                      <div className="text-6xl mb-4">{isPast ? "📼" : "⏰"}</div>
                      <h3 className="text-xl font-semibold text-zinc-300 mb-2">
                        {isPast ? "Recording" : "Waiting for Class to Start"}
                      </h3>
                      <p className="text-zinc-400">
                        {isPast
                          ? "The live session has ended. The recording will be available here once processed."
                          : `Class starts at ${startsAt.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}`}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {!isJoined && !isPast && !isLive && (
                <div className="mt-4 text-center">
                  <Button onClick={handleJoin} className="w-full sm:w-auto" size="lg">
                    Mark Attendance / Join When Live
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Resources / Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="font-serif text-lg">Class Resources</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              <p className="text-sm text-muted-foreground">
                Shared resources, slides, and notes will appear here during and after the live session.
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                <Button variant="outline" className="w-full justify-start gap-2" asChild>
                  <a href="#" className="flex items-center gap-2">
                    <span>📄</span> Download Slides (PDF)
                  </a>
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2" asChild>
                  <a href="#" className="flex items-center gap-2">
                    <span>🔗</span> Shared Links
                  </a>
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2" asChild>
                  <a href="#" className="flex items-center gap-2">
                    <span>📝</span> Collaborative Notes
                  </a>
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2" asChild>
                  <a href="#" className="flex items-center gap-2">
                    <span>📊</span> Poll Results
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chat Sidebar */}
        <aside className={showChat ? "block" : "hidden"}>
          <Card className="h-full flex flex-col">
            <CardHeader>
              <CardTitle className="font-serif text-lg flex items-center justify-between">
                Live Chat <span className="text-sm font-normal text-muted-foreground">({cls._count.chat})</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col pt-0 min-h-[500px]">
              <div className="flex-1 overflow-y-auto space-y-3 pr-2" role="log" aria-live="polite">
                {chatMessages.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No messages yet. Be the first to say hi!</p>
                ) : (
                  chatMessages.map((msg: any) => (
                    <div key={msg.id} className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="font-medium">{msg.user?.name || "Anonymous"}</span>
                        {msg.kind === "QUESTION" && <Badge tone="neutral" className="text-xs">❓ Question</Badge>}
                        {msg.kind === "POLL" && <Badge tone="gold" className="text-xs">📊 Poll</Badge>}
                        <span>{new Date(msg.createdAt).toLocaleTimeString()}</span>
                      </div>
                      <div className="ml-6 text-sm">{msg.body}</div>
                    </div>
                  ))
                )}
                <div ref={chatEndRef} />
              </div>

              <form onSubmit={handleSendMessage} className="mt-4 space-y-2 border-t pt-4">
                <div className="flex gap-2">
                  <select
                    value={messageKind}
                    onChange={(e) => setMessageKind(e.target.value as "CHAT" | "QUESTION")}
                    className="flex-1 px-2 py-1 text-sm border border-border rounded bg-transparent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                  >
                    <option value="CHAT">💬 Chat</option>
                    <option value="QUESTION">❓ Question</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1"
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleSendMessage(e))}
                  />
                  <Button type="submit" size="sm" disabled={!newMessage.trim()}>
                    Send
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}