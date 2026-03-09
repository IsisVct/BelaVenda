import { useState } from "react";
import { fmt, BRANDS, BRAND_MAP } from "../constants";
import { Avatar, Spinner, Toast, Modal, Field, inp, Btn, BrandChip, useToast } from "../components/ui";
import { Users, MapPin, Phone, MessageCircle, ChevronRight, Pencil, Trash2, Plus, Search, X } from "lucide-react";

// ── CLIENTS ───────────────────────────────────────────────────────────────────
export default function Clients({ clients, orders, add, update, remove, loading }) {
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [filterBrand, setFilterBrand] = useState("todas");
  const [saving, setSaving] = useState(false);
  const { toast, show } = useToast();
  const emptyForm = { name: "", phone: "", city: "", brand: "", notes: "" };
  const [form, setForm] = useState(emptyForm);
  const f = (v) => setForm(p => ({ ...p, ...v }));

  const brandOptions = [{ id: "todas", name: "Todas", color: "#E91E8C", light: "#fce7f3" }, ...BRANDS];
  const filtered = clients.filter(c => {
    const ms = c.name.toLowerCase().includes(search.toLowerCase()) || (c.city || "").toLowerCase().includes(search.toLowerCase());
    const mb = filterBrand === "todas" || c.brand === filterBrand;
    return ms && mb;
  });

  const openNew  = () => { setEditing(null); setForm(emptyForm); setSelected(null); setModal(true); };
  const openEdit = (c) => { setEditing(c); setForm({ name: c.name, phone: c.phone || "", city: c.city || "", brand: c.brand || "", notes: c.notes || "" }); setSelected(null); setModal(true); };

  const save = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    if (editing) {
      const { error } = await update(editing.id, form);
      setSaving(false);
      if (error) return show("Erro ao atualizar.", "error");
      show("Cliente atualizada! ✅");
    } else {
      const { error } = await add(form);
      setSaving(false);
      if (error) return show("Erro ao salvar.", "error");
      show("Cliente salva! ✅");
    }
    setForm(emptyForm); setModal(false);
  };

  const del = async (id) => {
    if (!confirm("Remover cliente?")) return;
    const { error } = await remove(id);
    if (error) show("Erro.", "error"); else { setSelected(null); show("Removida."); }
  };

  return (
    <div>
      <Toast msg={toast?.msg} type={toast?.type} />
      <div className="relative px-5 pt-12 pb-5 md:pt-5 md:rounded-2xl overflow-hidden" style={{ background: "linear-gradient(135deg, #9C27B0 0%, #E91E8C 100%)" }}>
        <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-white/10" />
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 className="text-white font-bold text-2xl">Clientes</h1>
            <p className="text-purple-200 text-sm">{clients.length} clientes cadastradas</p>
          </div>
          <div className="flex gap-2 items-center">
            <div className="relative flex-1 md:w-72">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-300" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar..."
                className="w-full bg-white/20 border border-white/30 rounded-xl pl-9 pr-4 py-2.5 text-white placeholder-purple-300 text-sm outline-none" />
            </div>
            <button onClick={openNew} className="hidden md:flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-rose-600 text-sm font-semibold shrink-0">
              <Plus size={16} /> Nova Cliente
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-0 py-4 space-y-3 pb-28 md:pb-6">
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Com fiado", val: clients.filter(c => orders.some(o => o.client_id === c.id && o.status === "pendente")).length, color: "text-rose-500" },
            { label: "Em dia",    val: clients.filter(c => !orders.some(o => o.client_id === c.id && o.status === "pendente")).length, color: "text-green-500" },
            { label: "Pedidos",   val: orders.length, color: "text-purple-500" },
          ].map(({ label, val, color }) => (
            <div key={label} className="bg-white rounded-2xl p-3 shadow-sm border border-rose-50 text-center">
              <p className="text-[10px] text-gray-400 font-medium">{label}</p>
              <p className={`text-2xl font-bold mt-0.5 ${color}`}>{val}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {brandOptions.map(b => (
            <button key={b.id} onClick={() => setFilterBrand(b.id)}
              className="shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap"
              style={filterBrand === b.id ? { background: `linear-gradient(135deg, ${b.color}, ${b.color}cc)`, color: "#fff" } : { background: "#fff", color: "#6b7280", border: "1px solid #fce7f3" }}>
              {b.name}
            </button>
          ))}
        </div>

        {loading ? <Spinner /> : filtered.length === 0 ? (
          <div className="text-center py-16"><Users size={40} className="mx-auto text-rose-200 mb-2" /><p className="text-gray-400 text-sm">Nenhuma cliente encontrada</p></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {filtered.map(c => {
              const b = BRAND_MAP[c.brand];
              const clientOrders = orders.filter(o => o.client_id === c.id);
              const debt = clientOrders.filter(o => o.status === "pendente").reduce((s, o) => s + Number(o.total), 0);
              return (
                <button key={c.id} onClick={() => setSelected(c)}
                  className="bg-white rounded-2xl px-3.5 py-3 shadow-sm border border-rose-50 flex items-center gap-3 text-left hover:shadow-md active:scale-[0.98] transition-all w-full">
                  <Avatar name={c.name} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p className="font-semibold text-gray-800 text-sm truncate">{c.name}</p>
                      {debt > 0 && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-600">FIADO</span>}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      {c.city && <span className="flex items-center gap-0.5 text-xs text-gray-400"><MapPin size={9} />{c.city}</span>}
                      {b && <BrandChip brandId={c.brand} />}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    {debt > 0 ? <p className="text-xs font-bold text-amber-500">{fmt(debt)}</p> : <p className="text-[10px] text-green-500 font-semibold">✓ Em dia</p>}
                    <p className="text-[10px] text-gray-400">{clientOrders.length} ped.</p>
                  </div>
                  <ChevronRight size={13} className="text-gray-300 shrink-0" />
                </button>
              );
            })}
          </div>
        )}
      </div>

      <button onClick={openNew} className="md:hidden fixed bottom-24 right-5 w-14 h-14 rounded-full shadow-xl flex items-center justify-center z-40 text-white" style={{ background: "linear-gradient(135deg, #E91E8C, #9C27B0)" }}>
        <Plus size={24} />
      </button>

      {/* Detail sheet */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center sm:justify-center" style={{ background: "rgba(0,0,0,0.4)" }} onClick={() => setSelected(null)}>
          <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-sm p-6 space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-800">Detalhes da Cliente</h3>
              <button onClick={() => setSelected(null)} className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center text-rose-400"><X size={16} /></button>
            </div>
            <div className="flex items-center gap-4">
              <Avatar name={selected.name} size="lg" />
              <div><p className="font-bold text-gray-800">{selected.name}</p><BrandChip brandId={selected.brand} /></div>
            </div>
            <div className="space-y-2">
              {selected.phone && <div className="flex items-center gap-3 bg-rose-50 rounded-xl p-3"><Phone size={16} className="text-rose-400" /><span className="text-sm">{selected.phone}</span></div>}
              {selected.city  && <div className="flex items-center gap-3 bg-rose-50 rounded-xl p-3"><MapPin size={16} className="text-rose-400" /><span className="text-sm">{selected.city}</span></div>}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-rose-50 rounded-xl p-3 text-center"><p className="text-xs text-gray-400">Pedidos</p><p className="font-bold">{orders.filter(o => o.client_id === selected.id).length}</p></div>
                {(() => {
                  const debt = orders.filter(o => o.client_id === selected.id && o.status === "pendente").reduce((s, o) => s + Number(o.total), 0);
                  return <div className="rounded-xl p-3 text-center" style={debt > 0 ? { background:"#FEF9C3" } : { background:"#DCFCE7" }}><p className="text-xs text-gray-400">Fiado</p><p className="font-bold" style={debt > 0 ? { color:"#CA8A04" } : { color:"#16A34A" }}>{debt > 0 ? fmt(debt) : "Em dia"}</p></div>;
                })()}
              </div>
            </div>
            {(() => {
              const debt = orders.filter(o => o.client_id === selected.id && o.status === "pendente").reduce((s, o) => s + Number(o.total), 0);
              return debt > 0 && selected.phone ? (
                <a href={`https://wa.me/55${selected.phone.replace(/\D/g,"")}?text=Oi%20${encodeURIComponent(selected.name.split(" ")[0])}!%20Passando%20pra%20lembrar%20do%20valor%20pendente%20de%20${encodeURIComponent(fmt(debt))}%20%F0%9F%8C%B8`}
                  target="_blank" rel="noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white text-sm font-semibold"
                  style={{ background: "#25D366" }}>
                  <MessageCircle size={16} /> Cobrar via WhatsApp ({fmt(debt)})
                </a>
              ) : null;
            })()}
            <div className="flex gap-2">
              <button onClick={() => openEdit(selected)} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-purple-50 text-purple-600 text-sm font-semibold">
                <Pencil size={14} /> Editar
              </button>
              <button onClick={() => del(selected.id)} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-50 text-red-400 text-sm font-semibold">
                <Trash2 size={14} /> Remover
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit modal */}
      {modal && (
        <Modal title={editing ? "Editar Cliente" : "Nova Cliente"} onClose={() => setModal(false)}>
          <Field label="Nome *"><input className={inp} value={form.name} onChange={e => f({ name: e.target.value })} placeholder="Nome completo" /></Field>
          <Field label="Telefone / WhatsApp"><input className={inp} value={form.phone} onChange={e => f({ phone: e.target.value })} placeholder="(11) 99999-9999" /></Field>
          <Field label="Cidade / Bairro"><input className={inp} value={form.city} onChange={e => f({ city: e.target.value })} /></Field>
          <Field label="Marca Preferida">
            <select className={inp} value={form.brand} onChange={e => f({ brand: e.target.value })}>
              <option value="">Selecionar...</option>
              {BRANDS.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </Field>
          <Field label="Observações"><textarea className={inp} rows={2} value={form.notes} onChange={e => f({ notes: e.target.value })} /></Field>
          <div className="flex gap-2 mt-2">
            <Btn variant="ghost" onClick={() => setModal(false)} className="flex-1">Cancelar</Btn>
            <Btn onClick={save} disabled={saving} className="flex-1">{saving ? "Salvando..." : editing ? "Atualizar" : "Salvar"}</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}