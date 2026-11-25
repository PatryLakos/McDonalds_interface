import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, MotionConfig, motion } from 'framer-motion';
import { translate } from './i18n.js';
import { formatPrice } from './data.js';
import { A11yContext, DEFAULT_OPTS, TEXT_SIZES, speak, stopSpeaking } from './a11y.js';
import Stage from './components/Stage.jsx';
import IdleModal from './components/IdleModal.jsx';
import A11yPanel from './components/A11yPanel.jsx';
import ConfirmCancel from './components/ConfirmCancel.jsx';
import TopBar, { hasTopZone } from './components/TopBar.jsx';
import Attract from './screens/Attract.jsx';
import DineOption from './screens/DineOption.jsx';
import Menu from './screens/Menu.jsx';
import Cart from './screens/Cart.jsx';
import Payment from './screens/Payment.jsx';
import Confirmation from './screens/Confirmation.jsx';
import { endScenario, flush, isActive, logError, refreshAois, setResetHandler } from './logger.js';

// Dłuższy czas na zamówienie i dłuższe ostrzeżenie przed jego anulowaniem (wersja A: 60 s + 15 s);
// opcja „Więcej czasu” (B+) wydłuża go jeszcze bardziej
const IDLE_MS = { B: 120_000, 'B+': 300_000 };
const IDLE_WARN_S = { B: 30, 'B+': 60 };

// Wysokość strefy informacyjnej w trybie ułatwionego zasięgu
const REACH_TOP = 600;

// Anulowanie przez samego klienta nie wyłącza jego ustawień dostępności
const KEEP_OPTS = ['zacznij_od_nowa', 'bezczynnosc_przycisk'];

const OPT_TITLES = {
  contrast: 'optContrast', textSize: 'optText', noMotion: 'optMotion', moreTime: 'optTime', reach: 'optReach', audio: 'optAudio',
};

// Kolejność ekranów — decyduje o kierunku animacji przejścia
const ORDER = ['attract', 'dine', 'menu', 'cart', 'payment', 'done'];

const screenVariants = {
  enter: (dir) => ({ x: dir > 0 ? '100%' : '-30%', opacity: dir > 0 ? 1 : 0, scale: dir > 0 ? 1 : 0.96 }),
  center: { x: 0, opacity: 1, scale: 1 },
  exit: (dir) => ({ x: dir > 0 ? '-30%' : '100%', opacity: dir > 0 ? 0 : 1, scale: dir > 0 ? 0.96 : 1 }),
};

