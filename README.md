# Developer Productivity Insight System (MVP)

A deterministic metrics engine designed to transform raw engineering data into actionable insights and human-readable explanations.

## 🎯 Core Implementation Flow
**Data** → **Metrics (Deterministic)** → **Rule Engine** → **RAG (Playbook)** → **LLM (Optional Explanation)**

1.  **Data Source**: Mandatory tables (`Dim_Developers`, `Fact_Pull_Requests`, `Fact_CI_Deployments`, `Fact_Jira_Issues`, `Fact_Bug_Reports`).
2.  **Metrics Engine**: Pure JavaScript logic calculating KPIs based on exact assignment definitions. No AI involved in calculation.
3.  **Rule Engine**: Explicit logic-based bottleneck detection using industry benchmarks. Includes deterministic search.
4.  **RAG Service**: Maps identified bottlenecks to a fixed "Engineering Playbook" of suggestions.
5.  **LLM Layer**: Used **ONLY for narrative translation**. Converts structured insights into natural language.

## 📊 Metric Definitions (Strict Adherence)
| Metric | Definition | Source Data |
| :--- | :--- | :--- |
| **Lead Time** | PR opened → Production deployment | `Fact_Pull_Requests.opened_at` + `Fact_CI_Deployments.completed_at` |
| **Cycle Time** | Issue "In Progress" → "Done" | `Fact_Jira_Issues.in_progress_at` + `Fact_Jira_Issues.done_at` |
| **Bug Rate** | Escaped Bugs / Completed Issues | `Fact_Bug_Reports` / `Fact_Jira_Issues` |
| **Deploy Freq** | Number of successful deployments / month | `Fact_CI_Deployments.completed_at` |
| **PR Throughput** | Number of merged PRs / month | `Fact_Pull_Requests` |

## ⚠️ System Limitations
- **Static Dataset**: Operates on simulated JSON records.
- **Simplified Thresholds**: Bottleneck detection relies on fixed engineering benchmarks.
- **No Real-time Integration**: No direct connection to GitHub/Jira APIs.
- **Single IC Focus**: Primary dashboard views are tailored for Individual Contributors.

## 🛠️ Technical Stack
- **Frontend**: React (Functional Components)
- **Backend**: Node.js + Express.js
- **Interpretability**: Groq (Llama 3) via REST API

---

## 📦 Deliverables Guide (SRS Compliance)
To finalize your submission, ensure you have:
1.  **Working Demo**: This repository is configured for a live demo via `npm run dev`.
2.  **Video (5–10 min)**: Prepare a walkthrough highlighting the **Deterministic Metrics Engine** vs **LLM Narrative Layer**.
3.  **Miro Board**: Design a flow showing the pipeline: `Data → Metrics Engine → Rule Engine → (Optional RAG) → LLM`.
4.  **GitHub Repo**: Ensure all mandatory fact tables (`Dim_Developers`, `Fact_Pull_Requests`, etc.) are in the `data/` directory.

## ✅ Evaluation Checklist
- [x] **Metrics exactly defined**: Lead Time, Cycle Time, Bug Rate, Deploy Freq, PR Throughput.
- [x] **Logic is deterministic**: Pure JS calculations, no AI involvement in math.
- [x] **UI shows interpretation + actions**: Insight cards + Strategic Playbooks.
- [x] **AI is only narrative**: LLM converts structured insights into natural language only.
- [x] **Mandatory Tables used**: All 5 Fact/Dim tables integrated.
