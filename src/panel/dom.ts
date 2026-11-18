/** Child accepted by {@link h}. */
export type Child = Node | string | number | null | undefined | false;

/** Element options for {@link h}. */
export type HProps = {
  /** CSS class names (falsy entries are skipped). */
  class?: string | (string | false | null | undefined)[];
  /** Text content (set before children). */
  text?: string;
  /** Attributes. */
  attrs?: Record<string, string | number | boolean | undefined>;
  /** Event listeners. */
  on?: Partial<Record<keyof HTMLElementEventMap, (event: any) => void>>;
};

/**
 * Creates an element.
 * @param tag Tag name.
 * @param props Classes, text, attributes and listeners.
 * @param children Child nodes or strings.
 * @returns Element.
 * @example h('button', { class: 'dt-btn', text: 'Save', on: { click: save } });
 */
export const h = <K extends keyof HTMLElementTagNameMap>(
  tag: K,
  props: HProps = {},
  children: Child[] = []
): HTMLElementTagNameMap[K] => {
  const el = document.createElement(tag);
  const cls = Array.isArray(props.class) ? props.class.filter(Boolean).join(' ') : props.class;
  if (cls) el.className = cls;
  if (props.text !== undefined) el.textContent = props.text;
  for (const [name, value] of Object.entries(props.attrs ?? {})) {
    if (value === undefined || value === false) continue;
    el.setAttribute(name, value === true ? '' : String(value));
  }
  for (const [name, fn] of Object.entries(props.on ?? {})) {
    if (fn) el.addEventListener(name, fn);
  }
  append(el, children);
  return el;
};

/**
 * Appends children, skipping empty values.
 * @param el Parent.
 * @param children Children.
 * @example append(card, [title, body]);
 */
export const append = (el: HTMLElement, children: Child[]) => {
  for (const child of children) {
    if (child === null || child === undefined || child === false) continue;
    el.append(typeof child === 'number' ? String(child) : child);
  }
};

/**
 * Sets text only when it changed (avoids layout work on every poll).
 * @param el Element.
 * @param text New text.
 * @example setText(timerEl, '01:00:00');
 */
export const setText = (el: HTMLElement, text: string) => {
  if (el.textContent !== text) el.textContent = text;
};

/**
 * Reads a value from `localStorage` safely.
 * @param key Storage key.
 * @param fallback Value when missing or blocked.
 * @returns Stored string or fallback.
 * @example readLocal('dt-tab', 'control');
 */
export const readLocal = (key: string, fallback: string) => {
  try {
    return window.localStorage.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
};

/**
 * Writes a value to `localStorage` safely.
 * @param key Storage key.
 * @param value Value.
 * @example writeLocal('dt-tab', 'bonus');
 */
export const writeLocal = (key: string, value: string) => {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Storage may be unavailable; the UI still works without it.
  }
};
