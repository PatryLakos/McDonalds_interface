// Menu kiosku. Ceny w złotówkach, obrazki jako emoji (łatwo podmienić na pliki .png w polu `img`).

export const categories = [
  { id: 'new', emoji: '✨', name: { pl: 'Co nowego?', en: "What's new?", de: 'Neu' } },
  { id: 'meals', emoji: '🍱', name: { pl: 'McZestawy', en: 'Meals', de: 'Menüs' } },
  { id: 'burgers', emoji: '🍔', name: { pl: 'Burgery', en: 'Burgers', de: 'Burger' } },
  { id: 'wraps', emoji: '🌯', name: { pl: 'McWrapy i Sałatki', en: 'Wraps & Salads', de: 'Wraps & Salate' } },
  { id: 'chicken', emoji: '🍗', name: { pl: 'Kurczaki', en: 'Chicken', de: 'Hähnchen' } },
  { id: 'sides', emoji: '🍟', name: { pl: 'Frytki i Dodatki', en: 'Fries & Sides', de: 'Pommes & Beilagen' } },
  { id: 'cafe', emoji: '☕', name: { pl: 'McCafé®', en: 'McCafé®', de: 'McCafé®' } },
  { id: 'desserts', emoji: '🍦', name: { pl: 'Lody i Desery', en: 'Desserts', de: 'Desserts' } },
  { id: 'drinks', emoji: '🥤', name: { pl: 'Napoje', en: 'Drinks', de: 'Getränke' } },
  { id: 'family', emoji: '🎁', name: { pl: 'Happy Meal®', en: 'Happy Meal®', de: 'Happy Meal®' } },
];

const BURGER_ING = ['Bułka', 'Sałata', 'Ser', 'Ogórek', 'Cebula', 'Ketchup', 'Musztarda'];

