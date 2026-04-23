# ✦ EngineerFlow | Productivity Intelligence Engine

<div align="center">
  <img src="frontend/public/favicon.png" width="120" alt="EngineerFlow Logo" />
  <h3>Transforming Engineering Data into Strategic Fleet Intelligence</h3>
  <p align="center">
    <img src="https://img.shields.io/badge/Architecture-Deterministic%20Core%20+%20LLM%20Narrative-cyan" alt="Architecture" />
    <img src="https://img.shields.io/badge/Stack-React%20|%20Node.js%20|%20Express-blueviolet" alt="Stack" />
    <img src="https://img.shields.io/badge/AI-Groq%20Llama%203.3-green" alt="AI" />
    <img src="https://img.shields.io/badge/UI-Premium%20Glassmorphism-FF00CC" alt="UI" />
  </p>
</div>

---

## 🚀 Vision
**EngineerFlow** is a next-generation productivity dashboard designed to bridge the gap between raw engineering metrics and human-centric leadership. While traditional tools provide charts, EngineerFlow provides **Intelligence**. 

By combining a **Deterministic Metrics Engine** with a specialized **Narrative LLM Layer**, it translates complex PR, Jira, and Deployment data into actionable strategic playbooks for both Individual Contributors (ICs) and Engineering Managers.

---

## 🛠️ The Intelligence Framework
EngineerFlow operates on a high-integrity pipeline that ensures technical accuracy while maintaining conversational depth.

1.  **Deterministic Core**: 100% logic-based metrics calculation (Lead Time, Cycle Time, etc.) directly from SQL-grade Fact tables. No "AI-hallucinated" numbers.
2.  **Rule-Based Heuristics**: Deterministic identification of bottlenecks (Quality Bottlenecks, Review Latency, Release Friction) using industry-standard benchmarks.
3.  **RAG-Powered Playbooks**: Dynamic mapping of identified bottlenecks to a curated library of strategic engineering interventions.
4.  **Narrative Synthesis (The Brain)**: A high-performance LLM (Llama 3.3 via Groq) translates these structured findings into natural language summaries, providing context that a spreadsheet never could.

---

## 💎 Key Features

### 👤 Individual Contributor (IC) Intelligence
- **Personal Flow Index**: A real-time health score based on quality, velocity, and contribution consistency.
- **Strategic Playbooks**: Direct, actionable advice on how to improve personal metrics (e.g., "Reduce PR size to decrease review latency").
- **Stability Radar**: High-fidelity visualization of multi-dimensional performance.

### 🏢 Managerial "Fleet" Dashboard
- **Team-Wide Synthesis**: Aggregated view of developer health across the entire organization.
- **Fleet Assistant**: A specialized AI advisor that understands the team's metrics and provides strategic answers to complex resource-allocation questions.
- **Bottleneck Spotlight**: Immediate identification of which engineers are blocked by process friction rather than skill gaps.

---

## 📊 Core Metrics (SRS Compliant)
| KPI | Logic | Source |
| :--- | :--- | :--- |
| **Lead Time** | PR Opened → Deployment | `Fact_Pull_Requests` + `Fact_CI_Deployments` |
| **Cycle Time** | In Progress → Done | `Fact_Jira_Issues` |
| **Quality Stability** | Escaped Bugs / Merged PRs | `Fact_Bug_Reports` + `Fact_Pull_Requests` |
| **Release Agility** | Successful Deploys / Month | `Fact_CI_Deployments` |
| **Contribution Flow** | Merged PRs / Month | `Fact_Pull_Requests` |

---

## 💻 Tech Stack
- **Frontend**: React 18, Vite, Framer Motion (Animations), Glassmorphic CSS Engine.
- **Backend**: Node.js, Express, RESTful Architecture.
- **AI/LLM**: Groq Inference Engine (Llama 3.3 70B), custom System Prompting for Engineering Management.
- **Data Architecture**: High-integrity JSON-Fact tables simulating a production Data Warehouse (DWH) environment.

---

## ⚡ Quick Start

### 1. Prerequisites
- Node.js (v18+)
- Groq API Key (Set as `XAI_API_KEY` in backend `.env`)

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/Debojyoti-Gho/EngineerFlow.git

# Install Backend Dependencies
cd backend && npm install

# Install Frontend Dependencies
cd ../frontend && npm install
```

### 3. Execution
```bash
# Run Backend (Port 5001)
cd backend && npm run dev

# Run Frontend (Vite)
cd frontend && npm run dev
```

---

## 🎯 Implementation Goals (Interview Checklist)
- [x] **Pure Determinism**: Math is handled by JS, not AI. Hallucination-free KPIs.
- [x] **Dual Persona UI**: Distinct workflows for ICs and Managers.
- [x] **Premium Aesthetics**: Production-ready, high-fidelity UI that exceeds standard MVP expectations.
- [x] **Data Transparency**: Direct mapping from Fact tables to visual insights.
- [x] **Conversational UX**: Natural language interface for deep metric exploration.

---

<div align="center">
  <p>Built with ❤️ for the Modern Engineering Leader</p>
  <b>EngineerFlow | Elevate Your Engineering Culture</b>
</div>
