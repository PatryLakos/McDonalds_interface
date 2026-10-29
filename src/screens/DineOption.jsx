import { motion } from 'framer-motion';
import { LANGS } from '../i18n.js';
import Logo from '../components/Logo.jsx';
import { FooterButtons, ScanBox } from '../components/Footer.jsx';

const card = {
  hidden: { y: 80, opacity: 0 },
  show: (k) => ({ y: 0, opacity: 1, transition: { delay: 0.15 + k * 0.1, type: 'spring', stiffness: 200, damping: 20 } }),
};

export default function DineOption({ t, lang, setLang, onPick, ...rest }) {
  return (
    <div className="page dine">
      <motion.div className="dine-logo" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.1 }}>
        <Logo size={70} />
      </motion.div>
      <motion.h1 className="title-xl" initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
        {t('whereEat')}
      </motion.h1>

      <div className="dine-cards">
        {[
          { id: 'in', label: t('eatIn'), art: <><span className="art-drink">🥤</span><span className="art-box">🍔</span><div className="tray" /></> },
          { id: 'out', label: t('takeOut'), art: <span className="art-bag">🛍️</span> },
        ].map((o, k) => (
          <motion.button
            key={o.id}
            className="dine-card"
            custom={k}
            variants={card}
            initial="hidden"
            animate="show"
            whileHover={{ y: -8 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onPick(o.id)}
          >
            <span className="dine-label">{o.label}</span>
            <div className="dine-art">{o.art}</div>
            <div className="dine-shelf" />
          </motion.button>
        ))}
      </div>

      <div className="langs">
        <div className="langs-title">文A {t('availLangs')}</div>
        <div className="langs-row">
          {LANGS.map((l) => (
            <button key={l.id} className={`lang-btn ${lang === l.id ? 'on' : ''}`} onClick={() => setLang(l.id)}>
              {l.label}
              {lang === l.id && <motion.span layoutId="lang-check" className="lang-check">✓</motion.span>}
            </button>
          ))}
        </div>
      </div>

      <div className="page-footer">
        <ScanBox t={t} />
        <FooterButtons t={t} {...rest} />
      </div>
    </div>
  );
}
