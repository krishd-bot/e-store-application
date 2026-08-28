import { Link } from "react-router-dom";
import { FaInstagram, FaTwitter, FaFacebookF } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-ink text-paper mt-24">
      <div className="max-w-7xl mx-auto px-5 md:px-8 py-14 grid grid-cols-2 md:grid-cols-4 gap-10">
        <div className="col-span-2 md:col-span-1">
          <h3 className="font-display text-xl mb-3">AURELIA</h3>
          <p className="text-paper/60 text-sm leading-relaxed">Considered everyday goods, delivered with care.</p>
          <div className="flex gap-3 mt-4">
            {[FaInstagram, FaTwitter, FaFacebookF].map((Icon, i) => (
              <a
                key={i}
                href="#"
                className="w-8 h-8 rounded-full border border-paper/20 flex items-center justify-center hover:bg-brass hover:text-ink hover:border-brass transition-colors"
                aria-label="Social link"
              >
                <Icon size={13} />
              </a>
            ))}
          </div>
        </div>
        <div>
          <h4 className="text-xs uppercase tracking-widest text-brass mb-4">Shop</h4>
          <ul className="space-y-2 text-sm text-paper/70">
            <li><Link to="/products" className="hover:text-paper">All products</Link></li>
            <li><Link to="/products?sort=newest" className="hover:text-paper">New arrivals</Link></li>
            <li><Link to="/cart" className="hover:text-paper">Cart</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-xs uppercase tracking-widest text-brass mb-4">Company</h4>
          <ul className="space-y-2 text-sm text-paper/70">
            <li><Link to="/about" className="hover:text-paper">About us</Link></li>
            <li><Link to="/profile" className="hover:text-paper">Track order</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-xs uppercase tracking-widest text-brass mb-4">Help</h4>
          <ul className="space-y-2 text-sm text-paper/70">
            <li>Shipping & delivery</li>
            <li>Returns policy</li>
            <li>support@aurelia.store</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-paper/10 py-5 text-center text-xs text-paper/40">
        &copy; {new Date().getFullYear()} Aurelia. All rights reserved.
      </div>
    </footer>
  );
}
