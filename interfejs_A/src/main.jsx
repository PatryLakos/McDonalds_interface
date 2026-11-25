import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { onFatal, startSession } from './logger.js';
// Czcionka dołączona lokalnie (bez internetu) — stałe wymiary przycisków i współrzędne AOI w każdej sesji
import '@fontsource/poppins/400.css';
import '@fontsource/poppins/500.css';
import '@fontsource/poppins/600.css';
import '@fontsource/poppins/700.css';
import '@fontsource/poppins/800.css';
import './styles.css';

// Pełny ekran po otwarciu strony. Przeglądarka pozwala na to dopiero po geście użytkownika,
// więc gdy pierwsza próba się nie uda, pełny ekran włącza się przy pierwszym dotknięciu / klawiszu
// (i wraca po kolejnym dotknięciu, jeśli ktoś go wyłączył).
const enterFullscreen = () => {
  if (document.fullscreenElement || !document.fullscreenEnabled) return;
  document.documentElement.requestFullscreen?.().catch(() => {});
};
enterFullscreen();
window.addEventListener('pointerdown', enterFullscreen, true);
window.addEventListener('keydown', (e) => { if (e.key !== 'F11' && e.key !== 'Escape') enterFullscreen(); }, true);

const root = ReactDOM.createRoot(document.getElementById('root'));

const showError = (err, note) => root.render(
  <div role="alert" style={{ maxWidth: 640, margin: '15vh auto', padding: 24, fontFamily: 'Poppins, sans-serif', color: '#7a0010', background: '#fff0f0', border: '2px solid #da291c', borderRadius: 12 }}>
    <h1 style={{ marginTop: 0, fontSize: 24 }}>Nie można rozpocząć rejestrowania zdarzeń</h1>
    <p>{err.message}</p>
    <p>{note} Usuń problem i odśwież stronę (F5).</p>
  </div>
);

// Plik scenariusza nie powstał w trakcie sesji → kiosk znika, żeby nie prowadzić scenariusza bez zapisu
onFatal((err) => showError(err, 'Nie utworzono pliku scenariusza — ten scenariusz nie został zapisany.'));

// Kiosk startuje dopiero, gdy serwer sprawdzi folder zdarzenia/ i poda następny plik (P/S)
startSession()
  .then(({ plik }) => {
    console.info(`[zdarzenia] następny plik: zdarzenia/${plik}`);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  })
  .catch((err) => {
    console.error('[zdarzenia] nie rozpoczęto sesji', err);
    showError(err, 'Nie nadano numeru uczestnika i nie zapisano żadnego pliku.');
  });
