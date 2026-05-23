const axios = require('axios');

const GROQ_API_KEY = process.env.XAI_API_KEY || process.env.GROQ_API_KEY;
const MODEL = "llama-3.3-70b-versatile";

/**
 * LLM SERVICE (INTERPRETABILITY LAYER)
 * The LLM is used only to enhance interpretability by converting 
 * deterministic insights into human-readable explanations.
 * It is NOT used for calculations or decision-making.
 */

const explainAnalysis = async (data) => {
  if (!GROQ_API_KEY) {
    return { explanation: "<p><b>System Note:</b> AI interpretability layer is currently in fallback mode.</p>" };
  }

  const prompt = `
    You are an AI interpretability assistant. 
    Your goal is to convert deterministic developer metrics into a human-readable explanation.
    
    SYSTEM FLOW: Data → Metrics (deterministic) → Rules → RAG → LLM (Your narrative)

    DETERMINISTIC DATA:
    - Metrics: ${JSON.stringify(data.metrics)}
    - Bottlenecks: ${JSON.stringify(data.bottlenecks)}
    - Playbook Suggestions: ${JSON.stringify(data.suggestions)}

    INSTRUCTIONS:
    1. Explain the "WHY" behind the metrics provided above.
    2. Do NOT change the data or the conclusions provided in the bottlenecks.
    3. Format as clean HTML (<h4>, <p>, <ul>, <li>).
    4. Maintain an objective, engineering-focused tone.
  `;

  try {
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: MODEL,
        messages: [
          { role: "system", content: "You are a senior engineering assistant focusing on data interpretability." },
          { role: "user", content: prompt }
        ],
        temperature: 0.2
      },
      {
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return { explanation: response.data.choices[0].message.content };
  } catch (error) {
    return { 
      explanation: `<h4>Manual Insight</h4><p>The AI interpretability layer is busy. Deterministic analysis shows your primary bottleneck is <b>${data.bottlenecks[0]?.name || 'N/A'}</b>.</p>` 
    };
  }
};

const chatWithAnalysis = async (message, data) => {
  if (!GROQ_API_KEY) {
    return { reply: "I'm currently in manual mode. How can I help you with your metrics?" };
  }

  const prompt = `
    You are an interactive AI Productivity Assistant. 
    You have full context of the developer's metrics and bottlenecks.
    
    CURRENT CONTEXT:
    - Metrics: ${JSON.stringify(data.metrics)}
    - Bottlenecks: ${JSON.stringify(data.bottlenecks)}
    - Suggestions: ${JSON.stringify(data.suggestions)}

    USER QUESTION: "${message}"

    INSTRUCTIONS:
    1. Answer the user's question directly and conversationally using the provided context.
    2. Do NOT provide a generic summary unless specifically asked.
    3. If the user asks if you can do something, answer "Yes" and explain how you can help with their data.
    4. Maintain a premium, helpful, and engineering-focused tone.
    5. Refer to the metrics and bottlenecks ONLY when it helps answer the question.
    6. Keep the response concise but insightful.
  `;

  try {
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: MODEL,
        messages: [
          { role: "system", content: "You are a helpful senior engineering advisor." },
          { role: "user", content: prompt }
        ],
        temperature: 0.5
      },
      {
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return { reply: response.data.choices[0].message.content };
  } catch (error) {
    return { reply: "The intelligence core is temporarily offline. Please try again." };
  }
};

const managerChat = async (message, teamData) => {
  if (!GROQ_API_KEY) {
    return { reply: "I'm currently in manual mode. How can I help you manage your team?" };
  }

  const prompt = `
    You are a Senior Engineering Manager's AI Assistant. 
    You have full visibility of the entire team's productivity metrics and health scores.
    
    TEAM CONTEXT:
    ${JSON.stringify(teamData.map(d => ({ name: d.name, role: d.role, metrics: d.metrics, bottlenecks: d.bottlenecks })))}

    MANAGER QUESTION: "${message}"

    INSTRUCTIONS:
    1. Answer the manager's question directly and conversationally.
    2. Only provide a team-wide summary if the manager asks for an overview or "insights".
    3. If the manager asks about capabilities (e.g., "can I ask about X?"), confirm your ability and provide a brief example based on the team data.
    4. Be professional, strategic, and concise.
    5. Refer to specific engineers by name ONLY when relevant to the question.
    6. Ensure the tone is leadership-grade and actionable.
  `;

  try {
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: MODEL,
        messages: [
          { role: "system", content: "You are a strategic engineering leadership advisor." },
          { role: "user", content: prompt }
        ],
        temperature: 0.5
      },
      {
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return { reply: response.data.choices[0].message.content };
  } catch (error) {
    return { reply: "The leadership intelligence module is temporarily offline." };
  }
};

