import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useConnectivity } from "../sync-on-reconnect";

describe("useConnectivity", () => {
  afterEach(() => {
    // Reset navigator.onLine between tests; jsdom navigator is
    // writable for test setup but doesn't reset automatically.
    Object.defineProperty(window.navigator, "onLine", {
      configurable: true,
      writable: true,
      value: true,
    });
  });

  it("returns online state when navigator.onLine is true at mount (lazy initializer)", () => {
    Object.defineProperty(window.navigator, "onLine", {
      configurable: true,
      writable: true,
      value: true,
    });
    const { result } = renderHook(() => useConnectivity());
    expect(result.current.status).toBe("online");
  });

  it("returns offline state when navigator.onLine is false at mount (cascade #8 lazy init pattern)", () => {
    Object.defineProperty(window.navigator, "onLine", {
      configurable: true,
      writable: true,
      value: false,
    });
    const { result } = renderHook(() => useConnectivity());
    expect(result.current.status).toBe("offline");
    if (result.current.status === "offline") {
      expect(result.current.reconnect_pending).toBe(true);
    }
  });

  it("transitions online -> offline on window 'offline' event", () => {
    Object.defineProperty(window.navigator, "onLine", {
      configurable: true,
      writable: true,
      value: true,
    });
    const { result } = renderHook(() => useConnectivity());
    expect(result.current.status).toBe("online");
    act(() => {
      window.dispatchEvent(new Event("offline"));
    });
    expect(result.current.status).toBe("offline");
  });

  it("transitions offline -> online on window 'online' event + fires onReconnect via queueMicrotask", async () => {
    Object.defineProperty(window.navigator, "onLine", {
      configurable: true,
      writable: true,
      value: false,
    });
    const onReconnect = vi.fn();
    const { result } = renderHook(() => useConnectivity(onReconnect));
    expect(result.current.status).toBe("offline");
    expect(onReconnect).not.toHaveBeenCalled();
    await act(async () => {
      window.dispatchEvent(new Event("online"));
      // queueMicrotask deferral resolves on the next microtask tick.
      await Promise.resolve();
    });
    expect(result.current.status).toBe("online");
    expect(onReconnect).toHaveBeenCalledTimes(1);
  });

  it("removes window event listeners on unmount", () => {
    const removeSpy = vi.spyOn(window, "removeEventListener");
    const { unmount } = renderHook(() => useConnectivity());
    unmount();
    expect(removeSpy).toHaveBeenCalledWith("online", expect.any(Function));
    expect(removeSpy).toHaveBeenCalledWith("offline", expect.any(Function));
    removeSpy.mockRestore();
  });
});
