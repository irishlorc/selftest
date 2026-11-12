"use client";
/**
 * Browser-local storage for FRAME-24. Nothing here talks to a server.
 * All keys share the "frame24:" prefix so a single control can delete them.
 */
import { useSyncExternalStore } from "react";
import { createSession, sanitizeSession, type Session } from "./session";

export const STORAGE_PREFIX = "frame24:";
export const SESSION_KEY = `${STORAGE_PREFIX}session`;
export const PREFS_KEY = `${STORAGE_PREFIX}prefs`;

export type ThemePref = "system" | "light" | "dark";
export type MotionPref = "system" | "reduce";
export interface Prefs {
  theme: ThemePref;
  motion: MotionPref;
}
const DEFAULT_PREFS: Prefs = { theme: "system", motion: "system" };

const listeners = new Set<() => void>();
let sessionCache: Session | null | undefined;
let prefsCache: Prefs | undefined;
let storageAvailable = true;

function emit() {
  for (const l of listeners) l();
}

function safeGet(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    storageAvailable = false;
    return null;
  }
}

function safeSet(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    storageAvailable = false;
  }
}

function readSession(): Session | null {
  const raw = safeGet(SESSION_KEY);
  if (!raw) return null;
  try {
    return sanitizeSession(JSON.parse(raw));
  } catch {
    return null;
  }
}

function readPrefs(): Prefs {
  const raw = safeGet(PREFS_KEY);
  if (!raw) return DEFAULT_PREFS;
  try {
    const p = JSON.parse(raw) as Partial<Prefs>;
    return {
      theme: p.theme === "light" || p.theme === "dark" ? p.theme : "system",
      motion: p.motion === "reduce" ? "reduce" : "system",
    };
  } catch {
    return DEFAULT_PREFS;
  }
}

function onStorage(e: StorageEvent) {
  if (e.key === null || e.key.startsWith(STORAGE_PREFIX)) {
    sessionCache = undefined;
    prefsCache = undefined;
    emit();
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (listeners.size === 1) window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) window.removeEventListener("storage", onStorage);
  };
}

function getSession(): Session | null {
  if (sessionCache === undefined) sessionCache = readSession();
  return sessionCache;
}

function getPrefs(): Prefs {
  if (prefsCache === undefined) prefsCache = readPrefs();
  return prefsCache;
}

export function useSession(): Session | null {
  return useSyncExternalStore(subscribe, getSession, () => null);
}

export function usePrefs(): Prefs {
  return useSyncExternalStore(subscribe, getPrefs, () => DEFAULT_PREFS);
}

/** True once running in the browser (false during server render and hydration). */
export function useIsClient(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export function isStorageAvailable() {
  return storageAvailable;
}

export function updateSession(fn: (current: Session) => Session): Session {
  const current = getSession() ?? createSession();
  const next = { ...fn(current), updatedAt: new Date().toISOString() };
  sessionCache = next;
  safeSet(SESSION_KEY, JSON.stringify(next));
  emit();
  return next;
}

export function resetSession(): Session {
  const fresh = createSession();
  sessionCache = fresh;
  safeSet(SESSION_KEY, JSON.stringify(fresh));
  emit();
  return fresh;
}

export function applyPrefs(prefs: Prefs) {
  const root = document.documentElement;
  const dark =
    prefs.theme === "dark" ||
    (prefs.theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  root.dataset.theme = dark ? "dark" : "light";
  if (prefs.motion === "reduce") root.dataset.motion = "reduce";
  else delete root.dataset.motion;
}

export function setPrefs(patch: Partial<Prefs>) {
  const next = { ...getPrefs(), ...patch };
  prefsCache = next;
  safeSet(PREFS_KEY, JSON.stringify(next));
  applyPrefs(next);
  emit();
}

/** Removes every FRAME-24 key from this browser, including display preferences. */
export function deleteAllLocalData() {
  try {
    const keys: string[] = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i);
      if (k?.startsWith(STORAGE_PREFIX)) keys.push(k);
    }
    keys.forEach((k) => window.localStorage.removeItem(k));
    window.sessionStorage.clear();
  } catch {
    /* storage unavailable: nothing stored */
  }
  sessionCache = null;
  prefsCache = DEFAULT_PREFS;
  applyPrefs(DEFAULT_PREFS);
  emit();
}

/**
 * Inline script that runs before first paint to apply theme and motion
 * preferences without a flash. Kept tiny and dependency-free.
 */
export const PREFS_BOOTSTRAP_SCRIPT = `(function(){try{var d=document.documentElement,p=JSON.parse(localStorage.getItem("${PREFS_KEY}")||"{}"),t=p.theme;if(t!=="light"&&t!=="dark"){t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}d.dataset.theme=t;if(p.motion==="reduce")d.dataset.motion="reduce"}catch(e){}})()`;
