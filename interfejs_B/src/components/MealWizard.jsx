import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  MEAL_UPGRADE, canCustomize, extras, formatPrice, mealDrinkItems, mealSides, mealSizes, products,
} from '../data.js';
import { tr, lineDetails } from '../menuI18n.js';
import QtyStepper from './QtyStepper.jsx';
import CustomizeChips from './CustomizeChips.jsx';
import { slug, useOverlayScreen } from '../logger.js';
import ErrorNote, { useErrorNote } from './ErrorNote.jsx';
import { useA11y } from '../a11y.js';

// Pełnoekranowy kreator zestawu: 1) kanapka (+ personalizacja) → 2) dodatek i rozmiar → 3) napój → 4) podsumowanie.
// `product` = zestaw z menu (meal: true) albo pojedynczy produkt, z którego robimy zestaw.
// `initial` = edytowana pozycja koszyka, `prefill` = ustawienia przeniesione z okna produktu.
const STEP_MAIN = 0;
const STEP_SIDE = 1;
const STEP_DRINK = 2;
const STEP_SUMMARY = 3;

const STEP_SCREENS = ['zestaw_kanapka', 'zestaw_dodatek', 'zestaw_napoj', 'zestaw_podsumowanie'];

// Szybki zestaw (B): frytki + Coca-Cola w rozmiarze średnim albo dużym — te same wybory co w krokach 2 i 3
const QUICK_SIDE = mealSides.find((s) => s.id === 'fries');
const QUICK_DRINK = mealDrinkItems.find((d) => d.id === 'Coca-Cola');
const QUICK = [
  { sizeId: 'm', title: 'quickM', inc: 'quickMInc' },
  { sizeId: 'l', title: 'quickL', inc: 'quickLInc' },
];

