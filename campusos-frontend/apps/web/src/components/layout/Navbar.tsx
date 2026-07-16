import { Link, useNavigate } from "react-router-dom";
import { useAuthContext } from "../../context/AuthContext";
import { isFacultyCoordinator, isSuperAdmin } from "../../lib/permissions";

const navLinkClass = "text-sm font-medium text-slate-400 transition hover:text-white";

export function Navbar() {
  const { user, logout } = useAuthContext();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <nav className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3.5">
        <Link to="/" className="flex items-center gap-2 text-lg font-bold tracking-tight text-white">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-brand-500 to-cyan-400 text-white shadow-glow">
            <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M12 3L2 8l10 5 8-4.2V15h1.5V8L12 3z"
                fill="currentColor"
              />
              <path
                d="M6 11.5V16c0 1.5 2.7 3.5 6 3.5s6-2 6-3.5v-4.5l-6 3-6-3z"
                fill="currentColor"
                opacity="0.75"
              />
            </svg>
          </span>
          <span>
            Campus<span className="gradient-text">OS</span>
          </span>
        </Link>
        <div className="flex flex-wrap items-center gap-5">
          <Link to="/events" className={navLinkClass}>
            Events
          </Link>
          <Link to="/projects" className={navLinkClass}>
            Projects
          </Link>
          <Link to="/blogs" className={navLinkClass}>
            Blogs
          </Link>
          <Link to="/leaderboard" className={navLinkClass}>
            Leaderboard
          </Link>
          {user && (
            <Link to="/announcements" className={navLinkClass}>
              Announcements
            </Link>
          )}
          {isFacultyCoordinator(user) && (
            <Link to="/faculty/events" className={navLinkClass}>
              Approval Queue
            </Link>
          )}
          {isSuperAdmin(user) && (
            <Link to="/admin" className={navLinkClass}>
              Admin
            </Link>
          )}
          {isSuperAdmin(user) && (
            <Link to="/admin/club-requests" className={navLinkClass}>
              Club Requests
            </Link>
          )}
          {isSuperAdmin(user) && (
            <Link to="/admin/users" className={navLinkClass}>
              Users
            </Link>
          )}

          <div className="ml-1 flex items-center gap-3 border-l border-slate-800 pl-4">
            {user ? (
              <>
                <Link to="/profile" className="text-sm font-medium text-slate-200 hover:text-white">
                  {user.name}
                </Link>
                <button type="button" onClick={handleLogout} className="btn-secondary !px-3 !py-1.5 text-xs">
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className={navLinkClass}>
                  Log in
                </Link>
                <Link to="/register" className="btn-primary !px-3 !py-1.5 text-xs">
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
