/**
 * RULE ENGINE (CRITICAL)
 * Maps metrics → insights using deterministic logic.
 */

const identifyBottlenecks = (m) => {
  const bottlenecks = [];

  // 1. PR Review Delay: High lead time + normal cycle time
  if (m.leadTime > 4 && m.cycleTime <= 3) {
    bottlenecks.push({ name: "PR Review Bottleneck", severity: "high", insight: "PRs are staying in review too long relative to development speed." });
  }

  // 2. Quality Issue: High bug rate
  if (m.bugRate > 0.3) {
    bottlenecks.push({ name: "Quality Bottleneck", severity: "high", insight: "High volume of escaped bugs relative to completed features." });
  }

  // 3. Release Bottleneck: Low deployment frequency
  if (m.deploymentFrequency < 5) {
    bottlenecks.push({ name: "Release Bottleneck", severity: "medium", insight: "Infrequent deployments slowing down the release cycle." });
  }

  // 4. Development Bottleneck: High cycle time
  if (m.cycleTime > 3) {
    bottlenecks.push({ name: "Development Bottleneck", severity: "medium", insight: "Coding phase is taking longer than industry averages." });
  }

  // 5. Contribution Bottleneck: Low PR throughput
  if (m.prThroughput < 5) {
    bottlenecks.push({ name: "Contribution Bottleneck", severity: "low", insight: "Low number of merged PRs in this period." });
  }

  return bottlenecks;
};

/**
 * DETERMINISTIC SEARCH ENGINE
 * Replaces AI-based filtering to ensure strict logic and 100% reliability.
 */
const deterministicSearch = (query, devsWithMetrics) => {
  const q = query.toLowerCase();
  
  if (q.includes('lead time') || q.includes('slow delivery')) {
    return devsWithMetrics
      .filter(d => d.metrics.leadTime > 4)
      .sort((a, b) => b.metrics.leadTime - a.metrics.leadTime)
      .map(d => d.id);
  }

  if (q.includes('bug') || q.includes('quality')) {
    return devsWithMetrics
      .filter(d => d.metrics.bugRate > 0.2)
      .sort((a, b) => b.metrics.bugRate - a.metrics.bugRate)
      .map(d => d.id);
  }

  if (q.includes('high performer') || q.includes('top')) {
    return devsWithMetrics
      .filter(d => d.metrics.leadTime < 3 && d.metrics.bugRate < 0.1)
      .map(d => d.id);
  }

  // Default: Return all ranked by a composite score
  return devsWithMetrics
    .map(d => ({
        id: d.id,
        score: (1 / (d.metrics.leadTime || 1)) + (d.metrics.prThroughput / 10) - (d.metrics.bugRate * 5)
    }))
    .sort((a, b) => b.score - a.score)
    .map(d => d.id);
};

module.exports = { identifyBottlenecks, deterministicSearch };
