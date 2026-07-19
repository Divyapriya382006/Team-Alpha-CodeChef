import type { ReactElement } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "../components/layout/AppLayout";
import { AuthLayout } from "../components/layout/AuthLayout";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { PagePlaceholder } from "../components/layout/PagePlaceholder";
import { ProtectedRoute } from "../components/layout/ProtectedRoute";
import { useAuthContext } from "../context/AuthContext";
import { isClubHeadOf, isClubHeadOrSuperAdmin, isFacultyCoordinator, isSuperAdmin } from "../lib/permissions";
import { Login } from "../pages/auth/Login";
import { Register } from "../pages/auth/Register";
import { Home } from "../pages/Home";
import { ClubDetail } from "../pages/clubs/ClubDetail";
import { ClubManage } from "../pages/clubs/ClubManage";
import { SubmitClubRequest } from "../pages/clubs/SubmitClubRequest";
import { EventDirectory } from "../pages/events/EventDirectory";
import { EventDetail } from "../pages/events/EventDetail";
import { EventForm } from "../pages/events/EventForm";
import { ApprovalQueue } from "../pages/faculty/ApprovalQueue";
import { Dashboard as AdminDashboard } from "../pages/admin/Dashboard";
import { UserManagement } from "../pages/admin/UserManagement";
import { ClubRequestQueue } from "../pages/admin/ClubRequestQueue";
import { Analytics } from "../pages/admin/Analytics";
import { ProjectDirectory } from "../pages/projects/ProjectDirectory";
import { ProjectDetail } from "../pages/projects/ProjectDetail";
import { ProjectForm } from "../pages/projects/ProjectForm";
import { BlogDirectory } from "../pages/blogs/BlogDirectory";
import { BlogDetail } from "../pages/blogs/BlogDetail";
import { BlogForm } from "../pages/blogs/BlogForm";
import { Profile } from "../pages/Profile";
import { DepartmentManage } from "../pages/clubs/DepartmentManage";
import { AnnouncementFeed } from "../pages/announcements/AnnouncementFeed";
import { CreateAnnouncement } from "../pages/announcements/CreateAnnouncement";
import { Leaderboard } from "../pages/leaderboard/Leaderboard";
import { Gallery } from "../pages/gallery/Gallery";
import { GoogleAuthSuccess } from "../pages/auth/GoogleAuthSuccess";

function RedirectIfAuthenticated({ children }: { children: ReactElement }) {
  const { user } = useAuthContext();
  return user ? <Navigate to="/" replace /> : children;
}

// FINAL_TEAM_BUILD_GUIDE.md documents Home ("/") as publicly browsable with no login wall. This
// gates it behind auth per an explicit product request ("landing page should be the login page")
// — every other public page (club/event/project/blog detail, directories) is untouched and still
// reachable without an account, only the bare "/" now requires being logged in.
function RequireAuthForHome({ children }: { children: ReactElement }) {
  const { user, isLoading } = useAuthContext();
  if (isLoading) return null;
  return user ? children : <Navigate to="/login" replace />;
}

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        {/* --- Public: auth --- */}
        <Route element={<AuthLayout />}>
          <Route
            path="/login"
            element={
              <RedirectIfAuthenticated>
                <Login />
              </RedirectIfAuthenticated>
            }
          />
          <Route
            path="/register"
            element={
              <RedirectIfAuthenticated>
                <Register />
              </RedirectIfAuthenticated>
            }
          />
          <Route path="/auth/google/success" element={<GoogleAuthSuccess />} />
        </Route>

        {/* --- Public: directories & detail pages --- */}
        <Route
          index
          element={
            <RequireAuthForHome>
              <Home />
            </RequireAuthForHome>
          }
        />
        <Route path="/clubs/:id" element={<ClubDetail />} />
        <Route path="/events" element={<EventDirectory />} />
        <Route path="/events/:id" element={<EventDetail />} />
        <Route path="/projects" element={<ProjectDirectory />} />
        <Route path="/projects/:id" element={<ProjectDetail />} />
        <Route path="/blogs" element={<BlogDirectory />} />
        <Route path="/blogs/:id" element={<BlogDetail />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/gallery" element={<Gallery />} />

        {/* --- Any authenticated user --- */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/profile" element={<Profile />} />
            <Route path="/club-requests/new" element={<SubmitClubRequest />} />
            <Route path="/announcements" element={<AnnouncementFeed />} />
            {/* Access here is Super Admin (GLOBAL) / Club Head (CLUB) / Department Head (DEPARTMENT) —
                which one applies depends on the visibility the user picks in the form, not the route
                itself, so gating stays at "authenticated" and the visibility selector filters options. */}
            <Route path="/announcements/new" element={<CreateAnnouncement />} />
          </Route>
        </Route>

        {/* --- Club Head (own club) or Super Admin --- */}
        <Route element={<ProtectedRoute predicate={(user, params) => isClubHeadOrSuperAdmin(user, params.id)} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/clubs/:id/manage" element={<ClubManage />} />
          </Route>
        </Route>

        {/* --- Club Head only (own club) — no Super Admin per FINAL_API_CONTRACT.md Events Module --- */}
        <Route element={<ProtectedRoute predicate={(user, params) => isClubHeadOf(user, params.id)} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/clubs/:id/manage/events/new" element={<EventForm />} />
            <Route path="/clubs/:id/manage/events/:eventId/edit" element={<EventForm />} />
          </Route>
        </Route>

        {/* --- Club Head or Department Head — only the Club Head half is checkable here. Department
            Head can't be resolved from CurrentUser (see lib/permissions.ts), so these stay gated at
            "authenticated" and the page itself must confirm Club Head OR Department Head once its own
            GET /departments/:id resolves, redirecting if neither holds. --- */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/clubs/:id/manage/projects/new" element={<ProjectForm />} />
            {/* Edit permission is "creator, or this club's Club Head" per FINAL_API_CONTRACT.md —
                neither half is fully checkable from the route alone (creator requires the project
                to be fetched first), so this stays at "authenticated" like the create route above;
                ProjectDetail only shows the Edit link when the caller actually qualifies. */}
            <Route path="/clubs/:id/manage/projects/:projectId/edit" element={<ProjectForm />} />
            <Route path="/clubs/:id/manage/blogs/new" element={<BlogForm />} />
            <Route path="/clubs/:id/manage/departments/:deptId" element={<DepartmentManage />} />
          </Route>
        </Route>

        {/* --- Faculty Coordinator --- */}
        <Route element={<ProtectedRoute predicate={(user) => isFacultyCoordinator(user)} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/faculty/events" element={<ApprovalQueue />} />
          </Route>
        </Route>

        {/* --- Super Admin --- */}
        <Route element={<ProtectedRoute predicate={(user) => isSuperAdmin(user)} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/club-requests" element={<ClubRequestQueue />} />
            <Route path="/admin/users" element={<UserManagement />} />
            <Route path="/admin/analytics" element={<Analytics />} />
          </Route>
        </Route>

        <Route path="*" element={<PagePlaceholder title="Not Found" description="No route matches this URL." />} />
      </Route>
    </Routes>
  );
}
