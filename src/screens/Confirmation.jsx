import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { formatPrice } from '../data.js';
import Logo from '../components/Logo.jsx';

const CONFETTI = Array.from({ length: 36 }, (_, i) => ({
  x: Math.random() * 1080,
  delay: Math.random() * 0.8,
  dur: 2.5 + Math.random() * 2,
  rot: Math.random() * 720 - 360,
  color: ['#FFC72C', '#DA291C', '#27ae60', '#ffffff', '#ff8a00'][i % 5],
  w: 14 + Math.random() * 14,
}));

export default function Confirmation({ t, order, dine, reset }) {
  const [left, setLeft] = useState(20);

  useEffect(() => {
    if (left <= 0) { reset(); return; }
    const id = setTimeout(() => setLeft((l) => l - 1), 1000);
    return () => clearTimeout(id);
  }, [left, reset]);

  return (
    <div className="page done">
      {CONFETTI.map((c, i) => (
        <motion.span
          key={i}
          className="confetti"
          style={{ left: c.x, width: c.w, height: c.w * 0.5, background: c.color }}
          initial={{ y: -60, rotate: 0, opacity: 1 }}
          animate={{ y: 2000, rotate: c.rot, opacity: [1, 1, 0.6] }}
          transition={{ delay: c.delay, duration: c.dur, ease: 'easeIn' }}
        />
      ))}

      <motion.div initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 200, damping: 12 }}>
        <Logo size={160} />
      </motion.div>
      <motion.h1 className="title-xxl" initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
        {t('thanks')}
      </motion.h1>

      <motion.div className="order-card" initial={{ y: 80, opacity: 0, scale: 0.9 }} animate={{ y: 0, opacity: 1, scale: 1 }} transition={{ delay: 0.35, type: 'spring', stiffness: 180, damping: 18 }}>
        <span>{t('orderNo')}</span>
        <motion.b initial={{ scale: 0.3 }} animate={{ scale: 1 }} transition={{ delay: 0.6, type: 'spring', stiffness: 300, damping: 12 }}>
          {order?.number}
        </motion.b>
        <div className="order-meta">
          <span>{dine === 'out' ? `🛍️ ${t('takeOutShort')}` : `🍽️ ${t('eatInShort')}`}</span>
          <span>{formatPrice(order?.total ?? 0)}</span>
        </div>
      </motion.div>

      <motion.p className="done-info" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
        {order?.method === 'counter' ? t('pickupCounter') : t('pickupCard')}
        <br />
        🧾 {t('takeReceipt')}
      </motion.p>

      <motion.button className="btn-yellow lg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} onClick={reset}>
        {t('newOrder')}
      </motion.button>
      <div className="done-count">{t('backIn')} {left} s</div>
    </div>
  );
}
