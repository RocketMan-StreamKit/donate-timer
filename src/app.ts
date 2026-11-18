/**
 * Donate Timer control panel (in-app StreamKit+ window).
 * Polls `GET /addon/{id}/panel` and sends actions to `POST /addon/{id}/action`.
 */
import { has, setLang, t } from './panel/i18n';

/** Journal row as returned by the worker. */
type JournalRow = {
  id: string;
  username: string;
  amount: number;
  currency: string;
  originalAmount?: number;
  originalCurrency?: string;
  seconds: number;
  timestamp: number;
  source: 'donation' | 'manual_time' | 'manual_amount';
  platform?: string;
};

/** Panel state from the worker (fields used by the UI). */
type PanelState = {
  success: boolean;
  error?: string;
  lang: string;
  currency: string;
  settings: Record<string, any>;
  timer: { remaining: number; status: 'stopped' | 'running' | 'paused'; blinking: boolean; blinkLeft: number; buffered: number };
  rateText: string;
  bonus: { mode: 'off' | 'live' | 'cooldown' | 'idle'; left: number; percent: number; bank: number; bankStep: number };
  stats: { gross: number; net: number; count: number };
  goal: { collected: number; current: number; target: number };
  timeGoal: string;
  summary: { count: number; seconds: number; amount: number };
  journal: JournalRow[];
  widgetsCleared: number;
  widgets: Record<string, string>;
};

/** Addon id from `/addon_static/{id}/index.html`. */
const addonId = decodeURIComponent(window.location.pathname.split('/').filter(Boolean)[1] || 'donate-timer');
/** Frontend token from the window URL. */
const token = new URLSearchParams(window.location.search).get('token') ?? '';
/** Base URL of the worker HTTP endpoints. */
const apiBase = `${window.location.origin}/addon/${encodeURIComponent(addonId)}`;

/** Currency choices besides `app`. */
const CURRENCIES = ['RUB', 'UAH', 'USD', 'EUR', 'KZT', 'BYN', 'PLN', 'GBP', 'TRY'];
/** Accent choices. */
const ACCENTS = ['orange', 'purple', 'green', 'blue', 'red', 'pink', 'yellow', 'lime', 'navy', 'gray', 'random'];
/** Quick buttons from the desktop app (seconds). */
const QUICK = [-60, -300, -900, 60, 300, 900, -1800, -2700, -3600, 1800, 2700, 3600];

/** Latest state. */
let state: PanelState | null = null;
/** Language applied to static texts. */
let appliedLang = '';
/** Forms with unsaved user edits (skipped when refreshing). */
const dirtyForms = new Set<string>();
/** True while the user edits the "set remaining time" inputs. */
let remainingDirty = false;
/** Toast hide timer. */
let toastTimer: number | undefined;

/**
 * Shortcut for `getElementById`.
 * @param id Element id.
 * @returns Element (typed by the caller).
 * @example $('timer').textContent = '01:00:00';
 */
const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T;

/**
 * Formats seconds as `HH:MM:SS`.
 * @param seconds Duration.
 * @returns Clock string.
 * @example hms(61); // '00:01:01'
 */
const hms = (seconds: number) => {
  const total = Math.max(0, Math.floor(seconds));
  const p = (v: number) => String(Math.floor(v)).padStart(2, '0');
  return `${p(total / 3600)}:${p((total % 3600) / 60)}:${p(total % 60)}`;
};

/**
 * Formats money with up to two decimals and thin grouping.
 * @param value Amount.
 * @returns Display string.
 * @example money(12345.5); // '12 345.5'
 */
const money = (value: number) =>
  (Math.round(value * 100) / 100).toLocaleString('ru-RU', { maximumFractionDigits: 2 }).replace(',', '.');

/**
 * Shows a short message.
 * @param text Message.
 * @param kind Visual style.
 * @example toast(t('saved'));
 */
const toast = (text: string, kind: 'ok' | 'error' = 'ok') => {
  const el = $('toast');
  el.textContent = text;
  el.className = `dt-toast dt-toast--${kind}`;
  el.hidden = false;
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => {
    el.hidden = true;
  }, 2600);
};

/**
 * Error text for a worker error key.
 * @param key Error key.
 * @returns Localized message.
 * @example errorText('timerZero');
 */
const errorText = (key?: string) => (key && has(`err_${key}`) ? t(`err_${key}`) : t('err_unknown'));

