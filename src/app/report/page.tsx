import type { Metadata } from "next";
import { ReportApp } from "@/components/report/ReportApp";

export const metadata: Metadata = {
  title: "Your report",
  description: "Download your free FRAME-24 reflection report, generated privately on your device.",
  robots: { index: false, follow: true },
};

export default function ReportPage() {
  return <ReportApp />;
}
