import { Link, NavLink, Outlet, useNavigate } from "react-router";
import { useAuth } from "../auth/AuthContext";

const navClass = ({ isActive }: { isActive: boolean }) =>
  `py-1 text-sm whitespace-nowrap border-b-2 ${isActive ? "border-ink font-semibold" : "border-transparent text-muted hover:text-ink"}`;

export function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-ink">
        <div className="mx-auto max-w-5xl px-4 py-3 flex flex-wrap items-center gap-x-8 gap-y-2">
          <Link to="/" className="font-mono font-medium text-lg bg-tag px-2 leading-8">JINF</Link>

          <nav className="order-last w-full sm:order-none sm:w-auto flex gap-5">
            <NavLink to="/" end className={navClass}>Items</NavLink>
            {user && <NavLink to="/report" className={navClass}>Report</NavLink>}
            {user && <NavLink to="/mine" className={navClass}>My items</NavLink>}
            {user?.role === "Admin" && <NavLink to="/admin" className={navClass}>Reception</NavLink>}
          </nav>

          <div className="ml-auto flex items-center gap-4 text-sm">
            {user ? (
              <>
                <span className="hidden md:inline text-muted">{user.fullName}</span>
                <button className="link" onClick={() => { logout(); navigate("/"); }}>Log out</button>
              </>
            ) : (
              <Link to="/login" className="link">Log in</Link>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 mx-auto w-full max-w-5xl px-4 py-8">
        <Outlet />
      </main>

      <footer className="mx-auto w-full max-w-5xl px-4 py-6 text-xs text-muted">
        Found something? Hand it in at reception. Unclaimed items are kept for 90 days.
      </footer>
    </div>
  );
}
