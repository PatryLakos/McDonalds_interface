import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function IdleModal({ t, onContinue, onReset }) {
  const [left, setLeft] = useState(15);

  useEffect(() => {
    if (left <= 0) { onReset(); return; }
    const id = setTimeout(() => setLeft((l) => l - 1), 1000);
    return () => clearTimeout(id);
  }, [left, onReset]);

  return (
    <motion.div className="backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div
        className="dialog"
        initial={{ scale: 0.85, y: 60, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, y: 40, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 24 }}
      >
        <div className="idle-ring">
          <svg viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="52" className="ring-bg" />
            <motion.circle
              cx="60" cy="60" r="52" className="ring-fg"
              initial={{ pathLength: 1 }}
              animate={{ pathLength: left / 15 }}
              transition={{ duration: 1, ease: 'linear' }}
            />
          </svg>
          <span>{left}</span>
        </div>
        <h2>{t('moreTime')}</h2>
        <p>{t('moreTimeSub')} {left} s</p>
        <div className="dialog-actions">
          <button className="btn-outline lg" onClick={onReset}>{t('noRestart')}</button>
          <button className="btn-yellow lg" onClick={onContinue}>{t('yesMore')}</button>
        </div>
      </motion.div>
    </motion.div>
  );
}
