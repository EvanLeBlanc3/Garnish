/* Garnish — the home bar app (v6) */
(() => {
'use strict';

// ───────────────────────── Ingredient shelves ─────────────────────────
const BASE_SHELVES = [
 ["Spirits","🥃",["Gin","Vodka","Citrus Vodka","Vanilla Vodka","Pear Vodka","White Rum","Dark Rum","Aged Rum","Spiced Rum","Coconut Rum","Overproof Rum","Tequila Blanco","Tequila Reposado","Mezcal","Whiskey","Bourbon","Rye Whiskey","Scotch Whisky","Islay Scotch","Irish Whiskey","Japanese Whisky","Blended Whiskey","Cognac","Brandy","Apple Brandy","Pisco","Cachaça","Absinthe"]],
 ["Liqueurs & Amari","🍾",["Triple Sec","Orange Curaçao","Blue Curaçao","Grand Marnier","Amaretto","Coffee Liqueur","Irish Cream","Campari","Aperol","Averna","Amaro Nonino","Amer Picon","Fernet-Branca","Suze","Green Chartreuse","Yellow Chartreuse","Maraschino Liqueur","Crème de Violette","Elderflower Liqueur","Crème de Cassis","Crème de Menthe","White Crème de Menthe","Crème de Cacao","Crème de Mûre","Crème de Noyaux","Cherry Heering","Peach Schnapps","Sour Apple Schnapps","Butterscotch Schnapps","Peppermint Schnapps","Watermelon Schnapps","Melon Liqueur","Raspberry Liqueur","Banana Liqueur","Passion Fruit Liqueur","Pear Liqueur","Galliano","Drambuie","Bénédictine","Limoncello","Hpnotiq","Jägermeister","Sloe Gin","Southern Comfort","Licor 43","Sambuca","Pimm's No. 1","Falernum"]],
 ["Wine, Vermouth & Beer","🍷",["Sweet Vermouth","Dry Vermouth","Lillet Blanc","Dry Sherry","Sparkling Wine","Red Wine","White Wine","Rosé Wine","Lager Beer","Stout"]],
 ["Mixers & Sodas","🫧",["Club Soda","Tonic Water","Ginger Beer","Ginger Ale","Cola","Lemon-Lime Soda","Grapefruit Soda","Cream Soda","Root Beer","Energy Drink","Lemonade","Iced Tea","Espresso","Coffee","Hot Chocolate"]],
 ["Juices & Purées","🍊",["Lemon Juice","Lime Juice","Orange Juice","Grapefruit Juice","Pineapple Juice","Cranberry Juice","Cran-Apple Juice","Pomegranate Juice","Tomato Juice","Clamato","Apple Cider","Pear Nectar","Peach Purée","Passion Fruit Purée","Coconut Cream","Pickle Brine","Olive Brine"]],
 ["Syrups & Sweeteners","🍯",["Simple Syrup","Demerara Syrup","Honey Syrup","Honey-Ginger Syrup","Agave Syrup","Grenadine","Orgeat","Cinnamon Syrup","Lavender Syrup","Vanilla Syrup","Raspberry Syrup","Chocolate Syrup","Butterscotch Syrup","Maple Syrup","Pumpkin Spice Syrup","Sour Mix","Sugar","Sugar Cube","Brown Sugar","Orange Marmalade"]],
 ["Bitters & Aromatics","💧",["Angostura Bitters","Orange Bitters","Peychaud's Bitters","Orange Flower Water"]],
 ["Dairy & Eggs","🥚",["Egg White","Whole Egg","Heavy Cream","Half & Half","Milk","Butter","Vanilla Ice Cream","Lime Sherbet"]],
 ["Fresh Produce","🍋",["Lemon","Lime","Orange","Apple","Peach","Banana","Strawberries","Cucumber","Jalapeño","Mint Leaves"]],
 ["Pantry & Spices","🧂",["Black Pepper","Celery Salt","Hot Sauce","Worcestershire Sauce","Horseradish","Cinnamon","Cinnamon Stick","Whole Cloves","Star Anise","Nutmeg","Gelatin Mix"]]
];
const SHELF_BASE_OF = {};
BASE_SHELVES.forEach(([s,,list]) => list.forEach(i => SHELF_BASE_OF[i] = s));
const BOOZE_SHELVES = new Set(["Spirits","Liqueurs & Amari","Wine, Vermouth & Beer"]);
const ALWAYS = new Set(["Hot Water","Cold Water"]);
const BASICS = ["Lemon Juice","Lime Juice","Simple Syrup","Sugar","Club Soda","Angostura Bitters","Lemon","Lime","Black Pepper"];

const WHISKEY_STANDIN = ["Bourbon","Rye Whiskey","Irish Whiskey","Blended Whiskey","Japanese Whisky"];
const ANY_WHISKEY = [...WHISKEY_STANDIN, "Scotch Whisky", "Islay Scotch"];
function covers(name, have) {
  if (ALWAYS.has(name) || have.has(name)) return name;
  if (name === "Whiskey") return ANY_WHISKEY.find(w => have.has(w)) || null;
  if (WHISKEY_STANDIN.includes(name) && have.has("Whiskey")) return "Whiskey";
  return null;
}

const CATS = ["All","Classic","Martini","Sour","Highball","Bubbly","Tiki","Frozen","Dessert","Hot","Shot","Punch","Spooky","Geeky","Mocktail"];
const BASES = ["Any spirit","Gin","Vodka","Rum","Tequila","Whiskey","Brandy","Wine","Beer","Liqueur","Zero-proof"];
const GLASS_WORD = {martini:"martini glass",coupe:"coupe glass",rocks:"rocks glass",highball:"highball glass",collins:"Collins glass",
 margarita:"margarita glass",mule:"copper mug",shot:"shot glass",hurricane:"hurricane glass",wine:"wine glass",julep:"julep cup",
 flute:"Champagne flute",tiki:"tiki mug",irish:"Irish coffee glass",hot:"mug",pitcher:"pitcher",potion:"potion bottle",pint:"pint glass"};
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
const GLASS_LABEL = Object.fromEntries(Object.entries(GLASS_WORD).map(([k, v]) => [k, cap(v)]));
const UP_GLASSES = new Set(["martini","coupe","flute","margarita"]);
const METHOD_NAME = {shake:"Shaken & strained",shakeR:"Shaken, on the rocks",dry:"Dry shaken (egg white)",stir:"Stirred & strained",stirR:"Stirred, on the rocks",
 build:"Built in the glass",muddle:"Muddled & shaken",blend:"Blended",layer:"Layered",custom:"Bartender's method"};

// ───────────────────────── State ─────────────────────────
const KEY = "garnish.v1";
const S = Object.assign({ cab: [], fav: [], units: "oz", sound: true, fx: true, pick: [], custom: [] }, safeLoad());
if (!Array.isArray(S.custom)) S.custom = [];
delete S.closedShelves;
function safeLoad() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } }
function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { toast("Couldn't save — storage full?"); } }

// ───────────────────────── Drinks ─────────────────────────
const slug = s => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const norm = s => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
let SHELF_OF = {}, SHELVES = [];
function parseDrink(r, customId) {
  const [name, cat, glass, method, color, base, desc, ings, garnish, ex = {}] = r;
  const ingredients = ings.map(s => {
    const [a, unit, nm, flags = "", note = ""] = s.split("|");
    const f = new Set(flags.split(",").filter(Boolean));
    const amt = a === "" ? null : parseFloat(a);
    return { amt: isNaN(amt) ? null : amt, unit, name: nm, note, opt: f.has("opt"), top: f.has("top"),
      float: f.has("float"), side: f.has("side"), foam: f.has("foam"), inGlass: f.has("glass") };
  }).filter(i => i.name);
  const required = [...new Set(ingredients.filter(i => !i.opt && !ALWAYS.has(i.name)).map(i => i.name))];
  const alcoholic = ingredients.some(i => !i.opt && BOOZE_SHELVES.has(SHELF_BASE_OF[i.name])) || (!!customId && base !== "None");
  const d = { id: customId || slug(name), name, cat, glass, method, color, base, desc, ingredients, garnish, ex, required, alcoholic, custom: !!customId };
  d.flavors = flavorsOf(d); d.abv = strength(d).abv;
  d.search = norm(d.flavors.join(" ") + " " + name + " " + ingredients.map(i => i.name + " " + i.note).join(" ") + " " + cat + " " + base + (customId ? " mine my recipe custom" : ""));
  return d;
}
// ───────────────────────── Strength & flavor analysis ─────────────────────────
const ABV = {
  "Overproof Rum":75,"Absinthe":60,"Islay Scotch":46,"Green Chartreuse":55,"Yellow Chartreuse":40,"Triple Sec":40,"Grand Marnier":40,
  "Orange Curaçao":30,"Blue Curaçao":22,"Amaretto":24,"Coffee Liqueur":20,"Irish Cream":17,"Campari":24,"Aperol":11,"Averna":29,
  "Amaro Nonino":35,"Amer Picon":18,"Fernet-Branca":39,"Suze":15,"Maraschino Liqueur":32,"Crème de Violette":16,"Elderflower Liqueur":20,
  "Crème de Cassis":16,"Crème de Menthe":24,"White Crème de Menthe":24,"Crème de Cacao":24,"Crème de Mûre":16,"Crème de Noyaux":25,
  "Cherry Heering":24,"Peach Schnapps":20,"Sour Apple Schnapps":18,"Butterscotch Schnapps":18,"Peppermint Schnapps":24,"Watermelon Schnapps":18,
  "Melon Liqueur":20,"Raspberry Liqueur":16.5,"Banana Liqueur":25,"Passion Fruit Liqueur":20,"Pear Liqueur":20,"Galliano":42.3,"Drambuie":40,
  "Bénédictine":40,"Limoncello":30,"Hpnotiq":17,"Jägermeister":35,"Sloe Gin":26,"Southern Comfort":35,"Licor 43":31,"Sambuca":38,
  "Pimm's No. 1":25,"Falernum":11,"Sweet Vermouth":16,"Dry Vermouth":17,"Lillet Blanc":17,"Dry Sherry":15,"Sparkling Wine":12,
  "Red Wine":13.5,"White Wine":12.5,"Rosé Wine":12,"Lager Beer":5,"Stout":4.2
};
const abvOf = n => ABV[n] != null ? ABV[n] : SHELF_BASE_OF[n] === "Spirits" ? 40 : SHELF_BASE_OF[n] === "Liqueurs & Amari" ? 25 : 0;
const VOL_UNIT = { oz: 1, ml: 1 / 30, dash: 1 / 32, drop: 0.002, barspoon: 0.17, tsp: 0.17, tbsp: 0.5, cup: 8, splash: 0.25, scoop: 2 };
function volOz(i) {
  if (i.amt == null) return 0;
  if (i.unit === "whole") return i.name === "Egg White" ? 1 : i.name === "Whole Egg" ? 1.7 : 0;
  return (VOL_UNIT[i.unit] || 0) * i.amt;
}
const DILUTION = { shake: .25, shakeR: .2, dry: .25, muddle: .25, stir: .2, stirR: .15, build: .1, blend: .35, layer: 0, custom: .12 };
// per-glass strength; mult = how many times the spirits are multiplied (Double = 2)
function strength(d, dblSet) {
  let alc = 0, tot = 0;
  d.ingredients.forEach(i => {
    if (i.opt || i.side || i.unit === "rinse") return;
    const v = volOz(i) * (dblSet && dblSet.has(i) ? 2 : 1);
    tot += v; alc += v * abvOf(i.name) / 100;
  });
  const hot = d.cat === "Hot" || ["hot", "irish"].includes(d.glass);
  tot *= 1 + (hot ? 0 : (DILUTION[d.method] || .1));
  const serves = (d.ex && d.ex.serves) || 1;
  const abv = tot ? alc / tot * 100 : 0;
  return { abv, std: alc / serves / 0.6 };
}
function strengthLabel(a) {
  if (a < 0.5) return ["Zero-proof", "🍃"]; if (a < 8) return ["Light", "🪶"]; if (a < 15) return ["Easy-going", "🙂"];
  if (a < 22) return ["Medium", "🥃"]; if (a < 30) return ["Strong", "💪"]; return ["Rocket fuel", "🚀"];
}
const FLAVORS = [["Sweet","🍬"],["Sour","🍋"],["Bitter","🥀"],["Boozy","🥃"],["Fruity","🍓"],["Creamy","🥛"],["Smoky","🔥"],["Spicy","🌶️"],["Herbal","🌿"],["Bubbly","🫧"],["Coffee","☕"]];
const FL_ICON = Object.fromEntries(FLAVORS);
const SYRUPS = new Set(["Simple Syrup","Demerara Syrup","Honey Syrup","Honey-Ginger Syrup","Agave Syrup","Grenadine","Orgeat","Cinnamon Syrup","Lavender Syrup","Vanilla Syrup","Raspberry Syrup","Chocolate Syrup","Butterscotch Syrup","Maple Syrup","Pumpkin Spice Syrup"]);
const SWEET_SODA = new Set(["Cola","Lemon-Lime Soda","Ginger Ale","Cream Soda","Root Beer","Energy Drink","Lemonade","Grapefruit Soda"]);
const SWEET_JUICE = new Set(["Pineapple Juice","Orange Juice","Cran-Apple Juice","Peach Purée","Passion Fruit Purée","Pear Nectar","Apple Cider"]);
const BITTER = new Set(["Campari","Aperol","Fernet-Branca","Averna","Amaro Nonino","Amer Picon","Suze","Tonic Water"]);
const FRUIT = new Set(["Orange Juice","Pineapple Juice","Cranberry Juice","Cran-Apple Juice","Pomegranate Juice","Grapefruit Juice","Apple Cider","Pear Nectar","Peach Purée","Passion Fruit Purée","Peach Schnapps","Sour Apple Schnapps","Watermelon Schnapps","Melon Liqueur","Raspberry Liqueur","Banana Liqueur","Passion Fruit Liqueur","Pear Liqueur","Crème de Cassis","Crème de Mûre","Cherry Heering","Limoncello","Hpnotiq","Sloe Gin","Pear Vodka","Raspberry Syrup","Strawberries","Banana","Peach","Apple","Orange"]);
const CREAMY = new Set(["Heavy Cream","Half & Half","Milk","Irish Cream","Vanilla Ice Cream","Coconut Cream","Whole Egg","Egg White","Lime Sherbet","Butter"]);
const SPICY = new Set(["Jalapeño","Hot Sauce","Horseradish","Ginger Beer","Honey-Ginger Syrup","Cinnamon","Cinnamon Stick","Cinnamon Syrup","Pumpkin Spice Syrup","Whole Cloves","Spiced Rum"]);
const HERBAL = new Set(["Green Chartreuse","Yellow Chartreuse","Bénédictine","Absinthe","Mint Leaves","Jägermeister","Galliano","Elderflower Liqueur","Lavender Syrup","Crème de Violette","Crème de Menthe","White Crème de Menthe","Peppermint Schnapps","Drambuie","Pimm's No. 1","Cucumber","Sambuca","Star Anise"]);
const FIZZ = new Set(["Club Soda","Tonic Water","Ginger Beer","Ginger Ale","Cola","Lemon-Lime Soda","Grapefruit Soda","Cream Soda","Root Beer","Energy Drink","Sparkling Wine","Lager Beer","Stout"]);
const COFFEE = new Set(["Espresso","Coffee","Coffee Liqueur"]);
function flavorsOf(d) {
  const ings = d.ingredients.filter(i => !i.opt && !i.side);
  let sweet = 0, sour = 0, fruit = 0, fizz = 0; const f = new Set();
  for (const i of ings) {
    const v = volOz(i), n = i.name;
    if (n === "Lemon Juice" || n === "Lime Juice") sour += v;
    else if (n === "Sour Mix") { sour += v; sweet += v * .5; }
    else if (n === "Grapefruit Juice") sour += v * .4;
    else if (n === "Cranberry Juice" || n === "Pomegranate Juice") sour += v * .3;
    else if ((n === "Lime" || n === "Lemon") && i.unit !== "slice") sour += (i.unit === "whole" ? 1 : .3) * (i.amt || 1);
    if (SYRUPS.has(n)) sweet += v;
    else if (n === "Sugar") sweet += (i.unit === "cup" ? 8 : .35) * (i.amt || 0);
    else if (n === "Sugar Cube") sweet += .25 * (i.amt || 1);
    else if (n === "Brown Sugar") sweet += (i.unit === "cup" ? 8 : .35) * (i.amt || 0);
    else if (SHELF_BASE_OF[n] === "Liqueurs & Amari" && !BITTER.has(n)) sweet += v * .7;
    else if (SWEET_SODA.has(n)) sweet += v * .25;
    else if (SWEET_JUICE.has(n)) sweet += v * .2;
    else if (n === "Coconut Cream") sweet += v * .6;
    else if (n === "Vanilla Ice Cream" || n === "Lime Sherbet") sweet += (i.amt || 1);
    else if (n === "Sweet Vermouth") sweet += v * .3;
    else if (n === "Gelatin Mix") { sweet += 1; fruit += 1; }
    if (FRUIT.has(n)) fruit += Math.max(v, ["whole", "slice", "wedge"].includes(i.unit) ? 1 : 0);
    if (FIZZ.has(n)) fizz += v;
    if (BITTER.has(n) && (v >= .5 || n === "Fernet-Branca")) f.add("Bitter");
    if (CREAMY.has(n)) f.add("Creamy");
    if (n === "Mezcal" || n === "Islay Scotch") f.add("Smoky");
    if (SPICY.has(n)) f.add("Spicy");
    if (HERBAL.has(n) || (n === "Gin" && v >= 1.5)) f.add("Herbal");
    if (COFFEE.has(n)) f.add("Coffee");
  }
  if (sweet - sour * .5 >= .6) f.add("Sweet");
  if (sour >= .6) f.add("Sour");
  if (fruit >= 1) f.add("Fruity");
  if (fizz >= 1) f.add("Bubbly");
  if (strength(d).abv >= 23 && fizz < 1) f.add("Boozy");
  return FLAVORS.map(x => x[0]).filter(x => f.has(x));
}

