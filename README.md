# quizGen

> AI-powered quiz and study-notes generator for AWS certification prep.
> Paste a transcript → get a personalized quiz + markdown study notes.

Built because most online quiz platforms throttle free usage. quizGen leans on
the cost-effective DeepSeek API to keep regeneration cheap, so you can iterate
on study material as much as you need.

## Features

- Multiple-choice quizzes generated from any pasted transcript / notes
- Auto-generated markdown study notes alongside each quiz
- Two study modes: **Learning** (instant feedback) and **Testing** (graded at end)
- Saved quizzes organized into folders, revisitable later (Supabase-backed)
- Per-user customizable prompt templates (Settings page)
- Email/password and Google sign-in (Firebase Auth)
- LocalStorage cache (1-hour TTL) avoids redundant API calls on refresh
- Responsive UI: dedicated mobile drawer, desktop sidebar

## Tech stack

React 19 · Vite 6 · Tailwind v4 · React Router 7 · Firebase Auth · Supabase ·
DeepSeek (via the OpenAI SDK) · React Markdown + GFM + raw HTML

---

## Development

### Prerequisites

- Node.js 20+
- A Firebase project (Auth enabled — email/password and Google providers)
- A Supabase project with the tables described under [Supabase schema](#supabase-schema)
- A DeepSeek API key

### Setup

```bash
git clone <repo>
cd quizGen
npm install
cp .env.example .env   # then fill in values
npm run dev
```

### Scripts

| Command           | Purpose                             |
| ----------------- | ----------------------------------- |
| `npm run dev`     | Vite dev server with HMR            |
| `npm run build`   | Production bundle to `dist/`        |
| `npm run preview` | Serve the built bundle locally      |
| `npm run lint`    | ESLint over the project             |

### Environment variables

| Variable                                | Used by                         |
| --------------------------------------- | ------------------------------- |
| `VITE_APIKEY`                           | `src/firebase/config.js`        |
| `VITE_AUTHDOMAIN`                       | `src/firebase/config.js`        |
| `VITE_PROJECTID`                        | `src/firebase/config.js`        |
| `VITE_STORAGEBUCKET`                    | `src/firebase/config.js`        |
| `VITE_MESSAGINGSENDERID`                | `src/firebase/config.js`        |
| `VITE_APPID`                            | `src/firebase/config.js`        |
| `VITE_SUPABASE_URL`                     | `src/supabase/client.js`        |
| `VITE_SUPABASE_ANON_KEY`                | `src/supabase/client.js`        |
| `VITE_DEEPSEEK_API_ACCESS_KEY`          | `src/services/deepSeek.js`      |
| `VITE_REACT_APP_AWS_REGION`             | `src/services/deepSeek.js` (Bedrock client; initialized but unused) |
| `VITE_REACT_APP_AWS_ACCESS_KEY_ID`      | same as above                   |
| `VITE_REACT_APP_AWS_SECRET_ACCESS_KEY`  | same as above                   |

See `.env.example` for a copy-paste-ready scaffold.

### Project structure

```
src/
├── App.jsx               Route definitions
├── main.jsx              Entry; mounts <App /> inside <BrowserRouter>
├── components/
│   ├── auth/             Login, Register
│   ├── layouts/          Layout (auth-guarded), Sidebar, Header, MobileMenu
│   ├── LandingPage.jsx   Public marketing page
│   ├── NavBar.jsx        Public-route top bar
│   ├── PromptPage.jsx    Quiz-generation form
│   ├── AIQuizNotes.jsx   Generated quiz + notes screen
│   ├── QuizSection.jsx   Reusable interactive quiz renderer
│   ├── QuizDetail.jsx    /quiz/:id loader (re-hydrates saved quizzes)
│   ├── Library.jsx       Folders + saved quiz sets browser
│   ├── SaveQuizModal.jsx Persists generated quiz/summary into Supabase
│   ├── Settings.jsx      Per-user prompt overrides
│   ├── ScrollToTop.jsx   Resets scroll on route change
│   └── LearnMore.jsx     Stub
├── contexts/
│   ├── AuthContext.jsx   Firebase auth state + useAuth() hook
│   └── DevelopingFlag.jsx  Toggle to bypass DeepSeek calls in dev
├── firebase/
│   ├── config.js         Firebase init (auth + firestore)
│   └── auth.js           Email/password + Google + reset/logout wrappers
├── supabase/
│   └── client.js         Singleton Supabase client
├── services/
│   └── deepSeek.js       Quiz + summary generators (and prompt templates)
├── helper/
│   ├── quizHelper.js     Fisher–Yates shuffle helpers
│   └── scrollLock.js     Body-scroll lock for modals
└── styles/, assets/      CSS + static images
```

### Routes

| Path           | Component       | Auth required                    |
| -------------- | --------------- | -------------------------------- |
| `/`            | `LandingPage`   | No (redirects to `/prompt` if logged in) |
| `/learn-more`  | `LearnMore`     | No (stub)                        |
| `/login`       | `Login`         | No (redirects to `/` if logged in) |
| `/register`    | `Register`      | No (redirects to `/` if logged in) |
| `/prompt`      | `PromptSection` | Yes (Layout guards)              |
| `/quizNotes`   | `AIQuizNotes`   | Yes                              |
| `/library`     | `Library`       | Yes                              |
| `/settings`    | `Settings`      | Yes                              |
| `/quiz/:id`    | `QuizDetail`    | Yes                              |

### Data flow

1. **Generate** — `PromptPage` validates input and `navigate("/quizNotes",
   { state })` with a freshly-minted `quizSummaryId` (UUID).
2. **AIQuizNotes** reads router state and either:
   - hits `invokeDeepSeekQuizGenerator` + `invokeDeepSeekSummaryGenerator`,
     then caches both responses to localStorage under
     `quiz_cache_${quizSummaryId}_quiz` / `_summary` (1h TTL); or
   - in dev (`isDeveloping = true`) returns hardcoded fixtures so the API
     isn't called.
3. **SaveQuizModal** writes the quiz set into Supabase: a row in `quiz_sets`,
   a row in `quizzes` (the JSON quiz), a row in `summaries` (the markdown
   notes), creating a `folder` first if needed.
4. **Library** lists folders and quiz sets for the signed-in user.
5. **QuizDetail** (`/quiz/:id`) re-fetches from Supabase, caches into the
   same localStorage keys, then `replace`-navigates to `/quizNotes` in
   `mode: 'load'` so `AIQuizNotes` re-renders the saved data.

### Supabase schema

No migrations exist in the repo — the table shapes below are inferred from
the SELECT/INSERT calls in `Library.jsx`, `SaveQuizModal.jsx`,
`QuizDetail.jsx`, `Settings.jsx`, and `AIQuizNotes.jsx`. Confirm against
your live project before extending.

| Table        | Observed columns                                                                | Purpose                                              |
| ------------ | ------------------------------------------------------------------------------- | ---------------------------------------------------- |
| `userFolder` | `id`, `user_id`, `quizPrompt`, `summaryPrompt`                                  | Per-user prompt overrides; one row per Firebase uid  |
| `folder`     | `id`, `userFolder` (FK → `userFolder.id`), `title`, `created_at`                | A study folder under the user                        |
| `quiz_sets`  | `id`, `folder_id`, `quiz_summary_id`, `title`, `tags`, `created_at`             | A saved quiz + summary pair, grouped by folder       |
| `quizzes`    | `id`, `quiz_set_id`, `quiz_data` (JSON), `is_reinforced`                        | The JSON quiz payload                                |
| `summaries`  | `id`, `quiz_set_id`, `title`, `summary_content` (markdown)                      | The markdown study notes                             |

`Settings.jsx` falls back to snake_case (`quiz_prompt`, `summary_prompt`) if
the camelCase columns aren't present, so either naming will work for that
table.

### DeepSeek quiz JSON contract

`invokeDeepSeekQuizGenerator` returns a raw JSON string with this shape (the
caller `JSON.parse`s it after stripping any ```` ```json ```` fences):

```json
{
  "title": "Short, transcript-derived title (≤ 50 chars)",
  "quiz": [
    {
      "question": "string",
      "options": ["string", "string", "string", "string"],
      "correct": 2,
      "explanation": "string"
    }
  ]
}
```

- `correct` is the **index** into `options`, not the option text.
- `invokeDeepSeekSummaryGenerator` returns a markdown string. It's rendered
  with `react-markdown` + `remark-gfm` + `rehype-raw`, so inline HTML
  (`<br>`, `<b>`, etc.) in the response renders rather than being escaped.

### Caching

`AIQuizNotes.cacheWithExpiry` writes
`quiz_cache_${quizSummaryId}_{quiz|summary}` to localStorage with a 1-hour
TTL. `getCachedItem` evicts expired entries on read. To force-refresh during
development: `localStorage.clear()` in the browser console.

### Auth

- Firebase Auth (email/password + Google popup); see `src/firebase/auth.js`.
- `Layout` redirects unauthenticated users to `/`; `LandingPage` /
  `Login` / `Register` redirect logged-in users away.
- `useAuth()` exposes `{ currentUser, userLoggedIn, loading }`. Consumers
  don't need to guard for `loading` — `AuthProvider` doesn't render children
  until the initial auth state resolves.

### Development flag

`DevelopingFlagContext` defaults to `isDeveloping: true`, which makes
`PromptPage` skip word-count validation and `AIQuizNotes` substitute
hardcoded quiz/summary fixtures instead of calling DeepSeek. Flip the
initial value in `src/contexts/DevelopingFlag.jsx` (or call
`setIsDeveloping(false)` from a consumer) to hit the real API.

### Known TODOs

- Forgot-password flow stubbed in `auth/Login.jsx`
- Folder deletion not implemented (`Library.handleDeleteFolder` returns early)
- Tags UI commented out in `SaveQuizModal.jsx`
- `/profile` route is referenced from nav dropdowns but no component is mounted
- `LearnMore.jsx` is a placeholder
- AWS Bedrock client is initialized in `services/deepSeek.js` but never invoked
