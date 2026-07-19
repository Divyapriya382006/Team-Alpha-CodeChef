import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";

// Single persistent shell for the whole app — Navbar + content. No AdminLayout/FacultyLayout
// variant: role-scoped pages differentiate via DashboardLayout's container, not a separate shell.
export function AppLayout() {
  return (
    <div style={{ backgroundColor: '#F5F0E8', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <main style={{ flex: '1 1 0%' }}>
        <Outlet />
      </main>
    </div>
  );
}
