import { Link, NavLink } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';

const linkBase = 'px-3 py-2 rounded-md text-sm font-medium transition-colors';

export default function Navbar() {
  const { items } = useWishlist();
  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-ink/80 backdrop-blur">
      <nav className="mx-auto flex max-w-8xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2 text-lg font-bold">
         <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500 text-sm font-black text-white shadow-lg shadow-red-500/20 transition-transform duration-200 group-hover:scale-105">
            M
          </span> MovieScope
        </Link>
        <div className="flex items-center gap-1">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `${linkBase} ${isActive ? 'bg-white/10 text-white' : 'text-slate-300 hover:bg-white/5'}`
            }
          >
            Discover
          </NavLink>
          <NavLink
            to="/search"
            className={({ isActive }) =>
              `${linkBase} ${isActive ? 'bg-white/10 text-white' : 'text-slate-300 hover:bg-white/5'}`
            }
          >
            Search
          </NavLink>
          <NavLink
            to="/wishlist"
            className={({ isActive }) =>
              `${linkBase} ${isActive ? 'bg-white/10 text-white' : 'text-slate-300 hover:bg-white/5'}`
            }
          >
            Wishlist
            {items.length > 0 && (
              <span className="ml-1.5 rounded-full bg-red-500 px-1.5 py-0.5 text-xs font-semibold text-white">
                {items.length}
              </span>
            )}
          </NavLink>
        </div>
      </nav>
    </header>
  );
}
