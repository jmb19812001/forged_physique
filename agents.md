# Agents Overview

This document describes the functional “agents” (modular responsibilities) that power Forged Physique. Each agent encapsulates a domain (auth, planning, workouts, analytics) with clear inputs/outputs, state, and UI surfaces. This is not an LLM system; agents here are app modules/services and planned back‑end components.

## Auth Agent
- Purpose: Manage user lifecycle and preferences.
- Responsibilities:
  - Login, signup, logout
  - Persist current user and users list
  - Update unit preference (kg/lbs)
- State/Storage:
  - AsyncStorage keys: `users`, `user`
- Public API (hook):
  - `login(email, password)`
  - `signup(email, password, userName)`
  - `logout()`
  - `updateUnitPreference("kg" | "lbs")`
- Key files:
  - `hooks/useAuth.tsx`
  - Provided via `context/AppContext.tsx`
  - Consumed across screens for user and unit preference

## Exercise Catalog Agent
- Purpose: Provide exercise data and CRUD for custom exercises.
- Responsibilities:
  - Read built‑in exercises
  - Manage custom exercises (create/edit/delete)
  - Query by id and muscle group
- State/Storage:
  - AsyncStorage key: `custom_exercises`
  - Merged list: `data/exercises.ts` + custom
- Public API (hook):
  - `getExerciseById(id)`
  - `getMuscleGroups()`
  - `getExercisesByMuscleGroup(muscleGroup)`
  - `addCustomExercise(exercise)`
  - `editCustomExercise(exercise)`
  - `deleteCustomExercise(id)`
- Key files:
  - `hooks/useExerciseStore.tsx`
  - Data: `data/exercises.ts`
  - UI: `app/exercise/*`

## Mesocycle Planner Agent
- Purpose: Create and manage mesocycles (training blocks).
- Responsibilities:
  - Create mesocycle, set active, query by id, delete
  - Drive preset/custom planning flows
- State/Storage:
  - AsyncStorage key: `mesocycles` (via hook implementation)
- Public API (hook):
  - `createMesocycle(params)`
  - `getMesocycleById(id)`
  - `getActiveMesocycle()`
  - `setActiveMesocycle(id)`
  - `deleteMesocycle(id)`
- Key files:
  - `hooks/useMesocycleStore.tsx`
  - UI: `app/mesocycle/create.tsx`, `app/mesocycle/[mesold].tsx`, `app/(tabs)/mesocycles.tsx`
  - Templates: `data/workoutTemplates.ts`

## Workout Scheduler & Session Agent
- Purpose: Plan daily workouts and manage live workout sessions.
- Responsibilities:
  - Generate `WorkoutDay` entries for mesocycles from presets or custom selections
  - Compute today’s workout, start a session, log sets, and complete a workout
  - Persist workout days, sessions, and set logs
- State/Storage (per‑user):
  - `workoutDays_${user.user_id}`
  - `sessions_${user.user_id}`
  - `setLogs_${user.user_id}`
- Public API (hook):
  - `createWorkoutDaysForMesocycle(mesocycle, workoutDays, params)`
  - `getWorkoutDaysForMesocycle(mesoId)`
  - `getWorkoutDay(dayId)`
  - `getWorkoutForToday(mesoId)`
  - `startWorkoutSession(dayId)`
  - `logSet(setLog)`
  - `completeWorkout(dayId)`
- Key files:
  - `hooks/useWorkoutStore.tsx`
  - UI: `app/workout/[dayId].tsx`

## Progress Analytics Agent
- Purpose: Summarize performance trends and PRs.
- Responsibilities:
  - Estimate 1RM time‑series (currently mock)
  - Compute personal records (mock) and average weekly sets by muscle group (mock)
- Public API (hook):
  - `getEstimated1RM(exerciseId)`
  - `getPersonalRecords()`
  - `getAverageSetsByMuscleGroup()`
- Key files:
  - `hooks/useProgressStore.tsx`
  - UI: `app/(tabs)/progress.tsx`

## Recommendation Engine Agent (Planned)
- Purpose: Pre‑fill set recommendations and drive progression.
- Current status: Basic placeholder logic exists.
- Responsibilities (planned):
  - Inputs: prior set logs, target reps/RIR, joint pain, pump, difficulty, mesocycle phase
  - Rules: pain priority, performance progression, volume adjustment, deload week adjustments, unit conversions
  - Outputs: next‑set target weight/reps/RIR per exercise
- Current entry point:
  - `utils/helpers.ts` → `getRecommendedWeight(...)` (simplified placeholder)
- Integration points (planned):
  - Pre‑fill fields in `app/workout/[dayId].tsx`
  - Persist feedback (pain/pump/difficulty) per muscle group

