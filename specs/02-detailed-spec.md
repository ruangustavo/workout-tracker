# Detailed Specification — Workout Tracker

## Overview

Mobile-first application for tracking weightlifting workouts. The user defines training programs with a fixed weekly schedule, executes workouts logging weight and reps per set, and tracks progress through charts and history.

**Stack**: Next.js 16 (App Router) + Convex + Convex Auth + shadcn/ui + Tailwind CSS + Recharts
**UI Language**: Portuguese (pt-BR)
**Platform**: Mobile-first (desktop as secondary)

## 1. Authentication

- Use **Convex Auth** (built-in)
- Login via email/password or OAuth
- User data is synced across devices

## 2. Training Programs

### Concept

A **program** defines a set of workouts distributed across a fixed week (Monday through Sunday). Only one program can be active at a time. Programs run indefinitely until manually deactivated.

### Rules

- Users can create multiple programs, but only one is active
- Activating a program automatically deactivates the previous one
- Each day of the week can have an assigned workout or be a rest day
- The schedule is flexible: if Monday's workout was missed, it can be done on Tuesday, or the user can skip ahead to Tuesday's workout

### Program Data

| Field    | Type                    | Description                               |
| -------- | ----------------------- | ----------------------------------------- |
| name     | string                  | Program name (e.g., "Push/Pull/Legs")     |
| active   | boolean                 | Whether this is the current program       |
| schedule | Map\<DayOfWeek, Ref?\>  | Day → workout mapping (null = rest day)   |

---

## 3. Workouts

### Concept

A **workout** is an ordered sequence of exercises with defined parameters (sets, rep range, rest time). A workout belongs to a program.

### Workout Data

| Field     | Type   | Description                              |
| --------- | ------ | ---------------------------------------- |
| name      | string | Workout name (e.g., "Chest A")           |
| program   | Ref    | Reference to parent program              |
| exercises | Array  | Ordered list of exercises in the workout |

### Exercise within a Workout

| Field    | Type   | Description                                      |
| -------- | ------ | ------------------------------------------------ |
| exercise | Ref    | Reference to global exercise                     |
| sets     | number | Number of sets (e.g., 4)                         |
| repsMin  | number | Minimum reps in range (e.g., 5)                  |
| repsMax  | number | Maximum reps in range (e.g., 8)                  |
| restMin  | number | Minimum rest time in seconds (e.g., 90)          |
| restMax  | number | Maximum rest time in seconds (e.g., 180)         |
| order    | number | Position in workout sequence                     |

---

## 4. Exercises (Global Library)

### Concept

Exercises are global entities shared across workouts and programs. The same exercise (e.g., "Supino Reto") can appear in multiple workouts. Progress history aggregates data from ALL sessions, regardless of which workout it came from.

### Seed Data

The app ships with ~30-40 pre-registered exercises covering major compound and isolation movements for each muscle group. Users can add custom exercises.

### Exercise Data

| Field        | Type    | Description                                           |
| ------------ | ------- | ----------------------------------------------------- |
| name         | string  | Exercise name (e.g., "Supino Reto")                   |
| muscleGroup  | string  | Primary muscle group (e.g., "Peito")                  |
| isPreset     | boolean | Whether it's a seed exercise (cannot be deleted)      |

### Muscle Groups

Peito, Costas, Ombros, Bíceps, Tríceps, Antebraço, Quadríceps, Posterior, Glúteos, Panturrilha, Abdômen

---

## 5. Workout Execution (Session)

### Flow

1. User starts a workout (from the active program or manual choice)
2. Screen displays **one exercise at a time**, in prescribed order
3. For each exercise, the user logs **weight and reps per set**
4. Fields start **empty**, but a subtle label shows the weight from the previous session for reference
5. Recommended rest time is displayed as a **visual reference** (no timer)
6. User can navigate freely between exercises and **reorder** them during the session
7. At the end, unfinished exercises can be **marked as not performed**
8. **Persistence**: data is saved upon completing each exercise (partial crash tolerance)
9. **No summary screen**: after finishing, returns directly to the home screen

### Session Data

| Field     | Type      | Description                                    |
| --------- | --------- | ---------------------------------------------- |
| workout   | Ref       | Reference to the executed workout              |
| program   | Ref       | Reference to the active program at that time   |
| user      | Ref       | Reference to the user                          |
| startedAt | timestamp | Start time (automatic)                         |
| endedAt   | timestamp | End time (automatic)                           |
| status    | enum      | "in_progress" \| "completed"                   |

### Exercise Log Data (per exercise in session)

