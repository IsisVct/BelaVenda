import { useState } from "react";
import { fmt, BRANDS } from "../constants";
import { inp, BrandChip } from "./ui";
import { ProductAutocomplete } from "./ProductAutocomplete";
import { Plus, Trash2 } from "lucide-react";

export function ItemsEditor({ items, setItems }) {
  const update = (idx, field, val) => setItems((prev) => prev.map((it, i) => i === idx ? { ...it, [field]: val } : it));
  const remove = (idx) => setItems((prev) => prev.filter((_, i) => i !== idx));
  const total = items.reduce((s, i) => s + (Number(i.qty) || 1) * (Number(i.unit_price) || 0), 0);
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs font-semibold text-gray-500">Produtos do Pedido</label>
        <button onClick={() => setItems((p) => [...p, { product: "", brand: "", qty: 1, unit_price: "", cost: "" }])}
          className="text-xs px-3 py-1 rounded-full font-semibold text-white flex items-center gap-1"
          style={{ background: "linear-gradient(135deg, #E91E8C, #9C27B0)" }}>
          <Plus size={10} /> Adicionar item
        </button>
      </div>
      {items.length === 0 && (
        <p className="text-xs text-gray-400 text-center py-5 border-2 border-dashed border-rose-200 rounded-xl bg-rose-50/30">
          Clique em "+ Adicionar item" para começar
        </p>
      )}
      <div className="space-y-3">
        {items.map((it, idx) => (
          <div key={idx} className="border border-rose-100 rounded-xl p-3 bg-rose-50/30">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-rose-500">Item {idx + 1}</span>
                {it.brand && <BrandChip brandId={it.brand} short />}
              </div>
              <button onClick={() => remove(idx)} className="text-xs text-gray-400 hover:text-red-500 flex items-center gap-1">
                <Trash2 size={10} /> remover
              </button>
            </div>
            <div className="mb-2">
              <ProductAutocomplete
                value={it.product}
                onChange={(v) => update(idx, "product", v)}
                onSelect={(p) => setItems((prev) => prev.map((item, i) => i === idx ? { ...item, product: p.name, brand: p.brand } : item))}
                placeholder="Buscar produto de qualquer marca..."
              />
            </div>
            <div className="mb-2">
              <select className={inp} value={it.brand} onChange={e => update(idx, "brand", e.target.value)}>
                <option value="">Marca...</option>
                {BRANDS.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[9px] text-gray-400 font-bold uppercase">Qtd</label>
                <input type="number" min="1" className={inp + " mt-0.5"} value={it.qty} onChange={(e) => update(idx, "qty", Number(e.target.value))} />
              </div>
              <div>
                <label className="text-[9px] text-gray-400 font-bold uppercase">Preço venda</label>
                <input type="number" step="0.01" className={inp + " mt-0.5"} value={it.unit_price} placeholder="0,00" onChange={(e) => update(idx, "unit_price", e.target.value)} />
              </div>
              <div>
                <label className="text-[9px] text-gray-400 font-bold uppercase">Custo</label>
                <input type="number" step="0.01" className={inp + " mt-0.5"} value={it.cost} placeholder="0,00" onChange={(e) => update(idx, "cost", e.target.value)} />
              </div>
            </div>
            {Number(it.unit_price) > 0 && (
              <p className="text-xs text-right text-rose-500 font-semibold mt-1">
                Subtotal: {fmt(Number(it.qty) * Number(it.unit_price))}
              </p>
            )}
          </div>
        ))}
      </div>
      {items.length > 0 && (
        <div className="flex justify-between items-center mt-3 px-1">
          <span className="text-xs text-gray-400">{items.length} item(s)</span>
          <span className="text-sm font-bold text-gray-800">Total: {fmt(total)}</span>
        </div>
      )}
    </div>
  );
}