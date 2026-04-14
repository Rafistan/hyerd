# Hyerd — Armenian Community Hub

Modern community marketplace for the Armenian diaspora. Built with Angular 17 (frontend) and Express (backend API).

## Prerequisites

- **Node.js** v18+ (v20 recommended)
- **npm** v9+

## Installation

```bash
npm install
```

## Running the App

### Both frontend & backend together (recommended)

```bash
npm run dev
```

This uses `concurrently` to start both servers at once:
- Frontend → http://localhost:4200
- Backend API → http://localhost:3200

API calls from the frontend are proxied through `/api` via `proxy.conf.json`, so no CORS issues in dev.

---

### Frontend only

```bash
npm start
```

Starts the Angular dev server at http://localhost:4200. API calls are proxied to `localhost:3200` — the backend must also be running for data to load.

### Backend only

```bash
npm run server
```

Starts the Express API server at http://localhost:3200.

Available endpoints:

| Route | Description |
|---|---|
| `/api/businesses` | Business directory |
| `/api/jobs` | Job listings |
| `/api/housing` | Housing listings |
| `/api/cars` | Car listings |
| `/api/events` | Community events |
| `/api/marketplace` | Marketplace items |
| `/api/auth` | Authentication |
| `/api/reviews` | Reviews |
| `/api/messages` | Messaging |
| `/api/users` | User profiles |

---

## Build for Production

```bash
npm run build
```

Output goes to `dist/`. Serve the `dist/hyerd/browser` directory with any static file server.

## Project Structure

```
hyerd/
├── src/                    # Angular frontend
│   ├── app/
│   │   ├── features/       # Page components (home, jobs, cars, profile…)
│   │   ├── shared/         # Navbar, footer, directives
│   │   └── core/           # Services, models
│   └── styles.scss         # Global design system (--hy-* CSS variables)
├── server/                 # Express backend
│   ├── index.js            # Entry point (port 3200)
│   ├── routes/             # API route handlers
│   ├── middleware/         # Express middleware
│   └── data/               # Mock/seed data
└── proxy.conf.json         # Dev proxy: /api → localhost:3200
```
