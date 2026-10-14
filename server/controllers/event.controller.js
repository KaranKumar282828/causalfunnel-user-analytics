import Event from "../models/Event.model.js";

export const createEvent = async (req, res) => {
  try {
    const {
      session_id,
      event_type,
      page_url,
      timestamp,
      x,
      y,
      viewport_width,
      viewport_height,
      scroll_x,
      scroll_y,
      document_x,
      document_y,
      document_width,
      document_height,
    } = req.body;

    // Validate required fields
    if (!session_id || !event_type || !page_url) {
      return res.status(400).json({
        message: "session_id, event_type and page_url are required",
      });
    }

    // Validate event type
    if (!["page_view", "click"].includes(event_type)) {
      return res.status(400).json({
        message: "event_type must be page_view or click",
      });
    }

    // Click events must include numeric coordinates
    if (
      event_type === "click" &&
      (!Number.isFinite(x) || !Number.isFinite(y))
    ) {
      return res.status(400).json({
        message: "Click events require numeric x and y coordinates",
      });
    }

    const event = await Event.create({
      session_id,
      event_type,
      page_url,
      timestamp: timestamp ? new Date(timestamp) : new Date(),

      // Viewport coordinates
      x: event_type === "click" ? x : null,
      y: event_type === "click" ? y : null,

      // Viewport dimensions
      viewport_width: Number.isFinite(viewport_width)
        ? viewport_width
        : null,
      viewport_height: Number.isFinite(viewport_height)
        ? viewport_height
        : null,

      // Scroll position
      scroll_x: Number.isFinite(scroll_x) ? scroll_x : 0,
      scroll_y: Number.isFinite(scroll_y) ? scroll_y : 0,

      // Full document coordinates
      document_x: Number.isFinite(document_x)
        ? document_x
        : event_type === "click" && Number.isFinite(x)
          ? x + (Number.isFinite(scroll_x) ? scroll_x : 0)
          : null,

      document_y: Number.isFinite(document_y)
        ? document_y
        : event_type === "click" && Number.isFinite(y)
          ? y + (Number.isFinite(scroll_y) ? scroll_y : 0)
          : null,

      // Full document dimensions
      document_width: Number.isFinite(document_width)
        ? document_width
        : null,
      document_height: Number.isFinite(document_height)
        ? document_height
        : null,
    });

    return res.status(201).json({
      message: "Event stored successfully",
      event,
    });
  } catch (error) {
    console.error("Create event error:", error.message);

    return res.status(500).json({
      message: "Failed to store event",
    });
  }
};