const BUILTIN = window.DRINKS.map(r => parseDrink(r));
const clean = s => String(s == null ? "" : s).replace(/\|/g, "/");
function customToTuple(c) {
  return [c.name, c.cat, c.glass, c.method, c.color, c.base, c.desc || "",
    c.ings.map(i => `${i.amt == null ? "" : i.amt}|${i.unit}|${clean(i.name)}|${i.flag || ""}|${clean(i.note)}`),
    c.garnish || "None", c.steps && c.steps.length ? { steps: c.steps } : {}];
}
let DR = [], BY_ID = {}, ALL_INGS = [], USES = {};
function rebuild() {
  DR = [...BUILTIN, ...S.custom.map(c => parseDrink(customToTuple(c), c.id))].sort((a, b) => a.name.localeCompare(b.name));
  BY_ID = Object.fromEntries(DR.map(d => [d.id, d]));
  ALL_INGS = [...new Set(DR.flatMap(d => d.ingredients.map(i => i.name)))].filter(n => !ALWAYS.has(n));
  SHELF_OF = { ...SHELF_BASE_OF };
  SHELVES = BASE_SHELVES.map(([s, i, l]) => [s, i, l.slice()]);
  const mine = ALL_INGS.filter(n => !SHELF_OF[n]).sort();
  mine.forEach(n => SHELF_OF[n] = "My Ingredients");
  if (mine.length) SHELVES.push(["My Ingredients", "🧪", mine]);
  USES = {}; DR.forEach(d => d.required.forEach(n => USES[n] = (USES[n] || 0) + 1));
  USES["Whiskey"] = DR.filter(d => d.required.some(n => n === "Whiskey" || WHISKEY_STANDIN.includes(n))).length;
  const dl = document.getElementById("ingList");
  if (dl) dl.innerHTML = [...new Set([...Object.keys(SHELF_OF), ...ALL_INGS])].sort().map(n => `<option value="${esc(n)}">`).join("");
}
const cab = () => new Set(S.cab);
const isFav = id => S.fav.includes(id);
const missingFor = (d, have) => d.required.filter(n => !covers(n, have));

// ───────────────────────── Helpers ─────────────────────────
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
function esc(s) { return String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }

const FR = { 0.25: "¼", 0.33: "⅓", 0.5: "½", 0.66: "⅔", 0.67: "⅔", 0.75: "¾" };
function frac(n) {
  const w = Math.floor(n + 1e-9), r = +(n - w).toFixed(2);
  if (r === 0) return String(w);
  const f = FR[r]; if (f) return (w ? w : "") + f;
  return String(+n.toFixed(2));
}
function mlOf(oz) {
  const ml = oz * 30;
  if (ml >= 100) return Math.round(ml / 5) * 5;
  const v = Math.round(ml / 2.5) * 2.5;
  return v % 1 ? v.toFixed(1) : v;
}
const PLURAL = { dash: "dashes", drop: "drops", barspoon: "barspoons", cup: "cups", scoop: "scoops", slice: "slices", wedge: "wedges",
  cube: "cubes", pinch: "pinches", box: "boxes", splash: "splashes", rinse: "rinses" };
function fmtAmt(i, mult = 1) {
  const u = i.unit; if (i.amt == null) return u === "top" ? "top up" : "";
  const a = i.amt * mult;
  if (u === "oz") {
    if (S.units === "ml") { const ml = a * 30; return ml >= 1000 ? +(ml / 1000).toFixed(2) + " L" : mlOf(a) + " ml"; }
    const q = Math.round(a * 4) / 4 || a;
    return frac(q) + " oz" + (a >= 16 ? ` (${frac(Math.round(a / 8 * 4) / 4)} cups)` : "");
  }
  if (u === "ml") return S.units === "ml" ? +a.toFixed(1) + " ml" : frac(Math.round(a / 30 * 4) / 4 || +(a / 30).toFixed(2)) + " oz";
  if (u === "cup") return S.units === "ml" ? Math.round(a * 240) + " ml" : frac(a) + (a > 1 ? " cups" : " cup");
  if (u === "tsp" || u === "tbsp") return S.units === "ml" ? +(a * (u === "tsp" ? 5 : 15)).toFixed(1) + " ml" : frac(a) + " " + u;
  if (u === "rinse") return "rinse";
  if (u === "splash") return mult > 1 ? `${Math.round(mult)} splashes` : "splash";
  if (u === "top") return "top up";
  if (mult > 1 && a > 1) { const r = Math.round(a * 4) / 4; if (u === "whole" || u === "leaves") return frac(r) + (u === "leaves" ? " leaves" : ""); return frac(r) + " " + (PLURAL[u] || u); }
  if (u === "whole" || u === "leaves") return frac(a) + (u === "leaves" ? " leaves" : "");
  return frac(a) + " " + (a > 1 ? (PLURAL[u] || u) : u);
}
function ingLabel(i) { let n = i.name; if (i.unit === "whole" && i.amt > 1 && !/s$|Anise$/.test(n)) n += "s"; return n; }
function listJoin(arr) { return arr.length <= 1 ? arr.join("") : arr.slice(0, -1).join(", ") + " and " + arr[arr.length - 1]; }

const DOUBLE_UNITS = new Set(["oz", "ml", "barspoon", "tsp", "tbsp"]);
function doubleSet(d) {
  if (d.ex.nodouble || !d.alcoholic || d.cat === "Mocktail") return new Set();
  const pick = shelf => d.ingredients.filter(i => SHELF_OF[i.name] === shelf && DOUBLE_UNITS.has(i.unit) && i.amt != null && !i.side);
  let s = pick("Spirits"); if (!s.length) s = pick("Liqueurs & Amari");
  return new Set(s);
}

// ───────────────────────── Step generator ─────────────────────────
function buildSteps(d) {
  if (d.ex.steps) return d.ex.steps.slice();
  const gl = GLASS_WORD[d.glass] || "glass";
  const ings = d.ingredients;
  const main = ings.filter(i => !i.top && !i.float && !i.side && !i.foam && !i.inGlass && i.unit !== "rinse");
  const tops = ings.filter(i => i.top), floats = ings.filter(i => i.float), side = ings.filter(i => i.side), foam = ings.filter(i => i.foam);
  const rinse = ings.filter(i => i.unit === "rinse" && !(d.ex.pre || []).length);
  const names = arr => listJoin(arr.map(i => (i.opt ? i.name + " (if using)" : i.name)));
  const steps = [];
  const up = UP_GLASSES.has(d.glass);
  if (up && d.method !== "build") steps.push(`Chill your ${gl} — pop it in the freezer or fill it with ice water while you mix.`);
  (d.ex.pre || []).forEach(p => steps.push(p));
  if (rinse.length) steps.push(`Rinse the glass with ${names(rinse)}: swirl a little to coat the inside, then pour out the excess.`);
  if (!main.length && !tops.length) { steps.push(`Prepare your ${gl}, add the ingredients and enjoy.`); return steps; }
  switch (d.method) {
    case "shake":
      steps.push(`Add the ${names(main)} to a cocktail shaker.`);
      steps.push("Fill the shaker about ¾ full with ice, seal it tight and shake hard for 12–15 seconds, until the outside is frosty.");
      steps.push(`Double-strain (through the shaker's strainer and a fine-mesh sieve) into the ${up ? "chilled " : ""}${gl}${up || d.glass === "shot" ? "" : " over fresh ice"}.`);
      break;
    case "shakeR":
      steps.push(`Add the ${names(main)} to a cocktail shaker.`);
      steps.push("Fill with ice and shake hard for 10–12 seconds.");
      steps.push(`Strain into a ${gl} filled with fresh ice.`);
      break;
    case "dry":
      steps.push(`Add the ${names(main)} to a shaker — no ice yet.`);
      steps.push("Dry shake hard for 10–15 seconds. This whips the egg white into a silky, velvety foam.");
      steps.push("Now add ice and shake again for 12–15 seconds until well chilled.");
      steps.push(d.glass === "rocks" ? `Strain into a ${gl} over fresh ice and let the foam settle on top.` :
        `Strain into the ${up ? "chilled " : ""}${gl} (no ice) and let the foam settle for a few seconds.`);
      if (ings.some(i => i.name === "Egg White" && i.opt)) steps.push("Skipping the egg white? No problem — just do one regular shake with ice.");
      break;
    case "stir":
      steps.push(`Add the ${names(main)} to a mixing glass.`);
      steps.push("Fill with ice and stir smoothly with a bar spoon for 20–30 seconds — you want it silky and very cold, never cloudy.");
      steps.push(`Strain into the chilled ${gl}.`);
      break;
    case "stirR":
      steps.push(`Add the ${names(main)} to a mixing glass.`);
      steps.push("Fill with ice and stir for 20–30 seconds until the glass sweats.");
      steps.push(`Strain into a ${gl} over one large ice cube.`);
      break;
    case "muddle": {
      const fresh = main.filter(i => ["leaves", "slice", "wedge", "whole"].includes(i.unit));
      const rest = main.filter(i => !fresh.includes(i));
      if (fresh.length) steps.push(`Gently muddle the ${names(fresh)} in a shaker — press to release the oils, don't pulverize.`);
      if (rest.length) steps.push(`Add the ${names(rest)}, then fill with ice.`); else steps.push("Fill with ice.");
      steps.push("Shake hard for 12–15 seconds.");
      steps.push(`Double-strain into the ${up ? "chilled " : ""}${gl} so no little green bits sneak through.`);
      break;
    }
    case "blend":
      steps.push(`Add the ${names(main)} to a blender with about 1 cup of ice.`);
      steps.push("Blend on high for 20–30 seconds until smooth and slushy. Too thin? Add ice. Too thick? A splash of juice.");
      steps.push(`Pour into a ${gl}.`);
      break;
    case "layer":
      steps.push(`Pour the ${main[0].name} into a ${gl}.`);
      main.slice(1).forEach(i => steps.push(`Hold a bar spoon upside down just above the surface and slowly pour the ${i.name} over its back so it floats in its own layer.`));
      steps.push("Admire your stripes for exactly one second, then enjoy.");
      break;
    default:
      if (main.length) {
        if (up) steps.push(`Pour the ${names(main)} into a chilled ${gl}.`);
        else { steps.push(`Fill a ${gl} with ice.`); steps.push(`Pour in the ${names(main)}.`); }
      } else if (!up) steps.push(`Fill a ${gl} with ice.`);
  }
  if (floats.length) steps.push(`Float the ${names(floats)} on top by pouring slowly over the back of a bar spoon.`);
  if (tops.length) steps.push(`Top with ${names(tops)}${d.method === "build" || d.method === "custom" ? " and give it one gentle stir to combine" : ""}.`);
  else if ((d.method === "build" || d.method === "custom") && !up && main.length) steps.push("Give it a gentle stir to combine.");
  if (foam.length) steps.push(`Dot the ${names(foam)} onto the foam — drag a toothpick through the drops for a little latte art.`);
  if (side.length) steps.push(`Serve the ${names(side)} on the side.`);
  (d.ex.post || []).forEach(p => steps.push(p));
  if (d.garnish && !/^none/i.test(d.garnish) && d.custom) steps.push(`Garnish: ${d.garnish}.`);
  return steps;
}

