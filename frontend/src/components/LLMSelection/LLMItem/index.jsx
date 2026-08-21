import { Check, Star } from "@phosphor-icons/react";

export default function LLMItem({
  name,
  value,
  image,
  description,
  checked,
  onClick,
}) {
  const isRecommended = value === "groq";

  return (
    <div
      onClick={() => onClick(value)}
      className={`w-full p-2.5 rounded-xl border hover:cursor-pointer transition-all flex items-center justify-between ${
        checked
          ? "bg-[#2563EB]/10 border-[#2563EB] text-[#F8FAFC]"
          : "bg-[#172033]/60 light:bg-slate-50 border-[#26344D]/60 light:border-slate-200 hover:border-[#2563EB]/40"
      }`}
    >
      <input
        type="checkbox"
        value={value}
        className="peer hidden"
        checked={checked}
        readOnly={true}
        formNoValidate={true}
      />
      <div className="flex gap-x-3 items-center min-w-0 flex-1">
        {image ? (
          <img
            src={image}
            alt={`${name} logo`}
            className="w-8 h-8 rounded-lg object-contain shrink-0"
          />
        ) : (
          <div className="w-8 h-8 rounded-lg bg-[#2563EB]/20 text-[#2563EB] flex items-center justify-center font-bold text-xs shrink-0">
            {name.charAt(0)}
          </div>
        )}
        <div className="flex flex-col min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#F8FAFC] light:text-[#0F172A] truncate">
              {name}
            </span>
            {isRecommended && (
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-[#2563EB] text-white shrink-0">
                <Star size={8} weight="fill" />
                Recommended
              </span>
            )}
          </div>
          <span className="mt-0.5 text-[11px] text-[#94A3B8] light:text-[#64748B] truncate">
            {description}
          </span>
        </div>
      </div>
      {checked && (
        <Check
          size={16}
          weight="bold"
          className="text-[#2563EB] shrink-0 ml-2"
        />
      )}
    </div>
  );
}
