# 🎤 HavenMatch AI — Main Workflow Presentation Guide

Use this guide and the accompanying workflow files to present the **HavenMatch AI Multi-Agent Architecture** in **SNS Agent Workbench**.

---

## 📂 Where Your Workflow Files Are Located

Both files are located directly in your project root folder (`C:\Users\balap\Downloads\havenmatch\`):

| File | Purpose | Description |
| :--- | :--- | :--- |
| **[`HAVENMATCH_MAIN_PRESENTATION_WORKFLOW.json`](file:///C:/Users/balap/Downloads/havenmatch/HAVENMATCH_MAIN_PRESENTATION_WORKFLOW.json)** | ⭐ **Main Presentation File** | **25 Nodes & 21 Edges**: Complete master canvas containing both Stream 1 (Conversational AI Assistant) and Stream 2 (Property Matching Engine & Agents) with visual presentation sticky notes. |
| **[`HAVENMATCH_AI_CHAT_AGENT_WORKFLOW.json`](file:///C:/Users/balap/Downloads/havenmatch/HAVENMATCH_AI_CHAT_AGENT_WORKFLOW.json)** | **Chatbot Stream Only** | **11 Nodes & 10 Edges**: The standalone Chat Trigger ➔ Guardrails ➔ Extractor ➔ HavenMatch Assistant pipeline tested in SNS Workbench. |

---

## 🚀 How to Import into SNS Agent Workbench (`agents.snsihub.ai`)

1. Open your browser and navigate to:  
   👉 **`https://agents.snsihub.ai/builder?workspaceId=045dffe0-512f-4e57-869b-9a0383de76b2&workflowId=8dfbfafc-4a37-407e-82a1-066bc4489c47`**
2. Click on the **Menu (three dots / settings icon)** in the top right of the canvas.
3. Select **Import Workflow from File**.
4. Upload **`HAVENMATCH_MAIN_PRESENTATION_WORKFLOW.json`** from `C:\Users\balap\Downloads\havenmatch\`.
5. The complete multi-agent canvas will instantly load with all nodes connected left-to-right!

---

## 🗣️ Left-to-Right Presentation Pitch Script

### Slide / Stage 1: The Conversational AI Intake Engine (Stream 1)
> *"We start with how users naturally interact with HavenMatch AI. When a buyer visits the platform, they interact with our **AI Real Estate Assistant**.*
> 
> *1. **Chat Trigger**: Captures natural language queries like '2BHK in Coimbatore under 50 lakhs'.*  
> *2. **AI Guardrails**: Automatically inspects user inputs for PII or inappropriate content to guarantee strict enterprise compliance.*  
> *3. **AI Agent Orchestrator with Gemini 3.5 Flash Lite & Simple Memory**: Maintains multi-turn context and understands user goals.*  
> *4. **Information Extractor**: Programmatically structures the query into exact JSON entities (Intent: Buy, BHK: 2, Locality: Coimbatore, Budget: 50 Lakhs).*  
> *5. **HavenMatch Assistant Agent**: Generates a warm, conversational confirmation and gives the user a direct one-click action to view matching homes."*

---

### Slide / Stage 2: Real-Time Matching, GIS Telemetry & Advisory Agents (Stream 2)
> *"Next, the extracted criteria feed into our real-time matching and geospatial scoring pipeline:*
> 
> *1. **Webhook Trigger & Action Router**: Ingests requests with sub-second response times.*  
> *2. **MongoDB Atlas Live Fetch**: Pulls verified active listings from our cloud database.*  
> *3. **Hard Constraints Filter**: Enforces deterministic budget caps and room counts—eliminating hallucination risks.*  
> *4. **Dynamic OSM Query**: Queries OpenStreetMap Overpass API in real time within 3,000m to discover nearby hospitals, schools, and transit.*  
> *5. **Haversine Math & Lifestyle Scoring**: Calculates physical distances and computes a mathematically sound 0–100% compatibility score.*  
> *6. **⭐ Agent 1 (Lifestyle Matchmaker Concierge)**: Evaluates buyer lifestyle priorities and writes a personalized match narrative ('Why this home fits your life').*  
> *7. **⭐ Agent 2 (Locality & Fair Value Advisor)**: Assesses micro-market price per sq.ft against Coimbatore locality averages and offers investment advice.*  
> *8. **Dual Persistence & 200 OK Webhook Response**: Automatically logs the match audit to MongoDB `match_results` while streaming the verified recommendations to the user's screen."*

---

## 🌟 Key Highlights to Emphasize to Judges / Clients

1. **True Multi-Agent System**: Multiple specialized agents (Intake Agent, Matchmaker Concierge, Locality & Valuation Advisor) working collaboratively.
2. **Deterministic Grounding**: Numbers, prices, and physical distances are calculated mathematically from real GPS coordinates—never hallucinated by an LLM.
3. **Enterprise Safety**: Integrated AI Guardrails protect against PII exposure and prompt injections.
4. **Resilient Architecture**: Every AI agent has a silent, deterministic fallback safeguard so the platform never crashes or returns a 500 error.
