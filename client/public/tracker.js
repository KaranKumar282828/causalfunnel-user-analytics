
(function () {
  const API_URL = document.currentScript?.dataset.apiUrl || "http://localhost:5000/api/events";
  const SESSION_KEY = "causal_funnel_session_id";

  // Reuse the session ID for this browser.
  let sessionId = localStorage.getItem(SESSION_KEY);

  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem(SESSION_KEY, sessionId);
  }

  // Send an event to our backend.
  function trackEvent(eventType, coordinates = {}) {
    const eventData = {
      session_id: sessionId,
      event_type: eventType,
      page_url: window.location.href,
      timestamp: new Date().toISOString(),
      ...coordinates,
    };

    fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(eventData),
    }).catch((error) => {
      console.error("Analytics tracking failed:", error);
    });
  }

  // Common browser dimensions and scroll position.
  function getPageMetrics() {
    return {
      viewport_width: window.innerWidth,
      viewport_height: window.innerHeight,
      scroll_x: window.scrollX,
      scroll_y: window.scrollY,
      document_width: document.documentElement.scrollWidth,
      document_height: document.documentElement.scrollHeight,
    };
  }

  // Track the initial page view.
  trackEvent("page_view", getPageMetrics());

  // Track clicks using both viewport and document coordinates.
  document.addEventListener("click", function (event) {
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;

    trackEvent("click", {
      // Coordinates relative to the visible viewport.
      x: event.clientX,
      y: event.clientY,

      // Coordinates relative to the entire document.
      document_x: event.clientX + scrollX,
      document_y: event.clientY + scrollY,

      ...getPageMetrics(),
    });
  });
})();