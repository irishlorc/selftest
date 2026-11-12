import type { Metadata } from "next";
import { ExperienceApp } from "@/components/experience/ExperienceApp";

export const metadata: Metadata = {
  title: "The experience",
  description: "Respond to 24 statements at your own pace. Private, saved only on your device.",
  robots: { index: false, follow: true },
};

export default function ExperiencePage() {
  return <ExperienceApp />;
}
