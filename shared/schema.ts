import { pgTable, text, serial, integer, boolean, timestamp, date, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  displayName: text("display_name"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Habits table
export const habits = pgTable("habits", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  description: text("description"),
  icon: text("icon").notNull(),
  iconBgColor: text("icon_bg_color").notNull().default("bg-blue-100"),
  iconColor: text("icon_color").notNull().default("text-blue-500"),
  type: text("type").notNull(), // boolean, counter, timer, quantity
  category: text("category"),
  goalValue: integer("goal_value").notNull(),
  goalUnit: text("goal_unit").notNull(),
  frequency: jsonb("frequency").notNull(), // { type: 'daily'|'weekly'|'monthly', days: [], count: 1 }
  reminderTime: text("reminder_time"),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// HabitLogs table - record of daily check-ins and progress
export const habitLogs = pgTable("habit_logs", {
  id: serial("id").primaryKey(),
  habitId: integer("habit_id").references(() => habits.id).notNull(),
  date: date("date").notNull(),
  completed: boolean("completed").notNull().default(false),
  skipped: boolean("skipped").notNull().default(false),
  progress: integer("progress"), // null for boolean habits, value for others
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Streaks table - for tracking continuous habit completion
export const streaks = pgTable("streaks", {
  id: serial("id").primaryKey(),
  habitId: integer("habit_id").references(() => habits.id).notNull(),
  current: integer("current").notNull().default(0),
  longest: integer("longest").notNull().default(0),
  lastLogDate: date("last_log_date"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// SleepLogs table - for tracking sleep patterns
export const sleepLogs = pgTable("sleep_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  date: date("date").notNull(),
  duration: integer("duration").notNull(), // in minutes
  startTime: timestamp("start_time"),
  endTime: timestamp("end_time"),
  quality: integer("quality"), // 1-10 rating
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// WaterLogs table - for tracking water intake
export const waterLogs = pgTable("water_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  date: date("date").notNull(),
  amount: integer("amount").notNull(), // in ml
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ScreenTimeLogs table - for tracking screen time
export const screenTimeLogs = pgTable("screen_time_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  date: date("date").notNull(),
  minutes: integer("minutes").notNull(),
  appUsage: jsonb("app_usage"), // { 'App Name': minutes, ... }
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// UserSettings table - for storing user preferences
export const userSettings = pgTable("user_settings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull().unique(),
  theme: text("theme").default("light"),
  weekStartsOn: text("week_starts_on").default("sunday"),
  notificationsEnabled: boolean("notifications_enabled").default(true),
  dailyReminderTime: text("daily_reminder_time"),
  waterGoal: integer("water_goal").default(2000), // in ml
  sleepGoal: integer("sleep_goal").default(480), // in minutes
  screenTimeGoal: integer("screen_time_goal"), // in minutes, null means no goal
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Relations
export const userRelations = relations(users, ({ many }) => ({
  habits: many(habits),
  sleepLogs: many(sleepLogs),
  waterLogs: many(waterLogs),
  screenTimeLogs: many(screenTimeLogs),
  settings: many(userSettings),
}));

export const habitRelations = relations(habits, ({ one, many }) => ({
  user: one(users, { fields: [habits.userId], references: [users.id] }),
  logs: many(habitLogs),
  streak: one(streaks),
}));

export const habitLogRelations = relations(habitLogs, ({ one }) => ({
  habit: one(habits, { fields: [habitLogs.habitId], references: [habits.id] }),
}));

export const streakRelations = relations(streaks, ({ one }) => ({
  habit: one(habits, { fields: [streaks.habitId], references: [habits.id] }),
}));

export const sleepLogRelations = relations(sleepLogs, ({ one }) => ({
  user: one(users, { fields: [sleepLogs.userId], references: [users.id] }),
}));

export const waterLogRelations = relations(waterLogs, ({ one }) => ({
  user: one(users, { fields: [waterLogs.userId], references: [users.id] }),
}));

export const screenTimeLogRelations = relations(screenTimeLogs, ({ one }) => ({
  user: one(users, { fields: [screenTimeLogs.userId], references: [users.id] }),
}));

export const userSettingsRelations = relations(userSettings, ({ one }) => ({
  user: one(users, { fields: [userSettings.userId], references: [users.id] }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users, {
  username: (schema) => schema.min(3, "Username must be at least 3 characters"),
  password: (schema) => schema.min(6, "Password must be at least 6 characters"),
  email: (schema) => schema.email("Must provide a valid email"),
});

export const insertHabitSchema = createInsertSchema(habits, {
  name: (schema) => schema.min(1, "Habit name is required"),
  goalValue: (schema) => schema.min(0, "Goal value must be a positive number"),
});

export const insertHabitLogSchema = createInsertSchema(habitLogs);
export const insertStreakSchema = createInsertSchema(streaks);
export const insertSleepLogSchema = createInsertSchema(sleepLogs);
export const insertWaterLogSchema = createInsertSchema(waterLogs);
export const insertScreenTimeLogSchema = createInsertSchema(screenTimeLogs);
export const insertUserSettingsSchema = createInsertSchema(userSettings);

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertHabit = z.infer<typeof insertHabitSchema>;
export type Habit = typeof habits.$inferSelect;

export type InsertHabitLog = z.infer<typeof insertHabitLogSchema>;
export type HabitLog = typeof habitLogs.$inferSelect;

export type InsertStreak = z.infer<typeof insertStreakSchema>;
export type Streak = typeof streaks.$inferSelect;

export type InsertSleepLog = z.infer<typeof insertSleepLogSchema>;
export type SleepLog = typeof sleepLogs.$inferSelect;

export type InsertWaterLog = z.infer<typeof insertWaterLogSchema>;
export type WaterLog = typeof waterLogs.$inferSelect;

export type InsertScreenTimeLog = z.infer<typeof insertScreenTimeLogSchema>;
export type ScreenTimeLog = typeof screenTimeLogs.$inferSelect;

export type InsertUserSettings = z.infer<typeof insertUserSettingsSchema>;
export type UserSettings = typeof userSettings.$inferSelect;