const slide = {
  enter: (dir) => ({ x: dir > 0 ? 260 : -260, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir) => ({ x: dir > 0 ? -260 : 260, opacity: 0 }),
};

export default function MealWizard({ product, initial, prefill, t, lang, onClose, onAdd }) {
  const isSet = Boolean(product.meal);
  const main = isSet ? products.find((p) => p.id === product.main) ?? product : product;
  const cfg = initial?.config ?? prefill ?? {};
  const editing = Boolean(initial);
  const customizable = canCustomize(main);

  const [step, setStep] = useState(editing ? STEP_SUMMARY : STEP_MAIN);
  const [dir, setDir] = useState(1);
  const [removed, setRemoved] = useState(cfg.removed ?? []);
  const [added, setAdded] = useState(cfg.added ?? []);
  const [custom, setCustom] = useState(removed.length + added.length > 0);
  const [size, setSize] = useState(mealSizes.find((s) => s.id === cfg.sizeId) ?? mealSizes[0]);
  const [side, setSide] = useState(mealSides.find((s) => s.id === cfg.side) ?? null);
  const [drink, setDrink] = useState(mealDrinkItems.find((d) => d.id === cfg.drink) ?? null);
  const [qty, setQty] = useState(initial?.qty ?? cfg.qty ?? 1);
  const boxRef = useRef(null);
  const [err, showErr, hideErr] = useErrorNote();
  useOverlayScreen(STEP_SCREENS[step], boxRef, `produkt=${product.id}${editing ? ' edycja=1' : ''}`);
  const { say } = useA11y();

  const basePrice = isSet ? product.price : main.price + MEAL_UPGRADE;
  const extrasPrice = extras.filter((e) => added.includes(e.id)).reduce((s, e) => s + e.price, 0);
  const unitPrice = basePrice + size.extra + (side?.extra ?? 0) + (drink?.extra ?? 0) + extrasPrice;

  // Nad tytułem jest już etykieta „McZestaw”, więc tu wystarczy nazwa
  const title = tr(isSet ? product.name : main.name, lang);
  const steps = [main.noCustom ? t('stepMainAlt') : t('stepMain'), t('stepSide'), t('stepDrink'), t('stepSummary')];
  useEffect(() => {
    const q = [customizable ? t('wantCustomize') : t('mainReady'), t('chooseSide'), t('drink'), t('mealSummary')][step];
    const quickHint = step === STEP_MAIN && !editing ? ` ${t('quickHelp')}` : '';
    say(`${t('mealWord')} ${title}. ${t('step')} ${step + 1} ${t('of')} 4: ${steps[step]}. ${q}${quickHint}`);
  }, [step]); // eslint-disable-line react-hooks/exhaustive-deps
  const canNext = step === STEP_MAIN || (step === STEP_SIDE && side) || (step === STEP_DRINK && drink);

  // Wybrany szybki zestaw wynika z bieżących wyborów, więc kroki 2–4 pokazują to samo
  const quickSize = side?.id === QUICK_SIDE.id && drink?.id === QUICK_DRINK.id ? size.id : null;
  const showQuick = step === STEP_MAIN && !editing;
  const quickReady = showQuick && quickSize;
  const quickPrice = (sizeId) => basePrice + mealSizes.find((s) => s.id === sizeId).extra + QUICK_SIDE.extra + QUICK_DRINK.extra + extrasPrice;
  const pickQuick = (q) => {
    hideErr();
    if (quickSize === q.sizeId) {
      setSide(null);
      setDrink(null);
      return;
    }
    setSize(mealSizes.find((s) => s.id === q.sizeId));
    setSide(QUICK_SIDE);
    setDrink(QUICK_DRINK);
    say(`${t(q.title)}: ${t(q.inc)}. ${formatPrice(quickPrice(q.sizeId) * qty)}`);
  };
  // Z kroku wyboru wracamy do podsumowania, jeśli klient już raz tam był
  const [seenSummary, setSeenSummary] = useState(editing);

  const goTo = (n) => {
    setDir(n > step ? 1 : -1);
    setStep(n);
    if (n === STEP_SUMMARY) setSeenSummary(true);
  };
  const next = () => goTo(seenSummary ? STEP_SUMMARY : step + 1);
  const pickAndGo = (setter, value) => {
    hideErr();
    setter(value);
    setTimeout(() => goTo(seenSummary ? STEP_SUMMARY : step + 1), 380);
  };

  const submit = () => {
    const config = { removed, added, sizeId: size.id, side: side.id, drink: drink.id, asMeal: !isSet };
    const lineProduct = isSet ? product : main;
    onAdd({ product: lineProduct, qty, unitPrice, details: lineDetails({ product: lineProduct, config }, lang, t), config });
  };

  const mainDetails = [
    ...removed.map((r) => `${t('without')}: ${tr(r, lang)}`),
    ...extras.filter((e) => added.includes(e.id)).map((e) => `+ ${tr(e.name, lang)}`),
  ];

  return (
    <motion.div
      ref={boxRef}
      className="wizard"
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', stiffness: 200, damping: 28 }}
    >
      <header className="wz-head">
        <button className="wz-close" data-aoi="AOI_wstecz" data-log="zamknij" onClick={onClose} aria-label={t('close')}>✕<span>{t('close')}</span></button>
        <div className="wz-title">
          <span className="wz-title-emoji" style={{ background: main.bg }}>{main.emoji}</span>
          <div>
            <small>{t('mealWord')}</small>
            <b>{title}</b>
          </div>
        </div>
        <ol className="wz-steps">
          {steps.map((label, i) => (
            <li key={label} className={`${i === step ? 'on' : ''} ${i < step ? 'done' : ''}`}>
              <button data-log={`krok_${i + 1}`} disabled={i > step && !seenSummary} onClick={() => goTo(i)}>
                <span className="wz-dot">{i < step ? '✓' : i + 1}</span>
                {label}
              </button>
              {i === step && <motion.span layoutId="wz-bar" className="wz-bar" transition={{ type: 'spring', stiffness: 380, damping: 32 }} />}
            </li>
          ))}
        </ol>
      </header>

      <div className="wz-body">
        <AnimatePresence mode="wait" custom={dir} initial={false}>
          <motion.div
            key={step}
            className="wz-step"
            custom={dir}
            variants={slide}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
          >
            {step === STEP_MAIN && (
              <>
                <motion.div
                  className={`wz-hero ${showQuick ? 'sm' : ''}`}
                  style={{ background: main.bg }}
                  initial={{ scale: 0.6, rotate: -12 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 13 }}
                >
                  {main.emoji}
                </motion.div>
                <h2 className="wz-h">{tr(main.name, lang)}</h2>
                {customizable ? (
                  <>
                    <p className="wz-q">{t('wantCustomize')}</p>
                    <div className="wz-choice">
                      {/* Pod pytaniem są gotowe zestawy, więc „Nie, dziękuję” tylko zaznacza wybór zamiast przechodzić dalej */}
                      <button data-log="personalizacja_nie" className={`wz-opt ${!custom ? 'on' : ''}`} onClick={() => { setCustom(false); setRemoved([]); setAdded([]); if (!showQuick) next(); }}>
                        <span>👍</span>{t('noThanks')}
                      </button>
                      <button data-log="personalizacja_tak" className={`wz-opt ${custom ? 'on' : ''}`} onClick={() => setCustom(true)}>
                        <span>✎</span>{t('yesCustomize')}
                      </button>
                    </div>
                    <AnimatePresence initial={false}>
                      {custom && (
                        <motion.div
                          className="wz-custom"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                        >
                          <CustomizeChips product={main} removed={removed} setRemoved={setRemoved} added={added} setAdded={setAdded} t={t} lang={lang} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                ) : (
                  <p className="wz-q">{t('mainReady')}</p>
                )}
                {showQuick && (
                  <section className="wz-quick" aria-label={t('quickTitle')}>
                    <h3>{t('quickTitle')}</h3>
                    <p>{t('quickSub')}</p>
                    <div className="wz-choice" role="radiogroup" aria-label={t('quickTitle')}>
                      {QUICK.map((q) => (
                        <button
                          key={q.sizeId}
                          role="radio"
                          aria-checked={quickSize === q.sizeId}
                          data-log={`szybki_zestaw_${q.sizeId}`}
                          className={`wz-opt ${quickSize === q.sizeId ? 'on' : ''}`}
                          onClick={() => pickQuick(q)}
                        >
                          {quickSize === q.sizeId && <span className="wz-check" aria-hidden>✓</span>}
                          <span className={`wz-quick-art ${q.sizeId}`} aria-hidden>{QUICK_SIDE.emoji}{QUICK_DRINK.emoji}</span>
                          <b>{t(q.title)}</b>
                          <small>{t(q.inc)}</small>
                          <strong>{formatPrice(quickPrice(q.sizeId))}</strong>
                        </button>
                      ))}
                    </div>
                    <button className="btn-outline sm" data-log="krok_po_kroku" onClick={next}>{t('quickOther')} →</button>
                  </section>
                )}
              </>
            )}

            {step === STEP_SIDE && (
              <>
                <h2 className="wz-h">{t('chooseSide')}</h2>
                <div className="wz-size">
                  <span>{t('size')}</span>
                  <div className="wz-seg">
                    {mealSizes.map((s) => (
                      <button key={s.id} data-log={`rozmiar_${s.id}`} className={size.id === s.id ? 'on' : ''} onClick={() => setSize(s)}>
                        {size.id === s.id && <motion.span layoutId="wz-seg" className="wz-seg-bg" />}
                        <span className="wz-seg-label">
                          {s.name[lang]} {s.extra > 0 && <small>+{formatPrice(s.extra)}</small>}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="wz-grid">
                  {mealSides.map((s, i) => (
                    <Tile key={s.id} log={`dodatek_zestawu_${s.id}`} i={i} item={s} label={tr(s.name, lang)} on={side?.id === s.id} onClick={() => pickAndGo(setSide, s)} />
                  ))}
                </div>
              </>
            )}

            {step === STEP_DRINK && (
              <>
                <h2 className="wz-h">{t('drink')}</h2>
                <div className="wz-grid three">
                  {mealDrinkItems.map((d, i) => (
                    <Tile key={d.id} log={`napoj_${slug(d.id)}`} i={i} item={d} label={tr(d.id, lang)} on={drink?.id === d.id} onClick={() => pickAndGo(setDrink, d)} />
                  ))}
                </div>
              </>
            )}

            {step === STEP_SUMMARY && (
              <>
                <h2 className="wz-h">{t('mealSummary')}</h2>
                <ul className="wz-summary">
                  <SummaryRow emoji={main.emoji} bg={main.bg} label={tr(main.name, lang)} sub={mainDetails.join(', ') || (customizable ? t('noChanges') : '')} t={t} log="zmien_kanapka" onChange={() => goTo(STEP_MAIN)} />
                  <SummaryRow emoji={side.emoji} bg={side.bg} label={tr(side.name, lang)} sub={`${t('size')}: ${size.name[lang]}`} t={t} log="zmien_dodatek" onChange={() => goTo(STEP_SIDE)} />
                  <SummaryRow emoji={drink.emoji} bg={drink.bg} label={tr(drink.id, lang)} sub={size.name[lang]} t={t} log="zmien_napoj" onChange={() => goTo(STEP_DRINK)} />
                </ul>
                <div className="wz-qty">
                  <span>{t('quantity')}</span>
                  <QtyStepper value={qty} onChange={setQty} large t={t} />
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <footer className="wz-foot">
        <ErrorNote err={err} />
        <button className="btn-outline lg" data-aoi="AOI_wstecz" data-log={step === STEP_MAIN ? 'anuluj' : 'wstecz'} onClick={() => (step === STEP_MAIN ? onClose() : goTo(step - 1))}>
          {step === STEP_MAIN ? t('cancel') : `← ${t('back')}`}
        </button>
        <motion.div key={unitPrice * qty} className="wz-price" initial={{ scale: 1.15, color: '#d88a00' }} animate={{ scale: 1, color: '#1a1a1a' }}>
          {formatPrice(unitPrice * qty)}
        </motion.div>
        {quickReady ? (
          <motion.button className="btn-yellow lg" data-aoi="AOI_cel" data-log="dodaj_szybki_zestaw" whileTap={{ scale: 0.96 }} onClick={submit}>
            {t('addToOrder')}
          </motion.button>
        ) : step < STEP_SUMMARY ? (
          <motion.button className="btn-yellow lg" data-aoi="AOI_cel" data-log="dalej" aria-disabled={!canNext} whileTap={{ scale: 0.96 }}
            onClick={() => (canNext ? next() : showErr('BRAK_WYBORU', step === STEP_SIDE ? t('errPickSide') : t('errPickDrink')))}>
            {t('next')} →
          </motion.button>
        ) : (
          <motion.button className="btn-yellow lg" data-aoi="AOI_cel" data-log={editing ? 'zapisz_zmiany' : 'dodaj_do_zamowienia'} whileTap={{ scale: 0.96 }} onClick={submit}>
            {editing ? t('saveChanges') : t('addToOrder')}
          </motion.button>
        )}
      </footer>
    </motion.div>
  );
}

function Tile({ item, label, on, onClick, i, log }) {
  return (
    <motion.button
      className={`wz-tile ${on ? 'on' : ''}`}
      data-log={log}
      onClick={onClick}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0, transition: { delay: 0.05 * i } }}
      whileTap={{ scale: 0.95 }}
    >
      <span className="wz-tile-img" style={{ background: item.bg }}>{item.emoji}</span>
      <b>{label}</b>
      <small>{item.extra > 0 ? `+${formatPrice(item.extra)}` : ' '}</small>
      {on && (
        <motion.span className="wz-check" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 500, damping: 18 }}>
          ✓
        </motion.span>
      )}
    </motion.button>
  );
}

function SummaryRow({ emoji, bg, label, sub, onChange, t, log }) {
  return (
    <li>
      <span className="wz-sum-img" style={{ background: bg }}>{emoji}</span>
      <div className="wz-sum-text">
        <b>{label}</b>
        {sub && <small>{sub}</small>}
      </div>
      <button className="btn-outline sm" data-log={log} onClick={onChange}>{t('change')}</button>
    </li>
  );
}
