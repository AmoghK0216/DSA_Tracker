import React from 'react';
import { Eye, Flag } from 'lucide-react';

const ViewTabs = ({ activeView, onViewChange, totalSolved, reviewCount, trickyCount }) => {
  const tabs = [
    { id: 'today', label: "Today's Problems", shortcut: 'Alt+1' },
    { id: 'history', label: `Solved Problems (${totalSolved})`, shortcut: 'Alt+2' },
    { 
      id: 'review', 
      label: `Review (${reviewCount})`,
      icon: Eye,
      shortcut: 'Alt+3'
    },
    { 
      id: 'tricky', 
      label: `Tricky (${trickyCount})`,
      icon: Flag,
      shortcut: 'Alt+4'
    }
  ];

  return (
    <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onViewChange(tab.id)}
          className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap flex items-center gap-2 ${
            activeView === tab.id 
              ? tab.id === 'review' 
                ? 'bg-yellow-600 text-white'
                : tab.id === 'tricky'
                ? 'bg-red-600 text-white'
                : 'bg-app-accent text-white'
              : 'bg-app-card text-app-text-secondary hover:bg-app-card-hover'
          }`}
        >
          <span className="flex items-center gap-1">
            {tab.icon && <tab.icon size={16} />}
            {tab.label}
          </span>
          <span className="text-xs opacity-60 ml-1">
            {tab.shortcut}
          </span>
        </button>
      ))}
    </div>
  );
};

export default ViewTabs;
