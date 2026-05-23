/**
 * Server-authoritative reconnect logic per D-021. When the WebGPU
 * Granite Nano edge mode operates offline, the edge-computed local
 * state is ADVISORY ONLY; on reconnect (navigator.onLine flips back
 * to true), the server-authoritative path overwrites the local state
 * with the canonical server result. The edge demo does not emit
 * mechanical recommendations offline per D-021 explicit scope cut.
 *
 * Reconnect contract:
 *   1. Browser detects offline via window 'offline' event.
 *   2. EdgeSummary displays role=status "Server-authoritative
 *      reconnect pending; edge results advisory only."
 *   3. Browser detects online via window 'online' event.
 *   4. onReconnect() callback fires; caller refetches the server-
 *      authoritative state via fetch() + overwrites the local state.
 *
 * Lazy state initializer pattern per cascade #8 lesson (wave-38):
 * no synchronous setState inside useEffect. The lazy initializer
 * derives initial state from navigator.onLine at first render +
 * SSR safe via typeof navigator check.
 */

"use client";

import { useEffect, useState } from "react";

export type ConnectivityState =
  | { readonly status: "online" }
  | { readonly status: "offline"; readonly reconnect_pending: true };

/**
 * React hook returning the live connectivity state. Subscribes to
 * the browser 'online'/'offline' events on mount; cleanup on
 * unmount. Optional onReconnect callback fires when the state
 * transitions offline -> online (after first render).
 *
 * SSR safe: typeof window guard. Initial state derived via lazy
 * initializer per cascade #8 pattern lock.
 */
export function useConnectivity(onReconnect?: () => void): ConnectivityState {
  const [state, setState] = useState<ConnectivityState>(() => {
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      return { status: "offline", reconnect_pending: true };
    }
    return { status: "online" };
  });

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const handleOnline = () => {
      setState((prev) => {
        if (prev.status === "offline") {
          // Defer the callback to a microtask so any callback-driven
          // state mutations land AFTER the connectivity state update.
          if (onReconnect) {
            queueMicrotask(onReconnect);
          }
          return { status: "online" };
        }
        return prev;
      });
    };
    const handleOffline = () => {
      setState((prev) => {
        if (prev.status === "online") {
          return { status: "offline", reconnect_pending: true };
        }
        return prev;
      });
    };
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [onReconnect]);

  return state;
}
