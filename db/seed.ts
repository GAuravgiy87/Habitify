import { db } from "./index";
import * as schema from "@shared/schema";
import { and, eq } from "drizzle-orm";

// Function to get current date at midnight
const today = () => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
};

// Function to get date N days ago at midnight
const daysAgo = (days: number) => {
  const date = today();
  date.setDate(date.getDate() - days);
  return date;
};

async function seed() {
  try {
    console.log("Starting seed process...");
    
    // Create test user if it doesn't exist
    let testUser = await db.query.users.findFirst({
      where: eq(schema.users.username, "testuser")
    });
    
    if (!testUser) {
      console.log("Creating test user...");
      [testUser] = await db.insert(schema.users).values({
        username: "testuser",
        password: "password123", // In a real app this would be hashed
        email: "test@example.com",
        displayName: "Test User"
      }).returning();
    }
    
    const userId = testUser.id;
    
    // Create user settings if they don't exist
    const existingSettings = await db.query.userSettings.findFirst({
      where: eq(schema.userSettings.userId, userId)
    });
    
    if (!existingSettings) {
      console.log("Creating user settings...");
      await db.insert(schema.userSettings).values({
        userId,
        theme: "light",
        weekStartsOn: "sunday",
        notificationsEnabled: true,
        dailyReminderTime: "19:00",
        waterGoal: 2000, // 2 liters in ml
        sleepGoal: 480, // 8 hours in minutes
        screenTimeGoal: 180 // 3 hours in minutes
      });
    }
    
    // Create habits if none exist
    const existingHabits = await db.query.habits.findMany({
      where: eq(schema.habits.userId, userId)
    });
    
    if (existingHabits.length === 0) {
      console.log("Creating habits...");
      
      // Define habits
      const habitsToCreate = [
        {
          userId,
          name: "Sleep 8 hours",
          description: "Get adequate sleep for health",
          icon: "moon",
          iconBgColor: "bg-blue-100",
          iconColor: "text-blue-500",
          type: "quantity",
          category: "health",
          goalValue: 8,
          goalUnit: "hours",
          frequency: { type: "daily", days: [0, 1, 2, 3, 4, 5, 6], count: 1 },
          reminderTime: "22:00",
          active: true
        },
        {
          userId,
          name: "Exercise",
          description: "Daily physical activity",
          icon: "zap",
          iconBgColor: "bg-green-100",
          iconColor: "text-green-500",
          type: "quantity",
          category: "fitness",
          goalValue: 30,
          goalUnit: "minutes",
          frequency: { type: "daily", days: [0, 1, 2, 3, 4, 5, 6], count: 1 },
          reminderTime: "07:00",
          active: true
        },
        {
          userId,
          name: "Meditate",
          description: "Practice mindfulness",
          icon: "timer",
          iconBgColor: "bg-blue-100",
          iconColor: "text-blue-500",
          type: "timer",
          category: "mindfulness",
          goalValue: 20,
          goalUnit: "minutes",
          frequency: { type: "daily", days: [0, 1, 2, 3, 4, 5, 6], count: 1 },
          reminderTime: "08:00",
          active: true
        },
        {
          userId,
          name: "Drink Water",
          description: "Stay hydrated throughout the day",
          icon: "droplets",
          iconBgColor: "bg-cyan-100",
          iconColor: "text-cyan-500",
          type: "quantity",
          category: "health",
          goalValue: 8,
          goalUnit: "glasses",
          frequency: { type: "daily", days: [0, 1, 2, 3, 4, 5, 6], count: 1 },
          reminderTime: "10:00",
          active: true
        },
        {
          userId,
          name: "Read a book",
          description: "Read daily for knowledge and relaxation",
          icon: "book",
          iconBgColor: "bg-red-100",
          iconColor: "text-red-500",
          type: "quantity",
          category: "personal",
          goalValue: 30,
          goalUnit: "pages",
          frequency: { type: "daily", days: [0, 1, 2, 3, 4, 5, 6], count: 1 },
          reminderTime: "21:00",
          active: true
        },
        {
          userId,
          name: "Learn French",
          description: "Practice French vocabulary",
          icon: "book",
          iconBgColor: "bg-yellow-100",
          iconColor: "text-yellow-500",
          type: "timer",
          category: "education",
          goalValue: 15,
          goalUnit: "minutes",
          frequency: { type: "daily", days: [1, 3, 5], count: 1 },
          reminderTime: "18:00",
          active: false
        }
      ];
      
      // Insert habits and create streaks
      for (const habitData of habitsToCreate) {
        const [habit] = await db.insert(schema.habits).values(habitData).returning();
        
        // Initialize streak for each habit
        await db.insert(schema.streaks).values({
          habitId: habit.id,
          current: habit.active ? Math.floor(Math.random() * 12) + 1 : 0,
          longest: Math.floor(Math.random() * 20) + 10,
          lastLogDate: habit.active ? daysAgo(1) : null
        });
      }
    }
    
    // Get all habits for this user to create logs
    const habits = await db.query.habits.findMany({
      where: eq(schema.habits.userId, userId)
    });
    
    // Create habit logs for the last 7 days
    console.log("Creating habit logs...");
    for (const habit of habits) {
      if (!habit.active) continue;
      
      for (let i = 0; i < 7; i++) {
        const date = daysAgo(i);
        
        // Check if log already exists for this date
        const existingLog = await db.query.habitLogs.findFirst({
          where: and(
            eq(schema.habitLogs.habitId, habit.id),
            eq(schema.habitLogs.date, date)
          )
        });
        
        if (!existingLog) {
          // For days 0 and 1 (today and yesterday), create logs with different progress
          // Simulate current day's progress
          if (i === 0) {
            if (habit.name === "Sleep 8 hours") {
              await db.insert(schema.habitLogs).values({
                habitId: habit.id,
                date,
                completed: true,
                progress: 7.5, // 7.5 hours of sleep
                notes: "Went to bed a bit late"
              });
            } else if (habit.name === "Exercise") {
              await db.insert(schema.habitLogs).values({
                habitId: habit.id,
                date,
                completed: true,
                progress: 45, // 45 minutes of exercise
                notes: "Morning jog and strength training"
              });
            } else if (habit.name === "Meditate") {
              await db.insert(schema.habitLogs).values({
                habitId: habit.id,
                date,
                completed: false,
                progress: 0, // Not started yet
                notes: ""
              });
            } else if (habit.name === "Drink Water") {
              await db.insert(schema.habitLogs).values({
                habitId: habit.id,
                date,
                completed: false,
                progress: 5, // 5 out of 8 glasses
                notes: "Remember to drink more in the afternoon"
              });
            } else if (habit.name === "Read a book") {
              await db.insert(schema.habitLogs).values({
                habitId: habit.id,
                date,
                completed: false,
                progress: 15, // 15 pages read
                notes: "Reading 'Atomic Habits'"
              });
            }
          } else {
            // For past days, randomize completion
            const completed = Math.random() > 0.3; // 70% chance of completion
            const progress = completed ? habit.goalValue : Math.floor(Math.random() * habit.goalValue);
            
            await db.insert(schema.habitLogs).values({
              habitId: habit.id,
              date,
              completed,
              progress,
              notes: completed ? "Completed successfully" : "Missed this day"
            });
          }
        }
      }
    }
    
    // Create sleep logs for the last 7 days
    console.log("Creating sleep logs...");
    for (let i = 0; i < 7; i++) {
      const date = daysAgo(i);
      
      // Check if log already exists for this date
      const existingSleepLog = await db.query.sleepLogs.findFirst({
        where: and(
          eq(schema.sleepLogs.userId, userId),
          eq(schema.sleepLogs.date, date)
        )
      });
      
      if (!existingSleepLog) {
        // Generate random sleep data
        const duration = i === 0 ? 450 : Math.floor(Math.random() * 120) + 420; // 7-9 hours in minutes
        const quality = i === 0 ? 7 : Math.floor(Math.random() * 4) + 6; // 6-10 quality rating
        
        await db.insert(schema.sleepLogs).values({
          userId,
          date,
          duration,
          quality,
          notes: ""
        });
      }
    }
    
    // Create water logs for the last 7 days
    console.log("Creating water logs...");
    for (let i = 0; i < 7; i++) {
      const date = daysAgo(i);
      
      // Check if log already exists for this date
      const existingWaterLog = await db.query.waterLogs.findFirst({
        where: and(
          eq(schema.waterLogs.userId, userId),
          eq(schema.waterLogs.date, date)
        )
      });
      
      if (!existingWaterLog) {
        // Water intake for today, yesterday, and other days
        let amount = 0;
        if (i === 0) {
          amount = 1800; // 1.8 liters for today
        } else if (i === 1) {
          amount = 1750; // 1.75 liters for yesterday
        } else if (i === 2) {
          amount = 2250; // 2.25 liters for 2 days ago
        } else if (i === 3) {
          amount = 1600; // 1.6 liters for 3 days ago
        } else if (i === 4) {
          amount = 2000; // 2 liters for 4 days ago
        } else if (i === 5) {
          amount = 2500; // 2.5 liters for 5 days ago
        } else {
          amount = 1900; // 1.9 liters for 6 days ago
        }
        
        await db.insert(schema.waterLogs).values({
          userId,
          date,
          amount
        });
      }
    }
    
    // Create screen time logs for the last 7 days
    console.log("Creating screen time logs...");
    for (let i = 0; i < 7; i++) {
      const date = daysAgo(i);
      
      // Check if log already exists for this date
      const existingScreenLog = await db.query.screenTimeLogs.findFirst({
        where: and(
          eq(schema.screenTimeLogs.userId, userId),
          eq(schema.screenTimeLogs.date, date)
        )
      });
      
      if (!existingScreenLog) {
        // Screen time minutes for each day
        let minutes = 0;
        let appUsage = {};
        
        if (i === 0) {
          minutes = 195; // 3h 15m
          appUsage = {
            "Instagram": 72,
            "Twitter": 45,
            "YouTube": 32,
            "Other": 46
          };
        } else if (i === 1) {
          minutes = 180; // 3h
          appUsage = {
            "Instagram": 65,
            "Twitter": 40,
            "YouTube": 30,
            "Other": 45
          };
        } else if (i === 2) {
          minutes = 210; // 3h 30m
          appUsage = {
            "Instagram": 80,
            "Twitter": 50,
            "YouTube": 35,
            "Other": 45
          };
        } else if (i === 3) {
          minutes = 165; // 2h 45m
          appUsage = {
            "Instagram": 60,
            "Twitter": 40,
            "YouTube": 25,
            "Other": 40
          };
        } else if (i === 4) {
          minutes = 240; // 4h
          appUsage = {
            "Instagram": 90,
            "Twitter": 55,
            "YouTube": 40,
            "Other": 55
          };
        } else if (i === 5) {
          minutes = 190; // 3h 10m
          appUsage = {
            "Instagram": 70,
            "Twitter": 45,
            "YouTube": 30,
            "Other": 45
          };
        } else {
          minutes = 260; // 4h 20m
          appUsage = {
            "Instagram": 95,
            "Twitter": 60,
            "YouTube": 45,
            "Other": 60
          };
        }
        
        await db.insert(schema.screenTimeLogs).values({
          userId,
          date,
          minutes,
          appUsage
        });
      }
    }
    
    console.log("Seed completed successfully!");
  } catch (error) {
    console.error("Error during seeding:", error);
  }
}

seed();
