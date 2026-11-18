import { h } from '../dom';

/**
 * Color phases of the timer widget (`widgets/timer_new.html` → `updateDisplay`).
 * Thresholds are remaining seconds; the first matching phase wins.
 */
const PHASES: [number, string][] = [
  [7200, 'white'],
  [3600, 'lime'],
  [1800, 'yellow'],
  [600, 'orange'],
  [300, 'red'],
  [-1, 'redcrit'],
];

/** Digit flip transition (same curve as the widget). */
const FLIP_TRANSITION = 'transform 0.58s cubic-bezier(0.22, 1, 0.36, 1)';

/**
 * Phase name for remaining seconds.
 * @param seconds Remaining seconds.
 * @returns Phase id.
 * @example phaseFor(4000); // 'lime'
 */
const phaseFor = (seconds: number) => (PHASES.find(([limit]) => seconds > limit) ?? PHASES[PHASES.length - 1])[1];

/**
 * Smoothstep easing used by the widget grant animation.
 * @param t Progress 0..1.
 * @returns Eased progress.
 * @example ease(0.5); // 0.5
 */
const ease = (t: number) => {
  const x = Math.min(1, Math.max(0, t));
  return x * x * (3 - 2 * x);
};

/**
 * Grant count-up duration (widget formula: ~52 ms per second, 0.28–12 s).
 * @param delta Granted seconds.
 * @returns Duration in ms.
 * @example grantDuration(60); // 3120
 */
const grantDuration = (delta: number) => Math.min(12000, Math.max(280, Math.round(delta * 52)));

/**
 * Short grant label (`+1ч 2м 3с`).
 * @param seconds Granted seconds.
 * @returns Label.
 * @example grantLabel(90); // '+1м 30с'
 */
const grantLabel = (seconds: number) => {
  const total = Math.round(seconds);
  const parts: string[] = [];
  const hh = Math.floor(total / 3600);
  const mm = Math.floor((total % 3600) / 60);
  const ss = total % 60;
  if (hh) parts.push(`${hh}ч`);
  if (mm) parts.push(`${mm}м`);
  if (ss || !parts.length) parts.push(`${ss}с`);
  return `+${parts.join(' ')}`;
};

/** One flipping digit. */
type Slot = { el: HTMLElement; track: HTMLElement; current: string; busy: boolean; queued: [string, boolean] | null };

/**
 * Creates a digit slot.
 * @param ch Initial character.
 * @returns Slot.
 * @example createSlot('0');
 */
const createSlot = (ch: string): Slot => {
  const track = h('span', { class: 'dt-flip-track' }, [h('span', { class: 'dt-flip-char', text: ch })]);
  return { el: h('span', { class: 'dt-flip-slot' }, [track]), track, current: ch, busy: false, queued: null };
};

/**
 * Sets a digit without animation.
 * @param slot Slot.
 * @param ch Character.
 * @example setImmediate(slot, '5');
 */
const setImmediate = (slot: Slot, ch: string) => {
  slot.track.style.transition = 'none';
  slot.track.replaceChildren(h('span', { class: 'dt-flip-char', text: ch }));
  slot.track.style.transform = 'translateY(0)';
  slot.current = ch;
};

/**
 * Flips a digit: down while counting down, up when time is granted.
 * @param slot Slot.
 * @param next New character.
 * @param up Flip direction.
 * @example flip(slot, '4', false);
 */
const flip = (slot: Slot, next: string, up: boolean) => {
  if (slot.current === next) return;
  if (slot.busy) {
    slot.queued = [next, up];
    return;
  }
  slot.busy = true;
  const { track } = slot;
  const oldEl = h('span', { class: 'dt-flip-char', text: slot.current });
  const newEl = h('span', { class: 'dt-flip-char', text: next });
  track.style.transition = 'none';
  if (up) {
    track.replaceChildren(oldEl, newEl);
    track.style.transform = 'translateY(0)';
  } else {
    track.replaceChildren(newEl, oldEl);
    track.style.transform = 'translateY(-1em)';
  }
  void track.offsetHeight;
  track.style.transition = FLIP_TRANSITION;
  track.style.transform = up ? 'translateY(-1em)' : 'translateY(0)';
  const done = () => {
    window.clearTimeout(fallback);
    track.removeEventListener('transitionend', done);
    setImmediate(slot, next);
    slot.busy = false;
    const queued = slot.queued;
    slot.queued = null;
    if (queued && queued[0] !== slot.current) requestAnimationFrame(() => flip(slot, queued[0], queued[1]));
  };
  // Fallback in case `transitionend` never fires (hidden tab, reduced motion).
  const fallback = window.setTimeout(done, 700);
  track.addEventListener('transitionend', done);
};

