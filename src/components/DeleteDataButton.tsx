"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { deleteAllLocalData } from "@/lib/store";
import { btn, cx } from "@/lib/ui";

/**
 * Deletes every FRAME-24 item from this browser after confirmation.
 * Uses the native <dialog> element for focus trapping and Escape handling.
 */
export function DeleteDataButton({
  className,
  label = "Delete my data from this device",
  variant = "small",
  redirectHome = false,
}: {
  className?: string;
  label?: string;
  variant?: keyof typeof btn;
  redirectHome?: boolean;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [done, setDone] = useState(false);
  const router = useRouter();

  return (
    <>
      <button type="button" className={cx(btn[variant], className)} onClick={() => dialogRef.current?.showModal()}>
        {label}
      </button>
      <span role="status" className="sr-only">
        {done ? "Your FRAME-24 data has been deleted from this device." : ""}
      </span>
      <dialog
        ref={dialogRef}
        aria-labelledby="delete-title"
        aria-describedby="delete-desc"
        className="m-auto w-[min(92vw,30rem)] rounded-3xl border border-line bg-surface p-0 text-ink backdrop:bg-[rgba(20,18,28,0.55)]"
      >
        <div className="p-6 sm:p-8">
          <h2 id="delete-title" className="font-serif text-2xl">
            Delete your FRAME-24 data?
          </h2>
          <p id="delete-desc" className="mt-3 text-ink-2">
            This removes your answers, notes and display settings from this browser. It can’t be undone. Any PDF
            you have already downloaded is not affected.
          </p>
          <div className="mt-6 flex flex-wrap justify-end gap-3">
            <button type="button" className={btn.secondary} onClick={() => dialogRef.current?.close()} autoFocus>
              Keep my data
            </button>
            <button
              type="button"
              className={btn.danger}
              onClick={() => {
                deleteAllLocalData();
                dialogRef.current?.close();
                setDone(true);
                if (redirectHome) router.push("/");
              }}
            >
              Delete everything
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}
