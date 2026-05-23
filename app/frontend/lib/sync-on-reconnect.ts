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

  // Wave-38 cascade #8 silent-failure-hunter M-2 close-out + wave-39
  // codex MED refinement: stash onReconnect in a ref so the event-
  // listener identity stays stable across re-renders. Prior code re-
  // bound the listeners on every render when the caller passed an
  // inline arrow (typical), creating a teardown-rebind window where
  // 'online' events could be lost OR the microtask-deferred callback
  // could fire from a stale closure.
  //
  // Wave-39 refinement: write the ref in the render body instead of
  // in a useEffect. React 19 guarantees render-body assignments to
  // refs are safe for non-stateful captures (the ref is mutated, not
  // a state dependency); writing in the render body removes the one-
  // tick lag that the useEffect-sync pattern carried (a 'online'
  // event firing between render-N's commit + render-N's onReconnect-
  // sync useEffect could capture render-N-1's stale callback).
  const onReconnectRef = useRef(onReconnect);
  onReconnectRef.current = onReconnect;

  // Wave-39 silent-failure-hunter M-1 + M-3 close-out: track mount
  // status via mountedRef so the microtask-deferred callback skips
  // execution if the component unmounted between the 'online' event
  // handler firing + the microtask executing. Without the guard, the
  // callback fires post-unmount + can setState on an unmounted parent
  // OR throw against a stale React context.
  const mountedRef = useRef(true);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    mountedRef.current = true;
    const handleOnline = () => {
      setState((prev) => {
        if (prev.status === "offline") {
          // Defer the callback to a microtask so any callback-driven
          // state mutations land AFTER the connectivity state update.
          const cb = onReconnectRef.current;
          if (cb) {
            queueMicrotask(() => {
              // Wave-39 M-1 close-out: skip the deferred callback if
              // the component unmounted between handleOnline firing
              // + this microtask executing.
              if (!mountedRef.current) {
                return;
              }
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
      // Wave-39 silent-failure-hunter M-1 close-out: flip mountedRef
      // BEFORE removing the listeners so any in-flight microtask sees
      // the unmount before it dereferences onReconnectRef. Clear the
      // ref afterward so a late-firing 'online' event handler (queued
      // between mountedRef flip + listener removal) cannot dereference
      // a stale callback if React's strict-mode double-invoke fires
      // the effect cleanup twice.
      mountedRef.current = false;
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      onReconnectRef.current = undefined;
    };
  }, []);

  return state;
}
