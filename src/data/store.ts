import { useSyncExternalStore } from 'react';
import type { Database, ID } from '../domain/types';
import { createSeed, SCHEMA_VERSION } from './seed';

/**
 * Demo persistence adapter.
 *
 * The whole database lives in localStorage so the product works without a
 * backend. All reads go through `useStore`/selectors and all writes through
 * `mutate` (called only from data/actions.ts). Replacing this file and the
 * action bodies with API calls is the only change needed to add a real backend.
 * No passwords, tokens or other credentials are ever stored.
 */

const DB_KEY = 'mmg.db';
const SESSION_KEY = 'mmg.session';

export interface StoreState {
  db: Database;
  sessionUserId: ID | null;
}

function readJSON<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function writeJSON(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage can be unavailable (private mode, quota). The app keeps working in memory.
  }
}

function load(): StoreState {
  const stored = readJSON<Database>(DB_KEY);
  const db = stored && stored.schemaVersion === SCHEMA_VERSION ? stored : createSeed();
  db.recentCompanies ??= {};
  if (db !== stored) writeJSON(DB_KEY, db);
  const session = readJSON<{ userId: ID | null }>(SESSION_KEY);
  const sessionUserId = session?.userId && db.users.some((u) => u.id === session.userId) ? session.userId : null;
  return { db, sessionUserId };
}

let state: StoreState = load();
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

export function getState(): StoreState {
  return state;
}

export function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Apply a change to a copy of the database, persist it and notify subscribers. */
export function mutate(change: (draft: Database) => void) {
  const draft = structuredClone(state.db);
  change(draft);
  state = { ...state, db: draft };
  writeJSON(DB_KEY, draft);
  emit();
}

export function setSession(userId: ID | null) {
  // The comparison tray belongs to one visitor, so it does not carry over between accounts.
  const db = state.db.compare.length ? { ...state.db, compare: [] } : state.db;
  if (db !== state.db) writeJSON(DB_KEY, db);
  state = { db, sessionUserId: userId };
  writeJSON(SESSION_KEY, { userId });
  emit();
}

export function resetDatabase() {
  const db = createSeed();
  state = { db, sessionUserId: null };
  writeJSON(DB_KEY, db);
  writeJSON(SESSION_KEY, { userId: null });
  emit();
}

// Keep several open tabs in sync.
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === DB_KEY || e.key === SESSION_KEY) {
      state = load();
      emit();
    }
  });
}

export function useStore(): StoreState {
  return useSyncExternalStore(subscribe, getState, getState);
}

let counter = 0;
export function newId(prefix: string): ID {
  counter += 1;
  return `${prefix}_${Date.now().toString(36)}${counter.toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}