// ───────────────────────── Glass SVGs ─────────────────────────
const GL = {
 martini:{b:"M12 20 L88 20 L52 62 L48 62 Z",l:"M19 27 L81 27 L51 59 L49 59 Z",x:'<rect x="48.6" y="61" width="2.8" height="37" rx="1"/><ellipse cx="50" cy="100" rx="20" ry="4"/>',rim:[84,20],top:27},
 coupe:{b:"M14 28 L86 28 Q86 62 50 64 Q14 62 14 28 Z",l:"M18 34 L82 34 Q80 58 50 60 Q20 58 18 34 Z",x:'<rect x="48.6" y="63" width="2.8" height="35" rx="1"/><ellipse cx="50" cy="100" rx="18" ry="4"/>',rim:[84,28],top:34},
 rocks:{b:"M20 48 L80 48 L77 106 Q77 110 73 110 L27 110 Q23 110 23 106 Z",l:"M22.6 62 L77.4 62 L75 104 Q75 107 72 107 L28 107 Q25 107 25 104 Z",ice:[[32,66,16],[50,72,15]],rim:[78,48],top:62},
 highball:{b:"M28 18 L72 18 L70 108 Q70 111 67 111 L33 111 Q30 111 30 108 Z",l:"M30.6 30 L69.4 30 L68 107 Q68 109 66 109 L34 109 Q32 109 32 107 Z",ice:[[36,36,13],[50,52,13],[37,70,12]],straw:1,rim:[70,18],top:30},
 collins:{b:"M32 8 L68 8 L67 108 Q67 111 64 111 L36 111 Q33 111 33 108 Z",l:"M34.4 20 L65.6 20 L64.8 107 Q64.8 109 63 109 L37 109 Q35.2 109 35.2 107 Z",ice:[[38,26,11],[49,42,11],[38,60,10]],straw:1,rim:[67,8],top:20},
 margarita:{b:"M8 22 L92 22 Q90 40 66 44 Q58 46 56 56 Q54 64 51 66 L49 66 Q46 64 44 56 Q42 46 34 44 Q10 40 8 22 Z",l:"M13 28 L87 28 Q84 38 64 41 Q56 43 54 54 Q52 62 50 63 Q48 62 46 54 Q44 43 36 41 Q16 38 13 28 Z",x:'<rect x="48.6" y="65" width="2.8" height="33" rx="1"/><ellipse cx="50" cy="100" rx="19" ry="4"/>',rim:[90,22],top:28},
 mule:{solid:"copper",b:"M24 32 L76 32 L74 106 Q74 110 70 110 L30 110 Q26 110 26 106 Z",h:"M75 46 Q94 48 92 68 Q90 88 74 88",surf:[50,34,25,3.5],rim:[74,32]},
 julep:{solid:"silver",b:"M28 34 L72 34 L70 104 Q70 108 66 108 L34 108 Q30 108 30 104 Z",dome:1,rim:[70,34]},
 tiki:{solid:"tiki",b:"M28 16 Q23 60 30 108 L70 108 Q77 60 72 16 Z",surf:[50,17,21,3],face:1,rim:[72,16]},
 hot:{solid:"mug",b:"M24 34 L72 34 L70 104 Q70 110 64 110 L32 110 Q26 110 26 104 Z",h:"M71 48 Q90 50 88 70 Q86 88 70 88",surf:[48,36,23,3.5],steam:1,rim:[72,34]},
 shot:{b:"M33 58 L67 58 L64 106 Q64 110 60 110 L40 110 Q36 110 36 106 Z",l:"M35.6 68 L64.4 68 L62 102 Q62 104 60 104 L40 104 Q38 104 38 102 Z",rim:[66,58],top:68},
 hurricane:{b:"M30 10 Q20 36 36 56 Q26 76 36 92 L64 92 Q74 76 64 56 Q80 36 70 10 Z",l:"M29.7 22 Q23.5 38 38.5 56 Q29.5 75 38.3 89 L61.7 89 Q70.5 75 61.5 56 Q76.5 38 70.3 22 Z",x:'<rect x="46" y="91" width="8" height="9" rx="2"/><ellipse cx="50" cy="104" rx="19" ry="4"/>',straw:1,rim:[70,10],top:22},
 wine:{b:"M26 12 L74 12 Q78 50 52 62 L48 62 Q22 50 26 12 Z",l:"M26.6 30 L73.4 30 Q73 52 51 59 L49 59 Q27 52 26.6 30 Z",x:'<rect x="48.6" y="61" width="2.8" height="37" rx="1"/><ellipse cx="50" cy="100" rx="19" ry="4"/>',ice:[[38,34,11],[52,38,10]],rim:[74,12],top:30},
 flute:{b:"M37 6 L63 6 Q65 50 52 70 L48 70 Q35 50 37 6 Z",l:"M37.7 18 L62.3 18 Q63.4 50 51 67 L49 67 Q36.6 50 37.7 18 Z",x:'<rect x="48.6" y="69" width="2.8" height="31" rx="1"/><ellipse cx="50" cy="102" rx="15" ry="3.5"/>',rim:[63,6],top:18},
 irish:{b:"M28 20 L72 20 L68 76 Q66 82 58 82 L42 82 Q34 82 32 76 Z",l:"M30.4 32 L69.6 32 L66.4 75 Q65 79 58 79 L42 79 Q35 79 33.6 75 Z",h:"M71 30 Q86 32 84 48 Q82 62 69 64",x:'<rect x="47" y="81" width="6" height="16" rx="2"/><ellipse cx="50" cy="100" rx="18" ry="4"/>',cream:1,rim:[72,20],top:32},
 pitcher:{b:"M26 16 L74 16 L82 10 L77 26 Q81 70 72 106 Q70 110 66 110 L34 110 Q30 110 28 106 Q19 70 26 16 Z",l:"M27.4 32 L76.6 32 Q79 70 70 103 Q69 107 66 107 L34 107 Q31 107 30 103 Q21 70 27.4 32 Z",h:"M27 30 Q8 34 10 58 Q12 82 28 86",fruit:1,rim:[74,16],top:32},
 potion:{b:"M42 14 L58 14 L58 38 Q82 48 80 77 Q78 107 50 108 Q22 107 20 77 Q18 48 42 38 Z",l:"M22.6 60 L77.4 60 Q79 104 50 105 Q21 104 22.6 60 Z",cork:1,rim:[58,14],top:60},
 pint:{b:"M26 8 L74 8 L72 30 Q70 40 71 50 L67 108 Q67 111 64 111 L36 111 Q33 111 33 108 L29 50 Q30 40 28 30 Z",l:"M28.6 18 L71.4 18 L69.8 30 Q68 40 69 50 L65 107 Q65 109 63 109 L37 109 Q35 109 35 107 L31 50 Q32 40 30.2 30 Z",rim:[73,8],top:18}
};
let gid = 0;
function shade(hex, f) {
  if (!/^#[0-9a-f]{6}$/i.test(hex)) hex = "#e0952e";
  const n = parseInt(hex.slice(1), 16); let r = n >> 16, g = (n >> 8) & 255, b = n & 255;
  if (f > 0) { r += (255 - r) * f; g += (255 - g) * f; b += (255 - b) * f; } else { r *= 1 + f; g *= 1 + f; b *= 1 + f; }
  return `rgb(${r | 0},${g | 0},${b | 0})`;
}
function garnishSVG(d, G) {
  const t = (d.garnish || "").toLowerCase(); if (!G.rim || !t || /^none/.test(t)) return "";
  const [rx, ry] = G.rim; let s = "";
  if (/salt|sugar|tajín|tajin|graham|rim/.test(t) && !G.solid)
    s += `<line x1="${100 - rx}" y1="${ry}" x2="${rx}" y2="${ry}" stroke="#fff6e8" stroke-width="3" stroke-dasharray="1.2 1.5" stroke-linecap="round" opacity=".9"/>`;
  const wheel = (c1, c2) => `<g transform="translate(${rx - 2},${ry - 3})"><circle r="9" fill="${c1}"/><circle r="7.2" fill="${c2}"/>${[0,60,120].map(a => `<line x1="0" y1="-7" x2="0" y2="7" stroke="${c1}" stroke-width=".9" transform="rotate(${a})"/>`).join("")}</g>`;
  if (/lime/.test(t)) s += wheel("#5f9a2a", "#c6e47a");
  else if (/lemon/.test(t)) s += wheel("#e0b81a", "#fbe98a");
  else if (/orange/.test(t)) s += wheel("#e0701a", "#f8b25a");
  else if (/grapefruit/.test(t)) s += wheel("#e0703a", "#f5a090");
  else if (/pineapple/.test(t)) s += `<g transform="translate(${rx - 4},${ry - 10})"><path d="M0 14 L14 0 L16 16 Z" fill="#f5cf4a" stroke="#c99a1a" stroke-width=".8"/><path d="M14 0 l3 -9 l1 8 l4 -6 l-2 9" fill="#5a9a2a"/></g>`;
  if (/cherr/.test(t)) s += `<g transform="translate(${rx - 18},${ry + 2})"><path d="M0 0 Q4 -12 12 -16" stroke="#6a3a1a" stroke-width="1.2" fill="none"/><circle r="4.6" fill="#b3122a"/><circle cx="-1.4" cy="-1.4" r="1.2" fill="#ff8a9a"/></g>`;
  if (/olive|onion|pickle|gherkin/.test(t)) {
    const oc = /onion/.test(t) ? "#efe8d6" : /pickle|gherkin/.test(t) ? "#6f8a2a" : "#7a9a2a";
    s += `<g><line x1="${rx - 34}" y1="${(G.top || ry) + 22}" x2="${rx + 6}" y2="${ry - 12}" stroke="#d8b878" stroke-width="1.6"/><circle cx="${rx - 22}" cy="${(G.top || ry) + 10}" r="4.6" fill="${oc}"/><circle cx="${rx - 16}" cy="${(G.top || ry) + 3}" r="4.6" fill="${oc}"/></g>`;
  }
  if (/mint/.test(t)) s += `<g transform="translate(${rx - 16},${ry - 4})">${[[-6,-6,-30],[2,-10,10],[8,-4,40]].map(([x,y,a]) => `<ellipse cx="${x}" cy="${y}" rx="4" ry="7.5" fill="#4fa84a" transform="rotate(${a} ${x} ${y})"/>`).join("")}</g>`;
  if (/coffee bean/.test(t)) s += `<g>${[[-9,0],[0,-1],[9,0]].map(([x,y]) => `<ellipse cx="${50 + x}" cy="${(G.top || 30) + 1 + y}" rx="3" ry="2" fill="#2a1408"/>`).join("")}</g>`;
  if (/umbrella/.test(t)) s += `<g transform="translate(${rx - 8},${ry - 14})"><line x1="0" y1="0" x2="10" y2="24" stroke="#d8b878" stroke-width="1.2"/><path d="M-12 4 Q0 -10 12 -4 Z" fill="#e8474a"/></g>`;
  if (/cinnamon stick/.test(t)) s += `<rect x="${rx - 14}" y="${ry - 16}" width="4" height="26" rx="2" fill="#8a4a1e" transform="rotate(18 ${rx - 12} ${ry})"/>`;
  if (/whipped|cream/.test(t) && G.surf) { const [cx, cy, w] = G.surf; s += `<path d="M${cx - w + 2} ${cy} Q${cx - w / 2} ${cy - 12} ${cx} ${cy - 8} Q${cx + w / 2} ${cy - 14} ${cx + w - 2} ${cy} Z" fill="#fff5e6"/>`; }
  if (/strawberr|raspberr|blackberr|berr/.test(t)) s += `<g transform="translate(${rx - 6},${ry - 2})"><path d="M-6 -2 Q0 12 6 -2 Q0 -6 -6 -2 Z" fill="${/black/.test(t) ? "#3a1030" : "#d8283a"}"/><path d="M-4 -4 l4 -4 l4 4" fill="#4fa84a"/></g>`;
  return s;
}
// drop + ripple + splash pieces for the hero glass (surface at y = top)
function dropFX(c, top, clipId) {
  const drop = `<g class="dropfall" style="--dy:${top + 4}px"><path d="M50 -16 Q46.4 -9.5 46.4 -6.6 A3.6 3.6 0 0 0 53.6 -6.6 Q53.6 -9.5 50 -16 Z" fill="${shade(c, .2)}" stroke="rgba(255,255,255,.65)" stroke-width=".7"/><ellipse cx="48.8" cy="-7.5" rx=".9" ry="1.4" fill="rgba(255,255,255,.8)"/></g>`;
  const rings = `<g ${clipId ? `clip-path="url(#${clipId})"` : ""}><ellipse class="ring" cx="50" cy="${top + .5}" rx="3" ry=".9" fill="none" stroke="rgba(255,255,255,.85)" stroke-width=".5"/><ellipse class="ring r2" cx="50" cy="${top + .5}" rx="3" ry=".9" fill="none" stroke="rgba(255,255,255,.6)" stroke-width=".4"/></g>`;
  const spl = [[-7, 1.1], [6, 1.3], [-2, .9], [9, .8]].map(([sx, r]) => `<circle class="splash" style="--sx:${sx}px" cx="50" cy="${top - 1}" r="${r}" fill="${shade(c, .35)}"/>`).join("");
  return rings + spl + drop;
}
function glassSVG(d, opts = {}) {
  const G = GL[d.glass] || GL.rocks; const id = "g" + (++gid); const c = /^#[0-9a-f]{6}$/i.test(d.color) ? d.color : "#e0952e";
  const hero = !!opts.hero, an = !!opts.anim;
  const glassStroke = 'stroke="rgba(255,236,210,.6)" stroke-width="1.5"';
  let defs = `<linearGradient id="${id}l" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${shade(c, .25)}"/><stop offset="1" stop-color="${shade(c, -.35)}"/></linearGradient>`;
  let body = "", fxTop = "";
  const ings = d.ingredients || [];
  const noIce = ["Hot", "Frozen"].includes(d.cat) || d.method === "blend";
  if (G.solid) {
    const mats = { copper: ["#e59a5e", "#9a4e22"], silver: ["#f0f0f2", "#8a8e96"], tiki: ["#a8693a", "#5a2e14"], mug: ["#3a3a40", "#1c1c22"] };
    const [a, b] = mats[G.solid];
    defs += `<linearGradient id="${id}m" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${b}"/><stop offset=".35" stop-color="${a}"/><stop offset=".6" stop-color="${b}"/><stop offset="1" stop-color="${shade(b, -.3)}"/></linearGradient>`;
    if (G.h) body += `<path d="${G.h}" fill="none" stroke="url(#${id}m)" stroke-width="6" stroke-linecap="round"/>`;
    body += `<path d="${G.b}" fill="url(#${id}m)"/>`;
    if (G.surf) {
      const [cx, cy, rx, ry] = G.surf;
      body += `<ellipse class="liq" cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="url(#${id}l)"/>`;
      if (hero) body += `<ellipse class="shimmer" cx="${cx - rx * .3}" cy="${cy - .4}" rx="${rx * .35}" ry="${ry * .45}" fill="#fff"/>`;
      if (hero && an) fxTop = dropFX(c, cy, null);
    }
    if (G.dome) body += `<path d="M30 36 Q50 14 70 36 Z" fill="#f4f8fb"/><g fill="#4fa84a"><ellipse cx="44" cy="18" rx="4" ry="8" transform="rotate(-25 44 18)"/><ellipse cx="52" cy="14" rx="4" ry="8"/><ellipse cx="59" cy="19" rx="4" ry="8" transform="rotate(25 59 19)"/></g>`;
    if (G.solid === "silver") body += `<path d="M33 40 L35 100" stroke="#fff" stroke-width="3" opacity=".5"/>`;
    if (G.face) body += `<g fill="none" stroke="#2e1608" stroke-width="2.2" stroke-linecap="round"><path d="M35 42 h10 M55 42 h10"/><path d="M38 50 q2 4 4 0 M58 50 q2 4 4 0"/><path d="M50 52 v14"/><path d="M36 78 h28 M40 78 v8 M46 78 v8 M54 78 v8 M60 78 v8 M36 86 h28"/></g>`;
    if (G.steam) body += `<g fill="none" stroke="rgba(255,240,220,.5)" stroke-width="2" stroke-linecap="round"><path class="steam" d="M40 28 q-4 -6 0 -12 q4 -6 0 -12"/><path class="steam" style="animation-delay:1s" d="M50 26 q-4 -6 0 -12 q4 -6 0 -12"/><path class="steam" style="animation-delay:2s" d="M58 28 q-4 -6 0 -12 q4 -6 0 -12"/></g>`;
    if (G.solid === "copper") body += `<path d="M30 40 L32 98" stroke="rgba(255,255,255,.35)" stroke-width="2.5" stroke-linecap="round"/>`;
    if (hero && an && G.solid !== "mug" && G.solid !== "tiki") {
      defs += `<clipPath id="${id}g"><path d="${G.b}"/></clipPath>`;
      body += `<g clip-path="url(#${id}g)"><rect class="glint" x="20" y="0" width="9" height="130" fill="rgba(255,255,255,.55)"/></g>`;
    }
  } else {
    const top = G.top || 30;
    defs += `<clipPath id="${id}c"><path d="${hero ? G.b : G.l}"/></clipPath>`;
    if (G.h) body += `<path d="${G.h}" fill="none" stroke-width="4" stroke="rgba(255,236,210,.45)"/>`;
    if (G.x) body += `<g fill="rgba(255,236,210,.55)">${G.x}</g>`;
    body += `<path d="${G.b}" fill="rgba(255,240,220,.06)"/>`;
    body += `<g clip-path="url(#${id}c)">`;
    if (hero) {
      // wavy liquid surface that sloshes when it lands
      const wl = 20, amp = 1.6;
      let wave = `M-60 ${top}`; for (let x = -60; x < 170; x += wl) wave += ` q${wl / 4} ${-amp} ${wl / 2} 0 t${wl / 2} 0`;
      const line = wave;
      wave += ` L170 130 L-60 130 Z`;
      // keep liquid inside the inner liquid shape horizontally (thin wall look) using a second clip
      defs += `<clipPath id="${id}i"><path d="${G.l}"/><rect x="0" y="${top - 6}" width="100" height="10"/></clipPath>`;
      body += `<g clip-path="url(#${id}i)"><g class="slosh${an ? " go" : ""}" style="transform-origin:50px ${top + 25}px"><g class="liq">
        <path class="wave" d="${wave}" fill="url(#${id}l)"/>
        <path class="wave w2" d="${line}" fill="none" stroke="${shade(c, .55)}" stroke-width=".9" opacity=".7"/></g></g></g>`;
    } else {
      body += `<path class="liq" d="${G.l}" fill="url(#${id}l)"/>`;
    }
    if (G.cream) body += `<rect class="liq" x="20" y="32" width="60" height="10" fill="#f6ead2"/>`;
    if (d.glass === "pint" && (d.base === "Beer" || /root beer|float/i.test(d.name || ""))) body += `<rect x="20" y="18" width="60" height="8" fill="#fbf1dc"/>`;
    if (G.ice && !noIce) G.ice.forEach(([x, y, s]) => body += `<g class="ice"><rect x="${x}" y="${top + y - 30}" width="${s}" height="${s}" rx="2.5" fill="rgba(255,255,255,.22)" stroke="rgba(255,255,255,.45)" stroke-width=".8" transform="rotate(${(x * 7) % 20 - 10} ${x + s / 2} ${y})"/></g>`);
    if (G.fruit) body += `<circle cx="40" cy="70" r="8" fill="#f5a03a" opacity=".85"/><circle cx="58" cy="84" r="7" fill="#f0e070" opacity=".8"/><rect x="44" y="92" width="9" height="9" fill="#e85a4a" opacity=".8"/>`;
    const fizzy = ings.some(i => /Soda|Tonic|Sparkling|Ginger|Cola|Beer|Lager|Energy|Root|Prosecco|Champagne/i.test(i.name)) || d.cat === "Bubbly";
    const nb = fizzy ? (hero ? 10 : 6) : (hero ? 3 : 0);
    for (let k = 0; k < nb; k++) { const bx = 38 + ((k * 37) % 26), by = 102 - (k * 13) % 30; body += `<circle class="bub" cx="${bx}" cy="${by}" r="${1 + (k % 3) * .5}" fill="rgba(255,255,255,.7)" style="animation-delay:${k * .45 + (hero && an ? 1.2 : 0)}s"/>`; }
    if (hero && an) body += `<rect class="glint" x="20" y="-10" width="9" height="140" fill="rgba(255,255,255,.5)"/>`;
    body += `</g>`;
    if (hero && an) fxTop = dropFX(c, top, `${id}c`);
    body += `<path d="${G.b}" fill="none" ${glassStroke}/>`;
    body += `<path d="${G.b}" fill="none" stroke="rgba(255,255,255,.18)" stroke-width="3" stroke-dasharray="0 6 24 400" />`;
    if (G.cork) body += `<rect x="41" y="4" width="18" height="12" rx="2" fill="#a8743a"/><rect x="40" y="13" width="20" height="3" fill="#7a4a1e"/>`;
    if (G.straw) body += `<line x1="${G.rim[0] - 12}" y1="${(G.top || 20) + 30}" x2="${G.rim[0] + 2}" y2="${G.rim[1] - 14}" stroke="#e8743a" stroke-width="2.4" stroke-linecap="round" opacity=".9"/>`;
  }
  const garn = garnishSVG(d, G);
  body += hero ? `<g class="garn">${garn}</g>` : garn;
  body += fxTop;
  return `<svg class="gl${an ? " anim" : ""}${hero ? " hero" : ""}" viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg"><defs>${defs}</defs>${body}</svg>`;
}

// ───────────────────────── Sound (WebAudio) ─────────────────────────
let AC = null, noiseBuf = null;
function ac() {
  if (!AC) { try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return null; } }
  if (AC.state === "suspended") AC.resume();
  if (!noiseBuf) { noiseBuf = AC.createBuffer(1, AC.sampleRate, AC.sampleRate); const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; }
  return AC;
}
function env(g, t, a, peak, dec) { g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + a + dec); }
function tone(freq, t, dur, vol, type = "sine", to) {
  const c = AC, o = c.createOscillator(), g = c.createGain(); o.type = type; o.frequency.setValueAtTime(freq, t);
  if (to) o.frequency.exponentialRampToValueAtTime(to, t + dur); env(g, t, 0.004, vol, dur); o.connect(g).connect(c.destination); o.start(t); o.stop(t + dur + 0.05);
}
function noise(t, dur, vol, ftype, freq, q = 1) {
  const c = AC, s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
  s.buffer = noiseBuf; f.type = ftype; f.frequency.value = freq; f.Q.value = q; env(g, t, 0.003, vol, dur);
  s.connect(f).connect(g).connect(c.destination); s.start(t, Math.random() * 0.5); s.stop(t + dur + 0.05); return f;
}
const SFX = {
  tick() { const t = AC.currentTime; noise(t, 0.03, 0.18, "bandpass", 3200, 2); tone(1800, t, 0.03, 0.04, "triangle"); },
  clink() { const t = AC.currentTime; [[2637, .14], [3951, .07], [5274, .04]].forEach(([f, v]) => { tone(f, t, 0.9, v); tone(f * 0.985, t + 0.11, 0.8, v * .8); }); noise(t, 0.02, 0.15, "highpass", 5000); },
  pour() { const t = AC.currentTime; const f = noise(t, 0.75, 0.22, "bandpass", 500, 4); f.frequency.setValueAtTime(400, t);
    for (let k = 0; k < 8; k++) f.frequency.linearRampToValueAtTime(400 + Math.random() * 700, t + k * 0.09); tone(220, t + .05, .15, .03, "sine", 520); },
  drop() { // liquid "plip": fast upward pitch sweep + tiny echo drop + soft splash
    const t = AC.currentTime, c = AC;
    const plip = (st, f0, f1, vol, dur) => { const o = c.createOscillator(), g = c.createGain(), lp = c.createBiquadFilter();
      o.type = "sine"; o.frequency.setValueAtTime(f0, st); o.frequency.exponentialRampToValueAtTime(f1, st + dur * 0.6);
      lp.type = "lowpass"; lp.frequency.value = 2600;
      g.gain.setValueAtTime(0.0001, st); g.gain.exponentialRampToValueAtTime(vol, st + 0.006); g.gain.exponentialRampToValueAtTime(0.0001, st + dur);
      o.connect(lp).connect(g).connect(c.destination); o.start(st); o.stop(st + dur + 0.02); };
    plip(t, 420, 1500, 0.28, 0.11);
    plip(t + 0.13, 650, 1900, 0.09, 0.07);
    noise(t + 0.01, 0.05, 0.035, "bandpass", 1800, 4);
  },
  glug() { const t = AC.currentTime; for (let k = 0; k < 4; k++) { tone(180 + k * 25, t + k * 0.11, 0.09, 0.14, "sine", 90); noise(t + k * 0.11, 0.06, 0.12, "bandpass", 600, 3); } },
  pop() { const t = AC.currentTime; tone(520, t, 0.09, 0.22, "sine", 110); noise(t, 0.04, 0.2, "bandpass", 1200, 1.5); },
  thunk() { const t = AC.currentTime; tone(170, t, 0.14, 0.18, "sine", 70); },
  fizz() { const t = AC.currentTime; for (let k = 0; k < 18; k++) noise(t + Math.random() * 0.5, 0.015, 0.06 + Math.random() * .05, "highpass", 4000 + Math.random() * 3000); },
  shake() { const t = AC.currentTime; for (let k = 0; k < 14; k++) { noise(t + k * 0.1, 0.06, 0.2, "bandpass", 2200 + (k % 2) * 900, 2); noise(t + k * 0.1 + .03, 0.03, 0.12, "highpass", 5000); } },
  ding() { const t = AC.currentTime; tone(1320, t, 0.35, 0.07); tone(1980, t + .06, 0.35, 0.05); },
  tada() { const t = AC.currentTime; [784, 988, 1175, 1568].forEach((f, k) => tone(f, t + k * 0.07, 0.4, 0.07, "triangle")); }
};
function sfx(name) { if (!S.sound) return; if (!ac()) return; try { SFX[name](); } catch (e) {} }

