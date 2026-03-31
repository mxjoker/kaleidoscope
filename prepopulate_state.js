// prepopulate_state.js
import { getStore } from "@netlify/blobs";

async function main() {
  try {
    const store = getStore("game-data");

    const initialState = {
      usedSecrets: [],
      foundSecrets: [],
      kimchiBank: 100
    };

    await store.set("globalState", JSON.stringify(initialState));
    console.log("✅ Prepopulated globalState in game-data store.");
  } catch (err) {
    console.error("❌ Failed to prepopulate globalState:", err);
  }
}

main();