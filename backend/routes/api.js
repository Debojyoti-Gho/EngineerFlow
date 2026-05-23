const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const { calculateMetrics } = require('../services/metricsEngine');
const { identifyBottlenecks, deterministicSearch } = require('../services/ruleEngine');
const { getSuggestions } = require('../services/ragService');
const { explainAnalysis, chatWithAnalysis, managerChat, generateCoachingNudge } = require('../services/llmService');

const loadDevs = () => JSON.parse(fs.readFileSync(path.join(__dirname, '../data/Dim_Developers.json'), 'utf8'));

router.get('/developers', (req, res) => res.json(loadDevs()));

router.get('/analysis/:devId', (req, res) => {
  const { devId } = req.params;
  const metrics = calculateMetrics(devId);
  const bottlenecks = identifyBottlenecks(metrics);
  const suggestions = getSuggestions(bottlenecks);

  // Load rich coaching data for the interview narrative
  let activity = null;
  try {
    const coachingData = JSON.parse(fs.readFileSync('/Users/debojyotighosh/.gemini/antigravity/scratch/coaching_data.json', 'utf8'));
    const devMeta = loadDevs().find(d => d.id === devId);
    
    // Find matching engineer by name in the coaching data
    let richDev = null;
    coachingData.teams.forEach(team => {
      const found = team.engineers.find(e => `${e.firstName} ${e.lastName}` === devMeta?.name);
      if (found) richDev = found;
    });

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
    const coachingData = JSON.parse(fs.readFileSync('/Users/debojyotighosh/.gemini/antigravity/scratch/coaching_data.json', 'utf8'));
    const devMeta = loadDevs().find(d => d.id === devId);

    let richDev = null;
    let teamName = 'Unknown Team';
    coachingData.teams.forEach(team => {
      const found = team.engineers.find(e => `${e.firstName} ${e.lastName}` === devMeta?.name);
      if (found) { richDev = found; teamName = team.teamName; }
    });

    if (!richDev) return res.json({ short: 'Good morning! Ready to level up today?', detailed: '', impact: '', action: '', actionType: null });

    const nudge = richDev.role === 'manager' 
      ? {
          isManager: true,
          teamName,
          ...richDev.teamSummary,
          short: `Team median is Level ${richDev.teamSummary.medianTeamMaturityLevel}. ${richDev.teamSummary.blockedContributors[0].name} is stuck.`,
          detailed: `${richDev.teamSummary.blockedContributors[0].name} is blocked: ${richDev.teamSummary.blockedContributors[0].reason}`,
          impact: "This is dragging down the team's median maturity and delivery velocity.",
          action: richDev.teamSummary.coachingActions[0],
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
    res.json({ short: 'Check your metrics today.', detailed: '', impact: '', action: '', actionType: null });
  }
});

router.get('/raw-data/:devId', (req, res) => {
  const { devId } = req.params;
  
  // Load all mandatory fact tables
  const prs = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/Fact_Pull_Requests.json'), 'utf8'));
  const deploys = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/Fact_CI_Deployments.json'), 'utf8'));
  const issues = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/Fact_Jira_Issues.json'), 'utf8'));
  const bugs = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/Fact_Bug_Reports.json'), 'utf8'));

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
