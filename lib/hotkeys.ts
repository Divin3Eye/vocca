type HotkeyCallback = () => void;

let handler: ((e: KeyboardEvent) => void) | null = null;

export function registerHotkey(
  key: string,
  modifiers: string[],
  callback: HotkeyCallback
): () => void {
  unregisterHotkey();

  handler = (e: KeyboardEvent) => {
    const keyMatch = e.key.toLowerCase() === key.toLowerCase();
    const ctrlMatch = modifiers.includes("ctrl")
      ? e.ctrlKey || e.metaKey
      : true;
    const shiftMatch = modifiers.includes("shift") ? e.shiftKey : true;
    const altMatch = modifiers.includes("alt") ? e.altKey : true;

    if (keyMatch && ctrlMatch && shiftMatch && altMatch) {
      e.preventDefault();
      callback();
    }
  };

  window.addEventListener("keydown", handler);

  return unregisterHotkey;
}

export function unregisterHotkey(): void {
  if (handler) {
    window.removeEventListener("keydown", handler);
    handler = null;
  }
}
