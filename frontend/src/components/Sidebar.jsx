import React, { useState } from 'react';
import * as api from '../services/api';

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
    <div className="hidden md:flex flex-col w-[260px] h-screen bg-bg2 border-r border-border p-8 py-8 px-6">
      <h2 className="text-xs font-bold text-text3 uppercase tracking-widest mt-0 mb-5">Workspaces</h2>
      
      <ul className="list-none p-0 m-0 flex-1 overflow-y-auto">
        <li className="mb-1">
          <button
            onClick={() => setActiveProjectId('inbox')}
            className={`flex items-center w-full text-left py-2 px-3 rounded-md text-sm font-medium transition-all duration-200 outline-none ${
              activeProjectId === 'inbox' 
                ? 'bg-surface2 border border-border2 text-text shadow-sm' 
                : 'text-text2 hover:bg-surface hover:text-text border border-transparent'
            }`}
          >
            <span className="mr-2 text-lg">📥</span> Inbox
          </button>
        </li>
        
        {projects.map(p => (
          <li key={p._id} className="relative group mb-1">
            <button
              onClick={() => setActiveProjectId(p._id)}
              className={`flex items-center w-full text-left py-2 px-3 rounded-md text-sm font-medium transition-all duration-200 outline-none ${
                activeProjectId === p._id 
                  ? 'bg-surface2 border border-border2 text-text shadow-sm' 
                  : 'text-text2 hover:bg-surface hover:text-text border border-transparent'
              }`}
            >
              <span 
                className="w-2.5 h-2.5 rounded-full mr-3 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.2)]" 
                style={{ backgroundColor: p.color }}
              ></span>
              <span className="flex-1 whitespace-nowrap overflow-hidden text-ellipsis">{p.name}</span>
            </button>
            <button 
              onClick={(e) => handleDelete(p._id, e)}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-surface3 border border-border rounded text-text3 text-lg leading-none w-6 h-6 flex items-center justify-center cursor-pointer opacity-0 transition-all duration-200 group-hover:opacity-100 hover:text-red hover:border-red hover:bg-redBg"
              title="Delete Project"
            >
              &times;
            </button>
          </li>
        ))}
      </ul>

      <div className="mt-6 pt-6 border-t border-border">
        {!isCreating ? (
          <button
            onClick={() => setIsCreating(true)}
            className="w-full p-3 bg-transparent border border-dashed border-border2 rounded-md text-text2 text-sm font-medium cursor-pointer transition-all duration-200 hover:bg-surface hover:border-accent hover:text-accent"
          >
            + New Project
          </button>
        ) : (
          <form onSubmit={handleCreate} className="flex flex-col gap-3 bg-surface p-4 rounded-md border border-border">
            <input
              type="text"
              autoFocus
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              placeholder="Project name..."
              className="w-full py-2 px-3 bg-bg text-text border border-border2 rounded-md text-sm outline-none transition-colors duration-200 focus:border-accent"
            />
            <div className="flex gap-2 items-center">
              <input 
                type="color" 
                value={newProjectColor} 
                onChange={(e) => setNewProjectColor(e.target.value)}
                className="w-9 h-9 p-0 border-none rounded-md cursor-pointer bg-transparent"
              />
              <button type="submit" className="flex-1 btn-primary py-1.5 px-3">
                Add
              </button>
              <button type="button" onClick={() => setIsCreating(false)} className="flex-1 btn-secondary py-1.5 px-3">
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
