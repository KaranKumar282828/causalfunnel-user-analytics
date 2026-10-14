
import { NavLink, Outlet } from "react-router-dom";
import {
  Activity,
  LayoutDashboard,
  MousePointer2,
  Users,
  PanelLeft,
} from "lucide-react";

const navigation = [
  {
    name: "Sessions",
    path: "/",
    icon: Users,
  },
  {
    name: "Click Heatmap",
    path: "/heatmap",
    icon: MousePointer2,
  },
];

export default function Navbar() {
  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="flex w-64 shrink-0 flex-col border-r border-slate-200 bg-white">
        <div className="flex h-20 items-center gap-3 border-b border-slate-100 px-6">
          <div className="rounded-xl bg-indigo-600 p-2 text-white">
            <Activity size={23} />
          </div>

          <div>
            <h1 className="text-lg font-bold tracking-tight text-slate-900">
              Funnel<span className="text-indigo-600">Flow</span>
            </h1>
            <p className="text-xs text-slate-500">
              Product Analytics
            </p>
          </div>
        </div>

        <div className="px-4 pt-8">
          <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Workspace
          </p>

          <nav className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === "/"}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition ${
                      isActive
                        ? "bg-indigo-50 text-indigo-700"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`
                  }
                >
                  <Icon size={19} />
                  {item.name}
                </NavLink>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto border-t border-slate-100 p-5">
          <div className="rounded-xl bg-slate-50 p-3">
            <p className="text-sm font-semibold text-slate-800">
              Analytics workspace
            </p>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              Understand how users interact with your product.
            </p>
          </div>
        </div>
      </aside>

      {/* Main content area */}
      <div className="min-w-0 flex-1">
        <header className="flex h-20 items-center justify-between border-b border-slate-200 bg-white px-8">
          <div>
            <p className="text-sm text-slate-500">
              Workspace / Analytics
            </p>
            <h2 className="mt-1 text-lg font-semibold text-slate-900">
              User Analytics
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-slate-500 sm:block">
              Tracking dashboard
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">
              CF
            </div>
          </div>
        </header>

        <main className="p-5 md:p-8">
          {/* Current page renders here */}
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function OutletPlaceholder() {
  return null;
}
