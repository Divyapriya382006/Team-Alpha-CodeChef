import { Outlet } from "react-router-dom";

// Structural container for authenticated/management pages (profile, manage*, faculty, admin,
// announcements). Purely layout — page titles and breadcrumbs are owned by the pages themselves.
export function DashboardLayout() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 animate-fade-in">
      <Outlet />
    </div>
  );
}
