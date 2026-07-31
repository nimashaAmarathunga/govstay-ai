import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Proxy the request to the custom Agent Kernel local server running on port 8001
    const response = await fetch("http://127.0.0.1:8001/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      // Ensure we format the payload expected by api.py (ChatRequest)
      body: JSON.stringify({
        message: body.text,
        thread_id: body.session_id || "default-session",
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

    // api.py returns JSON like { "reply": "...", "agent_name": "..." }
    // We convert it into Server-Sent Events (SSE) so the frontend doesn't break
    const data = await response.json();
    const ssePayload = JSON.stringify({ text: data.reply, agent: data.agent_name });
    const sseResponse = `data: ${ssePayload}\n\n`;

    return new Response(sseResponse, {
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
