import React from 'react';
import { CheckCircle2, Circle, Eye, Flag } from 'lucide-react';

const DailyProblemCard = ({ 
  problemNum, 
  data, 
  isCompleted, 
  onToggle, 
  onUpdate, 
  onToggleFlag 
}) => {
  return (
    <div 
      className={`bg-slate-700 rounded-lg p-5 border-2 transition-all ${
        isCompleted ? 'border-green-500' : 'border-slate-600'
      }`}
    >
      <div className="flex items-start gap-4">
        <button
          onClick={onToggle}
          className="mt-1 flex-shrink-0"
        >
          {isCompleted ? (
            <CheckCircle2 className="text-green-500" size={28} />
          ) : (
            <Circle className="text-slate-500 hover:text-slate-400" size={28} />
          )}
        </button>
        
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <h3 className="text-lg font-semibold">Problem {problemNum}</h3>
            {isCompleted && (
              <span className="text-xs bg-green-500 text-white px-2 py-1 rounded">
                Completed
              </span>
            )}
          </div>
          
          <input
            type="text"
            placeholder="Problem name (e.g., Two Sum)"
            value={data.name || ''}
            onChange={(e) => onUpdate('name', e.target.value)}
            className="w-full bg-slate-600 border border-slate-500 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500 mb-2"
          />
          
          <input
            type="text"
            placeholder="LeetCode link (e.g., https://leetcode.com/problems/two-sum/)"
            value={data.link || ''}
            onChange={(e) => onUpdate('link', e.target.value)}
            className="w-full bg-slate-600 border border-slate-500 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500 mb-2"
          />
          
          <textarea
            placeholder="Notes: key insights, time/space complexity, mistakes made..."
            value={data.notes || ''}
            onChange={(e) => onUpdate('notes', e.target.value)}
            className="w-full bg-slate-600 border border-slate-500 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500 resize-none"
            rows="2"
          />

          <div className="flex gap-2 mt-3">
            <button
              onClick={() => onToggleFlag('needsReview')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded text-sm transition-colors ${
                data.needsReview 
                  ? 'bg-yellow-600 text-white' 
                  : 'bg-slate-600 text-slate-300 hover:bg-slate-500'
              }`}
            >
              <Eye size={14} />
              Review
            </button>
            <button
              onClick={() => onToggleFlag('isTricky')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded text-sm transition-colors ${
                data.isTricky 
                  ? 'bg-red-600 text-white' 
                  : 'bg-slate-600 text-slate-300 hover:bg-slate-500'
              }`}
            >
              <Flag size={14} />
              Tricky
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyProblemCard;
