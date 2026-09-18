import { useState } from 'react';
import { prioritizeTodos, applyPriorities } from '../services/api';

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

  const priorityBadgeClass = (p) => {
    if (p === 'high')   return 'text-[#e05252] border border-[#e05252] bg-[rgba(224,82,82,0.12)]';
    if (p === 'medium') return 'text-[#d97706] border border-[#d97706] bg-[rgba(217,119,6,0.12)]';
    return 'text-[#2ecc71] border border-[#2ecc71] bg-[rgba(46,204,113,0.12)]';
  };

  return (
    <div className="fixed inset-0 bg-bg/70 backdrop-blur-md flex items-center justify-center z-[1000] animate-[fade-in_0.3s_ease]">
      <div className="bg-surface border border-border2 rounded-[24px] w-full max-w-[850px] max-h-[90vh] overflow-y-auto p-10 shadow-[0_24px_64px_rgba(0,0,0,0.5)] animate-[scale-up_0.4s_cubic-bezier(0.16,1,0.3,1)_both] relative mx-4">
        <h2 className="text-[1.85rem] font-extrabold mb-7 flex items-center gap-3 bg-gradient-to-r from-[#ff7675] via-[#e74c3c] to-[#f59e0b] bg-clip-text text-transparent">
          ✨ AI Smart Prioritization
        </h2>

        {suggestions.length === 0 ? (
          <div className="text-center py-16 px-8 bg-surface2 rounded-2xl border border-dashed border-border2 flex flex-col items-center gap-6">
            <p className="text-lg text-text2 leading-relaxed max-w-md">
              Let AI analyze your active tasks and suggest optimal priorities based on due dates and context.
            </p>
            <div className="flex gap-4">
              <button
                className="inline-flex items-center justify-center gap-1.5 rounded-lg font-semibold cursor-pointer border border-transparent text-sm px-5 py-2.5 transition-all duration-200 bg-accent text-[#0a1a10] border-accent shadow-[0_4px_12px_rgba(231,76,60,0.3)] hover:-translate-y-0.5 hover:bg-accent2 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleFetchSuggestions}
                disabled={loading}
              >
                {loading ? 'Analyzing...' : 'Generate Suggestions'}
              </button>
              <button
                className="inline-flex items-center justify-center gap-1.5 rounded-lg font-semibold cursor-pointer text-sm px-5 py-2.5 transition-all duration-200 bg-surface2 text-text border border-border2 hover:bg-surface3 hover:-translate-y-0.5"
                onClick={onClose}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="overflow-x-auto mb-8">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr>
                    {['Apply','Task','Current','Suggested','Reason'].map(h => (
                      <th key={h} className="py-5 px-4 text-[0.85rem] font-bold text-text3 uppercase tracking-wider border-b-2 border-border2">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {suggestions.map(s => {
                    const orig = todos.find(t => t._id === s.id);
                    return (
                      <tr key={s.id} className="hover:bg-surface2 transition-colors duration-150">
                        <td className="py-5 px-4 border-b border-border">
                          <input
                            type="checkbox"
                            checked={selectedIds.has(s.id)}
                            onChange={() => toggleSelect(s.id)}
                            className="w-5 h-5 rounded-md cursor-pointer accent-accent"
                          />
                        </td>
                        <td className="py-5 px-4 text-text border-b border-border text-sm">{orig?.text || 'Unknown'}</td>
                        <td className="py-5 px-4 border-b border-border">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${priorityBadgeClass(orig?.priority)}`}>
                            {orig?.priority}
                          </span>
                        </td>
                        <td className="py-5 px-4 border-b border-border">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${priorityBadgeClass(s.priority)}`}>
                            {s.priority}
                          </span>
                        </td>
                        <td className="py-5 px-4 border-b border-border text-text2 text-sm leading-relaxed max-w-xs">{s.reason}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end gap-4 pt-6 border-t border-border2">
              <button
                className="inline-flex items-center justify-center gap-1.5 rounded-lg font-semibold cursor-pointer text-sm px-5 py-2.5 transition-all duration-200 bg-surface2 text-text border border-border2 hover:bg-surface3 hover:-translate-y-0.5"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                className="inline-flex items-center justify-center gap-1.5 rounded-lg font-semibold cursor-pointer border border-transparent text-sm px-5 py-2.5 transition-all duration-200 bg-accent text-[#0a1a10] border-accent shadow-[0_4px_12px_rgba(231,76,60,0.3)] hover:-translate-y-0.5 hover:bg-accent2"
                onClick={handleApply}
              >
                Apply Selected ({selectedIds.size})
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
