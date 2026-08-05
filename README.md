# GovSewana-AI (IDEALIZE 2026 Prototype Submission)

GovSewana-AI is a Next.js application for discoverability and booking of government-owned rest houses and circuit bungalows across Sri Lanka. Our solution incorporates a sophisticated multi-agent AI system running entirely on local hardware, prioritizing data privacy and cost-efficiency.

## Video Demonstration

*https://drive.google.com/file/d/1Mxi-2YEX8QbqbFsaB9VH3zTV215j-lMb/view?usp=drive_link*


---

## How to Run the Next.js Frontend

To run the Next.js prototype locally on your machine, follow these simple steps:

### Step-by-Step Setup

#### 1. Install dependencies
```bash
npm install
```

#### 2. Configure Environment Variables
1. Copy the `sample-dotenv.txt` file to create your own `.env` file:
   ```bash
   cp sample-dotenv.txt .env
   ```
2. Populate the `.env` file with the required database connection strings (provided in our submission details).

#### 3. Generate the Prisma Client
You **must** generate the local Prisma Client types so TypeScript can resolve the database schema:
```bash
npx prisma generate
```

#### 4. Start the Development Server
You do **not** need to run database pushes or seeds since the database is already set up and populated. Simply run:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view and interact with the application.

---

### Advanced / New Database Setup (Optional)

If you are setting up a brand new/private database and need to initialize it from scratch:

1. **Push the Schema:** Pushes the tables and relations defined in `schema.prisma` directly to your database:
   ```bash
   npx prisma db push
   ```
2. **Seed Initial Data:** Populates your database with test users, bungalows, rooms, and bookings:
   ```bash
   npx prisma db seed
   ```



## ⚠️ Important: Multi-Repository Architecture
Please note that our prototype is split across two repositories:
1. **Frontend & API (This Repo):** Contains the Next.js web application and UI.
2. **AI Agent Logic (Agent Kernel Repo):** *https://github.com/nimashaAmarathunga/agent-kernel*. The core AI reasoning, LangGraph multi-agent logic, and local LLM orchestration are built here. 
   - 🔍 **Where to look:** Please review the `use-cases/govstay-agent/` directory in the Agent Kernel repository to see our actual AI implementation, agent routing, and security hooks.

## What We Have Built So Far (What Users Can Do Today)

For this prototype stage, we focused on building a fully functional, AI-driven user experience. Here is exactly what users can do right now:

- **Browse and Discover:** Users can explore a beautifully designed website to discover various government rest houses and circuit bungalows.
- **View on Map:** Users can use an interactive map to visually locate properties across the country.
- **Chat with the AI:** Instead of clicking through complex search filters, users can simply type to our AI assistant (e.g., "Find me a bungalow in Nuwara Eliya for 4 people next weekend"). 
- **Upload IDs for Instant Verification:** Government employees can upload a photo of their ID card directly into the chat. Our AI's vision capabilities will read the ID and automatically verify their eligibility.
- **Book via Conversation:** Once a user finds a place they like, they can just ask the AI to book it. The AI automatically handles the booking process in the background and saves their reservation for approval.

## Technical Architecture & Agent System

In alignment with the Open Category prototype guidelines, our application features a **Functioning AI Agent System**, heavily customized using **Agent Kernel** and **LangGraph**. We run a **Multi-Model Architecture** locally via Ollama to balance speed, reasoning, and vision capabilities.

```mermaid
graph TD
    User([User / Next.js]) -->|Chat / Upload| AK[Agent Kernel Middleware]
    
    subgraph "Agent Kernel Pipeline"
        AK --> PreHook{Prompt Injection PreHook}
        PreHook -->|Blocked| Reject[Safe Error Response]
        PreHook -->|Passed| Router[Supervisor / Router]
        
        subgraph "LangGraph Specialists"
            Router -->|Travel Queries| Travel[Travel Agent]
            Router -->|Booking Logic| Booking[Booking Agent]
            Router -->|Document AI| Verify[Verification Agent]
            Router -->|Alerts| Notify[Notification Agent]
        end
        
        Travel <-->|Queries| DB[(PostgreSQL Database)]
        Booking <-->|Creates Bookings| DB
        Verify <-->|Validates ID via Vision| DB
        
        Travel -.-> PostHook[Output Sanitization PostHook]
        Booking -.-> PostHook
        Verify -.-> PostHook
    end
    
    PostHook -->|Clean Response| User
```

### Multi-Model Local AI Implementation

- **Supervisor (Router) Agent:** Powered by `llama3.2:3b`. A lightning-fast, lightweight model used strictly to evaluate user intent and route them to the appropriate specialist agent (Travel, Booking, Verification, or Notification).
- **Reasoning Agents (Travel & Booking):** Powered by `qwen2.5:7b`. Handles complex logic, state manipulation, and strict tool-calling to safely interact with our PostgreSQL database.
- **Verification Agent (Document AI):** Powered by `qwen2.5-vl`. Handles our Vision/Document AI pipeline to securely read and verify uploaded government employee slips.
- **Agent Kernel Hooks:** A PreHook intercepts and blocks prompt injections, and a PostHook sanitizes all database outputs to prevent stack-trace leaks.

## Tech Stack

- **Frontend Framework:** Next.js 16
- **Styling & UI:** Tailwind CSS v4 + Framer Motion + Lucide React
- **Mapping:** Leaflet.js (`react-leaflet`)
- **Database & ORM:** PostgreSQL + Prisma
- **AI Orchestration:** Agent Kernel + LangGraph
- **AI Models:** Local LLMs via Ollama (`llama3.2`, `qwen2.5`, `qwen2.5-vl`)

## Future Plans (Next Phase)

Based on our original application blueprint, the following features are planned for future implementation:
- **Dashboards:** Dedicated department dashboard for managing reservations and an analytics dashboard for occupancy insights.
- **Secure Authentication:** Implementation of role-based access control for public users, government employees, and admins.
- **Complete Booking Lifecycle:** Expanding the booking agent to handle full payment confirmations and automated status notifications.
- **Advanced UI Filtering:** Expanding the Next.js UI to support granular filtering by department, budget, and capacity alongside the AI chat.

## Pivots from Original Proposal

During the development process, we had to make several key pivots from our initial proposal to better fit technical requirements and government constraints:

- **AI Engine (The Biggest Pivot):** Initially, we proposed using the Gemini Flash API. However, we completely pivoted to using **Local LLMs** (`llama3.2` and `qwen2.5`) to ensure maximum data privacy for government employee data, eliminate ongoing API costs, and avoid the constraints of API rate limits.
- **Agent Orchestration with Agent Kernel:** Instead of using n8n or a simple API wrapper, we adopted **Agent Kernel** paired with **LangGraph**. This required a massive architectural shift and a steep learning curve. We had to build, test, and debug the agent logic in a completely separate repository (`agent-kernel`) and figure out how to integrate it. While it took a lot of effort to understand Agent Kernel's hooks, supervisors, and session management, it ultimately allowed us to build an enterprise-grade multi-agent system with real reasoning, prompt injection security, and multi-step workflows.

---


