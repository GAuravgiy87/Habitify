import { db } from "@db";
import { 
  users, 
  habits, 
  habitLogs, 
  streaks, 
  sleepLogs, 
  waterLogs, 
  screenTimeLogs,
  userSettings
} from "@shared/schema";
import { eq, and, desc, gte, lte, sql } from "drizzle-orm";
import { getDayName } from "@/lib/utils";

// User methods
export const storage = {
  // User methods
  async getUserByUsername(username: string) {
    return await db.query.users.findFirst({
      where: eq(users.username, username)
    });
  },

  async createUser(userData: { username: string; password: string; email: string; displayName?: string }) {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  },

  // Habit methods
  async getHabitsByUser(userId: number, activeOnly: boolean = true) {
    if (activeOnly) {
      return await db.query.habits.findMany({
        where: and(
          eq(habits.userId, userId),
          eq(habits.active, true)
        ),
        orderBy: desc(habits.createdAt)
      });
    } else {
      return await db.query.habits.findMany({
        where: and(
          eq(habits.userId, userId),
          eq(habits.active, false)
        ),
        orderBy: desc(habits.createdAt)
      });
    }
  },

  async getHabitById(habitId: number) {
    return await db.query.habits.findFirst({
      where: eq(habits.id, habitId)
    });
  },

  async createHabit(habitData: { 
    userId: number; 
    name: string; 
    description?: string; 
    icon: string;
    iconBgColor: string;
    iconColor: string;
    type: string;
    category?: string;
    goalValue: number;
    goalUnit: string;
    frequency: any;
    reminderTime?: string;
  }) {
    const [habit] = await db.insert(habits).values(habitData).returning();
    
    // Initialize streak for this habit
    await db.insert(streaks).values({
      habitId: habit.id,
      current: 0,
      longest: 0
    });
    
    return habit;
  },

  async updateHabit(habitId: number, habitData: Partial<typeof habits.$inferInsert>) {
    const [updatedHabit] = await db.update(habits)
      .set(habitData)
      .where(eq(habits.id, habitId))
      .returning();
    return updatedHabit;
  },

  // Habit logs methods
  async getHabitLogsForDate(userId: number, date: Date) {
    // Format date to YYYY-MM-DD to match SQL date format
    const formattedDate = date.toISOString().split('T')[0];
    
    // Get all habit logs for this user on this date
    const result = await db.select({
      id: habitLogs.id,
      habitId: habitLogs.habitId,
      date: habitLogs.date,
      completed: habitLogs.completed,
      progress: habitLogs.progress
    })
    .from(habitLogs)
    .innerJoin(habits, eq(habitLogs.habitId, habits.id))
    .where(
      and(
        eq(habits.userId, userId),
        eq(sql`DATE(${habitLogs.date})`, formattedDate)
      )
    );
    
    return result;
  },

  async getHabitLogForDate(habitId: number, date: Date) {
    // Format date to YYYY-MM-DD to match SQL date format
    const formattedDate = date.toISOString().split('T')[0];
    
    const log = await db.query.habitLogs.findFirst({
      where: and(
        eq(habitLogs.habitId, habitId),
        eq(sql`DATE(${habitLogs.date})`, formattedDate)
      )
    });
    
    return log;
  },

  async createHabitLog(logData: { 
    habitId: number; 
    date: Date; 
    completed?: boolean; 
    skipped?: boolean;
    progress?: number;
    notes?: string;
  }) {
    const [log] = await db.insert(habitLogs).values(logData).returning();
    return log;
  },

  async updateHabitLog(logId: number, logData: Partial<typeof habitLogs.$inferInsert>) {
    const [updatedLog] = await db.update(habitLogs)
      .set(logData)
      .where(eq(habitLogs.id, logId))
      .returning();
    return updatedLog;
  },

  // Streak methods
  async getStreakByHabitId(habitId: number) {
    return await db.query.streaks.findFirst({
      where: eq(streaks.habitId, habitId)
    });
  },
  
  async getUserStreaks(userId: number) {
    const result = await db.select({
      id: streaks.id,
      habitId: streaks.habitId,
      current: streaks.current,
      longest: streaks.longest,
      lastLogDate: streaks.lastLogDate,
      habitName: habits.name
    })
    .from(streaks)
    .innerJoin(habits, eq(streaks.habitId, habits.id))
    .where(eq(habits.userId, userId))
    .orderBy(desc(streaks.current));
    
    return result;
  },

  async updateStreak(habitId: number, date: Date) {
    // Get current streak
    const streak = await this.getStreakByHabitId(habitId);
    if (!streak) {
      // Create new streak if it doesn't exist
      const [newStreak] = await db.insert(streaks).values({
        habitId,
        current: 1,
        longest: 1,
        lastLogDate: date
      }).returning();
      return newStreak;
    }

    // Get previous day's date
    const previousDay = new Date(date);
    previousDay.setDate(previousDay.getDate() - 1);
    const previousDayFormatted = previousDay.toISOString().split('T')[0];
    
    // Check if yesterday's log exists
    const previousLog = await this.getHabitLogForDate(habitId, previousDay);
    
    let currentStreak = streak.current;
    
    // Update streak logic
    if (streak.lastLogDate) {
      const lastLogDate = new Date(streak.lastLogDate);
      const lastLogFormatted = lastLogDate.toISOString().split('T')[0];
      const today = date.toISOString().split('T')[0];
      
      if (lastLogFormatted === previousDayFormatted) {
        // Consecutive day, increment streak
        currentStreak += 1;
      } else if (lastLogFormatted === today) {
        // Already logged today, don't change streak
        return streak;
      } else {
        // Break in streak, reset to 1
        currentStreak = 1;
      }
    } else {
      // First time tracking, start at 1
      currentStreak = 1;
    }
    
    // Update the streak
    const [updatedStreak] = await db.update(streaks)
      .set({
        current: currentStreak,
        longest: Math.max(currentStreak, streak.longest || 0),
        lastLogDate: date
      })
      .where(eq(streaks.habitId, habitId))
      .returning();
      
    return updatedStreak;
  },
  
  async getTopStreaks(userId: number, limit: number) {
    const result = await db.select({
      id: streaks.id,
      habitId: streaks.habitId,
      streak: streaks.current,
      habitName: habits.name,
      icon: habits.icon,
      iconBgColor: habits.iconBgColor,
      iconColor: habits.iconColor,
      goal: sql<string>`${habits.goalValue} || ' ' || ${habits.goalUnit} || ' ' || 
        CASE 
          WHEN json_extract(${habits.frequency}, '$.type') = 'daily' THEN 'daily'
          WHEN json_extract(${habits.frequency}, '$.type') = 'weekly' THEN 'weekly'
          ELSE ''
        END`
    })
    .from(streaks)
    .innerJoin(habits, eq(streaks.habitId, habits.id))
    .where(eq(habits.userId, userId))
    .orderBy(desc(streaks.current))
    .limit(limit);
    
    return result;
  },

  // Sleep tracking methods
  async getLatestSleepLog(userId: number) {
    return await db.query.sleepLogs.findFirst({
      where: eq(sleepLogs.userId, userId),
      orderBy: desc(sleepLogs.date)
    });
  },

  async getSleepData(userId: number, startDate: Date, endDate: Date) {
    const result = await db.select({
      id: sleepLogs.id,
      date: sleepLogs.date,
      duration: sleepLogs.duration,
      quality: sleepLogs.quality
    })
    .from(sleepLogs)
    .where(
      and(
        eq(sleepLogs.userId, userId),
        gte(sleepLogs.date, startDate),
        lte(sleepLogs.date, endDate)
      )
    )
    .orderBy(sleepLogs.date);
    
    // Transform to day-based format for chart
    const formattedData = result.map(log => {
      const date = new Date(log.date);
      return {
        day: getDayName(date.getDay()),
        duration: Math.round(log.duration / 60), // Convert minutes to hours
        quality: log.quality
      };
    });
    
    // Fill in any missing days with default values
    const dayMap = new Map(formattedData.map(d => [d.day, d]));
    
    const days = [];
    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dayName = getDayName(currentDate.getDay());
      if (!dayMap.has(dayName)) {
        days.push({
          day: dayName,
          duration: 0,
          quality: 0
        });
      } else {
        days.push(dayMap.get(dayName)!);
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return days;
  },

  async createSleepLog(logData: { 
    userId: number; 
    date: Date; 
    duration: number;
    startTime?: Date;
    endTime?: Date;
    quality?: number;
    notes?: string;
  }) {
    const [log] = await db.insert(sleepLogs).values(logData).returning();
    return log;
  },

  // Water tracking methods
  async getWaterLogForDate(userId: number, date: Date) {
    // Format date to YYYY-MM-DD to match SQL date format
    const formattedDate = date.toISOString().split('T')[0];
    
    return await db.query.waterLogs.findFirst({
      where: and(
        eq(waterLogs.userId, userId),
        eq(sql`DATE(${waterLogs.date})`, formattedDate)
      )
    });
  },

  async getWaterData(userId: number, startDate: Date, endDate: Date) {
    const result = await db.select({
      id: waterLogs.id,
      date: waterLogs.date,
      amount: waterLogs.amount
    })
    .from(waterLogs)
    .where(
      and(
        eq(waterLogs.userId, userId),
        gte(waterLogs.date, startDate),
        lte(waterLogs.date, endDate)
      )
    )
    .orderBy(waterLogs.date);
    
    // Transform to day-based format for chart
    const formattedData = result.map(log => {
      const date = new Date(log.date);
      return {
        date: log.date,
        dayName: getDayName(date.getDay()),
        amount: log.amount
      };
    });
    
    // Fill in any missing days with default values
    const dayMap = new Map(formattedData.map(d => [d.date.toISOString().split('T')[0], d]));
    
    const days = [];
    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      if (!dayMap.has(dateStr)) {
        days.push({
          date: new Date(currentDate),
          dayName: getDayName(currentDate.getDay()),
          amount: 0
        });
      } else {
        days.push(dayMap.get(dateStr)!);
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return days;
  },

  async createWaterLog(logData: { userId: number; date: Date; amount: number }) {
    const [log] = await db.insert(waterLogs).values(logData).returning();
    return log;
  },

  async updateWaterLog(logId: number, logData: Partial<typeof waterLogs.$inferInsert>) {
    const [updatedLog] = await db.update(waterLogs)
      .set(logData)
      .where(eq(waterLogs.id, logId))
      .returning();
    return updatedLog;
  },

  // Screen time methods
  async getScreenTimeForDate(userId: number, date: Date) {
    // Format date to YYYY-MM-DD to match SQL date format
    const formattedDate = date.toISOString().split('T')[0];
    
    return await db.query.screenTimeLogs.findFirst({
      where: and(
        eq(screenTimeLogs.userId, userId),
        eq(sql`DATE(${screenTimeLogs.date})`, formattedDate)
      )
    });
  },

  async getScreenTimeData(userId: number, startDate: Date, endDate: Date) {
    const result = await db.select({
      id: screenTimeLogs.id,
      date: screenTimeLogs.date,
      minutes: screenTimeLogs.minutes
    })
    .from(screenTimeLogs)
    .where(
      and(
        eq(screenTimeLogs.userId, userId),
        gte(screenTimeLogs.date, startDate),
        lte(screenTimeLogs.date, endDate)
      )
    )
    .orderBy(screenTimeLogs.date);
    
    // Transform to day-based format for chart
    const formattedData = result.map(log => {
      const date = new Date(log.date);
      return {
        day: getDayName(date.getDay()),
        minutes: log.minutes
      };
    });
    
    // Fill in any missing days with default values
    const dayMap = new Map(formattedData.map(d => [d.day, d]));
    
    const days = [];
    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dayName = getDayName(currentDate.getDay());
      if (!dayMap.has(dayName)) {
        days.push({
          day: dayName,
          minutes: 0
        });
      } else {
        days.push(dayMap.get(dayName)!);
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return days;
  },

  async createScreenTimeLog(logData: { 
    userId: number; 
    date: Date; 
    minutes: number;
    appUsage?: Record<string, number>;
  }) {
    const [log] = await db.insert(screenTimeLogs).values(logData).returning();
    return log;
  },

  async updateScreenTimeLog(logId: number, logData: Partial<typeof screenTimeLogs.$inferInsert>) {
    const [updatedLog] = await db.update(screenTimeLogs)
      .set(logData)
      .where(eq(screenTimeLogs.id, logId))
      .returning();
    return updatedLog;
  },

  // User settings
  async getUserSettings(userId: number) {
    return await db.query.userSettings.findFirst({
      where: eq(userSettings.userId, userId)
    });
  },

  async createUserSettings(settingsData: { 
    userId: number; 
    theme?: string;
    weekStartsOn?: string;
    notificationsEnabled?: boolean;
    dailyReminderTime?: string;
    waterGoal?: number;
    sleepGoal?: number;
    screenTimeGoal?: number | null;
  }) {
    const [settings] = await db.insert(userSettings).values(settingsData).returning();
    return settings;
  },

  async updateUserSettings(userId: number, settingsData: Partial<typeof userSettings.$inferInsert>) {
    const [updatedSettings] = await db.update(userSettings)
      .set(settingsData)
      .where(eq(userSettings.userId, userId))
      .returning();
    return updatedSettings;
  },
  
  // Progress data for charts
  async getProgressData(userId: number, startDate: Date, endDate: Date) {
    // Get all habits for this user
    const userHabits = await this.getHabitsByUser(userId);
    const habitIds = userHabits.map(h => h.id);
    
    if (habitIds.length === 0) {
      return [];
    }
    
    // Format dates to YYYY-MM-DD to match SQL date format
    const startFormatted = startDate.toISOString().split('T')[0];
    const endFormatted = endDate.toISOString().split('T')[0];
    
    // Get logs for date range across all habits
    const logs = await db.select({
      date: habitLogs.date,
      completed: habitLogs.completed
    })
    .from(habitLogs)
    .where(
      and(
        sql`${habitLogs.habitId} IN (${habitIds.join(',')})`,
        gte(sql`DATE(${habitLogs.date})`, startFormatted),
        lte(sql`DATE(${habitLogs.date})`, endFormatted)
      )
    );
    
    // Group by date and calculate completion rate
    const dateMap = new Map();
    logs.forEach(log => {
      const dateStr = new Date(log.date).toISOString().split('T')[0];
      if (!dateMap.has(dateStr)) {
        dateMap.set(dateStr, { total: 0, completed: 0 });
      }
      
      const stats = dateMap.get(dateStr);
      stats.total += 1;
      if (log.completed) {
        stats.completed += 1;
      }
    });
    
    // Create data points for each day
    const progressData = [];
    let currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const stats = dateMap.get(dateStr) || { total: 0, completed: 0 };
      
      const progress = stats.total > 0 
        ? Math.round((stats.completed / stats.total) * 100) 
        : 0;
      
      progressData.push({
        day: getDayName(currentDate.getDay()),
        progress
      });
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return progressData;
  }
};
