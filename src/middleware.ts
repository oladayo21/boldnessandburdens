import { defineMiddleware } from 'astro:middleware';

const REALM = 'BBC26 Admin';

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;

  if (!pathname.startsWith('/admin')) {
    return next();
  }

  const password = import.meta.env.ADMIN_PASSWORD;

  if (!password) {
    return new Response('Server misconfigured: ADMIN_PASSWORD not set', {
      status: 500,
    });
  }

  const header = context.request.headers.get('authorization');

  if (!header?.startsWith('Basic ')) {
    return new Response('Authentication required', {
      status: 401,
      headers: { 'WWW-Authenticate': `Basic realm="${REALM}"` },
    });
  }

  const decoded = atob(header.slice(6));
  const [, pass] = decoded.split(':');

  if (pass !== password) {
    return new Response('Invalid credentials', {
      status: 401,
      headers: { 'WWW-Authenticate': `Basic realm="${REALM}"` },
    });
  }

  return next();
});
