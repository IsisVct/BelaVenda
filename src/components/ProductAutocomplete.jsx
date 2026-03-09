import { useState, useMemo, useEffect, useRef } from "react";
import { useProducts } from "../hooks/useProducts";
import { inp, BrandChip } from "./ui";

export function ProductAutocomplete({ value, onChange, onSelect, placeholder = "Digite o produto..." }) {
  const { products } = useProducts();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const suggestions = useMemo(() => {
    if (!value || value.length < 2) return [];
    const q = value.toLowerCase();
    return products.filter((p) => p.name.toLowerCase().includes(q)).slice(0, 10);
  }, [value, products]);
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);
  return (
    <div ref={ref} className="relative">
      <input className={inp} value={value} placeholder={placeholder}
        onChange={(e) => { onChange(e.target.value); setOpen(true); }} onFocus={() => setOpen(true)} />
      {open && suggestions.length > 0 && (
        <div className="absolute z-50 left-0 right-0 bg-white border border-rose-100 rounded-xl shadow-xl mt-1 max-h-56 overflow-y-auto">
          {suggestions.map((p, i) => (
            <button key={i} className="w-full text-left px-4 py-2.5 text-sm hover:bg-rose-50 border-b border-rose-50 last:border-0 flex items-center gap-2"
              onMouseDown={() => { onSelect(p); setOpen(false); }}>
              <BrandChip brandId={p.brand} short />
              <span className="font-medium text-gray-800 truncate">{p.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}