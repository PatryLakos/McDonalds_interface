import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { canCustomize, canMakeMeal, formatPrice } from '../data.js';
import QtyStepper from '../components/QtyStepper.jsx';
import ProductModal from '../components/ProductModal.jsx';
import MealWizard from '../components/MealWizard.jsx';
import { tr, lineChanges, lineDetails, mealInfo } from '../menuI18n.js';
import { FooterButtons, ScanBox } from '../components/Footer.jsx';
import { slug, useBaseScreen } from '../logger.js';
import ErrorNote, { useErrorNote } from '../components/ErrorNote.jsx';
import { loop, useA11y, useStill } from '../a11y.js';
import ConfirmCancel from '../components/ConfirmCancel.jsx';

const round2 = (v) => Math.round(v * 100) / 100;

export default function Cart({ t, go, cart, updateQty, replaceLine, subtotal, total, donation, setDonation, dine, setDine, ...rest }) {
  const [editing, setEditing] = useState(null);
  const screenRef = useBaseScreen('koszyk');
  const [err, showErr] = useErrorNote();
  const still = useStill();
  const { say } = useA11y();
  const [removing, setRemoving] = useState(null);

  // Cofnięcie zmian składników: pozycja zostaje w koszyku, cena spada o cenę usuniętych dodatków
  const revert = (line, changes) => {
    const c = line.config;
    const drop = (kind) => new Set(changes.filter((x) => x.kind === kind).map((x) => x.id));
    const removedOut = drop('removed');
    const addedOut = drop('added');
    const config = { ...c, removed: c.removed.filter((r) => !removedOut.has(r)), added: c.added.filter((a) => !addedOut.has(a)) };
    const unitPrice = round2(line.unitPrice - changes.reduce((s, x) => s + x.price, 0));
    replaceLine(line.uid, { ...line, config, unitPrice, details: lineDetails({ product: line.product, config }, rest.lang, t) });
    say(`${t('undone')}: ${changes.map((x) => `${x.label} ${x.text}`).join(', ')}. ${tr(line.product.name, rest.lang)}, ${formatPrice(unitPrice * line.qty)}.`);
  };

  // Po cofnięciu klawiaturą fokus przechodzi na sąsiedni „✕” albo „Personalizuj”, a nie na początek strony
  const keepFocus = (btn) => {
    const li = btn.closest('li');
    const target = (li.nextElementSibling ?? li.previousElementSibling)?.querySelector('.cl-change-x')
      ?? li.closest('.cl-info').querySelector('.cl-btns button');
    requestAnimationFrame(() => target?.focus());
  };

  const dineOptions = [
    { id: 'in', label: t('eatInShort') },
    { id: 'out', label: t('takeOutShort') },
  ];
  const pickDine = (o) => {
    setDine(o.id);
    say(`${t('dineLabel')} ${o.label}.`);
  };

  // Zestawy edytujemy w kreatorze, pojedyncze produkty w oknie produktu
  const isMealLine = (line) => line.product.meal || line.config?.asMeal;
  const canEdit = (line) => isMealLine(line) || canCustomize(line.product) || canMakeMeal(line.product);
  const startEdit = (line) => setEditing({ line, meal: isMealLine(line) });

  const roundUp = Math.round((Math.ceil(subtotal) - subtotal) * 100) / 100;
  const donations = [
    ...(roundUp > 0 ? [{ id: 'round', label: `${t('roundUp')} ${formatPrice(roundUp)}`, amount: roundUp }] : []),
    { id: 'd50', label: t('donate'), amount: 0.5 },
    { id: 'd100', label: t('donate'), amount: 1 },
  ];

  return (
    <div ref={screenRef} className="page cart">
      <motion.h1 className="cart-title" initial={{ x: -40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
        <span className="cart-title-ico">🛍️</span> {t('yourOrder')}
      </motion.h1>

      <div className="cart-dine">
        <span id="cart-dine-label">{t('dineLabel')}</span>
        <div className="wz-seg" role="radiogroup" aria-labelledby="cart-dine-label">
          {dineOptions.map((o) => (
            <button
              key={o.id}
              role="radio"
              aria-checked={dine === o.id}
              data-log={o.id === 'in' ? 'zmien_na_miejscu' : 'zmien_na_wynos'}
              className={dine === o.id ? 'on' : ''}
              onClick={() => pickDine(o)}
            >
              {dine === o.id && <motion.span layoutId="cart-dine-seg" className="wz-seg-bg" />}
              <span className="wz-seg-label">{dine === o.id && '✓ '}{o.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="cart-list">
        <AnimatePresence initial={false}>
          {cart.length === 0 && (
            <motion.div key="empty" className="cart-empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {t('emptyCart')}
            </motion.div>
          )}
          {cart.map((line, k) => {
            const meal = mealInfo(line, rest.lang, t);
            const changes = lineChanges(line, rest.lang, t);
            return (
            <motion.div
              key={line.uid}
              layout
              className="cart-line"
              initial={{ opacity: 0, x: 80 }}
              animate={{ opacity: 1, x: 0, transition: { delay: 0.1 + k * 0.05 } }}
              exit={{ opacity: 0, x: -200, height: 0, paddingTop: 0, paddingBottom: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 28 }}
            >
              <div className="cl-img" style={{ background: line.product.bg }}>{line.product.emoji}</div>
              <div className="cl-info">
                <div className="cl-name">{tr(line.product.name, rest.lang)}{line.config?.asMeal && <span className="meal-tag">🍟🥤 {t('mealOn').split(':')[0]}</span>}</div>
                <div className="cl-btns">
                  {canEdit(line) && (
                    <button className="btn-outline xs" data-log={`personalizuj_${line.product.id}`} onClick={() => startEdit(line)}>✎ {t('personalize')}</button>
                  )}
                  {changes.length > 0 && (
                    <button className="btn-outline xs" data-log={`cofnij_wszystkie_${line.product.id}`} onClick={() => revert(line, changes)}>{t('undoAll')}</button>
                  )}
                </div>
                {meal && <div className="cl-meal">{meal}</div>}
                {changes.length > 0 && (
                  <ul className="cl-changes">
                    <AnimatePresence initial={false}>
                      {changes.map((c) => (
                        <motion.li
                          key={`${c.kind}-${c.id}`}
                          className={c.kind}
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                        >
                          <span className="cl-change-text">
                            <b>{c.label}:</b> {c.text}
                            {c.price > 0 && <small> (+{formatPrice(c.price)})</small>}
                          </span>
                          <button
                            className="cl-change-x"
                            data-log={`cofnij_${c.kind === 'removed' ? 'bez' : 'dodatek'}_${slug(c.id)}_${line.product.id}`}
                            aria-label={`${t('undoThis')}: ${c.label} ${c.text}`}
                            title={t('undoThis')}
                            onClick={(e) => { revert(line, [c]); if (e.detail === 0) keepFocus(e.currentTarget); }}
                          >
                            <span aria-hidden>✕</span>
                          </button>
                        </motion.li>
                      ))}
                    </AnimatePresence>
                  </ul>
                )}
              </div>
              <div className="cl-ctrl">
                <QtyStepper value={line.qty} onChange={(q) => updateQty(line.uid, q)} t={t} />
                <button className="btn-outline xs wide" data-log={`usun_${line.product.id}`} onClick={() => setRemoving(line)}>🗑️ {t('remove')}</button>
              </div>
              <div className="cl-price">{formatPrice(line.unitPrice * line.qty)}</div>
            </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <motion.div className="donation" initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.25 }}>
        <div className="don-logo">
          <motion.span {...loop(still, { scale: [1, 1.12, 1] }, { duration: 1.4 })}>❤️</motion.span>
          <small>Dom Ronalda McDonalda</small>
        </div>
        <div className="don-body">
          <p>{t('donateQ')}?</p>
          <div className="don-btns">
            {donations.map((d) => (
              <button
                key={d.id}
                data-log={`darowizna_${d.id}`}
                className={`btn-outline sm ${donation?.id === d.id ? 'active' : ''}`}
                onClick={() => setDonation(donation?.id === d.id ? null : d)}
              >
                {donation?.id === d.id && '✓ '}
                {d.id === 'round' ? d.label : <>{d.label}<br /><b>{formatPrice(d.amount)}</b></>}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      <div className="cart-bottom">
        <ErrorNote err={err} />
        <div className="sum-row">
          <span>{t('total')}</span>
          <motion.b key={total} initial={{ scale: 1.15, color: '#d88a00' }} animate={{ scale: 1, color: '#1a1a1a' }}>
            {formatPrice(total)}
          </motion.b>
        </div>
        <div className="cart-actions">
          <button className="btn-outline lg" data-aoi="AOI_wstecz" data-log="dodaj_produkty" onClick={() => go('menu')}>{t('addProducts')}</button>
          <motion.button className="btn-yellow lg grow" data-aoi="AOI_cel" data-log="zloz_zamowienie" aria-disabled={cart.length === 0} whileTap={{ scale: 0.97 }} onClick={() => (cart.length === 0 ? showErr('PUSTE_ZAMOWIENIE', t('errEmpty')) : go('payment'))}>
            {t('placeOrder')}
          </motion.button>
        </div>
        <div className="page-footer compact">
          <ScanBox t={t} />
          <FooterButtons t={t} {...rest} />
        </div>
      </div>

      <AnimatePresence>
        {removing && (
          <ConfirmCancel
            t={t}
            name="usun"
            title={t('removeQ')}
            text={`${t('removeWhat')} „${tr(removing.product.name, rest.lang)}” ${t('removeQSub')}`}
            yes={t('removeYes')}
            no={t('removeNo')}
            onKeep={() => setRemoving(null)}
            onConfirm={() => { updateQty(removing.uid, 0); setRemoving(null); }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {editing && !editing.meal && (
          <ProductModal
            key={editing.line.uid}
            product={editing.line.product}
            initial={editing.line}
            t={t}
            lang={rest.lang}
            onClose={() => setEditing(null)}
            onMakeMeal={(prefill) => setEditing({ ...editing, meal: true, prefill })}
            onAdd={(item) => { replaceLine(editing.line.uid, item); setEditing(null); }}
          />
        )}
        {editing?.meal && (
          <MealWizard
            key={`wz-${editing.line.uid}`}
            product={editing.line.product}
            initial={editing.prefill ? undefined : editing.line}
            prefill={editing.prefill}
            t={t}
            lang={rest.lang}
            onClose={() => setEditing(null)}
            onAdd={(item) => { replaceLine(editing.line.uid, item); setEditing(null); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
