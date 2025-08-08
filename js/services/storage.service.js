// Storage Service for Good Vibes Tracker
// Handles all LocalStorage operations
(function() {
    'use strict';
    angular.module('goodVibesApp').service('StorageService', StorageService);

    function StorageService() {
        var service = this;
        var STORAGE_PREFIX = 'goodvibes_';
        // Public methods
        service.saveMoodEntry = saveMoodEntry;
        service.getMoodEntries = getMoodEntries;
        service.getTodaysMoodEntries = getTodaysMoodEntries;
        service.getMoodStats = getMoodStats;
        service.clearAllData = clearAllData;
        // Habits methods
        service.addHabit = addHabit;
        service.getHabits = getHabits;
        service.toggleHabit = toggleHabit;
        service.deleteHabit = deleteHabit;
        // Gratitude methods
        service.addGratitudeEntry = addGratitudeEntry;
        service.getTodaysGratitudeEntries = getTodaysGratitudeEntries;
        service.deleteGratitudeEntry = deleteGratitudeEntry;
        service.getGratitudeStats = getGratitudeStats;
        service.getAllGratitudeEntries = getAllGratitudeEntries;
        // Settings methods
        service.exportAllData = exportAllData;
        service.getStorageUsage = getStorageUsage;
        /**
         * Save a mood entry to localStorage
         */
        function saveMoodEntry(moodData) {
            try {
                var today = getCurrentDateString();
                var existingEntries = getMoodEntriesForDate(today) || [];
                var newEntry = {
                    id: generateId(),
                    level: parseInt(moodData.level),
                    note: moodData.note || '',
                    timestamp: new Date().toISOString(),
                    time: getCurrentTimeString()
                };
                existingEntries.push(newEntry);
                var storageKey = STORAGE_PREFIX + 'mood_entries_' + today;
                localStorage.setItem(storageKey, JSON.stringify(existingEntries));
                console.log('Mood entry saved:', newEntry);
                return true;
            } catch (error) {
                console.error('Error saving mood entry:', error);
                return false;
            }
        }
        /**
         * Get all mood entries
         */
        function getMoodEntries() {
            try {
                var allEntries = [];
                for (var i = 0; i < localStorage.length; i++) {
                    var key = localStorage.key(i);
                    if (key && key.startsWith(STORAGE_PREFIX + 'mood_entries_')) {
                        var entries = JSON.parse(localStorage.getItem(key));
                        if (Array.isArray(entries)) {
                            allEntries = allEntries.concat(entries);
                        }
                    }
                }
                // Sort by timestamp (newest first)
                return allEntries.sort(function(a, b) {
                    return new Date(b.timestamp) - new Date(a.timestamp);
                });
            } catch (error) {
                console.error('Error getting mood entries:', error);
                return [];
            }
        }
        /**
         * Get today's mood entries
         */
        function getTodaysMoodEntries() {
            var today = getCurrentDateString();
            return getMoodEntriesForDate(today) || [];
        }
        /**
         * Get mood entries for a specific date
         */
        function getMoodEntriesForDate(dateString) {
            try {
                var storageKey = STORAGE_PREFIX + 'mood_entries_' + dateString;
                var entries = localStorage.getItem(storageKey);
                return entries ? JSON.parse(entries) : [];
            } catch (error) {
                console.error('Error getting mood entries for date:', error);
                return [];
            }
        }
        /**
         * Calculate mood statistics
         */
        function getMoodStats() {
            try {
                var allEntries = getMoodEntries();
                var todaysEntries = getTodaysMoodEntries();
                if (allEntries.length === 0) {
                    return null;
                }
                // Calculate today's average
                var todayAverage = 0;
                if (todaysEntries.length > 0) {
                    var todaySum = todaysEntries.reduce(function(sum, entry) {
                        return sum + entry.level;
                    }, 0);
                    todayAverage = Math.round(todaySum / todaysEntries.length * 10) / 10;
                }
                // Count unique days
                var uniqueDates = [];
                allEntries.forEach(function(entry) {
                    var date = entry.timestamp.split('T')[0];
                    if (uniqueDates.indexOf(date) === -1) {
                        uniqueDates.push(date);
                    }
                });
                return {
                    todayAverage: todayAverage,
                    totalRecords: allEntries.length,
                    daysTracked: uniqueDates.length
                };
            } catch (error) {
                console.error('Error calculating mood stats:', error);
                return null;
            }
        }
        /**
         * Clear all stored data
         */
        function clearAllData() {
            try {
                var keysToRemove = [];
                for (var i = 0; i < localStorage.length; i++) {
                    var key = localStorage.key(i);
                    if (key && key.startsWith(STORAGE_PREFIX)) {
                        keysToRemove.push(key);
                    }
                }
                keysToRemove.forEach(function(key) {
                    localStorage.removeItem(key);
                });
                console.log('All data cleared');
                return true;
            } catch (error) {
                console.error('Error clearing data:', error);
                return false;
            }
        }
        // ===== HABITS STORAGE METHODS =====
        /**
         * Add a new habit
         */
        function addHabit(habitData) {
            try {
                var habits = getHabits();
                var newHabit = {
                    id: generateId(),
                    name: habitData.name,
                    createdDate: getCurrentDateString(),
                    streak: 0,
                    completedToday: false,
                    completedTime: null,
                    lastCompleted: null
                };
                habits.push(newHabit);
                localStorage.setItem(STORAGE_PREFIX + 'habits', JSON.stringify(habits));
                console.log('Habit added:', newHabit);
                return true;
            } catch (error) {
                console.error('Error adding habit:', error);
                return false;
            }
        }
        /**
         * Get all habits
         */
        function getHabits() {
            try {
                var habits = localStorage.getItem(STORAGE_PREFIX + 'habits');
                if (!habits) return [];
                var parsedHabits = JSON.parse(habits);
                // Check and update daily completion status
                var today = getCurrentDateString();
                var updated = false;
                parsedHabits.forEach(function(habit) {
                    if (habit.lastCompleted !== today) {
                        habit.completedToday = false;
                        habit.completedTime = null;
                        updated = true;
                    }
                });
                // Save updated habits if needed
                if (updated) {
                    localStorage.setItem(STORAGE_PREFIX + 'habits', JSON.stringify(parsedHabits));
                }
                return parsedHabits;
            } catch (error) {
                console.error('Error getting habits:', error);
                return [];
            }
        }
        /**
         * Toggle habit completion
         */
        function toggleHabit(habitId) {
            try {
                var habits = getHabits();
                var habitIndex = habits.findIndex(function(habit) {
                    return habit.id === habitId;
                });
                if (habitIndex === -1) {
                    console.error('Habit not found:', habitId);
                    return false;
                }
                var habit = habits[habitIndex];
                var today = getCurrentDateString();
                var currentTime = getCurrentTimeString();
                if (habit.completedToday) {
                    // Mark as incomplete
                    habit.completedToday = false;
                    habit.completedTime = null;
                    habit.lastCompleted = null;
                    // Decrease streak if it was completed today
                    if (habit.streak > 0) {
                        habit.streak--;
                    }
                } else {
                    // Mark as complete
                    habit.completedToday = true;
                    habit.completedTime = currentTime;
                    habit.lastCompleted = today;
                    // Increase streak
                    habit.streak++;
                    // Save completion record for history
                    saveHabitCompletion(habitId, habit.name, today, currentTime);
                }
                localStorage.setItem(STORAGE_PREFIX + 'habits', JSON.stringify(habits));
                console.log('Habit toggled:', habit.name, 'Completed:', habit.completedToday);
                return true;
            } catch (error) {
                console.error('Error toggling habit:', error);
                return false;
            }
        }
        /**
         * Delete a habit
         */
        function deleteHabit(habitId) {
            try {
                var habits = getHabits();
                var filteredHabits = habits.filter(function(habit) {
                    return habit.id !== habitId;
                });
                localStorage.setItem(STORAGE_PREFIX + 'habits', JSON.stringify(filteredHabits));
                // Also remove habit completion records
                removeHabitCompletionRecords(habitId);
                console.log('Habit deleted:', habitId);
                return true;
            } catch (error) {
                console.error('Error deleting habit:', error);
                return false;
            }
        }
        /**
         * Save habit completion record for history
         */
        function saveHabitCompletion(habitId, habitName, date, time) {
            try {
                var key = STORAGE_PREFIX + 'habit_completions_' + date;
                var completions = JSON.parse(localStorage.getItem(key) || '[]');
                completions.push({
                    habitId: habitId,
                    habitName: habitName,
                    date: date,
                    time: time,
                    timestamp: new Date().toISOString()
                });
                localStorage.setItem(key, JSON.stringify(completions));
            } catch (error) {
                console.error('Error saving habit completion:', error);
            }
        }
        /**
         * Remove all completion records for a deleted habit
         */
        function removeHabitCompletionRecords(habitId) {
            try {
                for (var i = 0; i < localStorage.length; i++) {
                    var key = localStorage.key(i);
                    if (key && key.startsWith(STORAGE_PREFIX + 'habit_completions_')) {
                        var completions = JSON.parse(localStorage.getItem(key) || '[]');
                        var filtered = completions.filter(function(completion) {
                            return completion.habitId !== habitId;
                        });
                        if (filtered.length !== completions.length) {
                            if (filtered.length === 0) {
                                localStorage.removeItem(key);
                            } else {
                                localStorage.setItem(key, JSON.stringify(filtered));
                            }
                        }
                    }
                }
            } catch (error) {
                console.error('Error removing habit completion records:', error);
            }
        }
        // Helper functions
        function getCurrentDateString() {
            var now = new Date();
            return now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0');
        }

        function getCurrentTimeString() {
            var now = new Date();
            return String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
        }

        function generateId() {
            return 'item_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        }
        // ===== เพิ่ม Gratitude Storage Methods =====
        /**
         * Add a new gratitude entry
         */
        function addGratitudeEntry(gratitudeData) {
            try {
                var today = getCurrentDateString();
                var existingEntries = getTodaysGratitudeEntries() || [];
                var newEntry = {
                    id: generateId(),
                    text: gratitudeData.text,
                    timestamp: new Date().toISOString(),
                    time: getCurrentTimeString(),
                    date: today
                };
                existingEntries.push(newEntry);
                var storageKey = STORAGE_PREFIX + 'gratitude_entries_' + today;
                localStorage.setItem(storageKey, JSON.stringify(existingEntries));
                console.log('Gratitude entry added:', newEntry);
                return true;
            } catch (error) {
                console.error('Error adding gratitude entry:', error);
                return false;
            }
        }
        /**
         * Get today's gratitude entries
         */
        function getTodaysGratitudeEntries() {
            try {
                var today = getCurrentDateString();
                var storageKey = STORAGE_PREFIX + 'gratitude_entries_' + today;
                var entries = localStorage.getItem(storageKey);
                return entries ? JSON.parse(entries) : [];
            } catch (error) {
                console.error('Error getting todays gratitude entries:', error);
                return [];
            }
        }
        /**
         * Delete a gratitude entry by index
         */
        function deleteGratitudeEntry(index) {
            try {
                var today = getCurrentDateString();
                var entries = getTodaysGratitudeEntries();
                if (index >= 0 && index < entries.length) {
                    entries.splice(index, 1);
                    var storageKey = STORAGE_PREFIX + 'gratitude_entries_' + today;
                    localStorage.setItem(storageKey, JSON.stringify(entries));
                    console.log('Gratitude entry deleted at index:', index);
                    return true;
                } else {
                    console.error('Invalid gratitude entry index:', index);
                    return false;
                }
            } catch (error) {
                console.error('Error deleting gratitude entry:', error);
                return false;
            }
        }
        /**
         * Get all gratitude entries
         */
        function getAllGratitudeEntries() {
            try {
                var allEntries = [];
                for (var i = 0; i < localStorage.length; i++) {
                    var key = localStorage.key(i);
                    if (key && key.startsWith(STORAGE_PREFIX + 'gratitude_entries_')) {
                        var entries = JSON.parse(localStorage.getItem(key));
                        if (Array.isArray(entries)) {
                            allEntries = allEntries.concat(entries);
                        }
                    }
                }
                // Sort by timestamp (newest first)
                return allEntries.sort(function(a, b) {
                    return new Date(b.timestamp) - new Date(a.timestamp);
                });
            } catch (error) {
                console.error('Error getting all gratitude entries:', error);
                return [];
            }
        }
        /**
         * Calculate gratitude statistics
         */
        function getGratitudeStats() {
            try {
                var allEntries = getAllGratitudeEntries();
                var todaysEntries = getTodaysGratitudeEntries();
                if (allEntries.length === 0) {
                    return {
                        totalEntries: 0,
                        todaysCount: 0,
                        daysPracticed: 0,
                        averagePerDay: 0
                    };
                }
                // Count unique days
                var uniqueDates = [];
                allEntries.forEach(function(entry) {
                    var date = entry.date || entry.timestamp.split('T')[0];
                    if (uniqueDates.indexOf(date) === -1) {
                        uniqueDates.push(date);
                    }
                });
                var averagePerDay = uniqueDates.length > 0 ? Math.round((allEntries.length / uniqueDates.length) * 10) / 10 : 0;
                return {
                    totalEntries: allEntries.length,
                    todaysCount: todaysEntries.length,
                    daysPracticed: uniqueDates.length,
                    averagePerDay: averagePerDay
                };
            } catch (error) {
                console.error('Error calculating gratitude stats:', error);
                return null;
            }
        }
        /**
         * Export all data
         */
        function exportAllData() {
            try {
                var exportData = {
                    exportDate: new Date().toISOString(),
                    version: '1.0.0',
                    data: {}
                };
                // Collect all app data
                for (var i = 0; i < localStorage.length; i++) {
                    var key = localStorage.key(i);
                    if (key && key.startsWith(STORAGE_PREFIX)) {
                        var cleanKey = key.replace(STORAGE_PREFIX, '');
                        exportData.data[cleanKey] = JSON.parse(localStorage.getItem(key));
                    }
                }
                // Check if there's any data to export
                if (Object.keys(exportData.data).length === 0) {
                    return null;
                }
                console.log('Data prepared for export:', Object.keys(exportData.data).length, 'items');
                return exportData;
            } catch (error) {
                console.error('Error preparing export data:', error);
                return null;
            }
        }
        /**
         * Get storage usage information
         */
        function getStorageUsage() {
            try {
                // Calculate used storage
                var totalSize = 0;
                for (var key in localStorage) {
                    if (localStorage.hasOwnProperty(key) && key.startsWith(STORAGE_PREFIX)) {
                        totalSize += localStorage[key].length + key.length;
                    }
                }
                // Estimate available storage (5MB is typical localStorage limit)
                var estimatedLimit = 5 * 1024 * 1024; // 5MB in bytes
                return {
                    used: totalSize * 2, // Rough estimate (UTF-16 encoding)
                    total: estimatedLimit,
                    percentage: Math.round((totalSize * 2 / estimatedLimit) * 100)
                };
            } catch (error) {
                console.error('Error calculating storage usage:', error);
                return {
                    used: 0,
                    total: 0,
                    percentage: 0
                };
            }
        }
    }
})();