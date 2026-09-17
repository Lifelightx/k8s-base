import { useState } from 'react';
import { prioritizeTodos, applyPriorities } from '../services/api';
import './ReprioritizeModal.css';

export default function ReprioritizeModal({ todos, onClose, onApplied }) {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());

  const handleFetchSuggestions = async () => {
    setLoading(true);
    try {
      const activeTodos = todos.filter(t => !t.completed);
      const res = await prioritizeTodos(activeTodos);
      setSuggestions(res.suggestions || []);
      // Auto-select all by default
      setSelectedIds(new Set(res.suggestions.map(s => s.id)));
    } catch (err) {
      console.error(err);
      alert('Failed to fetch AI suggestions');
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (id) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleApply = async () => {
    const updates = suggestions
      .filter(s => selectedIds.has(s.id))
      .map(s => ({ id: s.id, priority: s.priority }));
    
    if (updates.length > 0) {
      await applyPriorities(updates);
      onApplied();
    }
    onClose();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content reprioritize-modal">
        <h2>✨ AI Smart Prioritization</h2>
        
        {suggestions.length === 0 ? (
          <div className="intro">
            <p>Let AI analyze your active tasks and suggest optimal priorities based on due dates and context.</p>
            <button className="btn-primary" onClick={handleFetchSuggestions} disabled={loading}>
              {loading ? 'Analyzing...' : 'Generate Suggestions'}
            </button>
            <button className="btn-secondary" onClick={onClose} style={{marginLeft: '1rem'}}>Cancel</button>
          </div>
        ) : (
          <div className="suggestions-list">
            <table>
              <thead>
                <tr>
                  <th>Apply</th>
                  <th>Task</th>
                  <th>Current</th>
                  <th>Suggested</th>
                  <th>Reason</th>
                </tr>
              </thead>
              <tbody>
                {suggestions.map(s => {
                  const orig = todos.find(t => t._id === s.id);
                  return (
                    <tr key={s.id}>
                      <td>
                        <input 
                          type="checkbox" 
                          checked={selectedIds.has(s.id)}
                          onChange={() => toggleSelect(s.id)}
                        />
                      </td>
                      <td>{orig?.text || 'Unknown'}</td>
                      <td><span className={`badge prio-${orig?.priority}`}>{orig?.priority}</span></td>
                      <td><span className={`badge prio-${s.priority}`}>{s.priority}</span></td>
                      <td className="reason">{s.reason}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            
            <div className="actions">
              <button className="btn-secondary" onClick={onClose}>Cancel</button>
              <button className="btn-primary" onClick={handleApply}>
                Apply Selected ({selectedIds.size})
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
