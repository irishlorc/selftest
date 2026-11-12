/** Shared class strings so buttons and links look identical everywhere. */
const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-[background-color,color,box-shadow,transform] duration-200 disabled:cursor-not-allowed disabled:opacity-50 select-none";

export const btn = {
  primary: `${base} bg-ink text-paper px-6 py-3 text-[0.98rem] hover:-translate-y-px hover:shadow-[0_8px_24px_-12px_var(--ink)] active:translate-y-0`,
  secondary: `${base} bg-surface text-ink border border-line-strong px-6 py-3 text-[0.98rem] hover:border-ink`,
  quiet: `${base} text-ink-2 px-4 py-2.5 text-[0.95rem] hover:text-ink hover:bg-surface-2`,
  small: `${base} bg-surface text-ink border border-line-strong px-4 py-2 text-sm hover:border-ink`,
  danger: `${base} bg-[#8f1d3c] text-white px-6 py-3 text-[0.98rem] hover:bg-[#771631] dark:bg-[#f2a7bf] dark:text-[#2a0c17] dark:hover:bg-[#f7c0d1]`,
};

export const card = "rounded-[var(--radius-card)] bg-surface border border-line";

export const container = "mx-auto w-full max-w-[1180px] px-5 sm:px-8";

export function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}
