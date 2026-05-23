import React, { useState, useEffect } from 'react';

const DataExplorer = ({ devId, onClose }) => {
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState('prs');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:5001/api/raw-data/${devId}`);
        const json = await res.json();
        setData(json);
      } catch (e) {
        console.error("Failed to fetch raw data", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [devId]);

  if (loading) return <div className="data-explorer-overlay"><div className="data-explorer-loading">Decrypting Fact Tables...</div></div>;
  if (!data) return <div className="data-explorer-overlay" onClick={onClose}><div className="data-explorer-content"><div className="no-data-msg">Failed to load raw data. Ensure backend is running.</div></div></div>;

  const tabs = [
    { id: 'prs', label: 'Pull Requests', count: data?.prs?.length || 0 },
    { id: 'deploys', label: 'Deployments', count: data?.deploys?.length || 0 },
    { id: 'issues', label: 'Jira Issues', count: data?.issues?.length || 0 },
    { id: 'bugs', label: 'Bug Reports', count: data?.bugs?.length || 0 },
  ];

  const renderTable = () => {
    if (!data) return null;
    const rows = data[activeTab] || [];
    if (rows.length === 0) return <div className="no-data-msg">No records found for this developer in the {activeTab} table.</div>;

    switch (activeTab) {
      case 'prs':
        return (
          <table className="explorer-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Status</th>
                <th>Opened At</th>
                <th>Merged At</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.id}>
                  <td><code>{r.id}</code></td>
                  <td>{r.title || 'Untitled PR'}</td>
                  <td><span className={`badge ${r.status.toLowerCase()}`}>{r.status}</span></td>
                  <td>{new Date(r.opened_at).toLocaleDateString()}</td>
                  <td>{r.deployedAt ? new Date(r.deployedAt).toLocaleDateString() : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        );
      case 'deploys':
        return (
          <table className="explorer-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Environment</th>
                <th>Status</th>
                <th>Completed At</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.id}>
                  <td><code>{r.id}</code></td>
                  <td>{r.environment || 'Production'}</td>
                  <td><span className="badge success">{r.status || 'Success'}</span></td>
                  <td>{new Date(r.completed_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        );
      case 'issues':
        return (
          <table className="explorer-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Type</th>
                <th>Status</th>
                <th>In Progress</th>
                <th>Completed</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.id}>
                  <td><code>{r.id}</code></td>
                  <td>{r.type}</td>
                  <td><span className="badge">{r.status}</span></td>
                  <td>{new Date(r.in_progress_at).toLocaleDateString()}</td>
                  <td>{r.done_at ? new Date(r.done_at).toLocaleDateString() : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        );
      case 'bugs':
        return (
          <table className="explorer-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Severity</th>
                <th>Reported At</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.id}>
                  <td><code>{r.id}</code></td>
                  <td><span className={`badge ${r.severity.toLowerCase()}`}>{r.severity}</span></td>
                  <td>{new Date(r.reportedAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        );
      default:
        return null;
    }
  };

  return (
    <div className="data-explorer-overlay" onClick={onClose}>
      <div className="data-explorer-content" onClick={e => e.stopPropagation()}>
        <div className="explorer-header">
          <div>
            <h2 className="explorer-title">Raw Fact Tables</h2>
            <p className="explorer-subtitle">Transparent view of the data feeding this developer profile</p>
          </div>
          <button className="close-explorer" onClick={onClose}>&times;</button>
        </div>

        <div className="explorer-tabs">
          {tabs.map(t => (
            <button 
              key={t.id} 
              className={`tab-btn ${activeTab === t.id ? 'active' : ''}`}
              onClick={() => setActiveTab(t.id)}
            >
              {t.label} <span className="tab-count">{t.count}</span>
            </button>
          ))}
        </div>

        <div className="table-container-explorer">
          {renderTable()}
        </div>

        <div className="explorer-footer">
          <span className="footer-label">MANDATORY DATA TABLES (SRS COMPLIANT)</span>
        </div>
      </div>
    </div>
  );
};

export default DataExplorer;
