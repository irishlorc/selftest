import type { Metadata } from "next";
import { PageIntro } from "@/components/PageIntro";
import { DeleteDataButton } from "@/components/DeleteDataButton";
import { container, cx } from "@/lib/ui";

export const metadata: Metadata = {
  title: "Privacy",
  description:
    "Exactly how FRAME-24 handles information: answers stay in your browser, no accounts, no trackers, no uploads, and one-click deletion.",
  alternates: { canonical: "/privacy" },
};

const STORED = [
  ["Your answers", "The response you chose for each statement."],
  ["Your note", "The optional note you can add on the results page."],
  ["Progress", "Which statement you were on, when you started and when you finished."],
  ["Confirmation", "When you confirmed you are 18+ and understand FRAME-24 isn’t a diagnosis."],
  ["Display settings", "Your theme and motion preferences."],
];

export default function Privacy() {
  return (
    <>
      <PageIntro
        title="Privacy"
        lede="The short version: your answers never leave your device. There’s no account, no tracking and no upload, and you can delete everything at any time."
      >
        <DeleteDataButton className="mt-8" variant="secondary" />
      </PageIntro>
      <div className={cx(container, "pt-6")}>
        <article className="prose-frame">
          <h2 className="!mt-0">What is stored, and where</h2>
          <p>
            FRAME-24 saves the following in your browser’s <strong>local storage</strong> on this device, under names
            beginning with <code>frame24:</code>. It is not sent to us or to anyone else.
          </p>
          <ul>
            {STORED.map(([t, b]) => (
              <li key={t}>
                <strong>{t}.</strong> {b}
              </li>
            ))}
          </ul>
          <p>
            Anyone who uses this browser on this device could see this information. On a shared or work device,
            consider deleting your data when you finish, or using a private browsing window.
          </p>

          <h2>What we don’t do</h2>
          <ul>
            <li>We don’t have accounts, logins or a database of responses.</li>
            <li>We don’t send your answers or notes to any server, analytics service or AI service.</li>
            <li>We don’t use advertising trackers, analytics scripts or tracking cookies.</li>
            <li>We don’t sell, share or profile anyone.</li>
          </ul>
          <p>
            The site’s security policy also tells your browser not to connect to any other server from FRAME-24 pages,
            which adds a technical safeguard on top of these commitments.
          </p>

          <h2>Your PDF report</h2>
          <p>
            The report is created by code running in your browser and saved straight to your device. No copy is
            uploaded or kept by FRAME-24. Once downloaded, the file is yours to manage — deleting your FRAME-24 data
            doesn’t delete files you have already saved.
          </p>

          <h2>Hosting</h2>
          <p>
            Like any website, the hosting provider receives standard technical information when your browser requests
            a page (such as IP address, browser type and the page address) and may keep it briefly in server logs for
            security and reliability. These requests never contain your answers or notes, because those are never
            transmitted.
          </p>

          <h2>Optional contributions</h2>
          <p>
            If contributions are switched on and you choose to make one, you’ll leave FRAME-24 for a secure page run
            by the payment provider (Stripe). That provider handles your payment details under its own privacy policy.
            FRAME-24 never sees your card details and doesn’t link payments to your answers.
          </p>

          <h2>Deleting your data</h2>
          <p>
            Use “Delete my data from this device” on this page, on your results page or in the footer. It removes all
            FRAME-24 information from this browser immediately. You can also clear your browser’s site data at any
            time.
          </p>

          <h2>Changes to this page</h2>
          <p>
            If how FRAME-24 handles information ever changes, this page will be updated before the change takes effect.
            This page should be reviewed by a data protection professional before public launch.
          </p>
        </article>
      </div>
    </>
  );
}
