import React from 'react';
import { topics } from '../constants';

const DaySelector = ({ currentDay, onDayChange, getDayProgress }) => {
  return (
    <div className="grid grid-cols-6 gap-3 mb-8">
      {topics.map(topic => {
        const progress = getDayProgress(topic.day);
        return (
          <button
            key={topic.day}
            onClick={() => onDayChange(topic.day)}
            className={`p-4 rounded-xl border-2 transition-all ${
              currentDay === topic.day
                ? 'border-white bg-slate-700 scale-105'
                : 'border-slate-700 bg-slate-800 hover:bg-slate-700'
            }`}
          >
            <div className="text-center mb-2">
              <div className={`w-3 h-3 ${topic.color} rounded-full mx-auto mb-2`} />
              <div className="font-bold text-lg">Day {topic.day}</div>
              <div className="text-xs text-slate-400 mt-1">{topic.name}</div>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-1.5 mt-3">
              <div 
                className={`${topic.color} h-1.5 rounded-full transition-all`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default DaySelector;