export const products = [
  // Co nowego
  { id: 'mccrispy-h', cat: 'new', name: 'McCrispy® Halloween', price: 26.9, emoji: '🍔', bg: '#2b1d1d', kcal: 720, ingredients: ['Bułka z czarnym sezamem', 'Kurczak w panierce', 'Bekon', 'Ser cheddar', 'Sos dyniowy'], badge: 'NOWOŚĆ' },
  { id: 'strips', cat: 'new', name: 'McCrispy® Strips 3 szt.', price: 18.5, emoji: '🍗', bg: '#fff1d6', kcal: 410, ingredients: ['Polędwiczki z kurczaka', 'Panierka'], badge: 'NOWOŚĆ' },
  { id: 'veggie', cat: 'new', name: 'McVeggie Deluxe', price: 22.9, emoji: '🥬', bg: '#e8f6c9', kcal: 540, ingredients: ['Bułka', 'Kotlet roślinny', 'Sałata', 'Pomidor', 'Sos majonezowy'] },
  { id: 'piernik', cat: 'new', name: 'Piernikowa Latte', price: 14.9, emoji: '☕', bg: '#f4e2cf', kcal: 290, ingredients: ['Espresso', 'Mleko', 'Syrop piernikowy', 'Bita śmietana'], badge: 'LIMITOWANA' },

  // Zestawy
  { id: 'bigmac-set', cat: 'meals', name: 'McZestaw Big Mac®', price: 32.9, emoji: '🍔', bg: '#ffe9a8', kcal: 1080, meal: true, ingredients: ['Big Mac®', 'Frytki', 'Napój'] },
  { id: 'mccrispy-set', cat: 'meals', name: 'McZestaw McCrispy®', price: 33.9, emoji: '🍗', bg: '#ffe9a8', kcal: 1120, meal: true, ingredients: ['McCrispy®', 'Frytki', 'Napój'] },
  { id: 'wiesmac-set', cat: 'meals', name: 'McZestaw WieśMac®', price: 35.9, emoji: '🍔', bg: '#ffe9a8', kcal: 1240, meal: true, ingredients: ['WieśMac®', 'Frytki', 'Napój'] },
  { id: 'nuggets-set', cat: 'meals', name: 'McZestaw Chikker 9 szt.', price: 31.5, emoji: '🍗', bg: '#ffe9a8', kcal: 980, meal: true, ingredients: ['9 nuggetsów', 'Frytki', 'Napój', 'Sos'] },

  // Burgery
  { id: 'bigmac', cat: 'burgers', name: 'Big Mac®', price: 21.9, emoji: '🍔', bg: '#fff3cf', kcal: 495, ingredients: ['Bułka z sezamem', '2 kotlety wołowe', 'Sos Big Mac', 'Sałata', 'Ser', 'Ogórek', 'Cebula'] },
  { id: 'mccrispy', cat: 'burgers', name: 'McCrispy®', price: 23.4, emoji: '🍔', bg: '#fff3cf', kcal: 470, ingredients: ['Bułka', 'Kurczak w panierce', 'Sałata', 'Pomidor', 'Sos'] },
  { id: 'wiesmac', cat: 'burgers', name: 'WieśMac®', price: 24.9, emoji: '🍔', bg: '#fff3cf', kcal: 640, ingredients: ['Bułka', '2 kotlety wołowe', 'Bekon', 'Ser', 'Cebula', 'Sos'] },
  { id: 'cheese', cat: 'burgers', name: 'Cheeseburger', price: 7.9, emoji: '🍔', bg: '#fff3cf', kcal: 300, ingredients: BURGER_ING },
  { id: 'double', cat: 'burgers', name: 'Podwójny Cheeseburger', price: 12.9, emoji: '🍔', bg: '#fff3cf', kcal: 450, ingredients: BURGER_ING },
  { id: 'hamburger', cat: 'burgers', name: 'Hamburger', price: 6.5, emoji: '🍔', bg: '#fff3cf', kcal: 250, ingredients: ['Bułka', 'Ogórek', 'Cebula', 'Ketchup', 'Musztarda'] },

  // Wrapy
  { id: 'wrap-classic', cat: 'wraps', name: 'McWrap® Klasyczny', price: 19.9, emoji: '🌯', bg: '#eaf5dd', kcal: 520, ingredients: ['Tortilla', 'Kurczak', 'Sałata', 'Pomidor', 'Sos'] },
  { id: 'wrap-bekon', cat: 'wraps', name: 'McWrap® Bekon', price: 21.9, emoji: '🌯', bg: '#eaf5dd', kcal: 590, ingredients: ['Tortilla', 'Kurczak', 'Bekon', 'Ser', 'Sałata', 'Sos'] },
  { id: 'salad', cat: 'wraps', name: 'Sałatka z kurczakiem', price: 22.5, emoji: '🥗', bg: '#eaf5dd', kcal: 310, ingredients: ['Mix sałat', 'Kurczak', 'Pomidorki', 'Ogórek', 'Dressing'] },

  // Kurczaki
  { id: 'nuggets6', cat: 'chicken', name: 'Chikker 6 szt.', price: 15.9, emoji: '🍗', bg: '#fff1d6', kcal: 260, ingredients: ['Kurczak', 'Panierka'] },
  { id: 'nuggets9', cat: 'chicken', name: 'Chikker 9 szt.', price: 20.9, emoji: '🍗', bg: '#fff1d6', kcal: 390, ingredients: ['Kurczak', 'Panierka'] },
  { id: 'nuggets20', cat: 'chicken', name: 'Chikker 20 szt.', price: 39.9, emoji: '🍗', bg: '#fff1d6', kcal: 870, ingredients: ['Kurczak', 'Panierka'] },
  { id: 'chickenburger', cat: 'chicken', name: 'Chikker Burger', price: 8.9, emoji: '🍔', bg: '#fff1d6', kcal: 340, ingredients: ['Bułka', 'Kurczak', 'Sałata', 'Sos'] },

  // Dodatki
  { id: 'fries-s', cat: 'sides', name: 'Frytki małe', price: 7.5, emoji: '🍟', bg: '#ffe3e0', kcal: 230, ingredients: ['Ziemniaki', 'Sól'] },
  { id: 'fries-m', cat: 'sides', name: 'Frytki średnie', price: 9.9, emoji: '🍟', bg: '#ffe3e0', kcal: 330, ingredients: ['Ziemniaki', 'Sól'] },
  { id: 'fries-l', cat: 'sides', name: 'Frytki duże', price: 11.9, emoji: '🍟', bg: '#ffe3e0', kcal: 440, ingredients: ['Ziemniaki', 'Sól'] },
  { id: 'sauce', cat: 'sides', name: 'Sos czosnkowy', price: 2.9, emoji: '🧄', bg: '#ffe3e0', kcal: 120, ingredients: ['Sos czosnkowy'] },

  // McCafé
  { id: 'espresso', cat: 'cafe', name: 'Espresso', price: 7.9, emoji: '☕', bg: '#f4e2cf', kcal: 5, ingredients: ['Kawa'] },
  { id: 'latte', cat: 'cafe', name: 'Latte', price: 12.9, emoji: '☕', bg: '#f4e2cf', kcal: 180, ingredients: ['Espresso', 'Mleko'] },
  { id: 'cappuccino', cat: 'cafe', name: 'Cappuccino', price: 11.9, emoji: '☕', bg: '#f4e2cf', kcal: 120, ingredients: ['Espresso', 'Spienione mleko'] },
  { id: 'caramel', cat: 'cafe', name: 'Caramel Latte Macchiato', price: 15.5, emoji: '🧋', bg: '#f4e2cf', kcal: 310, ingredients: ['Espresso', 'Mleko', 'Syrop karmelowy'] },

  // Desery
  { id: 'mcflurry', cat: 'desserts', name: 'McFlurry® Oreo', price: 12.9, emoji: '🍨', bg: '#e6f0ff', kcal: 340, ingredients: ['Lody waniliowe', 'Ciastka'] },
  { id: 'sundae', cat: 'desserts', name: 'Shake truskawkowy', price: 10.9, emoji: '🥤', bg: '#e6f0ff', kcal: 380, ingredients: ['Lody', 'Mleko', 'Sos truskawkowy'] },
  { id: 'cone', cat: 'desserts', name: 'Lody w rożku', price: 4.5, emoji: '🍦', bg: '#e6f0ff', kcal: 150, ingredients: ['Lody waniliowe', 'Wafel'] },
  { id: 'pie', cat: 'desserts', name: 'Ciastko z jabłkiem', price: 6.9, emoji: '🥧', bg: '#e6f0ff', kcal: 230, ingredients: ['Ciasto', 'Nadzienie jabłkowe'] },

  // Napoje
  { id: 'cola', cat: 'drinks', name: 'Coca-Cola 0,4 l', price: 8.9, emoji: '🥤', bg: '#ffe0e0', kcal: 170, ingredients: [] },
  { id: 'cola-zero', cat: 'drinks', name: 'Coca-Cola Zero 0,4 l', price: 8.9, emoji: '🥤', bg: '#ffe0e0', kcal: 1, ingredients: [] },
  { id: 'fanta', cat: 'drinks', name: 'Fanta 0,4 l', price: 8.9, emoji: '🥤', bg: '#ffe0e0', kcal: 150, ingredients: [] },
  { id: 'water', cat: 'drinks', name: 'Woda niegazowana', price: 6.5, emoji: '💧', bg: '#ffe0e0', kcal: 0, ingredients: [] },
  { id: 'juice', cat: 'drinks', name: 'Sok pomarańczowy', price: 7.9, emoji: '🧃', bg: '#ffe0e0', kcal: 110, ingredients: [] },

  // Happy Meal
  { id: 'hm-cheese', cat: 'family', name: 'Happy Meal® Cheeseburger', price: 21.9, emoji: '🎁', bg: '#ffe2e2', kcal: 560, ingredients: ['Cheeseburger', 'Małe frytki', 'Napój', 'Zabawka'] },
  { id: 'hm-nuggets', cat: 'family', name: 'Happy Meal® Chikker', price: 22.9, emoji: '🎁', bg: '#ffe2e2', kcal: 520, ingredients: ['4 nuggetsy', 'Małe frytki', 'Napój', 'Zabawka'] },
];

