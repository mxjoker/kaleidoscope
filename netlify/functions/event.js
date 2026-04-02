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

    let events = [];
    try { events = await store.get("events", { type: "json" }) || []; } catch (e) { events = []; }

    let globalState = { usedSecrets: [], foundSecrets: [], kimchiBank: 100 };
    try { globalState = await store.get("globalState", { type: "json" }) || globalState; } catch (e) {}

    const event = { ...body, timestamp: new Date().toISOString() };

    // Normalise legacy 'found_secret' to 'secret_triggered'
    if (event.type === "found_secret") {
      event.type = "secret_triggered";
      event.secretId = event.secretId || event.secret;
    }

    // Track found secrets in globalState
    if (event.type === "secret_triggered") {
      const id = event.secretId || event.secret;
      if (id && !globalState.foundSecrets.includes(id)) {
        globalState.foundSecrets.push(id);
      }
    }

    // Track used secrets
    if (event.type === "use_secret") {
      const id = event.secretId || event.secret;
      if (id) {
        globalState.foundSecrets = globalState.foundSecrets.filter(s => s !== id);
        if (!globalState.usedSecrets.includes(id)) globalState.usedSecrets.push(id);
      }
    }

    // Update kimchi bank on game win
    if (event.type === "game_played" && event.net > 0) {
      globalState.kimchiBank = Math.max(0, (globalState.kimchiBank ?? 100) - event.net);
    }

    // Track navigator echo unlocks
    if (event.type === "navigator_unlock" && event.echo) {
      if (!globalState.navigatorUnlocks) globalState.navigatorUnlocks = [];
      if (!globalState.navigatorUnlocks.includes(event.echo)) {
        globalState.navigatorUnlocks.push(event.echo);
      }
    }

    // Reset navigator unlocks
    if (event.type === "navigator_reset") {
      globalState.navigatorUnlocks = [];
    }

    // Set lantern state
    if (event.type === "lantern_state" && event.state) {
      globalState.lanternState = event.state;
    }

    // Drawer lock updates
    if (event.type === "drawer_update") {
      if (!globalState.drawer) globalState.drawer = {};
      Object.assign(globalState.drawer, event.patch);
      // Auto-open if all three locks solved
      const d = globalState.drawer;
      if (d.keyFound && d.comboSolved && d.phraseSolved) d.drawerOpen = true;
    }

    events.push(event);
    if (events.length > 500) events = events.slice(-500);

    await store.setJSON("events", events);
    await store.setJSON("globalState", globalState);

    return new Response(JSON.stringify({ ok: true, event }), { status: 200, headers: CORS });

  } catch (e) {
    console.error("event.js error:", e);
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: CORS });
  }
}
