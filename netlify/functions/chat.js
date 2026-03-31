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

    // Build messages array from history + new message
    const messages = [
      ...history.slice(-8).map((h) => ({
        role: h.role,
        content: h.content,
      })),
      { role: "user", content: message },
    ];

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
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    console.error("Chat error:", error);
    return new Response(
      JSON.stringify({ error: "Chat failed", response: "..." }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
