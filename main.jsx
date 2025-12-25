import React, { useState, useEffect } from 'react';
import { Calendar, CheckCircle2, Circle, Trophy, TrendingUp, RotateCcw, Flag, AlertCircle, Eye } from 'lucide-react';

const DSATracker = () => {
  const topics = [
    { day: 1, name: "Arrays & Two Pointers", color: "bg-blue-500" },
    { day: 2, name: "Binary Search & Sorting", color: "bg-purple-500" },
    { day: 3, name: "Trees & Graphs", color: "bg-green-500" },
    { day: 4, name: "Dynamic Programming & Recursion", color: "bg-orange-500" },
    { day: 5, name: "Hash Maps, Stacks & Queues", color: "bg-pink-500" }
  ];

  const [currentDay, setCurrentDay] = useState(() => {
    const saved = localStorage.getItem('dsaCurrentDay');
    return saved ? parseInt(saved) : 1;
  });

  const [activeView, setActiveView] = useState('today');

  // Persistent problem data that survives reset
  const [problemData, setProblemData] = useState(() => {
    const saved = localStorage.getItem('dsaProblemData');
    return saved ? JSON.parse(saved) : {};
  });

  // Current cycle's daily problems (gets reset)
  const [dailyProblems, setDailyProblems] = useState(() => {
    const saved = localStorage.getItem('dsaDailyProblems');
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    localStorage.setItem('dsaCurrentDay', currentDay.toString());
  }, [currentDay]);

  useEffect(() => {
    localStorage.setItem('dsaProblemData', JSON.stringify(problemData));
  }, [problemData]);

  useEffect(() => {
    localStorage.setItem('dsaDailyProblems', JSON.stringify(dailyProblems));
  }, [dailyProblems]);

  const toggleProblem = (day, problemNum) => {
    const key = `${day}-${problemNum}`;
    const timestamp = new Date().toISOString();
    const data = dailyProblems[key] || {};
    
    // Toggle completion for daily view
    setDailyProblems(prev => ({
      ...prev,
      [key]: {
        ...data,
        completed: !data.completed,
        day: day,
        problemNum: problemNum
      }
    }));

    // If marking as complete, also save to persistent problem data
    if (!data.completed) {
      const uniqueId = `${timestamp}-${day}-${problemNum}`;
      setProblemData(prev => ({
        ...prev,
        [uniqueId]: {
          name: data.name || '',
          notes: data.notes || '',
          completedDate: timestamp,
          day: day,
          problemNum: problemNum,
          needsReview: data.needsReview || false,
          isTricky: data.isTricky || false
        }
      }));
    }
  };

  const updateDailyProblem = (key, field, value) => {
    setDailyProblems(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: value
      }
    }));
  };

  const toggleDailyFlag = (key, flagType) => {
    setDailyProblems(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        [flagType]: !prev[key]?.[flagType]
      }
    }));
  };

  const togglePersistentFlag = (id, flagType) => {
    setProblemData(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [flagType]: !prev[id]?.[flagType]
      }
    }));
  };

  const getDayProgress = (day) => {
    const completed = [1, 2, 3].filter(p => dailyProblems[`${day}-${p}`]?.completed).length;
    return (completed / 3) * 100;
  };

  const getTotalProgress = () => {
    const total = Object.values(dailyProblems).filter(p => p.completed).length;
    return (total / 15) * 100;
  };

  const getAllSolvedProblems = () => {
    return Object.entries(problemData)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => new Date(b.completedDate) - new Date(a.completedDate));
  };

  const getReviewProblems = () => {
    return getAllSolvedProblems().filter(p => p.needsReview);
  };

  const getTrickyProblems = () => {
    return getAllSolvedProblems().filter(p => p.isTricky);
  };

  const resetCycle = () => {
    if (window.confirm('Reset current cycle? Your problem history will be preserved.')) {
      setDailyProblems({});
      setCurrentDay(1);
      localStorage.removeItem('dsaDailyProblems');
      localStorage.setItem('dsaCurrentDay', '1');
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const currentTopic = topics.find(t => t.day === currentDay);

  const renderProblemCard = (problemNum, key) => {
    const data = dailyProblems[key] || {};
    const isCompleted = data.completed || false;

    return (
      <div 
        key={key}
        className={`bg-slate-700 rounded-lg p-5 border-2 transition-all ${
          isCompleted ? 'border-green-500' : 'border-slate-600'
        }`}
      >
        <div className="flex items-start gap-4">
          <button
            onClick={() => toggleProblem(currentDay, problemNum)}
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
              placeholder="Problem name or LeetCode link..."
              value={data.name || ''}
              onChange={(e) => updateDailyProblem(key, 'name', e.target.value)}
              className="w-full bg-slate-600 border border-slate-500 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500 mb-2"
            />
            
            <textarea
              placeholder="Notes: key insights, time/space complexity, mistakes made..."
              value={data.notes || ''}
              onChange={(e) => updateDailyProblem(key, 'notes', e.target.value)}
              className="w-full bg-slate-600 border border-slate-500 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500 resize-none"
              rows="2"
            />

            {isCompleted && (
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => toggleDailyFlag(key, 'needsReview')}
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
                  onClick={() => toggleDailyFlag(key, 'isTricky')}
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
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderHistoryView = () => {
    const allProblems = getAllSolvedProblems();
    
    if (allProblems.length === 0) {
      return (
        <div className="text-center py-12 text-slate-400">
          <AlertCircle size={48} className="mx-auto mb-4 opacity-50" />
          <p>No completed problems yet. Start solving!</p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {allProblems.map(prob => {
          const topic = topics.find(t => t.day === prob.day);
          return (
            <div key={prob.id} className="bg-slate-700 rounded-lg p-4 border border-slate-600">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-2 h-2 ${topic?.color} rounded-full`} />
                    <span className="text-sm text-slate-400">Day {prob.day} - {topic?.name}</span>
                  </div>
                  <h3 className="font-semibold mb-1">
                    {prob.name || `Problem ${prob.problemNum}`}
                  </h3>
                  {prob.notes && (
                    <p className="text-sm text-slate-300 mb-2 whitespace-pre-wrap">{prob.notes}</p>
                  )}
                  <div className="flex gap-2 items-center flex-wrap mb-2">
                    <span className="text-xs text-slate-400">{formatDate(prob.completedDate)}</span>
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
                  <div className="flex gap-2">
                    <button
                      onClick={() => togglePersistentFlag(prob.id, 'needsReview')}
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
                      onClick={() => togglePersistentFlag(prob.id, 'isTricky')}
                      className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
                        prob.isTricky 
                          ? 'bg-red-600 text-white' 
                          : 'bg-slate-600 text-slate-300 hover:bg-slate-500'
                      }`}
                    >
                      <Flag size={12} />
                      Tricky
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderFilteredView = (filterFn, emptyMessage) => {
    const filtered = getAllSolvedProblems().filter(filterFn);
    
    if (filtered.length === 0) {
      return (
        <div className="text-center py-12 text-slate-400">
          <AlertCircle size={48} className="mx-auto mb-4 opacity-50" />
          <p>{emptyMessage}</p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {filtered.map(prob => {
          const topic = topics.find(t => t.day === prob.day);
          return (
            <div key={prob.id} className="bg-slate-700 rounded-lg p-4 border border-slate-600">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-2 h-2 ${topic?.color} rounded-full`} />
                    <span className="text-sm text-slate-400">Day {prob.day} - {topic?.name}</span>
                  </div>
                  <h3 className="font-semibold mb-1">
                    {prob.name || `Problem ${prob.problemNum}`}
                  </h3>
                  {prob.notes && (
                    <p className="text-sm text-slate-300 mb-2 whitespace-pre-wrap">{prob.notes}</p>
                  )}
                  <div className="flex gap-2 items-center flex-wrap mb-2">
                    <span className="text-xs text-slate-400">{formatDate(prob.completedDate)}</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => togglePersistentFlag(prob.id, 'needsReview')}
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
                      onClick={() => togglePersistentFlag(prob.id, 'isTricky')}
                      className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
                        prob.isTricky 
                          ? 'bg-red-600 text-white' 
                          : 'bg-slate-600 text-slate-300 hover:bg-slate-500'
                      }`}
                    >
                      <Flag size={12} />
                      Tricky
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const totalSolved = getAllSolvedProblems().length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">DSA Interview Prep</h1>
              <p className="text-slate-400">5-Day Rotation • 3 Problems Daily</p>
            </div>
            <button
              onClick={resetCycle}
              className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
            >
              <RotateCcw size={16} />
              Reset Cycle
            </button>
          </div>
          
          {/* Overall Progress */}
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Trophy className="text-yellow-500" size={24} />
                <span className="text-lg font-semibold">Current Cycle Progress</span>
              </div>
              <span className="text-2xl font-bold">{Math.round(getTotalProgress())}%</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${getTotalProgress()}%` }}
              />
            </div>
            <div className="flex gap-4 mt-3 text-sm flex-wrap">
              <span className="text-slate-400">
                {Object.values(dailyProblems).filter(p => p.completed).length} / 15 this cycle
              </span>
              <span className="text-green-400">
                {totalSolved} total solved
              </span>
              <span className="text-yellow-400">
                {getReviewProblems().length} for review
              </span>
              <span className="text-red-400">
                {getTrickyProblems().length} tricky
              </span>
            </div>
          </div>
        </div>

        {/* View Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveView('today')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
              activeView === 'today' 
                ? 'bg-blue-600 text-white' 
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            Today's Problems
          </button>
          <button
            onClick={() => setActiveView('history')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
              activeView === 'history' 
                ? 'bg-blue-600 text-white' 
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            All Problems ({totalSolved})
          </button>
          <button
            onClick={() => setActiveView('review')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
              activeView === 'review' 
                ? 'bg-yellow-600 text-white' 
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            <Eye size={16} className="inline mr-1" />
            Review ({getReviewProblems().length})
          </button>
          <button
            onClick={() => setActiveView('tricky')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
              activeView === 'tricky' 
                ? 'bg-red-600 text-white' 
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            <Flag size={16} className="inline mr-1" />
            Tricky ({getTrickyProblems().length})
          </button>
        </div>

        {/* Day Selector (only show in today view) */}
        {activeView === 'today' && (
          <div className="grid grid-cols-5 gap-3 mb-8">
            {topics.map(topic => {
              const progress = getDayProgress(topic.day);
              return (
                <button
                  key={topic.day}
                  onClick={() => setCurrentDay(topic.day)}
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
        )}

        {/* Content Area */}
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          {activeView === 'today' && (
            <>
              <div className="flex items-center gap-3 mb-6">
                <div className={`w-4 h-4 ${currentTopic.color} rounded-full`} />
                <h2 className="text-2xl font-bold">Day {currentDay}: {currentTopic.name}</h2>
              </div>

              <div className="space-y-4">
                {[1, 2, 3].map(problemNum => {
                  const key = `${currentDay}-${problemNum}`;
                  return renderProblemCard(problemNum, key);
                })}
              </div>

              {/* Tips Section */}
              <div className="mt-6 p-4 bg-slate-900 rounded-lg border border-slate-600">
                <div className="flex items-start gap-3">
                  <TrendingUp className="text-blue-400 flex-shrink-0 mt-1" size={20} />
                  <div>
                    <h4 className="font-semibold mb-1">Today's Focus</h4>
                    <p className="text-sm text-slate-300">
                      {currentDay === 1 && "Master sliding window patterns and two-pointer techniques. Focus on in-place operations."}
                      {currentDay === 2 && "Practice identifying search spaces. Remember: if sorted or can sort, think binary search."}
                      {currentDay === 3 && "Visualize the structure. Practice both DFS and BFS. Draw the tree/graph for complex problems."}
                      {currentDay === 4 && "Start with recursion, then optimize with memoization. Identify overlapping subproblems."}
                      {currentDay === 5 && "Think about what data structure fits best. Frequency? Use HashMap. Order matters? Stack/Queue."}
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeView === 'history' && renderHistoryView()}
          {activeView === 'review' && renderFilteredView(
            p => p.needsReview,
            "No problems marked for review yet!"
          )}
          {activeView === 'tricky' && renderFilteredView(
            p => p.isTricky,
            "No tricky problems marked yet!"
          )}
        </div>

        {/* Review Reminder */}
        <div className="mt-6 p-4 bg-blue-900/30 border border-blue-700 rounded-lg">
          <div className="flex items-start gap-3">
            <Calendar className="text-blue-400 flex-shrink-0 mt-1" size={20} />
            <div>
              <h4 className="font-semibold mb-1">💡 Pro Tip</h4>
              <p className="text-sm text-slate-300">
                Start each session by reviewing one problem from 5 days ago (same topic) to strengthen retention! Your problem history is always preserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DSATracker;