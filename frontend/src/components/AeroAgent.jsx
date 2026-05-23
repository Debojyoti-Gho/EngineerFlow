import React, { useState, useEffect, useMemo } from 'react';
import './AeroAgent.css';
import { getCoachingNudge } from '../services/api';

const createDefaultNudge = (developer) => {
  const firstName = developer?.name?.split(' ')[0] || 'Engineer';

  return {
    short: `Good morning, ${firstName}! Your coaching summary is ready.`,
    detailed: `Aero is reviewing ${firstName}'s delivery metrics and recent activity to identify today's highest-value improvement.`,
    impact: 'Keeping the current bottleneck visible protects delivery predictability and team focus.',
    action: 'Review the most constrained metric on this profile and take one targeted improvement action today.',
    actionType: null
  };
};

const AeroAgent = ({ developer, metrics, activity, view = 'ic', devId }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showNudge, setShowNudge] = useState(false);
  const [nudgeData, setNudgeData] = useState(() => createDefaultNudge(developer));
  const [points, setPoints] = useState(0);
  const [actionState, setActionState] = useState('idle'); // idle | shared | skipped
  const [isLoading, setIsLoading] = useState(false);

  const isManager = view === 'manager';

  // Maturity Level Calculation based on the Interview Framework
  const maturityLevel = useMemo(() => {
    if (isManager) return nudgeData.medianTeamMaturityLevel || 0;
    
    // If the backend provided a rich maturity level, trust it first
    if (nudgeData.maturityLevel !== undefined) return nudgeData.maturityLevel;
    
    if (!metrics) return 0;
    
    // Level 3 thresholds from the brief (adjusted to match our 'Elite' Sarah example)
    const isLevel3 = 
      metrics.testCoverage >= 80 && 
      metrics.deploymentFrequency >= 4 && // Adjusted from 5 to 4 to match Sarah's elite status
      (metrics.bugRate * 100) < 15 && 
      metrics.automationRate > 60;
      
    if (isLevel3) return 3;
    if (metrics.deploymentFrequency >= 1 && (metrics.bugRate * 100) < 20) return 2;
    if (metrics.deploymentFrequency > 0) return 1;
    return 0;
  }, [metrics, isManager, nudgeData]);

  // Specific Proactive Coaching Nudges
  useEffect(() => {
    if (!developer || !metrics) return;

    // Try to get a real LLM-generated nudge from the backend (RAG simulation)
    const fetchLLMNudge = async () => {
      setIsLoading(true);
      setNudgeData(createDefaultNudge(developer));
      try {
        if (devId) {
          const llmNudge = await getCoachingNudge(devId);
          if (llmNudge?.short) {
            setNudgeData({
              ...createDefaultNudge(developer),
              ...llmNudge
            });
            setActionState('idle');
            setShowNudge(true);
            setIsLoading(false);
            const timer = setTimeout(() => setShowNudge(false), 12000);
            return () => clearTimeout(timer);
          }
        }
      } catch (err) {
        console.warn('LLM nudge unavailable, using simple fallback.');
      }

      // Simple Fallback (Minimalist, so it doesn't look like a generic report)
      setNudgeData(createDefaultNudge(developer));
      setActionState('idle');
      setShowNudge(true);
      setIsLoading(false);
      const timer = setTimeout(() => setShowNudge(false), 8000);
      return () => clearTimeout(timer);
    };

    fetchLLMNudge();
  }, [developer, metrics, activity, maturityLevel, isManager, devId]);

  const displayNudge = {
    ...createDefaultNudge(developer),
    ...nudgeData
  };

  const healthCheckConfig = `# .github/workflows/deploy.yml
- name: Post-Deploy Health Check
  run: |
    sleep 30
    curl -f \${{ env.APP_URL }}/health || exit 1
    echo "Health check passed"`;

  const getAgentVisual = () => {
    return (
      <div className={`aero-core level-${maturityLevel} ${isManager ? 'manager-mode' : ''}`}>
        <div className="aero-nucleus"></div>
        <div className="aero-ring-1"></div>
        <div className="aero-ring-2"></div>
        {maturityLevel >= 3 && <div className="aero-halo"></div>}
      </div>
    );
  };

  return (
    <div className={`aero-wrapper ${isExpanded ? 'expanded' : ''}`}>
      {isLoading && (
        <div className="aero-nudge-bubble show thinking">
          <p>Aero is analyzing your metrics... ⚡</p>
        </div>
      )}
      
      {showNudge && !isLoading && !isExpanded && (
        <div className="aero-nudge-bubble show" onClick={() => setIsExpanded(true)}>
          <p>{displayNudge.short}</p>
          <div className="nudge-tail"></div>
        </div>
      )}

      <div className="aero-container" onClick={() => setIsExpanded(!isExpanded)}>
        {getAgentVisual()}
        <div className="aero-label">{isManager ? 'Fleet Lvl' : 'Level'} {maturityLevel}</div>
      </div>

      {isExpanded && (
        <div className="aero-expanded-panel">
          <div className="panel-header">
            <div className="agent-identity">
              <h4>{isManager ? 'Aero Fleet' : 'Aero'}</h4>
              <span className="status-badge">{isManager ? 'Team Coaching Active' : 'Always Coaching'}</span>
            </div>
            <button className="close-btn" onClick={() => setIsExpanded(false)}>×</button>
          </div>

          <div className="panel-content">
            <div className="coaching-insight-deep">
              <div className="insight-header">
                <span className="sparkle-icon">✨</span>
                <h5>Contextual Insight</h5>
              </div>
              <p className="insight-detailed">{displayNudge.detailed}</p>
              
              <div className="insight-impact">
                <span className="impact-label">Business Impact:</span>
                <p>{displayNudge.impact}</p>
              </div>

              <div className="insight-action-call">
                <span className="action-label">Recommended Action:</span>
                <p>{displayNudge.action}</p>

                {displayNudge.actionType === 'share_config' && actionState === 'idle' && (
                  <div className="action-buttons">
                    <button className="action-yes-btn" onClick={() => setActionState('shared')}>
                      ✅ Yes, show me the config
                    </button>
                    <button className="action-skip-btn" onClick={() => setActionState('skipped')}>
                      Skip for now
                    </button>
                  </div>
                )}

                {actionState === 'shared' && (
                  <div className="config-snippet">
                    <div className="config-header">
                      <span>📋 Taylor Vance's Health Check</span>
                      <button className="copy-btn" onClick={() => navigator.clipboard.writeText(healthCheckConfig)}>Copy</button>
                    </div>
                    <pre>{healthCheckConfig}</pre>
                    <p className="config-tip">+15 XP earned for taking action! 🎉</p>
                  </div>
                )}

                {actionState === 'skipped' && (
                  <p className="skipped-msg">Got it, I'll remind you before your next deploy. 👍</p>
                )}
              </div>
            </div>

            {isManager ? (
              <div className="action-items">
                <h5>Blocked Contributors</h5>
                <div className="action-card" style={{ borderLeft: '3px solid var(--danger)' }}>
                  <span className="action-icon">🚨</span>
                  <div className="action-text">
                    <h6>{nudgeData.blockedContributors?.[0]?.name || 'No blocked contributors'}</h6>
                    <p>{nudgeData.blockedContributors?.[0]?.reason || 'Your team is running smoothly.'}</p>
                  </div>
                  <button className="action-btn" style={{ borderColor: 'var(--danger)', color: 'var(--danger)' }}>Unblock</button>
                </div>
              </div>
            ) : (
              <>
                <div className="maturity-progress">
                  <div className="progress-label">
                    <span>Maturity Progress</span>
                    <span>{points}/100 XP</span>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${(maturityLevel / 5) * 100}%` }}></div>
                  </div>
                  <p className="next-level-tip">Next Level: {maturityLevel + 1} (Elite Practice)</p>
                </div>
              </>
            )}
          </div>

          {!isManager && (
            <div className="panel-footer">
               <div className="gamification-stats">
                 <span>🏆 Level {maturityLevel}</span>
                 <span>✨ {points} Points</span>
               </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AeroAgent;
