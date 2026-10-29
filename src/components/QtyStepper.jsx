import { AnimatePresence, motion } from 'framer-motion';

export default function QtyStepper({ value, onChange, min = 1, large = false }) {
  return (
    <div className={`qty ${large ? 'qty-lg' : ''}`}>
      <button className="qty-btn" disabled={value <= min} onClick={() => onChange(value - 1)}>−</button>
      <div className="qty-val">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={value}
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            {value}
          </motion.span>
        </AnimatePresence>
      </div>
      <button className="qty-btn" onClick={() => onChange(value + 1)}>+</button>
    </div>
  );
}
