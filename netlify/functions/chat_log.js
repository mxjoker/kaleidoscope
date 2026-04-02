import { getStore } from "@netlify/blobs";

export default async function handler(req, context) {
  const store = getStore("kaleidoscope");

  // GET — return chat log
  if (req.method === "GET") {
    try {
      const log = await store.get("chatLog", { type: "json" }) || [];
      return new Response(JSON.stringify(log), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (e) {
      return new Response(JSON.stringify([]), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  // DELETE — clear chat log
  if (req.method === "DELETE") {
    await store.setJSON("chatLog", []);
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response("Method not allowed", { status: 405 });
}
