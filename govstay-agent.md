You are a senior AI engineer working on my existing GovStay project.

Your task is to develop the AI agent component using Agent Kernel as the agent runtime/framework.

Important:
- Use Agent Kernel to build and expose the agent.
- Use LangGraph only for internal agent workflow orchestration if required by Agent Kernel.
- Do NOT build a custom chatbot logic.
- Do NOT replace the existing Next.js application or Supabase database.
- Integrate the agent into the existing system.

Project Context:

GovStay is a government accommodation booking platform.

Existing stack:
- Frontend: Next.js + TypeScript
- Database: Supabase PostgreSQL
- ORM: Prisma
- AI Agent Runtime: Agent Kernel
- Agent Workflow: LangGraph
- LLM: Gemini API
- Backend: Python + FastAPI

The current application already has:
- User management
- Departments
- Circuit bungalows
- Rooms
- Caretakers
- Bookings
- Agent sessions

The AI agent should be implemented using Agent Kernel and should act as the GovStay Assistant.

Agent Responsibilities:

The agent should help users:

1. Find accommodation

Example:
"I need a place to stay in Nuwara Eliya from August 10 to August 12."

The agent should:
- Understand the request.
- Search available bungalows and rooms.
- Consider dates, location, capacity, and room type.
- Recommend suitable options.

2. Create bookings

The agent should:
- Collect missing information from the user.
- Verify government employee details.
- Create a booking draft.
- Guide the user through the booking process.

3. Verify uploaded documents

Users can upload approval slips/documents.

The agent should:
- Extract important details from documents.
- Compare extracted information with booking information.
- Check whether details are valid.

4. Approve or reject bookings

The agent should make the final decision.

If valid:
- Change booking status to CONFIRMED.
- Store approval reason.
- Store confidence score.
- Generate an audit trace.

If invalid:
- Reject the booking.
- Store rejection reason.
- Explain why.

5. Send notifications

After confirmation:
- Trigger WhatsApp notification.
- Inform user about booking details.

---

Agent Design:

Create a GovStay Assistant Agent using Agent Kernel.

The agent should use tools/skills instead of directly accessing the database.

Required skills/tools:

1. search_available_rooms()

Purpose:
Search available rooms from Supabase.

Inputs:
- location
- check-in date
- check-out date
- number of guests
- room preference

Uses:
- CircuitBungalow table
- Room table
- Booking table


2. verify_employee()

Purpose:
Validate government employee information.

Checks:
- Government ID
- Employment status
- User details


3. create_booking()

Purpose:
Create booking draft.


4. verify_document()

Purpose:
Analyze uploaded approval slips.

Extract:
- Name
- Government ID
- Dates
- Purpose

Compare against booking information.


5. approve_booking()

Purpose:
Agent decision.

Store:
- Decision
- Reason
- Confidence score


6. send_whatsapp_notification()

Purpose:
Send confirmation message after successful booking.


---

Agent Workflow:

Implement this workflow using Agent Kernel:

START

↓

Receive User Message

↓

Understand Intent

↓

Search Accommodation (tool)

↓

Collect Required Details

↓

Verify Employee (tool)

↓

Verify Document (tool)

↓

Apply Booking Rules

↓

Approve / Reject Decision

↓

Update Supabase

↓

Send Notification

↓

END


---

Agent Kernel Integration Requirements:

Create a separate Python agent service.

Structure:

agent-service/

├── main.py
├── kernel/
│   └── govstay_agent.py
├── graph/
│   └── workflow.py
├── skills/
│   ├── accommodation_search.py
│   ├── employee_verification.py
│   ├── booking_creation.py
│   ├── document_verification.py
│   ├── approval.py
│   └── notification.py
├── database/
│   └── supabase.py
└── requirements.txt


The Agent Kernel service should:
- Register the GovStay agent.
- Expose the agent API endpoint.
- Maintain session IDs.
- Maintain conversation memory.
- Return agent responses to the frontend.

---

Frontend Integration:

The existing Next.js chat interface currently uses mock responses.

Replace the mock responses with real Agent Kernel communication.

Flow:

Next.js Chat UI

↓

Next.js API Route

↓

Agent Kernel API

↓

GovStay Assistant Agent

↓

LangGraph Workflow

↓

Supabase


Maintain:
- session_id
- conversation history
- booking progress


---

Agent Observability:

Add agent trace logging.

Store:

- User message
- Agent action
- Skill/tool called
- Tool result
- Decision
- Reason
- Confidence
- Timestamp

This will be used to demonstrate the agent workflow during the competition.

---

Before implementing:

1. Analyze the existing Next.js project structure.
2. Analyze the existing Prisma schema.
3. Analyze current Supabase tables.
4. Suggest required schema changes.
5. Explain how Agent Kernel will integrate.
6. Wait for confirmation before making destructive changes.

The final result should demonstrate a real agentic workflow where the AI can search accommodation, verify information, make decisions, update the database, and communicate with users.