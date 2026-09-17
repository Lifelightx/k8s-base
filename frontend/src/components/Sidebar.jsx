import React, { useState } from 'react';
import * as api from '../services/api';
import './Sidebar.css';

function Sidebar({ projects, activeProjectId, setActiveProjectId, setProjects }) {
  const [isCreating, setIsCreating] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectColor, setNewProjectColor] = useState('#6366f1');

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;
    
    try {
      const p = await api.createProject(newProjectName, newProjectColor);
      setProjects([...projects, p]);
      setIsCreating(false);
      setNewProjectName('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this project? Todos will be moved to Inbox.')) return;
    try {
      await api.deleteProject(id);
      setProjects(projects.filter(p => p._id !== id));
      if (activeProjectId === id) setActiveProjectId('inbox');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="sidebar">
      <h2>Workspaces</h2>
      
      <ul className="sidebar-nav">
        <li>
          <button
            onClick={() => setActiveProjectId('inbox')}
            className={`sidebar-link ${activeProjectId === 'inbox' ? 'active' : ''}`}
          >
            <span className="icon">📥</span> Inbox
          </button>
        </li>
        
        {projects.map(p => (
          <li key={p._id} className="project-item">
            <button
              onClick={() => setActiveProjectId(p._id)}
              className={`sidebar-link ${activeProjectId === p._id ? 'active' : ''}`}
            >
              <span className="color-dot" style={{ backgroundColor: p.color }}></span>
              <span className="project-name">{p.name}</span>
            </button>
            <button 
              onClick={(e) => handleDelete(p._id, e)}
              className="btn-delete-project"
              title="Delete Project"
            >
              &times;
            </button>
          </li>
        ))}
      </ul>

      <div className="sidebar-footer">
        {!isCreating ? (
          <button
            onClick={() => setIsCreating(true)}
            className="btn-new-project"
          >
            + New Project
          </button>
        ) : (
          <form onSubmit={handleCreate} className="new-project-form">
            <input
              type="text"
              autoFocus
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              placeholder="Project name..."
              className="new-project-input"
            />
            <div className="new-project-actions">
              <input 
                type="color" 
                value={newProjectColor} 
                onChange={(e) => setNewProjectColor(e.target.value)}
                className="color-picker"
              />
              <button type="submit" className="btn-primary" style={{flex: 1, padding: '0.4rem'}}>
                Add
              </button>
              <button type="button" onClick={() => setIsCreating(false)} className="btn-secondary" style={{flex: 1, padding: '0.4rem'}}>
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default Sidebar;
