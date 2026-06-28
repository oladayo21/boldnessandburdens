import { defineMiddleware } from "astro:middleware";

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;
  const path = pathname.replace(/\/+$/, "") || "/";

  // The old /admin area is retired — bounce any stragglers home.
  if (path === "/admin" || path.startsWith("/admin/")) {
    return context.redirect("/", 302);
  }

  return next();
});
