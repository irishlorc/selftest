import type { Resource } from "@/config/resources";

export function ResourceList({ items, columns = 2 }: { items: Resource[]; columns?: 1 | 2 }) {
  return (
    <ul className={columns === 2 ? "grid gap-3 md:grid-cols-2" : "grid gap-3"}>
      {items.map((r) => (
        <li key={r.name} className="flex flex-col rounded-[var(--radius-card)] border border-line bg-surface p-5">
          <h3 className="font-semibold">
            <a href={r.url} rel="noopener noreferrer" className="underline-offset-4 hover:underline">
              {r.name}
              <span className="sr-only"> (opens external site)</span>
            </a>
          </h3>
          <p className="mt-1.5 text-[0.95rem] text-ink-2">{r.description}</p>
          {r.contact && (
            <ul className="mt-3 grid gap-1 text-[0.95rem] font-semibold">
              {r.contact.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          )}
          <p className="mt-auto pt-3 text-xs text-ink-3">Source: {r.source}</p>
        </li>
      ))}
    </ul>
  );
}
