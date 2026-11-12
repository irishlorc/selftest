export const SITE = {
  name: "FRAME-24",
  tagline: "A free, private autism self-exploration experience for adults in Ireland.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://frame-24.vercel.app",
};

export const NAV = [
  { href: "/understanding-autism", label: "Understanding autism" },
  { href: "/next-steps", label: "Next steps in Ireland" },
  { href: "/about", label: "About" },
  { href: "/privacy", label: "Privacy" },
];

/**
 * Optional €1 contribution.
 *
 * Payments only appear when NEXT_PUBLIC_CONTRIBUTION_URL is set to a hosted
 * checkout link from a supported provider (for example a Stripe Payment Link).
 * FRAME-24 never handles card details, never records payments and never shows
 * a "payment complete" state itself — the provider's own page confirms it.
 */
const ALLOWED_CONTRIBUTION_HOSTS = ["buy.stripe.com", "donate.stripe.com", "checkout.stripe.com"];

export function getContributionUrl(): string | null {
  const raw = process.env.NEXT_PUBLIC_CONTRIBUTION_URL;
  if (!raw) return null;
  try {
    const url = new URL(raw);
    if (url.protocol !== "https:") return null;
    if (!ALLOWED_CONTRIBUTION_HOSTS.includes(url.hostname)) return null;
    return url.toString();
  } catch {
    return null;
  }
}

export const CONTRIBUTION_AMOUNT = "€1";
