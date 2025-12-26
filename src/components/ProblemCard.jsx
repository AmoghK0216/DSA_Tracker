import React from 'react';
import { CheckCircle2, Edit2, Save, Eye, Flag, Trash2 } from 'lucide-react';
import { topics } from '../constants';

const ProblemCard = ({ 
  prob, 
  isEditing, 
  onEdit, 
  onSave, 
  onUpdateField, 
  onMarkReviewed, 
  onToggleFlag, 
  onDelete,
  formatDate 
}) => {
  const topic = topics.find(t => t.day === prob.day);
  
  return (
    <div className="bg-slate-700 rounded-lg p-4 border border-slate-600">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <div className={`w-2 h-2 ${topic?.color} rounded-full`} />
            <span className="text-sm text-slate-400">Day {prob.day} - {topic?.name}</span>
          </div>
          
          {isEditing ? (
            <>
              <input
                type="text"
                placeholder="Problem name"
                value={prob.name || ''}
                onChange={(e) => onUpdateField(prob.id, 'name', e.target.value)}
                className="w-full bg-slate-600 border border-slate-500 rounded px-3 py-2 text-sm font-semibold focus:outline-none focus:border-blue-500 mb-2"
              />
              
              <input
                type="text"
                placeholder="LeetCode link"
                value={prob.link || ''}
                onChange={(e) => onUpdateField(prob.id, 'link', e.target.value)}
                className="w-full bg-slate-600 border border-slate-500 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500 mb-2"
              />
              
              <textarea
                placeholder="Notes"
                value={prob.notes || ''}
                onChange={(e) => onUpdateField(prob.id, 'notes', e.target.value)}
                className="w-full bg-slate-600 border border-slate-500 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500 resize-none mb-2"
                rows="3"
              />
            </>
          ) : (
            <>
              <h3 className="font-semibold mb-1">
                {prob.name || `Problem ${prob.problemNum}`}
              </h3>
              {prob.link && (
                <a 
                  href={prob.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-blue-400 hover:text-blue-300 underline mb-2 inline-block"
                >
                  View on LeetCode →
                </a>
              )}
              {prob.notes && (
                <p className="text-sm text-slate-300 mb-2 whitespace-pre-wrap">{prob.notes}</p>
              )}
            </>
          )}
          
          <div className="flex gap-2 items-center flex-wrap mb-2">
            <span className="text-xs text-slate-400">Solved: {formatDate(prob.completedDate)}</span>
            {prob.lastReviewedDate && (
              <span className="text-xs text-green-400">Last reviewed: {formatDate(prob.lastReviewedDate)}</span>
            )}
            {prob.needsReview && (
              <span className="text-xs bg-yellow-600 text-white px-2 py-0.5 rounded flex items-center gap-1">
                <Eye size={10} /> Review
              </span>
            )}
            {prob.isTricky && (
              <span className="text-xs bg-red-600 text-white px-2 py-0.5 rounded flex items-center gap-1">
                <Flag size={10} /> Tricky
              </span>
            )}
          </div>
          
          <div className="flex gap-2 flex-wrap">
            {isEditing ? (
              <button
                onClick={() => onSave(prob.id)}
                className="flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors bg-blue-600 text-white hover:bg-blue-700"
              >
                <Save size={12} />
                Save
              </button>
            ) : (
              <>
                <button
                  onClick={() => onEdit(prob.id)}
                  className="flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors bg-slate-600 text-slate-300 hover:bg-slate-500"
                >
                  <Edit2 size={12} />
                  Edit
                </button>
                <button
                  onClick={() => onMarkReviewed(prob.id)}
                  className="flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors bg-slate-600 text-slate-300 hover:bg-green-600"
                >
                  <CheckCircle2 size={12} />
                  Reviewed Today
                </button>
              </>
            )}
            <button
              onClick={() => onToggleFlag(prob.id, 'needsReview')}
              className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
                prob.needsReview 
                  ? 'bg-yellow-600 text-white' 
                  : 'bg-slate-600 text-slate-300 hover:bg-slate-500'
              }`}
            >
              <Eye size={12} />
              Review
            </button>
            <button
              onClick={() => onToggleFlag(prob.id, 'isTricky')}
              className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
                prob.isTricky 
                  ? 'bg-red-600 text-white' 
                  : 'bg-slate-600 text-slate-300 hover:bg-slate-500'
              }`}
            >
              <Flag size={12} />
              Tricky
            </button>
            <button
              onClick={() => onDelete(prob.id)}
              className="flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors bg-slate-600 text-slate-300 hover:bg-red-600 hover:text-white"
            >
              <Trash2 size={12} />
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProblemCard;
