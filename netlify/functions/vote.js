// vote.js — legacy compatibility shim
// Votes are now posted via event.js (type: vote_cast)
// This function accepts old-style vote POSTs and forwards them to the same event store
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
    const body = await req.json();
    const { player, questionId, optionId, choice } = body;

    let events = [];
    try { events = await store.get("events", { type: "json" }) || []; } catch (e) { events = []; }

    // Normalise old { player, choice } format and new { player, questionId, optionId }
    const event = {
      type: "vote_cast",
      player: player || "unknown",
      questionId: questionId || 1,
      optionId: optionId || choice || "a",
      timestamp: new Date().toISOString()
    };

    events.push(event);
    if (events.length > 500) events = events.slice(-500);
    await store.setJSON("events", events);

    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: CORS });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: CORS });
  }
}
