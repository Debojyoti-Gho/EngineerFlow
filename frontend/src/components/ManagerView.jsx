import React, { useState, useEffect } from 'react';
import { getAnalysis } from '../services/api';
import ManagerAIChat from './ManagerAIChat';

const ManagerView = ({ devs }) => {
  const [teamData, setTeamData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchAll = async () => {
      const results = await Promise.all(devs.map(d => getAnalysis(d.id).then(res => ({ ...res, name: d.name, role: d.role }))));
      setTeamData(results);
      setLoading(false);
    };
    fetchAll();
  }, [devs]);

  const calculateHealth = (metrics) => {
    let score = 100;
    if (metrics.leadTime > 4) score -= 20;
    if (metrics.bugRate > 0.2) score -= 20;
    if (metrics.deploymentFrequency < 3) score -= 15;
    return Math.max(0, score);
  };

  const filteredTeamData = teamData.filter(dev => 
    dev.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="manager-skeleton-container">
      <div className="skeleton-row skeleton"></div>
      {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
        <div key={i} className="skeleton-row">
          <div className="skeleton-avatar skeleton"></div>
          <div className="skeleton-text skeleton"></div>
          <div className="skeleton-text short skeleton"></div>
          <div className="skeleton-text short skeleton"></div>
          <div className="skeleton-text short skeleton"></div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="manager-view-v2">
      <div className="manager-hero-section">
        <div className="manager-title-group">
          <h2 className="manager-v2-title">Team Intelligence</h2>
          <p className="manager-v2-subtitle">Deterministic aggregation of fleet performance metrics</p>
        </div>
        
        <div className="manager-actions-row">
          <div className="manager-search-v2-wrapper">
            <div className="search-v2-inner">
              <span className="search-icon-v2">✦</span>
              <input 
                type="text" 
                placeholder="Filter by engineer name..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="search-focus-glow"></div>
            </div>
          </div>
          <ManagerAIChat teamData={teamData} />
        </div>
      </div>

      <div className="manager-grid-premium">
        <div className="manager-table-header">
          <div className="col-dev">Engineer</div>
          <div className="col-metric">Delivery Speed</div>
          <div className="col-metric">Dev Efficiency</div>
          <div className="col-metric">Code Quality</div>
          <div className="col-metric">Release Agility</div>
          <div className="col-metric">Contribution</div>
          <div className="col-health">Flow Index</div>
        </div>
        
        <div className="manager-rows-container">
          {filteredTeamData.length > 0 ? filteredTeamData.map((dev, idx) => {
            const health = calculateHealth(dev.metrics);
            const healthClass = health > 80 ? 'optimal' : health > 50 ? 'warning' : 'critical';
            
            return (
              <div key={idx} className="manager-row-v2" style={{ animationDelay: `${idx * 0.05}s` }}>
                <div className="col-dev">
                  <div className="dev-info-v2">
                    <div className="dev-avatar-v2">{dev.name[0]}</div>
                    <div>
                      <div className="dev-name-v2">{dev.name}</div>
                      <div className="dev-role-v2">Senior Engineer</div>
                    </div>
                  </div>
                </div>
                <div className="col-metric">
                  <div className={`metric-bubble ${dev.metrics.leadTime > 4 ? 'bad' : 'good'}`}>
                    {dev.metrics.leadTime}d
                  </div>
                </div>
                <div className="col-metric">
                  <div className="metric-bubble neutral">
                    {dev.metrics.cycleTime}d
                  </div>
                </div>
                <div className="col-metric">
                  <div className={`metric-bubble ${dev.metrics.bugRate > 0.2 ? 'bad' : 'good'}`}>
                    {(dev.metrics.bugRate * 100).toFixed(0)}%
                  </div>
                </div>
                <div className="col-metric">
                  <div className="metric-bubble neutral">
                    {dev.metrics.deploymentFrequency}x
                  </div>
                </div>
                <div className="col-metric">
                  <div className="metric-bubble neutral">
                    {dev.metrics.prThroughput}
                  </div>
                </div>
                <div className="col-health">
                  <div className={`health-index-v2 ${healthClass}`}>
                    <div className="index-bar-bg">
                      <div className="index-bar-fill" style={{ width: `${health}%` }}></div>
                    </div>
                    <span className="index-val">{health}%</span>
                  </div>
                </div>
              </div>
            );
          }) : (
            <div className="manager-empty-state">
              <div className="empty-icon">📁</div>
              <p>No engineers matching "{searchTerm}" in the current fact tables.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManagerView;
