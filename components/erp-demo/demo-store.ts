export type LocationType = "warehouse" | "branch" | "van";
export type Location = { id: string; name: string; type: LocationType; active: boolean };
export type Product = { id: string; sku: string; barcode: string; name: string; category: string; unit: string; cartonFactor: number; wholesalePrice: number; retailPrice: number; defaultCost: number; batchTracked: boolean; expiryTracked: boolean };
export type Supplier = { id: string; name: string; phone: string; due: number };
export type Route = { id: string; name: string; area: string };
export type Rep = { id: string; name: string; phone: string; vehicle: string; routeId: string; vanId: string };
export type Movement = { id: string; at: number; type: string; ref: string; item: string; from: string; to: string; qty: number; note: string };
export type Invoice = { id: string; at: number; number: string; kind: "retail" | "wholesale" | "trip"; customer: string; locationId: string; total: number; paid: number; method: string; lines: Array<{ productId: string; qty: number; price: number }> };
export type Purchase = { id: string; at: number; number: string; supplierId: string; warehouseId: string; productId: string; quantity: number; total: number; paid: number; paymentMethod: string; checkNo: string; batchNumber: string; expiryDate: string };
export type Trip = { id: string; number: string; repId: string; routeId: string; sourceId: string; vanId: string; openedAt: number; closedAt: number | null; expectedCash: number; deliveredCash: number | null; lines: Array<{ productId: string; loaded: number; sold: number; good: number; damaged: number; shortage: number }> };
export type DemoState = { version: 1; firstLaunchAt: number; locations: Location[]; products: Product[]; balances: Record<string, number>; suppliers: Supplier[]; routes: Route[]; reps: Rep[]; movements: Movement[]; invoices: Invoice[]; purchases: Purchase[]; trips: Trip[]; checks: Array<{ id: string; supplierId: string; number: string; amount: number; dueDate: string; status: "معلق" | "مصروف" | "مرتد" }>; nextSequence: number };
export const DEMO_STORAGE_KEY = "qutoof-erp-demo-v1";
export const DEMO_AUTH_KEY = "qutoof-erp-demo-auth";
export const TEN_DAYS = 10 * 24 * 60 * 60 * 1000;
export const isTrialExpired = (firstLaunchAt: number, now = Date.now()) => now >= firstLaunchAt + TEN_DAYS;
export const balanceKey = (locationId: string, productId: string) => `${locationId}::${productId}`;
export const money = (value: number) => new Intl.NumberFormat("ar-EG", { maximumFractionDigits: 2 }).format(value) + " ج.م";
export const qtyText = (value: number) => new Intl.NumberFormat("ar-EG", { maximumFractionDigits: 2 }).format(value);
export const makeId = () => typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

