
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./db.js";
import eventRoutes from "./routes/event.routes.js";
import sessionRoutes from "./routes/session.routes.js";
import heatmapRoutes from "./routes/heatmap.routes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Analytics backend is running",
  });
});

app.use("/api/events", eventRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/heatmap", heatmapRoutes);

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
};

startServer();