// ───────────────────────── Screen FX ─────────────────────────
const fx = $("#fxlayer");
function sparkle(x, y, n = 14, colors = ["#f2a541", "#ffd29a", "#e8742a", "#fff2d8"]) {
  if (!S.fx) return;
  for (let i = 0; i < n; i++) {
    const p = document.createElement("div"); p.className = "spark";
    p.style.left = x + "px"; p.style.top = y + "px"; p.style.background = colors[i % colors.length];
    p.style.boxShadow = `0 0 8px ${colors[i % colors.length]}`; fx.appendChild(p);
    const a = Math.random() * Math.PI * 2, r = 30 + Math.random() * 50;
    p.animate([{ transform: "translate(-50%,-50%) scale(1)", opacity: 1 }, { transform: `translate(${Math.cos(a) * r - 3}px,${Math.sin(a) * r - 3}px) scale(.2)`, opacity: 0 }],
      { duration: 600 + Math.random() * 300, easing: "cubic-bezier(.2,.8,.3,1)" }).onfinish = () => p.remove();
  }
}
function ripple(e) {
  if (!S.fx) return; const r = document.createElement("div"); r.className = "ripple";
  r.style.left = e.clientX + "px"; r.style.top = e.clientY + "px"; r.style.width = r.style.height = "160px"; fx.appendChild(r);
  setTimeout(() => r.remove(), 520);
}
document.addEventListener("pointerdown", e => { if (e.target.closest("button,.card,.bottle,.chip,.step,label,.shelf-h")) ripple(e); }, { passive: true });

(function bokeh() {
  const cv = $("#bokeh"), ctx = cv.getContext("2d"); let W, H; const P = [];
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  function size() { W = cv.width = innerWidth * dpr; H = cv.height = innerHeight * dpr; }
  size(); addEventListener("resize", size);
  for (let i = 0; i < 26; i++) P.push({ x: Math.random(), y: Math.random(), r: 4 + Math.random() * 22, v: 0.00004 + Math.random() * 0.00012, a: Math.random() * 0.12 + 0.03, h: 25 + Math.random() * 20, w: Math.random() * 6.28 });
  let last = 0;
  function frame(t) {
    requestAnimationFrame(frame);
    if (!S.fx || document.hidden || t - last < 33) return; const dt = Math.min(50, t - last); last = t;
    ctx.clearRect(0, 0, W, H);
    for (const p of P) {
      p.y -= p.v * dt; p.w += 0.0006 * dt; if (p.y < -0.1) { p.y = 1.1; p.x = Math.random(); }
      const x = (p.x + Math.sin(p.w) * 0.02) * W, y = p.y * H, r = p.r * dpr;
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, `hsla(${p.h},90%,60%,${p.a})`); g.addColorStop(1, `hsla(${p.h},90%,50%,0)`);
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, 6.283); ctx.fill();
    }
  }
  requestAnimationFrame(frame);
})();

let toastT;
function toast(msg) { const t = $("#toast"); t.textContent = msg; t.classList.add("on"); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove("on"), 2100); }

// ───────────────────────── Cards ─────────────────────────
const HEART = '<svg viewBox="0 0 24 24"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/></svg>';
const baseLabel = d => d.cat === "Mocktail" || d.base === "None" ? "Zero-proof" : d.base;
function cardHTML(d, have, missOverride) {
  const miss = missOverride || missingFor(d, have);
  let badge = d.custom ? '<span class="badge mine">★ My recipe</span>' : "";
  if (S.cab.length || missOverride) {
    if (!miss.length) badge += '<span class="badge ready">✓ Ready to pour</span>';
    else if (miss.length <= 2) badge += `<span class="badge near">Missing: ${esc(miss.join(", "))}</span>`;
  }
  if (!d.alcoholic && d.cat !== "Mocktail") badge += '<span class="badge zero">Can be zero-proof</span>';
  return `<div class="card" data-id="${esc(d.id)}" style="--c:${esc(d.color)}">
    <div class="thumb">${glassSVG(d)}</div>
    <div class="info"><div class="nm">${esc(d.name)}</div>
      <div class="sub">${esc(baseLabel(d))} · ${esc(d.cat)}${d.abv >= .5 ? ` · ${Math.round(d.abv)}%` : ""}</div>${badge}</div>
    <button class="heart${isFav(d.id) ? " on" : ""}" data-fav="${esc(d.id)}" aria-label="Favorite">${HEART}</button></div>`;
}
function bindCards(root) {
  root.addEventListener("click", e => {
    const h = e.target.closest("[data-fav]");
    if (h) { e.stopPropagation(); toggleFav(h.dataset.fav, h); return; }
    const c = e.target.closest(".card"); if (c) openDrink(c.dataset.id);
  });
}
function toggleFav(id, el) {
  const i = S.fav.indexOf(id);
  if (i >= 0) { S.fav.splice(i, 1); sfx("thunk"); toast("Removed from favorites"); }
  else { S.fav.push(id); sfx("clink"); toast("Cheers! Added to favorites 🥂");
    if (el) { const r = el.getBoundingClientRect(); sparkle(r.left + r.width / 2, r.top + r.height / 2, 16, ["#e8742a", "#f2a541", "#ffb37a", "#fff0dc"]); } }
  save();
  $$(`[data-fav="${CSS.escape(id)}"]`).forEach(b => b.classList.toggle("on", isFav(id)));
  if (current === "fav") renderFav();
}

