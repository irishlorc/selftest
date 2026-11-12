import type { Metadata } from "next";
import { PageIntro } from "@/components/PageIntro";
import { DIMENSIONS, FRAMEWORK, FREQUENCY_OPTIONS, IMPACT_OPTIONS, QUESTIONS } from "@/config/questionnaire";
import { container, cx } from "@/lib/ui";

export const metadata: Metadata = {
  title: "About FRAME-24",
  description:
    "FRAME-24’s purpose, methodology, limitations, clinical review status and commitment to accessibility.",
  alternates: { canonical: "/about" },
};

export default function About() {
  return (
    <>
      <PageIntro
        title="About FRAME-24"
        lede="Why it exists, how it was built, what it deliberately doesn’t do, and how it will be improved."
      />
      <div className={cx(container, "grid gap-12 pt-6 lg:grid-cols-[1fr_19rem]")}>
        <article className="prose-frame">
          <h2 className="!mt-0">Purpose</h2>
          <p>
            Many adults start wondering about autism after reading or hearing about other people’s experiences. Online
            questionnaires are often their first stop — and many feel clinical, confusing or alarming, or reduce a
            person to a single number.
          </p>
          <p>
            FRAME-24 offers a calmer alternative: a structured, private way to reflect on everyday experiences, put
            them into words, and prepare for a conversation with a professional if you want one. It is free, and it
            will stay free.
          </p>

          <h2>Methodology</h2>
          <h3>Original statements</h3>
          <p>
            FRAME-24 has {QUESTIONS.length} original statements across {DIMENSIONS.length} areas of experience, four
            in each. They were written for this project and are not copied or adapted from any existing assessment
            instrument or scoring system.
          </p>
          <h3>Response scale</h3>
          <p>
            For each statement you choose one of{" "}
            {FREQUENCY_OPTIONS.map((o) => o.label.toLowerCase()).join(", ").replace(/, ([^,]*)$/, " or $1")}. For
            experiences that happen at least rarely, you can optionally say whether their effect is{" "}
            {IMPACT_OPTIONS.map((o) => o.label.toLowerCase()).join(", ").replace(/, ([^,]*)$/, " or $1")}.
          </p>
          <h3>A descriptive results engine</h3>
          <p>
            Results are counts and plain-language descriptions of what you reported, area by area. How often something
            happens and how it affects you are shown separately. Skipped and “not sure” statements are shown as gaps
            and are never filled in.
          </p>
          <p>
            By design, FRAME-24 does not calculate autism likelihood, diagnostic probability, severity, risk categories
            or clinical thresholds. The six areas are an organising structure for reflection, not established medical
            scales, and there is no total score.
          </p>
          <h3>Editable by reviewers</h3>
          <p>
            Statements, areas and all interpretation text live in plain configuration files, separate from the
            application code, so qualified professionals can review and revise the framework directly.
          </p>

          <h2>Limitations</h2>
          <ul>
            <li>FRAME-24 has not been validated. We don’t know how well its statements reflect autistic experience across different people.</li>
            <li>It relies on self-report, which is shaped by mood, context, masking and self-knowledge.</li>
            <li>Its statements describe experiences shared by many people, autistic or not.</li>
            <li>It is designed for adults ({FRAMEWORK.minimumAge}+) and written in English, initially for people in Ireland.</li>
            <li>It cannot tell you whether you are autistic, and it can’t replace a professional assessment.</li>
          </ul>

          <h2>Clinical review and regulation</h2>
          <p>
            FRAME-24 is version {FRAMEWORK.version} and has <strong>not yet been reviewed by clinicians</strong>.
            Before any wider launch, the statements, interpretation text and educational content should be reviewed
            by qualified professionals with adult autism assessment experience, ideally alongside autistic adults.
          </p>
          <p>
            FRAME-24 is intended as a non-medical self-reflection tool. Software intended to screen for or diagnose a
            condition can be regulated as a medical device under the EU Medical Device Regulation (EU) 2017/745. If
            FRAME-24 were ever to be marketed or used for screening or diagnosis, it would first need appropriate
            regulatory assessment.
          </p>

          <h2>Accessibility</h2>
          <p>
            We aim to meet the Web Content Accessibility Guidelines (WCAG) 2.2 at level AA. FRAME-24 includes:
          </p>
          <ul>
            <li>full keyboard operation, with visible focus and shortcuts (1–6 to answer, Enter to continue)</li>
            <li>light and dark themes, plus a reduced-motion setting that also follows your device</li>
            <li>results that use fill height and symbols, never colour alone, and an accessible table version of the chart</li>
            <li>clear, consistent controls: Back, Next, Skip and Pause on every statement</li>
            <li>no time limits, and progress that saves automatically</li>
          </ul>
          <p>
            Automated accessibility checks run on every page as part of our test suite. Automated tools can’t catch
            everything, so testing with disabled and autistic users is planned before launch.
          </p>
        </article>
        <aside className="lg:pt-2">
          <div className="sticky top-6 grid gap-4">
            <div className="rounded-[var(--radius-card)] border border-line bg-surface p-6">
              <h2 className="font-semibold">Framework status</h2>
              <dl className="mt-3 grid gap-2 text-[0.95rem]">
                <div>
                  <dt className="text-ink-3">Version</dt>
                  <dd>{FRAMEWORK.version}</dd>
                </div>
                <div>
                  <dt className="text-ink-3">Validation</dt>
                  <dd>Not validated</dd>
                </div>
                <div>
                  <dt className="text-ink-3">Clinical review</dt>
                  <dd>{FRAMEWORK.clinicalReview.reviewed ? `Reviewed ${FRAMEWORK.clinicalReview.reviewDate}` : "Awaiting review"}</dd>
                </div>
              </dl>
            </div>
            <div className="rounded-[var(--radius-card)] bg-surface-2 p-6 text-[0.95rem] text-ink-2">
              FRAME-24 is independent. It isn’t affiliated with the HSE, AsIAm or any assessment provider.
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
