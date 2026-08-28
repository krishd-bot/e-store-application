import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="max-w-lg mx-auto px-5 py-32 text-center">
      <p className="font-display text-6xl text-brass mb-4">404</p>
      <h1 className="font-display text-2xl mb-3">Page not found</h1>
      <p className="text-ink/50 mb-8">The page you're looking for doesn't exist or has moved.</p>
      <Link to="/" className="btn-primary">Back to home</Link>
    </div>
  );
}
