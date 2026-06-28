export const prerender = false;

import type { APIRoute } from "astro";
import { updateParticipant } from "../../../../lib/db";
import { isAuthed } from "../../../../lib/admin-auth";

export const POST: APIRoute = async ({ request }) => {
  if (!isAuthed(request)) {
    return new Response("Unauthorized", { status: 401 });
  }

  const form = await request.formData();
  const code = String(form.get("code") ?? "").trim();

  if (!code) {
    return new Response("Missing code", { status: 400 });
  }

  const clean = (v: FormDataEntryValue | null) => {
    const s = String(v ?? "").trim();

    return s.length ? s : null;
  };

  await updateParticipant(code, {
    room: clean(form.get("room")),
    group: clean(form.get("group")),
    email: clean(form.get("email")),
    phone: clean(form.get("phone")),
    city: clean(form.get("city")),
    stayingOnCamp: form.get("staying_on_camp") != null,
  });

  return new Response(null, {
    status: 303,
    headers: { location: `/bb26/admin/${encodeURIComponent(code)}?saved=${encodeURIComponent(code)}` },
  });
};
