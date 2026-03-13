import { useState } from "react";
import { fmt, ptDate, BRANDS, BRAND_MAP, isOverdue, isDueSoon } from "../constants";
import { Spinner, BrandChip, KpiCard, MiniBarChart, StatusBadge } from "../components/ui";
import {
  Sparkles, Users, ShoppingBag, AlertCircle, TrendingUp, AlertTriangle, Clock,
} from "lucide-react";

export default function Dashboard({ clients, orders, stock, installments, loading, user }) {
  if (loading) return <Spinner />;
  const paid    = orders.filter(o => o.status === "pago");
  const pend    = orders.filter(o => o.status === "pendente");
  const rev     = paid.reduce((s, o) => s + Number(o.total), 0);
  const cost    = paid.reduce((s, o) => s + Number(o.cost || 0), 0);
  const profit  = rev - cost;
  const pendAmt = pend.reduce((s, o) => s + Number(o.total), 0);
  const overdueInst = installments.filter(i => isOverdue(i.due_date, i.status));
  const dueSoonInst = installments.filter(i => isDueSoon(i.due_date, i.status));
  const overdueAmt  = overdueInst.reduce((s, i) => s + Number(i.amount), 0);
  const now = new Date();
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const key = d.toISOString().slice(0, 7);
    return { label: d.toLocaleString("pt-BR", { month: "short" }), value: paid.filter(o => o.date?.startsWith(key)).reduce((s, o) => s + Number(o.total), 0) };
  });
  const byBrand = BRANDS.map(b => ({
    ...b, revenue: paid.filter(o => o.brand === b.id).reduce((s, o) => s + Number(o.total), 0),
  })).filter(b => b.revenue > 0).sort((a, z) => z.revenue - a.revenue);

  return (
    <div>
      <div className="mb-5 relative px-5 pt-12 pb-8 md:pt-6 md:rounded-2xl overflow-hidden" style={{ background: "linear-gradient(135deg, #E91E8C 0%, #9C27B0 100%)" }}>
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/10" />
        <div className="absolute top-4 -right-4 w-24 h-24 rounded-full bg-white/10" />
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-1.5 mb-1"><Sparkles size={13} className="text-rose-200" /><span className="text-rose-200 text-xs font-medium">Bem-vinda de volta!</span></div>
            <h1 className="text-white font-bold text-2xl">Olá, {user?.user_metadata?.name?.split(" ")[0] || "Revendedora"} ✨</h1>
            <p className="text-rose-200 text-sm mt-0.5">{now.toLocaleString("pt-BR", { month: "long", year: "numeric" })}</p>
          </div>
          <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-4 border border-white/20 md:min-w-60">
            <p className="text-rose-100 text-xs font-medium">Receita total (pago)</p>
            <p className="text-white text-3xl font-bold mt-1">{fmt(rev)}</p>
            {profit > 0 && <p className="text-green-300 text-xs mt-1 font-medium flex items-center gap-1"><TrendingUp size={11} /> Lucro: {fmt(profit)}</p>}
          </div>
        </div>
      </div>

      <div className="px-4 md:px-0 md:mt-4 space-y-4 pb-6">
        {overdueInst.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
            <AlertTriangle size={16} className="text-red-500 mt-0.5 shrink-0" />
            <p className="text-sm font-semibold text-red-700">🚨 {overdueInst.length} parcela(s) atrasada(s) — {fmt(overdueAmt)} em atraso</p>
          </div>
        )}
        {dueSoonInst.length > 0 && overdueInst.length === 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 flex items-center gap-2.5">
            <Clock size={14} className="text-amber-500 shrink-0" />
            <p className="text-xs text-amber-700 font-semibold">{dueSoonInst.length} parcela(s) vencendo nos próximos 3 dias!</p>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <KpiCard label="Lucro estimado" value={fmt(profit)} sub={`Margem ${rev > 0 ? ((profit/rev)*100).toFixed(0) : 0}%`} color="#9C27B0" Icon={TrendingUp} />
          <KpiCard label="Clientes ativas" value={String(clients.length)} sub={`${clients.filter(c => orders.some(o => o.client_id === c.id && o.status === "pendente")).length} com fiado`} color="#E91E8C" Icon={Users} />
          <KpiCard label="A receber" value={fmt(pendAmt)} sub={`${pend.length} pedidos`} color="#F59E0B" Icon={AlertCircle} />
          <KpiCard label="Total pedidos" value={String(orders.length)} sub={`${paid.length} pagos`} color="#10B981" Icon={ShoppingBag} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {months.some(m => m.value > 0) && (
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-rose-50">
              <h3 className="font-semibold text-gray-800 mb-0.5">Receita mensal</h3>
              <p className="text-xs text-gray-400 mb-4">Últimos 6 meses</p>
              <MiniBarChart data={months} />
            </div>
          )}
          {byBrand.length > 0 && (
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-rose-50">
              <h3 className="font-semibold text-gray-800 mb-3">Receita por Marca</h3>
              {byBrand.map(b => {
                const pct = byBrand[0].revenue ? (b.revenue / byBrand[0].revenue) * 100 : 0;
                return (
                  <div key={b.id} className="mb-3 last:mb-0">
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="flex items-center gap-2"><BrandChip brandId={b.id} short /><span className="text-gray-700">{b.name}</span></span>
                      <span className="font-semibold text-gray-800">{fmt(b.revenue)}</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: b.color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-rose-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-rose-50">
            <h3 className="font-semibold text-gray-800">Pedidos Recentes</h3>
          </div>
          {orders.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-10">Nenhum pedido ainda.</p>
          ) : (
            <div className="divide-y divide-rose-50">
              {orders.slice(0, 6).map(o => {
                const b = BRAND_MAP[o.brand];
                return (
                  <div key={o.id} className="flex items-center gap-3 px-4 py-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-[9px] font-extrabold shrink-0" style={{ background: b?.light || "#fce7f3", color: b?.color || "#E91E8C" }}>{b?.short || "—"}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{o.product || "Pedido"}</p>
                      <p className="text-xs text-gray-400">{o.client_name}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-gray-800">{fmt(o.total)}</p>
                      <StatusBadge status={o.status} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}