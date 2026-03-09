import { useState } from "react";
import { X, Check, Clock } from "lucide-react";
import { BRAND_MAP } from "../constants";

export function Avatar({ name, size = "md" }) {
  const initials = (name || "?").split(" ").slice(0, 2).map((n) => n[0]).join("");
  const palette  = ["#E91E8C", "#9C27B0", "#E9731D", "#00A651", "#E21C24", "#6B2D8B"];
  const color    = palette[(name || "A").charCodeAt(0) % palette.length];
  const sz = { sm: "w-8 h-8 text-xs", md: "w-11 h-11 text-sm", lg: "w-14 h-14 text-base" }[size];
  return (
    <div className={`${sz} rounded-full flex items-center justify-center text-white font-bold shrink-0`}
      style={{ background: `linear-gradient(135deg, ${color}, ${color}99)` }}>
      {initials}
    </div>
  );
}

export function Spinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="w-9 h-9 border-4 border-rose-200 border-t-rose-500 rounded-full animate-spin" />
    </div>
  );
}

export function Toast({ msg, type = "ok" }) {
  if (!msg) return null;
  return (
    <div className={`fixed top-5 left-1/2 -translate-x-1/2 z-[70] text-white text-sm px-5 py-3 rounded-2xl shadow-2xl font-semibold ${type === "error" ? "bg-red-500" : "bg-emerald-500"}`}>
      {msg}
    </div>
  );
}

export function useToast() {
  const [toast, setToast] = useState(null);
  const show = (msg, type = "ok") => { setToast({ msg, type }); setTimeout(() => setToast(null), 2800); };
  return { toast, show };
}

export function Modal({ title, onClose, children, wide = false }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" style={{ background: "rgba(0,0,0,0.4)" }}>
      <div className={`bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full ${wide ? "sm:max-w-2xl" : "sm:max-w-md"} max-h-[92vh] overflow-y-auto`}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-rose-50 sticky top-0 bg-white z-10 rounded-t-3xl">
          <h2 className="text-base font-bold text-gray-800">{title}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center text-rose-400 hover:bg-rose-100 transition-colors">
            <X size={16} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

export function Field({ label, children }) {
  return (
    <div className="mb-4">
      <label className="block text-xs font-semibold text-gray-500 mb-1.5">{label}</label>
      {children}
    </div>
  );
}

export const inp = "w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 bg-[#f3f3f5] placeholder-gray-400";

export function Btn({ children, onClick, variant = "primary", disabled, className = "" }) {
  const base = "px-4 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 active:scale-95 flex items-center justify-center gap-2 ";
  if (variant === "ghost") return <button onClick={onClick} disabled={disabled} className={base + "bg-gray-100 text-gray-600 hover:bg-gray-200 " + className}>{children}</button>;
  if (variant === "danger") return <button onClick={onClick} disabled={disabled} className={base + "bg-red-50 text-red-500 hover:bg-red-100 " + className}>{children}</button>;
  return (
    <button onClick={onClick} disabled={disabled} className={base + "text-white " + className} style={{ background: "linear-gradient(135deg, #E91E8C, #9C27B0)" }}>
      {children}
    </button>
  );
}

export function StatusBadge({ status }) {
  return (
    <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full"
      style={status === "pago" ? { background: "#DCFCE7", color: "#16A34A" } : { background: "#FEF9C3", color: "#CA8A04" }}>
      {status === "pago" ? <Check size={9} /> : <Clock size={9} />}
      {status}
    </span>
  );
}

export function BrandChip({ brandId, short = false }) {
  const b = BRAND_MAP[brandId];
  if (!b) return null;
  return (
    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap" style={{ background: b.light, color: b.color }}>
      {short ? b.short : b.name}
    </span>
  );
}

export function KpiCard({ label, value, sub, color, Icon }) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-rose-50 flex flex-col gap-2 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-400 font-medium leading-snug">{label}</span>
        <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: color + "18" }}>
          <Icon size={16} style={{ color }} />
        </div>
      </div>
      <p className="text-lg font-bold text-gray-800 leading-none">{value}</p>
      {sub && <p className="text-xs text-gray-400">{sub}</p>}
    </div>
  );
}

export function MiniBarChart({ data }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="flex items-end gap-2 h-24">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
          <div className="w-full rounded-t-lg transition-all"
            style={{ height: `${Math.max((d.value / max) * 72, 2)}px`, background: d.color || "linear-gradient(180deg, #E91E8C, #9C27B0)", opacity: i === data.length - 1 ? 1 : 0.4 }} />
          <span className="text-[9px] text-gray-400 font-medium">{d.label}</span>
        </div>
      ))}
    </div>
  );
}