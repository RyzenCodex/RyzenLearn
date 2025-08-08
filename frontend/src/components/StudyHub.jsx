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

  const branch = useMemo(() => BRANCHES.find((b) =&gt; b.slug === active), [active]);

  const toggleBm = (slug) =&gt; {
    const isNow = toggleBookmark(slug);
    toast({ title: isNow ? "Bookmarked" : "Removed", description: `${branch.name} ${isNow ? "saved" : "removed"} in your bookmarks.` });
  };

  const markTask = (i, done) =&gt; {
    const updated = tasks.map((t, idx) =&gt; (idx === i ? { ...t, done } : t));
    setTasks(updated);
    updateTasks(active, updated);
  };

  const addTask = () =&gt; {
    if (!newTask.trim()) return;
    const updated = [...tasks, { text: newTask.trim(), done: false }];
    setTasks(updated);
    updateTasks(active, updated);
    setNewTask("");
  };

  const resourcesCopy = async (url) =&gt; {
    try {
      await navigator.clipboard.writeText(url);
      toast({ title: "Link copied", description: "Paste in your notes or share." });
    } catch { /* noop */ }
  };

  const onQuizComplete = ({ score }) =&gt; {
    const prev = getQuizProgress(branchForQuiz);
    const best = Math.max(prev.best || 0, score);
    setQuizProgress(branchForQuiz, { best });
    setQuizKey((k) =&gt; k + 1);
  };

  const bestScore = getQuizProgress(branchForQuiz).best || 0;

  return (
    &lt;div className="min-h-screen">
      {/* Hero */}
      &lt;section className="relative overflow-hidden">
        &lt;div className="absolute inset-0 -z-10 bg-gradient-to-b from-emerald-100 to-white dark:from-emerald-900/20 dark:to-background" />
        &lt;div className="container mx-auto px-6 pt-12 pb-8">
          &lt;div className="grid md:grid-cols-2 gap-8 items-center">
            &lt;div>
              &lt;h1 className="text-3xl md:text-4xl font-bold tracking-tight">Psychology Study Hub&lt;/h1>
              &lt;p className="mt-3 text-muted-foreground max-w-prose">Master core branches, key theories, and real-world applications. Study plans, quizzes, mnemonics, and curated resources — all in one place.&lt;/p>
              &lt;div className="mt-5 flex gap-3">
                &lt;Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() =&gt; document.getElementById("branches").scrollIntoView({ behavior: "smooth" })}>
                  Explore Branches
                &lt;/Button>
                &lt;Button variant="secondary" onClick={() =&gt; document.getElementById("quiz").scrollIntoView({ behavior: "smooth" })}>
                  Take a Quick Quiz
                &lt;/Button>
              &lt;/div>
              &lt;div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                &lt;CheckCircle2 className="h-4 w-4 text-emerald-600" /> Progress and bookmarks saved locally
              &lt;/div>
            &lt;/div>
            &lt;div className="relative">
              &lt;img src={branch.heroImage} alt="psychology hero" className="w-full rounded-xl border shadow-sm object-cover aspect-video" />
            &lt;/div>
          &lt;/div>
        &lt;/div>
      &lt;/section>

      {/* Branches */}
      &lt;section id="branches" className="container mx-auto px-6 py-8">
        &lt;div className="flex items-center gap-2 mb-4">
          &lt;Brain className="h-5 w-5 text-emerald-600" />
          &lt;h2 className="text-xl font-semibold">Branches&lt;/h2>
        &lt;/div>
        &lt;Tabs value={active} onValueChange={setActive}>
          &lt;TabsList className="flex flex-wrap gap-2">
            {BRANCHES.map((b) =&gt; (
              &lt;TabsTrigger key={b.slug} value={b.slug} className="data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-900 dark:data-[state=active]:bg-emerald-900/30 dark:data-[state=active]:text-emerald-100">
                {b.name}
              &lt;/TabsTrigger>
            ))}
          &lt;/TabsList>
          {BRANCHES.map((b) =&gt; (
            &lt;TabsContent key={b.slug} value={b.slug} className="mt-5">
              &lt;div className="grid md:grid-cols-3 gap-6">
                &lt;Card className="md:col-span-2">
                  &lt;CardHeader>
                    &lt;div className="flex items-center justify-between">
                      &lt;div className="space-y-1">
                        &lt;CardTitle className="text-lg">{b.name} &lt;Badge className="ml-2" variant="secondary">{b.level}&lt;/Badge>&lt;/CardTitle>
                        &lt;p className="text-sm text-muted-foreground">{b.summary}&lt;/p>
                      &lt;/div>
                      &lt;Button variant={isBookmarked(b.slug) ? "default" : "secondary"} className={isBookmarked(b.slug) ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""} onClick={() =&gt; toggleBm(b.slug)}>
                        &lt;Bookmark className="h-4 w-4 mr-2" /> {isBookmarked(b.slug) ? "Bookmarked" : "Bookmark"}
                      &lt;/Button>
                    &lt;/div>
                  &lt;/CardHeader>
                  &lt;CardContent className="grid md:grid-cols-2 gap-6">
                    &lt;div>
                      &lt;h4 className="font-medium mb-2">Key Ideas&lt;/h4>
                      &lt;ul className="list-disc pl-5 space-y-1 text-sm">
                        {b.keyIdeas.map((k, i) =&gt; &lt;li key={i}>{k}&lt;/li>)}
                      &lt;/ul>
                      &lt;h4 className="font-medium mt-4 mb-2">Influential Psychologists&lt;/h4>
                      &lt;div className="flex flex-wrap gap-2">
                        {b.psychologists.map((p, i) =&gt; &lt;Badge key={i} variant="outline">{p}&lt;/Badge>)}
                      &lt;/div>
                    &lt;/div>
                    &lt;div>
                      &lt;img src={b.heroImage} alt={b.name} className="rounded-lg border object-cover aspect-video" />
                      &lt;p className="mt-2 text-xs text-muted-foreground">Illustration for {b.name}&lt;/p>
                    &lt;/div>
                  &lt;/CardContent>
                &lt;/Card>

                &lt;Card>
                  &lt;CardHeader>
                    &lt;CardTitle className="text-base">Mnemonics &amp; Activities&lt;/CardTitle>
                  &lt;/CardHeader>
                  &lt;CardContent className="space-y-3 text-sm">
                    &lt;div className="space-y-2">
                      {b.mnemonics.map((m, i) =&gt; (
                        &lt;div key={i} className="rounded-md border p-2">
                          &lt;div className="font-medium">{m.title}&lt;/div>
                          &lt;div className="text-muted-foreground">{m.hint}&lt;/div>
                        &lt;/div>
                      ))}
                    &lt;/div>
                    &lt;Separator />
                    &lt;ul className="list-disc pl-5 space-y-1">
                      {b.activities.map((a, i) =&gt; &lt;li key={i}>{a}&lt;/li>)}
                    &lt;/ul>
                  &lt;/CardContent>
                &lt;/Card>
              &lt;/div>
            &lt;/TabsContent>
          ))}
        &lt;/Tabs>
      &lt;/section>

      {/* Study Planner */}
      &lt;section className="container mx-auto px-6 py-6">
        &lt;div className="flex items-center gap-2 mb-3">
          &lt;BookOpen className="h-5 w-5 text-emerald-600" />
          &lt;h2 className="text-xl font-semibold">Study Planner&lt;/h2>
        &lt;/div>
        &lt;div className="grid md:grid-cols-3 gap-6">
          &lt;Card className="md:col-span-2">
            &lt;CardHeader>
              &lt;CardTitle className="text-base">Tasks for {branch.name}&lt;/CardTitle>
            &lt;/CardHeader>
            &lt;CardContent>
              &lt;div className="space-y-2">
                {tasks.map((t, i) =&gt; (
                  &lt;label key={i} className="flex items-start gap-3 rounded-md border p-2">
                    &lt;Checkbox checked={t.done} onCheckedChange={(v) =&gt; markTask(i, !!v)} />
                    &lt;span className={`${t.done ? "line-through text-muted-foreground" : ""}`}>{t.text}&lt;/span>
                  &lt;/label>
                ))}
                &lt;div className="flex gap-2">
                  &lt;Input placeholder="Add a custom task" value={newTask} onChange={(e) =&gt; setNewTask(e.target.value)} />
                  &lt;Button onClick={addTask} className="bg-emerald-600 hover:bg-emerald-700 text-white">&lt;Plus className="h-4 w-4 mr-1" />Add&lt;/Button>
                &lt;/div>
              &lt;/div>
            &lt;/CardContent>
          &lt;/Card>
          &lt;Card>
            &lt;CardHeader>
              &lt;CardTitle className="text-base">Progress&lt;/CardTitle>
            &lt;/CardHeader>
            &lt;CardContent>
              {(() =&gt; {
                const total = tasks.length || 1;
                const done = tasks.filter((t) =&gt; t.done).length;
                const v = Math.round((done / total) * 100);
                return (
                  &lt;div className="space-y-3">
                    &lt;Progress value={v} />
                    &lt;div className="text-sm text-muted-foreground">{done} of {total} tasks complete ({v}%)&lt;/div>
                  &lt;/div>
                );
              })()}
            &lt;/CardContent>
          &lt;/Card>
        &lt;/div>
      &lt;/section>

      {/* Quick Quiz */}
      &lt;section id="quiz" className="container mx-auto px-6 py-6">
        &lt;div className="flex items-center gap-2 mb-3">
          &lt;Brain className="h-5 w-5 text-emerald-600" />
          &lt;h2 className="text-xl font-semibold">Quick Quiz&lt;/h2>
        &lt;/div>
        &lt;div className="grid md:grid-cols-3 gap-6">
          &lt;Card>
            &lt;CardHeader>
              &lt;CardTitle className="text-base">Choose Branch&lt;/CardTitle>
            &lt;/CardHeader>
            &lt;CardContent className="space-y-3">
              &lt;Select value={branchForQuiz} onValueChange={(v) =&gt; setBranchForQuiz(v)}>
                &lt;SelectTrigger>&lt;SelectValue placeholder="Select a branch" />&lt;/SelectTrigger>
                &lt;SelectContent>
                  {BRANCHES.map((b) =&gt; (
                    &lt;SelectItem key={b.slug} value={b.slug}>{b.name}&lt;/SelectItem>
                  ))}
                &lt;/SelectContent>
              &lt;/Select>
              &lt;div className="text-sm text-muted-foreground">Best score: &lt;span className="font-medium text-emerald-700 dark:text-emerald-400">{bestScore}%&lt;/span>&lt;/div>
            &lt;/CardContent>
          &lt;/Card>
          &lt;div className="md:col-span-2">
            &lt;QuizPlay key={quizKey} branchSlug={branchForQuiz} questions={BRANCHES.find((b) =&gt; b.slug === branchForQuiz)?.quiz || []} onComplete={onQuizComplete} />
          &lt;/div>
        &lt;/div>
      &lt;/section>

      {/* Resources */}
      &lt;section className="container mx-auto px-6 py-6">
        &lt;div className="flex items-center gap-2 mb-3">
          &lt;LinkIcon className="h-5 w-5 text-emerald-600" />
          &lt;h2 className="text-xl font-semibold">Resources&lt;/h2>
        &lt;/div>
        &lt;div className="grid md:grid-cols-3 gap-6">
          {BRANCHES.map((b) =&gt; (
            &lt;Card key={b.slug}>
              &lt;CardHeader>
                &lt;CardTitle className="text-base">{b.name}&lt;/CardTitle>
              &lt;/CardHeader>
              &lt;CardContent className="space-y-2">
                {b.resources.map((r, i) =&gt; (
                  &lt;div key={i} className="flex items-center justify-between gap-2 text-sm">
                    &lt;a className="text-emerald-700 dark:text-emerald-400 hover:underline" href={r.url} target="_blank" rel="noreferrer">{r.title}&lt;/a>
                    &lt;Button size="sm" variant="ghost" onClick={() =&gt; resourcesCopy(r.url)}>Copy&lt;/Button>
                  &lt;/div>
                ))}
              &lt;/CardContent>
            &lt;/Card>
          ))}
        &lt;/div>
      &lt;/section>

      {/* Notes */}
      &lt;section className="container mx-auto px-6 py-8">
        &lt;Card>
          &lt;CardHeader>
            &lt;CardTitle className="text-base">Quick Notes&lt;/CardTitle>
          &lt;/CardHeader>
          &lt;CardContent>
            &lt;Textarea placeholder="Jot down key takeaways... (saved by your browser if you keep the tab)" className="min-h-[120px]" />
          &lt;/CardContent>
        &lt;/Card>
      &lt;/section>
    &lt;/div>
  );
}