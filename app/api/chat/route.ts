import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Proxy the request to the Agent Kernel local server running on port 8000
    // Agent Kernel provides a streaming endpoint out of the box when using RESTAPI.run()
    const response = await fetch("http://localhost:8000/v1/agent/stream", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      // Ensure we format the payload expected by Agent Kernel
      body: JSON.stringify({
        agent_id: "govstay", // We registered triage_agent with name="govstay"
        text: body.text,
        session_id: body.session_id, // Pass along to maintain session history
        attachments: body.attachments || [],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Backend Error:", errText);
      return new Response(JSON.stringify({ error: "Agent server failed to respond." }), {
        status: response.status,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Agent Kernel returns Server-Sent Events (SSE)
    // We can directly proxy the ReadableStream back to the client!
    return new Response(response.body, {
      status: 200,
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (error) {
    console.error("Error connecting to Agent Kernel:", error);
    return new Response(JSON.stringify({ error: "Failed to connect to AI Agent." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
