
import Event from "../models/Event.model.js";

export const getSessions = async () => {
  return Event.aggregate([
    {
      $group: {
        _id: "$session_id",
        total_events: { $sum: 1 },
        first_event: { $min: "$timestamp" },
        last_event: { $max: "$timestamp" },
      },
    },
    {
      $project: {
        _id: 0,
        session_id: "$_id",
        total_events: 1,
        first_event: 1,
        last_event: 1,
      },
    },
    {
      $sort: { last_event: -1 },
    },
  ]);
};

export const getSessionEvents = async (sessionId) => {
  return Event.find({ session_id: sessionId })
    .sort({ timestamp: 1, _id: 1 })
    .lean();
};
