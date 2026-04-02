import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export default async function handler(req, context) {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
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

    // Ensure messages alternate roles — deduplicate consecutive same-role messages
    const messages = [];
    for (const m of raw) {
      if (messages.length > 0 && messages[messages.length - 1].role === m.role) {
        // Merge consecutive same-role messages
        messages[messages.length - 1].content += "\n" + m.content;
      } else {
        messages.push(m);
      }
    }

    // Ensure first message is from user (API requirement)
    if (messages.length > 0 && messages[0].role !== "user") {
      messages.shift();
    }

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 200,
      system: systemPrompt,
      messages,
    });

    const reply =
      response.content[0]?.type === "text"
        ? response.content[0].text
        : "...";

    return new Response(JSON.stringify({ response: reply, npc }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Chat error:", error);
    console.error("Error type:", error?.constructor?.name);
    console.error("Error status:", error?.status);
    console.error("Error message:", error?.message);
    const errorMessage = error?.message || "Unknown error";
    const errorStatus = error?.status || 500;
    return new Response(
      JSON.stringify({ error: errorMessage, status: errorStatus, response: "..." }),
      {
        status: errorStatus,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
