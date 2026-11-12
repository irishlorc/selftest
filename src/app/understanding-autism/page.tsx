import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "@/components/PageIntro";
import { container, cx } from "@/lib/ui";

export const metadata: Metadata = {
  title: "Understanding autism",
  description:
    "An accessible introduction to autism in adults, how it can show up, how it overlaps with other experiences, and the limits of online self-assessment.",
  alternates: { canonical: "/understanding-autism" },
};

export default function UnderstandingAutism() {
  return (
    <>
      <PageIntro
        title="Understanding autism"
        lede="A plain-language introduction for adults who are curious about autism — in themselves or someone they know — and an honest look at what self-reflection tools can and can’t tell you."
      />
      <div className={cx(container, "grid gap-12 pt-6 lg:grid-cols-[1fr_17rem]")}>
        <article className="prose-frame">
          <h2>What autism is</h2>
          <p>
            Autism is a lifelong neurodevelopmental difference. It shapes how a person communicates and relates to
            others, how they process sensory information, and how they experience the world around them. It is not an
            illness, and it isn’t caused by parenting or vaccines.
          </p>
          <p>
            Autism looks different from person to person. Two autistic adults can have very different strengths,
            challenges and support needs, and the same person can find things easier or harder depending on their
            environment, energy and stress. That’s one reason autism is often described as a spectrum — not a line from
            “mild” to “severe”, but a wide range of profiles.
          </p>
          <p>
            Many autistic people in Ireland prefer identity-first language (“autistic person”), while others prefer
            “person with autism”. Both are used respectfully; FRAME-24 follows the preference of{" "}
            <a href="https://asiam.ie/advice-guidance/what-is-autism" rel="noopener noreferrer">
              AsIAm, Ireland’s autism charity
            </a>
            , for identity-first language.
          </p>

          <h2>How autism can show up in adults</h2>
          <p>
            The{" "}
            <a href="https://www2.hse.ie/conditions/autism/about-autism/autism-in-adults/" rel="noopener noreferrer">
              HSE describes
            </a>{" "}
            a range of experiences autistic adults may have. These can include:
          </p>
          <ul>
            <li>finding it hard to work out what others are thinking or feeling, or taking language literally</li>
            <li>finding conversation, eye contact or making friends effortful</li>
            <li>noticing small sensory details that others miss, or finding some sensory input overwhelming</li>
            <li>preferring routine and predictability, and finding unexpected change distressing</li>
            <li>having deep, focused interests</li>
            <li>finding it hard to describe or understand your own feelings</li>
          </ul>
          <p>
            None of these on its own means someone is autistic. A professional looks at the overall pattern, how long
            it has been present (usually since childhood, even if it wasn’t noticed), and how it affects daily life.
          </p>

          <h3>Masking and later recognition</h3>
          <p>
            Many autistic adults learn to hide or compensate for their differences to fit in — often called masking or
            camouflaging. It can make someone appear to be coping well while costing them a great deal of energy. The
            HSE notes that autism can present differently in women, and that masking can make it harder to recognise.
            This is one reason many people only begin to wonder about autism in adulthood.
          </p>

          <h2>Traits overlap with many human experiences</h2>
          <p>
            The experiences FRAME-24 asks about are common in autism — and they are also common in other contexts.
            For example:
          </p>
          <ul>
            <li>ADHD, which frequently co-occurs with autism and shares some features</li>
            <li>anxiety, including social anxiety, and depression</li>
            <li>the effects of trauma, chronic stress or burnout</li>
            <li>sensory or hearing differences, migraine, or fatigue and poor sleep</li>
            <li>personality and temperament — such as introversion — with no diagnosis at all</li>
          </ul>
          <p>
            Autistic people can also have these experiences alongside autism. Untangling what explains what is
            exactly the work a skilled clinician does, and it’s why no questionnaire can do it for you.
          </p>

          <h2>The limits of self-assessment</h2>
          <p>Online questionnaires, including FRAME-24, have real limitations:</p>
          <ul>
            <li>
              <strong>They rely on self-report.</strong> How we see ourselves is shaped by mood, context, masking, and
              how familiar we are with the language being used.
            </li>
            <li>
              <strong>They can’t see your history.</strong> Assessment considers development from childhood, often
              with input from someone who knew you then.
            </li>
            <li>
              <strong>They can’t tell overlapping explanations apart.</strong> The same answer can have several
              different causes.
            </li>
            <li>
              <strong>Many aren’t validated</strong> for the way they are used online. FRAME-24 itself is an original,
              unvalidated framework that has not yet been reviewed by clinicians.
            </li>
          </ul>
          <p>
            So a low number of reported experiences doesn’t rule autism out, and a high number doesn’t confirm it. What
            a tool like FRAME-24 can do is help you put words to your experiences and prepare for a conversation with
            someone qualified to help.
          </p>

          <h2>Diagnosis</h2>
          <p>
            In Ireland, an adult autism diagnosis is made by a qualified clinician, usually a psychologist or
            psychiatrist, using recognised diagnostic criteria and a detailed developmental history. Some people find a
            diagnosis brings understanding, self-acceptance and access to support; others are content to self-identify
            or simply understand themselves better. There’s no single right path.
          </p>
          <p>
            <Link href="/next-steps">See how assessment and support work in Ireland</Link>.
          </p>
        </article>
        <aside className="lg:pt-14">
          <div className="sticky top-6 rounded-[var(--radius-card)] border border-line bg-surface p-6">
            <h2 className="font-semibold">Sources</h2>
            <ul className="mt-3 grid gap-3 text-[0.95rem]">
              <li>
                <a className="underline underline-offset-4" href="https://www2.hse.ie/conditions/autism/about-autism/autism-in-adults/" rel="noopener noreferrer">
                  HSE — Autism in adults
                </a>
              </li>
              <li>
                <a className="underline underline-offset-4" href="https://asiam.ie/advice-guidance/what-is-autism" rel="noopener noreferrer">
                  AsIAm — What is autism?
                </a>
              </li>
              <li>
                <a className="underline underline-offset-4" href="https://asiam.ie/advice-guidance/adult-diagnosis" rel="noopener noreferrer">
                  AsIAm — Adult diagnosis
                </a>
              </li>
            </ul>
            <p className="mt-4 text-sm text-ink-3">
              This page is general information, not medical advice. It should be reviewed by qualified clinicians
              before public launch.
            </p>
          </div>
        </aside>
      </div>
    </>
  );
}
