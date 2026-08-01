// Central app state: cached metadata, latest hub data, refresh status.

import { getJSON } from "./api.js";

const listeners = new Set();

export const store = {
  metadata: null,
  hubData: null,
  hubStatus: "loading", // loading | ready | error
  hubError: null,
  lastUpdated: null
};

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function notify() {
  listeners.forEach((fn) => fn(store));
}

export async function loadMetadata() {
  if (store.metadata && !store.metadata._failed) return store.metadata;
  try {
    store.metadata = await getJSON("/api/metadata");
  } catch {
    // metadata function always falls back server-side; if even that fails
    // (e.g. sign-in required), fall back client-side to a minimal shape so
    // forms still render. _failed lets a later call retry after sign-in.
    store.metadata = { reportTypeOptions: [], warning: "Metadata unavailable.", _failed: true };
  }
  notify();
  return store.metadata;
}

export async function refreshHubData() {
  store.hubStatus = store.hubData ? store.hubStatus : "loading";
  notify();

  try {
    store.hubData = await getJSON("/api/hub-data");
    store.hubStatus = "ready";
    store.hubError = null;
    store.lastUpdated = new Date();
  } catch (error) {
    store.hubStatus = "error";
    store.hubError = error.message || String(error);
  }

  notify();
  return store.hubData;
}

export function connectionState() {
  if (store.hubStatus === "error") return "offline";
  if (!store.lastUpdated) return "checking";
  const ageMs = Date.now() - store.lastUpdated.getTime();
  return ageMs > 5 * 60 * 1000 ? "delayed" : "live";
}

export function lastUpdatedLabel() {
  if (!store.lastUpdated) return "Waiting for first update";
  return `Last updated ${store.lastUpdated.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`;
}