// Opcje zestawów
export const mealSizes = [
  { id: 'm', name: { pl: 'Średni', en: 'Medium', de: 'Mittel' }, extra: 0 },
  { id: 'l', name: { pl: 'Duży', en: 'Large', de: 'Groß' }, extra: 2.5 },
];
export const mealDrinks = ['Coca-Cola', 'Coca-Cola Zero', 'Fanta', 'Sprite', 'Woda', 'Lipton Ice Tea'];

export const extras = [
  { id: 'cheese', name: 'Ser', price: 1.5 },
  { id: 'bacon', name: 'Bekon', price: 3.0 },
  { id: 'jalapeno', name: 'Jalapeño', price: 1.5 },
];

// Kafle na ekranie głównym menu
export const homeTiles = [
  { cat: 'new', title: { pl: 'Co nowego?', en: "What's new?", de: 'Was ist neu?' }, emoji: '🍔', bg: 'linear-gradient(135deg,#fff 0%,#fff4d1 100%)' },
  { cat: 'meals', title: { pl: 'McZestawy', en: 'Meals', de: 'Menüs' }, emoji: '🍟', bg: 'linear-gradient(135deg,#fff 0%,#ffe1dd 100%)' },
  { cat: 'cafe', title: { pl: 'McCafé®', en: 'McCafé®', de: 'McCafé®' }, emoji: '☕', bg: 'linear-gradient(135deg,#fff 0%,#f3e3d2 100%)' },
  { cat: 'family', title: { pl: 'Odkryj oferty Family', en: 'Family offers', de: 'Family Angebote' }, emoji: '🎁', bg: 'linear-gradient(135deg,#fff 0%,#ffd9d9 100%)', red: true },
];

