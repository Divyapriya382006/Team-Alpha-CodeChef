import * as React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuthContext } from "../../context/AuthContext";
import { isFacultyCoordinator, isSuperAdmin } from "../../lib/permissions";

interface NavLinkProps {
  to: string;
  children: React.ReactNode;
  isActive: boolean;
}

function NavLink({ to, children, isActive }: NavLinkProps) {
  return (
    <Link
      to={to}
      style={{
        fontFamily: 'DM Sans, sans-serif',
        fontWeight: 600,
        fontSize: 12,
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
        color: '#0A0A0A',
        textDecoration: isActive ? 'underline' : 'none',
        textDecorationColor: '#C8F135',
        textUnderlineOffset: '4px',
        textDecorationThickness: '2px',
        padding: '6px 10px',
        transition: 'background-color 80ms ease-out',
        display: 'inline-block',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = '#C8F135';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent';
      }}
    >
      {children}
    </Link>
  );
}

export function Navbar() {
  const { user, logout } = useAuthContext();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  const isLinkActive = (path: string) => {
    return pathname === path || (path !== "/" && pathname.startsWith(path));
  };

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 40,
      backgroundColor: '#F5F0E8',
      borderBottom: '2px solid #0A0A0A',
    }}>
      <nav className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link
          to="/"
          style={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontWeight: 800,
            fontSize: 20,
            color: '#0A0A0A',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <span style={{
            width: 22,
            height: 22,
            backgroundColor: '#C8F135',
            border: '2px solid #0A0A0A',
            display: 'inline-block',
            flexShrink: 0,
          }} />
          <span>CampusOS</span>
        </Link>
        <div className="flex flex-wrap items-center gap-1 sm:gap-2">
          <NavLink to="/events" isActive={isLinkActive("/events")}>
            Events
          </NavLink>
          <NavLink to="/projects" isActive={isLinkActive("/projects")}>
            Projects
          </NavLink>
          <NavLink to="/blogs" isActive={isLinkActive("/blogs")}>
            Blogs
          </NavLink>
          <NavLink to="/leaderboard" isActive={isLinkActive("/leaderboard")}>
            Leaderboard
          </NavLink>
          <NavLink to="/gallery" isActive={isLinkActive("/gallery")}>
            Gallery
          </NavLink>
          {user && (
            <NavLink to="/announcements" isActive={isLinkActive("/announcements")}>
              Announcements
            </NavLink>
          )}
          {isFacultyCoordinator(user) && (
            <NavLink to="/faculty/events" isActive={isLinkActive("/faculty/events")}>
              Approval Queue
            </NavLink>
          )}
          {isSuperAdmin(user) && (
            <NavLink to="/admin" isActive={isLinkActive("/admin")}>
              Admin
            </NavLink>
          )}
          {isSuperAdmin(user) && (
            <NavLink to="/admin/club-requests" isActive={isLinkActive("/admin/club-requests")}>
              Club Requests
            </NavLink>
          )}
          {isSuperAdmin(user) && (
            <NavLink to="/admin/users" isActive={isLinkActive("/admin/users")}>
              Users
            </NavLink>
          )}

          <div className="ml-1 flex items-center gap-3 border-l-2 border-ink pl-4">
            {user ? (
              <>
                <NavLink to="/profile" isActive={isLinkActive("/profile")}>
                  {user.name}
                </NavLink>
                <button type="button" onClick={handleLogout} className="btn-secondary btn !px-2.5 !py-1 text-[10px]">
                  Log out
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login" isActive={isLinkActive("/login")}>
                  Log in
                </NavLink>
                <Link to="/register" className="btn-primary btn !px-2.5 !py-1 text-[10px]">
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
