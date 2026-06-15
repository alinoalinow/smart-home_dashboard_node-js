# Smart Home Dashboard - Frontend

Vue 3 + Vite frontend for the Smart Home Dashboard.

## Development

From the root project directory, run:

```bash
npm run dev
```

This starts:
- **Frontend dev server** on `http://localhost:5173` with hot reload
- **Backend API server** on `http://localhost:3000`

The frontend proxy forwards API calls to the backend automatically.

## Building for Production

From the root project directory:

```bash
npm run build
```

This creates an optimized build in `frontend/dist/`.

## Starting Production Server

```bash
npm start
```

This builds the frontend and serves it via the Node.js backend on `http://localhost:3000`.

## Project Structure

```
frontend/
├── src/
│   ├── main.js          # Vue app entry point
│   ├── App.vue          # Root component with dashboard
│   └── style.css        # Global styles
├── index.html           # HTML template
├── vite.config.js       # Vite configuration
└── package.json         # Frontend dependencies
```

## Technologies

- **Vue 3** - Progressive JavaScript framework
- **Vite** - Lightning-fast frontend build tool
- **JavaScript** - No TypeScript (keep it simple)
