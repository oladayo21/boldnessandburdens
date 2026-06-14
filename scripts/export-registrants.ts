import ExcelJS from "exceljs";
import { join, resolve } from "path";
import { mkdirSync, existsSync } from "fs";

const ROOT = resolve(import.meta.dirname, "..");
const DATA_DIR = join(ROOT, "data");

const NETLIFY_TOKEN = process.env.NETLIFY_TOKEN;
const NETLIFY_FORM_ID = process.env.NETLIFY_FORM_ID;

if (!NETLIFY_TOKEN || !NETLIFY_FORM_ID) {
  console.error("Missing NETLIFY_TOKEN or NETLIFY_FORM_ID in .env");
  process.exit(1);
}

interface NetlifySubmission {
  id: string;
  data: Record<string, string>;
  created_at: string;
}

async function fetchAll(): Promise<NetlifySubmission[]> {
  const all: NetlifySubmission[] = [];
  let page = 1;

  while (true) {
    const res = await fetch(
      `https://api.netlify.com/api/v1/forms/${NETLIFY_FORM_ID}/submissions?per_page=100&page=${page}`,
      { headers: { Authorization: `Bearer ${NETLIFY_TOKEN}` } }
    );

    if (!res.ok) throw new Error(`Netlify API: ${res.status} ${res.statusText}`);

    const subs: NetlifySubmission[] = await res.json();

    if (subs.length === 0) break;

    all.push(...subs);

    if (subs.length < 100) break;

    page++;
  }

  return all;
}

console.log("Fetching from Netlify...");
const submissions = await fetchAll();
console.log(`Fetched ${submissions.length} submissions.`);

submissions.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

const workbook = new ExcelJS.Workbook();
workbook.creator = "BBC'26";
workbook.created = new Date();

const sheet = workbook.addWorksheet("Registrants");

sheet.columns = [
  { header: "#", key: "idx", width: 5 },
  { header: "Full Name", key: "full_name", width: 26 },
  { header: "Email", key: "email", width: 32 },
  { header: "Phone", key: "phone", width: 18 },
  { header: "City", key: "city", width: 18 },
  { header: "Gender", key: "gender", width: 10 },
  { header: "Age Band", key: "age_band", width: 14 },
  { header: "T-shirt?", key: "wants_tshirt", width: 10 },
  { header: "T-shirt size", key: "tshirt_size", width: 12 },
  { header: "Emergency Contact", key: "emergency_contact_name", width: 24 },
  { header: "Emergency Phone", key: "emergency_contact_phone", width: 18 },
];

sheet.getRow(1).font = { bold: true };
sheet.getRow(1).fill = {
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: "FFD4873A" },
};
sheet.getRow(1).alignment = { vertical: "middle" };
sheet.views = [{ state: "frozen", ySplit: 1 }];
sheet.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: 11 } };

const AGE_BANDS = ["0-3", "4-6", "adult"];

submissions.forEach((s, i) => {
  const d = s.data;

  sheet.addRow({
    idx: i + 1,
    full_name: d.full_name || d.name || "",
    email: (d.email || "").toLowerCase(),
    phone: d.phone || "",
    city: d.city || "",
    gender: d.gender || "",
    age_band: "",
    wants_tshirt: d.wants_tshirt || "no",
    tshirt_size: d.tshirt_size || "",
    emergency_contact_name: d.emergency_contact_name || "",
    emergency_contact_phone: d.emergency_contact_phone || "",
  });
});

const ageBandCol = sheet.getColumn("age_band");
const lastRow = submissions.length + 1;

for (let r = 2; r <= lastRow; r++) {
  sheet.getCell(r, ageBandCol.number).dataValidation = {
    type: "list",
    allowBlank: true,
    formulae: [`"${AGE_BANDS.join(",")}"`],
    showErrorMessage: true,
    errorTitle: "Invalid age band",
    error: `Pick one of: ${AGE_BANDS.join(", ")}`,
  };
}

const statsSheet = workbook.addWorksheet("Stats");

const emails = submissions.map((s) => (s.data.email || "").toLowerCase()).filter(Boolean);
const uniqueEmails = new Set(emails);
const tshirts = submissions.filter((s) => (s.data.wants_tshirt || "").toLowerCase() === "yes");

const tshirtSizes: Record<string, number> = {};

for (const s of tshirts) {
  const size = s.data.tshirt_size || "(unspecified)";
  tshirtSizes[size] = (tshirtSizes[size] || 0) + 1;
}

const genders: Record<string, number> = {};

for (const s of submissions) {
  const g = (s.data.gender || "(unspecified)").toLowerCase();
  genders[g] = (genders[g] || 0) + 1;
}

const cities: Record<string, number> = {};

for (const s of submissions) {
  const c = (s.data.city || "(unspecified)").trim();
  cities[c] = (cities[c] || 0) + 1;
}

statsSheet.columns = [
  { header: "Metric", key: "metric", width: 28 },
  { header: "Value", key: "value", width: 16 },
];
statsSheet.getRow(1).font = { bold: true };

statsSheet.addRow({ metric: "Total submissions", value: submissions.length });
statsSheet.addRow({ metric: "Unique emails", value: uniqueEmails.size });
statsSheet.addRow({ metric: "T-shirt orders", value: tshirts.length });
statsSheet.addRow({});
statsSheet.addRow({ metric: "Gender", value: "" }).font = { bold: true };

for (const [g, n] of Object.entries(genders)) {
  statsSheet.addRow({ metric: `  ${g}`, value: n });
}

statsSheet.addRow({});
statsSheet.addRow({ metric: "T-shirt sizes", value: "" }).font = { bold: true };

for (const [size, n] of Object.entries(tshirtSizes)) {
  statsSheet.addRow({ metric: `  ${size}`, value: n });
}

statsSheet.addRow({});
statsSheet.addRow({ metric: "Age bands (live count)", value: "" }).font = { bold: true };

const ageBandColLetter = sheet.getColumn("age_band").letter;
const ageRange = `Registrants!${ageBandColLetter}2:${ageBandColLetter}${lastRow}`;

for (const band of AGE_BANDS) {
  const row = statsSheet.addRow({ metric: `  ${band}`, value: "" });

  row.getCell("value").value = { formula: `COUNTIF(${ageRange},"${band}")` } as any;
}

statsSheet.addRow({});
statsSheet.addRow({ metric: "Cities", value: "" }).font = { bold: true };

const sortedCities = Object.entries(cities).sort((a, b) => b[1] - a[1]);

for (const [c, n] of sortedCities) {
  statsSheet.addRow({ metric: `  ${c}`, value: n });
}

if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });

const today = new Date().toISOString().slice(0, 10);
const outPath = join(DATA_DIR, `registrants-${today}.xlsx`);

await workbook.xlsx.writeFile(outPath);

console.log(`Wrote ${outPath}`);
