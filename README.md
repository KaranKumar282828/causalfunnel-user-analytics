# User Analytics Dashboard

A full-stack user analytics application that tracks webpage interactions and visualizes user activity through a dashboard.

## Features

- Client-side tracking of page views and clicks
- Session-based user activity tracking
- Interaction metadata, including coordinates and scroll/document dimensions
- Sessions dashboard for exploring recorded activity
- Click heatmap visualization for understanding user interaction patterns
- REST API built with Node.js and Express
- MongoDB persistence using Mongoose

## Tech Stack

Frontend: React, Vite, Tailwind CSS  
Backend: Node.js, Express.js  
Database: MongoDB, Mongoose

## Project Structure

causal-funnel-analytics/
├── client/
│   ├── public/
│   │   ├── demo.html
│   │   └── tracker.js
│   └── src/
└── server/
    ├── controllers/
    ├── models/
    ├── routes/
    ├── services/
    ├── db.js
    └── server.js

## Local Setup

### Prerequisites

- Node.js and npm
- MongoDB connection string



### 1. Start the backend

cd server
npm install


Create a `.env` file inside `server/`:

MONGODB_URI=your_mongodb_connection_string
PORT=5000


Start the backend:

npm run dev

Health check: `http://localhost:5000/api/health`



### 2. Start the frontend

Open a second terminal:

cd client
npm install


Create `client/.env` with:

VITE_API_URL=http://localhost:5000


Start the frontend:

npm run dev
Open the local URL printed by Vite in your terminal.



## API Routes

| Endpoint            | Purpose                        |
|---------------------|--------------------------------|
| `GET /api/health`   | Check backend status           |
| `/api/events`       | Record user interaction events |
| `/api/sessions`     | Access session analytics       |
| `/api/heatmap`      | Access heatmap data            |



## Configuration

The frontend API base URL is configured through `VITE_API_URL`. The backend MongoDB connection is configured through `MONGODB_URI`.

Never commit `.env` files or production secrets.