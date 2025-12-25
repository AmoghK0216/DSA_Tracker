import React from 'react';
import { Trophy } from 'lucide-react';

const ProgressBar = ({ 
  totalProgress, 
  completedInCycle, 
  totalSolved, 
  reviewCount, 
  trickyCount 
}) => {
  return (
    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Trophy className="text-yellow-500" size={24} />
          <span className="text-lg font-semibold">Current Cycle Progress</span>
        </div>
        <span className="text-2xl font-bold">{Math.round(totalProgress)}%</span>
      </div>
      <div className="w-full bg-slate-700 rounded-full h-3">
        <div 
          className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
          style={{ width: `${totalProgress}%` }}
        />
      </div>
      <div className="flex gap-4 mt-3 text-sm flex-wrap">
        <span className="text-slate-400">
          {completedInCycle} / 15 this cycle
        </span>
        <span className="text-green-400">
          {totalSolved} total solved
        </span>
        <span className="text-yellow-400">
          {reviewCount} for review
        </span>
        <span className="text-red-400">
          {trickyCount} tricky
        </span>
      </div>
    </div>
  );
};

export default ProgressBar;
