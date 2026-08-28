import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaShoppingBag, FaUser, FaBars, FaTimes, FaSearch } from "react-icons/fa";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/products", label: "Shop" },
  { to: "/about", label: "About" },
];

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const { itemsCount } = useCart();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(search.trim() ? `/products?keyword=${encodeURIComponent(search.trim())}` : "/products");
    setOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-paper/95 backdrop-blur border-b border-mist">
      <div className="max-w-7xl mx-auto px-5 md:px-8 h-16 flex items-center justify-between gap-4">
        <Link to="/" className="font-display text-xl tracking-wide text-ink shrink-0">
          AURELIA
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((l) => (
            <Link key={l.to} to={l.to} className="text-sm text-ink/70 hover:text-ink transition-colors">
              {l.label}
            </Link>
          ))}
          {isAdmin && (
            <Link to="/admin" className="text-sm text-brass font-medium hover:text-ink transition-colors">
              Admin
            </Link>
          )}
        </nav>

        <form onSubmit={handleSearch} className="hidden md:flex items-center flex-1 max-w-xs">
          <div className="relative w-full">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/30" size={13} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="w-full bg-white border border-mist rounded-full pl-9 pr-3 py-2 text-sm focus:border-ink outline-none"
            />
          </div>
        </form>

        <div className="flex items-center gap-4">
          <Link to="/cart" className="relative text-ink/80 hover:text-ink" aria-label="View cart">
            <FaShoppingBag size={19} />
            {itemsCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-rose text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {itemsCount}
              </span>
            )}
          </Link>

          {user ? (
            <div className="hidden md:flex items-center gap-3">
              <Link to="/profile" className="text-ink/80 hover:text-ink" aria-label="Your profile">
                <FaUser size={17} />
              </Link>
              <button onClick={logout} className="text-sm text-ink/60 hover:text-ink">
                Sign out
              </button>
            </div>
          ) : (
            <Link to="/login" className="hidden md:block text-sm font-medium text-ink hover:text-brass">
              Sign in
            </Link>
          )}

          <button className="md:hidden text-ink" onClick={() => setOpen(!open)} aria-label="Toggle menu">
            {open ? <FaTimes size={20} /> : <FaBars size={20} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-mist bg-paper px-5 py-4 flex flex-col gap-4">
          <form onSubmit={handleSearch} className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/30" size={13} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="w-full bg-white border border-mist rounded-full pl-9 pr-3 py-2 text-sm outline-none"
            />
          </form>
          {navLinks.map((l) => (
            <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="text-ink/80">
              {l.label}
            </Link>
          ))}
          {isAdmin && (
            <Link to="/admin" onClick={() => setOpen(false)} className="text-brass font-medium">
              Admin
            </Link>
          )}
          {user ? (
            <>
              <Link to="/profile" onClick={() => setOpen(false)} className="text-ink/80">
                Profile
              </Link>
              <button
                onClick={() => {
                  logout();
                  setOpen(false);
                }}
                className="text-left text-ink/60"
              >
                Sign out
              </button>
            </>
          ) : (
            <Link to="/login" onClick={() => setOpen(false)} className="text-ink font-medium">
              Sign in
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
