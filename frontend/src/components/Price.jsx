export default function Price({ price, discountPrice, size = "text-base" }) {
  const hasDiscount = discountPrice > 0 && discountPrice < price;
  return (
    <div className={`flex items-baseline gap-2 font-mono ${size}`}>
      <span className="font-semibold text-ink">₹{(hasDiscount ? discountPrice : price).toLocaleString("en-IN")}</span>
      {hasDiscount && (
        <>
          <span className="text-ink/40 line-through text-sm">₹{price.toLocaleString("en-IN")}</span>
          <span className="text-sage text-xs font-semibold">
            {Math.round(((price - discountPrice) / price) * 100)}% off
          </span>
        </>
      )}
    </div>
  );
}
