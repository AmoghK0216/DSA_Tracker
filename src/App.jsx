import React, { useState, useEffect, useRef } from 'react';
import { Calendar, TrendingUp, RotateCcw, AlertCircle, Plus, X } from 'lucide-react';
import { db } from './firebase';
import { doc, setDoc, updateDoc, deleteField, onSnapshot, getDoc } from 'firebase/firestore';
import { topics, getDayFocus } from './constants';
import ProblemCard from './components/ProblemCard';
import DailyProblemCard from './components/DailyProblemCard';
import ProgressBar from './components/ProgressBar';
import DaySelector from './components/DaySelector';
import ViewTabs from './components/ViewTabs';
import SearchBar from './components/SearchBar';
import Modal from './components/Modal';

const DSATracker = () => {
  const [loading, setLoading] = useState(true);
  const saveTimerRef = useRef(null);
  const isLocalUpdateRef = useRef(false);
  const searchInputRef = useRef(null);

  const [currentDay, setCurrentDay] = useState(1);
  const [activeView, setActiveView] = useState('today');
  const [problemData, setProblemData] = useState({});
  const [dailyProblems, setDailyProblems] = useState({});
  const [editingProblemId, setEditingProblemId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newProblem, setNewProblem] = useState({
    name: '',
    link: '',
    notes: '',
    day: 1,
    needsReview: false,
    isTricky: false
  });
  const [modal, setModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'confirm',
    variant: 'warning',
    onConfirm: null
  });

  // Helper functions to save data to Firebase
  const saveDailyToFirebase = (updates, debounce = false) => {
    if (debounce) {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
      saveTimerRef.current = setTimeout(() => {
        isLocalUpdateRef.current = true;
        const dailyDocRef = doc(db, 'appData', 'daily');
        setDoc(dailyDocRef, {
          ...updates,
          lastUpdated: new Date().toISOString()
        }).catch((error) => {
          console.error("Error saving daily data:", error);
        }).finally(() => {
          isLocalUpdateRef.current = false;
        });
      }, 1000);
    } else {
      isLocalUpdateRef.current = true;
      const dailyDocRef = doc(db, 'appData', 'daily');
      setDoc(dailyDocRef, {
        ...updates,
        lastUpdated: new Date().toISOString()
      }).catch((error) => {
        console.error("Error saving daily data:", error);
      }).finally(() => {
        isLocalUpdateRef.current = false;
      });
    }
  };

  const saveSolvedToFirebase = (id, value, debounce = false) => {
    if (debounce) {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
      saveTimerRef.current = setTimeout(() => {
        isLocalUpdateRef.current = true;
        const solvedDocRef = doc(db, 'appData', 'solved');
        updateDoc(solvedDocRef, {
          [`problemData.${id}`]: value,
          lastUpdated: new Date().toISOString()
        }).catch((error) => {
          console.error("Error saving solved data:", error);
        }).finally(() => {
          isLocalUpdateRef.current = false;
        });
      }, 1000);
    } else {
      isLocalUpdateRef.current = true;
      const solvedDocRef = doc(db, 'appData', 'solved');
      updateDoc(solvedDocRef, {
        [`problemData.${id}`]: value,
        lastUpdated: new Date().toISOString()
      }).catch((error) => {
        console.error("Error saving solved data:", error);
      }).finally(() => {
        isLocalUpdateRef.current = false;
      });
    }
  };

  // One-time migration/initialization: migrate old structure if present
  // and ensure required documents exist in Firestore.
  useEffect(() => {
    const migrateData = async () => {
      try {
        const oldDocRef = doc(db, 'appData', 'main');
        const dailyDocRef = doc(db, 'appData', 'daily');
        const solvedDocRef = doc(db, 'appData', 'solved');

        // If old document exists, migrate it into the new structure
        const oldDoc = await getDoc(oldDocRef);
        if (oldDoc.exists()) {
          const oldData = oldDoc.data();

          // Migrate daily data
          await setDoc(dailyDocRef, {
            currentDay: oldData.currentDay || 1,
            dailyProblems: oldData.dailyProblems || {},
            lastUpdated: new Date().toISOString()
          });

          // Migrate solved data
          await setDoc(solvedDocRef, {
            problemData: oldData.problemData || {},
            lastUpdated: new Date().toISOString()
          });
        }

        // Ensure `daily` doc exists
        const dailySnap = await getDoc(dailyDocRef);
        if (!dailySnap.exists()) {
          await setDoc(dailyDocRef, {
            currentDay: 1,
            dailyProblems: {},
            lastUpdated: new Date().toISOString()
          });
        }

        // Ensure `solved` doc exists
        const solvedSnap = await getDoc(solvedDocRef);
        if (!solvedSnap.exists()) {
          await setDoc(solvedDocRef, {
            problemData: {},
            lastUpdated: new Date().toISOString()
          });
        }
      } catch (error) {
        console.error('❌ Migration/initialization error:', error);
      }
    };

    migrateData();
  }, []);

  // Load data from Firebase on mount
  useEffect(() => {
    const dailyDocRef = doc(db, 'appData', 'daily');
    const solvedDocRef = doc(db, 'appData', 'solved');
    
    let dailyLoaded = false;
    let solvedLoaded = false;
    
    const checkLoading = () => {
      if (dailyLoaded && solvedLoaded) {
        setLoading(false);
      }
    };
    
    const unsubscribeDaily = onSnapshot(dailyDocRef, (docSnap) => {
      // Skip updates that originated from local changes
      if (isLocalUpdateRef.current) {
        isLocalUpdateRef.current = false;
        return;
      }
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        setCurrentDay(data.currentDay || 1);
        setDailyProblems(data.dailyProblems || {});
      }
      dailyLoaded = true;
      checkLoading();
    }, (error) => {
      console.error("Error loading daily data:", error);
      dailyLoaded = true;
      checkLoading();
    });
    
    const unsubscribeSolved = onSnapshot(solvedDocRef, (docSnap) => {
      // Skip updates that originated from local changes
      if (isLocalUpdateRef.current) {
        isLocalUpdateRef.current = false;
        return;
      }
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        
        // Clean up malformed data - consolidate root-level "problemData.xxx" fields
        const cleanedProblemData = data.problemData || {};
        
        // Check for any malformed fields at root level and merge them in
        Object.keys(data).forEach(key => {
          if (key.startsWith('problemData.')) {
            const actualId = key.replace('problemData.', '');
            if (!cleanedProblemData[actualId]) {
              cleanedProblemData[actualId] = data[key];
            }
          }
        });
        
        // Fix nested timestamp entries (e.g., "2025-12-26T21:48:34": { "034Z-1-2": {...} })
        Object.keys(cleanedProblemData).forEach(key => {
          const entry = cleanedProblemData[key];
          // Check if this entry has nested timestamp parts
          if (entry && typeof entry === 'object' && !entry.name && !entry.completedDate) {
            // This might be a partial timestamp with nested data
            const nestedKeys = Object.keys(entry);
            if (nestedKeys.length === 1 && nestedKeys[0].includes('Z-')) {
              // Reconstruct the full ID and flatten
              const fullId = `${key}.${nestedKeys[0]}`;
              const actualData = entry[nestedKeys[0]];
              cleanedProblemData[fullId] = actualData;
              delete cleanedProblemData[key];
            }
          }
        });
        
        setProblemData(cleanedProblemData);
      }
      solvedLoaded = true;
      checkLoading();
    }, (error) => {
      console.error("Error loading solved data:", error);
      solvedLoaded = true;
      checkLoading();
    });

    return () => {
      unsubscribeDaily();
      unsubscribeSolved();
    };
  }, []);

  // Keyboard shortcuts for tab navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Only trigger if not typing in an input/textarea
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
      }
      
      // Alt + number keys for tab switching
      if (e.altKey && !e.ctrlKey && !e.shiftKey) {
        switch(e.key) {
          case '1':
            e.preventDefault();
            setActiveView('today');
            break;
          case '2':
            e.preventDefault();
            setActiveView('history');
            break;
          case '3':
            e.preventDefault();
            setActiveView('review');
            break;
          case '4':
            e.preventDefault();
            setActiveView('tricky');
            break;
          case 's':
          case 'S':
            // Focus search bar if in a view that has one
            if (['history', 'review', 'tricky'].includes(activeView) && searchInputRef.current) {
              e.preventDefault();
              searchInputRef.current.focus();
            }
            break;
          default:
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [activeView]);

  const toggleProblem = (day, problemNum) => {
    const key = `${day}-${problemNum}`;
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

    setDailyProblems(updatedDailyProblems);
    saveDailyToFirebase({ dailyProblems: updatedDailyProblems, currentDay });
  };

  const markSolvedAndSave = (day, problemNum) => {
    const key = `${day}-${problemNum}`;
    const timestamp = new Date().toISOString();
    const data = dailyProblems[key] || {};
    
    // Mark as completed
    const updatedDailyProblems = {
      ...dailyProblems,
      [key]: {
        ...data,
        completed: true,
        day: day,
        problemNum: problemNum
      }
    };

    setDailyProblems(updatedDailyProblems);
    saveDailyToFirebase({ dailyProblems: updatedDailyProblems, currentDay });
    
    // Save to persistent problem data
    const uniqueId = `${timestamp.replace(/\./g, '_')}-${day}-${problemNum}`;
    const newProblem = {
      name: data.name || '',
      link: data.link || '',
      notes: data.notes || '',
      completedDate: timestamp,
      day: day,
      problemNum: problemNum,
      needsReview: data.needsReview || false,
      isTricky: data.isTricky || false
    };
    const updatedProblemData = {
      ...problemData,
      [uniqueId]: newProblem
    };
    setProblemData(updatedProblemData);
    saveSolvedToFirebase(uniqueId, newProblem);
  };

  const markSolvedOnly = (day, problemNum) => {
    const key = `${day}-${problemNum}`;
    const data = dailyProblems[key] || {};
    
    // Toggle completed state, don't save to persistent storage
    const updatedDailyProblems = {
      ...dailyProblems,
      [key]: {
        ...data,
        completed: !data.completed,
        day: day,
        problemNum: problemNum
      }
    };

    setDailyProblems(updatedDailyProblems);
    saveDailyToFirebase({ dailyProblems: updatedDailyProblems, currentDay });
  };

  const clearDailyProblem = (day, problemNum) => {
    setModal({
      isOpen: true,
      title: 'Clear Problem',
      message: 'Are you sure you want to clear this problem? All data (name, link, notes, and flags) will be removed.',
      type: 'confirm',
      variant: 'warning',
      onConfirm: () => {
        const key = `${day}-${problemNum}`;
        
        // Clear all data and unmark
        const updatedDailyProblems = {
          ...dailyProblems,
          [key]: {
            name: '',
            link: '',
            notes: '',
            completed: false,
            needsReview: false,
            isTricky: false,
            day: day,
            problemNum: problemNum
          }
        };

        setDailyProblems(updatedDailyProblems);
        saveDailyToFirebase({ dailyProblems: updatedDailyProblems, currentDay });
      }
    });
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
    saveDailyToFirebase({ dailyProblems: updated, currentDay }, true); // Debounced save
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
    saveDailyToFirebase({ dailyProblems: updated, currentDay });
  };

  const togglePersistentFlag = (id, flagType) => {
    const newValue = !problemData[id]?.[flagType];
    const updated = {
      ...problemData,
      [id]: {
        ...problemData[id],
        [flagType]: newValue
      }
    };
    setProblemData(updated);
    saveSolvedToFirebase(`${id}.${flagType}`, newValue);
  };

  const deleteProblem = (id) => {
    setModal({
      isOpen: true,
      title: 'Delete Problem',
      message: 'Are you sure you want to delete this problem? This action cannot be undone.',
      type: 'confirm',
      variant: 'warning',
      onConfirm: () => {
        const updated = { ...problemData };
        delete updated[id];
        setProblemData(updated);
        saveSolvedToFirebase(id, deleteField());
      }
    });
  };

  const markAsReviewedToday = (id) => {
    const timestamp = new Date().toISOString();
    const updated = {
      ...problemData,
      [id]: {
        ...problemData[id],
        lastReviewedDate: timestamp,
        needsReview: false
      }
    };
    setProblemData(updated);
    // Update both fields atomically
    const solvedDocRef = doc(db, 'appData', 'solved');
    isLocalUpdateRef.current = true;
    updateDoc(solvedDocRef, {
      [`problemData.${id}.lastReviewedDate`]: timestamp,
      [`problemData.${id}.needsReview`]: false,
      lastUpdated: new Date().toISOString()
    }).catch((error) => {
      console.error("Error marking as reviewed:", error);
    }).finally(() => {
      isLocalUpdateRef.current = false;
    });
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
    saveSolvedToFirebase(`${id}.${field}`, value, true); // Debounced save
  };

  const getDayProgress = (day) => {
    const completed = [1, 2, 3].filter(p => dailyProblems[`${day}-${p}`]?.completed).length;
    return (completed / 3) * 100;
  };

  const getTotalProgress = () => {
    const total = Object.values(dailyProblems).filter(p => p.completed).length;
    return (total / 18) * 100;
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
    setModal({
      isOpen: true,
      title: 'Reset Cycle',
      message: 'Reset current cycle? Your problem history will be preserved, but all daily progress will be cleared.',
      type: 'confirm',
      variant: 'warning',
      onConfirm: () => {
        setDailyProblems({});
        setCurrentDay(1);
        saveDailyToFirebase({ dailyProblems: {}, currentDay: 1 });
      }
    });
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
    // Force immediate save of the entire problem
    const solvedDocRef = doc(db, 'appData', 'solved');
    isLocalUpdateRef.current = true;
    updateDoc(solvedDocRef, {
      [`problemData.${id}`]: problemData[id],
      lastUpdated: new Date().toISOString()
    }).catch((error) => {
      console.error("Error saving problem:", error);
    }).finally(() => {
      isLocalUpdateRef.current = false;
    });
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

  const addNewProblem = () => {
    if (!newProblem.name.trim()) {
      setModal({
        isOpen: true,
        title: 'Missing Information',
        message: 'Please enter a problem name before adding.',
        type: 'alert',
        variant: 'info',
        onConfirm: null
      });
      return;
    }

    const timestamp = new Date().toISOString();
    const uniqueId = `${timestamp.replace(/\./g, '_')}-manual`;
    
    const newProblemData = {
      name: newProblem.name,
      link: newProblem.link,
      notes: newProblem.notes,
      completedDate: timestamp,
      day: newProblem.day,
      needsReview: newProblem.needsReview,
      isTricky: newProblem.isTricky
    };
    
    const updatedProblemData = {
      ...problemData,
      [uniqueId]: newProblemData
    };
    
    setProblemData(updatedProblemData);
    saveSolvedToFirebase(uniqueId, newProblemData);
    
    // Reset form
    setNewProblem({
      name: '',
      link: '',
      notes: '',
      day: 1,
      needsReview: false,
      isTricky: false
    });
    setIsAddingNew(false);
  };

  const cancelAddNew = () => {
    setNewProblem({
      name: '',
      link: '',
      notes: '',
      day: 1,
      needsReview: false,
      isTricky: false
    });
    setIsAddingNew(false);
  };

  const renderHistoryView = () => {
    const allProblems = getAllSolvedProblems();
    
    if (allProblems.length === 0 && !isAddingNew) {
      return (
        <div className="text-center py-12 text-app-text-muted">
          <AlertCircle size={48} className="mx-auto mb-4 opacity-50" />
          <p className="mb-4">No completed problems yet. Start solving!</p>
          <button
            onClick={() => setIsAddingNew(true)}
            className="flex items-center gap-2 px-4 py-2 bg-app-accent hover:bg-app-accent-hover rounded-lg transition-colors mx-auto"
          >
            <Plus size={16} />
            Add Problem
          </button>
        </div>
      );
    }

    const filteredProblems = filterBySearch(allProblems);

    return (
      <>
        <div className="flex items-center justify-between mb-4">
          <SearchBar
            ref={searchInputRef}
            searchTerm={searchTerm} 
            onSearchChange={setSearchTerm}
            placeholder="Search by name, link, or notes..."
          />
          {!isAddingNew && (
            <button
              onClick={() => setIsAddingNew(true)}
              className="flex items-center gap-2 px-4 py-2 bg-app-accent hover:bg-app-accent-hover rounded-lg transition-colors ml-3 flex-shrink-0"
            >
              <Plus size={16} />
              Add Problem
            </button>
          )}
        </div>

        {isAddingNew && (
          <div className="bg-app-card rounded-lg p-4 border border-app-accent mb-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Add New Problem</h3>
              <button
                onClick={cancelAddNew}
                className="text-app-text-muted hover:text-white"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Problem name *"
                value={newProblem.name}
                onChange={(e) => setNewProblem({ ...newProblem, name: e.target.value })}
                className="w-full bg-app-input border border-app-border-secondary rounded px-3 py-2 text-sm focus:outline-none focus:border-app-accent"
              />
              
              <input
                type="text"
                placeholder="LeetCode link"
                value={newProblem.link}
                onChange={(e) => setNewProblem({ ...newProblem, link: e.target.value })}
                className="w-full bg-app-input border border-app-border-secondary rounded px-3 py-2 text-sm focus:outline-none focus:border-app-accent"
              />
              
              <textarea
                placeholder="Notes"
                value={newProblem.notes}
                onChange={(e) => setNewProblem({ ...newProblem, notes: e.target.value })}
                className="w-full bg-app-input border border-app-border-secondary rounded px-3 py-2 text-sm focus:outline-none focus:border-app-accent resize-none"
                rows="3"
              />

              <div className="flex items-center gap-4">
                <label className="text-sm flex items-center gap-2">
                  <span className="text-app-text-muted">Day:</span>
                  <select
                    value={newProblem.day}
                    onChange={(e) => setNewProblem({ ...newProblem, day: parseInt(e.target.value) })}
                    className="bg-app-input border border-app-border-secondary rounded px-2 py-1 text-sm focus:outline-none focus:border-app-accent"
                  >
                    {topics.map(topic => (
                      <option key={topic.day} value={topic.day}>
                        Day {topic.day} - {topic.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="text-sm flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newProblem.needsReview}
                    onChange={(e) => setNewProblem({ ...newProblem, needsReview: e.target.checked })}
                    className="rounded"
                  />
                  <span>Needs Review</span>
                </label>

                <label className="text-sm flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newProblem.isTricky}
                    onChange={(e) => setNewProblem({ ...newProblem, isTricky: e.target.checked })}
                    className="rounded"
                  />
                  <span>Tricky</span>
                </label>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={addNewProblem}
                  className="flex items-center gap-2 px-4 py-2 bg-app-accent hover:bg-app-accent-hover rounded transition-colors text-sm"
                >
                  <Plus size={14} />
                  Add Problem
                </button>
                <button
                  onClick={cancelAddNew}
                  className="px-4 py-2 bg-app-input hover:bg-app-input-dark rounded transition-colors text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {filteredProblems.length === 0 && !isAddingNew ? (
          <div className="text-center py-12 text-app-text-muted">
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
        <div className="text-center py-12 text-app-text-muted">
          <AlertCircle size={48} className="mx-auto mb-4 opacity-50" />
          <p>{emptyMessage}</p>
        </div>
      );
    }

    const searchFiltered = filterBySearch(filtered);

    return (
      <>
        <SearchBar
          ref={searchInputRef}
          searchTerm={searchTerm} 
          onSearchChange={setSearchTerm}
          placeholder="Search by name, link, or notes..."
        />
        {searchFiltered.length === 0 ? (
          <div className="text-center py-12 text-app-text-muted">
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
      <div className="min-h-screen bg-gradient-to-br from-app-bg-primary via-app-bg-secondary to-app-bg-primary text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-app-accent mx-auto mb-4"></div>
          <p className="text-app-text-muted">Loading your data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-app-bg-primary via-app-bg-secondary to-app-bg-primary text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">LeetCode Tracker</h1>
              <p className="text-app-text-muted">6-Day Rotation • 3 Problems Daily</p>
            </div>
            <button
              onClick={resetCycle}
              className="flex items-center gap-2 px-4 py-2 bg-app-card hover:bg-app-card-hover rounded-lg transition-colors"
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
        <div className="bg-app-bg-secondary rounded-xl p-6 border border-app-border">
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
                      onMarkSolvedAndSave={() => markSolvedAndSave(currentDay, problemNum)}
                      onMarkSolvedOnly={() => markSolvedOnly(currentDay, problemNum)}
                      onClear={() => clearDailyProblem(currentDay, problemNum)}
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

      {/* Modal */}
      <Modal
        isOpen={modal.isOpen}
        onClose={() => setModal({ ...modal, isOpen: false })}
        onConfirm={modal.onConfirm}
        title={modal.title}
        message={modal.message}
        type={modal.type}
        variant={modal.variant}
      />
    </div>
  );
};

export default DSATracker;