import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import AdminSetup from './admin/AdminSetup.jsx';
import { configure, shutdown } from './logger.js';
// Czcionka dołączona lokalnie (bez internetu) — stałe wymiary przycisków i współrzędne AOI w każdej sesji
import '@fontsource/poppins/400.css';
import '@fontsource/poppins/500.css';
import '@fontsource/poppins/600.css';
import '@fontsource/poppins/700.css';
import '@fontsource/poppins/800.css';
import './styles.css';

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

// Najpierw panel prowadzącego (dane uczestnika), potem kiosk. Ctrl+Shift+A wraca do panelu.
function Root() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    const onKey = (e) => {
      if (!(e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'a')) return;
      e.preventDefault();
      shutdown('panel');
      setSession(null);
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const start = async (cfg, fullscreen) => {
    if (fullscreen && !document.fullscreenElement) {
      try {
        // Niektóre przeglądarki nie odpowiadają na prośbę o pełny ekran — po 1,5 s startujemy mimo to
        await Promise.race([document.documentElement.requestFullscreen(), wait(1500)]);
        await wait(400); // wiersz `sesja` ma mieć już rozmiar okna po przejściu na pełny ekran
      } catch { /* przeglądarka odmówiła — działamy w oknie */ }
    }
    configure(cfg);
    setSession({ ...cfg, startedAt: Date.now() });
  };

  return session ? <App key={session.startedAt} /> : <AdminSetup onStart={start} />;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
