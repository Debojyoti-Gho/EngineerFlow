const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const { calculateMetrics } = require('../services/metricsEngine');
const { identifyBottlenecks, deterministicSearch } = require('../services/ruleEngine');
const { getSuggestions } = require('../services/ragService');
const { explainAnalysis, chatWithAnalysis } = require('../services/llmService');

const loadDevs = () => JSON.parse(fs.readFileSync(path.join(__dirname, '../data/Dim_Developers.json'), 'utf8'));

router.get('/developers', (req, res) => res.json(loadDevs()));

router.get('/analysis/:devId', (req, res) => {
  const { devId } = req.params;
  const metrics = calculateMetrics(devId);
  const bottlenecks = identifyBottlenecks(metrics);
  const suggestions = getSuggestions(bottlenecks);

  res.json({ metrics, bottlenecks, suggestions });
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
