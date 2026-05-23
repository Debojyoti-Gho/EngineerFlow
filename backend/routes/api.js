const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const { calculateMetrics } = require('../services/metricsEngine');
const { identifyBottlenecks, deterministicSearch } = require('../services/ruleEngine');
const { getSuggestions } = require('../services/ragService');
const { explainAnalysis, chatWithAnalysis, managerChat, generateCoachingNudge } = require('../services/llmService');

const dataPath = (fileName) => path.join(__dirname, '../data', fileName);
const loadJson = (fileName) => JSON.parse(fs.readFileSync(dataPath(fileName), 'utf8'));
const loadDevs = () => loadJson('Dim_Developers.json');
const loadCoachingData = () => loadJson('coaching_data.json');

const findRichDeveloper = (devId) => {
  const coachingData = loadCoachingData();
  const devMeta = loadDevs().find(d => d.id === devId);

  let richDev = null;
  let teamName = 'Unknown Team';

  coachingData.teams.forEach(team => {
    const found = team.engineers.find(e => `${e.firstName} ${e.lastName}` === devMeta?.name);
    if (found) {
      richDev = found;
      teamName = team.teamName;
    }
  });

  return { richDev, teamName };
};

const createFallbackNudge = (name = 'there') => ({
  short: `Good morning, ${name}! Your coaching summary is ready.`,
  detailed: 'Aero reviewed the available engineering metrics and found a clear next step for today.',
  impact: 'Keeping the current bottleneck visible helps protect delivery predictability and team focus.',
  action: 'Review the most constrained metric on this profile and take one targeted improvement action today.',
  actionType: null
});

router.get('/developers', (req, res) => res.json(loadDevs()));

router.get('/analysis/:devId', (req, res) => {
  const { devId } = req.params;
  const metrics = calculateMetrics(devId);
  const bottlenecks = identifyBottlenecks(metrics);
  const suggestions = getSuggestions(bottlenecks);

  // Load rich coaching data for the interview narrative
  let activity = null;
  try {
    const { richDev } = findRichDeveloper(devId);

    if (richDev) {
      activity = richDev.todaysActivity;
      // Inject all 6 foundation metrics from the interview framework
      metrics.aiAdoption = richDev.kpis.aiCodingToolAdoptionPercent;
      metrics.maturityLevel = richDev.maturityLevel;
      metrics.automationRate = richDev.kpis.fullyAutomatedDeploymentsPercent;
      metrics.exceptions = richDev.kpis.authorisedPolicyExceptionsPerQuarter;
      metrics.deploymentFrequency = richDev.kpis.deploymentFrequencyPerWeek;
      metrics.cycleTime = richDev.kpis.ticketCycleTimeDays;
      metrics.bugRate = richDev.kpis.changeFailureRatePercent / 100;
      metrics.testCoverage = richDev.sprintSummary.testCoverageEndPercent;
    }
  } catch (err) {
    console.error("Coaching data not found, falling back to deterministic only.");
  }

  res.json({ metrics, bottlenecks, suggestions, activity });
});

// Real LLM-powered coaching nudge endpoint (RAG simulation layer)
router.get('/coaching-nudge/:devId', async (req, res) => {
  const { devId } = req.params;
  try {
    const devMeta = loadDevs().find(d => d.id === devId);
    const { richDev, teamName } = findRichDeveloper(devId);

    if (!richDev) {
      return res.json(createFallbackNudge(devMeta?.name?.split(' ')[0] || 'there'));
    }

    const blockedContributor = richDev.teamSummary?.blockedContributors?.[0];

    const nudge = richDev.role === 'manager' 
      ? {
          isManager: true,
          teamName,
          ...richDev.teamSummary,
          short: blockedContributor
            ? `Team median is Level ${richDev.teamSummary.medianTeamMaturityLevel}. ${blockedContributor.name} is stuck.`
            : `Team median is Level ${richDev.teamSummary?.medianTeamMaturityLevel || 1}. No urgent blockers found.`,
          detailed: blockedContributor
            ? `${blockedContributor.name} is blocked: ${blockedContributor.reason}`
            : 'The team has no urgent blocked contributors in the current coaching data.',
          impact: "This is dragging down the team's median maturity and delivery velocity.",
          action: richDev.teamSummary?.coachingActions?.[0] || 'Review team bottlenecks and confirm ownership for the next delivery risk.',
          actionType: 'manager_action'
        }
      : await generateCoachingNudge({
          firstName: richDev.firstName,
          teamName,
          maturityLevel: richDev.maturityLevel,
          metrics: richDev.kpis,
          todaysActivity: richDev.todaysActivity,
          sprintSummary: richDev.sprintSummary
        });

    res.json(nudge);
  } catch (err) {
    console.error('Coaching nudge route error:', err.message);
    res.json(createFallbackNudge());
  }
});

router.get('/raw-data/:devId', (req, res) => {
  const { devId } = req.params;
  
  // Load all mandatory fact tables
  const prs = loadJson('Fact_Pull_Requests.json');
  const deploys = loadJson('Fact_CI_Deployments.json');
  const issues = loadJson('Fact_Jira_Issues.json');
  const bugs = loadJson('Fact_Bug_Reports.json');

  res.json({
    prs: prs.filter(p => p.developerId === devId),
    deploys: deploys.filter(d => d.developerId === devId),
    issues: issues.filter(i => i.developerId === devId),
    bugs: bugs.filter(b => b.developerId === devId)
  });
});

router.post('/explain', async (req, res) => {
  const explanation = await explainAnalysis(req.body);
  res.json(explanation); 
});

router.post('/chat', async (req, res) => {
  const { message, context } = req.body;
  const reply = await chatWithAnalysis(message, context);
  res.json(reply);
});

router.post('/manager/chat', async (req, res) => {
  const { message, teamData } = req.body;
  const reply = await managerChat(message, teamData);
  res.json(reply);
});

router.post('/search-developers', async (req, res) => {
  const { query } = req.body;
  const devs = loadDevs();
  
  // Enrich devs with metrics for deterministic filtering
  const devsWithMetrics = devs.map(d => ({
    ...d,
    metrics: calculateMetrics(d.id)
  }));

  const rankedIds = deterministicSearch(query, devsWithMetrics);
  res.json({ rankedIds });
});

module.exports = router;
