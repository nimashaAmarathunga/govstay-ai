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
        // Pass agent_name, but because agent-kernel routing can be tricky, the prompt also guides the supervisor.
        agent_name: "itinerary_agent",
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

    // Proxy the Agent Kernel Server-Sent Events (SSE) stream directly to the frontend
    return new Response(response.body, {
      status: response.status,
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });

  } catch (error) {
    console.error("Error connecting to Agent Kernel:", error);
    return new Response(JSON.stringify({ error: "Failed to connect to AI Planner." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