// ───────────────────────── MENU ─────────────────────────
const M = { cat: "All", base: "Any spirit", q: "", ready: false, fl: new Set() };
function renderChips() {
  const cats = S.custom.length ? ["All", "★ Mine", ...CATS.slice(1)] : CATS;
  if (!cats.includes(M.cat)) M.cat = "All";
  $("#catChips").innerHTML = cats.map(c => `<button class="chip${M.cat === c ? " on" : ""}" data-c="${c}">${c === "Geeky" ? "🎮 Geeky" : c === "Spooky" ? "🎃 Spooky" : c === "Mocktail" ? "Mocktails" : c}</button>`).join("");
  $("#flavorChips").innerHTML = `<span class="chip-lbl">Taste</span>` + FLAVORS.map(([f, e]) => `<button class="chip sm${M.fl.has(f) ? " on" : ""}" data-fl="${f}">${e} ${f}</button>`).join("");
  $("#baseChips").innerHTML = BASES.map(b => `<button class="chip sm${M.base === b ? " on" : ""}" data-b="${b}">${b}</button>`).join("");
}
function renderMenu() {
  const have = cab(), q = norm(M.q.trim());
  const list = DR.filter(d => (M.cat === "All" || (M.cat === "★ Mine" ? d.custom : d.cat === M.cat)) &&
    (M.base === "Any spirit" || (M.base === "Zero-proof" ? !d.alcoholic : d.base === M.base)) &&
    (!q || q.split(/\s+/).every(w => d.search.includes(w))) &&
    (!M.ready || !missingFor(d, have).length) &&
    [...M.fl].every(f => d.flavors.includes(f)));
  $("#menuCount").textContent = `${list.length} drink${list.length === 1 ? "" : "s"}`;
  $("#readyToggle").classList.toggle("on", M.ready);
  $("#menuList").innerHTML = list.length ? list.map(d => cardHTML(d, have)).join("") :
    `<div class="empty"><span class="big">🫗</span>${M.ready ? "Nothing's pourable with this filter yet.<br>Stock up your Liquor Cabinet!" : "No drinks match. The bartender shrugs politely."}</div>`;
}
$("#catChips").onclick = e => { const b = e.target.closest("[data-c]"); if (!b) return; M.cat = b.dataset.c; sfx("tick"); renderChips(); renderMenu(); };
$("#baseChips").onclick = e => { const b = e.target.closest("[data-b]"); if (!b) return; M.base = b.dataset.b; sfx("tick"); renderChips(); renderMenu(); };
$("#flavorChips").onclick = e => { const b = e.target.closest("[data-fl]"); if (!b) return; const f = b.dataset.fl; M.fl.has(f) ? M.fl.delete(f) : M.fl.add(f); sfx("tick"); renderChips(); renderMenu(); };
$("#q").oninput = e => { M.q = e.target.value; renderMenu(); };
$("#readyToggle").onclick = () => { M.ready = !M.ready; sfx(M.ready ? "fizz" : "tick"); renderMenu(); if (M.ready && !S.cab.length) toast("Your cabinet is empty — add bottles first!"); };
bindCards($("#menuList"));

$("#diceBtn").onclick = () => {
  const have = cab(); let pool = DR.filter(d => !missingFor(d, have).length);
  if (!S.cab.length || pool.length < 3) pool = DR;
  const pick = pool[Math.floor(Math.random() * pool.length)];
  const R = $("#roulette"), N = $("#rlName"), Gx = $("#rlGlass");
  R.classList.remove("done"); R.classList.add("on", "shaking"); sfx("shake");
  let n = 0; const iv = setInterval(() => { const r = DR[Math.floor(Math.random() * DR.length)]; N.textContent = r.name; Gx.innerHTML = glassSVG(r); if (++n > 14) {
    clearInterval(iv); R.classList.remove("shaking"); R.classList.add("done"); N.textContent = pick.name; Gx.innerHTML = glassSVG(pick, { anim: 1 }); sfx("tada");
    sparkle(innerWidth / 2, innerHeight / 2, 30);
    setTimeout(() => { R.classList.remove("on"); openDrink(pick.id); }, 1100); } }, 95);
};

// ───────────────────────── DETAIL SHEET ─────────────────────────
let openId = null, pour = "single", landT = null, batchOn = false, serves = 1;
function scheduleLand() { clearTimeout(landT); if (S.fx) landT = setTimeout(() => { if (openId) sfx("drop"); }, 1500); }
function openDrink(id) {
  const d = BY_ID[id]; if (!d) return; openId = id; pour = "single"; batchOn = false; serves = (d.ex && d.ex.serves) || 1;
  renderDetail(true);
  $("#sheet").classList.add("open"); $("#sheet").setAttribute("aria-hidden", "false");
  $("#sheetInner").scrollTop = 0; sfx("drop");
  if (!(history.state && history.state.d)) history.pushState({ d: id }, "");
}
function closeDrink(fromPop) {
  if (!openId) return; openId = null; clearTimeout(landT); $("#sheet").classList.remove("open"); $("#sheet").setAttribute("aria-hidden", "true");
  if (!fromPop && history.state && history.state.d) history.back();
  refreshCurrent();
}
addEventListener("popstate", () => { if ($("#builder").classList.contains("open")) closeBuilder(); else if (openId) closeDrink(true); });
function rerenderDetail() { const sc = $("#sheetInner").scrollTop; renderDetail(false); $("#sheetInner").scrollTop = sc; }
const baseServes = d => (d.ex && d.ex.serves) || 1;
function detailCtx(d) {
  const dbl = doubleSet(d), canDbl = dbl.size > 0, isDbl = canDbl && pour === "double";
  const bm = batchOn ? serves / baseServes(d) : 1;
  const multOf = i => (isDbl && dbl.has(i) ? 2 : 1) * bm;
  return { dbl, canDbl, isDbl, bm, multOf };
}
function ingRowsHTML(d, have, X) {
  return d.ingredients.map(i => {
    const always = ALWAYS.has(i.name), using = covers(i.name, have);
    const cls = using ? (using === i.name || always ? "have" : "sub") : "miss";
    const subNote = using && using !== i.name && !always ? `<small class="subnote">✓ Using your ${esc(using)}</small>` : "";
    const x2 = X.isDbl && X.dbl.has(i);
    const m = X.multOf(i);
    return `<div class="ing-row" data-ing="${esc(i.name)}"><button class="dot ${cls}${i.opt ? " opt" : ""}" ${always ? "disabled" : ""} aria-label="Toggle in cabinet">✓</button>
      <div class="ing-name"><b>${esc(ingLabel(i))}</b>${i.opt ? ' <small style="display:inline;color:var(--amber)">optional</small>' : ""}${i.note ? `<small>${esc(i.note)}</small>` : ""}${subNote}</div>
      <div class="amt${x2 ? " dbl" : ""}${batchOn && X.bm > 1 ? " bat" : ""}">${esc(fmtAmt(i, m))}${x2 ? '<span class="x2">×2</span>' : ""}</div></div>`;
  }).join("");
}
function qtr(n) { const q = Math.ceil(n * 4) / 4; return q < .25 ? "under ¼" : frac(q); }
const JUICE_FRUIT = { "Lemon Juice": ["lemon", 1.5], "Lime Juice": ["lime", 1], "Orange Juice": ["orange", 2.5], "Grapefruit Juice": ["grapefruit", 5] };
function batchInfoHTML(d, X) {
  if (!batchOn) return "";
  const tot = {};
  d.ingredients.forEach(i => { if (i.opt) return; const v = volOz(i) * X.multOf(i); if (v > 0) tot[i.name] = (tot[i.name] || 0) + v; });
  const shop = [];
  Object.entries(tot).forEach(([n, oz]) => {
    const sh = SHELF_OF[n];
    if (n === "Lager Beer") shop.push([n, `${Math.ceil(oz / 12)} × 12 oz cans`]);
    else if (n === "Stout") shop.push([n, `${Math.ceil(oz / 14.9)} × pint cans`]);
    else if (BOOZE_SHELVES.has(sh) && oz >= .75) { const b = oz / 25.36; shop.push([n, `${qtr(b)} bottle${b > 1 ? "s" : ""} (750 ml)`]); }
    else if (FIZZ.has(n) && oz >= 4) shop.push([n, `${frac(Math.ceil(oz / 33.8 * 2) / 2)} L`]);
    else if (JUICE_FRUIT[n] && oz >= 2) { const [f, per] = JUICE_FRUIT[n], c = Math.ceil(oz / per); shop.push([n, `≈ ${c} ${f}${c > 1 ? "s" : ""}, juiced`]); }
  });
  let tip = "";
  if (baseServes(d) === 1 && serves > 1) {
    const hot = d.cat === "Hot" || ["hot", "irish"].includes(d.glass);
    const egg = d.ingredients.some(i => !i.opt && (i.name === "Egg White" || i.name === "Whole Egg"));
    if (egg) tip = "🥚 Egg drinks don't batch well. Mix everything else ahead, then shake each glass with its egg white to order.";
    else if (d.method === "layer") tip = "🎨 Layered shots can't be pre-mixed. Line the glasses up and pour each layer assembly-line style.";
    else if (hot) tip = "🔥 Make it in a pot or slow cooker on LOW and ladle to order. Don't let it boil.";
    else if (d.method === "blend") tip = "🌀 Blend in rounds; most blenders handle about 4 drinks at a time.";
    else {
      const tops = d.ingredients.filter(i => i.top && !i.opt);
      const base = d.ingredients.filter(i => !i.top && !i.opt && !i.side && i.unit !== "rinse").reduce((a, i) => a + volOz(i) * X.multOf(i), 0);
      const water = Math.round(base * (DILUTION[d.method] || .1) * 4) / 4;
      const fresh = d.ingredients.some(i => ["leaves", "slice", "wedge"].includes(i.unit));
      tip = `🧊 Party move: stir everything${tops.length ? ` except the ${listJoin(tops.map(t => t.name))}` : ""} in a pitcher${water >= 1 ? ` with ${fmtAmt({ amt: water, unit: "oz" })} of cold water (that replaces the melt from ${/shake|dry|muddle/.test(d.method) ? "shaking" : "stirring"})` : ""}. Chill 2+ hours, then pour over ice${tops.length ? ` and top each glass with ${listJoin(tops.map(t => t.name))}` : ""}.${fresh ? " Muddle any herbs or fruit right in the pitcher." : ""}`;
    }
  }
  return `${shop.length ? `<div class="shop"><b>🛒 Shopping math</b>${shop.map(([n, t]) => `<div class="row"><span>${esc(n)}</span><span>${esc(t)}</span></div>`).join("")}</div>` : ""}${tip ? `<div class="batch-tip">${esc(tip)}</div>` : ""}`;
}
function meterHTML(d, X) {
  if (!d.alcoholic) return `<div class="meter zero"><div class="m-top"><span>🍃 Zero-proof</span><span>0% ABV</span></div><div class="m-bar"><i style="--p:0%"></i></div></div>`;
  const st = strength(d, X.isDbl ? X.dbl : null);
  const [lab, em] = strengthLabel(st.abv);
  const p = Math.min(st.abv / 40, 1) * 100;
  const std = st.std < .95 ? st.std.toFixed(1) : (Math.round(st.std * 10) / 10).toString();
  return `<div class="meter"><div class="m-top"><span>${em} ${lab}</span><span>≈ ${Math.round(st.abv)}% ABV · ${std} std drink${st.std >= .95 && st.std < 1.05 ? "" : "s"}${baseServes(d) > 1 ? " per glass" : ""}</span></div>
    <div class="m-bar"><i style="--p:${p.toFixed(1)}%"></i></div><div class="m-scale"><span>Light</span><span>Medium</span><span>Strong</span><span>🚀</span></div></div>`;
}
function updateDynamic() {
  const d = BY_ID[openId]; if (!d) return; const X = detailCtx(d), have = cab();
  const ib = $("#ingBox"); if (ib) ib.innerHTML = ingRowsHTML(d, have, X);
  const bi = $("#batchInfo"); if (bi) bi.innerHTML = batchInfoHTML(d, X);
  const sn = $("#servesN"); if (sn) sn.textContent = serves;
}
function renderDetail(anim) {
  const d = BY_ID[openId]; if (!d) { closeDrink(); return; }
  const have = cab(); const miss = missingFor(d, have);
  const steps = buildSteps(d);
  const X = detailCtx(d);
  const status = miss.length ? `<div class="status-line no">You're missing <b>${miss.length}</b>: ${esc(miss.join(", "))}</div>`
    : `<div class="status-line ok">✓ You've got everything — time to pour!</div>`;
  const dblNames = [...X.dbl].map(i => i.name);
  const bs = baseServes(d), maxS = Math.max(24, bs * 6);
  const pourBlock = `<div class="pour-row">${X.canDbl ? `<div class="seg" id="pourSeg"><button data-pour="single" class="${X.isDbl ? "" : "on"}">Single</button><button data-pour="double" class="${X.isDbl ? "on" : ""}">Double 💪</button></div>` : "<span></span>"}
      <button class="batch-btn${batchOn ? " on" : ""}" id="batchBtn">🎉 Party batch</button></div>
      ${X.isDbl ? `<div class="hint">Double = 2× the ${esc(listJoin(dblNames))}. Mixers & juices stay the same${UP_GLASSES.has(d.glass) || d.glass === "shot" ? " — you may want a bigger glass" : ""}.</div>` : ""}
      ${batchOn ? `<div class="batch-panel"><div class="bp-top"><span>Serves <b id="servesN">${serves}</b></span><small>${bs > 1 ? `recipe makes ${bs}` : "glasses"}</small></div>
        <input type="range" id="servesR" min="${bs}" max="${maxS}" step="${bs}" value="${serves}">
        <div class="bp-scale"><span>${bs}</span><span>${maxS}</span></div><div id="batchInfo">${batchInfoHTML(d, X)}</div></div>` : ""}`;
  const fl = d.flavors.length ? `<div class="flav">${d.flavors.map(f => `<span class="tag">${FL_ICON[f]} ${f}</span>`).join("")}</div>` : "";
  $("#sheetInner").innerHTML = `
    <div class="grab"></div>
    <div class="sh-top"><button class="round-btn" id="shClose" aria-label="Close"><svg viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg></button>
      <div class="seg unit-seg"><button data-unit="oz">oz</button><button data-unit="ml">ml</button></div>
      <button class="heart round-btn${isFav(d.id) ? " on" : ""}" data-fav="${esc(d.id)}" aria-label="Favorite">${HEART}</button></div>
    <div class="hero"><div class="glow" style="background:${esc(d.color)}"></div>
      <div class="big-glass" id="bigGlass" aria-label="Tap to pour again">${glassSVG(d, { anim: anim && S.fx, hero: true })}</div>
      <div class="tap-hint">tap the glass for another drop</div>
      <h1>${esc(d.name)}</h1>
      <div class="facts">
        <div class="fact"><small>Style</small><span>${esc(d.cat === "Geeky" ? "🎮 Geeky" : d.cat === "Spooky" ? "🎃 Spooky" : d.cat)}${d.custom ? " · ★ Mine" : ""}</span></div>
        <div class="fact"><small>Base</small><span>${esc(baseLabel(d))}${!d.alcoholic && d.cat !== "Mocktail" && d.base !== "None" ? " (opt.)" : ""}</span></div>
        <div class="fact"><small>Serve in</small><span>${esc(GLASS_LABEL[d.glass] || "Glass")}</span></div>
        <div class="fact"><small>Method</small><span>${esc(METHOD_NAME[d.method] || "Built")}</span></div>
      </div>
      ${fl}
      ${d.desc ? `<p>${esc(d.desc)}</p>` : ""}</div>
    ${status}
    <div class="sec-h"><h3>Strength</h3><small class="dim">estimate</small></div>
    <div id="meterBox">${meterHTML(d, X)}</div>
    <div class="sec-h"><h3>Ingredients</h3></div>
    ${pourBlock}
    <div class="ing" id="ingBox" style="margin-top:10px">${ingRowsHTML(d, have, X)}</div>
    <div class="hint">Tap a circle to add/remove that ingredient from your Liquor Cabinet.</div>
    <div class="sec-h"><h3>How to make it</h3><button class="link" id="resetSteps">Reset</button></div>
    <div class="steps">${steps.map((s, k) => `<div class="step" data-k="${k}"><div class="n">${k + 1}</div><div class="t">${esc(s)}</div></div>`).join("")}</div>
    ${d.garnish && !/^none$/i.test(d.garnish) ? `<div class="sec-h"><h3>Garnish</h3></div><div class="garnish"><span class="gi">🍒</span><span>${esc(d.garnish)}</span></div>` : ""}
    <div class="detail-actions">
      <button class="pill-btn primary" id="shareBtn">📸 Share card</button>
      ${d.custom ? `<button class="pill-btn" id="editBtn">✎ Edit recipe</button>` : ""}
      <button class="pill-btn" id="remixBtn">✚ Remix as my own</button>
    </div>
    <p class="about" style="margin-top:18px">Tap a step to check it off. Sip slowly, tip your bartender (you).<br>Strength is an estimate (1 US standard drink = 0.6 oz of pure alcohol).</p>`;
  syncUnits();
}
$("#sheetInner").addEventListener("click", e => {
  if (e.target.closest("#shClose")) { closeDrink(); return; }
  if (e.target.closest("#bigGlass")) {
    const d = BY_ID[openId]; if (!d) return;
    $("#bigGlass").innerHTML = glassSVG(d, { anim: S.fx, hero: true }); sfx("drop"); return;
  }
  const f = e.target.closest("[data-fav]"); if (f) { toggleFav(f.dataset.fav, f); return; }
  const u = e.target.closest("[data-unit]"); if (u) { setUnits(u.dataset.unit); return; }
  const p = e.target.closest("[data-pour]"); if (p) {
    if (pour === p.dataset.pour) return; pour = p.dataset.pour;
    if (pour === "double") { sfx("glug"); const r = p.getBoundingClientRect(); sparkle(r.left + r.width / 2, r.top + r.height / 2, 16, ["#ffcf6a", "#f2a541", "#fff2d8"]); toast("Make it a double! 🥃🥃"); }
    else sfx("tick");
    rerenderDetail(); return;
  }
  if (e.target.closest("#batchBtn")) {
    batchOn = !batchOn; const d = BY_ID[openId];
    if (batchOn) { if (serves <= baseServes(d)) serves = baseServes(d) > 1 ? baseServes(d) * 2 : 6; sfx("glug"); const r = e.target.getBoundingClientRect(); sparkle(r.left + r.width / 2, r.top + r.height / 2, 22, ["#f2a541", "#ff6aa0", "#7ad0ff", "#fff2d8"]); toast("Party mode! 🎉 Drag to set the headcount"); }
    else { serves = baseServes(d); sfx("tick"); }
    rerenderDetail(); return;
  }
  if (e.target.closest("#shareBtn")) { shareCard(BY_ID[openId]); return; }
  if (e.target.closest("#editBtn")) { const c = S.custom.find(x => x.id === openId); if (c) openBuilder(JSON.parse(JSON.stringify(c))); return; }
  if (e.target.closest("#remixBtn")) { openBuilder(fromDrink(BY_ID[openId])); return; }
  const dot = e.target.closest(".dot"); if (dot && !dot.disabled) {
    const n = dot.closest(".ing-row").dataset.ing;
    toggleCab(n);
    if (S.cab.includes(n)) { const r = dot.getBoundingClientRect(); sparkle(r.left + 11, r.top + 11, 10, ["#9ccc6a", "#d8f0a0", "#fff"]); }
    rerenderDetail(); return;
  }
  const st = e.target.closest(".step"); if (st) { st.classList.toggle("done"); sfx(st.classList.contains("done") ? "ding" : "tick");
    if ($$("#sheetInner .step").every(x => x.classList.contains("done"))) { sfx("clink"); toast(`${BY_ID[openId].name} is served. Cheers! 🥂`); sparkle(innerWidth / 2, innerHeight * .4, 34); } return; }
  if (e.target.closest("#resetSteps")) { $$("#sheetInner .step").forEach(x => x.classList.remove("done")); sfx("tick"); }
});
$("#sheet").addEventListener("click", e => { if (e.target.id === "sheet") closeDrink(); });
let lastTickV = 0;
$("#sheetInner").addEventListener("input", e => {
  if (e.target.id !== "servesR") return;
  serves = +e.target.value; updateDynamic();
  const now = Date.now(); if (now - lastTickV > 60) { sfx("tick"); lastTickV = now; }
});
function swipeClose(inner, fn) {
  let y0 = null;
  inner.addEventListener("touchstart", e => { y0 = inner.scrollTop <= 0 && !e.target.closest("input,textarea,select") ? e.touches[0].clientY : null; }, { passive: true });
  inner.addEventListener("touchmove", e => { if (y0 == null) return; const dy = e.touches[0].clientY - y0; if (dy > 0) inner.style.transform = `translateY(${dy}px)`; }, { passive: true });
  inner.addEventListener("touchend", e => { if (y0 == null) return; const dy = e.changedTouches[0].clientY - y0; inner.style.transform = ""; y0 = null; if (dy > 120) fn(); });
}
swipeClose($("#sheetInner"), () => closeDrink());

