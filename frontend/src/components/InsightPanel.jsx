import React, { useRef, useState, useEffect } from 'react';

const InsightPanel = ({ metrics, bottlenecks, suggestions, onExplain, loading = false, explanation = '' }) => {
  const priorityRef = useRef(null);
  const topPriority = bottlenecks.find(b => b.severity === 'high') || bottlenecks[0];
  const others = bottlenecks.filter(b => b.id !== topPriority?.id);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 4);
    }, 5000);
    return () => clearInterval(timer);
  }, [isPaused]);

  const renderChart = (index) => {
    // Calculate normalized scores (0-100) from real metrics
    const velocityScore = Math.min(100, (2 / (metrics.leadTime || 1)) * 100); 
    const qualityScore = Math.max(0, Math.min(100, (1 - (metrics.bugRate || 0)) * 100));
    const throughputScore = Math.min(100, ((metrics.prThroughput || 0) / 10) * 100);
    const cycleScore = Math.min(100, (1 / (metrics.cycleTime || 1)) * 100);
    const momentumScore = Math.min(100, ((metrics.deploymentFrequency || 0) / 10) * 100);

    switch(index) {
      case 0: // Workflow Pulse Bars
        return (
          <div className="chart-slide">
            <div className="chart-info" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <span className="live-dot"></span>
              <h4 className="chart-name">Workflow Pulse • Live Delivery</h4>
            </div>
            <div className="pulse-grid">
              <div className="pulse-item group-hover-insight">
                <div className="pulse-label">Delivery Speed <span className="insight-tag">{metrics.leadTime}d</span></div>
                <div className="pulse-track">
                  <div className="pulse-fill velocity" style={{ width: `${Math.min(100, (1 / metrics.leadTime) * 100)}%` }}></div>
                </div>
              </div>
              <div className="pulse-item group-hover-insight">
                <div className="pulse-label">Code Quality <span className="insight-tag">{(qualityScore).toFixed(0)}%</span></div>
                <div className="pulse-track">
                  <div className="pulse-fill quality" style={{ width: `${qualityScore}%` }}></div>
                </div>
              </div>
              <div className="pulse-item group-hover-insight">
                <div className="pulse-label">Release Agility <span className="insight-tag">{metrics.deploymentFrequency || 0}x</span></div>
                <div className="pulse-track">
                  <div className="pulse-fill momentum" style={{ width: `${momentumScore}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        );
      case 1: // Delivery Line (Burn-up)
        const lineY = 70 - (velocityScore * 0.6);
        const totalUnits = Math.round(velocityScore * 0.4);
        const pointsArr = [
          { x: 10, y: 70, v: 'Start', val: 0 },
          { x: 50, y: 60, v: 'Planning', val: Math.round(totalUnits * 0.2) },
          { x: 90, y: lineY + 10, v: 'In Progress', val: Math.round(totalUnits * 0.4) },
          { x: 130, y: lineY, v: 'Review', val: Math.round(totalUnits * 0.6) },
          { x: 170, y: lineY - 10, v: 'Merged', val: Math.round(totalUnits * 0.8) },
          { x: 190, y: lineY - 20, v: 'Deployed', val: totalUnits }
        ];
        return (
          <div className="chart-slide">
            <div className="chart-info">
              <span className="chart-tag">Industry Std</span>
              <h4 className="chart-name">Delivery Burn-up</h4>
            </div>
            <div className="chart-content-wrapper">
              <svg viewBox="0 0 200 80" className="svg-chart" style={{ overflow: 'visible' }}>
                <path d={`M10,70 L50,60 L90,${lineY + 10} L130,${lineY} L170,${lineY - 10} L190,${lineY - 20}`} fill="none" stroke="#00f2ff" strokeWidth="2" strokeLinecap="round" className="path-anim" />
                <path d={`M10,70 L50,60 L90,${lineY + 10} L130,${lineY} L170,${lineY - 10} L190,${lineY - 20} L190,70 L10,70 Z`} fill="url(#grad-velocity)" opacity="0.2" />
                {pointsArr.map((p, i) => (
                  <g key={i} className="chart-point-group">
                    <circle cx={p.x} cy={p.y} r="3" fill="#00f2ff" className="chart-point" />
                    <foreignObject x={p.x - 40} y={p.y - 35} width="80" height="30" className="point-tooltip-wrapper">
                      <div className="point-tooltip">{p.v}: {p.val} pts</div>
                    </foreignObject>
                  </g>
                ))}
                <defs>
                  <linearGradient id="grad-velocity" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00f2ff" />
                    <stop offset="100%" stopColor="transparent" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>
        );
      case 2: // Contribution Flow Bars
        const baseHeight = Math.max(20, throughputScore);
        const barData = [
          { h: baseHeight * 0.7, v: Math.round(metrics.prThroughput * 0.8) },
          { h: baseHeight * 0.9, v: Math.round(metrics.prThroughput * 1.1) },
          { h: baseHeight, v: metrics.prThroughput },
          { h: baseHeight * 0.6, v: Math.round(metrics.prThroughput * 0.7) },
          { h: baseHeight * 0.8, v: Math.round(metrics.prThroughput * 0.9) }
        ];
        return (
          <div className="chart-slide">
            <div className="chart-info">
              <span className="chart-tag">Legacy Metric</span>
              <h4 className="chart-name">Contribution Flow</h4>
            </div>
            <div className="bar-chart-container">
              {barData.map((data, i) => (
                <div key={i} className="bar-item group-hover-insight">
                  <span className="bar-tooltip">{data.v} PRs</span>
                  <div className="bar-fill" style={{ height: `${data.h}%`, animationDelay: `${i * 0.1}s` }}></div>
                </div>
              ))}
            </div>
          </div>
        );
      case 3: // Stability Radar (UPGRADED SIZE)
        const center = 150;
        const maxRadius = 110;
        const radarMetrics = [
          { name: 'Delivery Speed', score: velocityScore, angle: -Math.PI / 2 },
          { name: 'Code Quality', score: qualityScore, angle: -Math.PI / 10 },
          { name: 'Contribution Flow', score: throughputScore, angle: Math.PI / 3.3 },
          { name: 'Dev Efficiency', score: cycleScore, angle: Math.PI / 1.1 },
          { name: 'Release Agility', score: momentumScore, angle: Math.PI * 1.3 }
        ];
        
        const radarPoints = radarMetrics.map(m => ({
          ...m,
          x: center + (m.score / 100) * maxRadius * Math.cos(m.angle),
          y: center + (m.score / 100) * maxRadius * Math.sin(m.angle)
        }));

        const pointsStr = radarPoints.map(p => `${p.x},${p.y}`).join(' ');

        return (
          <div className="chart-slide">
            <div className="chart-info">
              <span className="chart-tag">Process Health</span>
              <h4 className="chart-name">Stability Radar</h4>
            </div>
            <div className="radar-wrapper" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
              <svg viewBox="0 0 300 300" className="svg-chart radar" style={{ overflow: 'visible', width: '100%', height: 'auto', maxWidth: '280px' }}>
                {/* Background Web */}
                <circle cx={center} cy={center} r={maxRadius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                <circle cx={center} cy={center} r={maxRadius * 0.75} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                <circle cx={center} cy={center} r={maxRadius * 0.5} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                <circle cx={center} cy={center} r={maxRadius * 0.25} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                
                {radarMetrics.map((m, i) => {
                  const x2 = center + maxRadius * Math.cos(m.angle);
                  const y2 = center + maxRadius * Math.sin(m.angle);
                  return <line key={i} x1={center} y1={center} x2={x2} y2={y2} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />;
                })}

                {/* Data Polygon */}
                <polygon 
                  points={pointsStr} 
                  fill="rgba(255, 0, 204, 0.15)" 
                  stroke="#ff00cc" 
                  strokeWidth="2"
                  style={{ filter: 'drop-shadow(0 0 8px rgba(255, 0, 204, 0.4))' }}
                />

                {/* Points & Labels */}
                {radarPoints.map((p, i) => (
                  <g key={i} className="chart-point-group radar">
                    <circle cx={p.x} cy={p.y} r="4" fill="#ff00cc" className="chart-point" style={{ filter: 'drop-shadow(0 0 5px #ff00cc)' }} />
                    <text 
                        x={center + (maxRadius + 20) * Math.cos(p.angle)} 
                        y={center + (maxRadius + 20) * Math.sin(p.angle)}
                        fill="rgba(255,255,255,0.5)"
                        fontSize="10"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        style={{ fontWeight: 600, letterSpacing: '0.05em' }}
                    >
                        {p.name}
                    </text>
                    <foreignObject x={p.x - 40} y={p.y - 35} width="80" height="30" className="point-tooltip-wrapper">
                      <div className="point-tooltip radar">{p.name}: {p.score}%</div>
                    </foreignObject>
                  </g>
                ))}
              </svg>
            </div>
          </div>
        );
      default: return null;
    }
  };

  const handlePriorityMouseMove = (e) => {
    if (!priorityRef.current) return;
    const rect = priorityRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    priorityRef.current.style.setProperty('--mouse-x', `${x}%`);
    priorityRef.current.style.setProperty('--mouse-y', `${y}%`);
  };

  const getSeverityClass = (sev) => {
    if (sev === 'high') return 'sev-high';
    if (sev === 'medium') return 'sev-med';
    return 'sev-low';
  };

  return (
    <div className="insight-panel-v2">
      <div className="observations-column" style={{ animation: 'slideUp 0.8s ease-out backwards', animationDelay: '0.4s' }}>
        <h3 className="section-label">Critical Observations</h3>

        {topPriority && (
          <div 
            ref={priorityRef}
            className={`priority-card-premium ${getSeverityClass(topPriority.severity)}`}
            onMouseMove={handlePriorityMouseMove}
            style={{ cursor: 'pointer' }}
          >
            <div className="priority-badge">Top Priority</div>
            <div className="priority-content" style={{ display: 'flex', gap: '2rem', alignItems: 'center', width: '100%' }}>
              <div className="priority-icon-wrapper" style={{ fontSize: '3rem', filter: 'drop-shadow(0 0 10px var(--danger))' }}>
                🚨
              </div>
              <div className="priority-text">
                <h4 style={{ fontWeight: 800, fontSize: '1.4rem', marginBottom: '0.5rem', color: '#fff' }}>{topPriority.name}</h4>
                <p style={{ opacity: 0.8, fontSize: '0.95rem', color: '#fff' }}>
                  Critical friction point detected. This is currently the primary drag on your delivery velocity.
                </p>
                <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
                    <span className="priority-badge" style={{ position: 'static' }}>Priority Level: {topPriority.severity.toUpperCase()}</span>
                </div>
              </div>
            </div>
            {/* Gloss effect */}
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255, 255, 255, 0.08) 0%, transparent 60%)',
              pointerEvents: 'none'
            }}></div>
          </div>
        )}

        {others.length > 0 && (
          <div className="other-findings-list">
            <h5 className="sub-label">Other Findings</h5>
            {others.map((b, idx) => (
              <div key={b.id} className="finding-item-sleek" style={{ animation: 'slideUp 0.5s ease-out backwards', animationDelay: `${0.6 + (idx * 0.1)}s` }}>
                <span className={`status-dot ${getSeverityClass(b.severity)}`}></span>
                <span style={{ fontWeight: 500 }}>{b.name}</span>
              </div>
            ))}
          </div>
        )}

        <button className="ai-cta-button" onClick={onExplain} style={{ animation: 'slideUp 0.5s ease-out backwards', animationDelay: '0.9s' }}>
          <span className="sparkle-icon">✨</span>
          <span>Generate Executive Summary</span>
        </button>

        <div className="legacy-carousel-v2" style={{ animation: 'slideUp 0.8s ease-out backwards', animationDelay: '1.1s' }}>
          <div className="carousel-controls">
            <button className="pause-btn" onClick={() => setIsPaused(!isPaused)}>
              {isPaused ? '▶' : '||'}
            </button>
          </div>
          
          <div className="carousel-inner">
            {renderChart(currentSlide)}
          </div>

          {/* AI Executive Summary Section */}
          {(loading || explanation) && (
            <div className="explanation-content" style={{ marginTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem' }}>
              <h5 className="sub-label" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: 'var(--primary)' }}>✦</span> AI Executive Summary
              </h5>
              {loading ? (
                <div className="skeleton-insight-wrapper">
                  <div className="skeleton-text skeleton" style={{ width: '90%', marginBottom: '12px' }}></div>
                  <div className="skeleton-text skeleton" style={{ width: '100%', marginBottom: '12px' }}></div>
                  <div className="skeleton-text skeleton" style={{ width: '85%', marginBottom: '12px' }}></div>
                </div>
              ) : (
                <div className="ai-narrative-text" dangerouslySetInnerHTML={{ __html: explanation }} />
              )}
            </div>
          )}

          <div className="carousel-dots">
            {[0, 1, 2, 3].map(i => (
              <div key={i} className={`dot ${currentSlide === i ? 'active' : ''}`} onClick={() => setCurrentSlide(i)}></div>
            ))}
          </div>
        </div>
      </div>

      <div className="suggestions-column">
        <h3 className="section-label">Strategic Playbooks</h3>
        <div className="suggestions-grid-premium">
          {Object.entries(suggestions).map(([category, items], idx) => {
            const styleClass = 
              category.toLowerCase().includes('pr') ? 'pr-style' : 
              category.toLowerCase().includes('quality') ? 'quality-style' : 
              category.toLowerCase().includes('release') ? 'release-style' : 
              'contrib-style';
              
            return (
              <div 
                key={category} 
                className={`suggestion-card-hologram ${styleClass}`}
                style={{ animation: 'slideUp 0.6s ease-out backwards', animationDelay: `${0.5 + (idx * 0.15)}s` }}
              >
                <div className="card-header-row">
                  <span className="category-tag-v2">{category}</span>
                  <div className="card-icon-glass">
                    {category.includes('PR') ? '🌿' : 
                     category.includes('Quality') ? '🛡️' : 
                     category.includes('Release') ? '🚀' : '⚡'}
                  </div>
                </div>
                <ul className="suggestion-list-modern">
                  {items.map((item, i) => (
                    <li key={i}>
                      <div className="li-spark"></div>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default InsightPanel;
