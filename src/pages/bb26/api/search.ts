export const prerender = false;

import type { APIRoute } from "astro";
import { searchParticipants } from "../../../lib/db";

export const GET: APIRoute = async ({ url }) => {
  const q = url.searchParams.get("q") ?? "";
  const results = await searchParticipants(q);

  return new Response(JSON.stringify(results), {
    headers: {
      "content-type": "application/json",
      "cache-control": "no-store",
    },
  });
};