// ───────────────────────── SHARE CARD ─────────────────────────
const F_SERIF = 'Georgia, "Times New Roman", serif', F_SANS = '-apple-system, "Helvetica Neue", Helvetica, Arial, sans-serif',
  F_SCRIPT = '"Snell Roundhand", "Apple Chancery", "Brush Script MT", "Segoe Script", cursive';
function svgToImg(svg, w, h) {
  return new Promise(res => {
    const im = new Image(); im.onload = () => res(im); im.onerror = () => res(null);
    im.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg.replace("<svg ", `<svg width="${w}" height="${h}" `));
  });
}
function wrapLines(ctx, text, maxW) {
  const words = String(text).split(/\s+/), lines = []; let cur = "";
  for (const w of words) { const t = cur ? cur + " " + w : w; if (ctx.measureText(t).width > maxW && cur) { lines.push(cur); cur = w; } else cur = t; }
  if (cur) lines.push(cur); return lines;
}
function rrect(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
function drawCard(ctx, d, img, H) {
  const W = 1080, P = 84, X = detailCtx(d), real = H > 0;
  let y = 0;
  if (real) {
    const bg = ctx.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, "#26180e"); bg.addColorStop(.45, "#170f09"); bg.addColorStop(1, "#0e0805");
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
    const gl = ctx.createRadialGradient(W / 2, 330, 10, W / 2, 330, 420); gl.addColorStop(0, d.color + "66"); gl.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = gl; ctx.fillRect(0, 0, W, 800);
    ctx.strokeStyle = "rgba(242,165,65,.35)"; ctx.lineWidth = 3; rrect(ctx, 28, 28, W - 56, H - 56, 36); ctx.stroke();
    ctx.strokeStyle = "rgba(242,165,65,.12)"; ctx.lineWidth = 1.5; rrect(ctx, 42, 42, W - 84, H - 84, 28); ctx.stroke();
  }
  const T = (txt, x, yy, font, color, align = "center") => { ctx.font = font; if (real) { ctx.fillStyle = color; ctx.textAlign = align; ctx.fillText(txt, x, yy); } };
  ctx.textBaseline = "alphabetic";
  y = 128; T("Garnish", W / 2, y, `56px ${F_SCRIPT}`, "#f2a541");
  y += 38; T("T H E   H O M E   B A R", W / 2, y, `600 20px ${F_SANS}`, "#7d6754");
  y += 24;
  if (img && real) ctx.drawImage(img, W / 2 - 170, y, 340, 408);
  y += 408 + 30;
  ctx.font = `bold 78px ${F_SERIF}`;
  for (const ln of wrapLines(ctx, d.name, W - 2 * P)) { y += 80; T(ln, W / 2, y, `bold 78px ${F_SERIF}`, "#fbe7c9"); }
  y += 54; T(`${d.cat === "Spooky" ? "🎃 Spooky" : d.cat === "Geeky" ? "🎮 Geeky" : d.cat}  ·  ${baseLabel(d)}  ·  ${GLASS_LABEL[d.glass] || "Glass"}`, W / 2, y, `30px ${F_SANS}`, "#c9ad8c");
  const st = strength(d, X.isDbl ? X.dbl : null), [lab, em] = strengthLabel(d.alcoholic ? st.abv : 0);
  const pills = [d.alcoholic ? `${em} ${lab} · ≈${Math.round(st.abv)}% ABV` : "🍃 Zero-proof"];
  if (X.isDbl) pills.push("💪 Double");
  if (batchOn && serves > baseServes(d)) pills.push(`🎉 Serves ${serves}`);
  else if (baseServes(d) > 1) pills.push(`Serves ${baseServes(d)}`);
  y += 56; T(pills.join("   •   "), W / 2, y, `600 30px ${F_SANS}`, "#f2a541");
  if (d.flavors.length) { y += 48; T(d.flavors.map(f => `${FL_ICON[f]} ${f}`).join("   "), W / 2, y, `28px ${F_SANS}`, "#e2cdb0"); }
  if (d.desc) { ctx.font = `italic 30px ${F_SERIF}`; y += 20; for (const ln of wrapLines(ctx, d.desc, W - 2 * P - 40)) { y += 42; T(ln, W / 2, y, `italic 30px ${F_SERIF}`, "#a68e74"); } }
  const section = name => { y += 74; T(name, P, y, `700 24px ${F_SANS}`, "#8a7258", "left"); if (real) { ctx.fillStyle = "rgba(242,165,65,.25)"; ctx.fillRect(P, y + 16, W - 2 * P, 2); } y += 18; };
  section("I N G R E D I E N T S");
  d.ingredients.forEach(i => {
    y += 62; const amt = fmtAmt(i, X.multOf(i));
    T(ingLabel(i) + (i.opt ? " (optional)" : ""), P + 8, y, `600 36px ${F_SANS}`, "#f3e2c8", "left");
    T(amt, W - P - 8, y, `bold 36px ${F_SANS}`, "#f2a541", "right");
    if (i.note) { y += 36; ctx.font = `26px ${F_SANS}`; const n = wrapLines(ctx, i.note, W - 2 * P - 260)[0]; T(n, P + 8, y, `26px ${F_SANS}`, "#8a7258", "left"); }
  });
  section("H O W   T O   M A K E   I T");
  buildSteps(d).forEach((s, k) => {
    ctx.font = `31px ${F_SANS}`; const lines = wrapLines(ctx, s, W - 2 * P - 78);
    y += 30;
    if (real) { ctx.fillStyle = "#e8913a"; ctx.beginPath(); ctx.arc(P + 22, y + 18, 22, 0, 6.283); ctx.fill(); }
    T(String(k + 1), P + 22, y + 28, `bold 24px ${F_SANS}`, "#2a1508");
    lines.forEach((ln, j) => { T(ln, P + 70, y + 30 + j * 42, `31px ${F_SANS}`, "#ead8bf", "left"); });
    y += 30 + (lines.length - 1) * 42 + 12;
  });
  if (d.garnish && !/^none$/i.test(d.garnish)) {
    y += 40; ctx.font = `italic 31px ${F_SERIF}`;
    wrapLines(ctx, "🍒  Garnish: " + d.garnish, W - 2 * P).forEach((ln, j) => { y += j ? 42 : 0; T(ln, W / 2, y + 20, `italic 31px ${F_SERIF}`, "#f2d3a8"); });
    y += 20;
  }
  y += 70; if (real) { ctx.fillStyle = "rgba(242,165,65,.2)"; ctx.fillRect(W / 2 - 160, y - 34, 320, 2); }
  T("Poured with Garnish 🍸", W / 2, y + 10, `600 26px ${F_SANS}`, "#8a7258");
  return y + 90;
}
let shareFile = null, shareURL = null;
async function shareCard(d) {
  sfx("pop"); toast("Plating your card… 📸");
  const img = await svgToImg(glassSVG(d), 340, 408);
  const cv = document.createElement("canvas"); cv.width = 1080; cv.height = 10;
  const H = drawCard(cv.getContext("2d"), d, img, 0);
  cv.height = Math.ceil(H);
  drawCard(cv.getContext("2d"), d, img, cv.height);
  cv.toBlob(blob => {
    if (!blob) { toast("Couldn't make the card, sorry!"); return; }
    if (shareURL) URL.revokeObjectURL(shareURL);
    shareURL = URL.createObjectURL(blob);
    shareFile = new File([blob], `${slug(d.name)}-garnish.png`, { type: "image/png" });
    $("#soImg").src = shareURL; $("#soSave").href = shareURL; $("#soSave").download = shareFile.name;
    const can = !!(navigator.canShare && navigator.canShare({ files: [shareFile] }));
    $("#soShare").classList.toggle("hidden", !can);
    $("#soTitle").textContent = d.name;
    $("#shareOv").classList.add("on"); sfx("clink");
  }, "image/png");
}
$("#soShare").onclick = async () => {
  if (!shareFile) return;
  try { await navigator.share({ files: [shareFile], title: $("#soTitle").textContent, text: `${$("#soTitle").textContent} — poured with Garnish 🍸` }); sfx("tada"); }
  catch (e) { if (e && e.name !== "AbortError") toast("Sharing didn't work — long-press the image to save it."); }
};
$("#soClose").onclick = () => { $("#shareOv").classList.remove("on"); sfx("thunk"); };
$("#shareOv").addEventListener("click", e => { if (e.target.id === "shareOv") $("#shareOv").classList.remove("on"); });

