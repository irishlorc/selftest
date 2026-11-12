import type { Metadata } from "next";
import { PageIntro } from "@/components/PageIntro";
import { ResourceList } from "@/components/ResourceList";
import { ASSESSMENT_RESOURCES, RESOURCES_LAST_VERIFIED, SUPPORT_RESOURCES, URGENT_SUPPORT } from "@/config/resources";
import { formatDate } from "@/lib/format";
import { container, cx } from "@/lib/ui";

export const metadata: Metadata = {
  title: "Next steps in Ireland",
  description:
    "How adult autism assessment currently works in Ireland, how to choose a clinician, and where to find trusted support — with verified official resources.",
  alternates: { canonical: "/next-steps" },
};

export default function NextSteps() {
  return (
    <>
      <PageIntro
        title="Next steps in Ireland"
        lede="If you’d like to explore further, here’s how adult autism assessment and support currently work in Ireland, and where to find information you can trust."
      >
        <p className="mt-6 inline-block rounded-full bg-surface px-4 py-2 text-sm text-ink-2">
          Information checked on {formatDate(RESOURCES_LAST_VERIFIED)}. Services change, so please confirm details
          with the provider.
        </p>
      </PageIntro>

      <div className={cx(container, "grid gap-16 pt-6")}>
        <section aria-labelledby="urgent-title" className="rounded-[var(--radius-tile)] border-2 border-ink bg-surface p-6 sm:p-8">
          <h2 id="urgent-title" className="font-serif text-[1.9rem] font-[400] leading-tight">
            If you need support right now
          </h2>
          <p className="mt-2 max-w-2xl text-ink-2">
            Reflecting on your experiences can bring up a lot. You don’t need to be in crisis to reach out.
          </p>
          <div className="mt-6">
            <ResourceList items={URGENT_SUPPORT} />
          </div>
        </section>

        <div className="grid gap-12 lg:grid-cols-[1fr_20rem]">
          <article className="prose-frame">
            <h2 className="!mt-0">How adult assessment works right now</h2>
            <p>
              <strong>Public route.</strong> The HSE’s public guidance, last reviewed in October 2024, states that the
              HSE does not provide autism assessments for adults, and that adults will need to pay for a private
              assessment by a psychologist.
            </p>
            <p>
              <strong>What’s changing.</strong> In May 2026 the HSE launched a national Autism Assessment and
              Intervention Pathway Protocol. The HSE says it will, for the first time, give adults a standardised route
              to assessment, that adults can self-refer, and that implementation in the HSE Health Regions would begin
              from the third quarter of 2026. At the launch, the Minister for Health said the immediate priority would
              be children. Availability for adults may therefore vary while the protocol is rolled out.
            </p>
            <p>
              Because this is changing, ask your GP or the HSE what is currently available in your area, and check the
              HSE links on this page for updates.
            </p>
            <p>
              <strong>Private route.</strong> According to the HSE, you do not need a GP referral to see a psychologist
              about an autism assessment. AsIAm notes that some private clinicians do ask for one, and that your GP can
              be a helpful ally either way. Costs and waiting times vary between providers; FRAME-24 doesn’t publish
              figures we can’t verify, so ask providers directly.
            </p>

            <h2>Choosing a clinician</h2>
            <p>
              AsIAm points out that psychologists in Ireland are not yet regulated by the State (CORU is working on
              regulation). Some practical checks:
            </p>
            <ul>
              <li>
                Look for a Chartered Member of the Psychological Society of Ireland, or a psychiatrist registered with
                the Medical Council.
              </li>
              <li>Ask about their experience assessing adults, including people who mask or camouflage.</li>
              <li>Ask what the assessment involves, how long it takes, the total cost, and what the written report includes.</li>
              <li>Ask whether they take a neurodiversity-affirming approach, and what follow-up support they offer.</li>
            </ul>

            <h2>Preparing for a conversation</h2>
            <ul>
              <li>Bring your FRAME-24 report if it’s useful — it’s a record of your reflections, not evidence of a diagnosis.</li>
              <li>Note concrete examples from different settings: work or study, home, relationships.</li>
              <li>Think about childhood. If possible, ask someone who knew you then what they remember.</li>
              <li>Write down what you’re hoping for: understanding, support, workplace adjustments, or something else.</li>
            </ul>

            <h2>Support doesn’t have to wait for a diagnosis</h2>
            <p>
              Many supports and adjustments can help whether or not you pursue assessment. AsIAm runs an information
              line and peer-led groups for autistic adults. If something at work is difficult, the Irish Human Rights
              and Equality Commission explains employers’ duties to provide reasonable accommodation for disabled
              employees under the Employment Equality Acts.
            </p>
          </article>
          <aside className="rounded-[var(--radius-card)] bg-surface-2 p-6 lg:self-start">
            <h2 className="font-semibold">A note on FRAME-24</h2>
            <p className="mt-2 text-[0.95rem] text-ink-2">
              FRAME-24 is independent and isn’t affiliated with the HSE, AsIAm or any provider. We don’t recommend
              individual clinicians, and we don’t receive anything for links on this page.
            </p>
          </aside>
        </div>

        <section aria-labelledby="assess-title">
          <h2 id="assess-title" className="font-serif text-[clamp(1.9rem,1.4rem+1.6vw,2.5rem)] font-[400] leading-tight">
            Assessment information
          </h2>
          <div className="mt-6">
            <ResourceList items={ASSESSMENT_RESOURCES} />
          </div>
        </section>

        <section aria-labelledby="support-title">
          <h2 id="support-title" className="font-serif text-[clamp(1.9rem,1.4rem+1.6vw,2.5rem)] font-[400] leading-tight">
            Support and rights
          </h2>
          <div className="mt-6">
            <ResourceList items={SUPPORT_RESOURCES} />
          </div>
        </section>
      </div>
    </>
  );
}
