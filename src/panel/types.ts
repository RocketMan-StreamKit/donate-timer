/** Journal row as returned by the worker. */
export type JournalRow = {
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

/** Panel state from `GET /addon/{id}/panel`. */
export type PanelState = {
  success: boolean;
  error?: string;
  lang: string;
  currency: string;
  /** StreamKit+ main currency. */
  appCurrency: string;
  /** Currency codes known to StreamKit+. */
  currencies: string[];
  settings: Record<string, any>;
  timer: {
    remaining: number;
    status: 'stopped' | 'running' | 'paused';
    blinking: boolean;
    blinkLeft: number;
    buffered: number;
  };
  rateText: string;
  bonus: { mode: 'off' | 'live' | 'cooldown' | 'idle'; left: number; percent: number; bank: number; bankStep: number };
  stats: { gross: number; net: number; count: number };
  goal: { collected: number; current: number; target: number };
  timeGoal: string;
  /** Seconds since the marathon start (0 when not set). */
  onAir: number;
  summary: { count: number; seconds: number; amount: number };
  journal: JournalRow[];
  widgetsCleared: number;
  widgets: Record<string, string>;
};

/** A mounted UI piece that re-renders from state. */
export type Component = {
  /** Root element. */
  el: HTMLElement;
  /** Called with every new state. */
  update?: (state: PanelState) => void;
};
