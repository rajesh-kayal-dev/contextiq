export default function CTAButton({
  children,
  disabled = false,
  onClick,
  className = "",
}) {
  return (
    <button
      disabled={disabled}
      onClick={() => onClick?.()}
      className={`border-none text-xs px-4 py-1.5 font-semibold text-white rounded-lg bg-[#14B8A6] hover:bg-[#0F766E] transition-colors h-[36px] whitespace-nowrap w-fit shadow-sm ${className}`}
    >
      <div className="flex items-center justify-center gap-2">{children}</div>
    </button>
  );
}
