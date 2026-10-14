
import { getPageClicks } from "../services/heatmap.service.js";

export const getHeatmapData = async (req, res) => {
  try {
    const { page_url } = req.query;

    if (!page_url || typeof page_url !== "string") {
      return res.status(400).json({
        message: "page_url query parameter is required",
      });
    }

    const clicks = await getPageClicks(page_url);

    return res.status(200).json({
      page_url,
      total_clicks: clicks.length,
      clicks,
    });
  } catch (error) {
    console.error("Fetch heatmap data error:", error.message);

    return res.status(500).json({
      message: "Failed to fetch heatmap data",
    });
  }
};
