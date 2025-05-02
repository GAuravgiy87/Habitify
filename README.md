# Habitify - Habit & Wellness Tracking Application

![Habitify](./generated-icon.png)

## Overview

Habitify is a professional-grade personal habit and wellness tracking application that helps users monitor their daily activities, health metrics, and personal goals. Built with modern web technologies, it provides a polished SaaS-quality interface with interactive charts, streak tracking, and comprehensive analytics.

## Features

### Dashboard
- **Overview Statistics**: At-a-glance view of habit completion, current streaks, sleep quality, and screen time
- **Daily Habits**: Track and update your daily habits with interactive progress bars
- **Interactive Charts**: Visual representation of your wellness data including sleep patterns, water intake, and screen time
- **Performance Trends**: Analyze your habit performance over time with detailed trend charts

### Habit Tracking
- **Multiple Habit Types**: Support for various habit types including boolean (done/not done), counter (quantities), timer (duration), and more
- **Progress Visualization**: Clear visual indicators of your progress toward goals
- **Habit Management**: Add, edit, and organize your habits with intuitive controls

### Health Analytics
- **Sleep Tracking**: Monitor your sleep patterns and quality over time
- **Water Intake**: Track your daily water consumption with visual guides
- **Screen Time**: Keep track of your device usage patterns
- **Detailed Reports**: Generate and view comprehensive reports on your health metrics

### User Experience
- **Dark/Light Mode**: Toggle between dark and light themes with beautiful transition animations
- **Responsive Design**: Seamless experience across desktop, tablet, and mobile devices
- **Intuitive UI**: Clean, modern interface designed for ease of use
- **Animations**: Smooth, subtle animations enhance the user experience

## Technical Stack

### Frontend
- React with TypeScript for type-safe component development
- Tailwind CSS for styling with a consistent design system
- Recharts for interactive data visualization
- Framer Motion for smooth animations and transitions
- Wouter for lightweight client-side routing

### Backend
- Node.js with Express for the API server
- PostgreSQL database for data persistence
- Drizzle ORM for type-safe database queries and schema management
- Session-based authentication

### Development & Deployment
- Vite for fast development and optimized production builds
- React Query for server state management
- Zod for runtime type validation
- Shadcn UI components for consistent design patterns

## Getting Started

### Prerequisites
- Node.js (v16+)
- PostgreSQL database

### Installation

1. Clone the repository
   ```
   git clone https://github.com/yourusername/habitify.git
   cd habitify
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Set up environment variables
   Create a `.env` file in the root directory with the following variables:
   ```
   DATABASE_URL=postgresql://username:password@localhost:5432/habitify
   ```

4. Set up the database schema
   ```
   npm run db:push
   ```

5. Seed the database with initial data
   ```
   npm run db:seed
   ```

6. Start the development server
   ```
   npm run dev
   ```

7. Open your browser and navigate to `http://localhost:5000`

## Usage

### Creating a New Habit

1. Navigate to the Habits page
2. Click the "Add Habit" button
3. Fill out the habit details including name, type, goal, and frequency
4. Save your new habit

### Tracking Your Progress

1. On the Dashboard, you'll see all your habits for the day
2. Click the "+" or "-" buttons to update counter-based habits
3. Click "Mark Complete" for boolean habits
4. View your progress bars to see how close you are to your goals

### Viewing Analytics

1. Navigate to the Analytics page
2. Select the time range you want to analyze (week, month, year)
3. Explore the different charts and visualizations of your data
4. Hover over data points for more detailed information

## Customization

### Themes

Toggle between dark and light mode by clicking the sun/moon icon in the header. Your preference will be saved for future sessions.

### Settings

Visit the Settings page to customize your experience:
- Notification preferences
- Goal reminders
- Data display formats
- Privacy settings

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Icons provided by Lucide React
- Design inspiration from various health and wellness applications
- Special thanks to all contributors who have helped make this project better
