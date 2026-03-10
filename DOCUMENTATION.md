# Phishing Awareness Game - Complete Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture & Technology Stack](#architecture--technology-stack)
3. [Database Schema](#database-schema)
4. [Application Structure](#application-structure)
5. [Core Components](#core-components)
6. [Game Mechanics](#game-mechanics)
7. [Admin Panel](#admin-panel)
8. [Setup & Deployment](#setup--deployment)
9. [API & Data Flow](#api--data-flow)

---

## Project Overview

The **Phishing Awareness Game** is an interactive web application designed to educate users about phishing emails through gamification. Players are presented with email screenshots and must identify whether each email is legitimate or a phishing attempt.

### Key Features
- **Interactive Game**: 10 questions per game session with timed responses
- **Time-Based Bonus System**: Faster correct answers earn bonus points
- **Follow-up Questions**: Optional multiple-choice questions for deeper learning
- **Leaderboard System**: Global ranking with player profiles
- **Admin Panel**: Full CRUD operations for managing questions
- **Dark/Light Theme**: User preference support
- **Responsive Design**: Works on desktop and mobile devices

---

## Architecture & Technology Stack

### Frontend
- **React 19** - Latest React with modern features
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **React Router v7** - Client-side routing
- **Framer Motion** - Smooth animations and transitions
- **CSS Variables** - Dynamic theming system

### Backend & Database
- **Supabase** - Backend-as-a-Service
  - PostgreSQL database
  - Storage buckets for images
  - Row Level Security (RLS) policies
  - Real-time capabilities

### State Management
- **React Query (@tanstack/react-query)** - Server state management
- **React Context API** - Theme and admin state
- **Custom Hooks** - Game logic and timer management

---

## Database Schema

### Tables

#### 1. `profiles`
Stores admin user information (not used for players).
```sql
- id: UUID (Primary Key)
- name: TEXT
- country: TEXT
- email: TEXT (optional)
- phone: TEXT (optional)
- company: TEXT (optional)
- additional_info: TEXT (optional)
- role: TEXT ('admin' | 'player')
- total_games_played: INTEGER
- best_score: INTEGER
- total_score: INTEGER
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### 2. `players`
Stores player information and game statistics.
```sql
- id: UUID (Primary Key) - Used as player UUID
- name: TEXT
- country: TEXT
- best_score: INTEGER
- total_score: INTEGER
- games_played: INTEGER
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### 3. `questions`
Main question repository with email screenshots.
```sql
- id: UUID (Primary Key)
- created_by: UUID (Foreign Key to profiles)
- question_type: TEXT ('phishing' | 'no_phishing')
- email_image_url: TEXT (Supabase storage URL)
- correct_answer: BOOLEAN
- explanation: TEXT (optional)
- points: INTEGER (base points for correct answer)
- difficulty: TEXT ('easy' | 'medium' | 'hard')
- timer_duration: INTEGER (seconds)
- is_active: BOOLEAN
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### 4. `followup_questions`
Optional follow-up questions for each main question.
```sql
- id: UUID (Primary Key)
- question_id: UUID (Foreign Key to questions)
- followup_text: TEXT
- option_a: TEXT
- option_b: TEXT
- option_c: TEXT
- option_d: TEXT
- correct_option: TEXT ('a' | 'b' | 'c' | 'd')
- explanation: TEXT (optional)
- order_index: INTEGER
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### 5. `game_sessions`
Tracks individual game sessions.
```sql
- id: UUID (Primary Key)
- player_id: UUID (Foreign Key to players, nullable)
- total_score: INTEGER
- questions_answered: INTEGER
- correct_answers: INTEGER
- is_completed: BOOLEAN
- completed_at: TIMESTAMP (nullable)
- created_at: TIMESTAMP
```

### Views

#### `leaderboard`
Aggregated view for displaying top players.
```sql
SELECT 
  player_name,
  country,
  best_score,
  games_played,
  total_score
FROM players
ORDER BY best_score DESC
```

### Storage Buckets
- **email-images**: Stores email screenshot images (public read access)

---

## Application Structure

```
src/
├── components/          # Reusable UI components
│   ├── game/           # Game-specific components
│   │   ├── IdleScreen.tsx
│   │   ├── LoadingScreen.tsx
│   │   ├── PlayingScreen.tsx
│   │   ├── AnsweredScreen.tsx
│   │   ├── FollowupScreen.tsx
│   │   ├── RegistrationScreen.tsx
│   │   └── FinishedScreen.tsx
│   ├── AdminSidebar.tsx
│   ├── FlowArrow.tsx
│   └── PrivateRoute.tsx
├── contexts/           # React Context providers
│   ├── AdminContext.tsx
│   └── ThemeContext.tsx
├── hooks/             # Custom React hooks
│   ├── useTimer.ts
│   ├── useGameSession.ts
│   └── useGameQuestions.ts
├── pages/             # Route pages
│   ├── Game.tsx
│   ├── Leaderboard.tsx
│   ├── AdminLogin.tsx
│   ├── AdminDashboard.tsx
│   ├── AdminQuestions.tsx
│   └── AdminEditQuestion.tsx
├── lib/               # External service configurations
│   └── supabase.ts
├── types/             # TypeScript type definitions
│   └── game.ts
├── styles/            # Additional stylesheets
│   └── leaderboard.css
├── App.tsx            # Main app component with routing
├── App.css            # Global styles
└── main.tsx           # Application entry point
```

---

## Core Components

### 1. Game Flow Components

#### **IdleScreen** (`src/components/game/IdleScreen.tsx`)
**Purpose**: Landing page that explains the game rules and scoring system.

**Features**:
- Animated game flow diagram (View → Analyze → Answer → Score)
- Scoring system explanation cards
- Start Game button with hover animations

**Props**:
- `error: string` - Error message to display
- `onStartGame: () => void` - Callback to start the game

---

#### **PlayingScreen** (`src/components/game/PlayingScreen.tsx`)
**Purpose**: Main gameplay screen where users answer questions.

**Features**:
- Displays email screenshot
- Shows timer with color-coded urgency (green → orange → red)
- Two answer buttons: "Report as Phishing" and "Mark as Safe"
- Real-time score display
- Question progress indicator

**Props**:
- `currentQuestion: QuestionWithFollowup` - Current question data
- `currentQuestionIndex: number` - Current question number
- `totalQuestions: number` - Total questions in game
- `timeLeft: number` - Remaining seconds
- `timerColor: string` - Timer color class
- `score: number` - Current score
- `onAnswer: (answer: boolean) => void` - Answer callback

**Key Interactions**:
- Clicking an answer button triggers `onAnswer` callback
- Timer automatically counts down
- Hover effects on answer buttons for better UX

---

#### **AnsweredScreen** (`src/components/game/AnsweredScreen.tsx`)
**Purpose**: Shows result after answering a question.

**Features**:
- Displays correct/incorrect badge with animation
- Shows base points earned/lost
- **Time bonus display** (⚡ +X time bonus!) for fast correct answers
- Explanation of the correct answer
- Continue button to proceed

**Props**:
- `currentQuestion: QuestionWithFollowup` - Question data
- `isCorrect: boolean | null` - Whether answer was correct
- `selectedAnswer: boolean | null` - User's answer (null if timeout)
- `timeBonus?: number` - Time-based bonus points earned
- `onContinue: () => void` - Proceed to next question

**Scoring Display Logic**:
```typescript
if (isCorrect) {
  // Show base points
  +{currentQuestion.points} points
  
  // Show time bonus if earned
  if (timeBonus > 0) {
    ⚡ +{timeBonus} time bonus!
  }
} else {
  // Show penalty
  -5 points
}
```

---

#### **FollowupScreen** (`src/components/game/FollowupScreen.tsx`)
**Purpose**: Optional follow-up multiple-choice question for deeper learning.

**Features**:
- Displays follow-up question text
- 4 multiple-choice options (A, B, C, D)
- Visual feedback on selection (correct/incorrect highlighting)
- Explanation after answering
- Next button to continue

**Props**:
- `currentQuestion: QuestionWithFollowup` - Question with followup data
- `selectedOption: 'a' | 'b' | 'c' | 'd' | null` - Selected option
- `isCorrect: boolean | null` - Whether followup answer was correct
- `onSelectOption: (option) => void` - Option selection callback
- `onNext: () => void` - Proceed to next question

---

#### **RegistrationScreen** (`src/components/game/RegistrationScreen.tsx`)
**Purpose**: Collect player information after completing the game.

**Features**:
- Player type tabs: "New Player" or "Returning Player"
- New Player form: name and country selection
- Returning Player form: paste UUID to link games
- Skip option (no leaderboard entry)
- Form validation

**Props**:
- `score: number` - Final game score
- `onSubmit: (name, country) => void` - New player registration
- `onSubmitUuid: (uuid) => void` - Returning player submission
- `onSkip: () => void` - Skip registration

**Flow**:
1. New Player → Creates new player record → Generates UUID
2. Returning Player → Updates existing player's stats
3. Skip → Proceeds to finish screen without saving

---

#### **FinishedScreen** (`src/components/game/FinishedScreen.tsx`)
**Purpose**: Final screen showing game results and statistics.

**Features**:
- Score circle with total points
- Statistics grid (correct answers, accuracy, follow-ups)
- UUID display box (for new players to save)
- Copy UUID button
- Performance message based on accuracy
- Two action buttons: "Play Again" and "Leaderboard"

**Props**:
- `questions: QuestionWithFollowup[]` - All questions
- `results: GameResult[]` - All answer results
- `score: number` - Final score
- `playerId: string | null` - Player ID if registered
- `playerName: string` - Player name
- `playerUuid: string` - Player UUID
- `showUuidMessage: boolean` - Whether to show UUID box
- `onLeaderboard: () => void` - Navigate to leaderboard
- `onPlayAgain: () => void` - Start new game

---

### 2. Custom Hooks

#### **useTimer** (`src/hooks/useTimer.ts`)
**Purpose**: Manages game timer countdown and time tracking.

**Features**:
- Countdown timer with 1-second intervals
- Automatic timeout callback when timer reaches 0
- Time spent calculation
- Timer color coding based on remaining time

**API**:
```typescript
const timer = useTimer(onTimeout);

// Methods
timer.startTimer(duration: number)  // Start countdown
timer.stopTimer()                   // Stop countdown
timer.getTimeSpent()               // Get elapsed time
timer.getTimerColor()              // Get color class

// State
timer.timeLeft                     // Current seconds remaining
timer.isPlayingRef                 // Playing state reference
```

**Timer Colors**:
- Green: > 10 seconds
- Orange: 6-10 seconds
- Red: ≤ 5 seconds (with pulse animation)

---

#### **useGameSession** (`src/hooks/useGameSession.ts`)
**Purpose**: Manages game session lifecycle in the database.

**Features**:
- Creates new game session on game start
- Updates session with score and stats
- Links session to player on registration

**API**:
```typescript
const { createSession, updateSession, completeSession } = useGameSession();

// Create new session
const sessionId = await createSession();

// Update session progress
await updateSession(score, questions, results);

// Link session to player
await completeSession(playerId);
```

---

#### **useGameQuestions** (`src/hooks/useGameQuestions.ts`)
**Purpose**: Fetches and manages game questions from Supabase.

**Features**:
- Fetches 10 random active questions
- Includes follow-up questions if available
- Error handling and loading states

**API**:
```typescript
const { questions, error, fetchQuestions } = useGameQuestions();

// Fetch questions
const loadedQuestions = await fetchQuestions();
```

**Query Logic**:
```sql
SELECT * FROM questions
WHERE is_active = true
ORDER BY RANDOM()
LIMIT 10
```

---

### 3. Context Providers

#### **ThemeContext** (`src/contexts/ThemeContext.tsx`)
**Purpose**: Manages dark/light theme across the application.

**Features**:
- Persists theme preference in localStorage
- Applies theme to document root element
- Provides toggle function

**Usage**:
```typescript
const { theme, toggleTheme } = useTheme();

// Current theme: 'light' | 'dark'
// Toggle: toggleTheme()
```

---

#### **AdminContext** (`src/contexts/AdminContext.tsx`)
**Purpose**: Manages admin authentication state.

**Features**:
- Stores admin profile UUID
- Persists login in localStorage
- Provides login/logout functions

**Usage**:
```typescript
const { adminId, login, logout } = useAdmin();

// Login with UUID
await login(uuid);

// Logout
logout();
```

---

## Game Mechanics

### Scoring System

#### Base Points
Each question has a base point value determined by difficulty:
- Easy: 5-10 points
- Medium: 10-15 points
- Hard: 15-20 points

#### Time-Based Bonus Points
**NEW FEATURE**: Rewards faster correct answers with bonus points.

| Time Remaining | Bonus Points |
|---------------|--------------|
| 30-21 seconds | +5 points    |
| 20-11 seconds | +3 points    |
| 10-1 seconds  | +1 point     |
| 0 seconds     | 0 points     |

**Calculation Logic** (`src/pages/Game.tsx`):
```typescript
const calculateTimeBonus = (timeLeft: number): number => {
  if (timeLeft >= 21) return 5;
  if (timeLeft >= 11) return 3;
  if (timeLeft >= 1) return 1;
  return 0;
};

// Applied only on correct answers
const basePoints = correct ? currentQuestion.points : -5;
const timeBonus = correct ? calculateTimeBonus(timer.timeLeft) : 0;
const pointsEarned = basePoints + timeBonus;
```

#### Penalties
- **Wrong Answer**: -5 points
- **Timeout**: -5 points (treated as incorrect)
- **Minimum Score**: Score never goes below 0

#### Follow-up Questions
- No points awarded for follow-up questions
- Used for educational purposes only
- Tracked separately in results

---

### Game Flow State Machine

```
idle → loading → playing → answered → [followup] → playing (next) → ... → registration → finished
```

**State Definitions**:
1. **idle**: Landing page, waiting to start
2. **loading**: Fetching questions from database
3. **playing**: Active question, timer running
4. **answered**: Showing result and explanation
5. **followup**: Optional follow-up question (if exists)
6. **registration**: Collect player info (after all questions)
7. **finished**: Final results and statistics

**State Transitions**:
```typescript
type GameState = 'idle' | 'loading' | 'playing' | 'answered' | 'followup' | 'finished' | 'registration';

// Managed in src/pages/Game.tsx
const [gameState, setGameState] = useState<GameState>('idle');
```

---

### Timer Behavior

**Timer Duration**: Each question has a configurable timer (default 30 seconds).

**Timer Events**:
1. **Start**: Timer begins when question is displayed
2. **Answer**: Timer stops when user clicks an answer
3. **Timeout**: Timer reaches 0 → automatic incorrect answer

**Visual Feedback**:
- Timer color changes based on urgency
- Pulse animation when < 5 seconds
- Large, prominent display

---

### Player Tracking System

#### New Players
1. Complete game
2. Enter name and country
3. System generates UUID
4. UUID displayed with copy button
5. Player saves UUID for future games

#### Returning Players
1. Complete game
2. Select "Returning Player" tab
3. Paste saved UUID
4. System updates existing player stats:
   - Increments `games_played`
   - Updates `best_score` if current score is higher
   - Adds current score to `total_score`

#### UUID System
- UUIDs are the primary key from the `players` table
- No password or email required
- Simple, privacy-friendly identification
- Players responsible for saving their UUID

---

## Admin Panel

### Authentication

**Login System** (`src/pages/AdminLogin.tsx`):
- UUID-based authentication (no password)
- Admin UUID must exist in `profiles` table with `role = 'admin'`
- UUID stored in localStorage for persistence
- Protected routes using `PrivateRoute` component

**Creating Admin**:
```sql
-- In Supabase Dashboard
INSERT INTO profiles (id, name, role)
VALUES ('your-uuid-here', 'Admin Name', 'admin');
```

---

### Admin Dashboard

#### **AdminDashboard** (`src/pages/AdminDashboard.tsx`)
**Purpose**: Main admin interface for creating questions.

**Features**:
- Create new questions with image upload
- Set question type (phishing/legitimate)
- Configure points, difficulty, timer duration
- Add optional follow-up questions with 4 options
- Preview recent questions
- Navigate to full question list

**Form Fields**:
```typescript
{
  questionType: 'phishing' | 'no_phishing',
  imageFile: File,
  correctAnswer: boolean,
  explanation: string,
  points: number,
  difficulty: 'easy' | 'medium' | 'hard',
  timerDuration: number,
  
  // Follow-up (optional)
  hasFollowup: boolean,
  followupText: string,
  optionA: string,
  optionB: string,
  optionC: string,
  optionD: string,
  correctOption: 'a' | 'b' | 'c' | 'd',
  followupExplanation: string
}
```

**Image Upload Process**:
1. User selects image file
2. File validated (type, size)
3. Uploaded to Supabase `email-images` bucket
4. Public URL stored in question record

---

#### **AdminQuestions** (`src/pages/AdminQuestions.tsx`)
**Purpose**: View all questions in a grid layout.

**Features**:
- Grid view of all questions
- Click to edit any question
- Visual indicators for question type
- Difficulty badges
- Quick navigation back to dashboard

---

#### **AdminEditQuestion** (`src/pages/AdminEditQuestion.tsx`)
**Purpose**: Edit existing questions.

**Features**:
- Pre-filled form with current question data
- Update all question fields
- Replace image (optional)
- Delete question with confirmation
- Update follow-up questions

**Update Process**:
1. Load existing question data
2. User modifies fields
3. If new image: upload and update URL
4. Update question record
5. Update follow-up record (if exists)

---

### Admin Sidebar Navigation

**Routes**:
- Dashboard: `/admin/dashboard` - Create questions
- Questions: `/admin/questions` - View all questions
- Logout: Clears admin session

---

## Setup & Deployment

### Prerequisites
- Node.js 18+ and npm
- Supabase account and project
- Git (for version control)

### Environment Setup

1. **Clone Repository**:
```bash
git clone https://github.com/HaitarDev/phishing-gamified.git
cd phishing-gamified
```

2. **Install Dependencies**:
```bash
npm install
```

3. **Configure Environment Variables**:
Create `.env` file in root:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. **Run Database Migrations**:
Execute SQL files in `supabase/migrations/` in order:
- 001_create_base_functions.sql
- 002_create_profiles_table.sql
- 003_create_questions_table.sql
- 004_create_followup_questions_table.sql
- 005_create_storage_buckets.sql
- 006_create_rls_policies.sql
- 007_create_game_sessions_table.sql
- 008_create_auth_trigger.sql
- 008_create_leaderboard_view.sql
- 009_add_timer_duration.sql
- 010_create_players_table.sql
- 011_add_option_d_to_followup_questions.sql

5. **Create Storage Bucket**:
In Supabase Dashboard:
- Go to Storage
- Create bucket named `email-images`
- Set to public access

6. **Create Admin Profile**:
```sql
INSERT INTO profiles (name, role)
VALUES ('Your Name', 'admin');
-- Copy the generated UUID
```

7. **Start Development Server**:
```bash
npm run dev
```

8. **Access Application**:
- Game: `http://localhost:5173/`
- Admin Login: `http://localhost:5173/admin/login`

---


## API & Data Flow

### Game Flow Data Operations

#### 1. Start Game
```typescript
// Create session
POST /game_sessions
{
  total_score: 0,
  questions_answered: 0,
  correct_answers: 0,
  is_completed: false
}

// Fetch questions
GET /questions?is_active=eq.true&limit=10
GET /followup_questions?question_id=in.(q1,q2,...)
```

#### 2. Answer Question
```typescript
// Client-side calculation
const correct = answer === question.correct_answer;
const basePoints = correct ? question.points : -5;
const timeBonus = correct ? calculateTimeBonus(timeLeft) : 0;
const totalPoints = basePoints + timeBonus;

// Update local state
setScore(prev => Math.max(0, prev + totalPoints));
setResults([...results, {
  questionId: question.id,
  correct,
  points: totalPoints,
  timeSpent,
  timeBonus
}]);
```

#### 3. Complete Game
```typescript
// Update session
PATCH /game_sessions/{id}
{
  total_score: finalScore,
  questions_answered: 10,
  correct_answers: correctCount
}
```

#### 4. Register Player
```typescript
// New player
POST /players
{
  name: playerName,
  country: playerCountry
}
// Returns: { id: uuid, ... }

// Update session with player
PATCH /game_sessions/{sessionId}
{
  player_id: playerId,
  is_completed: true,
  completed_at: now()
}

// Update player stats
PATCH /players/{playerId}
{
  best_score: max(current, new),
  total_score: current + new,
  games_played: current + 1
}
```

#### 5. Returning Player
```typescript
// Verify UUID exists
GET /players/{uuid}

// Update stats
PATCH /players/{uuid}
{
  best_score: max(current, new),
  total_score: current + new,
  games_played: current + 1
}
```

---

### Admin Operations

#### Create Question
```typescript
// 1. Upload image
POST /storage/v1/object/email-images/{filename}
// Returns: { path: "..." }

// 2. Create question
POST /questions
{
  created_by: adminId,
  question_type: type,
  email_image_url: publicUrl,
  correct_answer: answer,
  explanation: text,
  points: points,
  difficulty: difficulty,
  timer_duration: seconds,
  is_active: true
}

// 3. Create follow-up (if provided)
POST /followup_questions
{
  question_id: questionId,
  followup_text: text,
  option_a: optionA,
  option_b: optionB,
  option_c: optionC,
  option_d: optionD,
  correct_option: correct,
  explanation: text,
  order_index: 0
}
```

#### Update Question
```typescript
// 1. Update image (if new)
POST /storage/v1/object/email-images/{filename}

// 2. Update question
PATCH /questions/{id}
{ ...updatedFields }

// 3. Update follow-up
PATCH /followup_questions?question_id=eq.{id}
{ ...updatedFields }
```

#### Delete Question
```typescript
// 1. Delete follow-ups
DELETE /followup_questions?question_id=eq.{id}

// 2. Delete question
DELETE /questions/{id}

// 3. Delete image (optional)
DELETE /storage/v1/object/email-images/{filename}
```

---

### Leaderboard Query
```typescript
GET /leaderboard?order=best_score.desc&limit=50

// Returns aggregated player data
[{
  player_name: string,
  country: string,
  best_score: number,
  games_played: number,
  total_score: number
}]
```

---

## Security Considerations

### Row Level Security (RLS)
All tables have RLS policies:

**Questions & Follow-ups**:
- Public read access (for game)
- Admin-only write access

**Players**:
- Public insert (new players)
- Update only own records (by UUID)

**Game Sessions**:
- Public insert (start game)
- Update only own sessions

**Profiles**:
- Admin-only access

### Storage Security
- `email-images` bucket: Public read, admin-only write
- File size limits enforced
- File type validation on upload

### Admin Authentication
- UUID-based (no password storage)
- Session persisted in localStorage
- Protected routes with `PrivateRoute` component
- No sensitive data exposed in client

---

## Performance Optimizations

1. **Image Optimization**: Images stored in Supabase CDN
2. **Lazy Loading**: Route-based code splitting
3. **Memoization**: React.memo on expensive components
4. **Debouncing**: Form inputs debounced
5. **Caching**: React Query caches API responses
6. **Animations**: GPU-accelerated with Framer Motion

---

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

---

## Troubleshooting

### Common Issues

**Issue**: Questions not loading
- Check Supabase connection
- Verify `is_active = true` on questions
- Check browser console for errors

**Issue**: Images not displaying
- Verify storage bucket is public
- Check image URLs in database
- Ensure CORS is configured

**Issue**: Admin login fails
- Verify UUID exists in `profiles` table
- Check `role = 'admin'`
- Clear localStorage and try again

**Issue**: Timer not working
- Check browser console for errors
- Verify `timer_duration` is set on questions
- Test in different browser

---

## Future Enhancements

Potential features for future versions:
- Email authentication for players
- Question categories/tags
- Difficulty-based game modes
- Achievements and badges
- Social sharing
- Analytics dashboard
- Multi-language support
- Mobile app version

---