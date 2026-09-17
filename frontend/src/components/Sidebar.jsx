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
    <div className="w-64 bg-gray-50 border-r border-gray-200 h-[calc(100vh-4rem)] p-4 flex flex-col hidden md:flex">
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Workspaces</h2>
      
      <ul className="space-y-1 flex-1 overflow-y-auto">
        <li>
          <button
            onClick={() => setActiveProjectId('inbox')}
            className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeProjectId === 'inbox' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-gray-100'}`}
          >
            <span className="mr-2">📥</span> Inbox
          </button>
        </li>
        
        {projects.map(p => (
          <li key={p._id} className="group relative flex items-center justify-between">
            <button
              onClick={() => setActiveProjectId(p._id)}
              className={`flex-1 flex items-center text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeProjectId === p._id ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-gray-100'}`}
            >
              <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: p.color }}></span>
              <span className="truncate">{p.name}</span>
            </button>
            <button 
              onClick={(e) => handleDelete(p._id, e)}
              className="absolute right-2 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500"
            >
              &times;
            </button>
          </li>
        ))}
      </ul>

      <div className="mt-4 pt-4 border-t border-gray-200">
        {!isCreating ? (
          <button
            onClick={() => setIsCreating(true)}
            className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            + New Project
          </button>
        ) : (
          <form onSubmit={handleCreate} className="space-y-2">
            <input
              type="text"
              autoFocus
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              placeholder="Project name..."
              className="w-full text-sm border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
            <div className="flex space-x-2">
              <input 
                type="color" 
                value={newProjectColor} 
                onChange={(e) => setNewProjectColor(e.target.value)}
                className="h-8 w-8 rounded cursor-pointer"
              />
              <button type="submit" className="flex-1 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700">
                Add
              </button>
              <button type="button" onClick={() => setIsCreating(false)} className="flex-1 bg-gray-200 text-gray-700 text-sm rounded-md hover:bg-gray-300">
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
