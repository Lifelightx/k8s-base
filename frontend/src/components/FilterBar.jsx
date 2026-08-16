import { useState } from 'react';

const FILTERS = ['All', 'Active', 'Done'];

export default function FilterBar({ current, onChange }) {
  return (
    <div className="filter-bar" role="group" aria-label="Filter todos">
      {FILTERS.map((f) => (
        <button
          key={f}
          id={`filter-${f.toLowerCase()}`}
          className={current === f ? 'active' : ''}
          onClick={() => onChange(f)}
        >
          {f}
        </button>
      ))}
    </div>
  );
}
