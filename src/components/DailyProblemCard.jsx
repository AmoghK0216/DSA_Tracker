import React from 'react';
import { CheckCircle2, Circle, Eye, Flag, Save, Check, X } from 'lucide-react';

const DailyProblemCard = ({ 
  problemNum, 
  data, 
  isCompleted, 
  onToggle, 
  onUpdate, 
  onToggleFlag,
  onMarkSolvedAndSave,
  onMarkSolvedOnly,
  onClear
}) => {
  return (
    <div 
      className={`bg-app-card rounded-lg p-5 border-2 transition-all ${
        isCompleted ? 'border-app-border-success' : 'border-app-border'
      }`}
    >
      <div className="flex items-start gap-4">
        <button
          onClick={onToggle}
          className="mt-1 flex-shrink-0"
        >
          {isCompleted ? (
            <CheckCircle2 className="text-app-border-success" size={28} />
          ) : (
            <Circle className="text-app-text-dim hover:text-app-text-muted" size={28} />
          )}
        </button>
        
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <h3 className="text-lg font-semibold">Problem {problemNum}</h3>
            {isCompleted && (
              <span className="text-xs bg-app-border-success text-white px-2 py-1 rounded">
                Completed
              </span>
            )}
          </div>
          
          <input
            type="text"
            placeholder="Problem name (e.g., Two Sum)"
            value={data.name || ''}
            onChange={(e) => onUpdate('name', e.target.value)}
            className="w-full bg-app-input border border-app-border-secondary rounded px-3 py-2 text-sm focus:outline-none focus:border-app-accent mb-2"
          />
          
          <input
            type="text"
            placeholder="LeetCode link (e.g., https://leetcode.com/problems/two-sum/)"
            value={data.link || ''}
            onChange={(e) => onUpdate('link', e.target.value)}
            className="w-full bg-app-input border border-app-border-secondary rounded px-3 py-2 text-sm focus:outline-none focus:border-app-accent mb-2"
          />
          
          <textarea
            placeholder="Notes: key insights, time/space complexity, mistakes made..."
            value={data.notes || ''}
            onChange={(e) => onUpdate('notes', e.target.value)}
            className="w-full bg-app-input border border-app-border-secondary rounded px-3 py-2 text-sm focus:outline-none focus:border-app-accent resize-none"
            rows="2"
          />

          <div className="flex gap-2 mt-3 flex-wrap">
            <button
              onClick={() => onToggleFlag('needsReview')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded text-sm transition-colors ${
                data.needsReview 
                  ? 'bg-yellow-600 text-white' 
                  : 'bg-app-input text-app-text-secondary hover:bg-app-input-dark'
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
                  : 'bg-app-input text-app-text-secondary hover:bg-app-input-dark'
              }`}
            >
              <Flag size={14} />
              Tricky
            </button>
            <button
              onClick={onMarkSolvedAndSave}
              className="flex items-center gap-1 px-3 py-1.5 rounded text-sm transition-colors bg-app-input text-app-text-secondary hover:bg-app-input-dark"
            >
              <Save size={14} />
              Mark Solved & Save
            </button>
            <button
              onClick={onMarkSolvedOnly}
              className={`flex items-center gap-1 px-3 py-1.5 rounded text-sm transition-colors ${
                isCompleted 
                  ? 'bg-app-border-success text-white' 
                  : 'bg-app-input text-app-text-secondary hover:bg-app-input-dark'
              }`}
            >
              <Check size={14} />
              Mark Solved
            </button>
            <button
              onClick={onClear}
              className="flex items-center gap-1 px-3 py-1.5 rounded text-sm transition-colors bg-app-input text-app-text-secondary hover:bg-app-input-dark"
            >
              <X size={14} />
              Clear
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyProblemCard;
