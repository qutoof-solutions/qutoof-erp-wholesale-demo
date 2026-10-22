import test from "node:test";
import assert from "node:assert/strict";
import { strToU8, zipSync } from "fflate";
import { balanceKey, createSeed, isTrialExpired, TEN_DAYS } from "../components/erp-demo/demo-store";
import { parseCsv, readSpreadsheet } from "../components/erp-demo/spreadsheet";

test("demo seed contains three main warehouses, branches, and locally isolated trip stock", () => {
  const seed = createSeed(1_800_000_000_000);
  assert.equal(seed.locations.filter((x) => x.type === "warehouse").length, 3);
  assert.ok(seed.locations.some((x) => x.type === "branch"));
  const trip = seed.trips.find((x) => !x.closedAt);
  assert.ok(trip);
  for (const line of trip.lines) {
    assert.equal(seed.balances[balanceKey(trip.vanId, line.productId)], line.loaded - line.sold);
  }
  assert.equal(TEN_DAYS, 10 * 24 * 60 * 60 * 1000);
  assert.equal(isTrialExpired(1_000, 1_000 + TEN_DAYS - 1), false);
  assert.equal(isTrialExpired(1_000, 1_000 + TEN_DAYS), true);
});

test("CSV reader preserves quoted commas, escaped quotes, and Arabic headers", () => {
  const rows = parseCsv('اسم الصنف,SKU,ملاحظة\n"أرز، فاخر",A-1,"دفعة، رقم \"\"١\"\""\n');
  assert.equal(rows.length, 1);
  assert.equal(rows[0]["اسم الصنف"], "أرز، فاخر");
  assert.equal(rows[0].ملاحظة, 'دفعة، رقم "١"');
});

test("XLSX first worksheet imports inline string and numeric cells", () => {
  const sheet = '<?xml version="1.0"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData><row r="1"><c r="A1" t="inlineStr"><is><t>SKU</t></is></c><c r="B1" t="inlineStr"><is><t>name</t></is></c><c r="C1" t="inlineStr"><is><t>openingStock</t></is></c></row><row r="2"><c r="A2" t="inlineStr"><is><t>QT-77</t></is></c><c r="B2" t="inlineStr"><is><t>صنف تجريبي</t></is></c><c r="C2"><v>24</v></c></row></sheetData></worksheet>';
  const buffer = zipSync({ "xl/worksheets/sheet1.xml": strToU8(sheet) }).buffer;
  const rows = readSpreadsheet("items.xlsx", buffer);
  assert.equal(rows[0].SKU, "QT-77");
  assert.equal(rows[0].name, "صنف تجريبي");
  assert.equal(rows[0].openingStock, "24");
});
