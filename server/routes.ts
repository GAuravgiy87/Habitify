import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertHabitSchema, insertHabitLogSchema, insertSleepLogSchema, insertWaterLogSchema, insertScreenTimeLogSchema } from "@shared/schema";
import { eq, and, desc, gte, lte } from "drizzle-orm";
import { habits, habitLogs, streaks, sleepLogs, waterLogs, screenTimeLogs, users } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  const apiPrefix = "/api";
  
  // Create a test user if it doesn't exist
  const existingUser = await storage.getUserByUsername("testuser");
  if (!existingUser) {
    await storage.createUser({
      username: "testuser",
      password: "password123",
      email: "test@example.com",
      displayName: "Test User"
    });
  }
  
  // Get current user ID (using the test user for now)
  const getCurrentUserId = async () => {
    const user = await storage.getUserByUsername("testuser");
    return user?.id || 1;
  };
  
  // Dashboard stats
  app.get(`${apiPrefix}/dashboard/stats`, async (req, res) => {
    try {
      const userId = await getCurrentUserId();
      
      // Get habits completion stats
      const allHabits = await storage.getHabitsByUser(userId);
      const todayHabitLogs = await storage.getHabitLogsForDate(userId, new Date());
      
      // Count completed habits
      const completedHabits = todayHabitLogs.filter(log => log.completed).length;
      const totalHabits = allHabits.length;
      const completionPercentage = totalHabits > 0 ? Math.round((completedHabits / totalHabits) * 100) : 0;
      
      // Get longest streak
      const userStreaks = await storage.getUserStreaks(userId);
      const longestStreak = userStreaks.reduce((max, streak) => Math.max(max, streak.current), 0);
      
      // Get latest sleep data
      const latestSleep = await storage.getLatestSleepLog(userId);
      const sleepQuality = latestSleep?.quality || 0;
      let qualityText = "Poor";
      if (sleepQuality >= 8) qualityText = "Excellent";
      else if (sleepQuality >= 6) qualityText = "Good";
      else if (sleepQuality >= 4) qualityText = "Fair";
      
      // Get screen time data
      const todayScreenTime = await storage.getScreenTimeForDate(userId, new Date());
      const yesterdayScreenTime = await storage.getScreenTimeForDate(userId, new Date(Date.now() - 86400000));
      const screenTimeChange = yesterdayScreenTime?.minutes ? 
        Math.round(((todayScreenTime?.minutes || 0) - yesterdayScreenTime.minutes) / yesterdayScreenTime.minutes * 100) : 0;
      
      const screenTimeMinutes = todayScreenTime?.minutes || 0;
      const screenTimeHours = Math.floor(screenTimeMinutes / 60);
      const screenTimeRemainingMinutes = screenTimeMinutes % 60;
      
      return res.json({
        success: true,
        data: {
          completed: {
            value: `${completedHabits}/${totalHabits}`,
            percentage: `${completionPercentage}%`
          },
          streak: {
            value: longestStreak.toString(),
            unit: "days"
          },
          sleep: {
            value: qualityText,
            time: `${(latestSleep?.duration || 0) / 60}h`
          },
          screenTime: {
            value: `${screenTimeHours}h ${screenTimeRemainingMinutes}m`,
            trend: screenTimeChange > 0 ? `+${screenTimeChange}%` : `${screenTimeChange}%`
          }
        }
      });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      return res.status(500).json({ error: "Failed to fetch dashboard stats" });
    }
  });
  
  // Habits endpoints
  
  // Get all habits for the current user
  app.get(`${apiPrefix}/habits`, async (req, res) => {
    try {
      const userId = await getCurrentUserId();
      const habitsData = await storage.getHabitsByUser(userId);
      const habitsWithLogs = await Promise.all(
        habitsData.map(async (habit) => {
          const todayLog = await storage.getHabitLogForDate(habit.id, new Date());
          let status = "not-started";
          if (todayLog) {
            status = todayLog.completed ? "completed" : todayLog.progress ? "in-progress" : "not-started";
          }
          
          return {
            id: habit.id,
            name: habit.name,
            icon: habit.icon,
            iconBgColor: habit.iconBgColor,
            iconColor: habit.iconColor,
            goal: {
              value: habit.goalValue,
              unit: habit.goalUnit
            },
            progress: todayLog?.progress || 0,
            status,
            type: habit.type
          };
        })
      );
      
      return res.json({
        success: true,
        data: habitsWithLogs
      });
    } catch (error) {
      console.error("Error fetching habits:", error);
      return res.status(500).json({ error: "Failed to fetch habits" });
    }
  });
  
  // Get all habits (active and archived) for the current user
  app.get(`${apiPrefix}/habits/all`, async (req, res) => {
    try {
      const userId = await getCurrentUserId();
      const activeHabits = await storage.getHabitsByUser(userId, true);
      const archivedHabits = await storage.getHabitsByUser(userId, false);
      
      const processHabit = async (habit: any) => {
        const todayLog = await storage.getHabitLogForDate(habit.id, new Date());
        let status = "not-started";
        if (todayLog) {
          status = todayLog.completed ? "completed" : todayLog.progress ? "in-progress" : "not-started";
        }
        
        return {
          id: habit.id,
          name: habit.name,
          icon: habit.icon,
          iconBgColor: habit.iconBgColor,
          iconColor: habit.iconColor,
          goal: {
            value: habit.goalValue,
            unit: habit.goalUnit
          },
          progress: todayLog?.progress || 0,
          status,
          type: habit.type,
          category: habit.category
        };
      };
      
      const activeHabitsWithLogs = await Promise.all(activeHabits.map(processHabit));
      const archivedHabitsWithLogs = await Promise.all(archivedHabits.map(processHabit));
      
      return res.json({
        success: true,
        data: {
          active: activeHabitsWithLogs,
          archived: archivedHabitsWithLogs
        }
      });
    } catch (error) {
      console.error("Error fetching all habits:", error);
      return res.status(500).json({ error: "Failed to fetch all habits" });
    }
  });
  
  // Update habit progress
  app.patch(`${apiPrefix}/habits/:id/progress`, async (req, res) => {
    try {
      const habitId = parseInt(req.params.id);
      const { progress } = req.body;
      
      if (typeof progress !== 'number') {
        return res.status(400).json({ error: "Progress must be a number" });
      }
      
      const habit = await storage.getHabitById(habitId);
      if (!habit) {
        return res.status(404).json({ error: "Habit not found" });
      }
      
      // Get or create today's log
      const today = new Date();
      let log = await storage.getHabitLogForDate(habitId, today);
      
      if (log) {
        // Update existing log
        await storage.updateHabitLog(log.id, {
          progress,
          completed: progress >= habit.goalValue
        });
      } else {
        // Create new log
        await storage.createHabitLog({
          habitId,
          date: today,
          progress,
          completed: progress >= habit.goalValue
        });
      }
      
      // Update streak if habit is completed
      if (progress >= habit.goalValue) {
        await storage.updateStreak(habitId, today);
      }
      
      return res.json({
        success: true,
        message: "Progress updated successfully"
      });
    } catch (error) {
      console.error("Error updating habit progress:", error);
      return res.status(500).json({ error: "Failed to update habit progress" });
    }
  });
  
  // Toggle habit completion
  app.patch(`${apiPrefix}/habits/:id/toggle`, async (req, res) => {
    try {
      const habitId = parseInt(req.params.id);
      const { completed } = req.body;
      
      if (typeof completed !== 'boolean') {
        return res.status(400).json({ error: "Completed must be a boolean" });
      }
      
      const habit = await storage.getHabitById(habitId);
      if (!habit) {
        return res.status(404).json({ error: "Habit not found" });
      }
      
      // Get or create today's log
      const today = new Date();
      let log = await storage.getHabitLogForDate(habitId, today);
      
      if (log) {
        // Update existing log
        await storage.updateHabitLog(log.id, {
          completed,
          progress: completed ? habit.goalValue : 0
        });
      } else {
        // Create new log
        await storage.createHabitLog({
          habitId,
          date: today,
          completed,
          progress: completed ? habit.goalValue : 0
        });
      }
      
      // Update streak if habit is completed
      if (completed) {
        await storage.updateStreak(habitId, today);
      }
      
      return res.json({
        success: true,
        message: "Habit completion toggled successfully"
      });
    } catch (error) {
      console.error("Error toggling habit completion:", error);
      return res.status(500).json({ error: "Failed to toggle habit completion" });
    }
  });
  
  // Check-in for a habit
  app.post(`${apiPrefix}/habits/:id/check-in`, async (req, res) => {
    try {
      const habitId = parseInt(req.params.id);
      
      const habit = await storage.getHabitById(habitId);
      if (!habit) {
        return res.status(404).json({ error: "Habit not found" });
      }
      
      // Get or create today's log
      const today = new Date();
      let log = await storage.getHabitLogForDate(habitId, today);
      
      if (log) {
        // Update existing log
        await storage.updateHabitLog(log.id, {
          completed: true,
          progress: habit.goalValue
        });
      } else {
        // Create new log
        await storage.createHabitLog({
          habitId,
          date: today,
          completed: true,
          progress: habit.goalValue
        });
      }
      
      // Update streak
      await storage.updateStreak(habitId, today);
      
      return res.json({
        success: true,
        message: "Habit checked in successfully"
      });
    } catch (error) {
      console.error("Error checking in habit:", error);
      return res.status(500).json({ error: "Failed to check in habit" });
    }
  });
  
  // Progress chart data
  app.get(`${apiPrefix}/progress`, async (req, res) => {
    try {
      const userId = await getCurrentUserId();
      const timeRange = req.query.timeRange || "week";
      
      let startDate: Date;
      const endDate = new Date();
      
      if (timeRange === "month") {
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);
      } else {
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 6);
      }
      
      const progressData = await storage.getProgressData(userId, startDate, endDate);
      
      return res.json({
        success: true,
        data: progressData
      });
    } catch (error) {
      console.error("Error fetching progress data:", error);
      return res.status(500).json({ error: "Failed to fetch progress data" });
    }
  });
  
  // Sleep data
  app.get(`${apiPrefix}/sleep`, async (req, res) => {
    try {
      const userId = await getCurrentUserId();
      const timeRange = req.query.timeRange || "week";
      
      let startDate: Date;
      const endDate = new Date();
      
      if (timeRange === "month") {
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);
      } else {
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 6);
      }
      
      const sleepData = await storage.getSleepData(userId, startDate, endDate);
      
      return res.json({
        success: true,
        data: sleepData
      });
    } catch (error) {
      console.error("Error fetching sleep data:", error);
      return res.status(500).json({ error: "Failed to fetch sleep data" });
    }
  });
  
  // Water intake data
  app.get(`${apiPrefix}/water-intake`, async (req, res) => {
    try {
      const userId = await getCurrentUserId();
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const startDate = new Date(today);
      startDate.setDate(startDate.getDate() - 6);
      
      const waterData = await storage.getWaterData(userId, startDate, today);
      const todayWater = waterData.find(item => {
        const itemDate = new Date(item.date);
        return itemDate.toDateString() === today.toDateString();
      });
      
      const userSettings = await storage.getUserSettings(userId);
      const dailyGoal = (userSettings?.waterGoal || 2000) / 1000; // Convert to liters
      
      return res.json({
        success: true,
        data: {
          today: {
            current: Number(((todayWater?.amount || 0) / 1000).toFixed(2)), // Convert to liters
            target: dailyGoal
          },
          weekData: waterData.map(day => ({
            day: day.dayName,
            amount: Number((day.amount / 1000).toFixed(2)) // Convert to liters
          }))
        }
      });
    } catch (error) {
      console.error("Error fetching water intake data:", error);
      return res.status(500).json({ error: "Failed to fetch water intake data" });
    }
  });
  
  // Add water intake
  app.post(`${apiPrefix}/water-intake`, async (req, res) => {
    try {
      const userId = await getCurrentUserId();
      const { amount } = req.body;
      
      if (typeof amount !== 'number' || amount <= 0) {
        return res.status(400).json({ error: "Amount must be a positive number" });
      }
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Convert amount from liters to ml
      const amountInMl = Math.round(amount * 1000);
      
      // Get today's water log if it exists
      const todayLog = await storage.getWaterLogForDate(userId, today);
      
      if (todayLog) {
        // Update existing log
        await storage.updateWaterLog(todayLog.id, {
          amount: todayLog.amount + amountInMl
        });
      } else {
        // Create new log
        await storage.createWaterLog({
          userId,
          date: today,
          amount: amountInMl
        });
      }
      
      return res.json({
        success: true,
        message: "Water intake added successfully"
      });
    } catch (error) {
      console.error("Error adding water intake:", error);
      return res.status(500).json({ error: "Failed to add water intake" });
    }
  });
  
  // Screen time data
  app.get(`${apiPrefix}/screen-time`, async (req, res) => {
    try {
      const userId = await getCurrentUserId();
      
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 6);
      
      const screenTimeData = await storage.getScreenTimeData(userId, startDate, endDate);
      
      // Calculate daily average
      const totalMinutes = screenTimeData.reduce((sum, day) => sum + day.minutes, 0);
      const dailyAverage = Math.round(totalMinutes / screenTimeData.length);
      
      // Get most used apps
      const todayScreenTime = await storage.getScreenTimeForDate(userId, new Date());
      let mostUsed = [];
      
      if (todayScreenTime && todayScreenTime.appUsage) {
        const appUsage = todayScreenTime.appUsage as Record<string, number>;
        mostUsed = Object.entries(appUsage)
          .map(([app, minutes]) => ({ app, minutes }))
          .sort((a, b) => b.minutes - a.minutes)
          .slice(0, 3);
      }
      
      return res.json({
        success: true,
        data: {
          dailyAverage,
          weekData: screenTimeData,
          mostUsed
        }
      });
    } catch (error) {
      console.error("Error fetching screen time data:", error);
      return res.status(500).json({ error: "Failed to fetch screen time data" });
    }
  });
  
  // Streaks data
  app.get(`${apiPrefix}/streaks`, async (req, res) => {
    try {
      const userId = await getCurrentUserId();
      
      const streakData = await storage.getTopStreaks(userId, 3);
      
      return res.json({
        success: true,
        data: streakData
      });
    } catch (error) {
      console.error("Error fetching streak data:", error);
      return res.status(500).json({ error: "Failed to fetch streak data" });
    }
  });
  
  // Performance data for radar chart
  app.get(`${apiPrefix}/performance`, async (req, res) => {
    try {
      const userId = await getCurrentUserId();
      
      // Get this week's and last week's data
      const today = new Date();
      const endOfThisWeek = new Date(today);
      const startOfThisWeek = new Date(today);
      startOfThisWeek.setDate(today.getDate() - 6);
      
      const endOfLastWeek = new Date(startOfThisWeek);
      endOfLastWeek.setDate(endOfLastWeek.getDate() - 1);
      const startOfLastWeek = new Date(endOfLastWeek);
      startOfLastWeek.setDate(startOfLastWeek.getDate() - 6);
      
      // Categories to track
      const categories = ["Exercise", "Sleep", "Nutrition", "Water", "Mindfulness"];
      
      // Mock performance data - in a real app, this would calculate based on actual habit completion
      const performanceData = categories.map(category => {
        const thisWeekScore = Math.floor(Math.random() * 30) + 70; // Random between 70-100
        const lastWeekScore = Math.floor(Math.random() * 30) + 60; // Random between 60-90
        
        return {
          category,
          thisWeek: thisWeekScore,
          lastWeek: lastWeekScore
        };
      });
      
      return res.json({
        success: true,
        data: {
          categories,
          data: performanceData
        }
      });
    } catch (error) {
      console.error("Error fetching performance data:", error);
      return res.status(500).json({ error: "Failed to fetch performance data" });
    }
  });
  
  // User settings
  app.get(`${apiPrefix}/user/settings`, async (req, res) => {
    try {
      const userId = await getCurrentUserId();
      
      const settings = await storage.getUserSettings(userId);
      
      if (!settings) {
        // Create default settings if none exist
        await storage.createUserSettings({
          userId,
          theme: "light",
          weekStartsOn: "sunday",
          notificationsEnabled: true,
          dailyReminderTime: "19:00",
          waterGoal: 2000,
          sleepGoal: 480,
          screenTimeGoal: null
        });
        
        return res.json({
          success: true,
          data: {
            theme: "light",
            weekStartsOn: "sunday",
            notificationsEnabled: true,
            dailyReminderTime: "19:00",
            waterGoal: 2000,
            sleepGoal: 480,
            screenTimeGoal: null
          }
        });
      }
      
      return res.json({
        success: true,
        data: settings
      });
    } catch (error) {
      console.error("Error fetching user settings:", error);
      return res.status(500).json({ error: "Failed to fetch user settings" });
    }
  });
  
  // Create the HTTP server
  const httpServer = createServer(app);
  
  return httpServer;
}
