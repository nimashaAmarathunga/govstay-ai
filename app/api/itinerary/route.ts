import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { bungalowName, bungalowLocation, attractions, travelGroup, interests, tripDuration } = body;

    const prompt = `
Create a ${tripDuration}-day travel itinerary for ${bungalowName} in ${bungalowLocation}.
The travel group is: ${travelGroup}.
Their interests are: ${interests}.
Nearby attractions they might want to visit: ${attractions.join(", ")}.

Generate a beautiful, day-by-day markdown itinerary. Be creative, engaging, and use emojis. Do not output markdown code blocks (e.g. \`\`\`markdown), just raw markdown text.
`;

    const agentKernelUrl = process.env.AGENT_KERNEL_URL || "http://127.0.0.1:8000";
    
    console.log(`[Next.js API] Sending itinerary request to ${agentKernelUrl}/api/v1/chat...`);
    
    const response = await fetch(`${agentKernelUrl}/api/v1/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: prompt,
        session_id: `itinerary-${Date.now()}`,
        user: "govstay-user",
        agent_name: "itinerary_agent",
        execution: {
            mode: "sync" // We want the full response at once for the UI
        }
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Agent Kernel Error:", errText);
      return new Response(JSON.stringify({ error: "Agent server failed to generate itinerary." }), {
        status: response.status,
        headers: { "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    
    // The response is usually { result: { text: "..." } } or { reply: "..." } depending on AK version
    // Let's return the full data so the frontend can parse it
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error connecting to Agent Kernel:", error);
    return new Response(JSON.stringify({ error: "Failed to connect to AI Planner." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
