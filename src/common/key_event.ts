export interface HotKey {
  keys: string[];
}

export interface HotKeys {
  value: HotKey[];
}

export function key_event_match_HotKey(e: KeyboardEvent, hot_keys: HotKeys) {
  const hks = hot_keys.value;
  hk_loop: for (const hk of hks) {
    const keys = hk.keys;
    for (const key of keys) {
      if (key === "Ctrl") {
        if (e.ctrlKey) continue;
        else continue hk_loop;
      }
      if (key === "Shift") {
        if (e.shiftKey) continue;
        else continue hk_loop;
      }
      if (key === "Alt") {
        if (e.altKey) continue;
        else continue hk_loop;
      }
      if (key === "Meta") {
        if (e.metaKey) continue;
        else continue hk_loop;
      }
      if (key !== e.key) continue hk_loop;
    }
    return true;
  }
  return false;
}