// ───────────────────────── RECIPE BUILDER ─────────────────────────
const UNITS = ["oz", "ml", "dash", "drop", "barspoon", "tsp", "tbsp", "cup", "splash", "rinse", "top", "slice", "wedge", "whole", "leaves", "scoop", "pinch", "cube"];
const FLAGS = [["", "Regular"], ["opt", "Optional"], ["top", "Top up"], ["float", "Float on top"], ["side", "On the side"]];
const SWATCHES = ["#e0952e", "#f2d36b", "#eef0e0", "#f5772a", "#c3301c", "#f2a3a8", "#e0466a", "#7a1f4a", "#8d6bc9", "#2fa0e6", "#9fe03a", "#cfe2a5", "#f1e3b8", "#5a3218", "#2a160c"];
const GARNISH_QUICK = ["Lime wheel", "Lemon twist", "Orange peel", "Cherry", "Mint sprig", "Olives", "Salt rim", "Sugar rim", "Pineapple wedge", "Strawberry", "Cinnamon stick", "Coffee beans", "Whipped cream", "Umbrella"];
const BUILD_CATS = CATS.slice(1);
const BUILD_BASES = ["Gin", "Vodka", "Rum", "Tequila", "Whiskey", "Brandy", "Wine", "Beer", "Liqueur", "None"];
let B = null;
function inferBase(ings) {
  const names = ings.filter(i => i.name && i.flag !== "opt").map(i => i.name.trim());
  for (const n of names) {
    if (SHELF_OF[n] === "Spirits") {
      if (/gin/i.test(n)) return "Gin"; if (/vodka/i.test(n)) return "Vodka"; if (/rum/i.test(n)) return "Rum";
      if (/tequila|mezcal/i.test(n)) return "Tequila"; if (/whisk|bourbon|rye|scotch/i.test(n)) return "Whiskey";
      if (/cognac|brandy|pisco|cacha/i.test(n)) return "Brandy";
    }
  }
  for (const n of names) { const sh = SHELF_OF[n];
    if (sh === "Wine, Vermouth & Beer") return /beer|lager|stout/i.test(n) ? "Beer" : "Wine";
    if (sh === "Liqueurs & Amari") return "Liqueur"; }
  return names.some(n => SHELF_OF[n] === "My Ingredients") ? null : "None";
}
const blankIng = () => ({ amt: "", unit: "oz", name: "", flag: "", note: "" });
function newRecipe() {
  return { id: null, name: "", desc: "", cat: "Classic", base: "Vodka", glass: "rocks", method: "shakeR", color: "#e0952e",
    ings: [{ ...blankIng(), amt: "2" }, blankIng(), blankIng()], garnish: "", stepsMode: "auto", steps: [], baseTouched: false };
}
function fromDrink(d) {
  const ingFlag = i => i.opt ? "opt" : i.top ? "top" : i.float ? "float" : i.side ? "side" : "";
  return { id: null, name: d.name + " (My Twist)", desc: d.desc, cat: d.cat, base: BUILD_BASES.includes(d.base) ? d.base : "None",
    glass: d.glass, method: d.method === "custom" ? "build" : d.method, color: d.color,
    ings: d.ingredients.map(i => ({ amt: i.amt == null ? "" : String(i.amt), unit: i.unit, name: i.name, flag: ingFlag(i), note: i.note || "" })),
    garnish: d.garnish === "None" ? "" : d.garnish, stepsMode: d.ex.steps || d.method === "custom" ? "custom" : "auto",
    steps: d.ex.steps ? d.ex.steps.slice() : (d.method === "custom" ? buildSteps(d) : []), baseTouched: true };
}
const UNI = { "¼": .25, "½": .5, "¾": .75, "⅓": 1 / 3, "⅔": 2 / 3, "⅛": .125 };
function parseAmt(s) {
  s = String(s || "").trim(); if (!s) return null;
  s = s.replace(/[¼½¾⅓⅔⅛]/g, m => " " + UNI[m]).replace(",", ".");
  let tot = 0, ok = false;
  for (const part of s.split(/\s+/).filter(Boolean)) {
    if (/^\d+\/\d+$/.test(part)) { const [a, b] = part.split("/").map(Number); if (b) { tot += a / b; ok = true; } }
    else if (!isNaN(parseFloat(part))) { tot += parseFloat(part); ok = true; }
  }
  return ok ? Math.round(tot * 1000) / 1000 : null;
}
function builderToCustom(b) {
  return { id: b.id, name: b.name.trim(), desc: b.desc.trim(), cat: b.cat, base: b.base, glass: b.glass, method: b.method, color: b.color,
    ings: b.ings.filter(i => i.name.trim()).map(i => ({ amt: parseAmt(i.amt), unit: i.unit, name: i.name.trim(), flag: i.flag, note: i.note.trim() })),
    garnish: b.garnish.trim(), steps: b.stepsMode === "custom" ? b.steps.map(s => s.trim()).filter(Boolean) : [] };
}
function previewDrink() { const c = builderToCustom(B); c.name = c.name || "My Drink"; c.steps = []; return parseDrink(customToTuple(c), "preview"); }
function openBuilder(b) {
  B = b || newRecipe();
  if (B.baseTouched === undefined) B.baseTouched = true;
  if (!B.stepsMode) B.stepsMode = B.steps && B.steps.length ? "custom" : "auto";
  B.ings = B.ings.map(i => ({ ...blankIng(), ...i, amt: i.amt == null ? "" : String(i.amt) }));
  renderBuilder();
  $("#builder").classList.add("open"); $("#builder").setAttribute("aria-hidden", "false");
  $("#builderInner").scrollTop = 0; sfx("pop");
}
function closeBuilder() { $("#builder").classList.remove("open"); $("#builder").setAttribute("aria-hidden", "true"); B = null; }
const opt = (v, cur, label) => `<option value="${esc(v)}"${v === cur ? " selected" : ""}>${esc(label || v)}</option>`;
function renderBuilder() {
  const pv = previewDrink();
  const autoSteps = buildSteps(pv);
  $("#builderInner").innerHTML = `
    <div class="grab"></div>
    <div class="sh-top"><button class="round-btn" data-b="close" aria-label="Close"><svg viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg></button>
      <b style="font-family:var(--serif);font-size:17px;color:#f6dcb8">${B.id ? "Edit recipe" : "New recipe"}</b><span style="width:38px"></span></div>
    <div class="b-hero"><div class="b-preview" id="bPreview" style="--pc:${esc(B.color)}">${glassSVG(pv, { anim: 1 })}</div>
      <div class="b-title"><h2 id="bTitle">${esc(B.name || "Your masterpiece")}</h2><p>Live preview — glass, color & garnish update as you go.</p></div></div>

    <div class="fld"><label>Drink name</label><input class="inp" data-f="name" value="${esc(B.name)}" placeholder="e.g. The LeBlanc Old Fashioned" maxlength="60"></div>
    <div class="fld"><label>Description</label><textarea class="ta" data-f="desc" placeholder="What's the story? How does it taste?">${esc(B.desc)}</textarea></div>
    <div class="fld row2">
      <div><span class="lbl">Style</span><select class="sel" data-f="cat">${BUILD_CATS.map(c => opt(c, B.cat, c === "Mocktail" ? "Mocktail (zero-proof)" : c)).join("")}</select></div>
      <div><span class="lbl">Base spirit</span><select class="sel" data-f="base">${BUILD_BASES.map(c => opt(c, B.base, c === "None" ? "None (zero-proof)" : c)).join("")}</select></div>
    </div>

    <div class="fld"><span class="lbl">Glass</span><div class="glass-grid">${Object.keys(GL).map(k => `<button class="gopt${B.glass === k ? " on" : ""}" data-glass="${k}"><div class="gi">${glassSVG({ glass: k, color: B.color, ingredients: [], garnish: "", cat: "", name: "" })}</div><span>${esc(GLASS_LABEL[k])}</span></button>`).join("")}</div></div>

    <div class="fld"><span class="lbl">Drink color</span><div class="swatches">${SWATCHES.map(c => `<button class="sw${B.color.toLowerCase() === c ? " on" : ""}" data-color="${c}" style="background:${c};--c:${c}" aria-label="${c}"></button>`).join("")}
      <label class="sw-custom${SWATCHES.includes(B.color.toLowerCase()) ? "" : " on"}" style="${SWATCHES.includes(B.color.toLowerCase()) ? "" : `background:${esc(B.color)}`}">🎨<input type="color" id="bColor" value="${esc(B.color)}"></label></div></div>

    <div class="fld"><span class="lbl">How it's made</span><select class="sel" data-f="method">${Object.entries(METHOD_NAME).filter(([k]) => k !== "custom").map(([k, v]) => opt(k, B.method, v)).join("")}</select></div>

    <div class="fld"><span class="lbl">Ingredients</span><div id="bIngs">${B.ings.map((i, k) => `
      <div class="b-ing" data-i="${k}"><div class="r1">
        <input class="inp" data-ing="amt" value="${esc(i.amt)}" placeholder="1½" inputmode="decimal">
        <select class="sel" data-ing="unit">${UNITS.map(u => opt(u, i.unit)).join("")}</select>
        <input class="inp" data-ing="name" value="${esc(i.name)}" placeholder="Ingredient" list="ingList" autocapitalize="words"></div>
        <div class="r2"><select class="sel" data-ing="flag">${FLAGS.map(([v, l]) => opt(v, i.flag, l)).join("")}</select>
        <input class="inp" data-ing="note" value="${esc(i.note)}" placeholder="Note (optional)">
        <button class="mini-x" data-b="delIng" aria-label="Remove">✕</button></div></div>`).join("")}</div>
      <button class="add-btn" data-b="addIng">+ Add ingredient</button>
      <div class="hint">Type amounts like 2, 1.5, 1 1/2 or ¾. Pick from the list or type something brand new — new ingredients get their own shelf in your Liquor Cabinet.</div></div>

    <div class="fld"><label>Garnish</label><input class="inp" data-f="garnish" value="${esc(B.garnish)}" placeholder="e.g. Orange peel and a cherry">
      <div class="chips wrap">${GARNISH_QUICK.map(g => `<button class="chip sm" data-gq="${esc(g)}">+ ${esc(g)}</button>`).join("")}</div></div>

    <div class="fld"><span class="lbl">Steps</span>
      <div class="seg wide" style="margin-bottom:10px"><button data-sm="auto" class="${B.stepsMode === "auto" ? "on" : ""}">✨ Auto-write for me</button><button data-sm="custom" class="${B.stepsMode === "custom" ? "on" : ""}">✍️ Write my own</button></div>
      ${B.stepsMode === "auto" ? `<div class="auto-box">Garnish writes the steps from your method, glass & ingredients:<ol id="bAuto">${autoSteps.map(s => `<li>${esc(s)}</li>`).join("")}</ol></div>` :
      `<div id="bSteps">${B.steps.map((s, k) => `<div class="b-step" data-s="${k}"><div class="n">${k + 1}</div><textarea class="ta" data-step="${k}" placeholder="Describe this step…">${esc(s)}</textarea>
        <div class="tools"><button data-b="up" aria-label="Move up">▲</button><button data-b="down" aria-label="Move down">▼</button><button data-b="delStep" aria-label="Delete">✕</button></div></div>`).join("")}</div>
      <button class="add-btn" data-b="addStep">+ Add step</button>`}
    </div>
    <div class="err" id="bErr"></div>
    <div class="save-bar">
      ${B.id ? `<button class="pill-btn danger" data-b="delete" style="flex:.6">Delete</button>` : ""}
      <button class="pill-btn primary" data-b="save">${B.id ? "Save changes" : "Add to Garnish 🍸"}</button>
    </div>`;
}
function refreshPreview() {
  const pv = previewDrink();
  const el = $("#bPreview"); if (el) { el.innerHTML = glassSVG(pv); el.style.setProperty("--pc", B.color); }
  const t = $("#bTitle"); if (t) t.textContent = B.name || "Your masterpiece";
  const a = $("#bAuto"); if (a) a.innerHTML = buildSteps(pv).map(s => `<li>${esc(s)}</li>`).join("");
}
const BI = $("#builderInner");
BI.addEventListener("input", e => {
  if (!B) return; const t = e.target;
  if (t.dataset.f) { B[t.dataset.f] = t.value; if (t.dataset.f === "base") B.baseTouched = true; refreshPreview(); if (t.dataset.f === "cat" && t.value === "Mocktail") { B.base = "None"; renderKeep(); } }
  else if (t.dataset.ing) { const k = +t.closest(".b-ing").dataset.i; B.ings[k][t.dataset.ing] = t.value;
    if (!B.baseTouched && (t.dataset.ing === "name" || t.dataset.ing === "flag")) { const nb = inferBase(B.ings); if (nb && nb !== B.base) { B.base = nb; const sel = $("[data-f=base]"); if (sel) sel.value = nb; } }
    refreshPreview(); }
  else if (t.dataset.step != null) { B.steps[+t.dataset.step] = t.value; }
  else if (t.id === "bColor") { B.color = t.value; refreshPreview(); $$(".sw").forEach(s => s.classList.remove("on")); const l = t.closest(".sw-custom"); l.classList.add("on"); l.style.background = t.value; }
});
BI.addEventListener("change", e => { const t = e.target; if (t.id === "bColor" || t.dataset.f === "method" || t.dataset.f === "base") { sfx("tick"); renderKeep(); } });
function renderKeep() { const sc = BI.scrollTop; renderBuilder(); BI.scrollTop = sc; }
BI.addEventListener("click", e => {
  if (!B) return;
  const g = e.target.closest("[data-glass]"); if (g) { B.glass = g.dataset.glass; sfx("clink"); renderKeep(); return; }
  const c = e.target.closest("[data-color]"); if (c) { B.color = c.dataset.color; sfx("pour"); renderKeep(); return; }
  const gq = e.target.closest("[data-gq]"); if (gq) { const v = gq.dataset.gq; B.garnish = B.garnish.trim() ? B.garnish.trim() + ", " + v.toLowerCase() : v; sfx("pop"); renderKeep(); return; }
  const sm = e.target.closest("[data-sm]"); if (sm) {
    B.stepsMode = sm.dataset.sm;
    if (B.stepsMode === "custom" && !B.steps.filter(s => s.trim()).length) { B.steps = buildSteps(previewDrink()); toast("Started you off with the auto steps — edit away ✍️"); }
    sfx("tick"); renderKeep(); return;
  }
  const b = e.target.closest("[data-b]"); if (!b) return;
  const act = b.dataset.b;
  if (act === "close") { closeBuilder(); sfx("thunk"); return; }
  if (act === "addIng") { B.ings.push(blankIng()); sfx("pop"); renderKeep(); const ins = $$("#bIngs [data-ing=name]"); ins[ins.length - 1].focus(); return; }
  if (act === "delIng") { const k = +b.closest(".b-ing").dataset.i; B.ings.splice(k, 1); if (!B.ings.length) B.ings.push(blankIng()); sfx("thunk"); renderKeep(); return; }
  if (act === "addStep") { B.steps.push(""); sfx("pop"); renderKeep(); const ts = $$("#bSteps textarea"); ts[ts.length - 1].focus(); return; }
  const sk = b.closest(".b-step") ? +b.closest(".b-step").dataset.s : -1;
  if (act === "delStep") { B.steps.splice(sk, 1); sfx("thunk"); renderKeep(); return; }
  if (act === "up" && sk > 0) { [B.steps[sk - 1], B.steps[sk]] = [B.steps[sk], B.steps[sk - 1]]; sfx("tick"); renderKeep(); return; }
  if (act === "down" && sk < B.steps.length - 1) { [B.steps[sk + 1], B.steps[sk]] = [B.steps[sk], B.steps[sk + 1]]; sfx("tick"); renderKeep(); return; }
  if (act === "delete") {
    if (!confirm(`Delete "${B.name}" forever?`)) return;
    const id = B.id; S.custom = S.custom.filter(x => x.id !== id); S.fav = S.fav.filter(x => x !== id); save(); rebuild(); renderChips();
    closeBuilder(); if (openId === id) closeDrink(); sfx("thunk"); toast("Recipe poured down the drain 🫗"); refreshCurrent(); return;
  }
  if (act === "save") saveBuilder(b);
});
function saveBuilder(btn) {
  const c = builderToCustom(B); const err = $("#bErr");
  if (!c.name) { err.textContent = "Give your drink a name first."; sfx("thunk"); $("[data-f=name]").focus(); return; }
  if (!c.ings.length) { err.textContent = "Add at least one ingredient."; sfx("thunk"); return; }
  const bad = B.ings.find(i => i.name.trim() && i.amt.trim() && parseAmt(i.amt) == null);
  if (bad) { err.textContent = `Couldn't read the amount "${bad.amt}" for ${bad.name}.`; sfx("thunk"); return; }
  if (DR.some(d => !d.custom && d.name.toLowerCase() === c.name.toLowerCase())) { err.textContent = "There's already a built-in drink with that name — try a twist on the name."; sfx("thunk"); return; }
  const isNew = !c.id;
  if (isNew) c.id = "my-" + slug(c.name).slice(0, 30) + "-" + Date.now().toString(36);
  const ix = S.custom.findIndex(x => x.id === c.id);
  if (ix >= 0) S.custom[ix] = c; else S.custom.push(c);
  save(); rebuild(); renderChips();
  const r = btn.getBoundingClientRect(); sparkle(r.left + r.width / 2, r.top, 34);
  sfx("tada"); toast(isNew ? `${c.name} added to the menu! 🍸` : "Recipe updated ✨");
  closeBuilder();
  if (openId) { openId = c.id; pour = "single"; renderDetail(true); $("#sheetInner").scrollTop = 0; }
  else openDrink(c.id);
  refreshCurrent();
}
swipeClose(BI, () => closeBuilder());
$("#newBtn").onclick = () => openBuilder();
$("#newBtn2").onclick = () => openBuilder();

