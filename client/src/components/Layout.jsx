import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navClass = ({ isActive }) =>
  [
    'px-3 py-2 rounded-lg text-sm font-semibold transition hover:bg-white/10',
    isActive ? 'bg-white/10 text-white' : 'text-white/70',
  ].join(' ');

export default function Layout({ children }) {
  const { user, guest, logout } = useAuth();

  return (
    <div className="min-h-screen text-white">
      <header className="sticky top-0 z-20 border-b border-white/5 bg-black/60 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2 font-display text-xl font-semibold">
            <span className="h-3 w-3 rounded-full bg-brand-500" />
            Seckick
          </Link>
          <nav className="flex items-center gap-2">
            <NavLink className={navClass} to="/follows">
              Takipler
            </NavLink>
            <NavLink className={navClass} to="/player">
              Oynatıcı
            </NavLink>
          </nav>
          <div className="flex items-center gap-3 text-sm">
            {guest && <span className="pill bg-amber-400/15 text-amber-200">Anonim mod</span>}
            {user ? (
              <>
                <span className="hidden text-white/70 sm:inline">{user.email}</span>
                <button
                  className="rounded-lg bg-white/10 px-3 py-1 text-xs font-semibold text-white hover:bg-white/20"
                  onClick={logout}
                >
                  Çıkış
                </button>
              </>
            ) : (
              <span className="text-white/60">Giriş yapılmadı</span>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-10">{children}</main>
    </div>
  );
}
