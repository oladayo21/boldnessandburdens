import { defineAction, ActionError } from "astro:actions";
import { z } from "astro:schema";
import { setAttendance, updateParticipant, markAttendance } from "../lib/db";
import { isAuthed } from "../lib/admin-auth";

// Trim a form string; empty becomes null so the DB stores NULL, not "".
const clean = (v: string | undefined): string | null => {
  const s = (v ?? "").trim();

  return s.length ? s : null;
};

export const server = {
  // Admin: set or clear one day's attendance. The manage page calls this from
  // the client and reloads on success, so every server-rendered count stays in
  // sync (no in-place DOM drift).
  setAttendance: defineAction({
    accept: "json",
    input: z.object({
      code: z.string().min(1),
      day: z.string().min(1),
      present: z.boolean(),
    }),
    handler: async ({ code, day, present }, ctx) => {
      if (!isAuthed(ctx.request)) {
        throw new ActionError({ code: "FORBIDDEN", message: "Not signed in." });
      }

      await setAttendance(code, day, present);

      return { ok: true };
    },
  }),

  // Admin: update a participant's editable details (form submission).
  saveParticipant: defineAction({
    accept: "form",
    input: z.object({
      code: z.string().min(1),
      room: z.string().optional(),
      group: z.string().optional(),
      email: z.string().optional(),
      phone: z.string().optional(),
      city: z.string().optional(),
      staying_on_camp: z.boolean().optional(),
    }),
    handler: async (input, ctx) => {
      if (!isAuthed(ctx.request)) {
        throw new ActionError({ code: "FORBIDDEN", message: "Not signed in." });
      }

      await updateParticipant(input.code, {
        room: clean(input.room),
        group: clean(input.group),
        email: clean(input.email),
        phone: clean(input.phone),
        city: clean(input.city),
        stayingOnCamp: !!input.staying_on_camp,
      });

      return { ok: true };
    },
  }),

  // Public: a participant self-checks-in from their own badge. Add-only and
  // for TODAY only (the day they arrive).
  selfCheckIn: defineAction({
    accept: "form",
    input: z.object({
      code: z.string().min(1),
      day: z.string().min(1),
    }),
    handler: async ({ code, day }) => {
      const today = new Date().toLocaleDateString("en-CA", { timeZone: "Europe/Berlin" });

      if (day === today) {
        await markAttendance(code, day);
      }

      return { ok: true };
    },
  }),
};
