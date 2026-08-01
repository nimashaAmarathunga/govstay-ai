import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    console.log(`[Next.js API] Received chat request from frontend. Body: ${JSON.stringify(body)}`);

    // Proxy the request to the custom Agent Kernel local server running on port 8000
    console.log("[Next.js API] Sending fetch to http://127.0.0.1:8000/api/v1/chat...");
    const response = await fetch("http://127.0.0.1:8000/api/v1/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      // Ensure we format the payload expected by Agent Kernel (BaseRunRequest)
      body: JSON.stringify({
        prompt: body.text,
        session_id: body.session_id || "default-session",
      }),
    });
    console.log(`[Next.js API] Fetch completed with status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errText = await response.text();
      console.log(`[Next.js API] Backend Error Body: ${errText}`);
      console.error("Backend Error:", errText);
      return new Response(JSON.stringify({ error: "Agent server failed to respond." }), {
        status: response.status,
        headers: { "Content-Type": "application/json" },
      });
    }

    // api.py returns JSON like { "reply": "...", "agent_name": "...", "ui_state": {...} }
    // We convert it into Server-Sent Events (SSE) so the frontend doesn't break
    // api.py now returns a true Server-Sent Events stream!
    // We can just proxy this stream directly to the client.
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
