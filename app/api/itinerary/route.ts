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

    // Agent Kernel returns Server-Sent Events (SSE). 
    // We need to accumulate the stream and return a single JSON string to the modal.
    const reader = response.body?.getReader();
    const decoder = new TextDecoder("utf-8");
    let fullItinerary = "";

    if (reader) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.substring(6).trim();
            if (dataStr === '[DONE]' || !dataStr) continue;
            try {
              const dataObj = JSON.parse(dataStr);
              // Agent Kernel sends text in `delta` or `reply`
              if (dataObj.delta) {
                fullItinerary += dataObj.delta;
              } else if (dataObj.reply && !fullItinerary) {
                fullItinerary = dataObj.reply;
              }
            } catch (e) {
              // Ignore incomplete JSON chunks from SSE
            }
          }
        }
      }
    }

    return new Response(JSON.stringify({ text: fullItinerary }), {
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
