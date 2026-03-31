import { getStore } from "@netlify/blobs";

export default async () => {
  try {
    const store = getStore("kaleidoscope");

    // Load votes
    let votes = [];
    try {
      const stored = await store.get("votes", { type: "json" });
      votes = stored || [];
    } catch {
      console.log("No votes yet.");
    }

    // Summarize votes
    const summary = {};
    votes.forEach(vote => {
      const choice = vote.choice;
      if (!summary[choice]) summary[choice] = 0;
      summary[choice]++;
    });

    console.log("DM Report Summary:", summary);

    return new Response(
      JSON.stringify({ ok: true, summary, totalVotes: votes.length }),
      { headers: { "Content-Type": "application/json" } }
    );

  } catch (err) {
    console.error("DM Report function error:", err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};