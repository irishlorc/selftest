import { container, cx } from "@/lib/ui";

export function PageIntro({ title, lede, children }: { title: string; lede: string; children?: React.ReactNode }) {
  return (
    <section className="wash">
      <div className={cx(container, "pb-14 pt-10 sm:pt-16")}>
        <h1 className="max-w-3xl font-serif text-[clamp(2.4rem,1.6rem+3.2vw,4rem)] font-[380] leading-[1.04] tracking-[-0.02em]">
          {title}
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-ink-2 sm:text-[1.2rem]">{lede}</p>
        {children}
      </div>
    </section>
  );
}
