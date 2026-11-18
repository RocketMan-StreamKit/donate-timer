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

  // Header
  statusRunning: { en: 'Running', ru: 'Идёт', uk: 'Йде' },
  statusPaused: { en: 'Paused', ru: 'На паузе', uk: 'На паузі' },
  statusStopped: { en: 'Stopped', ru: 'Остановлен', uk: 'Зупинено' },
  statusBlinking: { en: 'Time is up', ru: 'Время вышло', uk: 'Час вийшов' },
  blinkInfo: { en: 'Blink ends in {n} s. Donations received now ({b}) will be added after it.', ru: 'Мигание закончится через {n} с. Донаты, пришедшие сейчас ({b}), добавятся после него.', uk: 'Блимання закінчиться через {n} с. Донати, що надійшли зараз ({b}), додадуться після нього.' },
  start: { en: 'Start', ru: 'Старт', uk: 'Старт' },
  pause: { en: 'Pause', ru: 'Пауза', uk: 'Пауза' },
  resume: { en: 'Resume', ru: 'Продолжить', uk: 'Продовжити' },
  reset: { en: 'Reset', ru: 'Сброс', uk: 'Скинути' },
  confirmResetTitle: { en: 'Reset the timer?', ru: 'Сбросить таймер?', uk: 'Скинути таймер?' },
  confirmReset: { en: 'The timer stops and returns to the initial time ({t}). The journal is kept.', ru: 'Таймер остановится и вернётся к начальному времени ({t}). Журнал сохранится.', uk: 'Таймер зупиниться й повернеться до початкового часу ({t}). Журнал збережеться.' },
  headerRate: { en: 'Rate', ru: 'Курс', uk: 'Курс' },
  headerBonusLive: { en: 'Bonus +{p}% · {t}', ru: 'Бонус +{p}% · {t}', uk: 'Бонус +{p}% · {t}' },

  // Tabs
  tabControl: { en: 'Control', ru: 'Пульт', uk: 'Пульт' },
  tabSetup: { en: 'Timer and rate', ru: 'Таймер и курс', uk: 'Таймер і курс' },
  tabMarathon: { en: 'Marathon and goals', ru: 'Марафон и цели', uk: 'Марафон і цілі' },
  tabBonus: { en: 'Bonus rate', ru: 'Бонусный курс', uk: 'Бонусний курс' },
  tabWidgets: { en: 'OBS widgets', ru: 'Виджеты OBS', uk: 'Віджети OBS' },

  // Onboarding
  onbTitle: { en: 'Getting started', ru: 'С чего начать', uk: 'З чого почати' },
  onbText: { en: 'Each donation from your StreamKit+ donation platforms adds time to the timer. Four steps to launch:', ru: 'Каждый донат с подключённых в StreamKit+ платформ добавляет время к таймеру. Четыре шага до запуска:', uk: 'Кожен донат із підключених у StreamKit+ платформ додає час до таймера. Чотири кроки до запуску:' },
  onbRate: { en: 'Set how much time a donation buys', ru: 'Задайте, сколько времени покупает донат', uk: 'Задайте, скільки часу купує донат' },
  onbTime: { en: 'Set the starting time', ru: 'Задайте стартовое время', uk: 'Задайте стартовий час' },
  onbWidgets: { en: 'Add a widget to OBS', ru: 'Добавьте виджет в OBS', uk: 'Додайте віджет в OBS' },
  onbStart: { en: 'Press Start when the stream begins', ru: 'Нажмите «Старт», когда начнётся стрим', uk: 'Натисніть «Старт», коли почнеться стрім' },
  onbGo: { en: 'Open', ru: 'Открыть', uk: 'Відкрити' },
  onbHide: { en: 'Hide', ru: 'Скрыть', uk: 'Сховати' },
  onbShow: { en: 'Show the getting started guide', ru: 'Показать подсказку «С чего начать»', uk: 'Показати підказку «З чого почати»' },

  // Overview
  overviewTitle: { en: 'Summary', ru: 'Сводка', uk: 'Зведення' },
  ovNet: { en: 'Net for the marathon', ru: 'Чистыми за марафон', uk: 'Чистими за марафон' },
  ovDonations: { en: 'Donations', ru: 'Донатов', uk: 'Донатів' },
  ovAdded: { en: 'Time added', ru: 'Добавлено времени', uk: 'Додано часу' },
  ovOnAir: { en: 'On air', ru: 'В эфире', uk: 'В ефірі' },
  ovGoal: { en: 'Donation goal', ru: 'Донат-гол', uk: 'Донат-гол' },
  ovGoalOff: { en: 'off', ru: 'выключен', uk: 'вимкнено' },
  ovBonus: { en: 'Bonus rate', ru: 'Бонусный курс', uk: 'Бонусний курс' },

  // Manual
  manualTitle: { en: 'Change time manually', ru: 'Изменить время вручную', uk: 'Змінити час вручну' },
  manualDesc: { en: 'For corrections and donations that came outside StreamKit+.', ru: 'Для корректировок и донатов, пришедших мимо StreamKit+.', uk: 'Для коригувань і донатів, що надійшли повз StreamKit+.' },
  segQuick: { en: 'Quick', ru: 'Быстро', uk: 'Швидко' },
  segCustom: { en: 'Any time', ru: 'Любое время', uk: 'Будь-який час' },
  segNamed: { en: 'For nickname', ru: 'На ник', uk: 'На нік' },
  segExact: { en: 'Set exactly', ru: 'Задать точно', uk: 'Задати точно' },
  quickHint: { en: 'Adds or removes time silently: no journal row, no alert.', ru: 'Добавляет или убирает время тихо: без записи в журнал и алерта.', uk: 'Додає або прибирає час тихо: без запису в журнал і алерту.' },
  customHint: { en: 'Silent change by any amount of time.', ru: 'Тихое изменение на любое время.', uk: 'Тиха зміна на будь-який час.' },
  namedHint: { en: 'Adds time for a viewer: shows an alert and appears in the journal and Top-6, without money.', ru: 'Добавляет время от зрителя: покажет алерт и попадёт в журнал и Top-6, без суммы.', uk: 'Додає час від глядача: покаже алерт і потрапить у журнал і Top-6, без суми.' },
  donationTitle: { en: 'Add a donation manually', ru: 'Добавить донат вручную', uk: 'Додати донат вручну' },
  addDonation: { en: 'Add donation', ru: 'Добавить донат', uk: 'Додати донат' },
  donationAdded: { en: 'Donation added', ru: 'Донат добавлен', uk: 'Донат додано' },
  nicknamePlaceholder: { en: 'e.g. Alex', ru: 'например, Alex', uk: 'наприклад, Alex' },
  currencyDefault: { en: 'main', ru: 'основная', uk: 'основна' },
  willConvert: { en: 'Converted to {c} at the StreamKit+ rate, then time is added by your rate.', ru: 'Будет пересчитан в {c} по курсу StreamKit+, затем время добавится по вашему курсу.', uk: 'Буде перераховано в {c} за курсом StreamKit+, потім час додасться за вашим курсом.' },
  err_currencyConvert: { en: 'No exchange rate for this currency', ru: 'Нет курса для этой валюты', uk: 'Немає курсу для цієї валюти' },
  donationHint: { en: 'Counts exactly like a real donation: rate, bonus rate, totals and goal.', ru: 'Считается как настоящий донат: курс, бонусный курс, суммы и цель.', uk: 'Рахується як справжній донат: курс, бонусний курс, суми й ціль.' },
  exactHint: { en: 'Replaces the remaining time on the timer.', ru: 'Заменяет оставшееся время на таймере.', uk: 'Замінює залишок часу на таймері.' },
  add: { en: 'Add', ru: 'Добавить', uk: 'Додати' },
  subtract: { en: 'Subtract', ru: 'Отнять', uk: 'Відняти' },
  apply: { en: 'Apply', ru: 'Применить', uk: 'Застосувати' },
  nickname: { en: 'Viewer nickname', ru: 'Ник зрителя', uk: 'Нік глядача' },
  amount: { en: 'Amount', ru: 'Сумма', uk: 'Сума' },
  willAdd: { en: 'Will add {t}', ru: 'Добавит {t}', uk: 'Додасть {t}' },
  hh: { en: 'h', ru: 'ч', uk: 'год' },
  mm: { en: 'min', ru: 'мин', uk: 'хв' },
  ss: { en: 's', ru: 'с', uk: 'с' },
  timeApplied: { en: 'Time changed', ru: 'Время изменено', uk: 'Час змінено' },

  // Journal
  journalTitle: { en: 'Donation journal', ru: 'Журнал донатов', uk: 'Журнал донатів' },
  journalEmpty: { en: 'Donations will appear here as soon as they arrive.', ru: 'Донаты появятся здесь, как только придут.', uk: 'Донати зʼявляться тут, щойно надійдуть.' },
  journalSummary: { en: '{n} rows · +{t} · {a}', ru: '{n} записей · +{t} · {a}', uk: '{n} записів · +{t} · {a}' },
  removeLast: { en: 'Undo last', ru: 'Отменить последний', uk: 'Скасувати останній' },
  confirmRemoveLastTitle: { en: 'Undo the last row?', ru: 'Отменить последнюю запись?', uk: 'Скасувати останній запис?' },
  confirmRemoveLast: { en: '{name}: the row is removed and {t} is taken off the timer.', ru: '{name}: запись удалится, а с таймера снимется {t}.', uk: '{name}: запис видалиться, а з таймера зніметься {t}.' },
  more: { en: 'More', ru: 'Ещё', uk: 'Ще' },
  clearHistory: { en: 'Clear journal', ru: 'Очистить журнал', uk: 'Очистити журнал' },
  confirmClearHistoryTitle: { en: 'Clear the journal?', ru: 'Очистить журнал?', uk: 'Очистити журнал?' },
  confirmClearHistory: { en: 'All rows are deleted. Timer time does not change; donations already counted will not be counted again.', ru: 'Все записи удалятся. Время таймера не изменится, уже учтённые донаты повторно не засчитаются.', uk: 'Усі записи видаляться. Час таймера не зміниться, вже враховані донати повторно не зарахуються.' },
  clearWidgets: { en: 'Reset widget statistics', ru: 'Обнулить статистику в виджетах', uk: 'Обнулити статистику у віджетах' },
  confirmClearWidgetsTitle: { en: 'Reset widget statistics?', ru: 'Обнулить статистику в виджетах?', uk: 'Обнулити статистику у віджетах?' },
  confirmClearWidgets: { en: 'Top-6, total and last donation in widgets start from zero. The journal here is kept.', ru: 'Top-6, сумма и последний донат в виджетах начнутся с нуля. Журнал здесь сохранится.', uk: 'Top-6, сума й останній донат у віджетах почнуться з нуля. Журнал тут збережеться.' },
  widgetsCleared: { en: '{n} older rows are hidden from widgets', ru: 'Скрыто из виджетов старых записей: {n}', uk: 'Приховано з віджетів старих записів: {n}' },
  srcManualTime: { en: 'added manually', ru: 'добавлено вручную', uk: 'додано вручну' },
  srcManualAmount: { en: 'manual donation', ru: 'донат вручную', uk: 'донат вручну' },

  // Settings card
  unsaved: { en: 'Unsaved changes', ru: 'Есть несохранённые изменения', uk: 'Є незбережені зміни' },
  save: { en: 'Save', ru: 'Сохранить', uk: 'Зберегти' },
  cancel: { en: 'Cancel', ru: 'Отмена', uk: 'Скасувати' },
  saved: { en: 'Saved', ru: 'Сохранено', uk: 'Збережено' },
  confirm: { en: 'Confirm', ru: 'Подтвердить', uk: 'Підтвердити' },
  now: { en: 'Now', ru: 'Сейчас', uk: 'Зараз' },
  clear: { en: 'Clear', ru: 'Очистить', uk: 'Очистити' },
  on: { en: 'On', ru: 'Вкл.', uk: 'Увімк.' },

  // Rate
  rateTitle: { en: 'Donation rate', ru: 'Курс доната', uk: 'Курс донату' },
  rateDesc: { en: 'How much time each donation adds.', ru: 'Сколько времени добавляет каждый донат.', uk: 'Скільки часу додає кожен донат.' },
  rateMode: { en: 'How to set the rate', ru: 'Как задать курс', uk: 'Як задати курс' },
  modeAmountPerSec: { en: 'Price of one second', ru: 'Цена одной секунды', uk: 'Ціна однієї секунди' },
  modeAmountPerSecHint: { en: 'e.g. 10 = every 10 {c} add 1 second', ru: 'например, 10 = каждые 10 {c} дают 1 секунду', uk: 'наприклад, 10 = кожні 10 {c} дають 1 секунду' },
  modeSecPerAmount: { en: 'Seconds for 1 {c}', ru: 'Секунд за 1 {c}', uk: 'Секунд за 1 {c}' },
  modeSecPerAmountHint: { en: 'e.g. 5 = every 1 {c} adds 5 seconds', ru: 'например, 5 = каждый 1 {c} даёт 5 секунд', uk: 'наприклад, 5 = кожен 1 {c} дає 5 секунд' },
  rateValueAmount: { en: '{c} per 1 second', ru: '{c} за 1 секунду', uk: '{c} за 1 секунду' },
  rateValueSec: { en: 'Seconds per 1 {c}', ru: 'Секунд за 1 {c}', uk: 'Секунд за 1 {c}' },
  ratePreview: { en: 'Preview', ru: 'Пример', uk: 'Приклад' },
  currency: { en: 'Currency', ru: 'Валюта', uk: 'Валюта' },
  currencyApp: { en: 'Same as StreamKit+ ({c})', ru: 'Как в StreamKit+ ({c})', uk: 'Як у StreamKit+ ({c})' },
  currencyHint: { en: 'Donations in other currencies are converted automatically. Totals, goal and bonus thresholds use this currency.', ru: 'Донаты в других валютах пересчитываются автоматически. Суммы, цель и пороги бонуса — в этой валюте.', uk: 'Донати в інших валютах перераховуються автоматично. Суми, ціль і пороги бонусу — у цій валюті.' },

  // Timer settings
  timerTitle: { en: 'Timer', ru: 'Таймер', uk: 'Таймер' },
  timerDesc: { en: 'Starting time and what happens when it runs out.', ru: 'Стартовое время и что происходит, когда оно заканчивается.', uk: 'Стартовий час і що відбувається, коли він закінчується.' },
  initialTime: { en: 'Starting time', ru: 'Стартовое время', uk: 'Стартовий час' },
  initialTimeHint: { en: 'The timer returns to it when you press Reset.', ru: 'К нему таймер возвращается по кнопке «Сброс».', uk: 'До нього таймер повертається кнопкою «Скинути».' },
  blinkSeconds: { en: '"Time is up" pause, seconds', ru: 'Пауза «время вышло», секунд', uk: 'Пауза «час вийшов», секунд' },
  blinkHint: { en: 'At zero the widgets blink this long. Donations during it are added afterwards and the timer restarts. 0 = no pause.', ru: 'На нуле виджеты мигают столько секунд. Донаты за это время добавятся после, и таймер запустится снова. 0 — без паузы.', uk: 'На нулі віджети блимають стільки секунд. Донати за цей час додадуться після, і таймер запуститься знову. 0 — без паузи.' },

  // Appearance
  lookTitle: { en: 'Widget look', ru: 'Вид виджетов', uk: 'Вигляд віджетів' },
  lookDesc: { en: 'Title, accent color and alert plates in OBS.', ru: 'Заголовок, цвет и плашки алертов в OBS.', uk: 'Заголовок, колір і плашки алертів в OBS.' },
  widgetTitle: { en: 'Widget title', ru: 'Заголовок в виджетах', uk: 'Заголовок у віджетах' },
  widgetTitleHint: { en: 'Shown above the timer, e.g. "Marathon 24/7".', ru: 'Показывается над таймером, например «Марафон 24/7».', uk: 'Показується над таймером, наприклад «Марафон 24/7».' },
  accent: { en: 'Accent color', ru: 'Акцентный цвет', uk: 'Акцентний колір' },
  accentRandom: { en: 'Random, changes every hour', ru: 'Случайный, меняется каждый час', uk: 'Випадковий, змінюється щогодини' },
  color_orange: { en: 'Orange', ru: 'Оранжевый', uk: 'Помаранчевий' },
  color_purple: { en: 'Purple', ru: 'Фиолетовый', uk: 'Фіолетовий' },
  color_green: { en: 'Green', ru: 'Зелёный', uk: 'Зелений' },
  color_blue: { en: 'Blue', ru: 'Голубой', uk: 'Блакитний' },
  color_red: { en: 'Red', ru: 'Красный', uk: 'Червоний' },
  color_pink: { en: 'Pink', ru: 'Розовый', uk: 'Рожевий' },
  color_yellow: { en: 'Yellow', ru: 'Жёлтый', uk: 'Жовтий' },
  color_lime: { en: 'Lime', ru: 'Лаймовый', uk: 'Лаймовий' },
  color_navy: { en: 'Indigo', ru: 'Синий', uk: 'Синій' },
  color_gray: { en: 'Gray', ru: 'Серый', uk: 'Сірий' },
  colorsEnabled: { en: 'Color the alert plate by amount', ru: 'Красить плашку алерта по сумме', uk: 'Фарбувати плашку алерту за сумою' },
  colorsHint: { en: 'Smaller donations get a black plate.', ru: 'Донаты меньше порогов получают чёрную плашку.', uk: 'Донати менші за пороги отримують чорну плашку.' },
  colorBlue: { en: 'Blue from', ru: 'Синяя от', uk: 'Синя від' },
  colorPurple: { en: 'Purple from', ru: 'Фиолетовая от', uk: 'Фіолетова від' },
  colorGreen: { en: 'Green from', ru: 'Зелёная от', uk: 'Зелена від' },
  colorRed: { en: 'Red from', ru: 'Красная от', uk: 'Червона від' },

  // Marathon
  marathonTitle: { en: 'Marathon', ru: 'Марафон', uk: 'Марафон' },
  marathonDesc: { en: 'Start moment for the on-air clock, totals and Top-6.', ru: 'Момент старта для счётчика эфира, сумм и Top-6.', uk: 'Момент старту для лічильника ефіру, сум і Top-6.' },
  marathonStart: { en: 'Marathon started', ru: 'Марафон начался', uk: 'Марафон почався' },
  marathonStartHint: { en: 'Empty: totals count the whole journal and the on-air clock shows 00:00:00.', ru: 'Пусто — суммы считаются по всему журналу, а эфир показывает 00:00:00.', uk: 'Порожньо — суми рахуються за весь журнал, а ефір показує 00:00:00.' },
  commission: { en: 'Platform commission, %', ru: 'Комиссия платформ, %', uk: 'Комісія платформ, %' },
  commissionHint: { en: 'Only used for the "net" figure below.', ru: 'Нужна только для суммы «чистыми» ниже.', uk: 'Потрібна лише для суми «чистими» нижче.' },
  gross: { en: 'Collected', ru: 'Собрано', uk: 'Зібрано' },
  net: { en: 'Net', ru: 'Чистыми', uk: 'Чистими' },
  donationsCount: { en: 'Donations', ru: 'Донатов', uk: 'Донатів' },

  // Goal
  goalTitle: { en: 'Donation goal', ru: 'Донат-гол', uk: 'Донат-гол' },
  goalDesc: { en: 'A progress bar toward an amount (widget "Donation goal").', ru: 'Полоса прогресса к сумме (виджет «Донат-гол»).', uk: 'Смуга прогресу до суми (віджет «Донат-гол»).' },
  goalName: { en: 'What we collect for', ru: 'На что собираем', uk: 'На що збираємо' },
  goalTarget: { en: 'Goal amount', ru: 'Сумма цели', uk: 'Сума цілі' },
  goalStart: { en: 'Already collected', ru: 'Уже собрано', uk: 'Вже зібрано' },
  goalStartHint: { en: 'Money collected before tracking began.', ru: 'Деньги, собранные до начала учёта.', uk: 'Гроші, зібрані до початку обліку.' },
  goalStartAt: { en: 'Count donations from', ru: 'Учитывать донаты с', uk: 'Враховувати донати з' },
  goalStartAtHint: { en: 'Filled in automatically when you enable the goal.', ru: 'Заполнится автоматически при включении цели.', uk: 'Заповниться автоматично під час увімкнення цілі.' },
  trackOpacity: { en: 'Bar background, %', ru: 'Фон полосы, %', uk: 'Фон смуги, %' },
  fillOpacity: { en: 'Bar fill, %', ru: 'Заливка полосы, %', uk: 'Заливка смуги, %' },
  goalProgress: { en: '{c} of {g} ({p}%)', ru: '{c} из {g} ({p}%)', uk: '{c} з {g} ({p}%)' },

  // Time goal
  tgTitle: { en: 'Marathon length goal', ru: 'Цель по длительности', uk: 'Ціль за тривалістю' },
  tgDesc: { en: 'Shows how much time viewers still need to donate to reach N hours of stream (in the "Top-6 block" widget).', ru: 'Показывает, сколько времени зрителям ещё нужно задонатить до N часов стрима (в виджете «Top-6 блоком»).', uk: 'Показує, скільки часу глядачам ще треба задонатити до N годин стріму (у віджеті «Top-6 блоком»).' },
  tgHours: { en: 'Goal, hours of stream', ru: 'Цель, часов стрима', uk: 'Ціль, годин стріму' },
  tgLabel: { en: 'Label', ru: 'Подпись', uk: 'Підпис' },
  tgLabelHint: { en: 'e.g. "Until 24 hours"', ru: 'например, «До 24 часов»', uk: 'наприклад, «До 24 годин»' },
  tgDone: { en: 'Text when reached', ru: 'Текст после достижения', uk: 'Текст після досягнення' },
  tgNow: { en: 'Widget shows', ru: 'В виджете сейчас', uk: 'У віджеті зараз' },
  tgNeedsStart: { en: 'Set the marathon start above for an exact result.', ru: 'Для точного расчёта задайте старт марафона выше.', uk: 'Для точного розрахунку задайте старт марафону вище.' },
  recalc: { en: 'Recalculate', ru: 'Пересчитать', uk: 'Перерахувати' },

  // Bonus
  bonusTitle: { en: 'Bonus rate', ru: 'Бонусный курс', uk: 'Бонусний курс' },
  bonusDesc: { en: 'Short "happy hours": for a few minutes each donation adds more time. A countdown widget with a bomb sound runs in OBS.', ru: 'Короткие «счастливые минуты»: несколько минут каждый донат добавляет больше времени. В OBS идёт отсчёт со звуком бомбы.', uk: 'Короткі «щасливі хвилини»: кілька хвилин кожен донат додає більше часу. В OBS іде відлік зі звуком бомби.' },
  bonusSettingsTitle: { en: 'Bonus settings', ru: 'Настройки акции', uk: 'Налаштування акції' },
  bonusStatusTitle: { en: 'Status', ru: 'Состояние', uk: 'Стан' },
  bonusOff: { en: 'Turned off', ru: 'Выключен', uk: 'Вимкнено' },
  bonusIdle: { en: 'Waiting for a trigger', ru: 'Ждёт условия запуска', uk: 'Чекає умови запуску' },
  bonusLive: { en: 'Bonus is live: +{p}%, {t} left', ru: 'Акция идёт: +{p}%, осталось {t}', uk: 'Акція йде: +{p}%, залишилось {t}' },
  bonusCooldownLeft: { en: 'Cooldown: {t} left', ru: 'Перерыв: осталось {t}', uk: 'Перерва: залишилось {t}' },
  bonusBank: { en: 'Bank', ru: 'Копилка', uk: 'Скарбничка' },
  bonusStart: { en: 'Start now', ru: 'Запустить сейчас', uk: 'Запустити зараз' },
  bonusStop: { en: 'Stop', ru: 'Остановить', uk: 'Зупинити' },
  bonusResetBank: { en: 'Empty bank', ru: 'Обнулить копилку', uk: 'Обнулити скарбничку' },
  bonusResetCooldown: { en: 'Skip cooldown', ru: 'Пропустить перерыв', uk: 'Пропустити перерву' },
  bonusGroupBenefit: { en: 'Benefit and length', ru: 'Выгода и длительность', uk: 'Вигода й тривалість' },
  bonusGroupTriggers: { en: 'When it starts by itself', ru: 'Когда запускается сама', uk: 'Коли запускається сама' },
  bonusGroupTriggersHint: { en: 'Any one condition is enough. Without conditions the bonus starts only by the button.', ru: 'Достаточно любого условия. Без условий акция запускается только кнопкой.', uk: 'Достатньо будь-якої умови. Без умов акція запускається лише кнопкою.' },
  bonusGroupObs: { en: 'Widget and sounds', ru: 'Виджет и звуки', uk: 'Віджет і звуки' },
  bonusEnabled: { en: 'Bonus rate enabled', ru: 'Бонусный курс включён', uk: 'Бонусний курс увімкнено' },
  bonusPercent: { en: 'Extra time for viewers, %', ru: 'Дополнительное время зрителям, %', uk: 'Додатковий час глядачам, %' },
  bonusPercentHint: { en: '100% = each donation adds twice as much time.', ru: '100% — каждый донат добавляет вдвое больше времени.', uk: '100% — кожен донат додає вдвічі більше часу.' },
  bonusDurMin: { en: 'Lasts from, min', ru: 'Длится от, мин', uk: 'Триває від, хв' },
  bonusDurMax: { en: 'Lasts up to, min', ru: 'Длится до, мин', uk: 'Триває до, хв' },
  bonusDurHint: { en: 'Length is picked at random in this range.', ru: 'Длительность выбирается случайно в этом диапазоне.', uk: 'Тривалість обирається випадково в цьому діапазоні.' },
  bonusCooldown: { en: 'Break after it, min', ru: 'Перерыв после, мин', uk: 'Перерва після, хв' },
  bonusBankStep: { en: 'When donations add up to', ru: 'Когда донаты наберут', uk: 'Коли донати наберуть' },
  bonusBankStepHint: { en: 'Donations fill a bank; the bonus starts when it reaches this amount. 0 = off.', ru: 'Донаты копятся в копилку; акция стартует, когда она наберёт эту сумму. 0 — выкл.', uk: 'Донати накопичуються у скарбничку; акція стартує, коли вона набере цю суму. 0 — вимк.' },
  bonusWhale: { en: 'On one donation from', ru: 'От одного доната на', uk: 'Від одного донату на' },
  bonusWhaleHint: { en: '0 = off.', ru: '0 — выкл.', uk: '0 — вимк.' },
  bonusOnGoal: { en: 'Once when the donation goal is reached', ru: 'Один раз при достижении донат-гола', uk: 'Один раз після досягнення донат-голу' },
  bonusShowObs: { en: 'Show the widget in OBS while waiting (preview)', ru: 'Показывать виджет в OBS в ожидании (превью)', uk: 'Показувати віджет в OBS в очікуванні (превʼю)' },
  bonusTitle1: { en: 'Widget title, line 1', ru: 'Заголовок, строка 1', uk: 'Заголовок, рядок 1' },
  bonusTitle2: { en: 'Line 2', ru: 'Строка 2', uk: 'Рядок 2' },
  bonusBomb: { en: 'Bomb sound for the last 45 seconds', ru: 'Звук бомбы на последних 45 секундах', uk: 'Звук бомби на останніх 45 секундах' },
  bonusOpenSound: { en: 'Start sound (link to mp3/ogg, optional)', ru: 'Звук старта (ссылка на mp3/ogg, необязательно)', uk: 'Звук старту (посилання на mp3/ogg, необовʼязково)' },
  bonusVolume: { en: 'Volume, %', ru: 'Громкость, %', uk: 'Гучність, %' },
  bonusSoundHint: { en: 'Sounds play in the "Bonus rate" widget, so OBS captures them.', ru: 'Звуки играют в виджете «Бонусный курс», поэтому их захватывает OBS.', uk: 'Звуки грають у віджеті «Бонусний курс», тому їх захоплює OBS.' },
  bonusOpenerNote: { en: 'The donation that starts the bonus is still counted at the normal rate.', ru: 'Донат, запустивший акцию, считается по обычному курсу.', uk: 'Донат, що запустив акцію, рахується за звичайним курсом.' },

  // Widgets
  widgetsTitle: { en: 'Widgets for OBS', ru: 'Виджеты для OBS', uk: 'Віджети для OBS' },
  widgetsDesc: { en: 'In OBS: Sources → + → Browser, paste the link. The background is transparent.', ru: 'В OBS: Источники → + → Браузер, вставьте ссылку. Фон прозрачный.', uk: 'В OBS: Джерела → + → Браузер, вставте посилання. Фон прозорий.' },
  copy: { en: 'Copy link', ru: 'Копировать ссылку', uk: 'Копіювати посилання' },
  copied: { en: 'Link copied', ru: 'Ссылка скопирована', uk: 'Посилання скопійовано' },
  open: { en: 'Open in browser', ru: 'Открыть в браузере', uk: 'Відкрити в браузері' },
  w_timer_new: { en: 'Timer', ru: 'Таймер', uk: 'Таймер' },
  wd_timer_new: { en: 'Large timer with title, rate and donation alerts.', ru: 'Крупный таймер с заголовком, курсом и алертами донатов.', uk: 'Великий таймер із заголовком, курсом і алертами донатів.' },
  w_timer_marathon_block: { en: 'Timer, marathon card', ru: 'Таймер, карточка марафона', uk: 'Таймер, картка марафону' },
  wd_timer_marathon_block: { en: 'Compact card: timer, rate, last donation and alerts.', ru: 'Компактная карточка: таймер, курс, последний донат и алерты.', uk: 'Компактна картка: таймер, курс, останній донат і алерти.' },
  w_marathon_gold_small_v2: { en: 'Marathon summary', ru: 'Итог марафона', uk: 'Підсумок марафону' },
  wd_marathon_gold_small_v2: { en: 'Timer, total collected and on-air time.', ru: 'Таймер, собранная сумма и время в эфире.', uk: 'Таймер, зібрана сума й час в ефірі.' },
  w_top5_marathon_inline: { en: 'Top-6, single line', ru: 'Top-6 в строку', uk: 'Top-6 у рядок' },
  wd_top5_marathon_inline: { en: 'Running line with top donors and their share.', ru: 'Бегущая строка с топ-донатерами и их долей.', uk: 'Рядок із топ-донатерами та їхньою часткою.' },
  w_top5_marathon_block: { en: 'Top-6, card', ru: 'Top-6 карточкой', uk: 'Top-6 карткою' },
  wd_top5_marathon_block: { en: 'Top donors, on-air time and the length goal.', ru: 'Топ донатеров, время в эфире и цель по длительности.', uk: 'Топ донатерів, час в ефірі та ціль за тривалістю.' },
  w_donation_goal: { en: 'Donation goal', ru: 'Донат-гол', uk: 'Донат-гол' },
  wd_donation_goal: { en: 'Progress bar toward the goal amount.', ru: 'Полоса прогресса к сумме цели.', uk: 'Смуга прогресу до суми цілі.' },
  w_bonus_rate: { en: 'Bonus rate', ru: 'Бонусный курс', uk: 'Бонусний курс' },
  wd_bonus_rate: { en: 'Bonus countdown. Plays sounds: add it once, or add &sound=0 to extra copies.', ru: 'Отсчёт акции. Играет звуки: добавьте один раз или допишите &sound=0 к копиям.', uk: 'Відлік акції. Грає звуки: додайте один раз або допишіть &sound=0 до копій.' },
  w_clock_datetime_inline: { en: 'Date and time', ru: 'Дата и время', uk: 'Дата й час' },
  wd_clock_datetime_inline: { en: 'Current date and clock in the marathon style.', ru: 'Текущие дата и часы в стиле марафона.', uk: 'Поточні дата й годинник у стилі марафону.' },
  w_webcam_frame: { en: 'Webcam frame', ru: 'Рамка вебки', uk: 'Рамка вебки' },
  wd_webcam_frame: { en: 'Frame that changes color as time runs low.', ru: 'Рамка, меняющая цвет, когда времени остаётся мало.', uk: 'Рамка, що змінює колір, коли часу лишається мало.' },

  // GTA 6 widgets
  gtaTitle: { en: 'GTA 6 theme', ru: 'Тема GTA 6', uk: 'Тема GTA 6' },
  gtaDesc: { en: 'Compact 480-px plates in the GTA 6 style: a timer with golden hour and critical mode, and the Top-6 in two layouts.', ru: 'Компактные плашки 480 px в стиле GTA 6: таймер с золотым часом и критическим режимом и Топ-6 в двух вариантах.', uk: 'Компактні плашки 480 px у стилі GTA 6: таймер із золотою годиною та критичним режимом і Топ-6 у двох варіантах.' },
  gtaGroupTimer: { en: 'Timer plate', ru: 'Плашка таймера', uk: 'Плашка таймера' },
  gtaPlateTitle: { en: 'Title on the left', ru: 'Название слева', uk: 'Назва зліва' },
  gtaPlateTitleHint: { en: 'Up to 3 lines; each new line is a new row on the plate.', ru: 'До 3 строк; каждая новая строка — отдельный ряд на плашке.', uk: 'До 3 рядків; кожен новий рядок — окремий ряд на плашці.' },
  gtaGroupStages: { en: 'Time running out', ru: 'Время на исходе', uk: 'Час спливає' },
  gtaStagesHint: {
    en: 'The plate changes color when less time is left than set: yellow → orange → red with a fast pulse. 0 = stage off.',
    ru: 'Плашка меняет цвет, когда осталось меньше указанного: жёлтый → оранжевый → красный с быстрой пульсацией. 0 — ступень выключена.',
    uk: 'Плашка змінює колір, коли лишилося менше вказаного: жовтий → помаранчевий → червоний зі швидкою пульсацією. 0 — щабель вимкнено.',
  },
  gtaStageWarn: { en: 'Yellow, below', ru: 'Жёлтый, меньше', uk: 'Жовтий, менше' },
  gtaStageDanger: { en: 'Orange, below', ru: 'Оранжевый, меньше', uk: 'Помаранчевий, менше' },
  gtaStageCritical: { en: 'Red (critical), below', ru: 'Красный (критический), меньше', uk: 'Червоний (критичний), менше' },
  gtaGroupTop: { en: 'Top-6 one by one', ru: 'Топ-6 по очереди', uk: 'Топ-6 по черзі' },
  gtaGroupTopHint: { en: 'Each donor stays on screen, then cross-fades to the next one in a loop.', ru: 'Каждый донатер показывается заданное время, затем плавно сменяется следующим, по кругу.', uk: 'Кожен донатер показується заданий час, потім плавно змінюється наступним, по колу.' },
  gtaGroupLook: { en: 'Background opacity', ru: 'Непрозрачность фона', uk: 'Непрозорість фону' },
  gtaBgHint: { en: 'Dark fill behind each widget. 0% = fully transparent, 100% = solid.', ru: 'Тёмная подложка каждого виджета. 0% — полностью прозрачная, 100% — сплошная.', uk: 'Темна підкладка кожного віджета. 0% — повністю прозора, 100% — суцільна.' },
  gtaSlide: { en: 'Show each for', ru: 'Показ одного', uk: 'Показ одного' },
  gtaFade: { en: 'Transition', ru: 'Смена', uk: 'Зміна' },
  w_gta_timer: { en: 'GTA 6 timer', ru: 'Таймер GTA 6', uk: 'Таймер GTA 6' },
  wd_gta_timer: { en: 'Timer plate: golden hour during the bonus rate, critical mode, donation toasts.', ru: 'Плашка таймера: золотой час во время бонусного курса, критический режим, всплывающие донаты.', uk: 'Плашка таймера: золота година під час бонусного курсу, критичний режим, спливаючі донати.' },
  ws_gta_timer: { en: 'OBS source: 520 × 120', ru: 'Источник OBS: 520 × 120', uk: 'Джерело OBS: 520 × 120' },
  w_gta_top_rotate: { en: 'GTA 6 Top-6, one by one', ru: 'Топ-6 GTA 6 по очереди', uk: 'Топ-6 GTA 6 по черзі' },
  wd_gta_top_rotate: { en: 'One donor at a time in a loop; timings are set below.', ru: 'Один донатер за раз, по кругу; время — в настройках ниже.', uk: 'Один донатер за раз, по колу; час — у налаштуваннях нижче.' },
  ws_gta_top_rotate: { en: 'OBS source: 480 × 37', ru: 'Источник OBS: 480 × 37', uk: 'Джерело OBS: 480 × 37' },
  w_gta_top_list: { en: 'GTA 6 Top-6, list', ru: 'Топ-6 GTA 6 списком', uk: 'Топ-6 GTA 6 списком' },
  wd_gta_top_list: { en: 'All six places at once, top to bottom.', ru: 'Все шесть мест сразу, сверху вниз.', uk: 'Усі шість місць одразу, згори вниз.' },
  ws_gta_top_list: { en: 'OBS source: 480 × 262', ru: 'Источник OBS: 480 × 262', uk: 'Джерело OBS: 480 × 262' },

  // Errors
  err_unauthorized: { en: 'Access denied — reopen the window', ru: 'Нет доступа — переоткройте окно', uk: 'Немає доступу — перевідкрийте вікно' },
  err_timerZero: { en: 'Set a time greater than zero first', ru: 'Сначала задайте время больше нуля', uk: 'Спершу задайте час більший за нуль' },
  err_rateZero: { en: 'Rate must be greater than zero', ru: 'Курс должен быть больше нуля', uk: 'Курс має бути більшим за нуль' },
  err_blinking: { en: 'Wait for the "time is up" pause to end', ru: 'Дождитесь окончания паузы «время вышло»', uk: 'Дочекайтеся кінця паузи «час вийшов»' },
  err_notRunning: { en: 'The timer is not running', ru: 'Таймер не запущен', uk: 'Таймер не запущено' },
  err_invalidTime: { en: 'Enter a time', ru: 'Введите время', uk: 'Введіть час' },
  err_timeAndName: { en: 'Enter time and nickname', ru: 'Введите время и ник', uk: 'Введіть час і нік' },
  err_amountAndName: { en: 'Enter an amount above zero and a nickname', ru: 'Введите сумму больше нуля и ник', uk: 'Введіть суму більшу за нуль і нік' },
  err_journalEmpty: { en: 'The journal is empty', ru: 'Журнал пуст', uk: 'Журнал порожній' },
  err_bonusErrPercent: { en: 'Extra time must be 0–500%', ru: 'Дополнительное время — от 0 до 500%', uk: 'Додатковий час — від 0 до 500%' },
  err_bonusErrDuration: { en: 'Length must be at least 1 minute', ru: 'Длительность не меньше 1 минуты', uk: 'Тривалість не менше 1 хвилини' },
  err_bonusErrRange: { en: '"From" is greater than "to"', ru: '«От» больше, чем «до»', uk: '«Від» більше, ніж «до»' },
  err_bonusErrCooldown: { en: 'Break cannot be negative', ru: 'Перерыв не может быть отрицательным', uk: 'Перерва не може бути відʼємною' },
  err_bonusErrAmounts: { en: 'Amounts cannot be negative', ru: 'Суммы не могут быть отрицательными', uk: 'Суми не можуть бути відʼємними' },
  err_bonusCannotOpen: { en: 'Enable the bonus rate, set extra time above 0 and save', ru: 'Включите бонусный курс, задайте дополнительное время больше 0 и сохраните', uk: 'Увімкніть бонусний курс, задайте додатковий час більший за 0 і збережіть' },
  err_bonusAlreadyLive: { en: 'The bonus is already live', ru: 'Акция уже идёт', uk: 'Акція вже йде' },
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
