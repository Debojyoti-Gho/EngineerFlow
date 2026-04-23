import React, { useRef } from 'react';

const MetricCard = ({ label, value, status, unit, subtitle, trend, index = 0, loading = false }) => {
  const cardRef = useRef(null);

  if (loading) {
    return (
      <div className="metric-card skeleton-card">
        <div className="skeleton-text skeleton" style={{ width: '40%', marginBottom: '1rem' }}></div>
        <div className="skeleton-text skeleton" style={{ width: '70%', marginBottom: '1rem' }}></div>
        <div className="skeleton-text skeleton" style={{ height: '3rem', width: '50%' }}></div>
      </div>
    );
  }

  const isPositiveTrend = trend === 'down' ? (label.includes('Time') || label.includes('Rate')) : true;

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    cardRef.current.style.setProperty('--mouse-x', `${x}%`);
    cardRef.current.style.setProperty('--mouse-y', `${y}%`);
  };

  const getStatusClass = () => {
    if (status === 'bad') return 'alert';
    if (status === 'medium') return 'warning-status';
    return 'good-status';
  };

  const getStatusColor = () => {
    if (status === 'bad') return 'rgba(244, 63, 94, 0.15)';
    if (status === 'medium') return 'rgba(245, 158, 11, 0.15)';
    return 'rgba(16, 185, 129, 0.15)';
  };

  return (
    <div 
      ref={cardRef}
      className={`metric-card ${getStatusClass()}`}
      onMouseMove={handleMouseMove}
      style={{ 
        animationDelay: `${index * 0.1}s`,
        '--glow-color': getStatusColor()
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 1, marginBottom: '0.75rem' }}>
        <div style={{ fontSize: '0.85rem', color: '#fff', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.8 }}>{label}</div>
        <div className="trend-indicator" style={{
          color: status === 'good' ? '#10b981' : (status === 'bad' ? '#f43f5e' : '#f59e0b'),
          fontSize: '0.75rem',
          background: status === 'good' ? 'rgba(16, 185, 129, 0.1)' : (status === 'bad' ? 'rgba(244, 63, 94, 0.1)' : 'rgba(245, 158, 11, 0.1)'),
          padding: '4px 12px',
          borderRadius: '99px',
          fontWeight: 800,
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          border: `1px solid ${status === 'good' ? 'rgba(16, 185, 129, 0.15)' : (status === 'bad' ? 'rgba(244, 63, 94, 0.15)' : 'rgba(245, 158, 11, 0.15)')}`
        }}>
          {trend === 'up' ? '↗' : '↘'}
          <span style={{ fontSize: '0.7rem', letterSpacing: '0.05em' }}>{status === 'good' ? 'OPTIMAL' : (status === 'bad' ? 'RISK' : 'WARNING')}</span>
        </div>
      </div>
      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.25rem', fontWeight: 500, opacity: 0.7 }}>
        {subtitle}
      </div>
      <div style={{ fontSize: '3rem', fontWeight: 800, margin: '0', letterSpacing: '-0.03em', position: 'relative', zIndex: 1, color: '#fff' }}>
        {value}<span style={{ fontSize: '1.1rem', fontWeight: '500', opacity: 0.4, marginLeft: '6px', letterSpacing: '0' }}>{unit}</span>
      </div>
      
      {/* Subtle Noise Overlay for Texture */}
      <div style={{ 
        position: 'absolute', 
        inset: 0, 
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        opacity: 0.02,
        pointerEvents: 'none',
        zIndex: 0
      }}></div>
    </div>
  );
};

export default MetricCard;
