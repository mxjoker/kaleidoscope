// netlify/functions/use_secret.js
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
    const { player, secret } = body;

    if (!secret) {
      return res.status(400).json({ error: "Missing 'secret' in request body." });
    }

    // Check if the player actually has the secret
    if (!globalState.foundSecrets.includes(secret)) {
      return res.status(400).json({ error: `Secret "${secret}" not found in foundSecrets.` });
    }

    // Move secret from foundSecrets → usedSecrets
    globalState.foundSecrets = globalState.foundSecrets.filter(s => s !== secret);
    globalState.usedSecrets.push(secret);

    // Optionally: side effect example
    // e.g., reward 10 kimchi coins for using a secret
    globalState.kimchiBank += 10;

    await store.set("globalState", JSON.stringify(globalState));

    return res.status(200).json({
      message: `Secret "${secret}" used successfully by ${player}.`,
      globalState
    });
  } catch (err) {
    return res.status(500).json({ error: "Server Error", details: err.message });
  }
}