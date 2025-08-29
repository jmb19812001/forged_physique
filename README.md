# Forged Physique

## Overview
Forged Physique is a full-stack mobile application for iOS and Android designed as a personalized hypertrophy training coach. The app guides users through structured training blocks (mesocycles), tracks detailed workout data, and employs an RIR-based autoregulation system to provide intelligent recommendations for progressive overload and recovery. It features a clean, minimalist, dark-themed UI.

## Feature Status

| Feature | Status | Notes |
| --- | --- | --- |
| Onboarding & Auth | Functional | Email/password login, signup, logout, unit preference |
| Exercise Catalog | Functional | Built-in and custom exercises with CRUD support |
| Mesocycle Planner | Functional | Create, activate, and manage training blocks |
| Workout Scheduler & Session | Functional | Generate workout days, log sets, complete sessions |
| Progress Analytics | Stubbed | Charts and PRs use placeholder data |
| Recommendation Engine | Stubbed | Simplified weight suggestion logic |
| Admin Console | Stubbed | UI present; backend actions pending |
| Backend API | Stubbed | tRPC/Hono router scaffolded without procedures |
| Feedback Store | Planned | Persist and analyze muscle group feedback |

## Features

### Onboarding
- Standard user sign-up and login flow with email and password authentication.

### Home Screen / Dashboard
- Displays a card for "Today's Workout" or a rest day message if no workout is scheduled.
- Main navigation bar with links to "Current Workout", "Mesocycles", "Progress", and "Profile".

### Workout Session Screen
- Lists exercises for the current day's workout with input fields for Weight, Reps, and RIR (Reps in Reserve).
- Fields are pre-filled with recommendations from the Recommendation Engine.
- "Log Set" button to save data.
- Triggers Feedback Modal after completing sets for a muscle group.

### Feedback Modal
- Pop-up for muscle group feedback on joint pain, pump, and difficulty.
- Saves data to track user experience and adjust recommendations.

### Mesocycle Planner Screen
- View and manage training blocks (mesocycles).
- Options to create "Preset" plans based on training days/week or "Custom" plans with user-defined exercises and sets.

### Progress & Stats Screen
- Bar chart for "Average Sets per Muscle Group" by week.
- Line chart for Estimated 1-Rep Max (e1RM) progression over time for selected exercises.
- Displays Personal Records (PRs) for key lifts.

### Recommendation Engine
- Backend logic to generate workout recommendations based on past performance, pain feedback, and mesocycle phase.
- Rules include pain priority, performance progression, volume adjustment, and deload week adjustments.

## Data Models

- **User**: Stores user information including email, password hash, username, and unit preference (kg/lbs).
- **Exercise**: Pre-populated database of exercises with details like name, muscle group, equipment, instructions, and video URLs.
- **MesoCycle**: Defines training blocks with start date, duration, and active status.
- **WorkoutDay**: Templates for daily workouts within a mesocycle.
- **WorkoutDay_Exercise**: Links exercises to workout days with target sets.
- **WorkoutSession**: Records completed workouts with date and user data.
- **SetLog**: Logs individual sets with weight, reps, and RIR.
- **MuscleGroupFeedback**: Captures user feedback on pain, pump, and difficulty per muscle group.

## Tech Stack

- **Frontend**: React Native with Expo for cross-platform mobile development.
- **Backend**: Node.js with Hono and tRPC for API services.
- **State Management**: React Context for app state, React Query for server state.
- **Routing**: Expo Router for file-based navigation.

## Setup Instructions

1. **Clone the Repository**: Ensure you have the project files in your local environment.
2. **Install Dependencies**: Run `npm install` to install required npm packages.
3. **Run the Backend Server**: In a separate terminal, run `npm run backend` to start the backend server.
4. **Run the App**: Use `npm start` to launch the app in development mode. You can then scan the QR code with Expo Go or use a simulator.
5. **Environment Variables**: Copy `.env.example` to `.env` and provide values for `TURSO_URL` and `TURSO_AUTH_TOKEN` so the backend can connect to your Turso instance.
6. **Environment Variables (Production)**: For production builds, set the `EXPO_PUBLIC_API_URL` environment variable to the URL of your deployed backend.

### Database Migrations & Seeding

1. Ensure the Turso environment variables above are set.
2. Generate migrations from the Drizzle schema:
   ```
   npx drizzle-kit generate
   ```
3. Apply migrations to the database:
   ```
   npx drizzle-kit push
   ```
4. (Optional) Seed initial data using your preferred script, for example:
   ```
   npx tsx backend/seed.ts
   ```

## Admin Console

An admin console is available under the "Admin" tab for managing user accounts, viewing account status, and facilitating password resets.

## Current Limitations

- Some UI buttons (e.g., adding workout days, toggling exercises) are placeholders and require further backend integration.
- Password reset functionality is under development.

## Development Roadmap

- **Feedback Store Agent** – Persist pain/pump/difficulty feedback for each muscle group and surface trends.
- **Recommendation Engine Enhancements** – Use historical performance and feedback to drive set-by-set targets.
- **Expanded Backend API** – Implement tRPC procedures for auth, exercises, mesocycles, workouts, and progress analytics.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for branching strategy, coding style, and pull request expectations.

## License

This project is proprietary and intended for personal use or as specified by the development team.
