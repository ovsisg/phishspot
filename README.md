PhishSpot is a game where users answer questions to decide whether emails are phishing or legitimate.

## Setup

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Configure Supabase:**
   - Copy `.env.example` to `.env`
   - Add your Supabase project URL and anon key:
     ```
     VITE_SUPABASE_URL=your_supabase_project_url
     VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
     ```

3. **Run migrations:**
   - Follow the instructions in `supabase/migrations/README.md`
   - Create storage buckets via the Supabase Dashboard

4. **Create an admin profile:**
   - In the Supabase Dashboard, go to Table Editor → profiles
   - Insert a new row with `role = 'admin'`
   - Copy the generated UUID (you will need this to log in)

5. **Start the development server:**
   ```bash
   npm run dev
   ```

## Admin Access

- **Login:** `/admin/login` (requires admin profile UUID)
- **Dashboard:** `/admin/dashboard` (private, admin only)

## Features

- Admin authentication (Supabase Auth not required)
- Create questions with images
- Upload to Supabase storage buckets
- Add follow-up questions (3 options)
- Dark/light theme support
- View and delete existing questions

## Tech Stack

- React 19 + TypeScript
- Vite
- React Router
- Supabase (Database + Storage)
- CSS variables for theming

## React Compiler

The React Compiler is not enabled in this template because of its impact on dev & build performance. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from "eslint-plugin-react-x";
import reactDom from "eslint-plugin-react-dom";

export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs["recommended-typescript"],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```
