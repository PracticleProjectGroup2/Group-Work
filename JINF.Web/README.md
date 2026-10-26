# JINF.Web

React + TypeScript + Tailwind frontend for JINF (Just In, Now Found).

## Requirements

- [Node.js](https://nodejs.org/) 20 or newer (includes npm). Check with `node -v`.

## Run it

From the repository root:

```bash
cd JINF.Web
npm install
npm run dev
```

`npm install` is only needed the first time and after `package.json` changes.
Then open http://localhost:5173 in your browser. Stop the server with `Ctrl + C`.

> Keep the repo in a folder whose path has no `#` in it (for example not under `Code\C#\`). Vite fails to start from paths containing `#`.

## Mock mode (default)

Until the API endpoints exist, the app runs on sample data in `src/api/mock.ts`, so you can use it without running the backend.

- Log in with any email and any password.
- Emails starting with `admin` (e.g. `admin@test.com`) log in as reception/administrator.
- Changes are kept in memory only and reset when you refresh the page.

## Connecting to the backend

1. Run `JINF.Api` with the **http** profile (it listens on http://localhost:5132).
2. In `JINF.Web`, copy `.env.example` to `.env` and set `VITE_USE_MOCKS=false`.
3. Restart `npm run dev`.

Requests the frontend makes to `/api/*` are forwarded to the API by the dev server (see `vite.config.ts`), so the API doesn't need CORS set up for local development.

## Other commands

| Command | What it does |
|---|---|
| `npm run build` | Type-checks and builds a production version into `dist/` |
| `npm run preview` | Serves the built `dist/` folder locally |

## Structure

```
src/
  api/          types (mirror JINF.Api/Models), API client, mock data
  auth/         login state and route guards
  components/   layout, item list, status labels, form helpers
  pages/        browse, item detail + claim, report, my items, login/register, reception (admin)
```

## API contract

The exact requests and JSON responses the frontend expects from `JINF.Api` are in [API_CONTRACT.md](API_CONTRACT.md).
