
import { useEffect, useState } from "react";
import {
  Users,
  Activity,
  Clock,
  MousePointer2,
  Eye,
  RefreshCw,
  AlertCircle,
  ArrowRight,
} from "lucide-react";

const API_URL = `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api`;

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getEventIcon(type) {
  return type === "click" ? MousePointer2 : Eye;
}

export default function Sessions() {
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [error, setError] = useState("");

  async function fetchSessions() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/sessions`);

      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
      }

      const data = await response.json();
      const sessionList = Array.isArray(data)
        ? data
        : data.sessions ?? [];

      setSessions(sessionList);

      // Keep the currently selected session if it still exists.
      setSelectedSession((current) => {
        if (!current) return null;

        return (
          sessionList.find(
            (session) => session.session_id === current.session_id
          ) ?? null
        );
      });
    } catch (err) {
      setError(
        "Could not load sessions. Make sure the backend and MongoDB are running."
      );
      console.error("Sessions API error:", err);
    } finally {
      setLoading(false);
    }
  }

  async function openSession(session) {
    setSelectedSession(session);
    setEvents([]);
    setEventsLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/sessions/${encodeURIComponent(session.session_id)}/events`
      );

      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
      }

      const data = await response.json();
      setEvents(Array.isArray(data) ? data : data.events ?? []);
    } catch (err) {
      console.error("Session events API error:", err);
      setEvents([]);
    } finally {
      setEventsLoading(false);
    }
  }

  useEffect(() => {
    fetchSessions();
  }, []);

  const totalEvents = sessions.reduce(
    (sum, session) => sum + (session.total_events || 0),
    0
  );

  const latestActivity = sessions.length
    ? formatDate(sessions[0].last_event)
    : "—";

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-medium text-indigo-600">Overview</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            Sessions
          </h1>
          <p className="mt-2 text-slate-500">
            Explore visitor sessions and understand user journeys.
          </p>
        </div>

        <button
          onClick={fetchSessions}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-60"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle size={20} className="mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold">Unable to fetch data</p>
            <p className="mt-1">{error}</p>
            <button
              onClick={fetchSessions}
              className="mt-2 font-semibold underline"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          title="Total Sessions"
          value={loading ? "…" : sessions.length}
          icon={Users}
          color="indigo"
        />
        <StatCard
          title="Events Recorded"
          value={loading ? "…" : totalEvents}
          icon={Activity}
          color="violet"
        />
        <StatCard
          title="Latest Activity"
          value={loading ? "…" : latestActivity}
          icon={Clock}
          color="emerald"
          compact
        />
      </div>

      <div className="grid items-start gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div>
              <h2 className="font-semibold text-slate-900">Visitor sessions</h2>
              <p className="mt-1 text-sm text-slate-500">
                Select a session to inspect its journey.
              </p>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              {sessions.length} sessions
            </span>
          </div>

          {loading ? (
            <div className="p-8 text-center text-sm text-slate-500">
              Loading sessions…
            </div>
          ) : sessions.length === 0 ? (
            <div className="p-8 text-center">
              <Users className="mx-auto text-slate-300" size={32} />
              <p className="mt-3 font-medium text-slate-700">
                No sessions yet
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Open the demo page and interact with it to generate events.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {sessions.map((session) => {
                const isSelected =
                  selectedSession?.session_id === session.session_id;

                return (
                  <button
                    key={session.session_id}
                    onClick={() => openSession(session)}
                    className={`w-full p-5 text-left transition hover:bg-slate-50 ${
                      isSelected ? "bg-indigo-50/70" : "bg-white"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-mono text-sm font-semibold text-slate-800">
                          {session.session_id}
                        </p>
                        <p className="mt-2 text-xs text-slate-500">
                          Last activity: {formatDate(session.last_event)}
                        </p>
                      </div>
                      <ArrowRight
                        size={18}
                        className={`mt-1 shrink-0 ${
                          isSelected ? "text-indigo-600" : "text-slate-300"
                        }`}
                      />
                    </div>
                    <div className="mt-4 flex items-center gap-2">
                      <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                        {session.total_events} events
                      </span>
                      <span className="text-xs text-slate-400">
                        First seen {formatDate(session.first_event)}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        <section className="min-w-0 rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="font-semibold text-slate-900">Session journey</h2>
            <p className="mt-1 text-sm text-slate-500">
              Events in chronological order.
            </p>
          </div>

          {!selectedSession ? (
            <div className="p-8 text-center">
              <Activity className="mx-auto text-slate-300" size={32} />
              <p className="mt-3 font-medium text-slate-700">
                Select a visitor session
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Its page views and clicks will appear here.
              </p>
            </div>
          ) : eventsLoading ? (
            <div className="p-8 text-center text-sm text-slate-500">
              Loading session events…
            </div>
          ) : events.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500">
              No events found for this session, or the request failed.
            </div>
          ) : (
            <div className="p-5">
              <p className="mb-5 break-all font-mono text-xs text-slate-500">
                {selectedSession.session_id}
              </p>

              <div className="space-y-0">
                {events.map((event, index) => {
                  const Icon = getEventIcon(event.event_type);

                  return (
                    <div key={event._id || `${event.timestamp}-${index}`} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                          <Icon size={17} />
                        </div>
                        {index < events.length - 1 && (
                          <div className="my-1 min-h-6 w-px flex-1 bg-slate-200" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1 pb-6">
                        <p className="text-sm font-semibold capitalize text-slate-800">
                          {String(event.event_type || "event").replace("_", " ")}
                        </p>
                        <p className="mt-1 break-all text-xs leading-5 text-slate-500">
                          {event.page_url}
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                          {formatDate(event.timestamp)}
                        </p>
                        {event.event_type === "click" && (
                          <p className="mt-2 inline-block rounded-md bg-violet-50 px-2 py-1 text-xs text-violet-700">
                            Position: ({event.x}, {event.y})
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color, compact = false }) {
  const colors = {
    indigo: "bg-indigo-50 text-indigo-600",
    violet: "bg-violet-50 text-violet-600",
    emerald: "bg-emerald-50 text-emerald-600",
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <div className={`rounded-xl p-2.5 ${colors[color]}`}>
          <Icon size={20} />
        </div>
      </div>
      <p className={`mt-4 font-bold tracking-tight text-slate-900 ${
        compact ? "text-sm leading-6" : "text-3xl"
      }`}>
        {value}
      </p>
    </div>
  );
}
