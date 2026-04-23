const fs = require('fs');
const path = require('path');

/**
 * DETERMINISTIC METRICS ENGINE (SRS COMPLIANT)
 * 
 * CORE ARCHITECTURE: 
 * Data → Metrics (deterministic) → Rule Engine → RAG → LLM (optional explanation)
 * 
 * MANDATORY SOURCES:
 * - Dim_Developers
 * - Fact_Jira_Issues
 * - Fact_Pull_Requests
 * - Fact_CI_Deployments
 * - Fact_Bug_Reports
 */

const calculateMetrics = (devId) => {
  const prs = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/Fact_Pull_Requests.json'), 'utf8'));
  const issues = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/Fact_Jira_Issues.json'), 'utf8'));
  const deployments = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/Fact_CI_Deployments.json'), 'utf8'));
  const bugReports = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/Fact_Bug_Reports.json'), 'utf8'));

  const devPrs = prs.filter(p => p.developerId === devId);
  const devIssues = issues.filter(i => i.developerId === devId);
  const devDeploys = deployments.filter(d => d.developerId === devId);
  const devBugs = bugReports.filter(b => b.developerId === devId);

  // 1. Lead Time: PR opened (Fact_Pull_Requests.opened_at) → Production deployment (Fact_CI_Deployments.completed_at)
  // Logic: For each PR, find the deployment that happened closest after it
  const leadTimes = devPrs.map(p => {
    const deploy = devDeploys.find(d => new Date(d.completed_at) >= new Date(p.opened_at));
    if (!deploy) return null;
    return (new Date(deploy.completed_at) - new Date(p.opened_at)) / (1000 * 60 * 60 * 24);
  }).filter(t => t !== null);
  
  const leadTime = leadTimes.length ? (leadTimes.reduce((a, b) => a + b, 0) / leadTimes.length).toFixed(1) : 0;

  // 2. Cycle Time: Issue "In Progress" → "Done"
  const cycleTimes = devIssues.filter(i => i.status === 'Done' && i.in_progress_at).map(i => 
    (new Date(i.done_at) - new Date(i.in_progress_at)) / (1000 * 60 * 60 * 24)
  );
  const cycleTime = cycleTimes.length ? (cycleTimes.reduce((a, b) => a + b, 0) / cycleTimes.length).toFixed(1) : 0;

  // 3. Bug Rate: Escaped Production Bugs (Fact_Bug_Reports) / Completed Issues (Fact_Jira_Issues)
  const completedIssues = devIssues.filter(i => i.status === 'Done');
  const bugRate = completedIssues.length ? (devBugs.length / completedIssues.length).toFixed(2) : 0;

  // 4. Deployment Frequency: Number of successful deployments per month
  // Mock logic: For a small dataset, we return the total for the current "cycle" (month)
  const deploymentFrequency = devDeploys.length; 

  // 5. PR Throughput: Number of merged PRs per month
  const prThroughput = devPrs.filter(p => p.status === 'Merged' || p.status === 'Deployed').length;

  return {
    leadTime: parseFloat(leadTime),
    cycleTime: parseFloat(cycleTime),
    bugRate: parseFloat(bugRate),
    deploymentFrequency,
    prThroughput
  };
};

module.exports = { calculateMetrics };
