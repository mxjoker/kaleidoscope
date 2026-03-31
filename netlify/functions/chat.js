// netlify/functions/chat.js
import { getStore } from "@netlify/blobs";

export async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const store = getStore("game-data");
    const globalStateRaw = await store.get("globalState");
    const globalState = globalStateRaw ? JSON.parse(globalStateRaw) : { foundSecrets: [], usedSecrets: [], kimchiBank: 100 };

    const body = JSON.parse(await req.text());
    const { player, message } = body;

    // Basic NPC logic:
    let response = "NPC doesn't understand.";

    if (/hello|hi|greetings/i.test(message)) {
      response = `Hello ${player}! Have you discovered any secrets lately?`;
    } else if (/secret/i.test(message)) {
      const secrets = globalState.foundSecrets.join(", ") || "no secrets yet";
      response = `I see you have found: ${secrets}`;
    } else if (/kimchi/i.test(message)) {
      response = `Your kimchi bank has ${globalState.kimchiBank} coins. Spend wisely!`;
    } else if (globalState.foundSecrets.includes(message)) {
      response = `Ah, I know about "${message}"! Clever you, ${player}.`;
    }

    return res.status(200).json({ npcResponse: response });
  } catch (err) {
    return res.status(500).json({ error: "Server Error", details: err.message });
  }
}