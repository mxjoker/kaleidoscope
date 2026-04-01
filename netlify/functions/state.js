import { getStore } from "@netlify/blobs";

const CORS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
};

export default async function handler(req, context) {
  if (req.method === "OPTIONS") return new Response("", { status: 200, headers: CORS });

  const store = getStore("kaleidoscope");

  try {
    let events = [];
    try { events = await store.get("events", { type: "json" }) || []; } catch (e) { events = []; }

    let globalState = { usedSecrets: [], foundSecrets: [], kimchiBank: 100 };
    try { globalState = await store.get("globalState", { type: "json" }) || globalState; } catch (e) {}

    return new Response(JSON.stringify({ events, globalState }), { status: 200, headers: CORS });

  } catch (e) {
    console.error("state.js error:", e);
    return new Response(JSON.stringify({ events: [], globalState: { usedSecrets: [], foundSecrets: [], kimchiBank: 100 } }), { status: 500, headers: CORS });
  }
}
