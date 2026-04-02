export default async function handler(req, context) {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const apiKey = Netlify.env.get("ANTHROPIC_API_KEY");
    if (!apiKey) {
      console.error("ANTHROPIC_API_KEY not found in environment");
      return new Response(
        JSON.stringify({ error: "API key not configured", response: "..." }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const { npc, message, history = [], persona } = await req.json();

    if (!message) {
      return new Response(JSON.stringify({ error: "No message provided" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const systemPrompt =
      persona ||
      `You are a mysterious NPC aboard a ship called The Kaleidoscope. Be brief and in character.`;

    // Build messages array from history
    // The frontend already includes the current user message in history,
    // so we DON'T append it again — that would create consecutive user messages
    // which the Anthropic API rejects with a 400 error.
    let raw = history.slice(-8).map((h) => ({
      role: h.role,
      content: h.content,
    }));

    // If history is empty or doesn't end with the current message, add it
    const lastMsg = raw[raw.length - 1];
    if (!lastMsg || lastMsg.role !== "user" || lastMsg.content !== message) {
      raw.push({ role: "user", content: message });
    }

    // Ensure messages alternate roles — merge consecutive same-role messages
    const messages = [];
    for (const m of raw) {
      if (messages.length > 0 && messages[messages.length - 1].role === m.role) {
        messages[messages.length - 1].content += "\n" + m.content;
      } else {
        messages.push(m);
      }
    }

    // Ensure first message is from user (API requirement)
    if (messages.length > 0 && messages[0].role !== "user") {
      messages.shift();
    }

    // Direct fetch to Anthropic API — no SDK needed
    const apiRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 200,
        system: systemPrompt,
        messages,
      }),
    });

    const data = await apiRes.json();

    if (!apiRes.ok) {
      console.error("Anthropic API error:", apiRes.status, JSON.stringify(data));
      return new Response(
        JSON.stringify({ error: data.error?.message || "API error", response: "..." }),
        { status: apiRes.status, headers: { "Content-Type": "application/json" } }
      );
    }

    const reply =
      data.content?.[0]?.type === "text"
        ? data.content[0].text
        : "...";

    return new Response(JSON.stringify({ response: reply, npc }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Chat error:", error);
    return new Response(
      JSON.stringify({ error: error?.message || "Unknown error", response: "..." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
