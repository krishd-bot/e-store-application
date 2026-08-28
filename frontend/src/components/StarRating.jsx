import { FaStar, FaRegStar } from "react-icons/fa";

export default function StarRating({ rating = 0, count, size = 14 }) {
  return (
    <div className="flex items-center gap-1" aria-label={`Rated ${rating} out of 5`}>
      <div className="flex text-brass">
        {[1, 2, 3, 4, 5].map((n) =>
          n <= Math.round(rating) ? <FaStar key={n} size={size} /> : <FaRegStar key={n} size={size} />
        )}
      </div>
      {count !== undefined && <span className="text-xs text-ink/50">({count})</span>}
    </div>
  );
}
