import { defineMiddleware } from "astro:middleware";
import { isAuthed } from "./lib/admin-auth";

// Pages with no built-in login form that must still sit behind the /bb26
// admin password. The /bb26/admin page gates itself (so it can show its own
// login form), and is therefore intentionally NOT listed here.
const GUARDED = ["/bb26/proposal"];

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;
  const path = pathname.replace(/\/+$/, "") || "/";

  // Admin-gated /bb26 pages — same cookie session as /bb26/admin.
  if (GUARDED.some((p) => path === p || path.startsWith(p + "/"))) {
    if (!isAuthed(context.request)) {
      return context.redirect(`/bb26/admin?next=${encodeURIComponent(pathname)}`);
    }
  }

  // The old /admin area is retired — bounce any stragglers home.
  if (path === "/admin" || path.startsWith("/admin/")) {
    return context.redirect("/", 302);
  }

  return next();
});
