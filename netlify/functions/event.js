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

    // Load existing events
    let events = [];
    try { events = await store.get("events", { type: "json" }) || []; } catch (e) { events = []; }

    // Load existing globalState
    let globalState = { usedSecrets: [], foundSecrets: [], kimchiBank: 100 };
    try { globalState = await store.get("globalState", { type: "json" }) || globalState; } catch (e) {}

    // Stamp timestamp
    const event = { ...body, timestamp: new Date().toISOString() };

    // Side effects per event type
    if (body.type === "secret_triggered" || body.type === "found_secret") {
      // Normalise to secret_triggered
      event.type = "secret_triggered";
      const secretId = body.secretId || body.secret;
      if (secretId && !globalState.foundSecrets.includes(secretId)) {
        globalState.foundSecrets.push(secretId);
      }
    }

    if (body.type === "use_secret") {
      const secretId = body.secretId || body.secret;
      if (secretId) {
        globalState.foundSecrets = globalState.foundSecrets.filter(s => s !== secretId);
        if (!globalState.usedSecrets.includes(secretId)) globalState.usedSecrets.push(secretId);
      }
    }

    if (body.type === "game_played") {
      const net = body.net || 0;
      if (net > 0) {
        globalState.kimchiBank = Math.max(0, (globalState.kimchiBank || 100) - net);
      }
    }

    // Append event and save
    events.push(event);

    // Keep last 500 events to avoid blob bloat
    if (events.length > 500) events = events.slice(-500);

    await store.setJSON("events", events);
    await store.setJSON("globalState", globalState);

    return new Response(JSON.stringify({ ok: true, event }), { status: 200, headers: CORS });

  } catch (e) {
    console.error("event.js error:", e);
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: CORS });
  }
}
