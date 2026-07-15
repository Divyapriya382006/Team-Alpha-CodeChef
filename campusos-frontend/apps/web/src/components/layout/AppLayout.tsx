import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";

// Single persistent shell for the whole app — Navbar + content. No AdminLayout/FacultyLayout
// variant: role-scoped pages differentiate via DashboardLayout's container, not a separate shell.
export function AppLayout() {
  return (
    <div className="relative flex min-h-screen flex-col bg-slate-950">
      <div className="pointer-events-none fixed inset-0 bg-grid-pattern bg-grid opacity-40 [mask-image:radial-gradient(ellipse_80%_60%_at_50%_-10%,black,transparent)]" />
      <div className="relative z-10 flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
