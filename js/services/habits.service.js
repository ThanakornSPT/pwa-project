// Habits Service for Good Vibes Tracker
// Handles habits-specific operations

(function() {
    'use strict';
    
    angular.module('goodVibesApp')
        .service('HabitsService', HabitsService);
    
    HabitsService.$inject = ['StorageService'];
    
    function HabitsService(StorageService) {
        var service = this;
        
        // Pre-defined habit templates
        var HABIT_TEMPLATES = [
            'Drink 8 glasses of water',
            'Exercise for 30 minutes',
            'Meditate for 10 minutes',
            'Read for 20 minutes',
            'Write in gratitude journal',
            'Take a walk outside',
            'Eat 5 servings of fruits/vegetables',
            'Practice deep breathing',
            'Stretch for 10 minutes',
            'Call a friend or family member',
            'No social media for 1 hour',
            'Go to bed before 11 PM',
            'Wake up without snoozing',
            'Practice a hobby',
            'Learn something new'
        ];
        
        // Public methods
        service.getHabitTemplates = getHabitTemplates;
        service.getHabitStats = getHabitStats;
        service.getHabitHistory = getHabitHistory;
        service.calculateHabitStreak = calculateHabitStreak;
        
        /**
         * Get pre-defined habit templates
         */
        function getHabitTemplates() {
            return HABIT_TEMPLATES;
        }
        
        /**
         * Get detailed habit statistics
         */
        function getHabitStats() {
            try {
                var habits = StorageService.getHabits();
                
                if (habits.length === 0) {
                    return {
                        totalHabits: 0,
                        completedToday: 0,
                        completionRate: 0,
                        longestStreak: 0,
                        averageStreak: 0
                    };
                }
                
                var completedToday = habits.filter(function(h) { return h.completedToday; }).length;
                var streaks = habits.map(function(h) { return h.streak; });
                var longestStreak = Math.max.apply(Math, streaks);
                var averageStreak = streaks.reduce(function(a, b) { return a + b; }, 0) / streaks.length;
                
                return {
                    totalHabits: habits.length,
                    completedToday: completedToday,
                    completionRate: Math.round((completedToday / habits.length) * 100),
                    longestStreak: longestStreak,
                    averageStreak: Math.round(averageStreak * 10) / 10
                };
            } catch (error) {
                console.error('Error calculating habit stats:', error);
                return null;
            }
        }
        
        /**
         * Get habit completion history
         */
        function getHabitHistory(days) {
            days = days || 7; // Default to 7 days
            
            try {
                var history = [];
                var today = new Date();
                
                for (var i = 0; i < days; i++) {
                    var date = new Date(today);
                    date.setDate(date.getDate() - i);
                    var dateString = formatDateString(date);
                    
                    var key = 'goodvibes_habit_completions_' + dateString;
                    var completions = JSON.parse(localStorage.getItem(key) || '[]');
                    
                    history.push({
                        date: dateString,
                        completions: completions,
                        completionCount: completions.length
                    });
                }
                
                return history.reverse(); // Oldest first
            } catch (error) {
                console.error('Error getting habit history:', error);
                return [];
            }
        }
        
        /**
         * Calculate actual habit streak based on completion history
         */
        function calculateHabitStreak(habitId) {
            try {
                var streak = 0;
                var today = new Date();
                
                // Check backwards from today
                for (var i = 0; i < 365; i++) { // Max 365 days
                    var checkDate = new Date(today);
                    checkDate.setDate(checkDate.getDate() - i);
                    var dateString = formatDateString(checkDate);
                    
                    var key = 'goodvibes_habit_completions_' + dateString;
                    var completions = JSON.parse(localStorage.getItem(key) || '[]');
                    
                    var completedOnThisDate = completions.some(function(completion) {
                        return completion.habitId === habitId;
                    });
                    
                    if (completedOnThisDate) {
                        streak++;
                    } else {
                        break; // Streak is broken
                    }
                }
                
                return streak;
            } catch (error) {
                console.error('Error calculating habit streak:', error);
                return 0;
            }
        }
        
        // Helper function
        function formatDateString(date) {
            return date.getFullYear() + '-' + 
                   String(date.getMonth() + 1).padStart(2, '0') + '-' + 
                   String(date.getDate()).padStart(2, '0');
        }
    }
})();