// Projekt interfejs_B — kiosk z ulepszeniami dostępności (wersja A jest w osobnym projekcie interfejs_A)
export default function App() {
  const [screen, setScreen] = useState('attract');
  const [dir, setDir] = useState(1);
  const [lang, setLang] = useState('pl');
  const [dine, setDine] = useState(null);
  const [cart, setCart] = useState([]);
  const [donation, setDonation] = useState(null);
  const [opts, setOpts] = useState(DEFAULT_OPTS);
  const [panel, setPanel] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [idle, setIdle] = useState(false);
  const [order, setOrder] = useState(null);
  const idleTimer = useRef();

  const t = useMemo(() => translate(lang), [lang]);

  // Język strony = język kiosku (czytniki ekranu, WCAG 3.1.1)
  useEffect(() => { document.documentElement.lang = lang; }, [lang]);
  const timing = opts.moreTime ? 'B+' : 'B';

  const go = useCallback(
    (next) => {
      setDir(ORDER.indexOf(next) >= ORDER.indexOf(screen) ? 1 : -1);
      setScreen(next);
    },
    [screen]
  );

  // Powrót do ekranu startowego. Anulowanie zamówienia przez uczestnika nie kończy scenariusza
  // (koniec = potwierdzenie albo przerwanie przez prowadzącego), ale dopisuje rejestr do pliku.
  const reset = useCallback((reason) => {
    if (reason === 'limit_czasu') logError('LIMIT_CZASU', `${t('moreTimeSub')} 0 s`);
    setDir(-1);
    setScreen('attract');
    setCart([]);
    setDine(null);
    setDonation(null);
    setLang('pl');
    setIdle(false);
    setOrder(null);
    setPanel(false);
    setConfirmCancel(false);
    if (!KEEP_OPTS.includes(reason)) {
      setOpts(DEFAULT_OPTS);
      stopSpeaking();
    }
    if (reason !== 'scenariusz') setTimeout(() => flush(), 0);
  }, [t]);

  // Start scenariusza klawiszem prowadzącego → kiosk wraca na ekran startowy
  useEffect(() => { setResetHandler(() => reset('scenariusz')); }, [reset]);

  // Wykrywanie bezczynności
  const bump = useCallback(() => {
    clearTimeout(idleTimer.current);
    if (screen === 'attract' || screen === 'done') return;
    idleTimer.current = setTimeout(() => setIdle(true), IDLE_MS[timing]);
  }, [screen, timing]);

  useEffect(() => {
    bump();
    return () => clearTimeout(idleTimer.current);
  }, [bump]);

  // Klawisz prowadzącego T: od razu pokazuje ostrzeżenie o bezczynności (test limitu czasu)
  useEffect(() => {
    const onKey = (e) => {
      if (e.ctrlKey || e.altKey || e.metaKey || e.key.toLowerCase() !== 't') return;
      if (screen === 'attract' || screen === 'done') return;
      clearTimeout(idleTimer.current);
      setIdle(true);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [screen]);

  const addToCart = (item) => setCart((c) => [...c, { ...item, uid: crypto.randomUUID() }]);
  const replaceLine = (uid, item) => setCart((c) => c.map((i) => (i.uid === uid ? { ...item, uid } : i)));
  const updateQty = (uid, qty) =>
    setCart((c) => (qty <= 0 ? c.filter((i) => i.uid !== uid) : c.map((i) => (i.uid === uid ? { ...i, qty } : i))));

  const subtotal = cart.reduce((s, i) => s + i.unitPrice * i.qty, 0);
  const total = subtotal + (donation?.amount ?? 0);
  const count = cart.reduce((s, i) => s + i.qty, 0);

  const finishOrder = (method) => {
    const number = Math.floor(100 + Math.random() * 899);
    setOrder({ number, method, total });
    go('done');
  };

  // Potwierdzenie zamówienia = koniec scenariusza (po zalogowaniu ekranu potwierdzenia), zapis pliku
  useEffect(() => {
    if (screen === 'done' && order && isActive()) {
      const items = cart.map((l) => `${l.qty}x${l.product.id}`).join(',');
      endScenario({ sukces: 1, opis: `zamowienie=${order.number} platnosc=${order.method} suma_gr=${Math.round(order.total * 100)} na_wynos=${dine === 'out' ? 1 : 0} pozycje=${items}` });
    }
  }, [screen, order]); // eslint-disable-line react-hooks/exhaustive-deps

  // Większy tekst i ułatwiony zasięg zmieniają układ → AOI mają nowe położenie
  const layoutKey = `zasieg=${opts.reach ? 1 : 0} tekst=${opts.textSize}`;
  const prevLayout = useRef(layoutKey);
  useEffect(() => {
    if (prevLayout.current === layoutKey) return;
    prevLayout.current = layoutKey;
    refreshAois(layoutKey);
  }, [layoutKey]);

  // ---------- Ustawienia dostępności i asystent głosowy ----------
  const say = useCallback((text, interrupt = false) => {
    if (opts.audio) speak(text, lang, interrupt);
  }, [opts.audio, lang]);

  const setOpt = (id, value) => {
    setOpts((o) => ({ ...o, [id]: value }));
    const state = id === 'textSize' ? t(TEXT_SIZES[value]) : value ? t('turnedOn') : t('turnedOff');
    const msg = `${t(OPT_TITLES[id])}: ${state}`;
    if (id === 'audio') {
      if (value) speak(msg, lang, true);
      else stopSpeaking();
    } else {
      say(msg, true);
    }
  };
  const resetOpts = () => {
    stopSpeaking();
    setOpts(DEFAULT_OPTS);
  };

  // Dotknięty przycisk jest odczytywany na głos (potwierdzenie, co zostało wybrane)
  useEffect(() => {
    if (!opts.audio) return undefined;
    const onClick = (e) => {
      const el = e.target.closest?.('button, [role="button"]');
      if (!el || el.dataset.speak === 'off') return;
      speak(el.getAttribute('aria-label') || el.dataset.label || el.innerText, lang, true);
    };
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, [opts.audio, lang]);

  // Instrukcja dla każdego ekranu (czytana po wejściu na ekran)
  useEffect(() => {
    if (!opts.audio) return;
    const help = {
      attract: t('helpStart'),
      dine: t('helpDine'),
      menu: t('helpMenu'),
      cart: `${t('itemsCount')}: ${count}. ${t('helpCart')} ${formatPrice(total)}.`,
      payment: `${t('total')}: ${formatPrice(total)}. ${t('helpPay')}`,
      done: `${t('helpDone')} ${order?.number ?? ''}.`,
    }[screen];
    say(help);
  }, [screen, opts.audio, lang]); // eslint-disable-line react-hooks/exhaustive-deps

  const requestRestart = () => (cart.length === 0 ? reset('zacznij_od_nowa') : setConfirmCancel(true));
  const anyOpt = Object.values(opts).some(Boolean);

  const topFor = (s) => (opts.reach && hasTopZone(s) ? REACH_TOP : 0);
  // Klasa .ver-b jest zawsze; style ułatwień w styles.css są zapisane pod .ver-b
  const stageClass = ['ver-b', opts.contrast && 'hc', opts.textSize === 1 && 'md', opts.textSize === 2 && 'lg', opts.reach && 'reach', opts.noMotion && 'no-motion'].filter(Boolean).join(' ');

  // „♿ Dostępność” otwiera panel ustawień; podświetla się, gdy jakaś opcja jest włączona
  const shared = { t, lang, setLang, go, reset, a11y: anyOpt, setA11y: () => setPanel(true), requestRestart };

  const screens = {
    attract: <Attract {...shared} />,
    dine: <DineOption {...shared} onPick={(d) => { setDine(d); go('menu'); }} />,
    menu: <Menu {...shared} cart={cart} count={count} subtotal={subtotal} addToCart={addToCart} />,
    cart: (
      <Cart
        {...shared}
        cart={cart}
        updateQty={updateQty}
        replaceLine={replaceLine}
        subtotal={subtotal}
        total={total}
        donation={donation}
        setDonation={setDonation}
        dine={dine}
        setDine={setDine}
      />
    ),
    payment: <Payment {...shared} total={total} onPaid={finishOrder} />,
    done: <Confirmation {...shared} order={order} dine={dine} />,
  };

  const ctx = useMemo(() => ({ opts, say }), [opts, say]);

  return (
    <A11yContext.Provider value={ctx}>
      <MotionConfig reducedMotion={opts.noMotion ? 'always' : 'never'}>
      <Stage onPointerDown={bump} className={stageClass}>
        <div className="a11y-layer">
          {opts.reach && <TopBar t={t} screen={screen} height={topFor(screen)} />}
          <AnimatePresence initial={false} custom={dir} mode="popLayout">
            <motion.div
              key={screen}
              className="screen"
              style={{ top: topFor(screen) }}
              custom={dir}
              variants={screenVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: 'spring', stiffness: 220, damping: 30, mass: 0.9 }}
            >
              {screens[screen]}
            </motion.div>
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {panel && <A11yPanel t={t} opts={opts} setOpt={setOpt} resetOpts={resetOpts} onClose={() => setPanel(false)} />}
        </AnimatePresence>

        <AnimatePresence>
          {confirmCancel && (
            <ConfirmCancel t={t} name="od_nowa" ico="↺" onKeep={() => setConfirmCancel(false)} onConfirm={() => reset('zacznij_od_nowa')} />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {idle && (
            <IdleModal
              t={t}
              seconds={IDLE_WARN_S[timing]}
              onContinue={() => { setIdle(false); bump(); }}
              onReset={(why) => reset(why)}
              onCancel={() => { setIdle(false); requestRestart(); }}
            />
          )}
        </AnimatePresence>
      </Stage>
      </MotionConfig>
    </A11yContext.Provider>
  );
}