## Admin Agent
- Purpose: Manage users and account state via in‑app admin console.
- Status: UI present; backend procedures TBD.
- Key files:
  - `app/(tabs)/admin.tsx`

## Backend API Agent (tRPC/Hono)
- Purpose: Server API for persistence, auth, and analytics at scale.
- Status: Router scaffolded; procedures not yet implemented.
- Components:
  - Server: `backend/hono.ts`, `backend/server.ts`
  - Router: `backend/trpc/routes/app-router.ts` (empty), `backend/trpc/routes/create-context.ts`
  - Client: `lib/trpc.ts` (configured; points to `/api/trpc`)
- Near‑term procedures (suggested):
  - `auth.*`: login/signup with proper hashing, session tokens
  - `exercises.*`: list/search, CRUD for custom
  - `mesocycles.*`: CRUD, set active, templates
  - `workouts.*`: days, sessions, set logs, feedback
  - `progress.*`: aggregates, e1RM, PRs

## Storage Agent
- Purpose: Centralize storage keys and conventions for local persistence.
- Keys in use:
  - `users`, `user`
  - `custom_exercises`
  - `workoutDays_${user.user_id}`
  - `sessions_${user.user_id}`
  - `setLogs_${user.user_id}`
- Notes:
  - All user‑scoped keys include `user.user_id` suffix to avoid collisions.

## Types & Contracts
- Source of truth for domain models: `types/workout.ts`
  - `User`, `Exercise`, `MesoCycle`, `WorkoutDay`, `WorkoutSession`, `SetLog`, `MuscleGroupFeedback`, `WorkoutTemplate`, `WorkoutDayData`

---

# Core Flows

## Onboarding & Auth
- Signup/Login via `useAuth` → stores `user` in AsyncStorage.
- Unit preference stored with the user; exercise and workout UIs read `user.unit_preference`.

## Mesocycle Creation
- Preset flow: `data/workoutTemplates.ts` → `useWorkoutStore.createWorkoutDaysForMesocycle` builds days and selects 2–3 exercises per muscle group.
- Custom flow: `app/exercise/*` lets the user pick exercises per day → fed back into `createWorkoutDaysForMesocycle`.

## Workout Session
- Today’s workout derived via `useWorkoutStore.getWorkoutForToday(mesoId)`.
- Starting a session assigns a `session_id` to the day and records a `WorkoutSession`.
- Each set logged via `useWorkoutStore.logSet` and marked `completed` in UI state.
- Feedback modal captures pain/pump/difficulty per muscle group (planned persistence).
- Completing a workout clears the `session_id` and returns to Mesocycles.

## Progress & Stats
- Current implementation uses placeholder/mock data for charts and PRs.
- Real implementation should aggregate from `SetLog` history.

---

# Extension Guide

## Add a New Agent
1. Create a dedicated hook (or service) that encapsulates state, storage, and API for the domain.
2. Provide it in `context/AppContext.tsx` to make it available app‑wide.
3. Add types in `types/workout.ts` as needed.
4. Add UI screens under `app/...` and wire them to the hook.
5. For server functionality, add tRPC procedures under `backend/trpc/routes/*` and consume via `lib/trpc.ts`.

## Implement the Recommendation Engine
- Replace `utils/helpers.ts#getRecommendedWeight` with a function that:
  - Reads recent `SetLog`s for the exercise
  - Applies RIR and target rep rules
  - Adjusts for pain/pump/difficulty feedback and phase (e.g., deload weeks)
  - Returns per‑set recommendations (weight/reps/RIR), not just weight
- Pre‑fill fields in `app/workout/[dayId].tsx` and update after each `logSet`.

## Persist Feedback
- Add a `MuscleGroupFeedback` store with AsyncStorage and/or tRPC endpoints.
- Capture feedback from the modal in `app/workout/[dayId].tsx` and persist it with `session_id` + muscle group.
- Feed back into Recommendation Engine adjustments.

## Backend Roadmap
- Flesh out `app-router.ts` with routers for auth, exercises, mesocycles, workouts, and progress.
- Add validation and input/output schemas.
- Replace AsyncStorage persistence with server storage; migrate via background sync.

---

# Notes & Conventions
- UI: Expo Router with tabs in `app/(tabs)` and flows under `app/mesocycle`, `app/workout`, `app/exercise`.
- Styling: Dark theme, consistent typography and spacing.
- Storage: Keep per‑user key suffix pattern to avoid cross‑user collisions on device.
- Types: Centralize domain models in `types/workout.ts`.
- Server: Hono + tRPC scaffolded; expand as needed.

