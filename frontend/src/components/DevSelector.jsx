import React, { useState, useRef, useEffect } from 'react';

const DevSelector = ({ devs, selectedDevId, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [rankedIds, setRankedIds] = useState([]);
  const dropdownRef = useRef(null);

  const selectedDev = devs.find(d => d.id === selectedDevId);

  useEffect(() => {
    const fetchSearch = async () => {
      if (search.length > 3) {
        setIsAnalyzing(true);
        try {
          const response = await fetch('http://localhost:5001/api/search-developers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: search })
          });
          const data = await response.json();
          setRankedIds(data.rankedIds);
        } catch (error) {
          console.error("Search failed", error);
        } finally {
          setIsAnalyzing(false);
        }
      } else {
        setRankedIds([]);
        setIsAnalyzing(false);
      }
    };

    const timer = setTimeout(fetchSearch, 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredDevs = search.length > 0 
    ? (rankedIds.length > 0 
        ? rankedIds.map(id => devs.find(d => d.id === id)).filter(Boolean)
        : devs.filter(d => 
            d.name.toLowerCase().includes(search.toLowerCase()) || 
            d.role.toLowerCase().includes(search.toLowerCase())
          )
      )
    : devs;

  return (
    <div className="dev-selector-container" ref={dropdownRef}>
      <div 
        className={`dev-selector-trigger ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="trigger-info">
          <span className="trigger-label">Deterministic Engine / Active Engineer</span>
          <span className="trigger-value">{selectedDev?.name || 'Select Engineer'}</span>
        </div>
        <div className="trigger-icon">{isOpen ? '▲' : '▼'}</div>
      </div>

      {isOpen && (
        <div className="dev-selector-dropdown">
          <div className="dropdown-search-wrapper">
            <span className={`search-ai-icon ${isAnalyzing ? 'pulse' : ''}`}>🔍</span>
            <input 
              type="text" 
              placeholder="Search by name or metric (e.g. 'High Lead Time')..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
            {isAnalyzing && <span className="ai-status">Filtering...</span>}
          </div>
          
          <div className="dropdown-list scrollbar-hidden">
            {filteredDevs.length > 0 ? (
              filteredDevs.map(d => (
                <div 
                  key={d.id} 
                  className={`dropdown-item ${d.id === selectedDevId ? 'selected' : ''}`}
                  onClick={() => {
                    onSelect(d.id);
                    setIsOpen(false);
                    setSearch('');
                  }}
                >
                  <div className="item-avatar">{d.name[0]}</div>
                  <div className="item-meta">
                    <span className="item-name">{d.name}</span>
                    <span className="item-role">{d.role}</span>
                  </div>
                  {d.id === selectedDevId && <span className="check-mark">✓</span>}
                </div>
              ))
            ) : (
              <div className="no-results">No matches found.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DevSelector;
