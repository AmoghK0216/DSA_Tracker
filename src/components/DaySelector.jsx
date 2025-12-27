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
            className={`group p-4 rounded-xl border-2 transition-all ${
              currentDay === topic.day
                ? 'border-white bg-app-card scale-105'
                : 'border-app-border bg-app-bg-secondary hover:bg-app-card'
            }`}
          >
            <div className="text-center mb-2">
              <div className={`w-3 h-3 ${topic.color} rounded-full mx-auto mb-2`} />
              <div className="font-bold text-lg">Day {topic.day}</div>
              <div className="text-xs text-app-text-muted mt-1">{topic.name}</div>
            </div>
            <div className={`w-full rounded-full h-1.5 mt-3 ${
              currentDay === topic.day 
                ? 'bg-app-bg-secondary' 
                : 'bg-app-card group-hover:bg-app-bg-secondary group-focus:bg-app-bg-secondary'
            }`}>
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