export function createSeed(now = Date.now()): DemoState {
  const locations: Location[] = [
    { id: "wh-cairo", name: "المخزن الرئيسي - القاهرة", type: "warehouse", active: true },
    { id: "wh-giza", name: "المخزن الرئيسي - الجيزة", type: "warehouse", active: true },
    { id: "wh-alex", name: "المخزن الرئيسي - الإسكندرية", type: "warehouse", active: true },
    { id: "br-nasr", name: "فرع مدينة نصر", type: "branch", active: true },
    { id: "br-moh", name: "فرع المهندسين", type: "branch", active: true },
    { id: "van-samir", name: "سيارة المندوب سامر", type: "van", active: true },
    { id: "van-hani", name: "سيارة المندوب هاني", type: "van", active: true },
  ];
  const products: Product[] = [
    { id: "p-rice", sku: "QT-1001", barcode: "6223001001001", name: "أرز مصري فاخر 1 كجم", category: "مواد غذائية", unit: "قطعة", cartonFactor: 12, wholesalePrice: 240, retailPrice: 275, defaultCost: 198, batchTracked: true, expiryTracked: true },
    { id: "p-oil", sku: "QT-1002", barcode: "6223001001002", name: "زيت عباد الشمس 1 لتر", category: "مواد غذائية", unit: "زجاجة", cartonFactor: 12, wholesalePrice: 510, retailPrice: 565, defaultCost: 442, batchTracked: true, expiryTracked: true },
    { id: "p-sugar", sku: "QT-1003", barcode: "6223001001003", name: "سكر أبيض 1 كجم", category: "مواد غذائية", unit: "كيس", cartonFactor: 10, wholesalePrice: 190, retailPrice: 220, defaultCost: 154, batchTracked: true, expiryTracked: true },
    { id: "p-pasta", sku: "QT-1004", barcode: "6223001001004", name: "مكرونة 400 جم", category: "مواد غذائية", unit: "كيس", cartonFactor: 20, wholesalePrice: 175, retailPrice: 205, defaultCost: 140, batchTracked: false, expiryTracked: true },
    { id: "p-tea", sku: "QT-1005", barcode: "6223001001005", name: "شاي أسود 250 جم", category: "مشروبات", unit: "عبوة", cartonFactor: 24, wholesalePrice: 720, retailPrice: 790, defaultCost: 625, batchTracked: true, expiryTracked: true },
    { id: "p-det", sku: "QT-1006", barcode: "6223001001006", name: "مسحوق غسيل 2 كجم", category: "منظفات", unit: "عبوة", cartonFactor: 6, wholesalePrice: 430, retailPrice: 485, defaultCost: 360, batchTracked: false, expiryTracked: false },
    { id: "p-soap", sku: "QT-1007", barcode: "6223001001007", name: "صابون يدين 500 مل", category: "عناية منزلية", unit: "زجاجة", cartonFactor: 12, wholesalePrice: 310, retailPrice: 355, defaultCost: 250, batchTracked: false, expiryTracked: true },
    { id: "p-tomato", sku: "QT-1008", barcode: "6223001001008", name: "صلصة طماطم 300 جم", category: "مواد غذائية", unit: "علبة", cartonFactor: 24, wholesalePrice: 265, retailPrice: 305, defaultCost: 210, batchTracked: true, expiryTracked: true },
    { id: "p-water", sku: "QT-1009", barcode: "6223001001009", name: "مياه معدنية 1.5 لتر", category: "مشروبات", unit: "زجاجة", cartonFactor: 6, wholesalePrice: 75, retailPrice: 90, defaultCost: 50, batchTracked: false, expiryTracked: true },
    { id: "p-coffee", sku: "QT-1010", barcode: "6223001001010", name: "قهوة تركي 200 جم", category: "مشروبات", unit: "عبوة", cartonFactor: 12, wholesalePrice: 560, retailPrice: 625, defaultCost: 470, batchTracked: true, expiryTracked: true },
  ];
  const balances: Record<string, number> = {};
  locations.forEach((location, li) => products.forEach((product, pi) => {
    const base = location.type === "warehouse" ? 90 + ((li + 2) * (pi + 3) * 7) % 170 : location.type === "branch" ? 12 + ((li + 1) * (pi + 5) * 3) % 36 : 0;
    balances[balanceKey(location.id, product.id)] = base;
  }));
  const suppliers: Supplier[] = [
    { id: "s-nile", name: "شركة النيل للتوريدات", phone: "0100 234 5678", due: 18650 },
    { id: "s-misr", name: "مؤسسة مصر للتجارة", phone: "0111 654 3210", due: 9250 },
    { id: "s-food", name: "الأمانة للمواد الغذائية", phone: "0122 777 8899", due: 0 },
  ];
  const routes: Route[] = [{ id: "r-east", name: "خط شرق القاهرة", area: "مدينة نصر · التجمع" }, { id: "r-west", name: "خط غرب القاهرة", area: "المهندسين · أكتوبر" }, { id: "r-delta", name: "خط الدلتا", area: "طنطا · المحلة" }];
  const reps: Rep[] = [{ id: "rep-samer", name: "سامر إبراهيم", phone: "0109 112 3040", vehicle: "نيسان بيك أب · س م ن ٤٨٢١", routeId: "r-east", vanId: "van-samir" }, { id: "rep-hany", name: "هاني محمود", phone: "0114 560 7788", vehicle: "شيفروليه · ق ر ب ٢١٦٥", routeId: "r-west", vanId: "van-hani" }];
  const ago = (days: number, hour = 10) => now - days * 86400000 + hour * 3600000;
  const movements: Movement[] = [
    { id: makeId(), at: ago(0, 1), type: "استلام توريد", ref: "PUR-26041", item: "زيت عباد الشمس 1 لتر", from: "مورد", to: locations[0].name, qty: 120, note: "دفعة 24-06 · صلاحية 2027/06" },
    { id: makeId(), at: ago(0, 0), type: "تحويل مخزني", ref: "TRF-26088", item: "أرز مصري فاخر 1 كجم", from: locations[0].name, to: locations[3].name, qty: 48, note: "تغذية فرع مدينة نصر" },
    { id: makeId(), at: ago(1, 3), type: "بيع جملة", ref: "INV-260327", item: "سكر أبيض 1 كجم", from: locations[0].name, to: "عميل جملة", qty: 60, note: "فاتورة بيع آجل جزئي" },
    { id: makeId(), at: ago(1, 1), type: "صرف عهدة", ref: "TRIP-0061", item: "مكرونة 400 جم", from: locations[0].name, to: "سيارة المندوب سامر", qty: 100, note: "رحلة شرق القاهرة" },
    { id: makeId(), at: ago(2), type: "مرتجع سليم", ref: "RET-0094", item: "شاي أسود 250 جم", from: "عميل تجزئة", to: locations[3].name, qty: 2, note: "مرتجع إلى رصيد الفرع" },
  ];
  const invoices: Invoice[] = [
    { id: makeId(), at: ago(0), number: "INV-260328", kind: "retail", customer: "عميل نقدي", locationId: "br-nasr", total: 1675, paid: 1675, method: "نقدي", lines: [{ productId: "p-rice", qty: 3, price: 275 }, { productId: "p-oil", qty: 2, price: 565 }] },
    { id: makeId(), at: ago(1), number: "INV-260327", kind: "wholesale", customer: "سوبر ماركت الخير", locationId: "wh-cairo", total: 14400, paid: 6000, method: "تحويل بنكي", lines: [{ productId: "p-sugar", qty: 60, price: 190 }, { productId: "p-pasta", qty: 0, price: 175 }] },
    { id: makeId(), at: ago(2), number: "INV-260326", kind: "retail", customer: "ميني ماركت الندى", locationId: "br-moh", total: 2260, paid: 1200, method: "InstaPay", lines: [{ productId: "p-tea", qty: 2, price: 790 }, { productId: "p-soap", qty: 2, price: 355 }] },
  ];
  const purchases: Purchase[] = [{ id: makeId(), at: ago(0, 1), number: "SUP-7842", supplierId: "s-nile", warehouseId: "wh-cairo", productId: "p-oil", quantity: 100, total: 44200, paid: 25550, paymentMethod: "تحويل بنكي", checkNo: "CH-19024", batchNumber: "OIL-24-06", expiryDate: "2027-06-30" }, { id: makeId(), at: ago(3), number: "SUP-7836", supplierId: "s-misr", warehouseId: "wh-giza", productId: "p-sugar", quantity: 200, total: 32800, paid: 23550, paymentMethod: "نقدي", checkNo: "", batchNumber: "SUG-26-05", expiryDate: "2027-05-31" }];
  const trips: Trip[] = [{ id: makeId(), number: "TRIP-0061", repId: "rep-samer", routeId: "r-east", sourceId: "wh-cairo", vanId: "van-samir", openedAt: ago(0, 2), closedAt: null, expectedCash: 3640, deliveredCash: null, lines: [{ productId: "p-pasta", loaded: 100, sold: 24, good: 0, damaged: 0, shortage: 0 }, { productId: "p-water", loaded: 48, sold: 12, good: 0, damaged: 0, shortage: 0 }] }];
  for (const trip of trips) for (const line of trip.lines) { const available = balances[balanceKey(trip.sourceId, line.productId)] ?? 0; balances[balanceKey(trip.sourceId, line.productId)] = Math.max(0, available - line.loaded); balances[balanceKey(trip.vanId, line.productId)] = Math.max(0, line.loaded - line.sold); }
  return { version: 1, firstLaunchAt: now, locations, products, balances, suppliers, routes, reps, movements, invoices, purchases, trips, checks: [{ id: makeId(), supplierId: "s-nile", number: "CH-19024", amount: 12000, dueDate: new Date(now + 86400000 * 9).toISOString().slice(0, 10), status: "معلق" }], nextSequence: 329 };
}
export function readDemoState(): DemoState | null {
  try { const raw = localStorage.getItem(DEMO_STORAGE_KEY); if (!raw) return null; const parsed = JSON.parse(raw) as DemoState; return parsed?.version === 1 && Array.isArray(parsed.products) && Array.isArray(parsed.locations) ? parsed : null; } catch { return null; }
}
export function writeDemoState(state: DemoState) { try { localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(state)); } catch { /* Storage can be unavailable in private/restricted browser modes. */ } }
export function nextDocumentNumber(state: DemoState, prefix: string) { return `${prefix}-${String(state.nextSequence).padStart(6, "0")}`; }
