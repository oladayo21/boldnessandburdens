export const prerender = false;

import type { APIRoute } from "astro";
import { setAttendance, getAttendanceTime } from "../../../../lib/db";
import { isAuthed } from "../../../../lib/admin-auth";

// Instant admin per-day check-in. Saves on each change (no Save press),
// returning JSON so the manage page can update the row in place.
export const POST: APIRoute = async ({ request }) => {
  if (!isAuthed(request)) {
    return new Response("Unauthorized", { status: 401 });
  }

  const form = await request.formData();
  const code = String(form.get("code") ?? "").trim();
  const day = String(form.get("day") ?? "").trim();
  const value = String(form.get("value") ?? "") === "true";

  if (!code || !day) {
    return new Response("Missing code or day", { status: 400 });
  }

  const ok = await setAttendance(code, day, value);
  const checkedInAt = value ? await getAttendanceTime(code, day) : null;

  return Response.json({ ok, day, checkedInAt });
};
