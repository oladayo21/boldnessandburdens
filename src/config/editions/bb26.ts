// Per-edition config. Clone this file (e.g. bb27.ts) and copy the /bb26 route
// folder to spin up next year's conference. Plain TS so both Astro pages and
// the Bun seed script can import it.

export const edition = {
  id: "bb26",
  name: "Boldness & Burdens Conference 2026",
  shortName: "BBC'26",
  codePrefix: "BB26",
  dates: "July 16 – 19, 2026",
  venue: {
    name: "Conference Venue",
    address: "Krimnitzer Weg 25, 12527 Berlin, Germany",
  },
  links: {
    site: "https://boldnessandburdens.com",
    donate: "https://boldnessandburdens.com",
  },
} as const;

export type Edition = typeof edition;