export const promos = [
  { productId: 'latte', title: 'Łatwo o dobry dzień z kawą', sub: 'za 5 zł', emoji: '☕', bg: 'linear-gradient(135deg,#3aa0ff,#9fd3ff)', color: '#fff' },
  { productId: 'mccrispy-h', title: 'McCrispy® Halloween', sub: 'Edycja limitowana', emoji: '🍔', bg: 'linear-gradient(135deg,#1c1111,#5a1d14)', color: '#ffb347' },
  { productId: 'strips', title: 'McCrispy® Strips', sub: 'Nowość', emoji: '🍗', bg: 'linear-gradient(135deg,#fff3dc,#ffd98a)', color: '#d22' },
  { productId: 'piernik', title: 'Piernikowa Latte', sub: 'Oferta limitowana', emoji: '☕', bg: 'linear-gradient(135deg,#e9b98a,#c9814a)', color: '#fff' },
  { productId: 'veggie', title: 'McVeggie Deluxe', sub: 'Smak Maka. Bez mięsa.', emoji: '🥬', bg: 'linear-gradient(135deg,#c9e86b,#8fc23a)', color: '#1f5a1a' },
  { productId: 'mcflurry', title: 'Wykradzione smaki', sub: 'World Menu', emoji: '🍨', bg: 'linear-gradient(135deg,#ffe36b,#ffc72c)', color: '#2a2a2a' },
];

export const attractSlides = [
  { emoji: '🍔', title: 'McCrispy® Halloween', sub: 'Odważysz się?', bg: 'radial-gradient(circle at 50% 40%, #e3263b 0%, #7a0f2a 45%, #2a0610 100%)' },
  { emoji: '🍟', title: 'Złociste frytki', sub: 'Zawsze chrupiące', bg: 'radial-gradient(circle at 50% 40%, #ffcf3a 0%, #e46d12 50%, #5a1a05 100%)' },
  { emoji: '☕', title: 'McCafé®', sub: 'Kawa za 5 zł codziennie', bg: 'radial-gradient(circle at 50% 40%, #c48a5a 0%, #6a3a1c 50%, #1e0e06 100%)' },
];

export const formatPrice = (v) => `${v.toFixed(2).replace('.', ',')} zł`;
