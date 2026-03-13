import { useState, useMemo, useEffect, useRef } from "react";
import { useProducts } from "../hooks/useProducts";
import { inp, BrandChip } from "./ui";
import { Package } from "lucide-react";

export function ProductAutocomplete({ value, onChange, onSelect, placeholder = "Digite o produto...", stock = [] }) {
  const { products } = useProducts();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const suggestions = useMemo(() => {
  console.log("products:", products.length, "stock:", stock.length, "value:", value);
    if (!value || value.length < 2) return [];
    const q = value.toLowerCase();

    // Produtos que estão no estoque (com qty > 0)
    const stockNames = new Set(stock.filter(s => s.qty > 0).map(s => s.name.toLowerCase().trim()));

    const matched = products.filter((p) => p.name.toLowerCase().includes(q));

    // Ordena: primeiro os que estão no estoque, depois o resto
    return matched.sort((a, b) => {
      const aIn = stockNames.has(a.name.toLowerCase().trim()) ? 0 : 1;
      const bIn = stockNames.has(b.name.toLowerCase().trim()) ? 0 : 1;
      return aIn - bIn;
    }).slice(0, 10);
  }, [value, products, stock]);

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
          {suggestions.map((p, i) => {
            const inStock = stock.find(s => s.name.toLowerCase().trim() === p.name.toLowerCase().trim() && s.brand === p.brand);
            const hasStock = inStock && inStock.qty > 0;
            return (
              <button key={i} className="w-full text-left px-4 py-2.5 text-sm hover:bg-rose-50 border-b border-rose-50 last:border-0 flex items-center gap-2"
                onMouseDown={() => { onSelect(p); setOpen(false); }}>
                <BrandChip brandId={p.brand} short />
                <span className="font-medium text-gray-800 truncate flex-1">{p.name}</span>
                {hasStock && (
                  <span className="flex items-center gap-1 text-[10px] font-semibold text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full shrink-0">
                    <Package size={8} /> {inStock.qty}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}