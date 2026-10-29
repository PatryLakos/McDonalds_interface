import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { categories, formatPrice, homeTiles, products, promos } from '../data.js';
import Logo from '../components/Logo.jsx';
import ProductModal from '../components/ProductModal.jsx';
import { FooterButtons, ScanBox } from '../components/Footer.jsx';

const grid = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05, delayChildren: 0.05 } },
};
const item = {
  hidden: { y: 40, opacity: 0, scale: 0.95 },
  show: { y: 0, opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 260, damping: 22 } },
};

export default function Menu({ t, lang, go, count, subtotal, addToCart, ...rest }) {
  const [cat, setCat] = useState('home');
  const [selected, setSelected] = useState(null);
  const [toast, setToast] = useState(null);
  const [flyer, setFlyer] = useState(null);

  const openProduct = (id) => setSelected(products.find((p) => p.id === id));

  const handleAdd = (line) => {
    addToCart(line);
    setSelected(null);
    setFlyer({ key: Date.now(), emoji: line.product.emoji });
    setToast({ key: Date.now(), text: `${line.qty}× ${line.product.name}` });
    setTimeout(() => setToast(null), 2200);
  };

  const list = products.filter((p) => p.cat === cat);
  const catObj = categories.find((c) => c.id === cat);

  return (
    <div className="page menu">
      <aside className="sidebar">
        <div className="side-logo"><Logo size={90} /></div>
        <div className="side-group">
          <SideItem active={cat === 'home'} onClick={() => setCat('home')} emoji="📋" label={t('mainMenu')} bold />
          <SideItem emoji="🧾" label={t('invoice')} />
        </div>
        <div className="side-group scroll">
          {categories.map((c) => (
            <SideItem key={c.id} active={cat === c.id} onClick={() => setCat(c.id)} emoji={c.emoji} label={c.name[lang]} />
          ))}
        </div>
      </aside>

      <main className="menu-main">
        <AnimatePresence mode="wait">
          <motion.div
            key={cat}
            className="menu-content"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
          >
            {cat === 'home' ? (
              <>
                <h2 className="section-title">{t('checkMenu')}</h2>
                <motion.div className="tiles" variants={grid} initial="hidden" animate="show">
                  {homeTiles.map((tile) => (
                    <motion.button
                      key={tile.cat}
                      variants={item}
                      className="tile"
                      style={{ background: tile.bg }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setCat(tile.cat)}
                    >
                      <span className="tile-emoji">{tile.emoji}</span>
                      <span className={`tile-title ${tile.red ? 'red' : ''}`}>{tile.title[lang]}</span>
                    </motion.button>
                  ))}
                </motion.div>

                <h2 className="section-title">{t('tryNew')}</h2>
                <motion.div className="promos" variants={grid} initial="hidden" animate="show">
                  {promos.map((p) => (
                    <motion.button
                      key={p.productId}
                      variants={item}
                      className="promo"
                      style={{ background: p.bg, color: p.color }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => openProduct(p.productId)}
                    >
                      <div className="promo-text">
                        <b>{p.title}</b>
                        <span>{p.sub}</span>
                      </div>
                      <motion.span className="promo-emoji" whileHover={{ rotate: 8, scale: 1.1 }}>{p.emoji}</motion.span>
                    </motion.button>
                  ))}
                </motion.div>
              </>
            ) : (
              <>
                <h2 className="section-title big">{catObj.name[lang]}</h2>
                <motion.div className="products" variants={grid} initial="hidden" animate="show">
                  {list.map((p) => (
                    <motion.button
                      key={p.id}
                      variants={item}
                      className="product-card"
                      whileTap={{ scale: 0.94 }}
                      onClick={() => setSelected(p)}
                    >
                      {p.badge && <span className="badge">{p.badge}</span>}
                      <div className="pc-img" style={{ background: p.bg }}>{p.emoji}</div>
                      <div className="pc-name">{p.name}</div>
                      <div className="pc-price">{formatPrice(p.price)}</div>
                    </motion.button>
                  ))}
                </motion.div>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      <div className="menu-bottom">
        <ScanBox t={t} />
        <div className="menu-bottom-right">
          <div className="cart-row">
            <div className="cart-ico">
              🛍️
              <motion.span
                key={count}
                className="cart-badge"
                initial={{ scale: 1.8 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 15 }}
              >
                {count}
              </motion.span>
            </div>
            <motion.div key={subtotal} className="cart-sum" initial={{ y: -10, opacity: 0.3 }} animate={{ y: 0, opacity: 1 }}>
              {formatPrice(subtotal)}
            </motion.div>
            <motion.button
              className="btn-yellow summary-btn"
              disabled={count === 0}
              onClick={() => go('cart')}
              animate={count > 0 ? { scale: [1, 1.05, 1] } : {}}
              transition={{ duration: 0.4 }}
              key={`s-${count}`}
            >
              {t('goSummary')}
            </motion.button>
          </div>
          <FooterButtons t={t} {...rest} />
        </div>
      </div>

      {/* Animacja "lecącego" produktu do koszyka */}
      <AnimatePresence>
        {flyer && (
          <motion.div
            key={flyer.key}
            className="flyer"
            initial={{ left: 640, top: 760, scale: 3, opacity: 1 }}
            animate={{ left: 430, top: 1640, scale: 0.6, opacity: [1, 1, 0] }}
            transition={{ duration: 0.75, ease: [0.5, 0, 0.75, 0] }}
            onAnimationComplete={() => setFlyer(null)}
          >
            {flyer.emoji}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.key}
            className="toast"
            initial={{ y: -80, opacity: 0, x: '-50%' }}
            animate={{ y: 0, opacity: 1, x: '-50%' }}
            exit={{ y: -80, opacity: 0, x: '-50%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 24 }}
          >
            ✓ {t('added')}: <b>{toast.text}</b>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selected && (
          <ProductModal product={selected} t={t} lang={lang} onClose={() => setSelected(null)} onAdd={handleAdd} />
        )}
      </AnimatePresence>
    </div>
  );
}

function SideItem({ active, onClick, emoji, label, bold }) {
  return (
    <motion.button className={`side-item ${active ? 'active' : ''} ${bold ? 'bold' : ''}`} onClick={onClick} whileTap={{ scale: 0.95 }}>
      <span className="side-emoji">{emoji}</span>
      <span className="side-label">{label}</span>
      {active && <motion.span layoutId="side-indicator" className="side-indicator" transition={{ type: 'spring', stiffness: 400, damping: 32 }} />}
    </motion.button>
  );
}
