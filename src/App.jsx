import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { translate } from './i18n.js';
import Stage from './components/Stage.jsx';
import IdleModal from './components/IdleModal.jsx';
import Attract from './screens/Attract.jsx';
import DineOption from './screens/DineOption.jsx';
import Menu from './screens/Menu.jsx';
import Cart from './screens/Cart.jsx';
import Payment from './screens/Payment.jsx';
import Confirmation from './screens/Confirmation.jsx';

const IDLE_MS = 60_000;

// Kolejność ekranów — decyduje o kierunku animacji przejścia
const ORDER = ['attract', 'dine', 'menu', 'cart', 'payment', 'done'];

const screenVariants = {
  enter: (dir) => ({ x: dir > 0 ? '100%' : '-30%', opacity: dir > 0 ? 1 : 0, scale: dir > 0 ? 1 : 0.96 }),
  center: { x: 0, opacity: 1, scale: 1 },
  exit: (dir) => ({ x: dir > 0 ? '-30%' : '100%', opacity: dir > 0 ? 0 : 1, scale: dir > 0 ? 0.96 : 1 }),
};

export default function App() {
  const [screen, setScreen] = useState('attract');
  const [dir, setDir] = useState(1);
  const [lang, setLang] = useState('pl');
  const [dine, setDine] = useState(null);
  const [cart, setCart] = useState([]);
  const [donation, setDonation] = useState(null);
  const [a11y, setA11y] = useState(false);
  const [idle, setIdle] = useState(false);
  const [order, setOrder] = useState(null);
  const idleTimer = useRef();

  const t = useMemo(() => translate(lang), [lang]);

  const go = useCallback(
    (next) => {
      setDir(ORDER.indexOf(next) >= ORDER.indexOf(screen) ? 1 : -1);
      setScreen(next);
    },
    [screen]
  );

  const reset = useCallback(() => {
    setDir(-1);
    setScreen('attract');
    setCart([]);
    setDine(null);
    setDonation(null);
    setLang('pl');
    setA11y(false);
    setIdle(false);
    setOrder(null);
  }, []);

  // Wykrywanie bezczynności
  const bump = useCallback(() => {
    clearTimeout(idleTimer.current);
    if (screen === 'attract' || screen === 'done') return;
    idleTimer.current = setTimeout(() => setIdle(true), IDLE_MS);
  }, [screen]);

  useEffect(() => {
    bump();
    return () => clearTimeout(idleTimer.current);
  }, [bump]);

  const addToCart = (item) => setCart((c) => [...c, { ...item, uid: crypto.randomUUID() }]);
  const updateQty = (uid, qty) =>
    setCart((c) => (qty <= 0 ? c.filter((i) => i.uid !== uid) : c.map((i) => (i.uid === uid ? { ...i, qty } : i))));

  const subtotal = cart.reduce((s, i) => s + i.unitPrice * i.qty, 0);
  const total = subtotal + (donation?.amount ?? 0);
  const count = cart.reduce((s, i) => s + i.qty, 0);

  const finishOrder = (method) => {
    setOrder({ number: Math.floor(100 + Math.random() * 899), method, total });
    go('done');
  };

  const shared = { t, lang, setLang, go, reset, a11y, setA11y };

  const screens = {
    attract: <Attract {...shared} />,
    dine: <DineOption {...shared} onPick={(d) => { setDine(d); go('menu'); }} />,
    menu: <Menu {...shared} cart={cart} count={count} subtotal={subtotal} addToCart={addToCart} />,
    cart: (
      <Cart
        {...shared}
        cart={cart}
        updateQty={updateQty}
        subtotal={subtotal}
        total={total}
        donation={donation}
        setDonation={setDonation}
      />
    ),
    payment: <Payment {...shared} total={total} onPaid={finishOrder} />,
    done: <Confirmation {...shared} order={order} dine={dine} />,
  };

  return (
    <Stage onPointerDown={bump}>
      <motion.div
        className="a11y-layer"
        animate={a11y ? { scale: 0.62, y: 365 } : { scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 160, damping: 24 }}
      >
        <AnimatePresence initial={false} custom={dir} mode="popLayout">
          <motion.div
            key={screen}
            className="screen"
            custom={dir}
            variants={screenVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'spring', stiffness: 220, damping: 30, mass: 0.9 }}
          >
            {screens[screen]}
          </motion.div>
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {idle && (
          <IdleModal
            t={t}
            onContinue={() => { setIdle(false); bump(); }}
            onReset={reset}
          />
        )}
      </AnimatePresence>
    </Stage>
  );
}
