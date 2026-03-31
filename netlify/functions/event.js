// /netlify/functions/event.js
import { getStore } from "@netlify/blobs";

const store = getStore("game-data");

async function getJSON(key, fallback) {
  const data = await store.get(key, { type: "json" });
  return data || fallback;
}

async function setJSON(key, value) {
  await store.set(key, JSON.stringify(value));
}

export async function handler(req) {
  try {
    if (req.method !== "POST") {
      return { statusCode: 405, body: JSON.stringify({ error: "Method Not Allowed" }) };
    }

    const body = JSON.parse(await req.text());
    const { type, player } = body;

    if (!type || !player) {
      return { statusCode: 400, body: JSON.stringify({ error: "Missing type or player" }) };
    }

    const events = await getJSON("events", []);
    const globalState = await getJSON("globalState", {
      usedSecrets: [],
      foundSecrets: [],
      kimchiBank: 100
    });

    let message = "";

    switch (type) {
      case "found_secret":
        if (body.secret && !globalState.foundSecrets.includes(body.secret)) {
          globalState.foundSecrets.push(body.secret);
          message = `${player} found secret "${body.secret}"`;
        }
        break;

      case "used_secret":
        if (body.secret) {
          const i = globalState.foundSecrets.indexOf(body.secret);
          if (i !== -1) {
            globalState.foundSecrets.splice(i, 1);
            globalState.usedSecrets.push(body.secret);
            message = `${player} used secret "${body.secret}"`;
          }
        }
        break;

      case "treasure_found":
        globalState.kimchiBank += body.amount || 0;
        message = `${player} found ${body.amount} kimchi`;
        break;

      case "puzzle_solved":
        globalState.kimchiBank += body.reward || 0;
        message = `${player} solved puzzle for ${body.reward} kimchi`;
        break;

      case "mini_game_played":
        globalState.kimchiBank -= body.cost || 0;
        message = `${player} spent ${body.cost} kimchi`;
        break;

      default:
        message = `${player} triggered ${type}`;
    }

    const newEvent = { ...body, timestamp: new Date().toISOString() };
    events.push(newEvent);

    await setJSON("events", events);
    await setJSON("globalState", globalState);

    return {
      statusCode: 200,
      body: JSON.stringify({ message, globalState, event: newEvent })
    };

  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
}