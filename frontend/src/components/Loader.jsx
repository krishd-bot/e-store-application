export default function Loader({ label = "Loading" }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3" role="status" aria-live="polite">
      <div className="w-8 h-8 border-2 border-mist border-t-ink rounded-full animate-spin" />
      <span className="text-sm text-ink/60">{label}...</span>
    </div>
  );
}
