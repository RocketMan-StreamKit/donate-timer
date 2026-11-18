/** Control panel languages. */
export type UiLang = 'en' | 'ru' | 'uk';

/** Translation table: key → per-language text. */
type Strings = Record<string, Record<UiLang, string>>;

/**
 * Control panel strings. `{name}` placeholders are filled by {@link t}.
 * @example strings.start.ru; // 'Старт'
 */
const strings: Strings = {
  appTitle: { en: 'Donate Timer', ru: 'Донат-таймер', uk: 'Донат-таймер' },
  statusRunning: { en: 'Running', ru: 'Идёт', uk: 'Йде' },
  statusPaused: { en: 'Paused', ru: 'Пауза', uk: 'Пауза' },
  statusStopped: { en: 'Stopped', ru: 'Остановлен', uk: 'Зупинено' },
  statusBlinking: { en: 'Time is up — {n}s, donations are buffered ({b})', ru: 'Время вышло — {n} с, донаты в буфере ({b})', uk: 'Час вийшов — {n} с, донати в буфері ({b})' },
  rateNow: { en: 'Rate now', ru: 'Текущий курс', uk: 'Поточний курс' },
  baseCurrency: { en: 'Base currency', ru: 'Базовая валюта', uk: 'Базова валюта' },

  secTimer: { en: 'Timer', ru: 'Таймер', uk: 'Таймер' },
  start: { en: 'Start', ru: 'Старт', uk: 'Старт' },
  pause: { en: 'Pause', ru: 'Пауза', uk: 'Пауза' },
  resume: { en: 'Resume', ru: 'Продолжить', uk: 'Продовжити' },
  reset: { en: 'Reset', ru: 'Сброс', uk: 'Скинути' },
  confirmReset: { en: 'Reset the timer to the initial time?', ru: 'Сбросить таймер на начальное время?', uk: 'Скинути таймер на початковий час?' },
  setRemaining: { en: 'Set remaining time', ru: 'Установить оставшееся время', uk: 'Встановити залишок часу' },
  apply: { en: 'Apply', ru: 'Применить', uk: 'Застосувати' },
  initialTime: { en: 'Initial time (used by Reset)', ru: 'Начальное время (для сброса)', uk: 'Початковий час (для скидання)' },
  blinkSeconds: { en: '"Time is up" blink, seconds', ru: 'Мигание «время вышло», секунд', uk: 'Блимання «час вийшов», секунд' },
  blinkHint: { en: 'Donations during the blink are applied when it ends; the timer then restarts if time was added.', ru: 'Донаты во время мигания применяются после него; если время добавилось, таймер запускается снова.', uk: 'Донати під час блимання застосовуються після нього; якщо час додано, таймер запускається знову.' },
  save: { en: 'Save', ru: 'Сохранить', uk: 'Зберегти' },
  saved: { en: 'Saved', ru: 'Сохранено', uk: 'Збережено' },
  hh: { en: 'h', ru: 'ч', uk: 'год' },
  mm: { en: 'm', ru: 'м', uk: 'хв' },
  ss: { en: 's', ru: 'с', uk: 'с' },

  secManual: { en: 'Manual time control', ru: 'Ручное управление временем', uk: 'Ручне керування часом' },
  addCustom: { en: 'Add time', ru: 'Добавить время', uk: 'Додати час' },
  subCustom: { en: 'Subtract time', ru: 'Отнять время', uk: 'Відняти час' },
  nickname: { en: 'Nickname', ru: 'Никнейм', uk: 'Нікнейм' },
  addWithName: { en: 'Add time for nickname', ru: 'Добавить время с ником', uk: 'Додати час із ніком' },
  addWithNameHint: { en: 'Goes to the journal and widgets without money.', ru: 'Попадает в журнал и виджеты без суммы.', uk: 'Потрапляє в журнал і віджети без суми.' },
  amount: { en: 'Amount', ru: 'Сумма', uk: 'Сума' },
  addAmount: { en: 'Add donation by amount', ru: 'Добавить донат по сумме', uk: 'Додати донат за сумою' },
  addDonation: { en: 'Add donation', ru: 'Добавить донат', uk: 'Додати донат' },
  addAmountHint: { en: 'Counts like a real donation: rate, bonus window, totals.', ru: 'Считается как настоящий донат: курс, бонусный курс, суммы.', uk: 'Рахується як справжній донат: курс, бонусний курс, суми.' },

  secRate: { en: 'Rate and title', ru: 'Курс и заголовок', uk: 'Курс і заголовок' },
  rateMode: { en: 'Rate mode', ru: 'Режим курса', uk: 'Режим курсу' },
  modeAmountPerSec: { en: 'Money per second', ru: 'Денег за секунду', uk: 'Грошей за секунду' },
  modeSecPerAmount: { en: 'Seconds per money unit', ru: 'Секунд за единицу валюты', uk: 'Секунд за одиницю валюти' },
  rateValue: { en: 'Rate', ru: 'Курс', uk: 'Курс' },
  currencyApp: { en: 'Same as app ({c})', ru: 'Как в приложении ({c})', uk: 'Як у програмі ({c})' },
  currencyHint: { en: 'Donations in other currencies are converted with StreamKit+ exchange rates. Totals only count rows stored in the current base currency.', ru: 'Донаты в других валютах конвертируются по курсам StreamKit+. Суммы учитывают только записи в текущей базовой валюте.', uk: 'Донати в інших валютах конвертуються за курсами StreamKit+. Суми враховують лише записи в поточній базовій валюті.' },
  widgetTitle: { en: 'Widget title', ru: 'Заголовок для виджетов', uk: 'Заголовок для віджетів' },

  secColors: { en: 'Alert plate colors', ru: 'Цветовые плашки алертов', uk: 'Кольорові плашки алертів' },
  colorsEnabled: { en: 'Color plates by amount', ru: 'Цвет плашки по сумме', uk: 'Колір плашки за сумою' },
  colorBlue: { en: 'Blue from', ru: 'Синяя от', uk: 'Синя від' },
  colorPurple: { en: 'Purple from', ru: 'Фиолетовая от', uk: 'Фіолетова від' },
  colorGreen: { en: 'Green from', ru: 'Зелёная от', uk: 'Зелена від' },
  colorRed: { en: 'Red from', ru: 'Красная от', uk: 'Червона від' },

  secGoal: { en: 'Donation goal', ru: 'Донат-гол', uk: 'Донат-гол' },
  enabled: { en: 'Enabled', ru: 'Включено', uk: 'Увімкнено' },
  title: { en: 'Title', ru: 'Заголовок', uk: 'Заголовок' },
  goalTarget: { en: 'Target', ru: 'Цель', uk: 'Ціль' },
  goalStart: { en: 'Already collected', ru: 'Уже собрано', uk: 'Вже зібрано' },
  goalStartAt: { en: 'Count donations from', ru: 'Учитывать донаты с', uk: 'Враховувати донати з' },
  goalStartAtHint: { en: 'Filled with the current time when the goal is enabled without a date.', ru: 'Если дата пуста, при включении подставится текущее время.', uk: 'Якщо дата порожня, під час увімкнення підставиться поточний час.' },
  trackOpacity: { en: 'Track opacity, %', ru: 'Прозрачность фона, %', uk: 'Прозорість фону, %' },
  fillOpacity: { en: 'Fill opacity, %', ru: 'Прозрачность заливки, %', uk: 'Прозорість заливки, %' },
  goalProgress: { en: 'Progress', ru: 'Прогресс', uk: 'Прогрес' },
  now: { en: 'Now', ru: 'Сейчас', uk: 'Зараз' },
  clear: { en: 'Clear', ru: 'Очистить', uk: 'Очистити' },

  secMarathon: { en: 'Marathon', ru: 'Марафон', uk: 'Марафон' },
  marathonStart: { en: 'Marathon start', ru: 'Старт марафона', uk: 'Старт марафону' },
  marathonStartHint: { en: 'Used for the on-air clock, totals and Top-6. Empty = whole journal.', ru: 'Для счётчика эфира, сумм и Top-6. Пусто — весь журнал.', uk: 'Для лічильника ефіру, сум і Top-6. Порожньо — весь журнал.' },
  commission: { en: 'Platform commission, %', ru: 'Комиссия платформы, %', uk: 'Комісія платформи, %' },
  accent: { en: 'Widget accent color', ru: 'Акцентный цвет виджетов', uk: 'Акцентний колір віджетів' },
  accentRandom: { en: 'Random (changes every hour)', ru: 'Случайный (меняется каждый час)', uk: 'Випадковий (змінюється щогодини)' },
  gross: { en: 'Collected', ru: 'Собрано', uk: 'Зібрано' },
  net: { en: 'Net', ru: 'Чистыми', uk: 'Чистими' },
  donationsCount: { en: 'Donations', ru: 'Донатов', uk: 'Донатів' },

  secTimeGoal: { en: 'Marathon time goal', ru: 'Цель марафона по времени', uk: 'Ціль марафону за часом' },
  timeGoalHours: { en: 'Total duration, hours', ru: 'Общая длительность, часов', uk: 'Загальна тривалість, годин' },
  timeGoalDone: { en: 'Text when reached', ru: 'Текст по достижении', uk: 'Текст після досягнення' },
  timeGoalHint: { en: 'Shows how much time donations still need to add: goal − on air − timer.', ru: 'Показывает, сколько времени ещё нужно задонатить: цель − эфир − таймер.', uk: 'Показує, скільки часу ще треба задонатити: ціль − ефір − таймер.' },
  timeGoalNow: { en: 'Widget shows', ru: 'Виджет показывает', uk: 'Віджет показує' },
  recalc: { en: 'Recalculate', ru: 'Пересчитать', uk: 'Перерахувати' },

  secBonus: { en: 'Bonus rate', ru: 'Бонусный курс', uk: 'Бонусний курс' },
  bonusEnabled: { en: 'Bonus windows enabled', ru: 'Акции включены', uk: 'Акції увімкнено' },
  bonusShowObs: { en: 'Show idle preview in OBS', ru: 'Показывать превью в OBS', uk: 'Показувати превʼю в OBS' },
  bonusPercent: { en: 'Viewer benefit, %', ru: 'Выгода зрителю, %', uk: 'Вигода глядачу, %' },
  bonusDurMin: { en: 'Window from, min', ru: 'Длительность от, мин', uk: 'Тривалість від, хв' },
  bonusDurMax: { en: 'Window to, min', ru: 'Длительность до, мин', uk: 'Тривалість до, хв' },
  bonusCooldown: { en: 'Cooldown, min', ru: 'Кулдаун, мин', uk: 'Кулдаун, хв' },
  bonusBankStep: { en: 'Bank step (0 = off)', ru: 'Шаг банка (0 — выкл.)', uk: 'Крок банку (0 — вимк.)' },
  bonusWhale: { en: 'Big donation (0 = off)', ru: 'Крупный донат (0 — выкл.)', uk: 'Великий донат (0 — вимк.)' },
  bonusOnGoal: { en: 'Open once when the donation goal is reached', ru: 'Открыть один раз при достижении донат-гола', uk: 'Відкрити один раз після досягнення донат-голу' },
  bonusTitle1: { en: 'Widget title, line 1', ru: 'Заголовок виджета, строка 1', uk: 'Заголовок віджета, рядок 1' },
  bonusTitle2: { en: 'Widget title, line 2', ru: 'Заголовок виджета, строка 2', uk: 'Заголовок віджета, рядок 2' },
  bonusBomb: { en: 'Countdown bomb sound in the bonus widget', ru: 'Звук бомбы в виджете бонусного курса', uk: 'Звук бомби у віджеті бонусного курсу' },
  bonusOpenSound: { en: 'Window open sound URL (optional)', ru: 'URL звука открытия акции (необязательно)', uk: 'URL звуку відкриття акції (необовʼязково)' },
  bonusVolume: { en: 'Sound volume, %', ru: 'Громкость звуков, %', uk: 'Гучність звуків, %' },
  bonusHint: { en: 'Donations fill the bank; a window opens on the bank step, a big donation or the reached goal. The donation that opens it keeps the old rate.', ru: 'Донаты копятся в банк; акция открывается по шагу банка, крупному донату или достижению цели. Донат, открывший акцию, считается по старому курсу.', uk: 'Донати накопичуються в банк; акція відкривається за кроком банку, великим донатом або досягненням цілі. Донат, що відкрив акцію, рахується за старим курсом.' },
  bonusStart: { en: 'Start now', ru: 'Запустить', uk: 'Запустити' },
  bonusStop: { en: 'Stop', ru: 'Остановить', uk: 'Зупинити' },
  bonusResetBank: { en: 'Reset bank', ru: 'Сбросить банк', uk: 'Скинути банк' },
  bonusResetCooldown: { en: 'Reset cooldown', ru: 'Сбросить кулдаун', uk: 'Скинути кулдаун' },
  bonusOff: { en: 'Off', ru: 'Выключено', uk: 'Вимкнено' },
  bonusIdle: { en: 'Waiting', ru: 'Ожидание', uk: 'Очікування' },
  bonusLive: { en: 'Window {t}, +{p}%', ru: 'Акция {t}, +{p}%', uk: 'Акція {t}, +{p}%' },
  bonusCooldownLeft: { en: 'Cooldown {t}', ru: 'Кулдаун {t}', uk: 'Кулдаун {t}' },
  bonusBank: { en: 'Bank', ru: 'Банк', uk: 'Банк' },

  secJournal: { en: 'Donation journal', ru: 'Журнал донатов', uk: 'Журнал донатів' },
  journalEmpty: { en: 'No donations yet', ru: 'Донатов пока нет', uk: 'Донатів поки немає' },
  journalSummary: { en: '{n} rows · +{t} · {a}', ru: '{n} записей · +{t} · {a}', uk: '{n} записів · +{t} · {a}' },
  removeLast: { en: 'Remove last', ru: 'Удалить последний', uk: 'Видалити останній' },
  confirmRemoveLast: { en: 'Remove the last row and take its time back?', ru: 'Удалить последнюю запись и отнять её время?', uk: 'Видалити останній запис і відняти його час?' },
  clearHistory: { en: 'Clear history', ru: 'Очистить историю', uk: 'Очистити історію' },
  confirmClearHistory: { en: 'Clear the whole journal? Timer time is not changed; processed donations are not counted again.', ru: 'Очистить весь журнал? Время таймера не меняется, обработанные донаты не засчитаются повторно.', uk: 'Очистити весь журнал? Час таймера не змінюється, оброблені донати не зарахуються повторно.' },
  clearWidgets: { en: 'Reset widget stats', ru: 'Очистить виджеты', uk: 'Очистити віджети' },
  confirmClearWidgets: { en: 'Reset Top-6, totals and last donation in widgets? The journal stays; widgets will only count new donations.', ru: 'Сбросить Top-6, сумму и последний донат в виджетах? Журнал останется, виджеты будут учитывать только новые донаты.', uk: 'Скинути Top-6, суму й останній донат у віджетах? Журнал залишиться, віджети враховуватимуть лише нові донати.' },
  widgetsCleared: { en: '{n} rows hidden from widgets', ru: 'Скрыто из виджетов: {n}', uk: 'Приховано з віджетів: {n}' },
  srcManualTime: { en: 'manual time', ru: 'вручную, время', uk: 'вручну, час' },
  srcManualAmount: { en: 'manual', ru: 'вручную', uk: 'вручну' },

  secWidgets: { en: 'OBS widgets', ru: 'Виджеты для OBS', uk: 'Віджети для OBS' },
  widgetsHint: { en: 'Add as a Browser source in OBS. Add ?sound=0 to mute a copy of the bonus widget.', ru: 'Добавьте как источник «Браузер» в OBS. Добавьте ?sound=0, чтобы заглушить копию виджета бонусного курса.', uk: 'Додайте як джерело «Браузер» в OBS. Додайте ?sound=0, щоб заглушити копію віджета бонусного курсу.' },
  copy: { en: 'Copy', ru: 'Копировать', uk: 'Копіювати' },
  copied: { en: 'Copied', ru: 'Скопировано', uk: 'Скопійовано' },
  open: { en: 'Open', ru: 'Открыть', uk: 'Відкрити' },
  w_timer_new: { en: 'Timer', ru: 'Таймер', uk: 'Таймер' },
  w_timer_marathon_block: { en: 'Timer — marathon block', ru: 'Таймер — блок марафона', uk: 'Таймер — блок марафону' },
  w_marathon_gold_small_v2: { en: 'Marathon gold (compact)', ru: 'Марафон, золотой (компакт)', uk: 'Марафон, золотий (компакт)' },
  w_top5_marathon_inline: { en: 'Top-6 line', ru: 'Top-6 строкой', uk: 'Top-6 рядком' },
  w_top5_marathon_block: { en: 'Top-6 block', ru: 'Top-6 блоком', uk: 'Top-6 блоком' },
  w_donation_goal: { en: 'Donation goal', ru: 'Донат-гол', uk: 'Донат-гол' },
  w_bonus_rate: { en: 'Bonus rate (with sounds)', ru: 'Бонусный курс (со звуком)', uk: 'Бонусний курс (зі звуком)' },
  w_clock_datetime_inline: { en: 'Date and time', ru: 'Дата и время', uk: 'Дата й час' },
  w_webcam_frame: { en: 'Webcam frame', ru: 'Рамка вебки', uk: 'Рамка вебки' },

  err_unauthorized: { en: 'Access denied — reopen the window', ru: 'Нет доступа — переоткройте окно', uk: 'Немає доступу — перевідкрийте вікно' },
  err_timerZero: { en: 'Set a time greater than zero first', ru: 'Сначала задайте время больше нуля', uk: 'Спершу задайте час більший за нуль' },
  err_rateZero: { en: 'Rate must be greater than zero', ru: 'Курс должен быть больше нуля', uk: 'Курс має бути більшим за нуль' },
  err_blinking: { en: 'Wait for the blink to end', ru: 'Дождитесь окончания мигания', uk: 'Дочекайтеся кінця блимання' },
  err_notRunning: { en: 'The timer is not running', ru: 'Таймер не запущен', uk: 'Таймер не запущено' },
  err_invalidTime: { en: 'Enter a valid time', ru: 'Введите корректное время', uk: 'Введіть коректний час' },
  err_timeAndName: { en: 'Enter time and nickname', ru: 'Введите время и никнейм', uk: 'Введіть час і нікнейм' },
  err_amountAndName: { en: 'Enter an amount above zero and a nickname', ru: 'Введите сумму больше нуля и никнейм', uk: 'Введіть суму більшу за нуль і нікнейм' },
  err_journalEmpty: { en: 'The journal is empty', ru: 'Журнал пуст', uk: 'Журнал порожній' },
  err_bonusErrPercent: { en: 'Percent must be 0–500', ru: 'Процент от 0 до 500', uk: 'Відсоток від 0 до 500' },
  err_bonusErrDuration: { en: 'Duration must be at least 1 minute', ru: 'Длительность не меньше 1 минуты', uk: 'Тривалість не менше 1 хвилини' },
  err_bonusErrRange: { en: '"From" minutes exceed "to"', ru: 'Минуты «от» больше, чем «до»', uk: 'Хвилини «від» більші, ніж «до»' },
  err_bonusErrCooldown: { en: 'Cooldown cannot be negative', ru: 'Кулдаун не меньше 0', uk: 'Кулдаун не менше 0' },
  err_bonusErrAmounts: { en: 'Amounts cannot be negative', ru: 'Суммы не меньше 0', uk: 'Суми не менше 0' },
  err_bonusCannotOpen: { en: 'Enable bonus windows, set a benefit above 0 and save', ru: 'Включите акцию, задайте выгоду больше 0 и сохраните', uk: 'Увімкніть акцію, задайте вигоду більшу за 0 і збережіть' },
  err_bonusAlreadyLive: { en: 'A window is already live', ru: 'Акция уже идёт', uk: 'Акція вже триває' },
  err_network: { en: 'StreamKit+ is not responding', ru: 'StreamKit+ не отвечает', uk: 'StreamKit+ не відповідає' },
  err_unknown: { en: 'Action failed', ru: 'Действие не выполнено', uk: 'Дію не виконано' },
};

/** Active language. */
let lang: UiLang = 'en';

/**
 * Sets the active language (unknown values fall back to English).
 * @param next Language code from StreamKit+.
 * @example setLang('ru');
 */
export const setLang = (next: string) => {
  lang = next === 'ru' || next === 'uk' ? next : 'en';
  document.documentElement.lang = lang;
};

/**
 * Translates a key and fills `{name}` placeholders.
 * @param key Translation key.
 * @param vars Placeholder values.
 * @returns Text in the active language (the key itself when missing).
 * @example t('bonusLive', { t: '04:59', p: 50 });
 */
export const t = (key: string, vars: Record<string, string | number> = {}) => {
  const entry = strings[key];
  const text = entry ? entry[lang] || entry.en : key;
  return text.replace(/\{(\w+)\}/g, (_, name: string) => String(vars[name] ?? ''));
};

/**
 * Whether a translation exists.
 * @param key Translation key.
 * @returns True when defined.
 * @example has('err_timerZero'); // true
 */
export const has = (key: string) => key in strings;
