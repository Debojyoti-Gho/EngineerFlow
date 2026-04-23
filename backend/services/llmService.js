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
    1. Answer the user's question directly using the provided context.
    2. Maintain a premium, helpful, and engineering-focused tone.
    3. If the user asks for advice, refer to the bottlenecks and suggestions.
    4. Keep the response concise but insightful.
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
    1. Provide insights across the entire team.
    2. Identify who needs help, where resource allocation might be shifted, or which team-wide trends are concerning.
    3. Be professional, strategic, and concise.
    4. Refer to specific engineers by name if relevant.
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

module.exports = { explainAnalysis, chatWithAnalysis, managerChat };
