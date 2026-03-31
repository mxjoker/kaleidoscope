import { getStore } from "@netlify/blobs";

export default async () => {
  try {
    const store = getStore("kaleidoscope");

    const events = (await store.get("events", { type: "json" })) || [];

    let globalState = await store.get("global_state", { type: "json" });

    if (!globalState) {
      globalState = {
        usedSecrets: [],
        foundSecrets: [],
        kimchiBank: 100
      };

      await store.set("global_state", JSON.stringify(globalState));
    }

    return new Response(
      JSON.stringify({ events, globalState }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500
    });
  }
};