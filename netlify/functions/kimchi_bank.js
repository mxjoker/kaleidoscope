// netlify/functions/kimchi_bank.js
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
    const { player, amount, action } = body;

    if (typeof amount !== "number" || !action) {
      return res.status(400).json({ error: "Missing 'amount' (number) or 'action' ('earn'|'spend')." });
    }

    if (action === "earn") {
      globalState.kimchiBank += amount;
    } else if (action === "spend") {
      if (amount > globalState.kimchiBank) {
        return res.status(400).json({ error: `Not enough kimchi coins. Current balance: ${globalState.kimchiBank}` });
      }
      globalState.kimchiBank -= amount;
    } else {
      return res.status(400).json({ error: "Invalid action. Must be 'earn' or 'spend'." });
    }

    await store.set("globalState", JSON.stringify(globalState));

    return res.status(200).json({
      message: `${player} ${action === "earn" ? "earned" : "spent"} ${amount} kimchi coins.`,
      kimchiBank: globalState.kimchiBank
    });
  } catch (err) {
    return res.status(500).json({ error: "Server Error", details: err.message });
  }
}