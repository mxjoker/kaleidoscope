import { getStore } from "@netlify/blobs";

export default async (req) => {
  try {
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Only POST requests allowed" }),
        { status: 405, headers: { "Content-Type": "application/json" } }
      );
    }

    // Read JSON body safely
    let body = {};
    try {
      const text = await req.text();
      body = JSON.parse(text || "{}");
    } catch (err) {
      return new Response(
        JSON.stringify({ error: "Invalid JSON in request body" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const { player, choice } = body;
    if (!player || !choice) {
      return new Response(
        JSON.stringify({ error: "Missing player or choice" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Initialize store
    const store = getStore("kaleidoscope");

    // Load existing votes
    let votes = [];
    try {
      const stored = await store.get("votes", { type: "json" });
      votes = stored || [];
    } catch {
      console.log("No existing votes, starting fresh.");
    }

    // Add new vote
    const vote = { player, choice, timestamp: Date.now() };
    votes.push(vote);

    // Save back
    await store.set("votes", JSON.stringify(votes));

    console.log("Vote saved:", vote);

    return new Response(
      JSON.stringify({ ok: true, vote }),
      { headers: { "Content-Type": "application/json" } }
    );

  } catch (err) {
    console.error("Vote function error:", err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};