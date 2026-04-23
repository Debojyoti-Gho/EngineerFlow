import React from 'react';

const ExplanationModal = ({ isOpen, onClose, content, loading }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-mask"></div>
        
        <div className="modal-content-wrapper">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
            <h2 className="modal-title">AI Insight Analysis</h2>
            <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', cursor: 'pointer', fontSize: '1.2rem', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s' }}>&times;</button>
          </div>
          
          <div style={{ minHeight: '300px' }}>
            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '300px', gap: '1.5rem' }}>
                <div className="ai-loader"></div>
                <p style={{ color: 'var(--text-muted)', fontSize: '1rem', fontWeight: 500, letterSpacing: '0.02em' }}>Synthesizing Intelligence Engine data...</p>
              </div>
            ) : (
              <div className="ai-content-body" dangerouslySetInnerHTML={{ __html: content }} />
            )}
          </div>
          
          {!loading && (
            <button 
              className="ai-cta-button" 
              style={{ marginTop: '3rem', maxWidth: '300px', marginInline: 'auto' }} 
              onClick={onClose}
            >
              <div className="ai-cta-button-mask"></div>
              <span>Dismiss Analysis</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExplanationModal;
