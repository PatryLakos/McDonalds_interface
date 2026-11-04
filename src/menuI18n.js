// Tłumaczenia tekstów z menu (data.js). Klucz = tekst polski z data.js.
// Brak wpisu → wyświetla się oryginał (np. nazwy marek: Big Mac®, Latte, Fanta).
import { extras, mealSides, mealSizes } from './data.js';

const M = {
  // Nazwy produktów
  'McCrispy® Strips 3 szt.': { en: 'McCrispy® Strips 3 pcs', uk: 'McCrispy® Strips 3 шт.' },
  'Piernikowa Latte': { en: 'Gingerbread Latte', uk: 'Пряниковий лате' },
  'McZestaw Big Mac®': { en: 'Big Mac® Meal', uk: 'Набір Big Mac®' },
  'McZestaw McCrispy®': { en: 'McCrispy® Meal', uk: 'Набір McCrispy®' },
  'McZestaw WieśMac®': { en: 'WieśMac® Meal', uk: 'Набір WieśMac®' },
  'McZestaw Chikker 9 szt.': { en: 'Chikker 9 pcs Meal', uk: 'Набір Chikker 9 шт.' },
  Cheeseburger: { en: 'Cheeseburger', uk: 'Чизбургер' },
  'Podwójny Cheeseburger': { en: 'Double Cheeseburger', uk: 'Подвійний чизбургер' },
  Hamburger: { en: 'Hamburger', uk: 'Гамбургер' },
  'McWrap® Klasyczny': { en: 'McWrap® Classic', uk: 'McWrap® Класичний' },
  'McWrap® Bekon': { en: 'McWrap® Bacon', uk: 'McWrap® з беконом' },
  'Sałatka z kurczakiem': { en: 'Chicken Salad', uk: 'Салат з куркою' },
  'Chikker 6 szt.': { en: 'Chikker 6 pcs', uk: 'Chikker 6 шт.' },
  'Chikker 9 szt.': { en: 'Chikker 9 pcs', uk: 'Chikker 9 шт.' },
  'Chikker 20 szt.': { en: 'Chikker 20 pcs', uk: 'Chikker 20 шт.' },
  'Frytki małe': { en: 'Small Fries', uk: 'Картопля фрі мала' },
  'Frytki średnie': { en: 'Medium Fries', uk: 'Картопля фрі середня' },
  'Frytki duże': { en: 'Large Fries', uk: 'Картопля фрі велика' },
  'Sos czosnkowy': { en: 'Garlic Sauce', uk: 'Часниковий соус' },
  'Shake truskawkowy': { en: 'Strawberry Shake', uk: 'Полуничний шейк' },
  'Lody w rożku': { en: 'Ice Cream Cone', uk: 'Морозиво в ріжку' },
  'Ciastko z jabłkiem': { en: 'Apple Pie', uk: 'Пиріжок з яблуком' },
  'Woda niegazowana': { en: 'Still Water', uk: 'Негазована вода' },
  'Sok pomarańczowy': { en: 'Orange Juice', uk: 'Апельсиновий сік' },

  // Składniki
  'Bułka z czarnym sezamem': { en: 'Black sesame bun', uk: 'Булочка з чорним кунжутом' },
  'Kurczak w panierce': { en: 'Breaded chicken', uk: 'Курка в паніровці' },
  Bekon: { en: 'Bacon', uk: 'Бекон' },
  'Ser cheddar': { en: 'Cheddar cheese', uk: 'Сир чедер' },
  'Sos dyniowy': { en: 'Pumpkin sauce', uk: 'Гарбузовий соус' },
  'Polędwiczki z kurczaka': { en: 'Chicken tenders', uk: 'Курячі філе' },
  Panierka: { en: 'Breading', uk: 'Паніровка' },
  Bułka: { en: 'Bun', uk: 'Булочка' },
  'Kotlet roślinny': { en: 'Plant-based patty', uk: 'Рослинна котлета' },
  Sałata: { en: 'Lettuce', uk: 'Салат' },
  Pomidor: { en: 'Tomato', uk: 'Помідор' },
  'Sos majonezowy': { en: 'Mayo sauce', uk: 'Майонезний соус' },
  Mleko: { en: 'Milk', uk: 'Молоко' },
  'Syrop piernikowy': { en: 'Gingerbread syrup', uk: 'Пряниковий сироп' },
  'Bita śmietana': { en: 'Whipped cream', uk: 'Збиті вершки' },
  Frytki: { en: 'Fries', uk: 'Картопля фрі' },
  Napój: { en: 'Drink', uk: 'Напій' },
  '9 nuggetsów': { en: '9 nuggets', uk: '9 нагетсів' },
  '4 nuggetsy': { en: '4 nuggets', uk: '4 нагетси' },
  Sos: { en: 'Sauce', uk: 'Соус' },
  'Bułka z sezamem': { en: 'Sesame bun', uk: 'Булочка з кунжутом' },
  '2 kotlety wołowe': { en: '2 beef patties', uk: '2 яловичі котлети' },
  'Sos Big Mac': { en: 'Big Mac sauce', uk: 'Соус Big Mac' },
  Ser: { en: 'Cheese', uk: 'Сир' },
  Ogórek: { en: 'Pickle', uk: 'Огірок' },
  Cebula: { en: 'Onion', uk: 'Цибуля' },
  Ketchup: { en: 'Ketchup', uk: 'Кетчуп' },
  Musztarda: { en: 'Mustard', uk: 'Гірчиця' },
  Tortilla: { en: 'Tortilla', uk: 'Тортилья' },
  Kurczak: { en: 'Chicken', uk: 'Курка' },
  'Mix sałat': { en: 'Mixed greens', uk: 'Мікс салатів' },
  Pomidorki: { en: 'Cherry tomatoes', uk: 'Помідори черрі' },
  Dressing: { en: 'Dressing', uk: 'Заправка' },
  Ziemniaki: { en: 'Potatoes', uk: 'Картопля' },
  Sól: { en: 'Salt', uk: 'Сіль' },
  Kawa: { en: 'Coffee', uk: 'Кава' },
  'Spienione mleko': { en: 'Frothed milk', uk: 'Спінене молоко' },
  'Syrop karmelowy': { en: 'Caramel syrup', uk: 'Карамельний сироп' },
  'Lody waniliowe': { en: 'Vanilla ice cream', uk: 'Ванільне морозиво' },
  Ciastka: { en: 'Cookies', uk: 'Печиво' },
  Lody: { en: 'Ice cream', uk: 'Морозиво' },
  'Sos truskawkowy': { en: 'Strawberry sauce', uk: 'Полуничний соус' },
  Wafel: { en: 'Wafer cone', uk: 'Вафельний ріжок' },
  Ciasto: { en: 'Pastry', uk: 'Тісто' },
  'Nadzienie jabłkowe': { en: 'Apple filling', uk: 'Яблучна начинка' },
  'Małe frytki': { en: 'Small fries', uk: 'Мала картопля фрі' },
  Zabawka: { en: 'Toy', uk: 'Іграшка' },

  // Dodatki i napoje w zestawach
  'Mała sałatka': { en: 'Side salad', uk: 'Маленький салат' },
  'Ziemniaczki z ziołami': { en: 'Herb potato wedges', uk: 'Картопля з травами' },
  Marchewki: { en: 'Carrot sticks', uk: 'Морквяні палички' },
  'Kawa mrożona': { en: 'Iced coffee', uk: 'Холодна кава' },

  // Oznaczenia i napoje w zestawach
  NOWOŚĆ: { en: 'NEW', uk: 'НОВИНКА' },
  LIMITOWANA: { en: 'LIMITED', uk: 'ЛІМІТОВАНА' },
  Woda: { en: 'Water', uk: 'Вода' },

  // Kafle promocyjne
  'Łatwo o dobry dzień z kawą': { en: 'A good day starts with coffee', uk: 'Гарний день починається з кави' },
  'za 5 zł': { en: 'for 5 zł', uk: 'за 5 zł' },
  'Edycja limitowana': { en: 'Limited edition', uk: 'Лімітована серія' },
  Nowość: { en: 'New', uk: 'Новинка' },
  'Oferta limitowana': { en: 'Limited offer', uk: 'Обмежена пропозиція' },
  'Smak Maka. Bez mięsa.': { en: 'The Mac taste. No meat.', uk: 'Смак Мака. Без м’яса.' },
  'Wykradzione smaki': { en: 'Stolen flavours', uk: 'Викрадені смаки' },

  // Slajdy ekranu startowego
  'Odważysz się?': { en: 'Dare to try?', uk: 'Наважишся?' },
  'Złociste frytki': { en: 'Golden fries', uk: 'Золотиста картопля фрі' },
  'Zawsze chrupiące': { en: 'Always crispy', uk: 'Завжди хрусткі' },
  'Kawa za 5 zł codziennie': { en: 'Coffee for 5 zł every day', uk: 'Кава за 5 zł щодня' },
};

export const tr = (text, lang) => (lang === 'pl' ? text : M[text]?.[lang] ?? text);

// Szczegóły pozycji koszyka liczone przy wyświetlaniu — zmieniają się razem z językiem
export function lineDetails(line, lang, t) {
  const c = line.config;
  if (!c) return line.details ?? [];
  const d = [];
  if (line.product.meal || c.asMeal) {
    const side = mealSides.find((x) => x.id === c.side);
    d.push(`${t('size')}: ${mealSizes.find((x) => x.id === c.sizeId)?.name[lang]}`);
    if (side) d.push(tr(side.name, lang));
    if (c.drink) d.push(tr(c.drink, lang));
  }
  c.removed.forEach((r) => d.push(`${t('without')}: ${tr(r, lang)}`));
  extras.filter((e) => c.added.includes(e.id)).forEach((e) => d.push(`+ ${tr(e.name, lang)}`));
  return d.filter(Boolean);
}
