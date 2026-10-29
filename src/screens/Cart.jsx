import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { formatPrice } from '../data.js';
import QtyStepper from '../components/QtyStepper.jsx';
import { FooterButtons, ScanBox } from '../components/Footer.jsx';

export default function Cart({ t, go, cart, updateQty, subtotal, total, donation, setDonation, ...rest }) {
  const [open, setOpen] = useState({});

  const roundUp = Math.round((Math.ceil(subtotal) - subtotal) * 100) / 100;
  const donations = [
    ...(roundUp > 0 ? [{ id: 'round', label: `${t('roundUp')} ${formatPrice(roundUp)}`, amount: roundUp }] : []),
    { id: 'd50', label: t('donate'), amount: 0.5 },
    { id: 'd100', label: t('donate'), amount: 1 },
  ];

  return (
    <div className="page cart">
      <motion.h1 className="cart-title" initial={{ x: -40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
        <span className="cart-title-ico">🛍️</span> {t('yourOrder')}
      </motion.h1>

      <div className="cart-list">
        <AnimatePresence initial={false}>
          {cart.length === 0 && (
            <motion.div key="empty" className="cart-empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {t('emptyCart')}
            </motion.div>
          )}
          {cart.map((line, k) => (
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
                <div className="cl-name">{line.product.name}</div>
                {line.details.length > 0 && (
                  <button className="btn-outline xs" onClick={() => setOpen({ ...open, [line.uid]: !open[line.uid] })}>
                    {open[line.uid] ? t('hideDetails') : t('showDetails')}
                  </button>
                )}
                <AnimatePresence initial={false}>
                  {open[line.uid] && (
                    <motion.ul className="cl-details" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                      {line.details.map((d) => <li key={d}>{d}</li>)}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </div>
              <div className="cl-ctrl">
                <QtyStepper value={line.qty} onChange={(q) => updateQty(line.uid, q)} />
                <button className="btn-outline xs wide" onClick={() => updateQty(line.uid, 0)}>{t('remove')}</button>
              </div>
              <div className="cl-price">{formatPrice(line.unitPrice * line.qty)}</div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <motion.div className="donation" initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.25 }}>
        <div className="don-logo">
          <motion.span animate={{ scale: [1, 1.12, 1] }} transition={{ repeat: Infinity, duration: 1.4 }}>❤️</motion.span>
          <small>Dom Ronalda McDonalda</small>
        </div>
        <div className="don-body">
          <p>{t('donateQ')}?</p>
          <div className="don-btns">
            {donations.map((d) => (
              <button
                key={d.id}
                className={`btn-outline sm ${donation?.id === d.id ? 'active' : ''}`}
                onClick={() => setDonation(donation?.id === d.id ? null : d)}
              >
                {d.id === 'round' ? d.label : <>{d.label}<br /><b>{formatPrice(d.amount)}</b></>}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      <div className="cart-bottom">
        <div className="sum-row">
          <span>{t('total')}</span>
          <motion.b key={total} initial={{ scale: 1.15, color: '#d88a00' }} animate={{ scale: 1, color: '#1a1a1a' }}>
            {formatPrice(total)}
          </motion.b>
        </div>
        <div className="cart-actions">
          <button className="btn-outline lg" onClick={() => go('menu')}>{t('addProducts')}</button>
          <motion.button className="btn-yellow lg grow" disabled={cart.length === 0} whileTap={{ scale: 0.97 }} onClick={() => go('payment')}>
            {t('placeOrder')}
          </motion.button>
        </div>
        <div className="page-footer compact">
          <ScanBox t={t} />
          <FooterButtons t={t} {...rest} />
        </div>
      </div>
    </div>
  );
}
