import { createTransport } from "nodemailer";
import { parseArgs } from "util";
import { readFileSync, writeFileSync, existsSync, mkdirSync, copyFileSync } from "fs";
import { join, resolve } from "path";
import { execSync } from "child_process";

const ROOT = resolve(import.meta.dirname, "..");
const DATA_DIR = join(ROOT, "data");
const EMAILS_DIR = join(ROOT, "emails");
const TEMPLATES_DIR = join(EMAILS_DIR, "templates");
const SENT_LOG_PATH = join(EMAILS_DIR, "sent-log.json");
const LOCAL_CSV = join(DATA_DIR, "registrants.csv");
const DOWNLOADS_CSV = join(
  process.env.HOME || "~",
  "Downloads",
  "registration.csv"
);

// --- CLI args ---

const { values } = parseArgs({
  args: Bun.argv.slice(2),
  options: {
    template: { type: "string", short: "t" },
    to: { type: "string" },
    "dry-run": { type: "boolean", default: false },
    force: { type: "boolean", default: false },
    sync: { type: "boolean", default: false },
    subject: { type: "string", short: "s" },
  },
  strict: true,
});

// --- Sync command ---

if (values.sync) {
  if (!existsSync(DOWNLOADS_CSV)) {
    console.error(`CSV not found at ${DOWNLOADS_CSV}`);
    process.exit(1);
  }

  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }

  copyFileSync(DOWNLOADS_CSV, LOCAL_CSV);
  console.log(`Synced registrants from Downloads to ${LOCAL_CSV}`);
  process.exit(0);
}

// --- Validate template ---

if (!values.template) {
  console.error("Usage: bun scripts/send-email.ts --template <name> [--to email] [--dry-run] [--force]");
  console.error("       bun scripts/send-email.ts --sync");
  console.error("");
  console.error("Templates available:");

  const templates = new Bun.Glob("*.html").scanSync(TEMPLATES_DIR);

  for (const t of templates) {
    console.error(`  - ${t.replace(".html", "")}`);
  }

  process.exit(1);
}

const templateName = values.template;
const templatePath = join(TEMPLATES_DIR, `${templateName}.html`);

if (!existsSync(templatePath)) {
  console.error(`Template not found: ${templatePath}`);
  process.exit(1);
}

// --- Load templates ---

const baseHtml = readFileSync(join(EMAILS_DIR, "base.html"), "utf-8");
const contentHtml = readFileSync(templatePath, "utf-8");

// --- Load CSV ---

if (!existsSync(LOCAL_CSV)) {
  console.log("No local CSV found. Syncing from Downloads...");

  if (!existsSync(DOWNLOADS_CSV)) {
    console.error(`CSV not found at ${DOWNLOADS_CSV}`);
    console.error("Download the CSV from Netlify and place it in ~/Downloads/registration.csv");
    process.exit(1);
  }

  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }

  copyFileSync(DOWNLOADS_CSV, LOCAL_CSV);
  console.log("Synced.");
}

function parseCSV(csv: string): Record<string, string>[] {
  const lines = csv.trim().split("\n");
  const headers = lines[0]
    .split(",")
    .map((h) => h.replace(/^"|"$/g, "").trim());

  return lines.slice(1).map((line) => {
    const values: string[] = [];
    let current = "";
    let inQuotes = false;

    for (const char of line) {
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        values.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }

    values.push(current.trim());

    const record: Record<string, string> = {};

    headers.forEach((header, i) => {
      record[header] = values[i] || "";
    });

    return record;
  });
}

const csvContent = readFileSync(LOCAL_CSV, "utf-8");
const registrants = parseCSV(csvContent);

// --- Sent log ---

function loadSentLog(): Record<string, string[]> {
  if (!existsSync(SENT_LOG_PATH)) {
    return {};
  }

  return JSON.parse(readFileSync(SENT_LOG_PATH, "utf-8"));
}

function saveSentLog(log: Record<string, string[]>) {
  writeFileSync(SENT_LOG_PATH, JSON.stringify(log, null, 2));
}

function alreadySent(email: string, template: string): boolean {
  const log = loadSentLog();

  return log[email]?.includes(template) ?? false;
}

function markSent(email: string, template: string) {
  const log = loadSentLog();

  if (!log[email]) {
    log[email] = [];
  }

  log[email].push(template);
  saveSentLog(log);
}

// --- Template rendering ---

function render(template: string, vars: Record<string, string>): string {
  let result = template;

  for (const [key, value] of Object.entries(vars)) {
    result = result.replaceAll(`{{${key}}}`, value);
  }

  return result;
}

// --- Subject lines per template ---

const defaultSubjects: Record<string, string> = {
  "registration-confirmation": "Your BBC'26 Registration is Confirmed",
};

// --- SMTP setup ---

const transporter = createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 465,
  secure: (Number(process.env.SMTP_PORT) || 465) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const fromAddress = process.env.SMTP_FROM || "info@boldnessandburdens.com";

// --- Filter recipients ---

let recipients = registrants;

if (values.to) {
  recipients = registrants.filter((r) => r.email === values.to);

  if (recipients.length === 0) {
    console.error(`No registrant found with email: ${values.to}`);
    process.exit(1);
  }
}

// --- Send ---

const subject = values.subject || defaultSubjects[templateName] || `BBC'26 Update`;

console.log(`\nTemplate: ${templateName}`);
console.log(`Subject:  ${subject}`);
console.log(`From:     ${fromAddress}`);
console.log(`Mode:     ${values["dry-run"] ? "DRY RUN" : "LIVE"}`);
console.log(`Recipients: ${recipients.length}`);
console.log("");

let sent = 0;
let skipped = 0;
let errors = 0;

for (const registrant of recipients) {
  const email = registrant.email;

  if (!email) {
    continue;
  }

  if (!values.force && alreadySent(email, templateName)) {
    console.log(`  SKIP  ${email} (already sent)`);
    skipped++;

    continue;
  }

  const vars: Record<string, string> = {
    name: registrant.full_name || "Participant",
    email: registrant.email,
    phone: registrant.phone || "",
    city: registrant.city || "",
    gender: registrant.gender || "",
    emergency_contact_name: registrant.emergency_contact_name || "",
    emergency_contact_phone: registrant.emergency_contact_phone || "",
    subject,
  };

  const content = render(contentHtml, vars);
  const html = render(baseHtml, { ...vars, content });

  if (values["dry-run"]) {
    console.log(`  WOULD SEND  ${email} (${registrant.full_name})`);

    if (sent === 0) {
      const previewPath = join(ROOT, "emails", "preview.html");
      writeFileSync(previewPath, html);
      console.log(`\n  Preview saved: ${previewPath}`);
      execSync(`open "${previewPath}"`);
      console.log("  Opened in browser.\n");
    }

    sent++;

    continue;
  }

  try {
    await transporter.sendMail({
      from: `"Boldness & Burdens" <${fromAddress}>`,
      to: email,
      subject,
      html,
    });

    markSent(email, templateName);
    console.log(`  SENT  ${email} (${registrant.full_name})`);
    sent++;
  } catch (err) {
    console.error(`  FAIL  ${email}: ${(err as Error).message}`);
    errors++;
  }
}

console.log(`\nDone. Sent: ${sent}, Skipped: ${skipped}, Errors: ${errors}`);
