
import {
  getSessions as fetchSessions,
  getSessionEvents as fetchSessionEvents,
} from "../services/session.service.js";

export const getSessions = async (req, res) => {
  try {
    const sessions = await fetchSessions();

    return res.status(200).json({
      count: sessions.length,
      sessions,
    });
  } catch (error) {
    console.error("Fetch sessions error:", error.message);

    return res.status(500).json({
      message: "Failed to fetch sessions",
    });
  }
};

export const getSessionEvents = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const events = await fetchSessionEvents(sessionId);

    return res.status(200).json({
      session_id: sessionId,
      count: events.length,
      events,
    });
  } catch (error) {
    console.error("Fetch session events error:", error.message);

    return res.status(500).json({
      message: "Failed to fetch session events",
    });
  }
};