/**
 * Timer display in the style of the OBS timer widget: flipping digits, color phases with glow and
 * pulse, smooth count-up with a floating "+time" label when time is added.
 * @returns `{ el, set }` — call `set(remaining, blinking)` on every state update.
 * @example const clock = flipClock(); clock.set(3600, false);
 */
export const flipClock = () => {
  const row = h('div', { class: 'dt-flip-row' });
  const bubble = h('div', { class: 'dt-flip-added', attrs: { 'aria-hidden': 'true' } });
  const el = h('div', { class: 'dt-flip', attrs: { role: 'timer' } }, [row, bubble]);

  let slots: Slot[] = [];
  let hoursLen = 0;
  let shown = -1;
  let target = -1;
  let grant: { from: number; to: number; start: number; duration: number } | null = null;
  let raf = 0;
  let bubbleTimer = 0;

  /**
   * Renders a whole number of seconds.
   * @param seconds Seconds to show.
   * @param animate Flip changed digits.
   * @param up Flip direction.
   * @example render(59, true, false);
   */
  const render = (seconds: number, animate: boolean, up: boolean) => {
    const total = Math.max(0, Math.floor(seconds));
    const hh = String(Math.floor(total / 3600)).padStart(2, '0');
    const mm = String(Math.floor((total % 3600) / 60)).padStart(2, '0');
    const ss = String(total % 60).padStart(2, '0');
    const digits = (hh + mm + ss).split('');
    if (hh.length !== hoursLen) {
      hoursLen = hh.length;
      slots = digits.map(createSlot);
      const nodes: HTMLElement[] = [];
      slots.forEach((slot, i) => {
        if (i === hoursLen || i === hoursLen + 2) nodes.push(h('span', { class: 'dt-flip-colon', text: ':' }));
        nodes.push(slot.el);
      });
      row.replaceChildren(...nodes);
      animate = false;
    }
    digits.forEach((ch, i) => (animate ? flip(slots[i], ch, up) : setImmediate(slots[i], ch)));
    shown = total;
    el.dataset.phase = phaseFor(total);
    el.setAttribute('aria-label', `${hh}:${mm}:${ss}`);
  };

  const step = () => {
    raf = 0;
    if (!grant) return;
    const t = (performance.now() - grant.start) / grant.duration;
    const value = t >= 1 ? grant.to : grant.from + (grant.to - grant.from) * ease(t);
    const whole = Math.round(value);
    if (whole !== shown) render(whole, true, true);
    if (t >= 1) {
      grant = null;
      return;
    }
    raf = requestAnimationFrame(step);
  };

  const showBubble = (delta: number) => {
    bubble.textContent = grantLabel(delta);
    bubble.classList.remove('dt-flip-added--on');
    void bubble.offsetWidth;
    bubble.classList.add('dt-flip-added--on');
    window.clearTimeout(bubbleTimer);
    bubbleTimer = window.setTimeout(() => bubble.classList.remove('dt-flip-added--on'), 2000);
  };

  /**
   * Updates the display.
   * @param remaining Remaining seconds from the worker.
   * @param blinking "Time is up" state.
   * @param running Countdown is running (one second elapsed between polls is added back to the "+time" label).
   * @example clock.set(state.timer.remaining, state.timer.blinking, true);
   */
  const set = (remaining: number, blinking: boolean, running = false) => {
    el.classList.toggle('dt-flip--blink', blinking);
    const next = blinking ? 0 : Math.max(0, Math.floor(remaining));
    if (blinking) {
      grant = null;
      if (shown !== 0) render(0, false, false);
      target = 0;
      return;
    }
    if (target < 0) {
      render(next, false, false);
      target = next;
      return;
    }
    const delta = next - target;
    target = next;
    if (delta > 1) {
      // Time was added: count up smoothly from what is on screen now.
      const from = grant ? Math.round(grant.from + (grant.to - grant.from) * ease((performance.now() - grant.start) / grant.duration)) : shown;
      grant = { from, to: next, start: performance.now(), duration: grantDuration(next - from) };
      showBubble(delta + (running ? 1 : 0));
      if (!raf) raf = requestAnimationFrame(step);
      return;
    }
    if (grant) {
      // Keep counting toward the moving target while the grant animation runs.
      grant.to = next;
      return;
    }
    if (next !== shown) render(next, true, next > shown);
  };

  return { el, set };
};
