"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { QUESTIONS, type Frequency, type Impact } from "@/config/questionnaire";
import { firstOpenIndex, withFrequency, withImpact, withSkip } from "@/lib/session";
import { resetSession, updateSession, useIsClient, useSession } from "@/lib/store";
import { IntroView } from "./IntroView";
import { QuestionView } from "./QuestionView";
import { ReviewView } from "./ReviewView";

type View = "auto" | "intro" | "question" | "review";

export function ExperienceApp() {
  const isClient = useIsClient();
  const session = useSession();
  const router = useRouter();
  const [view, setView] = useState<View>("auto");
  const [returnToReview, setReturnToReview] = useState(false);
  const [hint, setHint] = useState("");

  // Work out where to land on first visit (or after data was deleted elsewhere).
  let effective: Exclude<View, "auto"> = "intro";
  if (session?.consentedAt) {
    if (view === "auto" || view === "intro") {
      effective = session.completedAt || firstOpenIndex(session) === null ? "review" : "question";
    } else {
      effective = view;
    }
  }

  const index = session?.currentIndex ?? 0;

  useEffect(() => {
    window.scrollTo({ top: 0 });
    if (effective === "review") document.getElementById("review-title")?.focus();
  }, [effective]);

  const goTo = useCallback((i: number) => {
    setHint("");
    updateSession((s) => ({ ...s, currentIndex: Math.max(0, Math.min(QUESTIONS.length - 1, i)) }));
  }, []);

  const onFrequency = useCallback(
    (f: Frequency) => {
      setHint("");
      updateSession((s) => withFrequency(s, QUESTIONS[s.currentIndex].id, f));
    },
    [],
  );

  const onImpact = useCallback((i: Impact | undefined) => {
    updateSession((s) => withImpact(s, QUESTIONS[s.currentIndex].id, i));
  }, []);

  const advance = useCallback(() => {
    if (returnToReview || index === QUESTIONS.length - 1) {
      setReturnToReview(false);
      setView("review");
    } else {
      goTo(index + 1);
    }
  }, [goTo, index, returnToReview]);

  const onNext = useCallback(() => {
    const a = session?.answers[QUESTIONS[index].id];
    if (!a?.frequency) {
      setHint("Choose a response, or select Skip to move on.");
      return;
    }
    advance();
  }, [advance, index, session]);

  const onSkip = useCallback(() => {
    updateSession((s) => withSkip(s, QUESTIONS[s.currentIndex].id));
    advance();
  }, [advance]);

  if (!isClient) {
    return (
      <div className="mx-auto max-w-[720px] px-5 py-24 text-ink-2" aria-busy="true">
        Loading…
      </div>
    );
  }

  if (effective === "intro") {
    return (
      <IntroView
        onStart={() => {
          const now = new Date().toISOString();
          resetSession();
          updateSession((s) => ({ ...s, consentedAt: now, currentIndex: 0 }));
          setView("question");
        }}
      />
    );
  }

  if (effective === "review" && session) {
    return (
      <ReviewView
        session={session}
        onEdit={(i) => {
          goTo(i);
          setReturnToReview(true);
          setView("question");
        }}
        onRestart={() => {
          resetSession();
          setReturnToReview(false);
          setView("intro");
        }}
        onFinish={() => {
          updateSession((s) => ({ ...s, completedAt: s.completedAt ?? new Date().toISOString() }));
          router.push("/results");
        }}
      />
    );
  }

  if (!session) return null;

  return (
    <QuestionView
      session={session}
      index={index}
      returnToReview={returnToReview}
      hint={hint}
      onFrequency={onFrequency}
      onImpact={onImpact}
      onNext={onNext}
      onSkip={onSkip}
      onBack={() => {
        if (index > 0) goTo(index - 1);
      }}
      onPause={() => router.push("/")}
    />
  );
}
