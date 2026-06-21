export const prerender = false;

import type { APIRoute } from "astro";
import { updateAssignment } from "../../../../lib/db";
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

  await updateAssignment(code, {
    room: clean(form.get("room")),
    group: clean(form.get("group")),
    eating: clean(form.get("eating")),
    checkedIn: form.get("checked_in") != null,
  });

  return new Response(null, {
    status: 303,
    headers: { location: `/bb26/admin?saved=${encodeURIComponent(code)}` },
  });
};
