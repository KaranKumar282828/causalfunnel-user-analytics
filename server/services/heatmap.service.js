import Event from "../models/Event.model.js";

export const getPageClicks = async (pageUrl) => {
  return Event.find({
    page_url: pageUrl,
    event_type: "click",
  })
    .select(
      [
        "session_id",
        "page_url",
        "timestamp",
        "x",
        "y",
        "viewport_width",
        "viewport_height",
        "scroll_x",
        "scroll_y",
        "document_x",
        "document_y",
        "document_width",
        "document_height",
      ].join(" ")
    )
    .sort({ timestamp: 1 })
    .lean();
};