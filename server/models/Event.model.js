import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    session_id: {
      type: String,
      required: true,
      index: true,
    },

    event_type: {
      type: String,
      required: true,
      enum: ["page_view", "click"],
    },

    page_url: {
      type: String,
      required: true,
    },

    timestamp: {
      type: Date,
      required: true,
      default: Date.now,
    },

    // Viewport coordinates
    x: {
      type: Number,
      default: null,
    },

    y: {
      type: Number,
      default: null,
    },

    // Browser viewport dimensions
    viewport_width: {
      type: Number,
      default: null,
    },

    viewport_height: {
      type: Number,
      default: null,
    },

    // Scroll position when the event occurred
    scroll_x: {
      type: Number,
      default: 0,
    },

    scroll_y: {
      type: Number,
      default: 0,
    },

    // Coordinates relative to the full document
    document_x: {
      type: Number,
      default: null,
    },

    document_y: {
      type: Number,
      default: null,
    },

    // Full document dimensions
    document_width: {
      type: Number,
      default: null,
    },

    document_height: {
      type: Number,
      default: null,
    },
  },
  {
    versionKey: false,
  }
);

eventSchema.index({ page_url: 1, event_type: 1 });

const Event = mongoose.model("Event", eventSchema);

export default Event;