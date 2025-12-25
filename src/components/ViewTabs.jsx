import React from 'react';
import { Eye, Flag } from 'lucide-react';

const ViewTabs = ({ activeView, onViewChange, totalSolved, reviewCount, trickyCount }) => {
  const tabs = [
    { id: 'today', label: "Today's Problems" },
    { id: 'history', label: `Solved Problems (${totalSolved})` },
    { 
      id: 'review', 
      label: `Review (${reviewCount})`,
      icon: Eye 
    },
    { 
      id: 'tricky', 
      label: `Tricky (${trickyCount})`,
      icon: Flag 
    }
  ];

  return (
    <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onViewChange(tab.id)}
          className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
            activeView === tab.id 
              ? tab.id === 'review' 
                ? 'bg-yellow-600 text-white'
                : tab.id === 'tricky'
                ? 'bg-red-600 text-white'
                : 'bg-blue-600 text-white'
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
        >
          {tab.icon && <tab.icon size={16} className="inline mr-1" />}
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default ViewTabs;
