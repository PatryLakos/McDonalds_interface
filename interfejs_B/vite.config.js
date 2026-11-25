import fs from 'node:fs';
import path from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Folder na pliki CSV z rejestrem zdarzeń (jeden plik na uczestnika i scenariusz) — tylko pliki tej wersji
const EVENTS_DIR = path.resolve(__dirname, 'zdarzenia');
const INTERFEJS = '06';
const WERSJA = 'B';
const SCENARIUSZE = 3;

// Nazwa pliku: PUN_zdarzenia_I06_P<numer, min. 2 cyfry>_B_S<1–3>.csv
const FILE_RE = new RegExp(`^PUN_zdarzenia_I${INTERFEJS}_P(\\d{2,})_${WERSJA}_S([1-${SCENARIUSZE}])\\.csv$`);
const pCode = (p) => `P${String(p).padStart(2, '0')}`;
const fileNameFor = (p, s) => `PUN_zdarzenia_I${INTERFEJS}_${pCode(p)}_${WERSJA}_S${s}.csv`;

// Kolejność wersji w badaniu (metadane do kolumny kolejnosc): nieparzysty numer → AB, parzysty → BA.
// Ta sama reguła w obu wersjach, więc uczestnik Pnn ma tę samą kolejność w plikach _A i _B.
export const orderFor = (p) => (p % 2 === 1 ? 'AB' : 'BA');

// Następny plik po najwyższym (P, S) w folderze zdarzenia/: S1 → S2 → S3, potem kolejny P od S1.
// Luki nie są wypełniane, pliki o innej nazwie są pomijane.
export function nextSlot(dir) {
  let p = 0;
  let s = SCENARIUSZE;
  for (const name of fs.readdirSync(dir)) {
    const m = FILE_RE.exec(name);
    if (!m) continue;
    const [mp, ms] = [Number(m[1]), Number(m[2])];
    if (mp > p || (mp === p && ms > s)) [p, s] = [mp, ms];
  }
  if (s < SCENARIUSZE) s += 1;
  else [p, s] = [p + 1, 1];
  return {
    plik: fileNameFor(p, s), uczestnik: pCode(p), scenariusz: `S${s}`,
    interfejs: Number(INTERFEJS), wersja: WERSJA, kolejnosc: orderFor(p),
  };
}

// rezerwuj = false: tylko sprawdzenie folderu i podgląd następnego pliku (start kiosku).
// rezerwuj = true: utworzenie pliku (BOM + nagłówek) przy starcie scenariusza.
// Flaga 'wx' — istniejący plik nigdy nie zostanie nadpisany; wtedy zgłaszamy błąd.
export function nextFile(dir, naglowek, rezerwuj) {
  fs.mkdirSync(dir, { recursive: true });
  const slot = nextSlot(dir);
  if (rezerwuj) fs.writeFileSync(path.join(dir, slot.plik), `\uFEFF${naglowek}\n`, { encoding: 'utf8', flag: 'wx' });
  return slot;
}

const describe = (err) => {
  const where = path.relative(__dirname, EVENTS_DIR);
  if (err.code === 'EEXIST' && err.syscall === 'open') return `Plik ${path.basename(err.path)} już istnieje — nie nadpisano go. Odśwież stronę, aby nadać kolejny plik.`;
  if (err.code === 'EACCES' || err.code === 'EPERM') return `Brak dostępu do folderu ${where}/ (${err.code}).`;
  if (err.code === 'ENOTDIR') return `${where} nie jest folderem.`;
  return `Nie można odczytać folderu ${where}/: ${err.message || err}`;
};

// POST /api/zdarzenia/sesja  { naglowek, rezerwuj } → { plik, uczestnik, scenariusz, interfejs, wersja, kolejnosc }
// POST /api/zdarzenia        { nazwa, naglowek, wiersze } → dopisanie wierszy do zdarzenia/<nazwa>.
function eventLogWriter() {
  const readBody = (req) => new Promise((resolve, reject) => {
    let body = '';
    req.setEncoding('utf8');
    req.on('data', (chunk) => { body += chunk; });
    req.on('end', () => { try { resolve(JSON.parse(body)); } catch (err) { reject(err); } });
    req.on('error', reject);
  });
  const send = (res, status, data) => {
    res.statusCode = status;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(data));
  };

  const handler = (req, res, next) => {
    const url = new URL(req.url, 'http://localhost');
    if (req.method !== 'POST') return next();

    if (url.pathname === '/api/zdarzenia/sesja') {
      readBody(req)
        .then(({ naglowek, rezerwuj }) => {
          if (typeof naglowek !== 'string') return send(res, 400, { blad: 'brak nagłówka' });
          try {
            send(res, 200, nextFile(EVENTS_DIR, naglowek, rezerwuj === true));
          } catch (err) {
            send(res, 500, { blad: describe(err) });
          }
        })
        .catch((err) => send(res, 400, { blad: String(err.message || err) }));
      return;
    }

    if (url.pathname !== '/api/zdarzenia') return next();
    readBody(req)
      .then(({ nazwa, naglowek, wiersze }) => {
        if (typeof wiersze !== 'string' || typeof naglowek !== 'string') throw new Error('brak danych');
        // Tylko pliki tej wersji o właściwej nazwie, zawsze w folderze zdarzenia/
        const name = path.basename(String(nazwa || ''));
        if (!FILE_RE.test(name)) throw new Error(`niedozwolona nazwa pliku: ${name}`);
        fs.mkdirSync(EVENTS_DIR, { recursive: true });
        const file = path.join(EVENTS_DIR, name);
        if (!fs.existsSync(file)) fs.writeFileSync(file, `\uFEFF${naglowek}\n`, { encoding: 'utf8', flag: 'wx' });
        fs.appendFileSync(file, wiersze, 'utf8');
        send(res, 200, { plik: path.relative(__dirname, file) });
      })
      .catch((err) => send(res, 400, { blad: String(err.message || err) }));
  };
  return {
    name: 'zapis-zdarzen',
    configureServer(server) { server.middlewares.use(handler); },
    configurePreviewServer(server) { server.middlewares.use(handler); },
  };
}

export default defineConfig({
  plugins: [react(), eventLogWriter()],
  server: { port: 5174, open: false },
});