| Field    | Type   | Description                                     |
| -------- | ------ | ----------------------------------------------- |
| session  | Ref    | Reference to the session                        |
| exercise | Ref    | Reference to the global exercise                |
| order    | number | Actual position in which it was performed       |
| status   | enum   | "completed" \| "skipped"                        |
| sets     | Array  | List of logged sets                             |

### Set Data

| Field  | Type   | Description              |
| ------ | ------ | ------------------------ |
| number | number | Set number (1, 2, 3…)    |
| weight | number | Weight used in kg        |
| reps   | number | Reps performed           |

---

## 6. Progression Suggestions

### Rules

After logging all sets for an exercise, the app analyzes reps against the prescribed range:

- **Reps performed > repsMax (all sets)**: suggest **increasing** weight
- **Reps performed < repsMin (all sets)**: suggest **decreasing** weight

### Increment Calculation

- Suggested increment: **2.5% to 5%** of current weight
- Rounding: to the **nearest multiple of 2kg**
- Example: current weight 80kg, 5% increase = 84kg → rounds to 84kg (already a multiple of 2)
- Example: current weight 30kg, 2.5% increase = 30.75kg → rounds to 30kg

### Presentation

Message displayed after completing the exercise, such as:
- "Você completou todas as séries acima da faixa! Considere aumentar para **84kg** na próxima sessão."
- "Você ficou abaixo da faixa em todas as séries. Considere diminuir para **28kg** na próxima sessão."

---

## 7. Navigation

### Structure: Bottom Tab Bar

| Tab             | Icon          | Content                                              |
| --------------- | ------------- | ---------------------------------------------------- |
| Início          | Calendar      | Calendar with markers + access to today's workout    |
| Treino Ativo    | Dumbbell      | Workout execution screen (when active)               |
| Programas       | ClipboardList | Program/workout list and editing                     |
| Exercícios      | Search        | Exercise list + progress chart                       |

---

## 8. Screen: Home (Calendar)

- Monthly calendar with **simple dot markers** on trained days
- Below the calendar: card with **today's workout** (based on active program + day of week)
- Button to start today's workout
- Option to pick a different workout from the program

---

## 9. Screen: Exercises

### List

- **Flat alphabetical** list of all exercises
- Search by name
- Selecting an exercise displays:

### Progress Chart

- **Type**: Line chart (Recharts)
- **Y-axis**: Total session volume (sets × reps × weight)
- **X-axis**: Session date
- Aggregates data from ALL sessions for that exercise, regardless of workout

### History Table

- Shows the **last 10 sessions** for the selected exercise
- Columns: Date | Workout Name | Weight (per set) | Reps (per set)
- No pagination, no filters

---

## 10. Screen: Programs

- List of user's programs
- Visual indicator of which one is active
- Create/edit/activate/deactivate programs
- Opening a program: view/edit weekly schedule and workouts
- Opening a workout: view/edit exercises, sets, reps, rest
- Adding an exercise: search the library (presets + custom) or create new

---

## 11. Screen: Active Workout

- Displays one exercise at a time with:
  - Exercise name
  - Prescribed rep range (e.g., "5-8 reps")
  - Recommended rest time (e.g., "90s - 3min")
  - Subtle reference to last session's weight
  - Fields to log weight and reps for each set
- Navigation between exercises (previous/next)
- Exercise reordering during the session
- After completing all sets: shows progression suggestion if applicable
- "Finalizar Treino" button at the end:
  - Unfinished exercises are marked as "skipped"
  - Session status changes to "completed"
  - Returns to home screen

---

## 12. Seed Exercises

### Peito (Chest)
Supino Reto, Supino Inclinado, Supino Declinado, Crucifixo, Crossover, Flexão de Braço

### Costas (Back)
Puxada Frontal, Remada Curvada, Remada Unilateral, Pullover, Remada Baixa, Barra Fixa

### Ombros (Shoulders)
Desenvolvimento Militar, Elevação Lateral, Elevação Frontal, Crucifixo Inverso, Encolhimento

### Bíceps
Rosca Direta, Rosca Alternada, Rosca Martelo, Rosca Concentrada, Rosca Scott

### Tríceps
Tríceps Pulley, Tríceps Testa, Tríceps Francês, Mergulho, Tríceps Corda

### Quadríceps (Quads)
Agachamento Livre, Leg Press, Cadeira Extensora, Agachamento Búlgaro, Hack Squat

### Posterior (Hamstrings)
Stiff, Mesa Flexora, Cadeira Flexora, Levantamento Terra Romeno

### Glúteos (Glutes)
Hip Thrust, Elevação Pélvica, Abdução de Quadril

### Panturrilha (Calves)
Panturrilha em Pé, Panturrilha Sentado

### Abdômen (Abs)
Abdominal Crunch, Prancha, Elevação de Pernas, Russian Twist
