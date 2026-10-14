# User Analytics Dashboard

A full-stack web analytics application that captures page views and click interactions, groups activity by session, and visualizes click patterns in a React dashboard.

## Features

- **Page-view and click tracking** using a lightweight client-side script.
- **Session-based activity** for exploring recorded user interactions.
- **Interaction metadata**, including available coordinates and scroll/document dimensions.
- **Sessions dashboard** to review recorded session activity.
- **Click heatmap** to visualize click locations and inspect interaction patterns.
- **REST API** built with Express, organized into event, session, and heatmap routes.
- **MongoDB persistence** using Mongoose.

## Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | React, Vite, Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| API | REST |

## Architecture

```text
Tracked webpage (demo.html)
        |
        v
Client tracking script (tracker.js)
        |
        v
Express REST API
  ├── /api/events
  ├── /api/sessions
  └── /api/heatmap
        |
        v
MongoDB via Mongoose
        |
        v
React dashboard
  ├── Sessions view
  └── Click heatmap
```

## Project Structure

```text
causal-funnel-analytics/
├── client/
│   ├── public/
│   │   ├── demo.html
│   │   └── tracker.js
│   └── src/
│       ├── components/
│       └── pages/
│           ├── Heatmap.jsx
│           └── Sessions.jsx
└── server/
    ├── controllers/
    ├── models/
    ├── routes/
    ├── services/
    ├── db.js
    └── server.js
```

## Local Setup

### Prerequisites
- Node.js and npm
- A MongoDB database and connection URI

### 1. Start the backend

```bash
cd server
npm install
```

Create `server/.env`:

```env
MONGODB_URI=your_mongodb_connection_string
PORT=5000
```

Start the API:

```bash
npm run dev
```

Health check: `http://localhost:5000/api/health`  
A successful response should include `status: OK`.

### 2. Start the frontend

Open a second terminal from the repository root:

```bash
cd client
npm install
```

Create `client/.env`:

```env
VITE_API_URL=http://localhost:5000
```

Start the frontend:

```bash
npm run dev
```

Open the local URL printed by Vite.

### 3. Try the tracking demo

With the API and frontend running, open the demo page and interact with it. The script is located at `client/public/tracker.js`. Confirm its configured API URL points to the backend you are running.

## API Routes

| Route | Purpose |
|---|---|
| `GET /api/health` | Backend health check |
| `/api/events` | Event collection |
| `/api/sessions` | Session analytics |
| `/api/heatmap` | Heatmap data |

The exact HTTP methods and request/response schemas are defined by the route implementation.

## Configuration

- `MONGODB_URI` — MongoDB connection string.
- `PORT` — backend port; defaults to `5000`.
- `VITE_API_URL` — frontend API base URL, such as `http://localhost:5000`.

Never commit `.env` files, database credentials, or API secrets.

## Production Build

From the repository root:

```bash
npm --prefix client run build
```

The production build is generated in `client/dist/`.

## Scope

The current project focuses on event collection, session exploration, and click-pattern visualization. Add deployment URLs, authentication, consent management, or additional metrics to this README only after those capabilities are implemented and verified.
