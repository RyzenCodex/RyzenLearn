import React, { useEffect, useMemo, useState } from "react";
import { api, getClientId } from "../services/api";
import { Button } from "../components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "../components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Checkbox } from "../components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Separator } from "../components/ui/separator";
import { Skeleton } from "../components/ui/skeleton";
import QuizPlay from "./QuizPlay";
import { toast } from "../hooks/use-toast";
import { Bookmark, BookOpen, Brain, Link as LinkIcon, Plus, CheckCircle2 } from "lucide-react";

export default function StudyHub() {
  const clientId = useMemo(() => getClientId(), []);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [branchForQuiz, setBranchForQuiz] = useState(null);
  const [quizKey, setQuizKey] = useState(0);
  const [bookmarks, setBookmarks] = useState({});
  const [quizMap, setQuizMap] = useState({});
  const [notes, setNotes] = useState("");

  // Initial load
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [brs, state, quiz, notesRes] = await Promise.all([
          api.getBranches(),
          api.getState(clientId),
          api.getQuiz(clientId),
          api.getNotes(clientId),
        ]);
        if (!mounted) return;
        setBranches(brs);
        setBookmarks(state.bookmarks || {});
        setQuizMap(quiz || {});
        setNotes(notesRes?.notes || "");
        const firstSlug = brs[0]?.slug || null;
        setActive(firstSlug);
        setBranchForQuiz(firstSlug);
      } catch (e) {
        console.error(e);
        toast({ title: "Load failed", description: "Retry in a moment." });
      } finally {
        setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [clientId]);

  // Load tasks when active changes
  useEffect(() => {
    (async () => {
      if (!active) return;
      try {
        const ts = await api.getTasks(clientId, active);
        setTasks(ts);
      } catch (e) {
        console.error(e);
      }
    })();
  }, [active, clientId]);

  const branch = useMemo(() => branches.find((b) => b.slug === active), [branches, active]);

  const isBookmarked = (slug) => !!bookmarks[slug];

  const toggleBm = async (slug) => {
    const optimistic = !isBookmarked(slug);
    setBookmarks((m) => ({ ...m, [slug]: optimistic }));
    try {
      await api.setBookmark(clientId, slug, optimistic);
      toast({ title: optimistic ? "Bookmarked" : "Removed", description: `${branches.find(b=>b.slug===slug)?.name || slug} ${optimistic ? "saved" : "removed"}.` });
    } catch (e) {
      // revert
      setBookmarks((m) => ({ ...m, [slug]: !optimistic }));
      toast({ title: "Network error", description: "Could not update bookmark." });
    }
  };

  const markTask = async (i, done) => {
    const updated = tasks.map((t, idx) => (idx === i ? { ...t, done: !!done } : t));
    setTasks(updated);
    try {
      await api.putTasks(clientId, active, updated);
    } catch (e) {
      console.error(e);
      toast({ title: "Save failed", description: "Task update not saved." });
    }
  };

  const addTask = async () => {
    if (!newTask.trim()) return;
    const updated = [...tasks, { text: newTask.trim(), done: false }];
    setTasks(updated);
    setNewTask("");
    try {
      await api.putTasks(clientId, active, updated);
    } catch (e) {
      console.error(e);
      toast({ title: "Save failed", description: "Task add not saved." });
    }
  };

  const resourcesCopy = async (url) => {
    try {
      await navigator.clipboard.writeText(url);
      toast({ title: "Link copied", description: "Paste in your notes or share." });
    } catch { /* noop */ }
  };

  const onQuizComplete = async ({ score }) => {
    try {
      await api.putQuizBest(clientId, branchForQuiz, score);
      setQuizMap((m) => ({ ...m, [branchForQuiz]: { ...(m[branchForQuiz] || {}), best: score } }));
      setQuizKey((k) => k + 1);
    } catch (e) {
      console.error(e);
    }
  };

  const bestScore = quizMap?.[branchForQuiz]?.best || 0;

  // Notes autosave
  useEffect(() => {
    if (loading) return;
    const id = setTimeout(async () => {
      try { await api.putNotes(clientId, notes || ""); } catch {}
    }, 600);
    return () => clearTimeout(id);
  }, [notes, clientId, loading]);

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-10 space-y-6">
        <Skeleton className="h-10 w-1/3" />
        <div className="grid md:grid-cols-3 gap-6">
          <Skeleton className="h-56 w-full" />
          <Skeleton className="h-56 w-full" />
          <Skeleton className="h-56 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-emerald-100 to-white dark:from-emerald-900/20 dark:to-background" />
        <div className="container mx-auto px-6 pt-12 pb-8">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Psychology Study Hub</h1>
              <p className="mt-3 text-muted-foreground max-w-prose">Master core branches, key theories, and real-world applications. Study plans, quizzes, mnemonics, and curated resources — all in one place.</p>
              <div className="mt-5 flex gap-3">
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => document.getElementById("branches").scrollIntoView({ behavior: "smooth" })}>
                  Explore Branches
                </Button>
                <Button variant="secondary" onClick={() => document.getElementById("quiz").scrollIntoView({ behavior: "smooth" })}>
                  Take a Quick Quiz
                </Button>
              </div>
              <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Progress and bookmarks saved to your account (device)
              </div>
            </div>
            <div className="relative">
              {branch?.heroImage && (
                <img src={branch.heroImage} alt="psychology hero" className="w-full rounded-xl border shadow-sm object-cover aspect-video" />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Branches */}
      <section id="branches" className="container mx-auto px-6 py-8">
        <div className="flex items-center gap-2 mb-4">
          <Brain className="h-5 w-5 text-emerald-600" />
          <h2 className="text-xl font-semibold">Branches</h2>
        </div>
        <Tabs value={active || undefined} onValueChange={setActive}>
          <TabsList className="flex flex-wrap gap-2">
            {branches.map((b) => (
              <TabsTrigger key={b.slug} value={b.slug} className="data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-900 dark:data-[state=active]:bg-emerald-900/30 dark:data-[state=active]:text-emerald-100">
                {b.name}
              </TabsTrigger>
            ))}
          </TabsList>
          {branches.map((b) => (
            <TabsContent key={b.slug} value={b.slug} className="mt-5">
              <div className="grid md:grid-cols-3 gap-6">
                <Card className="md:col-span-2">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">{b.name} <Badge className="ml-2" variant="secondary">{b.level}</Badge></CardTitle>
                        <p className="text-sm text-muted-foreground">{b.summary}</p>
                      </div>
                      <Button variant={isBookmarked(b.slug) ? "default" : "secondary"} className={isBookmarked(b.slug) ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""} onClick={() => toggleBm(b.slug)}>
                        <Bookmark className="h-4 w-4 mr-2" /> {isBookmarked(b.slug) ? "Bookmarked" : "Bookmark"}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-2">Key Ideas</h4>
                      <ul className="list-disc pl-5 space-y-1 text-sm">
                        {b.keyIdeas.map((k, i) => <li key={i}>{k}</li>)}
                      </ul>
                      <h4 className="font-medium mt-4 mb-2">Influential Psychologists</h4>
                      <div className="flex flex-wrap gap-2">
                        {b.psychologists.map((p, i) => <Badge key={i} variant="outline">{p}</Badge>)}
                      </div>
                    </div>
                    <div>
                      <img src={b.heroImage} alt={b.name} className="rounded-lg border object-cover aspect-video" />
                      <p className="mt-2 text-xs text-muted-foreground">Illustration for {b.name}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Mnemonics &amp; Activities</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="space-y-2">
                      {b.mnemonics.map((m, i) => (
                        <div key={i} className="rounded-md border p-2">
                          <div className="font-medium">{m.title}</div>
                          <div className="text-muted-foreground">{m.hint}</div>
                        </div>
                      ))}
                    </div>
                    <Separator />
                    <ul className="list-disc pl-5 space-y-1">
                      {b.activities.map((a, i) => <li key={i}>{a}</li>)}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </section>

      {/* Study Planner */}
      <section className="container mx-auto px-6 py-6">
        <div className="flex items-center gap-2 mb-3">
          <BookOpen className="h-5 w-5 text-emerald-600" />
          <h2 className="text-xl font-semibold">Study Planner</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">Tasks for {branch?.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {tasks.map((t, i) => (
                  <label key={i} className="flex items-start gap-3 rounded-md border p-2">
                    <Checkbox checked={t.done} onCheckedChange={(v) => markTask(i, !!v)} />
                    <span className={`${t.done ? "line-through text-muted-foreground" : ""}`}>{t.text}</span>
                  </label>
                ))}
                <div className="flex gap-2">
                  <Input placeholder="Add a custom task" value={newTask} onChange={(e) => setNewTask(e.target.value)} />
                  <Button onClick={addTask} className="bg-emerald-600 hover:bg-emerald-700 text-white"><Plus className="h-4 w-4 mr-1" />Add</Button>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Progress</CardTitle>
            </CardHeader>
            <CardContent>
              {(() => {
                const total = tasks.length || 1;
                const done = tasks.filter((t) => t.done).length;
                const v = Math.round((done / total) * 100);
                return (
                  <div className="space-y-3">
                    <Progress value={v} />
                    <div className="text-sm text-muted-foreground">{done} of {total} tasks complete ({v}%)</div>
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Quick Quiz */}
      <section id="quiz" className="container mx-auto px-6 py-6">
        <div className="flex items-center gap-2 mb-3">
          <Brain className="h-5 w-5 text-emerald-600" />
          <h2 className="text-xl font-semibold">Quick Quiz</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Choose Branch</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Select value={branchForQuiz || undefined} onValueChange={(v) => setBranchForQuiz(v)}>
                <SelectTrigger><SelectValue placeholder="Select a branch" /></SelectTrigger>
                <SelectContent>
                  {branches.map((b) => (
                    <SelectItem key={b.slug} value={b.slug}>{b.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="text-sm text-muted-foreground">Best score: <span className="font-medium text-emerald-700 dark:text-emerald-400">{bestScore}%</span></div>
            </CardContent>
          </Card>
          <div className="md:col-span-2">
            {branchForQuiz && (
              <QuizPlay key={quizKey} branchSlug={branchForQuiz} questions={branches.find((b) => b.slug === branchForQuiz)?.quiz || []} onComplete={onQuizComplete} />
            )}
          </div>
        </div>
      </section>

      {/* Resources */}
      <section className="container mx-auto px-6 py-6">
        <div className="flex items-center gap-2 mb-3">
          <LinkIcon className="h-5 w-5 text-emerald-600" />
          <h2 className="text-xl font-semibold">Resources</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {branches.map((b) => (
            <Card key={b.slug}>
              <CardHeader>
                <CardTitle className="text-base">{b.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {b.resources.map((r, i) => (
                  <div key={i} className="flex items-center justify-between gap-2 text-sm">
                    <a className="text-emerald-700 dark:text-emerald-400 hover:underline" href={r.url} target="_blank" rel="noreferrer">{r.title}</a>
                    <Button size="sm" variant="ghost" onClick={() => resourcesCopy(r.url)}>Copy</Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Notes */}
      <section className="container mx-auto px-6 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quick Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea placeholder="Jot down key takeaways... (auto-saved)" className="min-h-[120px]" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </CardContent>
        </Card>
      </section>
    </div>
  );
}