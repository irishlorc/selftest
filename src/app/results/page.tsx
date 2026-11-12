import type { Metadata } from "next";
import { ResultsApp } from "@/components/results/ResultsApp";

export const metadata: Metadata = {
  title: "Your results",
  description: "A personal, descriptive reflection of your FRAME-24 responses across six areas.",
  robots: { index: false, follow: true },
};

export default function ResultsPage() {
  return <ResultsApp />;
}