/**
 * COACHING NUDGE GENERATOR (RAG-SIMULATION LAYER)
 * 
 * This function simulates what a RAG pipeline does in production:
 * 1. Retrieves the engineer's full context (metrics, PRs, sprint, team)
 * 2. Assembles it into a grounded prompt  
 * 3. Calls the LLM to generate a specific, non-generic coaching message
 * 
 * In a production system, step 1 would pull from a vector store
 * containing the last 7 days of engineer events. Here we use the
 * rich dummy data directly as the "retrieved context."
 */
const generateCoachingNudge = async (engineerContext) => {
  if (!GROQ_API_KEY) {
    // Graceful fallback — deterministic nudge
    return {
      short: `Hey ${engineerContext.firstName}, your metrics need attention today.`,
      detailed: `Your change failure rate is above the 15% threshold. Review your deployment pipeline before today's release.`,
      impact: `Escaped bugs increase customer churn and MTTR significantly.`,
      action: `Add a post-deployment health check to your pipeline.`,
      actionType: null
    };
  }

  const { firstName, metrics, todaysActivity, sprintSummary, teamName, maturityLevel } = engineerContext;

  const stalePR = todaysActivity?.activePullRequests?.find(pr => pr.hoursOpen > 48);
  const missingTestPR = todaysActivity?.activePullRequests?.find(pr => !pr.hasTestsIncluded);

  const contextBlock = `
ENGINEER CONTEXT (Freshly Retrieved):
- Name: ${firstName}
- Team: ${teamName}
- Current Maturity Level: ${maturityLevel} (Goal: Level 3)

TODAY'S ACTIVITY:
- AI Tool Usage Today: ${todaysActivity?.aiCodingToolUsageMinutes || 0} minutes
- Tests Written Today: ${todaysActivity?.testsWrittenToday || 0}
- Peer Reviews Given: ${todaysActivity?.peerCodeReviewsGivenToday || 0}
- Active PRs: ${JSON.stringify(todaysActivity?.activePullRequests || [])}

CURRENT KPIs (vs Thresholds):
- Change Failure Rate: ${metrics.changeFailureRatePercent}% (threshold: <15%)
- Deployment Frequency: ${metrics.deploymentFrequencyPerWeek}/week (threshold: ≥1/week)
- AI Tool Adoption: ${metrics.aiCodingToolAdoptionPercent}% (threshold: >60%)
- Ticket Cycle Time: ${metrics.ticketCycleTimeDays} days (threshold: <55 days)
- Automated Deployments: ${metrics.fullyAutomatedDeploymentsPercent}% (threshold: >60%)

LAST SPRINT:
- Velocity: ${sprintSummary?.velocityPercent}%
- Build Failures: ${sprintSummary?.buildFailures}
- Commits Missing Ticket Links: ${sprintSummary?.commitsMissingTicketLinks}
`;

  const systemPrompt = `You are Aero, a hyper-personalised engineering coaching agent. 
Your coaching is grounded in real-time data retrieved from the engineer's tools. 
You are NOT a dashboard — you are a coach who shows up at the right moment with one specific, actionable message.
Never give generic advice. Every word must reference the engineer's actual data.`;

  const userPrompt = `${contextBlock}

Based on the SINGLE most urgent issue visible in this engineer's data, generate a coaching nudge as a JSON object with exactly these 4 fields:

{
  "short": "One punchy sentence (max 15 words) for the popup bubble. Use their name.",
  "detailed": "2-3 sentences explaining the specific situation using their actual numbers. Be direct.",
  "impact": "One sentence on the business/team consequence if this is not fixed today.",
  "action": "The single most specific thing they should do RIGHT NOW. Name a specific teammate if relevant."
}

${stalePR ? `Priority: The PR "${stalePR.title}" has been open ${stalePR.hoursOpen}h with ${stalePR.reviewers} reviewer(s) and ${stalePR.hasTestsIncluded ? 'has' : 'is MISSING'} tests.` : ''}

Respond with ONLY the JSON object. No explanation, no markdown.`;

  try {
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.3,
        response_format: { type: "json_object" }
      },
      {
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const parsed = JSON.parse(response.data.choices[0].message.content);
    // Detect if this nudge should surface the config share action
    const needsConfig = (engineerContext.metrics.changeFailureRatePercent || 0) > 15;
    return { ...parsed, actionType: needsConfig ? 'share_config' : null };
  } catch (error) {
    console.error('Coaching nudge LLM error:', error.message);
    return {
      short: `Hey ${firstName}, one urgent thing needs your attention today.`,
      detailed: `Your metrics show a breach in at least one key threshold. Check your pipeline before today's release.`,
      impact: `Unresolved issues compound across sprints and slow your path to Level 3.`,
      action: `Review your most critical KPI and take one targeted action before end of day.`,
      actionType: null
    };
  }
};

module.exports = { explainAnalysis, chatWithAnalysis, managerChat, generateCoachingNudge };
