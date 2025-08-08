import React, { useEffect, useMemo, useState } from "react";
import { BRANCHES, toggleBookmark, isBookmarked, getTasks, updateTasks, getQuizProgress, setQuizProgress } from "../mock";
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
import QuizPlay from "./QuizPlay";
import { toast } from "../hooks/use-toast";
import { Bookmark, BookOpen, Brain, Link as LinkIcon, Plus, CheckCircle2 } from "lucide-react";

export default function StudyHub() {
  const [active, setActive] = useState(BRANCHES[0]?.slug || "cognitive");
  const [tasks, setTasks] = useState(getTasks(active));
  const [newTask, setNewTask] = useState("");
  const [branchForQuiz, setBranchForQuiz] = useState(active);
  const [quizKey, setQuizKey] = useState(0);

  useEffect(() => {
    setTasks(getTasks(active));
  }, [active]);

  const branch = useMemo(() => BRANCHES.find((b) => b.slug === active), [active]);

  const toggleBm = (slug) => {
    const isNow = toggleBookmark(slug);
    toast({ title: isNow ? "Bookmarked" : "Removed", description: `${branch.name} ${isNow ? "saved" : "removed"} in your bookmarks.` });
  };

  const markTask = (i, done) => {
    const updated = tasks.map((t, idx) => (idx === i ? { ...t, done } : t));
    setTasks(updated);
    updateTasks(active, updated);
  };

  const addTask = () => {
    if (!newTask.trim()) return;
    const updated = [...tasks, { text: newTask.trim(), done: false }];
    setTasks(updated);
    updateTasks(active, updated);
    setNewTask("");
  };

  const resourcesCopy = async (url) => {
    try {
      await navigator.clipboard.writeText(url);
      toast({ title: "Link copied", description: "Paste in your notes or share." });
    } catch { /* noop */ }
  };

  const onQuizComplete = ({ score }) => {
    const prev = getQuizProgress(branchForQuiz);
    const best = Math.max(prev.best || 0, score);
    setQuizProgress(branchForQuiz, { best });
    setQuizKey((k) => k + 1);
  };

  const bestScore = getQuizProgress(branchForQuiz).best || 0;

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
                <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Progress and bookmarks saved locally
              </div>
            </div>
            <div className="relative">
              <img src={branch.heroImage} alt="psychology hero" className="w-full rounded-xl border shadow-sm object-cover aspect-video" />
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
        <Tabs value={active} onValueChange={setActive}>
          <TabsList className="flex flex-wrap gap-2">
            {BRANCHES.map((b) => (
              <TabsTrigger key={b.slug} value={b.slug} className="data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-900 dark:data-[state=active]:bg-emerald-900/30 dark:data-[state=active]:text-emerald-100">
                {b.name}
              </TabsTrigger>
            ))}
          </TabsList>
          {BRANCHES.map((b) => (
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
              <CardTitle className="text-base">Tasks for {branch.name}</CardTitle>
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
                const done = tasks.filter((t) =&gt; t.done).length;
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
              <Select value={branchForQuiz} onValueChange={(v) =&gt; setBranchForQuiz(v)}>
                <SelectTrigger><SelectValue placeholder="Select a branch" /></SelectTrigger>
                <SelectContent>
                  {BRANCHES.map((b) =&gt; (
                    <SelectItem key={b.slug} value={b.slug}>{b.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="text-sm text-muted-foreground">Best score: <span className="font-medium text-emerald-700 dark:text-emerald-400">{bestScore}%</span></div>
            </CardContent>
          </Card>
          <div className="md:col-span-2">
            <QuizPlay key={quizKey} branchSlug={branchForQuiz} questions={BRANCHES.find((b) =&gt; b.slug === branchForQuiz)?.quiz || []} onComplete={onQuizComplete} />
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
          {BRANCHES.map((b) =&gt; (
            <Card key={b.slug}>
              <CardHeader>
                <CardTitle className="text-base">{b.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {b.resources.map((r, i) =&gt; (
                  <div key={i} className="flex items-center justify-between gap-2 text-sm">
                    <a className="text-emerald-700 dark:text-emerald-400 hover:underline" href={r.url} target="_blank" rel="noreferrer">{r.title}</a>
                    <Button size="sm" variant="ghost" onClick={() =&gt; resourcesCopy(r.url)}>Copy</Button>
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
            <Textarea placeholder="Jot down key takeaways... (saved by your browser if you keep the tab)" className="min-h-[120px]" />
          </CardContent>
        </Card>
      </section>
    </div>
  );
}