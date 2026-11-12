/**
 * FRAME-24 interpretation content.
 *
 * Everything here is descriptive language that reflects a person's own
 * answers back to them. Nothing in this file scores, ranks, classifies or
 * estimates likelihood. Reviewers can edit the wording freely; the results
 * engine (src/lib/results.ts) only fills in counts and statement labels.
 *
 * Rules for editors:
 *  - Describe, never diagnose. Avoid "symptom", "severity", "risk", "score",
 *    "likely", "probability", "threshold" and similar clinical framing.
 *  - Never imply that few reported experiences rule autism out, or that many
 *    confirm it.
 *  - Keep the reading age accessible (aim for plain English).
 */

import type { DimensionId } from "./questionnaire";

export interface DimensionInterpretation {
  /** What the area explores, shown on the results card and in the PDF. */
  about: string;
  /** Experiences that overlap with this area beyond autism. */
  overlaps: string;
  /** Questions a person might bring to a professional conversation. */
  discussionPrompts: string[];
}

export const DIMENSION_INTERPRETATION: Record<DimensionId, DimensionInterpretation> = {
  communication: {
    about:
      "This area looks at how you process what people mean, especially when it isn’t said directly, and how much preparation or effort conversation takes.",
    overlaps:
      "Many people find indirect communication or busy group conversations effortful at times — for example when tired, anxious, speaking a second language, or with hearing or attention differences.",
    discussionPrompts: [
      "Which kinds of communication take me the most effort, and in which settings?",
      "Would clearer written follow-ups or explicit expectations help me at work, college or home?",
    ],
  },
  sensory: {
    about:
      "This area looks at how your senses register the world around you — sound, light, texture, smell and small changes — and how that shapes your comfort.",
    overlaps:
      "Sensory sensitivity is common in autism, but it also appears with ADHD, anxiety, migraine, hearing conditions, fatigue, and in many people without any diagnosis.",
    discussionPrompts: [
      "Which environments feel most demanding for my senses, and what adjustments help?",
      "Could any sensory experiences I reported have another explanation worth checking, such as hearing or vision?",
    ],
  },
  predictability: {
    about:
      "This area looks at how plans, change and transitions between activities feel for you, and the routines you may have built.",
    overlaps:
      "Preferring predictability is a very human trait. It can be more pronounced during stress, anxiety, burnout or major life change, as well as being part of many autistic people’s experience.",
    discussionPrompts: [
      "What makes unexpected change harder or easier for me to adjust to?",
      "Which routines are helping me, and are any becoming hard to sustain?",
    ],
  },
  attention: {
    about:
      "This area looks at deep focus and interests, how interruptions land, and actions or movements that help you feel regulated.",
    overlaps:
      "Deep absorption and sensitivity to interruption are also associated with ADHD, with many creative and technical professions, and simply with loving what you do.",
    discussionPrompts: [
      "How do my patterns of focus show up across work, rest and relationships?",
      "Are there regulating actions or movements I use that I would like others to understand?",
    ],
  },
  social: {
    about:
      "This area looks at the conscious effort and energy social situations can involve, including adapting yourself and recovering afterwards.",
    overlaps:
      "Adjusting to social settings and needing time alone are experienced by many people, including introverted people and those with social anxiety. For some autistic people, this effort (often called masking or camouflaging) can be considerable and less visible to others.",
    discussionPrompts: [
      "How much energy do social situations take from me, and how do I recover?",
      "Do I put effort into appearing comfortable, and what does it cost me over time?",
    ],
  },
  daily: {
    about:
      "This area looks at how demands combine across a day, how much your environment matters, and the workarounds you have developed.",
    overlaps:
      "Feeling overwhelmed when demands stack up is common during stress, burnout, poor sleep, depression or caring responsibilities, as well as in neurodivergent experience.",
    discussionPrompts: [
      "Which combinations of demands tend to overwhelm me, and what helps me recover?",
      "Which workarounds have I built, and which supports might reduce the effort they take?",
    ],
  },
};

/** Prompts that apply to everyone, included in every report. */
export const GENERAL_DISCUSSION_PROMPTS: string[] = [
  "Which of these experiences have been present since childhood, and which are more recent?",
  "Could other explanations — such as anxiety, ADHD, trauma, sleep, hearing or life stress — account for some of these experiences, alone or alongside autism?",
  "What would I hope to gain from a formal assessment, and what supports could help in the meantime?",
];

/** Text used throughout the results and report. Editable copy. */
export const COPY = {
  nonDiagnostic:
    "FRAME-24 is an original self-reflection tool. It has not been clinically validated, and it cannot tell you whether you are autistic. Autistic traits overlap with many other human experiences, so a low number of reported experiences does not rule autism out, and a high number does not confirm it.",
  frequencyVsDifficulty:
    "How often something happens and how it affects you are different questions. An experience can be frequent and helpful, rare but difficult, or anything in between — so FRAME-24 shows them separately.",
  noAssumptions:
    "Statements you skipped or marked ‘not sure’ are shown as gaps. FRAME-24 never fills them in or assumes an answer.",
  emptyDimension:
    "You didn’t give a frequency for any statement in this area, so there is nothing to reflect back here. That’s completely fine.",
};
