import { useState } from "react";
import { fmt, today, BRANDS, BRAND_MAP, ptDate } from "../constants";
import { Spinner, Toast, Modal, Field, inp, Btn, StatusBadge, BrandChip, useToast } from "../components/ui";
import { ProductAutocomplete } from "../components/ProductAutocomplete";
import { ItemsEditor } from "../components/ItemsEditor";
import { InstallmentsEditor } from "../components/InstallmentsEditor";
import { ShoppingBag, Search, Plus, Check, Pencil, Trash2, ChevronDown } from "lucide-react";

// ── ORDERS ────────────────────────────────────────────────────────────────────
export default function Orders({ orders, clients, add, update, toggleStatus, remove, loading }) {
  const [modal, setModal]       = useState(false);
  const [editModal, setEditModal] = useState(null);
  const [filter, setFilter]     = useState("todos");
  const [search, setSearch]     = useState("");
  const [expanding, setExpanding] = useState(null);
  const [saving, setSaving]     = useState(false);
  const { toast, show } = useToast();
  const [form, setForm]         = useState({ clientId: "", date: today(), status: "pendente", notes: "" });
  const [items, setItems]       = useState([]);
  const [installments, setInstallments] = useState([]);
  const f = (v) => setForm(p => ({ ...p, ...v }));

  const filtered = orders.filter(o => {
    const mf = filter === "todos" || o.status === filter;
    const ms = (o.client_name || "").toLowerCase().includes(search.toLowerCase()) || (o.product || "").toLowerCase().includes(search.toLowerCase());
    return mf && ms;
  });
  const itemsTotal = items.reduce((s, i) => s + (Number(i.qty)||1) * (Number(i.unit_price)||0), 0);

  const resetForm = () => { setForm({ clientId: "", date: today(), status: "pendente", notes: "" }); setItems([]); setInstallments([]); };

  const save = async () => {
    if (!form.clientId) return show("Selecione um cliente.", "error");
    if (items.length === 0) return show("Adicione pelo menos um produto.", "error");
    if (items.some(i => !i.product || !i.unit_price)) return show("Preencha todos os itens.", "error");
    setSaving(true);
    const client = clients.find(c => c.id === form.clientId);
    const { error } = await add(form, client?.name || "", items, installments);
    setSaving(false);
    if (error) return show("Erro ao salvar.", "error");
    resetForm(); setModal(false); show("Pedido salvo! ✅");
  };

  const saveEdit = async () => {
    setSaving(true);
    const { error } = await update(editModal.id, { status: editModal.status, date: editModal.date, notes: editModal.notes });
    setSaving(false);
    if (error) return show("Erro.", "error");
    setEditModal(null); show("Pedido atualizado! ✅");
  };

  return (
    <div>
      <Toast msg={toast?.msg} type={toast?.type} />
      <div className="relative px-5 pt-12 pb-5 md:pt-5 md:rounded-2xl overflow-hidden" style={{ background: "linear-gradient(135deg, #E91E8C 0%, #C2185B 100%)" }}>
        <div className="absolute -top-8 -right-8 w-36 h-36 rounded-full bg-white/10" />
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 className="text-white font-bold text-2xl">Pedidos</h1>
            <p className="text-rose-200 text-sm">{orders.length} registrados</p>
          </div>
          <button onClick={() => setModal(true)} className="hidden md:flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-rose-600 text-sm font-semibold self-start">
            <Plus size={16} /> Novo Pedido
          </button>
        </div>
      </div>

      <div className="px-4 md:px-0 pt-4 space-y-3 pb-28 md:pb-6">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar produto, cliente..."
              className="w-full bg-white border border-rose-100 rounded-xl pl-9 pr-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 outline-none focus:border-rose-300 shadow-sm" />
          </div>
          <div className="flex gap-1 bg-rose-50 p-1 rounded-xl shrink-0">
            {[["todos","Todos"],["pago","✅ Pago"],["pendente","⏳ Pendente"]].map(([v,l]) => (
              <button key={v} onClick={() => setFilter(v)}
                className="px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap"
                style={filter===v ? { background:"linear-gradient(135deg,#E91E8C,#9C27B0)",color:"#fff" } : { color:"#9ca3af" }}>
                {l}
              </button>
            ))}
          </div>
        </div>

        {loading ? <Spinner /> : filtered.length === 0 ? (
          <div className="text-center py-16"><ShoppingBag size={40} className="mx-auto text-rose-200 mb-2" /><p className="text-gray-400 text-sm">Nenhum pedido aqui.</p></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {filtered.map(o => {
              const b = BRAND_MAP[o.brand];
              const isExpanded = expanding === o.id;
              const profit = Number(o.total) - Number(o.cost || 0);
              return (
                <div key={o.id} className="bg-white rounded-2xl shadow-sm border border-rose-50 overflow-hidden">
                  <button className="w-full flex items-center gap-3 p-4 text-left" onClick={() => setExpanding(isExpanded ? null : o.id)}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-[9px] font-extrabold shrink-0" style={{ background: b?.light || "#fce7f3", color: b?.color || "#E91E8C" }}>{b?.short || "—"}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{o.product || "Pedido"}</p>
                      <p className="text-xs text-gray-400">{o.client_name} · {ptDate(o.date)}</p>
                    </div>
                    <div className="text-right shrink-0 flex flex-col items-end gap-1">
                      <p className="font-bold text-gray-800 text-sm">{fmt(o.total)}</p>
                      <StatusBadge status={o.status} />
                    </div>
                    <ChevronDown size={14} className={`text-gray-300 shrink-0 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                  </button>
                  {isExpanded && (
                    <div className="px-4 pb-4 border-t border-rose-50 pt-3 space-y-3">
                      <div className="grid grid-cols-3 gap-2">
                        <div className="bg-rose-50 rounded-xl p-2.5 text-center"><p className="text-[10px] text-gray-400">Venda</p><p className="text-xs font-bold">{fmt(o.total)}</p></div>
                        <div className="bg-rose-50 rounded-xl p-2.5 text-center"><p className="text-[10px] text-gray-400">Custo</p><p className="text-xs font-bold">{fmt(o.cost||0)}</p></div>
                        <div className="rounded-xl p-2.5 text-center" style={{ background:"#DCFCE7" }}><p className="text-[10px] text-gray-400">Lucro</p><p className="text-xs font-bold text-green-600">{fmt(profit)}</p></div>
                      </div>
                      <div className="flex gap-2 flex-wrap justify-end">
                        <button onClick={() => setEditModal({ ...o })} className="px-3 py-1.5 rounded-full bg-purple-50 text-purple-600 text-xs font-semibold flex items-center gap-1">
                          <Pencil size={10} /> Editar
                        </button>
                        {o.status === "pendente" && (
                          <button onClick={() => toggleStatus(o.id, o.status)} className="px-4 py-1.5 rounded-full text-white text-xs font-semibold flex items-center gap-1" style={{ background:"linear-gradient(135deg,#E91E8C,#9C27B0)" }}>
                            <Check size={10} /> Marcar pago
                          </button>
                        )}
                        <button onClick={() => { if(confirm("Remover pedido?")) remove(o.id); }} className="px-3 py-1.5 rounded-full bg-red-50 text-red-400">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <button onClick={() => setModal(true)} className="md:hidden fixed bottom-24 right-5 w-14 h-14 rounded-full shadow-xl flex items-center justify-center z-40 text-white" style={{ background:"linear-gradient(135deg,#E91E8C,#9C27B0)" }}>
        <Plus size={24} />
      </button>

      {/* Novo pedido */}
      {modal && (
        <Modal title="Novo Pedido" onClose={() => { resetForm(); setModal(false); }} wide>
          <Field label="Cliente *">
            <select className={inp} value={form.clientId} onChange={e => f({ clientId: e.target.value })}>
              <option value="">Selecionar cliente...</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </Field>
          <Field label="Data"><input type="date" className={inp} value={form.date} onChange={e => f({ date: e.target.value })} /></Field>
          <ItemsEditor items={items} setItems={setItems} />
          <Field label="Status">
            <select className={inp} value={form.status} onChange={e => f({ status: e.target.value })}>
              <option value="pendente">⏳ Pendente (fiado)</option>
              <option value="pago">✅ Já foi pago</option>
            </select>
          </Field>
          {form.status === "pendente" && itemsTotal > 0 && (
            <InstallmentsEditor total={itemsTotal} installments={installments} setInstallments={setInstallments} />
          )}
          <Field label="Observações"><textarea className={inp} rows={2} value={form.notes} onChange={e => f({ notes: e.target.value })} /></Field>
          <div className="flex gap-2 mt-2">
            <Btn variant="ghost" onClick={() => { resetForm(); setModal(false); }} className="flex-1">Cancelar</Btn>
            <Btn onClick={save} disabled={saving} className="flex-1">{saving ? "Salvando..." : `Salvar${itemsTotal > 0 ? " · " + fmt(itemsTotal) : ""}`}</Btn>
          </div>
        </Modal>
      )}

      {/* Editar pedido */}
      {editModal && (
        <Modal title="Editar Pedido" onClose={() => setEditModal(null)}>
          <div className="mb-4 bg-rose-50 rounded-xl p-3">
            <p className="text-sm font-semibold text-gray-800">{editModal.product}</p>
            <p className="text-xs text-gray-400">{editModal.client_name} · {fmt(editModal.total)}</p>
          </div>
          <Field label="Status">
            <select className={inp} value={editModal.status} onChange={e => setEditModal(p => ({ ...p, status: e.target.value }))}>
              <option value="pendente">⏳ Pendente</option>
              <option value="pago">✅ Pago</option>
            </select>
          </Field>
          <Field label="Data"><input type="date" className={inp} value={editModal.date || ""} onChange={e => setEditModal(p => ({ ...p, date: e.target.value }))} /></Field>
          <Field label="Observações"><textarea className={inp} rows={2} value={editModal.notes || ""} onChange={e => setEditModal(p => ({ ...p, notes: e.target.value }))} /></Field>
          <div className="flex gap-2 mt-2">
            <Btn variant="ghost" onClick={() => setEditModal(null)} className="flex-1">Cancelar</Btn>
            <Btn onClick={saveEdit} disabled={saving} className="flex-1">{saving ? "Salvando..." : "Atualizar"}</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}