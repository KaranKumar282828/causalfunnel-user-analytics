
import { useEffect, useMemo, useRef, useState } from "react";
import {
  MousePointer2,
  RefreshCw,
  AlertCircle,
  Globe,
  Activity,
  Info,
  ExternalLink,
} from "lucide-react";

const API_URL = `${
  (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/+$/, "")
}/api`;

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function Heatmap() {
  const [pageUrls, setPageUrls] = useState([]);
  const [selectedUrl, setSelectedUrl] = useState("");
  const [clicks, setClicks] = useState([]);
  const [loadingPages, setLoadingPages] = useState(true);
  const [loadingClicks, setLoadingClicks] = useState(false);
  const [error, setError] = useState("");
  const [previewError, setPreviewError] = useState(false);
  const [previewWidth, setPreviewWidth] = useState(0);

  const previewRef = useRef(null);

  // Track the available width of the preview.
  useEffect(() => {
    const element = previewRef.current;
    if (!element) return;

    const observer = new ResizeObserver((entries) => {
      setPreviewWidth(entries[0].contentRect.width);
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  // Discover tracked page URLs.
  useEffect(() => {
    let cancelled = false;

    async function loadPages() {
      setLoadingPages(true);
      setError("");

      try {
        const response = await fetch(`${API_URL}/sessions`);
        if (!response.ok) throw new Error("Could not load sessions.");

        const sessionsData = await response.json();
        const sessions = Array.isArray(sessionsData)
          ? sessionsData
          : sessionsData.sessions ?? [];

        const eventResponses = await Promise.all(
          sessions.map(async (session) => {
            try {
              const response = await fetch(
                `${API_URL}/sessions/${encodeURIComponent(
                  session.session_id
                )}/events`
              );

              if (!response.ok) return [];

              const data = await response.json();
              return Array.isArray(data) ? data : data.events ?? [];
            } catch {
              return [];
            }
          })
        );

        const uniqueUrls = [
          ...new Set(
            eventResponses
              .flat()
              .map((event) => event.page_url)
              .filter(Boolean)
          ),
        ].sort();

        if (!cancelled) {
          setPageUrls(uniqueUrls);
          setSelectedUrl((current) =>
            uniqueUrls.includes(current) ? current : uniqueUrls[0] ?? ""
          );
        }
      } catch (err) {
        console.error("Page discovery error:", err);
        if (!cancelled) {
          setError(
            "Could not load page URLs. Check that the backend and MongoDB are running."
          );
        }
      } finally {
        if (!cancelled) setLoadingPages(false);
      }
    }

    loadPages();
    return () => {
      cancelled = true;
    };
  }, []);

  // Load click data for the selected page.
  useEffect(() => {
    let cancelled = false;

    async function loadClicks() {
      if (!selectedUrl) {
        setClicks([]);
        setLoadingClicks(false);
        return;
      }

      setLoadingClicks(true);
      setError("");

      try {
        const response = await fetch(
          `${API_URL}/heatmap?page_url=${encodeURIComponent(selectedUrl)}`
        );

        if (!response.ok) throw new Error("Could not load click data.");

        const data = await response.json();

        if (!cancelled) {
          setClicks(Array.isArray(data.clicks) ? data.clicks : []);
        }
      } catch (err) {
        console.error("Heatmap API error:", err);
        if (!cancelled) {
          setClicks([]);
          setError("Could not load click activity. Please refresh.");
        }
      } finally {
        if (!cancelled) setLoadingClicks(false);
      }
    }

    loadClicks();
    return () => {
      cancelled = true;
    };
  }, [selectedUrl]);

  // Validate click coordinates.
  const validClicks = useMemo(
    () =>
      clicks.filter((click) => {
        const x = Number(click.x);
        const y = Number(click.y);

        return (
          click.x !== null &&
          click.x !== undefined &&
          click.y !== null &&
          click.y !== undefined &&
          Number.isFinite(x) &&
          Number.isFinite(y) &&
          x >= 0 &&
          y >= 0
        );
      }),
    [clicks]
  );

  // Use the latest click with viewport dimensions as the reference.
  // This keeps the preview layout close to the dimensions in which
  // the user originally interacted with the page.
  const referenceClick = useMemo(() => {
    return [...validClicks].reverse().find((click) => {
      return (
        Number(click.viewport_width) > 0 &&
        Number(click.viewport_height) > 0
      );
    });
  }, [validClicks]);

  const referenceWidth = Number(referenceClick?.viewport_width) || 830;
  const referenceHeight = Number(referenceClick?.viewport_height) || 690;

  // Use recorded document dimensions when available.
  const documentWidth =
    Number(referenceClick?.document_width) > 0
      ? Number(referenceClick.document_width)
      : referenceWidth;

  const documentHeight = Math.max(
    referenceHeight,
    ...validClicks.map((click) => {
      const docY = Number(click.document_y);
      const scrollY = Number(click.scroll_y) || 0;
      const y = Number(click.y);

      if (Number.isFinite(docY) && docY >= 0) return docY + 1;
      return Number.isFinite(y) ? y + scrollY + 1 : 0;
    }),
    ...clicks.map((click) => Number(click.document_height) || 0)
  );

  // Scale the original document to fit the preview width.
  const scale =
    previewWidth > 0
      ? Math.min(1, previewWidth / documentWidth)
      : 1;

  const canvasWidth = documentWidth * scale;
  const canvasHeight = documentHeight * scale;

  function getMarkerPosition(click) {
    const x = Number.isFinite(Number(click.document_x))
      ? Number(click.document_x)
      : Number(click.x) + (Number(click.scroll_x) || 0);

    const y = Number.isFinite(Number(click.document_y))
      ? Number(click.document_y)
      : Number(click.y) + (Number(click.scroll_y) || 0);

    // Old events may not contain scroll fields.
    return {
      x: x * scale,
      y: y * scale,
    };
  }

  function refreshPages() {
    window.location.reload();
  }

  function openSelectedPage() {
    if (selectedUrl) {
      window.open(selectedUrl, "_blank", "noopener,noreferrer");
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-medium text-indigo-600">
            User interaction
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            Click Heatmap
          </h1>
          <p className="mt-2 text-slate-500">
            Explore where visitors click on each tracked page.
          </p>
        </div>

        <button
          onClick={refreshPages}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          <RefreshCw size={16} />
          Refresh data
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle size={20} className="mt-0.5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
        <label
          htmlFor="page-url"
          className="mb-2 block text-sm font-semibold text-slate-700"
        >
          Select a tracked page
        </label>

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative min-w-0 flex-1">
            <Globe
              size={18}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <select
              id="page-url"
              value={selectedUrl}
              onChange={(event) => {
                setSelectedUrl(event.target.value);
                setPreviewError(false);
              }}
              disabled={loadingPages || pageUrls.length === 0}
              className="w-full appearance-none rounded-lg border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-700 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-50"
            >
              {loadingPages ? (
                <option value="">Discovering pages…</option>
              ) : pageUrls.length === 0 ? (
                <option value="">No tracked pages found</option>
              ) : (
                pageUrls.map((url) => (
                  <option key={url} value={url}>
                    {url}
                  </option>
                ))
              )}
            </select>
          </div>

          <button
            onClick={openSelectedPage}
            disabled={!selectedUrl}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
          >
            <ExternalLink size={16} />
            Open page
          </button>
        </div>

        <p className="mt-2 break-all text-xs text-slate-400">
          {selectedUrl || "Page URLs are discovered from recorded events."}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">
              Total recorded clicks
            </p>
            <div className="rounded-xl bg-violet-50 p-2.5 text-violet-600">
              <MousePointer2 size={20} />
            </div>
          </div>
          <p className="mt-4 text-3xl font-bold text-slate-900">
            {loadingClicks ? "…" : clicks.length}
          </p>
          <p className="mt-1 text-xs text-slate-400">For the selected page</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">
              Valid clicks
            </p>
            <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600">
              <Activity size={20} />
            </div>
          </div>
          <p className="mt-4 text-3xl font-bold text-slate-900">
            {loadingClicks ? "…" : validClicks.length}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Events with usable click coordinates
          </p>
        </div>
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-2 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-semibold text-slate-900">
              Click distribution
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Scroll inside the preview to inspect clicks further down the page.
            </p>
          </div>
          <span className="w-fit rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">
            {validClicks.length} markers
          </span>
        </div>

        <div className="p-4 md:p-6">
          {loadingPages || loadingClicks ? (
            <div className="flex min-h-64 items-center justify-center gap-2 text-sm text-slate-500">
              <RefreshCw size={17} className="animate-spin" />
              Loading click activity…
            </div>
          ) : !selectedUrl ? (
            <div className="flex min-h-64 flex-col items-center justify-center text-center">
              <Globe size={34} className="text-slate-300" />
              <p className="mt-3 font-semibold text-slate-700">
                No tracked pages yet
              </p>
              <p className="mt-1 max-w-sm text-sm text-slate-500">
                Open demo.html, interact with the page, and refresh this view.
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-hidden rounded-xl border border-slate-200">
                <div className="flex h-10 items-center gap-2 border-b border-slate-200 bg-white px-3">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-300" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
                  <span className="ml-2 truncate text-xs text-slate-400">
                    {selectedUrl}
                  </span>
                </div>

                <div
                  ref={previewRef}
                  className="relative max-h-162.5 overflow-auto bg-slate-100"
                >
                  <div
                    className="relative"
                    style={{
                      width: `${canvasWidth}px`,
                      height: `${canvasHeight}px`,
                      minWidth: "100%",
                    }}
                  >
                    {!previewError ? (
                      <iframe
                        key={`${selectedUrl}-${referenceWidth}-${documentHeight}`}
                        src={selectedUrl}
                        title="Tracked page preview"
                        sandbox="allow-same-origin"
                        onError={() => setPreviewError(true)}
                        className="absolute left-0 top-0 border-0 bg-white"
                        style={{
                          width: `${referenceWidth}px`,
                          height: `${documentHeight}px`,
                          transform: `scale(${scale})`,
                          transformOrigin: "top left",
                          pointerEvents: "none",
                        }}
                      />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                        <AlertCircle size={32} className="text-amber-500" />
                        <p className="mt-3 font-semibold text-slate-700">
                          Preview could not be loaded
                        </p>
                        <p className="mt-1 max-w-md text-sm text-slate-500">
                          This website may block iframe previews. Use Open page
                          to view it separately.
                        </p>
                      </div>
                    )}

                    <div className="pointer-events-none absolute inset-0">
                      {validClicks.map((click, index) => {
                        const position = getMarkerPosition(click);

                        // Ignore markers outside the rendered document.
                        if (
                          position.x < 0 ||
                          position.y < 0 ||
                          position.x > canvasWidth ||
                          position.y > canvasHeight
                        ) {
                          return null;
                        }

                        return (
                          <div
                            key={click._id || `${click.timestamp}-${index}`}
                            title={`Click ${index + 1}: (${click.x}, ${click.y}) | Scroll: (${click.scroll_x ?? 0}, ${click.scroll_y ?? 0}) | ${formatDate(click.timestamp)}`}
                            className="absolute z-10 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-rose-500/80 shadow-[0_0_0_5px_rgba(244,63,94,0.18)]"
                            style={{
                              left: `${position.x}px`,
                              top: `${position.y}px`,
                            }}
                          />
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {validClicks.length === 0 && (
                <p className="mt-3 text-sm text-amber-700">
                  No valid click coordinates are available. Generate new clicks
                  on the tracked page and refresh.
                </p>
              )}
            </>
          )}

          <div className="mt-4 flex items-start gap-2 text-xs text-slate-500">
            <Info size={15} className="mt-0.5 shrink-0" />
            <span>
              New events use document coordinates so scrolling is accounted
              for. Older events fall back to viewport coordinates. Alignment
              can still differ if the page layout changes between the original
              visit and this preview.
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
