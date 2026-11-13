import type { StoredFile } from '../domain/types';
import { nowISO } from '../domain/dates';
import { newId } from './store';

/**
 * Browser file store for resumes (demo mode).
 *
 * Files live in IndexedDB, which holds binary data far better than
 * localStorage. Only metadata (StoredFile) goes into the main database.
 * A backend would replace this module with uploads to object storage.
 */

const DB_NAME = 'mmg.files';
const STORE = 'files';
export const MAX_RESUME_BYTES = 5 * 1024 * 1024;
export const RESUME_TYPES: Record<string, string> = {
  'application/pdf': 'PDF',
  'application/msword': 'Word',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word',
};
const RESUME_EXT = /\.(pdf|doc|docx)$/i;

// Fallback when IndexedDB is unavailable (some private windows): files last for this visit only.
const memory = new Map<string, Blob>();

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    try {
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = () => req.result.createObjectStore(STORE);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    } catch (e) {
      reject(e);
    }
  });
}

async function tx<T>(mode: IDBTransactionMode, run: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await open();
  return new Promise((resolve, reject) => {
    const req = run(db.transaction(STORE, mode).objectStore(STORE));
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export type ResumeError = 'type' | 'size' | 'storage';

export function checkResume(file: File): ResumeError | null {
  if (!RESUME_TYPES[file.type] && !RESUME_EXT.test(file.name)) return 'type';
  if (file.size > MAX_RESUME_BYTES) return 'size';
  return null;
}

/** Stores the file and returns its metadata. Each upload gets a new id, so older applications keep their copy. */
export async function storeFile(file: File): Promise<StoredFile> {
  const meta: StoredFile = { id: newId('f'), name: file.name, size: file.size, type: file.type, uploadedAt: nowISO() };
  try {
    await tx('readwrite', (s) => s.put(file, meta.id));
  } catch {
    memory.set(meta.id, file);
  }
  return meta;
}

export async function readFile(id: string): Promise<Blob | null> {
  if (memory.has(id)) return memory.get(id)!;
  try {
    return ((await tx('readonly', (s) => s.get(id))) as Blob | undefined) ?? null;
  } catch {
    return null;
  }
}

export async function deleteFile(id: string): Promise<void> {
  memory.delete(id);
  try {
    await tx('readwrite', (s) => s.delete(id));
  } catch {
    // Nothing to clean up.
  }
}

export function formatSize(bytes: number): string {
  return bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