/**
 * Loads the panel state.
 * @param refreshCurrency Ask the worker to re-read the app currency.
 * @returns Promise resolved after rendering.
 * @example await refresh();
 */
const refresh = async (refreshCurrency = false) => {
  try {
    const res = await fetch(`${apiBase}/panel?token=${encodeURIComponent(token)}${refreshCurrency ? '&refreshCurrency=1' : ''}`);
    const next = (await res.json()) as PanelState;
    if (!next.success) {
      toast(errorText(next.error), 'error');
      return;
    }
    render(next);
  } catch {
    $('timer-status').textContent = t('err_network');
  }
};

/**
 * Sends an action to the worker and renders the returned state.
 * @param type Action type.
 * @param payload Extra fields.
 * @returns Whether the action succeeded.
 * @example await act('addTime', { seconds: 60 });
 */
const act = async (type: string, payload: Record<string, unknown> = {}) => {
  try {
    const res = await fetch(`${apiBase}/action?token=${encodeURIComponent(token)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, ...payload }),
    });
    const result = (await res.json()) as { success: boolean; error?: string; state?: PanelState };
    if (result.state) render(result.state);
    if (!result.success) toast(errorText(result.error), 'error');
    return result.success;
  } catch {
    toast(t('err_network'), 'error');
    return false;
  }
};

/**
 * Reads a nested settings value by dotted path.
 * @param obj Settings object.
 * @param path Dotted path.
 * @returns Value.
 * @example getPath(settings, 'goal.title');
 */
const getPath = (obj: Record<string, any>, path: string) =>
  path.split('.').reduce<any>((acc, key) => (acc == null ? undefined : acc[key]), obj);

/**
 * Writes a nested value by dotted path.
 * @param obj Target object.
 * @param path Dotted path.
 * @param value Value.
 * @example setPath(patch, 'goal.title', 'Goal');
 */
const setPath = (obj: Record<string, any>, path: string, value: unknown) => {
  const keys = path.split('.');
  let cur = obj;
  keys.slice(0, -1).forEach(key => {
    cur[key] = cur[key] ?? {};
    cur = cur[key];
  });
  cur[keys[keys.length - 1]] = value;
};

/**
 * Epoch ms → `datetime-local` value.
 * @param ms Epoch ms (0 = empty).
 * @returns Input value.
 * @example toLocalInput(Date.now());
 */
const toLocalInput = (ms: number) => {
  if (!ms) return '';
  const d = new Date(ms);
  const p = (v: number) => String(v).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
};

/**
 * Reads three h/m/s inputs as seconds.
 * @param root Container with `[data-part]` inputs.
 * @returns Seconds.
 * @example readHms($('custom-hms'));
 */
const readHms = (root: HTMLElement) => {
  const part = (name: string) => Number((root.querySelector(`[data-part="${name}"]`) as HTMLInputElement).value) || 0;
  return Math.max(0, part('h')) * 3600 + Math.max(0, part('m')) * 60 + Math.max(0, part('s'));
};

/**
 * Fills three h/m/s inputs.
 * @param root Container with `[data-part]` inputs.
 * @param seconds Seconds.
 * @example writeHms($('remaining-hms'), 3600);
 */
const writeHms = (root: HTMLElement, seconds: number) => {
  const total = Math.max(0, Math.floor(seconds));
  const set = (name: string, value: number) => {
    (root.querySelector(`[data-part="${name}"]`) as HTMLInputElement).value = String(value);
  };
  set('h', Math.floor(total / 3600));
  set('m', Math.floor((total % 3600) / 60));
  set('s', total % 60);
};

/**
 * Applies translations to static elements.
 * @example applyStaticTexts();
 */
const applyStaticTexts = () => {
  document.querySelectorAll<HTMLElement>('[data-i18n]').forEach(el => {
    el.textContent = t(el.dataset.i18n ?? '');
  });
  document.querySelectorAll<HTMLInputElement>('[data-i18n-placeholder]').forEach(el => {
    el.placeholder = t(el.dataset.i18nPlaceholder ?? '');
  });
  document.title = t('appTitle');
  const quick = $('quick-buttons');
  quick.innerHTML = '';
  QUICK.forEach(seconds => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `secondary-action ${seconds < 0 ? 'dt-minus' : 'dt-plus'}`;
    const abs = Math.abs(seconds);
    const label = abs >= 3600 ? `${abs / 3600} ${t('hh')}` : `${abs / 60} ${t('mm')}`;
    btn.textContent = `${seconds < 0 ? '−' : '+'}${label}`;
    btn.addEventListener('click', () => void act('addTime', { seconds }));
    quick.appendChild(btn);
  });
  const accent = $<HTMLSelectElement>('accent-select');
  accent.innerHTML = '';
  ACCENTS.forEach(value => {
    const opt = document.createElement('option');
    opt.value = value;
    opt.textContent = value === 'random' ? t('accentRandom') : value;
    accent.appendChild(opt);
  });
};

/**
 * Rebuilds the currency select (the `app` label shows the current app currency).
 * @param s Panel state.
 * @example renderCurrencyOptions(state);
 */
const renderCurrencyOptions = (s: PanelState) => {
  const select = $<HTMLSelectElement>('currency-select');
  const appLabel = t('currencyApp', { c: s.settings.currency === 'app' ? s.currency : '…' });
  const values = ['app', ...CURRENCIES];
  if (s.settings.currency !== 'app' && !values.includes(s.settings.currency)) values.push(s.settings.currency);
  if (select.options.length !== values.length) {
    select.innerHTML = '';
    values.forEach(value => {
      const opt = document.createElement('option');
      opt.value = value;
      select.appendChild(opt);
    });
  }
  Array.from(select.options).forEach(opt => {
    opt.textContent = opt.value === 'app' ? appLabel : opt.value;
  });
};

/**
 * Fills settings forms that the user is not editing.
 * @param settings Current settings.
 * @example fillForms(state.settings);
 */
const fillForms = (settings: Record<string, any>) => {
  document.querySelectorAll<HTMLFormElement>('form[data-section]').forEach(form => {
    if (dirtyForms.has(form.dataset.section ?? '')) return;
    form.querySelectorAll<HTMLInputElement | HTMLSelectElement>('[name][data-kind]').forEach(input => {
      const value = getPath(settings, input.name);
      switch (input.dataset.kind) {
        case 'bool':
          (input as HTMLInputElement).checked = !!value;
          break;
        case 'datetime':
          input.value = toLocalInput(Number(value) || 0);
          break;
        default:
          input.value = value === undefined || value === null ? '' : String(value);
      }
    });
    form.querySelectorAll<HTMLElement>('[data-hms]').forEach(root => {
      writeHms(root, Number(getPath(settings, root.dataset.hms ?? '')) || 0);
    });
  });
};

/**
 * Collects a form into a settings patch.
 * @param form Settings form.
 * @returns Nested patch.
 * @example collectForm(form); // { goal: { title: 'x', ... } }
 */
const collectForm = (form: HTMLFormElement) => {
  const patch: Record<string, any> = {};
  form.querySelectorAll<HTMLInputElement | HTMLSelectElement>('[name][data-kind]').forEach(input => {
    let value: unknown;
    switch (input.dataset.kind) {
      case 'bool':
        value = (input as HTMLInputElement).checked;
        break;
      case 'number':
        value = Number(input.value);
        break;
      case 'datetime':
        value = input.value ? new Date(input.value).getTime() : 0;
        break;
      default:
        value = input.value;
    }
    setPath(patch, input.name, value);
  });
  form.querySelectorAll<HTMLElement>('[data-hms]').forEach(root => {
    setPath(patch, root.dataset.hms ?? '', readHms(root));
  });
  if (state) {
    // Send whole nested groups so untouched fields keep their values.
    Object.keys(patch).forEach(key => {
      const current = state?.settings[key];
      if (current && typeof current === 'object' && !Array.isArray(current)) {
        patch[key] = { ...current, ...patch[key] };
      }
    });
  }
  return patch;
};

/**
 * Renders the journal list.
 * @param s Panel state.
 * @example renderJournal(state);
 */
const renderJournal = (s: PanelState) => {
  $('journal-summary').textContent = t('journalSummary', {
    n: s.summary.count,
    t: hms(s.summary.seconds),
    a: `${money(s.summary.amount)} ${s.currency}`,
  });
  const cleared = $('widgets-cleared');
  cleared.hidden = s.widgetsCleared === 0;
  cleared.textContent = t('widgetsCleared', { n: s.widgetsCleared });
  const list = $('journal');
  const signature = s.journal.map(row => row.id).join('|');
  if (list.dataset.signature === signature) return;
  list.dataset.signature = signature;
  list.innerHTML = '';
  if (!s.journal.length) {
    const li = document.createElement('li');
    li.className = 'dt-muted';
    li.textContent = t('journalEmpty');
    list.appendChild(li);
    return;
  }
  s.journal.forEach(row => {
    const li = document.createElement('li');
    const when = new Date(row.timestamp).toLocaleTimeString();
    const name = document.createElement('b');
    name.textContent = row.username;
    const meta = document.createElement('span');
    meta.className = 'dt-muted';
    const orig =
      row.originalCurrency && row.originalAmount !== undefined
        ? ` (${money(row.originalAmount)} ${row.originalCurrency})`
        : '';
    const source =
      row.source === 'manual_time' ? ` · ${t('srcManualTime')}` : row.source === 'manual_amount' ? ` · ${t('srcManualAmount')}` : row.platform ? ` · ${row.platform}` : '';
    const amount = row.amount > 0 ? `${money(row.amount)} ${row.currency}${orig} · ` : '';
    meta.textContent = `${when} · ${amount}+${hms(row.seconds)}${source}`;
    li.append(name, meta);
    list.appendChild(li);
  });
};

/**
 * Renders widget links once.
 * @param s Panel state.
 * @example renderWidgets(state);
 */
const renderWidgets = (s: PanelState) => {
  const list = $('widgets');
  if (list.childElementCount) return;
  Object.entries(s.widgets).forEach(([id, url]) => {
    const li = document.createElement('li');
    const label = document.createElement('span');
    label.textContent = t(`w_${id}`);
    const input = document.createElement('input');
    input.type = 'text';
    input.readOnly = true;
    input.value = url;
    const copy = document.createElement('button');
    copy.type = 'button';
    copy.className = 'secondary-action';
    copy.textContent = t('copy');
    copy.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(url);
      } catch {
        input.select();
        document.execCommand('copy');
      }
      toast(t('copied'));
    });
    const open = document.createElement('button');
    open.type = 'button';
    open.className = 'secondary-action';
    open.textContent = '↗';
    open.title = t('open');
    open.addEventListener('click', () => void act('openUrl', { url }));
    const row = document.createElement('div');
    row.className = 'dt-row';
    row.append(input, copy, open);
    li.append(label, row);
    list.appendChild(li);
  });
};

/**
 * Renders the whole state.
 * @param s Panel state.
 * @example render(state);
 */
const render = (s: PanelState) => {
  state = s;
  if (appliedLang !== s.lang) {
    appliedLang = s.lang;
    setLang(s.lang);
    applyStaticTexts();
    $('widgets').innerHTML = '';
  }

  $('timer').textContent = hms(s.timer.remaining);
  $('timer').classList.toggle('dt-timer--blink', s.timer.blinking);
  const statusKey = s.timer.status === 'running' ? 'statusRunning' : s.timer.status === 'paused' ? 'statusPaused' : 'statusStopped';
  const badge = $('timer-status');
  badge.textContent = t(statusKey);
  badge.dataset.status = s.timer.status;
  $('rate-now').textContent = `${t('rateNow')}: ${s.rateText.replace(/ /g, ' ')}`;
  $('currency-now').textContent = `${t('baseCurrency')}: ${s.currency}`;
  const blink = $('blink-info');
  blink.hidden = !s.timer.blinking;
  blink.textContent = t('statusBlinking', { n: s.timer.blinkLeft, b: s.timer.buffered });
  $('btn-pause').textContent = s.timer.status === 'paused' ? t('resume') : t('pause');
  ($('btn-start') as HTMLButtonElement).disabled = s.timer.status === 'running' || s.timer.blinking;
  ($('btn-pause') as HTMLButtonElement).disabled = s.timer.status === 'stopped';

  const remainingRoot = $('remaining-hms');
  if (!remainingDirty && !remainingRoot.contains(document.activeElement)) {
    writeHms(remainingRoot, s.timer.remaining);
  }

  renderCurrencyOptions(s);
  fillForms(s.settings);

  const goalPct = s.goal.target > 0 ? Math.min(100, (s.goal.current / s.goal.target) * 100) : 0;
  ($('goal-bar') as HTMLElement).style.width = `${goalPct}%`;
  $('goal-progress').textContent = `${t('goalProgress')}: ${money(s.goal.current)} / ${money(s.goal.target)} ${s.currency} (${Math.round(goalPct)}%)`;

  $('stat-gross').textContent = `${money(s.stats.gross)} ${s.currency}`;
  $('stat-net').textContent = `${money(s.stats.net)} ${s.currency}`;
  $('stat-count').textContent = String(s.stats.count);

  const tg = s.timeGoal || '';
  $('time-goal-now').textContent = tg ? tg.slice(2) : '—';

  const b = s.bonus;
  const head =
    b.mode === 'off'
      ? t('bonusOff')
      : b.mode === 'live'
        ? t('bonusLive', { t: hms(b.left).replace(/^00:/, ''), p: b.percent })
        : b.mode === 'cooldown'
          ? t('bonusCooldownLeft', { t: hms(b.left).replace(/^00:/, '') })
          : t('bonusIdle');
  const bank = b.bankStep > 0 ? `${money(b.bank)} / ${money(b.bankStep)}` : money(b.bank);
  const status = $('bonus-status');
  status.textContent = `${head}. ${t('bonusBank')}: ${bank} ${s.currency}`;
  status.dataset.mode = b.mode;

  renderJournal(s);
  renderWidgets(s);
};

/**
 * Wires buttons and forms.
 * @example bind();
 */
const bind = () => {
  $('btn-start').addEventListener('click', () => void act('start'));
  $('btn-pause').addEventListener('click', () => void act('pause'));
  $('btn-reset').addEventListener('click', () => {
    if (window.confirm(t('confirmReset'))) void act('reset');
  });
  $('remaining-hms').addEventListener('input', () => {
    remainingDirty = true;
  });
  $('btn-set-remaining').addEventListener('click', async () => {
    if (await act('setRemaining', { seconds: readHms($('remaining-hms')) })) {
      remainingDirty = false;
      toast(t('saved'));
    }
  });
  $('btn-add-custom').addEventListener('click', () => {
    void act('addTime', { seconds: readHms($('custom-hms')) });
  });
  $('btn-sub-custom').addEventListener('click', () => {
    void act('addTime', { seconds: -readHms($('custom-hms')) });
  });
  $('btn-add-named').addEventListener('click', async () => {
    const nick = $<HTMLInputElement>('named-nick');
    if (await act('addTimeWithName', { seconds: readHms($('named-hms')), username: nick.value })) {
      nick.value = '';
    }
  });
  $('btn-add-amount').addEventListener('click', async () => {
    const amount = $<HTMLInputElement>('amount-value');
    const nick = $<HTMLInputElement>('amount-nick');
    if (await act('addAmountWithName', { amount: Number(amount.value), username: nick.value })) {
      amount.value = '';
      nick.value = '';
    }
  });
  $('btn-remove-last').addEventListener('click', () => {
    if (window.confirm(t('confirmRemoveLast'))) void act('removeLast');
  });
  $('btn-clear-history').addEventListener('click', () => {
    if (window.confirm(t('confirmClearHistory'))) void act('clearHistory');
  });
  $('btn-clear-widgets').addEventListener('click', () => {
    if (window.confirm(t('confirmClearWidgets'))) void act('clearWidgets');
  });
  $('btn-bonus-start').addEventListener('click', () => void act('bonusStart'));
  $('btn-bonus-stop').addEventListener('click', () => void act('bonusStop'));
  $('btn-bonus-bank').addEventListener('click', () => void act('bonusResetBank'));
  $('btn-bonus-cooldown').addEventListener('click', () => void act('bonusResetCooldown'));
  $('btn-time-goal-reset').addEventListener('click', () => void act('timeGoalReset'));

  document.querySelectorAll<HTMLButtonElement>('[data-set-now]').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = document.querySelector<HTMLInputElement>(`[name="${btn.dataset.setNow}"]`);
      if (!input) return;
      input.value = toLocalInput(Date.now());
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });
  });
  document.querySelectorAll<HTMLButtonElement>('[data-clear]').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = document.querySelector<HTMLInputElement>(`[name="${btn.dataset.clear}"]`);
      if (!input) return;
      input.value = '';
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });
  });

  document.querySelectorAll<HTMLFormElement>('form[data-section]').forEach(form => {
    const section = form.dataset.section ?? '';
    const markDirty = () => {
      dirtyForms.add(section);
      form.classList.add('dt-form--dirty');
    };
    form.addEventListener('input', markDirty);
    form.addEventListener('change', markDirty);
    form.addEventListener('submit', async event => {
      event.preventDefault();
      const ok = await act('settings', { settings: collectForm(form) });
      if (ok) {
        dirtyForms.delete(section);
        form.classList.remove('dt-form--dirty');
        if (state) fillForms(state.settings);
        toast(t('saved'));
        if (section === 'rate') void refresh(true);
      }
    });
  });
};

bind();
void refresh(true);
window.setInterval(() => void refresh(), 1000);
