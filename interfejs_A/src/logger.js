// Moduł rejestrowania zdarzeń do badania — format i słownik: PUN_slownik_zmiennych.csv (plik PUN_zdarzenia).
//
// • Jeden plik na uczestnika i scenariusz: zdarzenia/PUN_zdarzenia_I06_P{numer}_A_S{1–3}.csv
//   (UTF-8 z BOM, separator średnik). Kolejność plików: P01_S1, P01_S2, P01_S3, P02_S1, …
// • Przy wczytaniu kiosku serwer Vite sprawdza folder zdarzenia/ i podaje następny plik (startSession()).
//   Plik powstaje dopiero przy starcie scenariusza — odświeżenie strony bez scenariusza nie zużywa numeru.
//   Wiersze sprzed startu (sesja, ekran startowy, ekran po poprzednim scenariuszu) trafiają do pliku
//   scenariusza, który zaczyna się po nich.
// • Scenariusz zaczyna się:
//     – klawiszem prowadzącego 1, 2 lub 3 (start następnego scenariusza; kiosk wraca na ekran startowy), albo
//     – pierwszym dotknięciem ekranu startowego, gdy żaden scenariusz nie trwa.
//   Kończy się potwierdzeniem zamówienia (sukces = 1) albo klawiszem 0 prowadzącego (przerwanie, sukces = 0).
// • Plik zapisuje się (dopisuje nowe wiersze) przy końcu scenariusza, przy anulowaniu zamówienia przez
//   uczestnika („Zacznij od nowa”, upływ limitu czasu) i przy zamknięciu strony.

import { useEffect, useRef } from 'react';
import { useIsPresent } from 'framer-motion';

const COLUMNS = [
  'interfejs', 'uczestnik', 'wersja', 'kolejnosc', 'scenariusz', 'czas_lokalny', 'czas_epoch_ms', 'czas_ms',
  'zdarzenie', 'ekran', 'element', 'etykieta', 'x', 'y', 'szer', 'wys', 'trafienie', 'aoi', 'sukces', 'opis',
];

// Po tylu ms od wejścia na ekran mierzymy położenie ekranu i AOI (po animacji wejścia)
const SETTLE_MS = 1000;

let enabled = false; // rejestrujemy dopiero po sprawdzeniu folderu zdarzenia/ przez serwer
let meta = null;
let slot = null; // następny (albo bieżący) plik: { uczestnik, scenariusz } — przewidywany, serwer go potwierdza
let file = null; // plik bieżącego scenariusza: { plik, uczestnik, kolejnosc, scenariusz }
let reserving = null; // Promise<file | null> — tworzenie pliku na serwerze
let fatalHandler = null;

let rows = []; // wiersze jeszcze niezapisane do pliku
let scenario = ''; // bieżący scenariusz
let active = false; // czy trwa scenariusz
let t0 = 0;

let base = { name: 'start', opis: '', el: null }; // ekran główny
const overlays = []; // okna nad ekranem: produkt, zestaw_*, bezczynnosc
let lastEkran = '';

const tracked = new Map(); // AOI zgłoszone na bieżącym ekranie: element DOM → { aoi, element }
let firstSeen = new WeakMap(); // kiedy element AOI pojawił się na bieżącym ekranie
let settle = null; // { timer, scope } — ekran czeka na koniec animacji wejścia
const pending = new Set(); // wiersze czekające na pomiar położenia
let resetHandler = null;

