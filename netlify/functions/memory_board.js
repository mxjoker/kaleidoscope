import { getStore } from "@netlify/blobs";

const CORS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
};

const MAX_POSTS = 200;
const MAX_TEXT = 400;

export default async function handler(req, context) {
  if (req.method === "OPTIONS") return new Response("", { status: 200, headers: CORS });

  const store = getStore("kaleidoscope");

  // GET — return all posts
  if (req.method === "GET") {
    try {
      const posts = await store.get("memoryBoard", { type: "json" }) || [];
      return new Response(JSON.stringify({ posts }), { status: 200, headers: CORS });
    } catch (e) {
      return new Response(JSON.stringify({ posts: [] }), { status: 200, headers: CORS });
    }
  }

  // POST — add a new post
  if (req.method === "POST") {
    try {
      const body = await req.json();
      const player = (body.player || "Unknown").slice(0, 32);
      const text = (body.text || "").trim().slice(0, MAX_TEXT);

      if (!text) {
        return new Response(JSON.stringify({ error: "Empty post" }), { status: 400, headers: CORS });
      }

      let posts = [];
      try { posts = await store.get("memoryBoard", { type: "json" }) || []; } catch (e) { posts = []; }

      posts.push({ player, text, timestamp: new Date().toISOString() });
      if (posts.length > MAX_POSTS) posts = posts.slice(-MAX_POSTS);

      await store.setJSON("memoryBoard", posts);

      return new Response(JSON.stringify({ ok: true, count: posts.length }), { status: 200, headers: CORS });
    } catch (e) {
      console.error("memory_board.js POST error:", e);
      return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: CORS });
    }
  }

  // DELETE — clear all posts (DM use via DM Report)
  if (req.method === "DELETE") {
    try {
      await store.setJSON("memoryBoard", []);
      return new Response(JSON.stringify({ ok: true }), { status: 200, headers: CORS });
    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: CORS });
    }
  }

  return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: CORS });
}
