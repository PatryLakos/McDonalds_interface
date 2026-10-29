import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { extras, formatPrice, mealDrinks, mealSizes } from '../data.js';
import QtyStepper from './QtyStepper.jsx';

const collapse = {
  initial: { height: 0, opacity: 0 },
  animate: { height: 'auto', opacity: 1 },
  exit: { height: 0, opacity: 0 },
  transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
};

export default function ProductModal({ product, t, lang, onClose, onAdd }) {
  const [qty, setQty] = useState(1);
  const [info, setInfo] = useState(false);
  const [custom, setCustom] = useState(false);
  const [removed, setRemoved] = useState([]);
  const [added, setAdded] = useState([]);
  const [size, setSize] = useState(mealSizes[0]);
  const [drink, setDrink] = useState(mealDrinks[0]);

  const canCustomize = !product.meal && product.ingredients.length > 1;
  const extrasPrice = extras.filter((e) => added.includes(e.id)).reduce((s, e) => s + e.price, 0);
  const unitPrice = product.price + (product.meal ? size.extra : 0) + extrasPrice;

  const toggle = (list, setList, id) => setList(list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);

  const submit = () => {
    const details = [];
    if (product.meal) details.push(`${size.name[lang]}`, drink);
    removed.forEach((r) => details.push(`${t('without')}: ${r}`));
    extras.filter((e) => added.includes(e.id)).forEach((e) => details.push(`+ ${e.name}`));
    onAdd({ product, qty, unitPrice, details });
  };

  return (
    <motion.div className="backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div
        className="product-modal"
        onClick={(e) => e.stopPropagation()}
        initial={{ y: 200, scale: 0.9, opacity: 0 }}
        animate={{ y: 0, scale: 1, opacity: 1 }}
        exit={{ y: 160, scale: 0.92, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 26 }}
      >
        <button className="close-x" onClick={onClose}>✕</button>

        <div className="pm-scroll">
          <motion.div
            className="pm-image"
            style={{ background: product.bg }}
          >
            <motion.span
              initial={{ scale: 0.4, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.1 }}
            >
              {product.emoji}
            </motion.span>
          </motion.div>

          <h2 className="pm-name">{product.name}</h2>
          <div className="pm-price">{formatPrice(unitPrice)}</div>

          <button className="btn-outline sm center" onClick={() => setInfo(!info)}>{t('nutrition')}</button>
          <AnimatePresence initial={false}>
            {info && (
              <motion.div className="pm-info" {...collapse}>
                <div className="pm-info-inner">
                  <div className="kcal"><b>{product.kcal}</b> kcal</div>
                  {product.ingredients.length > 0 && (
                    <p><b>{t('ingredients')}:</b> {product.ingredients.join(', ')}</p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {product.meal && (
            <div className="pm-section">
              <h4>{t('size')}</h4>
              <div className="chip-row">
                {mealSizes.map((s) => (
                  <button key={s.id} className={`chip ${size.id === s.id ? 'on' : ''}`} onClick={() => setSize(s)}>
                    {s.name[lang]} {s.extra > 0 && <small>+{formatPrice(s.extra)}</small>}
                    {size.id === s.id && <motion.span layoutId="size-check" className="chip-check">✓</motion.span>}
                  </button>
                ))}
              </div>
              <h4>{t('drink')}</h4>
              <div className="chip-row wrap">
                {mealDrinks.map((d) => (
                  <button key={d} className={`chip ${drink === d ? 'on' : ''}`} onClick={() => setDrink(d)}>
                    🥤 {d}
                    {drink === d && <motion.span layoutId="drink-check" className="chip-check">✓</motion.span>}
                  </button>
                ))}
              </div>
            </div>
          )}

          {canCustomize && (
            <>
              <button className={`btn-outline wide ${custom ? 'active' : ''}`} onClick={() => setCustom(!custom)}>
                {custom ? t('personalizeDone') : t('personalize')}
              </button>
              <AnimatePresence initial={false}>
                {custom && (
                  <motion.div className="pm-custom" {...collapse}>
                    <div className="pm-section">
                      <h4>{t('without')}</h4>
                      <div className="chip-row wrap">
                        {product.ingredients.map((ing) => (
                          <button
                            key={ing}
                            className={`chip ${removed.includes(ing) ? 'off' : ''}`}
                            onClick={() => toggle(removed, setRemoved, ing)}
                          >
                            {removed.includes(ing) ? '✕ ' : ''}{ing}
                          </button>
                        ))}
                      </div>
                      <h4>{t('extra')}</h4>
                      <div className="chip-row wrap">
                        {extras.map((e) => (
                          <button
                            key={e.id}
                            className={`chip ${added.includes(e.id) ? 'on' : ''}`}
                            onClick={() => toggle(added, setAdded, e.id)}
                          >
                            + {e.name} <small>{formatPrice(e.price)}</small>
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}

          <QtyStepper value={qty} onChange={setQty} large />
        </div>

        <div className="pm-actions">
          <button className="btn-outline flat" onClick={onClose}>{t('cancel')}</button>
          <motion.button className="btn-yellow flat" whileTap={{ scale: 0.96 }} onClick={submit}>
            {t('addToOrder')} · {formatPrice(unitPrice * qty)}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
