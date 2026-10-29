import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { formatPrice } from '../data.js';
import { FooterButtons } from '../components/Footer.jsx';

export default function Payment({ t, go, total, onPaid, ...rest }) {
  const [stage, setStage] = useState('choose'); // choose | tap | processing | ok

  // Symulacja terminala płatniczego
  useEffect(() => {
    const next = { tap: ['processing', 3500], processing: ['ok', 2200] }[stage];
    if (next) {
      const id = setTimeout(() => setStage(next[0]), next[1]);
      return () => clearTimeout(id);
    }
    if (stage === 'ok') {
      const id = setTimeout(() => onPaid('card'), 1600);
      return () => clearTimeout(id);
    }
  }, [stage]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="page payment">
      <div className="pay-total">
        <span>{t('total')}</span>
        <b>{formatPrice(total)}</b>
      </div>

      <AnimatePresence mode="wait">
        {stage === 'choose' && (
          <motion.div key="choose" className="pay-choose" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -40 }}>
            <h1 className="title-xl">{t('howPay')}</h1>
            <div className="pay-cards">
              {[
                { id: 'card', ico: '💳', title: t('payCard'), sub: t('payCardSub'), action: () => setStage('tap') },
                { id: 'counter', ico: '🧑‍🍳', title: t('payCounter'), sub: t('payCounterSub'), action: () => onPaid('counter') },
              ].map((o, k) => (
                <motion.button
                  key={o.id}
                  className="pay-card"
                  initial={{ opacity: 0, y: 60 }}
                  animate={{ opacity: 1, y: 0, transition: { delay: 0.1 + k * 0.1, type: 'spring', stiffness: 200, damping: 20 } }}
                  whileTap={{ scale: 0.95 }}
                  onClick={o.action}
                >
                  <span className="pay-ico">{o.ico}</span>
                  <b>{o.title}</b>
                  <small>{o.sub}</small>
                </motion.button>
              ))}
            </div>
            <button className="btn-outline lg" onClick={() => go('cart')}>← {t('back')}</button>
          </motion.div>
        )}

        {stage === 'tap' && (
          <motion.div key="tap" className="pay-state" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
            <div className="nfc">
              {[0, 1, 2].map((k) => (
                <motion.span
                  key={k}
                  className="nfc-wave"
                  animate={{ scale: [0.6, 1.8], opacity: [0.8, 0] }}
                  transition={{ repeat: Infinity, duration: 2, delay: k * 0.6, ease: 'easeOut' }}
                />
              ))}
              <motion.span className="nfc-card" animate={{ y: [0, 30, 0], rotate: [-8, -4, -8] }} transition={{ repeat: Infinity, duration: 2 }}>💳</motion.span>
            </div>
            <h2>{t('tapCard')}</h2>
            <motion.div className="arrow-down" animate={{ y: [0, 24, 0] }} transition={{ repeat: Infinity, duration: 1.2 }}>⬇</motion.div>
            <button className="btn-outline lg" onClick={() => setStage('choose')}>{t('cancel')}</button>
          </motion.div>
        )}

        {stage === 'processing' && (
          <motion.div key="proc" className="pay-state" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="spinner" animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} />
            <h2>{t('processing')}</h2>
          </motion.div>
        )}

        {stage === 'ok' && (
          <motion.div key="ok" className="pay-state" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <svg className="check" viewBox="0 0 120 120">
              <motion.circle cx="60" cy="60" r="54" fill="#27ae60" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 18 }} />
              <motion.path
                d="M34 62 L52 80 L88 42" fill="none" stroke="#fff" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.25, duration: 0.5 }}
              />
            </svg>
            <h2>{t('paid')}</h2>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="page-footer end">
        <FooterButtons t={t} {...rest} />
      </div>
    </div>
  );
}
