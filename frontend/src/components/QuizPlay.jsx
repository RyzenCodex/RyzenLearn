import React, { useMemo, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Progress } from "../components/ui/progress";
import { RadioGroup } from "../components/ui/radio-group";
import { Badge } from "../components/ui/badge";
import { toast } from "../hooks/use-toast";

// Quiz player (frontend-only). Tracks score and stores best in localStorage via onComplete
export default function QuizPlay({ branchSlug, questions = [], onComplete }) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const total = questions.length;

  const current = useMemo(() => questions[index] || {}, [questions, index]);
  const progress = total ? Math.round(((index) / total) * 100) : 0;

  const select = (i) => setSelected(i);

  const next = () => {
    if (selected == null) {
      toast({ title: "Pick an option", description: "Select an answer to continue." });
      return;
    }
    const correct = selected === current.answer;
    setScore((s) => s + (correct ? 1 : 0));

    if (index + 1 < total) {
      setIndex(index + 1);
      setSelected(null);
    } else {
      const percent = Math.round(((score + (correct ? 1 : 0)) / total) * 100);
      toast({ title: "Quiz finished", description: `Score: ${percent}%` });
      onComplete?.({ score: percent, correct: score + (correct ? 1 : 0), total });
    }
  };

  if (!total) return null;

  return (
    <Card className="border-emerald-300/40 shadow-sm"> 
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Quick Quiz &middot; <span className="text-emerald-600">{branchSlug}</span></CardTitle>
        <Badge variant="secondary">{index + 1} / {total}</Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-base font-medium">{current.q}</div>
        <div className="grid gap-2">
          <RadioGroup value={String(selected)} onValueChange={(v) => select(Number(v))}>
            {current.options?.map((opt, i) => (
              <label key={i} className={`flex items-center gap-3 rounded-md border p-3 cursor-pointer transition-colors ${selected === i ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20" : "hover:bg-muted/50"}`}>
                <input type="radio" name="opt" className="accent-emerald-600 h-4 w-4" checked={selected === i} onChange={() => select(i)} />
                <span>{opt}</span>
              </label>
            ))}
          &lt;/RadioGroup>
        &lt;/div>
        {selected != null && (
          &lt;p className={`text-sm ${selected === current.answer ? "text-emerald-700 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
            {selected === current.answer ? "Correct!" : "Not quite."} {current.explain}
          &lt;/p>
        )}
        &lt;Progress value={progress} className="h-2" />
      &lt;/CardContent>
      &lt;CardFooter className="flex justify-end">
        &lt;Button onClick={next} className="bg-emerald-600 hover:bg-emerald-700 text-white">{index + 1 === total ? "Finish" : "Next"}&lt;/Button>
      &lt;/CardFooter>
    &lt;/Card>
  );
}