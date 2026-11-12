/**
 * Irish resources shown on "Next steps in Ireland" and in the PDF report.
 *
 * Every entry was checked against the linked official or organisational
 * source on the date in RESOURCES_LAST_VERIFIED. Services, numbers and
 * policies change: re-verify every entry before each release, and do not add
 * waiting times or claims that a source does not state.
 */

export const RESOURCES_LAST_VERIFIED = "2026-11-12";

export interface Resource {
  name: string;
  description: string;
  url: string;
  /** Contact details exactly as published by the source. */
  contact?: string[];
  source: string;
}

export const URGENT_SUPPORT: Resource[] = [
  {
    name: "Emergency services",
    description: "If you or someone else is in immediate danger or needs emergency help.",
    url: "https://www2.hse.ie/mental-health/services-support/get-urgent-help/",
    contact: ["Call 112 or 999"],
    source: "HSE — Get urgent help",
  },
  {
    name: "Samaritans",
    description: "Confidential, non-judgemental emotional support, 24 hours a day.",
    url: "https://www.samaritans.org/ireland/samaritans-ireland/",
    contact: ["Freephone 116 123", "Email jo@samaritans.ie"],
    source: "HSE — Get urgent help",
  },
  {
    name: "Text About It",
    description: "Free, anonymous text support with a trained volunteer, any time.",
    url: "https://www.textaboutit.ie/",
    contact: ["Free-text HELLO to 50808"],
    source: "HSE — Get urgent help",
  },
  {
    name: "HSE Your Mental Health information line",
    description:
      "Information about mental health supports and services and how to access them.",
    url: "https://www2.hse.ie/mental-health/services-support/your-mental-health-information-line/",
    contact: ["Freephone 1800 111 888, any time"],
    source: "HSE — Your Mental Health information line",
  },
];

export const ASSESSMENT_RESOURCES: Resource[] = [
  {
    name: "HSE — How to get assessed for autism",
    description:
      "The HSE’s public guidance on autism assessment, including what it currently says about adult assessment and GP referral.",
    url: "https://www2.hse.ie/conditions/autism/assessment-and-support/assessment-autism/",
    source: "HSE",
  },
  {
    name: "HSE — Autism in adults",
    description: "How autism can show up in adults, including masking or camouflaging.",
    url: "https://www2.hse.ie/conditions/autism/about-autism/autism-in-adults/",
    source: "HSE",
  },
  {
    name: "HSE — Autism Assessment and Intervention Pathway Protocol (May 2026)",
    description:
      "The HSE’s announcement of its national, tiered autism assessment protocol, which for the first time includes adults.",
    url: "https://about.hse.ie/news/hse-launches-new-tiered-approach-to-autism-assessment-and-intervention/",
    source: "HSE press release, 26 May 2026",
  },
  {
    name: "AsIAm — Adult diagnosis",
    description:
      "Ireland’s autism charity explains adult assessment routes, what to expect, and how to choose a clinician.",
    url: "https://asiam.ie/advice-guidance/adult-diagnosis",
    source: "AsIAm",
  },
  {
    name: "Psychological Society of Ireland — Chartered psychologist directory",
    description:
      "Find psychologists who are Chartered Members of the PSI. Check experience with adult autism assessment before booking.",
    url: "https://www.psychologicalsociety.ie/footer/PSI-Chartered-Psychologist-Online-Directory",
    source: "Psychological Society of Ireland",
  },
];

export const SUPPORT_RESOURCES: Resource[] = [
  {
    name: "AsIAm Autism Information Line",
    description:
      "Information and signposting for autistic people and those exploring autism, including adults.",
    url: "https://asiam.ie/information-line/",
    contact: ["0818 234 234", "Monday to Thursday, 10am to 3pm (instant messaging also available)"],
    source: "AsIAm",
  },
  {
    name: "AsIAm — Adult support",
    description: "Peer-led social and wellbeing groups for autistic adults.",
    url: "https://asiam.ie/what-we-do/adult-support",
    source: "AsIAm",
  },
  {
    name: "HSE — Where to get autism support",
    description: "HSE information on supports for autistic people, families and carers.",
    url: "https://www2.hse.ie/conditions/autism/assessment-and-support/where-to-get-support/",
    source: "HSE",
  },
  {
    name: "IHREC — Disability and reasonable accommodation",
    description:
      "The Irish Human Rights and Equality Commission explains employers’ duties to provide reasonable accommodation under the Employment Equality Acts.",
    url: "https://www.ihrec.ie/guides-and-tools/human-rights-and-equality-for-employers/what-does-the-law-say/disability-and-reasonable-accommodation",
    source: "Irish Human Rights and Equality Commission",
  },
];
