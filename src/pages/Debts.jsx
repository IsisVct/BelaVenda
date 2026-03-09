import { useState, useMemo } from "react";
import { fmt, ptDate, isOverdue, isDueSoon } from "../constants";
import { Avatar, BrandChip } from "../components/ui";
import { AlertCircle, AlertTriangle, MessageCircle, Check, TrendingDown } from "lucide-react";

// ── DEBTS ─────────────────────────────────────────────────────────────────────
export default function Debts({ orders, clients, installments, payInstallment, payAllByClient, toggleStatus }) {
  const pending   = orders.filter(o => o.status === "pendente");
  const totalPend = pending.reduce((s, o) => s + Number(o.total), 0);
  const overdueInst = installments.filter(i => isOverdue(i.due_date, i.status));
  const overdueAmt  = overdueInst.reduce((s, i) => s + Number(i.amount), 0);

  const byClient = useMemo(() => {
    const map = {};
    pending.forEach(o => {
      if (!map[o.client_id]) map[o.client_id] = { clientId: o.client_id, name: o.client_name, items: [], total: 0 };
      map[o.client_id].items.push(o);
      map[o.client_id].total += Number(o.total);
    });
    return Object.values(map).sort((a, b) => b.total - a.total);
  }, [pending]);

  const instByOrder = useMemo(() => {
    const map = {};
    installments.filter(i => i.status === "pendente").forEach(i => {
      if (!map[i.order_id]) map[i.order_id] = [];
      map[i.order_id].push(i);
    });
    return map;
  }, [installments]);

  const whatsapp = (clientId, name, total) => {
    const c = clients.find(c => c.id === clientId);
    if (!c?.phone) return alert("Telefone não cadastrado.");
    const msg = encodeURIComponent(`Oi ${name.split(" ")[0]}! Tudo bem? 😊 Passando pra lembrar que você tem ${fmt(total)} pendente comigo. Quando puder acertar, fico no aguardo! 🌸`);
    window.open(`https://wa.me/55${c.phone.replace(/\D/g,"")}?text=${msg}`, "_blank");
  };

  return (
    <div>
      <div className="relative px-5 pt-12 pb-6 md:pt-5 md:rounded-2xl overflow-hidden" style={{ background: "linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)" }}>
        <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/10" />
        <div className="relative flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <h1 className="text-white font-bold text-2xl">Pagamentos</h1>
            <p className="text-amber-100 text-sm">Controle de pendências</p>
          </div>
          <div className="bg-white/20 rounded-2xl p-4 border border-white/30 backdrop-blur-sm md:min-w-72">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-100 text-xs">Total a receber</p>
                <p className="text-white font-bold text-3xl mt-0.5">{fmt(totalPend)}</p>
                <p className="text-amber-100 text-xs mt-1">{byClient.length} clientes devendo</p>
              </div>
              <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center">
                <AlertCircle size={28} className="text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-0 pt-4 space-y-3 pb-10">
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 flex items-start gap-2.5">
          <TrendingDown size={15} className="text-amber-500 mt-0.5 shrink-0" />
          <p className="text-xs text-amber-700">Clique no botão WhatsApp para cobrar suas clientes diretamente! ✨</p>
        </div>

        {overdueInst.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
            <p className="font-bold text-red-700 mb-2 text-sm flex items-center gap-1.5">
              <AlertTriangle size={14} /> {overdueInst.length} parcela(s) atrasada(s) · {fmt(overdueAmt)}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {overdueInst.map(inst => {
                const order = orders.find(o => o.id === inst.order_id);
                return (
                  <div key={inst.id} className="flex justify-between items-center bg-white rounded-xl px-3 py-2.5 border border-red-100">
                    <div>
                      <p className="text-sm font-semibold text-red-700">{order?.client_name || "—"}</p>
                      <p className="text-xs text-red-400">Venceu {ptDate(inst.due_date)} · Parcela {inst.number}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-red-700">{fmt(inst.amount)}</span>
                      <button onClick={() => payInstallment(inst.id)} className="text-xs bg-green-500 text-white px-2 py-1 rounded-lg flex items-center gap-1"><Check size={10} /></button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {byClient.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-rose-200">
            <AlertCircle size={40} className="mx-auto text-rose-200 mb-2" />
            <p className="text-gray-700 font-bold">Nenhuma pendência!</p>
            <p className="text-gray-400 text-sm mt-1">Tudo em dia. 🎉</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {byClient.map(entry => {
              const oldest = [...entry.items].sort((a,b) => (a.date||"").localeCompare(b.date||""))[0];
              const daysPending = oldest ? Math.floor((Date.now() - new Date((oldest.date||"")+"T00:00:00").getTime()) / 86400000) : 0;
              const clientInfo = clients.find(c => c.id === entry.clientId);
              return (
                <div key={entry.clientId} className="bg-white rounded-2xl shadow-sm border border-rose-50 overflow-hidden">
                  <div className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <Avatar name={entry.name || "?"} />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-800">{entry.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {clientInfo?.brand && <BrandChip brandId={clientInfo.brand} />}
                          <span className="text-[10px] text-gray-400">{daysPending}d em aberto</span>
                        </div>
                      </div>
                      <p className="font-bold text-amber-500 text-lg">{fmt(entry.total)}</p>
                    </div>
                    <div className="space-y-2">
                      {entry.items.map(o => {
                        const orderInst = instByOrder[o.id] || [];
                        return (
                          <div key={o.id}>
                            <div className="flex items-center justify-between bg-amber-50 rounded-xl px-3 py-2">
                              <div className="flex-1 min-w-0">
                                <p className="text-xs text-gray-700 font-medium truncate">{o.product || "Pedido"}</p>
                                <p className="text-[10px] text-gray-400">{ptDate(o.date)}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <p className="text-xs font-bold text-amber-600">{fmt(o.total)}</p>
                                <button onClick={() => toggleStatus(o.id, o.status)} className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-lg font-semibold">Pago</button>
                              </div>
                            </div>
                            {orderInst.length > 0 && (
                              <div className="mt-1 space-y-1 pl-2">
                                {orderInst.map(inst => {
                                  const ov = isOverdue(inst.due_date, inst.status);
                                  const soon = isDueSoon(inst.due_date, inst.status);
                                  return (
                                    <div key={inst.id} className={`flex justify-between items-center text-xs px-2 py-1.5 rounded-lg ${ov ? "bg-red-50 text-red-600" : soon ? "bg-amber-50 text-amber-600" : "bg-gray-50 text-gray-500"}`}>
                                      <span>{inst.number}ª parcela · {ptDate(inst.due_date)} {ov ? "🔴" : soon ? "🟡" : ""}</span>
                                      <div className="flex items-center gap-1.5">
                                        <span className="font-semibold">{fmt(inst.amount)}</span>
                                        <button onClick={() => payInstallment(inst.id)} className="bg-green-500 text-white px-1.5 py-0.5 rounded text-[10px]"><Check size={8} /></button>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex gap-2 mt-3">
                      <button onClick={() => whatsapp(entry.clientId, entry.name, entry.total)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-white text-sm font-semibold" style={{ background: "#25D366" }}>
                        <MessageCircle size={15} /> WhatsApp
                      </button>
                      <button onClick={() => payAllByClient(entry.clientId)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-white text-sm font-semibold" style={{ background:"linear-gradient(135deg,#E91E8C,#9C27B0)" }}>
                        <Check size={15} /> Quitar tudo
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}