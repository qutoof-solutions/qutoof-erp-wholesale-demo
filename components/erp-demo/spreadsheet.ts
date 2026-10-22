import { strFromU8, strToU8, unzipSync, zipSync } from "fflate";
export type SheetRow = Record<string, string>;
const xmlEscape = (value: string) => value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&apos;");
const xmlUnescape = (value: string) => value.replaceAll("&lt;", "<").replaceAll("&gt;", ">").replaceAll("&quot;", '"').replaceAll("&apos;", "'").replaceAll("&amp;", "&");
export function parseCsv(text: string): SheetRow[] {
  const rows: string[][] = []; let row: string[] = []; let cell = ""; let quoted = false;
  for (let i = 0; i < text.length; i++) { const c = text[i]; if (quoted) { if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; } else if (c === '"') quoted = false; else cell += c; } else if (c === '"') quoted = true; else if (c === "," || c === "\t" || c === ";") { row.push(cell); cell = ""; } else if (c === "\n" || c === "\r") { if (c === "\r" && text[i + 1] === "\n") i++; row.push(cell); rows.push(row); row = []; cell = ""; } else cell += c; }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  const headers = (rows.shift() ?? []).map((x) => x.trim().replace(/^\uFEFF/, ""));
  return rows.filter((r) => r.some((v) => v.trim())).map((r) => Object.fromEntries(headers.map((h, i) => [h, (r[i] ?? "").trim()])));
}
export function readSpreadsheet(fileName: string, buffer: ArrayBuffer): SheetRow[] {
  if (!/\.xlsx?$/i.test(fileName)) return parseCsv(new TextDecoder().decode(buffer));
  const files = unzipSync(new Uint8Array(buffer));
  const sheet = files["xl/worksheets/sheet1.xml"];
  if (!sheet) throw new Error("تعذر العثور على ورقة البيانات الأولى في ملف Excel.");
  const shared = files["xl/sharedStrings.xml"] ? [...strFromU8(files["xl/sharedStrings.xml"]).matchAll(/<si[^>]*>([\s\S]*?)<\/si>/g)].map((m) => [...m[1].matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)].map((t) => xmlUnescape(t[1])).join("")) : [];
  const xml = strFromU8(sheet); const matrix: string[][] = [];
  for (const rowMatch of xml.matchAll(/<row\b[^>]*>([\s\S]*?)<\/row>/g)) {
    const cells: string[] = [];
    for (const cellMatch of rowMatch[1].matchAll(/<c\b([^>]*)>([\s\S]*?)<\/c>/g)) {
      const ref = cellMatch[1].match(/\br="([A-Z]+)\d+"/)?.[1] ?? "A";
      const index = [...ref].reduce((n, x) => n * 26 + x.charCodeAt(0) - 64, 0) - 1;
      const type = cellMatch[1].match(/\bt="([^"]+)"/)?.[1]; const value = cellMatch[2].match(/<v[^>]*>([\s\S]*?)<\/v>/)?.[1] ?? cellMatch[2].match(/<t[^>]*>([\s\S]*?)<\/t>/)?.[1] ?? "";
      cells[index] = type === "s" ? (shared[Number(value)] ?? "") : xmlUnescape(value);
    }
    matrix.push(cells);
  }
  const headers = (matrix.shift() ?? []).map((x) => x?.trim() ?? "");
  return matrix.filter((r) => r.some(Boolean)).map((r) => Object.fromEntries(headers.map((h, i) => [h, r[i] ?? ""])));
}
export function downloadCsv(fileName: string, headers: string[], rows: Array<Array<string | number>>) {
  const quote = (x: string | number) => `"${String(x).replaceAll('"', '""')}"`;
  const csv = [headers, ...rows].map((r) => r.map(quote).join(",")).join("\r\n");
  const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" })); a.download = fileName; a.click(); URL.revokeObjectURL(a.href);
}
export function downloadXlsx(fileName: string, headers: string[], rows: Array<Array<string | number>>) {
  const all = [headers, ...rows];
  const col = (n: number) => { let s = ""; for (n++; n; n = Math.floor((n - 1) / 26)) s = String.fromCharCode(65 + (n - 1) % 26) + s; return s; };
  const cells = all.map((r, ri) => `<row r="${ri + 1}">${r.map((value, ci) => { const text = String(value ?? ""); const numeric = typeof value === "number" && Number.isFinite(value); return `<c r="${col(ci)}${ri + 1}"${numeric ? "" : ' t="inlineStr"'}>${numeric ? `<v>${value}</v>` : `<is><t xml:space="preserve">${xmlEscape(text)}</t></is>`}</c>`; }).join("")}</row>`).join("");
  const files: Record<string, Uint8Array> = {
    "[Content_Types].xml": strToU8('<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>'),
    "_rels/.rels": strToU8('<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>'),
    "xl/workbook.xml": strToU8('<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="بيانات" sheetId="1" r:id="rId1"/></sheets></workbook>'),
    "xl/_rels/workbook.xml.rels": strToU8('<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/></Relationships>'),
    "xl/worksheets/sheet1.xml": strToU8(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>${cells}</sheetData></worksheet>`),
  };
  const blob = new Blob([zipSync(files)], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }); const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = fileName; a.click(); URL.revokeObjectURL(a.href);
}
