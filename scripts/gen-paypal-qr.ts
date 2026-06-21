// Generates a static QR code SVG for the PayPal.Me link.
// Scanning it with a phone camera opens PayPal directly.
//
//   bun scripts/gen-paypal-qr.ts
//
// Re-run if the PayPal link ever changes. Output is committed as a static asset.

import QRCode from "qrcode";
import { join, resolve } from "path";

const ROOT = resolve(import.meta.dirname, "..");
const OUT = join(ROOT, "public", "paypal-qr.svg");

const PAYPAL_URL = "https://www.paypal.me/HeyMakhel";

const svg = await QRCode.toString(PAYPAL_URL, {
  type: "svg",
  errorCorrectionLevel: "M",
  margin: 1,
  color: {
    dark: "#241a12", // brand charcoal modules
    light: "#00000000", // transparent background (sits on cream)
  },
});

await Bun.write(OUT, svg);
console.log(`Wrote ${OUT} for ${PAYPAL_URL}`);
