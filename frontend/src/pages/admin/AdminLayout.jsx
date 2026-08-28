import { NavLink, Outlet } from "react-router-dom";
import { FaTachometerAlt, FaBoxOpen, FaClipboardList, FaUsers, FaTags, FaArrowLeft } from "react-icons/fa";

const links = [
  { to: "/admin", label: "Dashboard", icon: FaTachometerAlt, end: true },
  { to: "/admin/products", label: "Products", icon: FaBoxOpen },
  { to: "/admin/categories", label: "Categories", icon: FaTags },
  { to: "/admin/orders", label: "Orders", icon: FaClipboardList },
  { to: "/admin/users", label: "Users", icon: FaUsers },
];

export default function AdminLayout() {
  return (
    <div className="max-w-7xl mx-auto px-5 md:px-8 py-8 grid md:grid-cols-[220px_1fr] gap-8">
      <aside className="md:sticky md:top-24 h-fit">
        <nav className="bg-white border border-mist rounded-lg p-3 space-y-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors ${
                  isActive ? "bg-ink text-paper" : "text-ink/70 hover:bg-mist"
                }`
              }
            >
              <l.icon size={14} /> {l.label}
            </NavLink>
          ))}
        </nav>
        <a href="/" className="flex items-center gap-2 text-xs text-ink/50 hover:text-ink mt-4 px-1">
          <FaArrowLeft size={11} /> Back to store
        </a>
      </aside>
      <div className="min-w-0">
        <Outlet />
      </div>
    </div>
  );
}
