import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Recent Node versions ship their own global `localStorage`, which shadows jsdom's and is unusable
// without extra flags. Give every test a simple in-memory one instead.
class MemoryStorage {
  #items = new Map();
  get length() { return this.#items.size; }
  key(i) { return [...this.#items.keys()][i] ?? null; }
  getItem(k) { return this.#items.has(String(k)) ? this.#items.get(String(k)) : null; }
  setItem(k, v) { this.#items.set(String(k), String(v)); }
  removeItem(k) { this.#items.delete(String(k)); }
  clear() { this.#items.clear(); }
}

const storage = new MemoryStorage();
Object.defineProperty(globalThis, 'localStorage', { value: storage, configurable: true });
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'localStorage', { value: storage, configurable: true });
}

afterEach(() => {
  cleanup();
  storage.clear();
});
