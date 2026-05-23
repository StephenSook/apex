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

import { useEffect, useRef, useState } from "react";

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

  // Wave-38 cascade #8 silent-failure-hunter M-2 close-out: stash
  // onReconnect in a ref so listener identity stays stable across
  // re-renders. Prior code re-bound the event listeners on every
  // render when the caller passed an inline arrow callback (typical),
  // creating a teardown-rebind window where 'online' events could be
  // lost OR the microtask-deferred callback could fire from a stale
  // closure after an unrelated re-render swapped it.
  const onReconnectRef = useRef(onReconnect);
  useEffect(() => {
    onReconnectRef.current = onReconnect;
  }, [onReconnect]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const handleOnline = () => {
      setState((prev) => {
        if (prev.status === "offline") {
          // Defer the callback to a microtask so any callback-driven
          // state mutations land AFTER the connectivity state update.
          const cb = onReconnectRef.current;
          if (cb) {
            queueMicrotask(() => {
              // Wave-38 cascade #8 silent-failure-hunter M-3 close-
              // out: wrap the deferred callback so a thrown error
              // surfaces with context instead of an unhandled rejection
              // on window.onunhandledrejection with no source signal.
              try {
                cb();
              } catch (err) {
                if (typeof console !== "undefined" && console.error) {
                  console.error("useConnectivity onReconnect threw:", err);
                }
              }
            });
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
  }, []);

  return state;
}
