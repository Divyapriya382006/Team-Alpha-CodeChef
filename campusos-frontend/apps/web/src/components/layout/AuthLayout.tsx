import { Outlet } from "react-router-dom";

const FEATURES = [
  { label: "Clubs", detail: "Browse and run every club on campus in one place." },
  { label: "Events", detail: "Request, approve, and register — without the group chat chaos." },
  { label: "Projects & Blogs", detail: "Ship what your club builds. Publish what it learns." },
];

// Login/Register live here — this is now the app's landing experience, so it gets a full hero
// treatment rather than a bare centered card. The branding panel is hidden below md; mobile just
// sees the form.
export function AuthLayout() {
  return (
    <div className="relative flex min-h-[calc(100vh-65px)] w-full">
      <div className="pointer-events-none absolute inset-0 bg-hero-glow" />

      {/* Branding panel */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden border-r border-slate-800/80 px-12 py-16 md:flex">
        <div>
          <span className="eyebrow">Campus operating system</span>
          <h1 className="mt-4 max-w-md text-4xl font-bold leading-tight tracking-tight text-white">
            Run every club on campus from <span className="gradient-text">one place</span>.
          </h1>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-400">
            Clubs, events, projects, blogs, and approvals — CampusOS replaces the scattered forms
            and group chats with one system everyone actually uses.
          </p>
        </div>

        <ul className="space-y-5">
          {FEATURES.map((f) => (
            <li key={f.label} className="flex items-start gap-3">
              <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-slate-900 font-mono text-[10px] text-brand-400 ring-1 ring-slate-800">
                {"//"}
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-200">{f.label}</p>
                <p className="text-xs text-slate-500">{f.detail}</p>
              </div>
            </li>
          ))}
        </ul>

        <p className="font-mono text-xs text-slate-600">campusos.edu · v1.0</p>
      </div>

      {/* Form panel */}
      <div className="relative flex w-full flex-1 items-center justify-center px-4 py-12 md:w-1/2">
        <div className="w-full max-w-sm animate-fade-in">
          <div className="surface p-7">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
