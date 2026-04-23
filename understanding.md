# Engineer Flow: Technical Understanding Guide

This document is designed to help you explain the project during an interview. It covers the "What", "How", and "Why" of the architecture.

## 1. High-Level Concept
**Engineer Flow** is a Developer Productivity MVP that transforms raw activity data (PRs, Issues, Deploys) into actionable engineering insights. Unlike a simple dashboard that just shows graphs, this system identifies specific **bottlenecks** and suggests **playbook-based actions**.

---

## 2. The Implementation Pipeline
The system follows a strict **Pipe-and-Filter** architecture to ensure data integrity:

1.  **Data Ingestion**: Raw activity logs are stored in `backend/data/*.json`.
2.  **Deterministic Engine (`metricsEngine.js`)**: Calculates the 5 core KPIs using standard DORA and Flow definitions.
3.  **Rule Engine (`ruleEngine.js`)**: Evaluates metrics against thresholds to identify friction points (Bottlenecks).
4.  **RAG Service (`ragService.js`)**: Maps those bottlenecks to a pre-defined "Engineering Playbook" (Suggestions).
5.  **Narrative Layer (`llmService.js`)**: Uses Groq (Llama 3) to synthesize all the above into a human-readable executive report.

---

## 3. Core Feature Breakdown

### A. System Health Score
*   **Logic**: Calculated by penalizing a base score of 100 for every identified bottleneck (High severity = -25, Medium = -10).
*   **Purpose**: Gives managers an instant pulse on the developer's current "Flow" state.

### B. Metric Cards (The 5 KPIs)
*   **Lead Time**: Speed from PR opened to production.
*   **Cycle Time**: Efficiency of active development (In-Progress to Done).
*   **Bug Rate**: Stability of code (Bugs vs. Total Tasks).
*   **Deployment Frequency**: Release agility.
*   **PR Throughput**: Total contribution volume.

### C. Top Priority Triage
*   The system doesn't just list problems. It sorts bottlenecks by **Severity Score** and highlights the **Top Priority** issue to focus the manager's attention.

### D. AI interpretability Layer
*   **Why use AI?**: To convert raw data into a narrative. 
*   **Constraint**: The AI **never** calculates numbers. It is fed the results of the deterministic engine to ensure accuracy.

---

## 4. Key Technical Decisions (For the Interview)

*   **Choice of Tech**: React for a responsive UI, Node.js for a fast calculation backend, and Groq for ultra-low latency AI responses.
*   **Performance Optimization**: Implemented server-side caching. If the data hasn't changed, the AI explanation is served from memory (0ms latency).
*   **Data Integrity**: We use a **Deterministic-First** approach. Decisions and math are handled by code; phrasing and narrative are handled by AI.

---

## 5. Potential Future Roadmaps
If asked how you would take this to "Production Grade":
1.  **Database Migration**: Move from JSON files to PostgreSQL.
2.  **OAuth Integration**: Connect real GitHub/GitLab accounts via webhooks.
3.  **Vector DB**: If the "Playbook" grows to thousands of pages, use a Vector Database (like Pinecone) for the RAG layer.
4.  **Team Comparison**: Add a "Team View" to compare productivity across different squads.
