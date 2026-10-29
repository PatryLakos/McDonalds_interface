import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { attractSlides } from '../data.js';
import { LANGS } from '../i18n.js';
import Logo from '../components/Logo.jsx';

export default function Attract({ t, lang, setLang, go, a11y, setA11y }) {
  const [i, setI] = useState(0);
  const [langOpen, setLangOpen] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setI((x) => (x + 1) % attractSlides.length), 5000);
    return () => clearInterval(id);
  }, []);

  const slide = attractSlides[i];

  return (
    <div className="attract" onClick={() => go('dine')}>
      <div className="attract-hero">
        <AnimatePresence initial={false}>
          <motion.div
            key={i}
            className="attract-slide"
            style={{ background: slide.bg }}
            initial={{ opacity: 0, scale: 1.08 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.1, ease: 'easeOut' }}
          >
            <motion.div
              className="attract-emoji"
              initial={{ y: 120, scale: 0.6, rotate: -12 }}
              animate={{ y: [0, -30, 0], scale: 1, rotate: 0 }}
              transition={{ y: { repeat: Infinity, duration: 4, ease: 'easeInOut' }, scale: { duration: 0.9 }, rotate: { duration: 0.9 } }}
            >
              {slide.emoji}
            </motion.div>
            <motion.h1 initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3, duration: 0.7 }}>
              {slide.title}
            </motion.h1>
            <motion.p initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5, duration: 0.7 }}>
              {slide.sub}
            </motion.p>
          </motion.div>
        </AnimatePresence>
        <div className="attract-logo"><Logo size={110} /></div>
        <div className="dots">
          {attractSlides.map((_, k) => (
            <span key={k} className={k === i ? 'on' : ''} />
          ))}
        </div>
      </div>

      <div className="attract-panel" onClick={(e) => e.stopPropagation()}>
        <motion.div className="app-tile" whileTap={{ scale: 0.97 }}>
          <h3>{t('haveApp')}</h3>
          <p>{t('scanHere')}</p>
          <motion.div className="phone-anim" animate={{ x: [0, -18, 0] }} transition={{ repeat: Infinity, duration: 2.2 }}>
            📲
          </motion.div>
          <motion.span className="chev" animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 1.6 }}>⌄</motion.span>
        </motion.div>

        <div className="attract-right">
          <motion.button
            className="start-btn"
            onClick={() => go('dine')}
            animate={{ boxShadow: ['0 0 0 0 rgba(255,199,44,0.7)', '0 0 0 26px rgba(255,199,44,0)'] }}
            transition={{ repeat: Infinity, duration: 1.8 }}
            whileTap={{ scale: 0.96 }}
          >
            <b>{t('clickHere')}</b>
            <span>{t('toStart')}</span>
          </motion.button>
          <div className="attract-small">
            <button className="btn-outline" onClick={() => setLangOpen(!langOpen)}>
              <span className="ico">文A</span>
              <span><small>{t('languages')}</small><br /><b>EN DE</b></span>
            </button>
            <button className={`btn-outline ${a11y ? 'active' : ''}`} onClick={() => setA11y(!a11y)}>♿ {t('a11y')}</button>
          </div>
          <AnimatePresence>
            {langOpen && (
              <motion.div className="lang-pop" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}>
                {LANGS.map((l) => (
                  <button key={l.id} className={`lang-btn ${lang === l.id ? 'on' : ''}`} onClick={() => { setLang(l.id); setLangOpen(false); }}>
                    {l.label}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
          <div className="copyright">© 2026 Kiosk Demo</div>
        </div>
      </div>
    </div>
  );
}