// ───────────────────────── CABINET ─────────────────────────
// Every visit starts with all shelves collapsed; open them one by one.
const C = { q: "", only: false, closed: new Set() };
function collapseAllShelves() { C.closed = new Set(SHELVES.map(s => s[0])); }
function toggleCab(n) {
  const i = S.cab.indexOf(n);
  if (i >= 0) { S.cab.splice(i, 1); sfx("thunk"); } else { S.cab.push(n); sfx("pop"); }
  save();
}
function renderCab() {
  const have = cab(); const ready = DR.filter(d => !missingFor(d, have).length).length;
  const near = DR.filter(d => missingFor(d, have).length === 1).length;
  $("#cabStats").innerHTML = `<div class="stat"><b>${have.size}</b><span>In stock</span></div><div class="stat"><b>${ready}</b><span>Ready to pour</span></div><div class="stat"><b>${near}</b><span>1 away</span></div>`;
  $("#onlyHaveBtn").classList.toggle("on", C.only);
  const q = norm(C.q.trim());
  $("#cabList").innerHTML = SHELVES.map(([s, ico, list]) => {
    const items = list.filter(n => (!q || norm(n).includes(q)) && (!C.only || have.has(n)));
    if (!items.length) return "";
    const cnt = list.filter(n => have.has(n)).length;
    const closed = C.closed.has(s) && !q;
    const note = s === "Spirits" ? `<div class="shelf-note">Tip: “Whiskey” = any plain whiskey. It also counts for bourbon, rye, Irish, blended &amp; Japanese recipes.</div>` :
      s === "My Ingredients" ? `<div class="shelf-note">Ingredients from your own recipes.</div>` : "";
    return `<div class="shelf${closed ? " closed" : ""}" data-shelf="${esc(s)}"><div class="shelf-h"><span>${ico} ${esc(s)}</span><span class="cnt">${cnt}/${list.length}<span class="chev">▾</span></span></div>
      <div class="shelf-b">${note}${items.map(n => `<button class="bottle${have.has(n) ? " on" : ""}" data-n="${esc(n)}">${esc(n)}<small>${USES[n] || 0}</small></button>`).join("")}</div></div>`;
  }).join("") || `<div class="empty"><span class="big">🕸️</span>${C.only ? "Your cabinet is emptier than a dive bar at 9 AM." : "Nothing by that name back here."}</div>`;
}
$("#cabList").onclick = e => {
  const b = e.target.closest(".bottle");
  if (b) { const n = b.dataset.n; toggleCab(n);
    if (S.cab.includes(n)) { const r = b.getBoundingClientRect(); sparkle(r.left + r.width / 2, r.top + r.height / 2, 10); }
    const sc = scrollY; renderCab(); scrollTo(0, sc); return; }
  const h = e.target.closest(".shelf-h");
  if (h) { const s = h.parentElement.dataset.shelf; C.closed.has(s) ? C.closed.delete(s) : C.closed.add(s); sfx("tick"); h.parentElement.classList.toggle("closed"); }
};
$("#cabQ").oninput = e => { C.q = e.target.value; renderCab(); };
$("#onlyHaveBtn").onclick = () => { C.only = !C.only; sfx("tick"); renderCab(); };
$("#basicsBtn").onclick = e => { let added = 0; BASICS.forEach(n => { if (!S.cab.includes(n)) { S.cab.push(n); added++; } }); save(); sfx("pop"); setTimeout(() => sfx("pop"), 120);
  toast(added ? `Stocked ${added} bar basics 🍋` : "Basics already stocked!"); const r = e.target.getBoundingClientRect(); sparkle(r.left + r.width / 2, r.top, 18); renderCab(); };

// ───────────────────────── MIX ─────────────────────────
const X = { mode: null, chosen: false, q: "" };
function renderMix() {
  if (!X.chosen) X.mode = S.cab.length ? "cab" : "pick";
  $$("#mixMode button").forEach(b => b.classList.toggle("on", b.dataset.mode === X.mode));
  $("#pickPanel").classList.toggle("hidden", X.mode !== "pick");
  const have = new Set(X.mode === "cab" ? S.cab : S.pick);
  if (X.mode === "pick") {
    const q = norm(X.q.trim());
    const pool = [...new Set([...ALL_INGS, "Whiskey"])];
    const sug = pool.filter(n => !have.has(n) && (!q || norm(n).includes(q))).sort((a, b) => (USES[b] || 0) - (USES[a] || 0)).slice(0, q ? 30 : 18);
    $("#pickSuggest").innerHTML = sug.map(n => `<button class="chip sm" data-add="${esc(n)}">+ ${esc(n)}</button>`).join("") || '<span class="hint">No matches.</span>';
    $("#picked").innerHTML = S.pick.length ? S.pick.map(n => `<button class="chip sm on" data-rm="${esc(n)}">${esc(n)}<span class="x">✕</span></button>`).join("") : '<span class="hint">Nothing selected yet — tap ingredients above.</span>';
  }
  const out = $("#mixResults");
  if (!have.size) { out.innerHTML = `<div class="empty"><span class="big">🍸</span>${X.mode === "cab" ? "Your Liquor Cabinet is empty.<br>Stock it up and I'll tell you what you can pour." : "Pick a few ingredients and I'll play matchmaker."}</div>`; return; }
  const scored = DR.map(d => ({ d, miss: missingFor(d, have) }));
  const r0 = scored.filter(s => !s.miss.length), r1 = scored.filter(s => s.miss.length === 1), r2 = scored.filter(s => s.miss.length === 2);
  const gain = {}; r1.forEach(s => gain[s.miss[0]] = (gain[s.miss[0]] || 0) + 1);
  const best = Object.entries(gain).sort((a, b) => b[1] - a[1]).slice(0, 3);
  const sec = (t, arr, ico) => arr.length ? `<div class="res-h">${ico} ${t} <span class="count">${arr.length}</span></div><div class="cards">${arr.map(s => cardHTML(s.d, have, s.miss)).join("")}</div>` : "";
  out.innerHTML = (best.length ? `<div class="insight"><b>🛒 Best next bottle</b>${best.map(([n, c]) => `<div class="row"><span>${esc(n)}</span><span>+${c} drink${c > 1 ? "s" : ""}</span></div>`).join("")}</div>` : "")
    + (r0.length ? "" : `<div class="res-h">🥲 Nothing fully pourable yet</div>`)
    + sec("Ready to pour", r0, "✅") + sec("One ingredient away", r1, "🔸") + sec("Two away", r2.slice(0, 40), "🔹");
}
$("#mixMode").onclick = e => { const b = e.target.closest("[data-mode]"); if (!b) return; X.mode = b.dataset.mode; X.chosen = true; sfx("tick"); renderMix(); };
$("#pickQ").oninput = e => { X.q = e.target.value; renderMix(); };
$("#pickSuggest").onclick = e => { const b = e.target.closest("[data-add]"); if (!b) return; S.pick.push(b.dataset.add); save(); sfx("pop");
  const r = b.getBoundingClientRect(); sparkle(r.left + r.width / 2, r.top + r.height / 2, 8); X.q = ""; $("#pickQ").value = ""; renderMix(); };
$("#picked").onclick = e => { const b = e.target.closest("[data-rm]"); if (!b) return; S.pick = S.pick.filter(n => n !== b.dataset.rm); save(); sfx("thunk"); renderMix(); };
$("#pickClear").onclick = () => { S.pick = []; save(); sfx("thunk"); renderMix(); };
bindCards($("#mixResults"));

// ───────────────────────── FAVORITES & MINE ─────────────────────────
function renderFav() {
  const have = cab(); const list = S.fav.map(id => BY_ID[id]).filter(Boolean).sort((a, b) => a.name.localeCompare(b.name));
  $("#favList").innerHTML = list.length ? list.map(d => cardHTML(d, have)).join("") :
    `<div class="empty"><span class="big">💔</span>No favorites yet.<br>Tap the heart on any drink — it won't judge you for loving Appletinis.</div>`;
  const mine = DR.filter(d => d.custom);
  $("#mineList").innerHTML = mine.length ? mine.map(d => cardHTML(d, have)).join("") :
    `<div class="empty" style="padding:24px 20px"><span class="big">🧪</span>No signature drinks yet.<br>Tap “✚ New recipe” — or open any drink and hit “Remix as my own.”</div>`;
}
bindCards($("#favList")); bindCards($("#mineList"));

// ───────────────────────── SETTINGS ─────────────────────────
function syncUnits() { $$("[data-unit]").forEach(b => b.classList.toggle("on", b.dataset.unit === S.units)); }
function setUnits(u) { if (S.units === u) return; S.units = u; save(); sfx("tick"); syncUnits(); if (openId) rerenderDetail(); toast(u === "ml" ? "Switched to milliliters 🇪🇺" : "Switched to fluid ounces 🇺🇸"); }
document.addEventListener("click", e => { const u = e.target.closest(".unit-seg [data-unit]"); if (u && !e.target.closest("#sheetInner")) setUnits(u.dataset.unit); });
const SND_ON = '<svg viewBox="0 0 24 24"><path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11"/></svg>';
const SND_OFF = '<svg viewBox="0 0 24 24"><path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M17 9l5 6M22 9l-5 6"/></svg>';
function syncToggles() {
  $("#soundBtn").innerHTML = S.sound ? SND_ON : SND_OFF;
  $("#sndSwitch").classList.toggle("on", S.sound); $("#fxSwitch").classList.toggle("on", S.fx);
  document.body.classList.toggle("nofx", !S.fx);
  if (!S.fx) { const c = $("#bokeh"); c.getContext("2d").clearRect(0, 0, c.width, c.height); }
}
function toggleSound() { S.sound = !S.sound; save(); syncToggles(); if (S.sound) sfx("clink"); toast(S.sound ? "Sound on — clink clink 🔊" : "Sound off. Shhh, speakeasy mode 🤫"); }
$("#soundBtn").onclick = toggleSound; $("#sndSwitch").onclick = toggleSound;
$("#fxSwitch").onclick = () => { S.fx = !S.fx; save(); syncToggles(); sfx("tick"); };
$("#exportBtn").onclick = () => {
  const data = JSON.stringify({ app: "Garnish", v: 2, exported: new Date().toISOString(), cab: S.cab, fav: S.fav, units: S.units, custom: S.custom }, null, 2);
  const blob = new Blob([data], { type: "application/json" }); const a = document.createElement("a");
  a.href = URL.createObjectURL(blob); a.download = `garnish-backup-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  sfx("pop"); toast("Backup exported 📦");
};
$("#importFile").onchange = e => {
  const f = e.target.files[0]; if (!f) return; const rd = new FileReader();
  rd.onload = () => { try { const j = JSON.parse(rd.result); if (!Array.isArray(j.cab) || !Array.isArray(j.fav)) throw 0;
    if (Array.isArray(j.custom)) S.custom = j.custom.filter(c => c && c.id && c.name && Array.isArray(c.ings));
    rebuild();
    S.cab = j.cab.filter(n => SHELF_OF[n]); S.fav = j.fav.filter(id => BY_ID[id]); if (j.units) S.units = j.units; save(); syncUnits(); renderChips();
    sfx("tada"); toast(`Restored ${S.cab.length} ingredients, ${S.fav.length} faves & ${S.custom.length} recipes ✨`); refreshCurrent(); }
    catch (err) { sfx("thunk"); toast("That file doesn't look like a Garnish backup."); } e.target.value = ""; };
  rd.readAsText(f);
};
$("#resetBtn").onclick = () => { if (!confirm("Empty your Liquor Cabinet and clear all favorites? (Your own recipes stay.)")) return; S.cab = []; S.fav = []; S.pick = []; save(); sfx("thunk"); toast("Bar wiped clean. Last call!"); refreshCurrent(); };
function renderAbout() { $("#about").innerHTML = `Garnish v2.2 · ${BUILTIN.length} drinks${S.custom.length ? ` + ${S.custom.length} of yours` : ""} · ${ALL_INGS.length} ingredients<br>Works offline once installed. Please drink responsibly —<br>the floor is not a chair.`; }

// ───────────────────────── Navigation ─────────────────────────
let current = "menu";
function show(v) {
  if (v === current) { scrollTo({ top: 0, behavior: "smooth" }); return; }
  if (current === "cab" || v === "cab") { collapseAllShelves(); C.q = ""; $("#cabQ").value = ""; }
  current = v; sfx("tick");
  $$(".view").forEach(s => s.classList.toggle("active", s.id === "view-" + v));
  $$(".tabbar button").forEach(b => b.classList.toggle("active", b.dataset.view === v));
  scrollTo(0, 0); refreshCurrent();
}
function refreshCurrent() {
  if (current === "menu") renderMenu(); else if (current === "mix") renderMix(); else if (current === "cab") renderCab(); else if (current === "fav") renderFav(); else renderAbout();
}
$(".tabbar").onclick = e => { const b = e.target.closest("[data-view]"); if (b) show(b.dataset.view); };

// init
rebuild(); collapseAllShelves(); renderChips(); renderMenu(); syncUnits(); syncToggles(); renderAbout(); save();
window.Garnish = { open: openDrink, ids: () => DR.map(d => d.id), steps: id => buildSteps(BY_ID[id]), build: openBuilder, dbl: id => [...doubleSet(BY_ID[id])].map(i => i.name) };

if ("serviceWorker" in navigator) addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
try { screen.orientation && screen.orientation.lock && screen.orientation.lock("portrait").catch(() => {}); } catch (e) {}
})();
