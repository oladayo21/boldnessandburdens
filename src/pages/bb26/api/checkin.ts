export const prerender = false;

import type { APIRoute } from "astro";
import { markAttendance } from "../../../lib/db";

// Self check-in from a participant's own badge. Public (guarded only by the
// unguessable-ish badge code) and ADD-ONLY — it can mark presence, never remove
// it. Corrections/removals are admin-only via /bb26/admin.
export const POST: APIRoute = async ({ request }) => {
  const form = await request.formData();
  const code = String(form.get("code") ?? "").trim();
  const day = String(form.get("day") ?? "").trim();

  if (!code || !day) {
    return new Response("Bad request", { status: 400 });
  }

  // markAttendance silently ignores days outside the conference window.
  await markAttendance(code, day);

  return new Response(null, {
    status: 303,
    headers: { location: `/bb26/${encodeURIComponent(code)}` },
  });
};
