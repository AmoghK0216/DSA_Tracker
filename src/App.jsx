import React, { useState, useEffect, useRef } from 'react';
import { Calendar, TrendingUp, RotateCcw, AlertCircle } from 'lucide-react';
import { db } from './firebase';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { topics, getDayFocus } from './constants';
import ProblemCard from './components/ProblemCard';
import DailyProblemCard from './components/DailyProblemCard';
import ProgressBar from './components/ProgressBar';
import DaySelector from './components/DaySelector';
import ViewTabs from './components/ViewTabs';
import SearchBar from './components/SearchBar';

const DSATracker = () => {
  const [loading, setLoading] = useState(true);
  const saveTimerRef = useRef(null);
  const isLocalUpdateRef = useRef(false);

  const [currentDay, setCurrentDay] = useState(1);
  const [activeView, setActiveView] = useState('today');
  const [problemData, setProblemData] = useState({});
  const [dailyProblems, setDailyProblems] = useState({});
  const [editingProblemId, setEditingProblemId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Helper function to save data to Firebase
  const saveToFirebase = (updates, debounce = false) => {
    if (debounce) {
      // Clear existing timer
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
      // Set new timer to save after 1 second of inactivity
      saveTimerRef.current = setTimeout(() => {
        console.log("💾 Saving to Firebase (debounced)");
        isLocalUpdateRef.current = true;
        const dataDocRef = doc(db, 'appData', 'main');
        setDoc(dataDocRef, {
          currentDay: updates.currentDay ?? currentDay,
          problemData: updates.problemData ?? problemData,
          dailyProblems: updates.dailyProblems ?? dailyProblems,
          lastUpdated: new Date().toISOString()
        }, { merge: true }).then(() => {
          console.log("✅ Saved successfully (debounced)");
        }).catch((error) => {
          console.error("Error saving data:", error);
        }).finally(() => {
          isLocalUpdateRef.current = false;
        });
      }, 1000);
    } else {
      // Immediate save
      console.log("💾 Saving to Firebase (immediate)");
      isLocalUpdateRef.current = true;
      const dataDocRef = doc(db, 'appData', 'main');
      setDoc(dataDocRef, {
        currentDay: updates.currentDay ?? currentDay,
        problemData: updates.problemData ?? problemData,
        dailyProblems: updates.dailyProblems ?? dailyProblems,
        lastUpdated: new Date().toISOString()
      }, { merge: true }).then(() => {
        console.log("✅ Saved successfully (immediate)");
      }).catch((error) => {
        console.error("Error saving data:", error);
      }).finally(() => {
        isLocalUpdateRef.current = false;
      });
    }
  };

  // Load data from Firebase on mount
  useEffect(() => {
    const dataDocRef = doc(db, 'appData', 'main');
    
    const unsubscribe = onSnapshot(dataDocRef, (docSnap) => {
      // Skip updates that originated from local changes
      if (isLocalUpdateRef.current) {
        console.log("⏭️ Skipping onSnapshot (local update)");
        isLocalUpdateRef.current = false;
        return;
      }
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        console.log("📥 Data loaded from Firebase");
        setCurrentDay(data.currentDay || 1);
        setProblemData(data.problemData || {});
        setDailyProblems(data.dailyProblems || {});
      } else {
        console.log("No document found, starting fresh");
      }
      setLoading(false);
    }, (error) => {
      console.error("Error loading data:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const toggleProblem = (day, problemNum) => {
    const key = `${day}-${problemNum}`;
    const timestamp = new Date().toISOString();
    const data = dailyProblems[key] || {};
    
    const updatedDailyProblems = {
      ...dailyProblems,
      [key]: {
        ...data,
        completed: !data.completed,
        day: day,
        problemNum: problemNum
      }
    };

    // If marking as complete, also save to persistent problem data
    let updatedProblemData = problemData;
    if (!data.completed) {
      const uniqueId = `${timestamp}-${day}-${problemNum}`;
      updatedProblemData = {
        ...problemData,
        [uniqueId]: {
          name: data.name || '',
          link: data.link || '',
          notes: data.notes || '',
          completedDate: timestamp,
          day: day,
          problemNum: problemNum,
          needsReview: data.needsReview || false,
          isTricky: data.isTricky || false
        }
      };
      setProblemData(updatedProblemData);
    }
    
    setDailyProblems(updatedDailyProblems);
    saveToFirebase({ dailyProblems: updatedDailyProblems, problemData: updatedProblemData });
  };

  const updateDailyProblem = (key, field, value) => {
    const updated = {
      ...dailyProblems,
      [key]: {
        ...dailyProblems[key],
        [field]: value
      }
    };
    setDailyProblems(updated);
    saveToFirebase({ dailyProblems: updated }, true); // Debounced save
  };

  const toggleDailyFlag = (key, flagType) => {
    const updated = {
      ...dailyProblems,
      [key]: {
        ...dailyProblems[key],
        [flagType]: !dailyProblems[key]?.[flagType]
      }
    };
    setDailyProblems(updated);
    saveToFirebase({ dailyProblems: updated });
  };

  const togglePersistentFlag = (id, flagType) => {
    const updated = {
      ...problemData,
      [id]: {
        ...problemData[id],
        [flagType]: !problemData[id]?.[flagType]
      }
    };
    setProblemData(updated);
    saveToFirebase({ problemData: updated });
  };

  const deleteProblem = (id) => {
    if (window.confirm('Are you sure you want to delete this problem?')) {
      const updated = { ...problemData };
      delete updated[id];
      setProblemData(updated);
      saveToFirebase({ problemData: updated });
    }
  };

  const markAsReviewedToday = (id) => {
    const updated = {
      ...problemData,
      [id]: {
        ...problemData[id],
        lastReviewedDate: new Date().toISOString(),
        needsReview: false // Unmark from review when reviewed
      }
    };
    setProblemData(updated);
    saveToFirebase({ problemData: updated });
  };

  const updateProblemField = (id, field, value) => {
    const updated = {
      ...problemData,
      [id]: {
        ...problemData[id],
        [field]: value
      }
    };
    setProblemData(updated);
    saveToFirebase({ problemData: updated }, true); // Debounced save
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
      saveToFirebase({ dailyProblems: {}, currentDay: 1 });
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const currentTopic = topics.find(t => t.day === currentDay);

  const handleSaveEdit = (id) => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }
    saveToFirebase({ problemData });
    setEditingProblemId(null);
  };

  const filterBySearch = (problems) => {
    if (!searchTerm.trim()) return problems;
    
    const search = searchTerm.toLowerCase();
    return problems.filter(prob => 
      (prob.name || '').toLowerCase().includes(search) ||
      (prob.link || '').toLowerCase().includes(search) ||
      (prob.notes || '').toLowerCase().includes(search)
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

    const filteredProblems = filterBySearch(allProblems);

    return (
      <>
        <SearchBar 
          searchTerm={searchTerm} 
          onSearchChange={setSearchTerm}
          placeholder="Search by name, link, or notes..."
        />
        {filteredProblems.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <AlertCircle size={48} className="mx-auto mb-4 opacity-50" />
            <p>No problems match "{searchTerm}"</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredProblems.map(prob => (
              <div key={prob.id}>
                <ProblemCard
                  prob={prob}
                  isEditing={editingProblemId === prob.id}
                  onEdit={setEditingProblemId}
                  onSave={handleSaveEdit}
                  onUpdateField={updateProblemField}
                  onMarkReviewed={markAsReviewedToday}
                  onToggleFlag={togglePersistentFlag}
                  onDelete={deleteProblem}
                  formatDate={formatDate}
                />
              </div>
            ))}
          </div>
        )}
      </>
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

    const searchFiltered = filterBySearch(filtered);

    return (
      <>
        <SearchBar 
          searchTerm={searchTerm} 
          onSearchChange={setSearchTerm}
          placeholder="Search by name, link, or notes..."
        />
        {searchFiltered.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <AlertCircle size={48} className="mx-auto mb-4 opacity-50" />
            <p>No problems match "{searchTerm}"</p>
          </div>
        ) : (
          <div className="space-y-3">
            {searchFiltered.map(prob => (
              <div key={prob.id}>
                <ProblemCard
                  prob={prob}
                  isEditing={editingProblemId === prob.id}
                  onEdit={setEditingProblemId}
                  onSave={handleSaveEdit}
                  onUpdateField={updateProblemField}
                  onMarkReviewed={markAsReviewedToday}
                  onToggleFlag={togglePersistentFlag}
                  onDelete={deleteProblem}
                  formatDate={formatDate}
                />
              </div>
            ))}
          </div>
        )}
      </>
    );
  };

  const totalSolved = getAllSolvedProblems().length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading your data...</p>
        </div>
      </div>
    );
  }

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
          <ProgressBar
            totalProgress={getTotalProgress()}
            completedInCycle={Object.values(dailyProblems).filter(p => p.completed).length}
            totalSolved={totalSolved}
            reviewCount={getReviewProblems().length}
            trickyCount={getTrickyProblems().length}
          />
        </div>

        {/* View Tabs */}
        <ViewTabs
          activeView={activeView}
          onViewChange={setActiveView}
          totalSolved={totalSolved}
          reviewCount={getReviewProblems().length}
          trickyCount={getTrickyProblems().length}
        />

        {/* Day Selector (only show in today view) */}
        {activeView === 'today' && (
          <DaySelector
            currentDay={currentDay}
            onDayChange={setCurrentDay}
            getDayProgress={getDayProgress}
          />
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
                  const data = dailyProblems[key] || {};
                  return (
                    <DailyProblemCard
                      key={key}
                      problemNum={problemNum}
                      data={data}
                      isCompleted={data.completed || false}
                      onToggle={() => toggleProblem(currentDay, problemNum)}
                      onUpdate={(field, value) => updateDailyProblem(key, field, value)}
                      onToggleFlag={(flagType) => toggleDailyFlag(key, flagType)}
                    />
                  );
                })}
              </div>

              {/* Tips Section */}
              <div className="mt-6 p-4 bg-slate-900 rounded-lg border border-slate-600">
                <div className="flex items-start gap-3">
                  <TrendingUp className="text-blue-400 flex-shrink-0 mt-1" size={20} />
                  <div>
                    <h4 className="font-semibold mb-1">Today's Focus</h4>
                    <p className="text-sm text-slate-300">
                      {getDayFocus(currentDay)}
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