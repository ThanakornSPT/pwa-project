// Mood Controller for Good Vibes Tracker
// Handles mood tracking and habits functionality
(function() {
    'use strict';
    angular.module('goodVibesApp').controller('MoodController', MoodController);
    MoodController.$inject = ['StorageService'];

    function MoodController(StorageService) {
        var vm = this;
        // Public properties
        vm.currentMood = 5;
        vm.currentNote = '';
        vm.todaysEntries = [];
        vm.stats = null;
        // Habits properties
        vm.habits = [];
        vm.showAddHabit = false;
        vm.newHabitName = '';
        // Gratitude properties
        vm.currentGratitude = '';
        vm.todaysGratitude = [];
        vm.gratitudeStats = null;
        vm.gratitudePrompts = ['My health and wellbeing', 'A person who made my day better', 'Something beautiful I saw today', 'A moment of peace I experienced', 'Food that nourished me', 'A skill or ability I have', 'Technology that helps me', 'A place that brings me joy'];
        // Settings properties (เพิ่มหลัง gratitude properties)
        vm.showSettings = false;
        vm.showResetConfirm = false;
        // Public methods
        vm.getCurrentDate = getCurrentDate;
        vm.updateMoodDisplay = updateMoodDisplay;
        vm.getMoodEmoji = getMoodEmoji;
        vm.getMoodText = getMoodText;
        vm.getEmojiForLevel = getEmojiForLevel;
        vm.saveMood = saveMood;
        // Habits methods
        vm.addHabit = addHabit;
        vm.addHabitOnEnter = addHabitOnEnter;
        vm.cancelAddHabit = cancelAddHabit;
        vm.toggleHabit = toggleHabit;
        vm.deleteHabit = deleteHabit;
        vm.getTodayCompletionPercentage = getTodayCompletionPercentage;
        vm.getCompletedHabitsCount = getCompletedHabitsCount;
        // ===== เพิ่ม Methods ให้ VM =====
        // Gratitude methods
        vm.addGratitude = addGratitude;
        vm.deleteGratitude = deleteGratitude;
        vm.usePrompt = usePrompt;
        // Settings methods
        vm.exportData = exportData;
        vm.confirmReset = confirmReset;
        vm.cancelReset = cancelReset;
        vm.getStorageUsage = getStorageUsage;
        vm.getTotalRecords = getTotalRecords;
        // Initialize controller
        init();
        /**
         * Initialize controller
         */
        function init() {
            loadTodaysEntries();
            loadHabits();
            loadTodaysGratitude();
            loadStats();
            updateMoodDisplay();
            console.log('MoodController initialized with habits support');
        }
        /**
         * Get current date in Thai format
         */
        function getCurrentDate() {
            var now = new Date();
            var options = {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                weekday: 'long'
            };
            return now.toLocaleDateString('th-TH', options);
        }
        /**
         * Update mood display (called when slider changes)
         */
        function updateMoodDisplay() {
            // This method can be extended for real-time updates
            console.log('Mood level updated to:', vm.currentMood);
        }
        /**
         * Get emoji for current mood level
         */
        function getMoodEmoji() {
            return getEmojiForLevel(vm.currentMood);
        }
        /**
         * Get text description for current mood level
         */
        function getMoodText() {
            var moodTexts = {
                1: 'Very Low Energy',
                2: 'Low Energy',
                3: 'Below Average',
                4: 'Slightly Low',
                5: 'Neutral',
                6: 'Good',
                7: 'Very Good',
                8: 'Great',
                9: 'Excellent',
                10: 'Amazing!'
            };
            return moodTexts[vm.currentMood] || 'Neutral';
        }
        /**
         * Get emoji for any mood level
         */
        function getEmojiForLevel(level) {
            var emojis = {
                1: '😫',
                2: '😔',
                3: '😐',
                4: '🙂',
                5: '😊',
                6: '😄',
                7: '😁',
                8: '🤩',
                9: '🌟',
                10: '✨'
            };
            return emojis[level] || '😊';
        }
        /**
         * Save current mood entry
         */
        function saveMood() {
            if (!vm.currentMood) {
                alert('Please select your mood level');
                return;
            }
            var moodData = {
                level: vm.currentMood,
                note: vm.currentNote
            };
            var success = StorageService.saveMoodEntry(moodData);
            if (success) {
                // Clear the note after saving
                vm.currentNote = '';
                // Reload data
                loadTodaysEntries();
                loadStats();
                // Show success feedback
                showSuccessMessage();
                console.log('Mood saved successfully');
            } else {
                alert('Failed to save mood. Please try again.');
            }
        }
        /**
         * Load today's mood entries
         */
        function loadTodaysEntries() {
            vm.todaysEntries = StorageService.getTodaysMoodEntries();
            console.log('Loaded todays entries:', vm.todaysEntries.length);
        }
        /**
         * Load mood statistics
         */
        function loadStats() {
            vm.stats = StorageService.getMoodStats();
            console.log('Loaded stats:', vm.stats);
        }
        /**
         * Show success message after saving
         */
        function showSuccessMessage() {
            // Simple success feedback
            var button = document.querySelector('.save-mood-btn');
            if (button) {
                var originalText = button.innerHTML;
                button.innerHTML = '✅ Saved!';
                button.style.background = '#4CAF50';
                setTimeout(function() {
                    button.innerHTML = originalText;
                    button.style.background = '';
                }, 2000);
            }
        }
        // ===== HABITS METHODS =====
        /**
         * Add new habit
         */
        function addHabit() {
            if (!vm.newHabitName || vm.newHabitName.trim() === '') {
                alert('Please enter a habit name');
                return;
            }
            var habitData = {
                name: vm.newHabitName.trim()
            };
            var success = StorageService.addHabit(habitData);
            if (success) {
                vm.newHabitName = '';
                vm.showAddHabit = false;
                loadHabits();
                console.log('Habit added successfully');
            } else {
                alert('Failed to add habit. Please try again.');
            }
        }
        /**
         * Add habit when Enter key is pressed
         */
        function addHabitOnEnter(event) {
            if (event.keyCode === 13) {
                addHabit();
            }
        }
        /**
         * Cancel adding new habit
         */
        function cancelAddHabit() {
            vm.newHabitName = '';
            vm.showAddHabit = false;
        }
        /**
         * Toggle habit completion
         */
        function toggleHabit(habitId) {
            var success = StorageService.toggleHabit(habitId);
            if (success) {
                loadHabits();
                loadStats(); // Update stats when habit is toggled
                // Show visual feedback
                showHabitToggleFeedback(habitId);
                console.log('Habit toggled:', habitId);
            } else {
                alert('Failed to update habit. Please try again.');
            }
        }
        /**
         * Delete a habit
         */
        function deleteHabit(habitId) {
            if (confirm('Are you sure you want to delete this habit?')) {
                var success = StorageService.deleteHabit(habitId);
                if (success) {
                    loadHabits();
                    loadStats(); // Update stats when habit is deleted
                    console.log('Habit deleted:', habitId);
                } else {
                    alert('Failed to delete habit. Please try again.');
                }
            }
        }
        /**
         * Get today's habit completion percentage
         */
        function getTodayCompletionPercentage() {
            if (vm.habits.length === 0) return 0;
            var completedCount = vm.habits.filter(function(habit) {
                return habit.completedToday;
            }).length;
            return Math.round((completedCount / vm.habits.length) * 100);
        }
        /**
         * Get count of completed habits today
         */
        function getCompletedHabitsCount() {
            return vm.habits.filter(function(habit) {
                return habit.completedToday;
            }).length;
        }
        /**
         * Load habits from storage
         */
        function loadHabits() {
            vm.habits = StorageService.getHabits();
            console.log('Loaded habits:', vm.habits.length);
        }
        /**
         * Show visual feedback when habit is toggled
         */
        function showHabitToggleFeedback(habitId) {
            // Find the habit toggle button and show animation
            setTimeout(function() {
                var toggleBtn = document.querySelector('.habit-toggle[ng-click*="' + habitId + '"]');
                if (toggleBtn) {
                    toggleBtn.style.transform = 'scale(1.2)';
                    setTimeout(function() {
                        toggleBtn.style.transform = '';
                    }, 200);
                }
            }, 50);
        }
        // ===== เพิ่ม Gratitude Methods =====
        /**
         * Add new gratitude entry
         */
        function addGratitude() {
            if (!vm.currentGratitude || vm.currentGratitude.trim() === '') {
                alert('Please enter something you\'re grateful for');
                return;
            }
            var gratitudeData = {
                text: vm.currentGratitude.trim()
            };
            var success = StorageService.addGratitudeEntry(gratitudeData);
            if (success) {
                vm.currentGratitude = '';
                loadTodaysGratitude();
                loadGratitudeStats();
                loadStats(); // Update main stats
                // Show success animation
                showGratitudeAddedFeedback();
                console.log('Gratitude added successfully');
            } else {
                alert('Failed to add gratitude. Please try again.');
            }
        }
        /**
         * Delete a gratitude entry
         */
        function deleteGratitude(index) {
            if (confirm('Are you sure you want to delete this gratitude entry?')) {
                var success = StorageService.deleteGratitudeEntry(index);
                if (success) {
                    loadTodaysGratitude();
                    loadGratitudeStats();
                    loadStats();
                    console.log('Gratitude entry deleted');
                } else {
                    alert('Failed to delete gratitude entry. Please try again.');
                }
            }
        }
        /**
         * Use a gratitude prompt
         */
        function usePrompt(prompt) {
            vm.currentGratitude = prompt;
            // Focus on textarea
            setTimeout(function() {
                var textarea = document.querySelector('.gratitude-input');
                if (textarea) {
                    textarea.focus();
                    // Move cursor to end
                    textarea.setSelectionRange(textarea.value.length, textarea.value.length);
                }
            }, 100);
        }
        /**
         * Load today's gratitude entries
         */
        function loadTodaysGratitude() {
            vm.todaysGratitude = StorageService.getTodaysGratitudeEntries();
            console.log('Loaded todays gratitude entries:', vm.todaysGratitude.length);
        }
        /**
         * Load gratitude statistics
         */
        function loadGratitudeStats() {
            vm.gratitudeStats = StorageService.getGratitudeStats();
            console.log('Loaded gratitude stats:', vm.gratitudeStats);
        }
        /**
         * Show visual feedback when gratitude is added
         */
        function showGratitudeAddedFeedback() {
            var button = document.querySelector('.add-gratitude-btn');
            if (button) {
                var originalText = button.innerHTML;
                var originalColor = button.style.background;
                button.innerHTML = 'Added!';
                button.style.background = '#4CAF50';
                setTimeout(function() {
                    button.innerHTML = originalText;
                    button.style.background = originalColor;
                }, 2000);
            }
            // Scroll to gratitude list
            setTimeout(function() {
                var gratitudeList = document.querySelector('.todays-gratitude');
                if (gratitudeList) {
                    gratitudeList.scrollIntoView({
                        behavior: 'smooth',
                        block: 'nearest'
                    });
                }
            }, 300);
        }
        /**
         * Export all data as JSON
         */
        function exportData() {
            try {
                var allData = StorageService.exportAllData();
                if (allData) {
                    // Create downloadable file
                    var dataStr = JSON.stringify(allData, null, 2);
                    var dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
                    var exportFileDefaultName = 'goodvibes-data-' + getCurrentDateString() + '.json';
                    var linkElement = document.createElement('a');
                    linkElement.setAttribute('href', dataUri);
                    linkElement.setAttribute('download', exportFileDefaultName);
                    linkElement.click();
                    alert('✅ Data exported successfully! Check your downloads folder.');
                    console.log('Data exported successfully');
                } else {
                    alert('❌ No data to export');
                }
            } catch (error) {
                console.error('Error exporting data:', error);
                alert('❌ Failed to export data. Please try again.');
            }
        }
        /**
         * Confirm data reset
         */
        function confirmReset() {
            var success = StorageService.clearAllData();
            if (success) {
                // Reset all view model data
                vm.currentMood = 5;
                vm.currentNote = '';
                vm.todaysEntries = [];
                vm.habits = [];
                vm.currentGratitude = '';
                vm.todaysGratitude = [];
                vm.stats = null;
                vm.gratitudeStats = null;
                vm.showResetConfirm = false;
                vm.showSettings = false;
                // Show success message
                alert('✅ All data has been reset successfully!');
                // Reload page to ensure clean state
                setTimeout(function() {
                    window.location.reload();
                }, 1000);
                console.log('All data reset successfully');
            } else {
                alert('❌ Failed to reset data. Please try again.');
            }
        }
        /**
         * Cancel data reset
         */
        function cancelReset() {
            vm.showResetConfirm = false;
        }
        /**
         * Get storage usage information
         */
        function getStorageUsage() {
            try {
                var usage = StorageService.getStorageUsage();
                if (usage.total > 0) {
                    var usedMB = (usage.used / (1024 * 1024)).toFixed(2);
                    var totalMB = (usage.total / (1024 * 1024)).toFixed(2);
                    return usedMB + ' MB / ' + totalMB + ' MB';
                } else {
                    return 'Unknown';
                }
            } catch (error) {
                console.error('Error getting storage usage:', error);
                return 'Error';
            }
        }
        /**
         * Get total records count
         */
        function getTotalRecords() {
            try {
                var moodCount = StorageService.getMoodEntries().length;
                var habitsCount = StorageService.getHabits().length;
                var gratitudeCount = StorageService.getAllGratitudeEntries ? StorageService.getAllGratitudeEntries().length : 0;
                return (moodCount + gratitudeCount) + ' entries + ' + habitsCount + ' habits';
            } catch (error) {
                console.error('Error getting total records:', error);
                return 'Error';
            }
        }
        /**
         * Get current date string for export filename
         */
        function getCurrentDateString() {
            var now = new Date();
            return now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0');
        }
    }
})();