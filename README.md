# Kiosk – interfejs zamówień (React + Vite)

Ekran 9:16 (projekt w 1080×1920, automatycznie skalowany do okna).

## Uruchomienie

```
npm install
npm run dev
```

Otwórz http://localhost:5173 (F11 = pełny ekran).

## Ekrany
1. Ekran startowy (pokaz slajdów) → 2. Na miejscu / na wynos + język →
3. Menu (kategorie, nowości, okno produktu z personalizacją i zestawami) →
4. Twoje zamówienie (ilości, darowizna) → 5. Płatność (symulacja terminala) → 6. Numer zamówienia.

Po 60 s bezczynności pojawia się okno „Potrzebujesz więcej czasu?”.
Przycisk „Dostępność” przesuwa interfejs w dół ekranu.

## Edycja menu
Produkty, ceny i kategorie: `src/data.js`. Teksty (PL/EN/DE): `src/i18n.js`.
Obrazki są emoji – możesz je zamienić na zdjęcia (np. `<img>` w `Menu.jsx` / `ProductModal.jsx`).
