import React, { useState, useEffect } from 'react';
import { getDevelopers, getAnalysis, postExplain } from './services/api';
import MetricCard from './components/MetricCard';
import InsightPanel from './components/InsightPanel';
import ExplanationModal from './components/ExplanationModal';
import AIChat from './components/AIChat';
import CosmicBackground from './components/CosmicBackground';
import DevSelector from './components/DevSelector';
import ManagerView from './components/ManagerView';
import DataExplorer from './components/DataExplorer';

// Context mapping for interview-ready terminology
const METRIC_DETAILS = {
  leadTime: { sub: "Delivery Speed", unit: "d" },
  cycleTime: { sub: "Dev Efficiency", unit: "d" },
  bugRate: { sub: "Code Quality", unit: "%" },
  deploymentFrequency: { sub: "Release Agility", unit: "/mo" },
  prThroughput: { sub: "Contribution Flow", unit: " PRs/mo" }
};

function App() {
  const [devs, setDevs] = useState([]);
  const [selectedDev, setSelectedDev] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [explanation, setExplanation] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [view, setView] = useState('ic'); // 'ic' or 'manager'
  const [showExplorer, setShowExplorer] = useState(false);

  useEffect(() => {
    getDevelopers().then(d => {
      setDevs(d);
      if (d.length > 0) setSelectedDev(d[0].id);
    });
  }, []);

  useEffect(() => {
    if (selectedDev) {
      setLoading(true);
      getAnalysis(selectedDev).then(res => {
        setData(res);
        setLoading(false);
      });
    }
  }, [selectedDev]);

  const handleExplain = async () => {
    setModalOpen(true);
    setAiLoading(true);
    const res = await postExplain(data);
    setExplanation(res.explanation);
    setAiLoading(false);
  };

  const getHealthMeta = () => {
    if (!data) return { score: 0, status: "Unknown", class: "healthy" };
    const penalty = data.bottlenecks.reduce((acc, b) => acc + (b.severity === 'high' ? 25 : 10), 0);
    const score = Math.max(0, 100 - penalty);
    if (score < 40) return { score, status: "Critical", class: "critical", msg: "Immediate process intervention required" };
    if (score < 75) return { score, status: "Warning", class: "warning", msg: "Workflow degradation detected" };
    return { score, status: "Healthy", class: "healthy", msg: "System flow is within optimal parameters" };
  };

  // Removed the basic loading text fallback to use skeletal loading instead
  // if (loading && !data) return <div className="dashboard-container" style={{ textAlign: 'center', marginTop: '10rem', color: 'var(--text-muted)' }}>Initializing Insight Engine...</div>;

  const health = getHealthMeta();

  return (
    <div className="app-root">
      <CosmicBackground />
      <nav className="top-bar">
        <div className="nav-content">
        <div className="nav-brand-slot">
          <div className="app-brand-premium" onClick={() => setView('ic')} style={{ cursor: 'pointer' }}>
            <div className="brand-logo-wrapper">
              <div className="logo-core">
                <span className="logo-spark">✦</span>
              </div>
              <div className="logo-orbit"></div>
            </div>
            <div className="brand-text">
              <h1>ENGINEER<span>FLOW</span></h1>
              <div className="brand-badge-row">
                <p>Productivity Intelligence Dashboard</p>
                <span className="ai-badge">V2.0 Core</span>
              </div>
            </div>
          </div>
        </div>

        <div className="nav-grid-alignment">
          <div className="nav-actions">
            <div className="view-toggle">
                <button className={`toggle-btn ${view === 'ic' ? 'active' : ''}`} onClick={() => setView('ic')}>IC View</button>
                <button className={`toggle-btn ${view === 'manager' ? 'active' : ''}`} onClick={() => setView('manager')}>Manager View</button>
            </div>
            {view === 'ic' && (
                <DevSelector 
                    devs={devs} 
                    selectedDevId={selectedDev} 
                    onSelect={setSelectedDev} 
                />
            )}
          </div>
        </div>

        <div className="nav-button-slot">
          <button className="data-source-btn-premium" onClick={() => setShowExplorer(true)}>
            <span className="btn-icon">📁</span>
            <span className="btn-text">Data Source</span>
          </button>
        </div>
        </div>
      </nav>

      <main className="dashboard-container">
        {view === 'manager' ? (
          <ManagerView devs={devs} />
        ) : (
          <>
            {loading ? (
              <>
                <section className="hero-health skeleton-card" style={{ height: '100px', marginBottom: '2rem' }}>
                  <div className="skeleton-text skeleton" style={{ width: '200px' }}></div>
                </section>
                <section className="metrics-grid">
                  {[1, 2, 3, 4, 5].map(i => <MetricCard key={i} loading={true} />)}
                </section>
                <div className="skeleton skeleton-insight"></div>
              </>
            ) : data && (
              <>
                <section className={`hero-health ${health.class}`}>
                  <div>
                    <div className="health-val">{health.score}%</div>
                    <div style={{ textTransform: 'uppercase', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.1em' }}>Aggregate Signal • {health.score}% {health.status}</div>
                  </div>
                  <div style={{ textAlign: 'right', maxWidth: '400px' }}>
                    <div style={{ fontSize: '1.1rem', fontWeight: 500, marginBottom: '0.5rem' }}>{health.msg}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Methodology: Deterministic Logic + LLM Narrative Synthesis</div>
                  </div>
                </section>

                <section className="metrics-grid">
                  <MetricCard index={0} label="Delivery Speed" value={data.metrics.leadTime} unit="d" status={data.metrics.leadTime > 4 ? 'bad' : 'good'} subtitle="Lead Time: PR Opened → Prod" trend="down" />
                  <MetricCard index={1} label="Dev Efficiency" value={data.metrics.cycleTime} unit="d" status={data.metrics.cycleTime > 3 ? 'bad' : 'good'} subtitle="Cycle Time: In Progress → Done" trend="up" />
                  <MetricCard index={2} label="Code Quality" value={(data.metrics.bugRate * 100).toFixed(0)} unit="%" status={data.metrics.bugRate > 0.3 ? 'bad' : 'good'} subtitle="Bug Rate: Escaped Bugs" trend="up" />
                  <MetricCard index={3} label="Release Agility" value={data.metrics.deploymentFrequency} unit="/mo" status={data.metrics.deploymentFrequency < 5 ? 'bad' : 'good'} subtitle="Deployment Frequency" trend="down" />
                  <MetricCard index={4} label="Contribution Flow" value={data.metrics.prThroughput} unit=" PRs/mo" status={data.metrics.prThroughput < 5 ? 'bad' : 'good'} subtitle="PR Throughput" trend="up" />
                </section>

                <InsightPanel
                  metrics={data.metrics}
                  bottlenecks={data.bottlenecks}
                  suggestions={data.suggestions}
                  onExplain={handleExplain}
                  loading={aiLoading}
                  explanation={explanation}
                />
              </>
            )}
          </>
        )}
      </main>

      <ExplanationModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        content={explanation}
        loading={aiLoading}
      />

      {data && view === 'ic' && (
        <AIChat 
          metrics={data.metrics} 
          bottlenecks={data.bottlenecks}
          suggestions={data.suggestions}
        />
      )}

      {showExplorer && (
        <DataExplorer 
          devId={selectedDev} 
          onClose={() => setShowExplorer(false)} 
        />
      )}
    </div>
  );
}

export default App;