// ---------- pomocnicze ----------
const pad = (n, w = 2) => String(n).padStart(w, '0');
const localTime = (ms) => {
  const d = new Date(ms);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}.${pad(d.getMilliseconds(), 3)}`;
};

// Emoji i symbole-ikonki (🍔 ✓ ✎ ⌄ ♿ ← →) nie są „widocznym tekstem” — usuwamy je z etykiet (® i © zostają)
const ICONS = /[\u{1F000}-\u{1FAFF}\u{2190}-\u{21FF}\u{2300}-\u{23FF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}\u{200D}\u{20E3}]/gu;
const clean = (s) => String(s ?? '').replace(ICONS, ' ').replace(/\s+/g, ' ').trim();

export const slug = (s) =>
  clean(s).normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ł/g, 'l').replace(/Ł/g, 'L')
    .toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 40);

const labelOf = (el) => clean(el.getAttribute('aria-label') || el.dataset.label || el.innerText).slice(0, 100);
// Słownik: element = data-log, a przy jego braku id
const idOf = (el) => el.dataset.log || el.id || slug(labelOf(el)) || el.tagName.toLowerCase();

const rectOf = (el) => {
  if (!el?.isConnected) return {};
  const r = el.getBoundingClientRect();
  return { x: Math.round(r.left), y: Math.round(r.top), szer: Math.round(r.width), wys: Math.round(r.height) };
};
const stageEl = () => document.querySelector('.stage-box');
const deref = (el) => (el && 'current' in el ? el.current : el);

const top = () => overlays[overlays.length - 1] ?? base;

function push(fields, at = Date.now()) {
  if (!enabled) return {};
  const row = {
    ...meta,
    scenariusz: active ? scenario : '',
    czas_lokalny: localTime(at),
    czas_epoch_ms: at,
    czas_ms: active ? at - t0 : '',
    ekran: top().name,
    ...fields,
  };
  rows.push(row);
  return row;
}

function measureLater(row, el) {
  const job = { row, el };
  pending.add(job);
  setTimeout(() => {
    if (!pending.delete(job)) return;
    Object.assign(row, rectOf(deref(el)));
  }, SETTLE_MS);
}
const measureAllNow = () => {
  pending.forEach(({ row, el }) => Object.assign(row, rectOf(deref(el))));
  pending.clear();
};

// ---------- ekrany ----------
// Wejście na ekran kończy wszystkie AOI poprzedniego ekranu. AOI nowego ekranu zgłaszamy po animacji wejścia,
// z czasem ich pojawienia się (dla TTFF), tylko te, które nadal są widoczne (bez znikającej treści poprzedniego ekranu).
function logScreen(screen, force = false) {
  if (!enabled) return;
  const key = `${screen.name}|${screen.opis ?? ''}`;
  if (!force && key === lastEkran) return;
  lastEkran = key;
  completeSettle();
  tracked.clear();
  firstSeen = new WeakMap();

  const now = Date.now();
  const el = screen.el ? deref(screen.el) : stageEl();
  const row = push({ zdarzenie: 'ekran', ekran: screen.name, opis: screen.opis ?? '' }, now);
  // Położenie mierzymy po animacji wejścia (i po dopasowaniu skali kiosku do okna)
  Object.assign(row, rectOf(el));
  measureLater(row, screen.el ?? el);

  const scope = () => (screen.el ? deref(screen.el) : deref(screen.root)) ?? document.body;
  queueMicrotask(() => scope()?.querySelectorAll('[data-aoi]').forEach((a) => firstSeen.set(a, now)));
  settle = { scope, name: screen.name, timer: setTimeout(completeSettle, SETTLE_MS) };
}

function completeSettle() {
  if (!settle) return;
  const { scope, name, timer } = settle;
  clearTimeout(timer);
  settle = null;
  scope()?.querySelectorAll('[data-aoi]').forEach((el) => {
    if (tracked.has(el)) return;
    const at = firstSeen.get(el) ?? Date.now();
    reportAoi(el, at, true, '', name);
  });
  sortRows();
}

function reportAoi(el, at, measureNow, opis = '', ekran = top().name) {
  const info = { aoi: el.dataset.aoi, element: idOf(el) };
  tracked.set(el, info);
  const row = push({ zdarzenie: 'aoi', ekran, element: info.element, etykieta: labelOf(el), aoi: info.aoi, opis }, at);
  if (measureNow) Object.assign(row, rectOf(el));
  else measureLater(row, el);
}

const RANK = { sesja: 0, scenariusz_start: 1, ekran: 2, aoi: 3, scenariusz_koniec: 9 };
const rank = (r) => RANK[r.zdarzenie] ?? 5;
const sortRows = () => rows.sort((a, b) => a.czas_epoch_ms - b.czas_epoch_ms || rank(a) - rank(b));

export function setBaseScreen(name, opis = '', root = null) {
  base = { name, opis, root };
  if (overlays.length === 0) logScreen(base);
}

// Hook ekranu głównego. Zwraca ref, który trzeba podpiąć pod główny element ekranu (zakres AOI).
export function useBaseScreen(name, opis = '') {
  const ref = useRef(null);
  useEffect(() => { setBaseScreen(name, opis, ref); }, [name, opis]);
  return ref;
}

// Hook okna nad ekranem (okno produktu, kreator zestawu, okno bezczynności). `ref` = główny element okna.
export function useOverlayScreen(name, ref, opis = '') {
  const present = useIsPresent();
  const entry = useRef(null);

  useEffect(() => {
    // React StrictMode (tryb dev) montuje komponent dwa razy — zamknięcie odkładamy o jedno tyknięcie
    let e = entry.current;
    if (e?.closeTimer) {
      clearTimeout(e.closeTimer);
      e.closeTimer = null;
    } else {
      e = { name, opis, el: ref };
      entry.current = e;
      overlays.push(e);
      logScreen(e);
    }
    return () => {
      e.closeTimer = setTimeout(() => { e.closeTimer = null; closeOverlay(e); }, 0);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const e = entry.current;
    if (!e || (e.name === name && e.opis === opis)) return;
    e.name = name;
    e.opis = opis;
    if (top() === e) logScreen(e);
  }, [name, opis]);

  // Okno zaczyna znikać → od razu wracamy do ekranu pod spodem
  useEffect(() => {
    if (!present && entry.current) closeOverlay(entry.current);
  }, [present]);
}

function closeOverlay(e) {
  const i = overlays.indexOf(e);
  if (i === -1) return;
  const wasTop = i === overlays.length - 1;
  overlays.splice(i, 1);
  if (wasTop) logScreen(top());
}

// ---------- AOI w obrębie ekranu (bez zmiany ekranu) ----------
let scanTimer = null;
function scanAois() {
  scanTimer = null;
  if (!enabled) return;
  const scope = (settle ? settle.scope() : null) ?? deref(top().el ?? top().root);
  if (!scope) return;
  const now = Date.now();
  const inScope = new Set(scope.querySelectorAll('[data-aoi]'));
  if (settle) {
    // Ekran jeszcze wchodzi: zapamiętujemy tylko moment pojawienia się nowych AOI
    inScope.forEach((el) => { if (!firstSeen.has(el)) firstSeen.set(el, now); });
    return;
  }
  tracked.forEach((info, el) => {
    if (!inScope.has(el) || !el.isConnected) {
      tracked.delete(el);
      push({ zdarzenie: 'aoi_znika', element: info.element, aoi: info.aoi }, now);
    }
  });
  inScope.forEach((el) => { if (!tracked.has(el)) reportAoi(el, now, false); });
}
const observer = new MutationObserver(() => { if (!scanTimer) scanTimer = setTimeout(scanAois, 30); });
observer.observe(document.body, { childList: true, subtree: true });

// Zmiana położenia AOI (tryb dostępności, zmiana rozmiaru okna) → nowe wiersze aoi po zakończeniu animacji
export function refreshAois(opis) {
  if (!enabled) return;
  setTimeout(() => {
    completeSettle();
    tracked.forEach((info, el) => { if (el.isConnected) reportAoi(el, Date.now(), true, opis); });
  }, SETTLE_MS);
}
let resizeTimer = null;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => refreshAois(`okno=${window.innerWidth}x${window.innerHeight}`), 300);
});

// ---------- dotknięcia ----------
const INTERACTIVE = 'button, a, input, select, textarea, [role="button"]';

function onPointerDown(e) {
  if (!enabled) return;
  // Brak trwającego scenariusza + dotknięcie ekranu startowego → start kolejnego scenariusza
  if (!active && base.name === 'start' && overlays.length === 0) startScenario('start=dotkniecie');
  const el = e.target.closest?.(INTERACTIVE);
  const aoiEl = e.target.closest?.('[data-aoi]');
  const disabled = Boolean(el?.disabled || el?.getAttribute?.('aria-disabled') === 'true');
  push({
    zdarzenie: 'dotkniecie',
    element: el ? idOf(el) : 'kiosk',
    etykieta: el ? labelOf(el) : '',
    x: Math.round(e.clientX),
    y: Math.round(e.clientY),
    trafienie: el && !disabled ? 1 : 0,
    aoi: aoiEl?.dataset.aoi ?? '',
    opis: e.pointerType || 'touch',
  });
}

// ---------- scenariusze ----------
// S1 → S2 → S3 → następny uczestnik od S1 (ta sama reguła co na serwerze, serwer ma rozstrzygający głos)
const following = ({ uczestnik, scenariusz }) => {
  const p = Number(uczestnik.slice(1));
  const s = Number(scenariusz.slice(1));
  return s < 3 ? { uczestnik, scenariusz: `S${s + 1}` } : { uczestnik: `P${pad(p + 1)}`, scenariusz: 'S1' };
};

export function startScenario(opis = '') {
  if (!enabled) return;
  if (active) endScenario({ sukces: 0, opis: `przerwano=start_${following(slot).scenariusz}` });
  // AOI ekranu, który jeszcze kończy animację wejścia, należą do okresu przed scenariuszem —
  // zgłaszamy je teraz, zanim zmieni się numer scenariusza i t0 (inaczej dostałyby S{n} i ujemny czas_ms)
  completeSettle();
  scenario = slot.scenariusz;
  active = true;
  t0 = Date.now();
  push({ zdarzenie: 'scenariusz_start', ekran: '', opis }, t0);
  const job = requestFile(true)
    .then((info) => {
      const created = { plik: info.plik, uczestnik: info.uczestnik, kolejnosc: info.kolejnosc, scenariusz: info.scenariusz };
      console.info(`[zdarzenia] scenariusz ${info.scenariusz}: zdarzenia/${info.plik}`);
      if (reserving === job) {
        file = created;
        slot = { uczestnik: info.uczestnik, scenariusz: info.scenariusz };
        setMeta(info);
        scenario = info.scenariusz;
      }
      return created;
    })
    .catch((err) => {
      enabled = false;
      active = false;
      console.error('[zdarzenia] nie utworzono pliku scenariusza', err);
      fatalHandler?.(err);
      return null;
    });
  reserving = job;
  if (resetHandler && !(base.name === 'start' && overlays.length === 0)) {
    resetHandler(); // kiosk wraca na ekran startowy, ekran zaloguje się sam
  } else {
    logScreen(top(), true);
  }
}

// Koniec zadania: potwierdzenie (sukces = 1) albo przerwanie przez prowadzącego (sukces = 0). Zapisuje plik.
export function endScenario({ sukces, opis = '' }) {
  if (!active) return;
  completeSettle();
  push({ zdarzenie: 'scenariusz_koniec', sukces, opis });
  flush();
  active = false;
  // Kolejne wiersze należą już do następnego scenariusza (jego plik powstanie przy starcie)
  file = null;
  reserving = null;
  slot = following(slot);
}

export const isActive = () => active;

// Kiosk prosi o powrót do ekranu startowego przy starcie scenariusza klawiszem
export function setResetHandler(fn) { resetHandler = fn; }

// Błąd pokazany uczestnikowi (komunikat, upływ limitu czasu). Kod bez spacji, etykieta = treść komunikatu.
export function logError(code, message) {
  push({ zdarzenie: 'blad', element: code, etykieta: clean(message) });
}

// ---------- zapis ----------
function csvField(v) {
  const s = v === undefined || v === null ? '' : String(v);
  return /[;"\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

// Dopisuje niezapisane wiersze do pliku bieżącego scenariusza. Przed startem scenariusza wiersze czekają
// na jego plik; gdy plik dopiero powstaje, zapis następuje po jego utworzeniu.
export function flush({ beacon = false } = {}) {
  if (!enabled) return;
  completeSettle();
  measureAllNow();
  sortRows();
  if (rows.length === 0 || !reserving) return;
  const batch = rows;
  rows = [];
  if (file) send(batch, file, beacon);
  else reserving.then((f) => { if (f) send(batch, f); });
}

// Wszystkie wiersze pliku mają uczestnika, kolejność i scenariusz tego pliku
function send(batch, f, beacon = false) {
  const wiersze = batch
    .map((r) => ({ ...r, uczestnik: f.uczestnik, kolejnosc: f.kolejnosc, scenariusz: r.scenariusz ? f.scenariusz : '' }))
    .map((r) => COLUMNS.map((c) => csvField(r[c])).join(';')).join('\n') + '\n';
  const fileName = f.plik;
  const body = JSON.stringify({ nazwa: fileName, naglowek: COLUMNS.join(';'), wiersze });
  if (beacon && navigator.sendBeacon) {
    navigator.sendBeacon('/api/zdarzenia', new Blob([body], { type: 'application/json' }));
    return;
  }
  fetch('/api/zdarzenia', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body })
    .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
    .then((r) => console.info(`[zdarzenia] zapisano ${r.plik}`))
    .catch((err) => {
      // Brak serwera Vite → pobieramy fragment pliku w przeglądarce
      console.warn('[zdarzenia] zapis na serwerze nieudany, pobieram plik', err);
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob(['﻿', `${COLUMNS.join(';')}\n`, wiersze], { type: 'text/csv;charset=utf-8' }));
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(a.href);
    });
}

// ---------- sesja ----------
// rezerwuj = false: serwer sprawdza folder i podaje następny plik; rezerwuj = true: tworzy go.
async function requestFile(rezerwuj) {
  let res;
  try {
    res = await fetch('/api/zdarzenia/sesja', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ naglowek: COLUMNS.join(';'), rezerwuj }),
    });
  } catch {
    throw new Error('Brak serwera zapisu zdarzeń. Uruchom kiosk przez „npm run dev” albo „npm run preview”.');
  }
  const info = await res.json().catch(() => ({}));
  if (!res.ok || !info.plik) throw new Error(info.blad || `Serwer zapisu zdarzeń odpowiedział błędem HTTP ${res.status}.`);
  return info;
}

function setMeta(info) {
  meta = { interfejs: String(info.interfejs), uczestnik: info.uczestnik, wersja: info.wersja, kolejnosc: info.kolejnosc };
}

// Start kiosku: serwer sprawdza folder zdarzenia/ i podaje następny plik. Bez tego (brak serwera, brak dostępu
// do folderu) rejestrowanie się nie zaczyna — błąd trafia do wywołującego.
export async function startSession() {
  if (enabled) return slot;
  const info = await requestFile(false);
  setMeta(info);
  slot = { uczestnik: info.uczestnik, scenariusz: info.scenariusz };
  enabled = true;
  push({
    zdarzenie: 'sesja',
    ekran: '',
    opis: `skalowanie=${Math.round(window.devicePixelRatio * 100)}% okno=${window.innerWidth}x${window.innerHeight} ekran=${window.screen.width}x${window.screen.height}`,
  });
  return info;
}

// Błąd przy tworzeniu pliku scenariusza w trakcie sesji (rejestrowanie zostaje zatrzymane)
export function onFatal(fn) { fatalHandler = fn; }

export const currentFileName = () => file?.plik ?? '';

document.addEventListener('pointerdown', onPointerDown, true);

// Klawisze prowadzącego: 1–3 = start następnego scenariusza (numer S nadaje kolejność plików),
// 0 (albo Esc poza pełnym ekranem) = przerwanie scenariusza
window.addEventListener('keydown', (e) => {
  if (!enabled || e.ctrlKey || e.altKey || e.metaKey) return;
  if (e.target.closest?.('input, textarea')) return;
  if (/^[1-3]$/.test(e.key)) startScenario('start=prowadzacy');
  else if (e.key === '0' || e.key === 'Escape') endScenario({ sukces: 0, opis: 'przerwano=prowadzacy' });
});

// Błąd JavaScript → wiersz blad z kodem JS
window.addEventListener('error', (e) => { if (enabled) logError('JS', e.message); });
window.addEventListener('unhandledrejection', (e) => { if (enabled) logError('JS', String(e.reason?.message ?? e.reason)); });

// Zamknięcie lub odświeżenie strony → dopisujemy to, co zostało
window.addEventListener('pagehide', () => flush({ beacon: true }));
