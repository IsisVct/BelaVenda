import { useState } from "react";
import { fmt, BRANDS, BRAND_MAP } from "../constants";
import { Spinner, Toast, Modal, Field, inp, Btn, BrandChip, useToast } from "../components/ui";
import { ProductAutocomplete } from "../components/ProductAutocomplete";
import { Package, Search, Plus, Pencil, Trash2, AlertTriangle } from "lucide-react";

export default function Stock({ stock, add, update, updateQty, remove, loading }) {
  const [modal, setModal]     = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [search, setSearch]   = useState("");
  const [filterBrand, setFilterBrand] = useState("todas");
  const [saving, setSaving]   = useState(false);
  const { toast, show } = useToast();
  const emptyForm = { name: "", brand: "", qty: "", costPrice: "", salePrice: "", notes: "" };
  const [form, setForm]       = useState(emptyForm);
  const f = (v) => setForm(p => ({ ...p, ...v }));

  const brandOptions = [{ id: "todas", name: "Todas", color: "#00A651", light: "#dcfce7" }, ...BRANDS];
  const filtered = stock.filter(s => s.name.toLowerCase().includes(search.toLowerCase()) && (filterBrand === "todas" || s.brand === filterBrand));
  const totalValue = stock.reduce((s, p) => s + p.qty * Number(p.sale_price || 0), 0);
  const outCount   = stock.filter(s => s.qty === 0).length;

  const openEdit = (s) => { setEditItem(s); setForm({ name: s.name, brand: s.brand||"", qty: String(s.qty), costPrice: String(s.cost_price||""), salePrice: String(s.sale_price||""), notes: s.notes||"" }); setModal(true); };
  const openNew  = () => { setEditItem(null); setForm(emptyForm); setModal(true); };

  const save = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    if (editItem) {
      const { error } = await update(editItem.id, form);
      setSaving(false);
      if (error) return show("Erro.", "error");
      show("Produto atualizado! ✅");
    } else {
      const { error } = await add(form);
      setSaving(false);
      if (error) return show("Erro.", "error");
      show("Produto salvo! ✅");
    }
    setForm(emptyForm); setModal(false);
  };

  return (
    <div>
      <Toast msg={toast?.msg} type={toast?.type} />
      <div className="relative px-5 pt-12 pb-5 md:pt-5 md:rounded-2xl overflow-hidden" style={{ background: "linear-gradient(135deg, #00A651 0%, #059669 100%)" }}>
        <div className="absolute -top-8 -right-8 w-36 h-36 rounded-full bg-white/10" />
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 className="text-white font-bold text-2xl">Estoque</h1>
            <p className="text-green-100 text-sm">{stock.length} produtos · Val. {fmt(totalValue)}</p>
          </div>
          <button onClick={openNew} className="hidden md:flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-green-700 text-sm font-semibold self-start">
            <Plus size={16} /> Novo Produto
          </button>
        </div>
      </div>

      <div className="px-4 md:px-0 pt-4 space-y-3 pb-28 md:pb-6">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar produto..."
            className="w-full bg-white border border-rose-100 rounded-xl pl-9 pr-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 outline-none shadow-sm" />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {brandOptions.map(b => (
            <button key={b.id} onClick={() => setFilterBrand(b.id)}
              className="shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap"
              style={filterBrand===b.id ? { background:b.color, color:"#fff" } : { background:"#fff", color:"#6b7280", border:"1px solid #fce7f3" }}>
              {b.name}
            </button>
          ))}
        </div>

        {outCount > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-3 flex items-center gap-2.5">
            <AlertTriangle size={15} className="text-red-500 shrink-0" />
            <p className="text-xs text-red-700"><strong>{outCount} produto(s)</strong> sem estoque.</p>
          </div>
        )}

        {loading ? <Spinner /> : filtered.length === 0 ? (
          <div className="text-center py-16"><Package size={40} className="mx-auto text-green-200 mb-2" /><p className="text-gray-400 text-sm">Estoque vazio.</p></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {filtered.map(s => {
              const b = BRAND_MAP[s.brand];
              const isOut = s.qty === 0;
              const margin = s.sale_price > 0 ? (((Number(s.sale_price)-Number(s.cost_price))/Number(s.sale_price))*100).toFixed(0) : 0;
              return (
                <div key={s.id} className="bg-white rounded-2xl shadow-sm border border-rose-50 overflow-hidden">
                  <div className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background:b?.light||"#f9fafb" }}>
                        <Package size={18} style={{ color:b?.color||"#9ca3af" }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-800 text-sm leading-snug">{s.name}</p>
                        {b && <BrandChip brandId={s.brand} />}
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-bold text-gray-800">{fmt(s.sale_price||0)}</p>
                        <p className="text-xs text-gray-400">{fmt(s.cost_price||0)} custo</p>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-2">
                      <div className="bg-green-50 rounded-lg px-3 py-1.5 text-center">
                        <p className="text-[10px] text-gray-400">Margem</p>
                        <p className="text-xs font-bold text-green-600">{margin}%</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => updateQty(s.id,-1)} className="w-8 h-8 rounded-full bg-rose-100 text-rose-600 font-bold flex items-center justify-center hover:bg-rose-200 text-lg">−</button>
                        <span className="text-sm font-bold text-gray-700 min-w-[24px] text-center">{s.qty}</span>
                        <button onClick={() => updateQty(s.id,+1)} className="w-8 h-8 rounded-full bg-green-100 text-green-600 font-bold flex items-center justify-center hover:bg-green-200 text-lg">+</button>
                        <button onClick={() => openEdit(s)} className="w-8 h-8 rounded-full bg-purple-100 text-purple-500 flex items-center justify-center hover:bg-purple-200">
                          <Pencil size={12} />
                        </button>
                        <button onClick={() => { if(confirm("Remover?")) remove(s.id); }} className="w-8 h-8 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center hover:bg-red-100 hover:text-red-400">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                    {isOut && (
                      <p className="text-[10px] font-semibold mt-2 text-right text-red-500">⚠️ Sem estoque</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <button onClick={openNew} className="md:hidden fixed bottom-24 right-5 w-14 h-14 rounded-full shadow-xl flex items-center justify-center z-40 text-white" style={{ background:"linear-gradient(135deg,#00A651,#059669)" }}>
        <Plus size={24} />
      </button>

      {modal && (
        <Modal title={editItem ? "Editar Produto" : "Novo Produto"} onClose={() => setModal(false)}>
          <Field label="Produto *">
            <ProductAutocomplete value={form.name} onChange={v => f({ name: v })} onSelect={p => f({ name: p.name, brand: p.brand })} placeholder="Digite para buscar..." />
          </Field>
          <Field label="Marca">
            <select className={inp} value={form.brand} onChange={e => f({ brand: e.target.value })}>
              <option value="">Selecionar...</option>
              {BRANDS.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </Field>
          <Field label="Quantidade"><input type="number" className={inp} min="0" value={form.qty} onChange={e => f({ qty: e.target.value })} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Preço Custo"><input type="number" className={inp} step="0.01" value={form.costPrice} onChange={e => f({ costPrice: e.target.value })} placeholder="0,00" /></Field>
            <Field label="Preço Venda"><input type="number" className={inp} step="0.01" value={form.salePrice} onChange={e => f({ salePrice: e.target.value })} placeholder="0,00" /></Field>
          </div>
          <Field label="Observações"><input className={inp} value={form.notes} onChange={e => f({ notes: e.target.value })} placeholder="Cor, tamanho, ref..." /></Field>
          <div className="flex gap-2 mt-2">
            <Btn variant="ghost" onClick={() => setModal(false)} className="flex-1">Cancelar</Btn>
            <Btn onClick={save} disabled={saving} className="flex-1">{saving ? "Salvando..." : editItem ? "Atualizar" : "Salvar"}</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}