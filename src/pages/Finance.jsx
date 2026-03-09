import { useState } from "react";
import { fmt, ptDate, BRANDS, BRAND_MAP, isOverdue } from "../constants";
import { Spinner, KpiCard, MiniBarChart, BrandChip } from "../components/ui";
import { generateFinancePDF } from "../components/generateFinancePDF";
import { DollarSign, TrendingUp, BarChart2, Percent, FileText, Check, ArrowRight } from "lucide-react";

// ── FINANCE ───────────────────────────────────────────────────────────────────
export default function Finance({ orders, installments, payInstallment, loading }) {
  const [period, setPeriod] = useState("mes");
  if (loading) return <Spinner />;

  const now = new Date();
  const currentMonth = now.toISOString().slice(0, 7);

  const inPeriod = orders.filter(o => {
    if (!o.date) return false;
    if (period === "mes") return o.date.slice(0, 7) === currentMonth;
    if (period === "3m") { const cutoff = new Date(now.getFullYear(), now.getMonth() - 2, 1); return new Date(o.date + "T00:00:00") >= cutoff; }
    return true;
  });
  const paidInPeriod = inPeriod.filter(o => o.status === "pago");
  const pendInPeriod = inPeriod.filter(o => o.status === "pendente");
  const periodRev    = paidInPeriod.reduce((s, o) => s + Number(o.total), 0);
  const periodCost   = paidInPeriod.reduce((s, o) => s + Number(o.cost || 0), 0);
  const periodProfit = periodRev - periodCost;
  const periodMargin = periodRev > 0 ? ((periodProfit/periodRev)*100).toFixed(1) : "0";
  const periodPend   = pendInPeriod.reduce((s, o) => s + Number(o.total), 0);

  const allPaid  = orders.filter(o => o.status === "pago");
  const totalRev = allPaid.reduce((s, o) => s + Number(o.total), 0);
  const totalCost = allPaid.reduce((s, o) => s + Number(o.cost || 0), 0);
  const totalProfit = totalRev - totalCost;
  const totalPend = orders.filter(o => o.status === "pendente").reduce((s, o) => s + Number(o.total), 0);

  const byBrand = BRANDS.map(b => {
    const bo  = paidInPeriod.filter(o => o.brand === b.id);
    const rev = bo.reduce((s, o) => s + Number(o.total), 0);
    const co  = bo.reduce((s, o) => s + Number(o.cost || 0), 0);
    return { ...b, revenue: rev, profit: rev - co, count: bo.length };
  }).filter(b => b.count > 0).sort((a, z) => z.revenue - a.revenue);

  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const key = d.toISOString().slice(0, 7);
    return { label: d.toLocaleString("pt-BR", { month: "short" }), value: allPaid.filter(o => o.date?.startsWith(key)).reduce((s, o) => s + Number(o.total), 0) };
  });

  const LABELS = { mes: "Este mês", "3m": "3 meses", todos: "Tudo" };

  // Parcelas pendentes
  const pendInst   = (installments || []).filter(i => i.status === "pendente");
  const overdueInst = pendInst.filter(i => isOverdue(i.due_date, i.status));
  const upcomingInst = pendInst.filter(i => !isOverdue(i.due_date, i.status))
    .sort((a,b) => a.due_date.localeCompare(b.due_date))
    .slice(0, 10);

  return (
    <div>
      <div className="relative px-5 pt-12 pb-6 md:pt-5 md:rounded-2xl overflow-hidden" style={{ background: "linear-gradient(135deg, #9C27B0 0%, #7B1FA2 100%)" }}>
        <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-white/10" />
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 className="text-white font-bold text-2xl">Financeiro</h1>
            <p className="text-purple-200 text-sm">Visão geral do negócio</p>
          </div>
          <div className="flex gap-2 items-center self-start">
            <div className="flex gap-1 bg-white/10 p-1 rounded-xl">
              {[["mes","Este mês"],["3m","3 meses"],["todos","Tudo"]].map(([v,l]) => (
                <button key={v} onClick={() => setPeriod(v)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap"
                  style={period===v ? { background:"#fff",color:"#9C27B0" } : { color:"#e9d5ff" }}>
                  {l}
                </button>
              ))}
            </div>
            <button onClick={() => generateFinancePDF(orders)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/20 text-white text-xs font-semibold hover:bg-white/30 border border-white/30 whitespace-nowrap">
              <FileText size={14} /> PDF
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-0 pt-4 space-y-4 pb-10">
        {/* Resumo do período */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-rose-50">
          <p className="text-xs font-bold text-purple-500 uppercase tracking-widest mb-3">{LABELS[period]}</p>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <p className="text-[10px] text-gray-400 font-medium">Receita paga</p>
              <p className="text-xl font-bold text-gray-800 mt-0.5">{fmt(periodRev)}</p>
            </div>
            <div className="text-center border-x border-rose-50">
              <p className="text-[10px] text-gray-400 font-medium">Lucro</p>
              <p className="text-xl font-bold text-purple-600 mt-0.5">{fmt(periodProfit)}</p>
              <p className="text-[10px] text-green-500 font-semibold">margem {periodMargin}%</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-gray-400 font-medium">A receber</p>
              <p className="text-xl font-bold text-amber-500 mt-0.5">{fmt(periodPend)}</p>
            </div>
          </div>
        </div>

        {/* Acumulado */}
        <div>
          <p className="text-xs text-gray-400 font-semibold uppercase tracking-widest mb-2">Acumulado total</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <KpiCard label="Receita total" value={fmt(totalRev)} sub="Pedidos pagos" color="#E91E8C" Icon={DollarSign} />
            <KpiCard label="Lucro total" value={fmt(totalProfit)} sub={`Margem ${totalRev > 0 ? ((totalProfit/totalRev)*100).toFixed(0) : 0}%`} color="#10B981" Icon={TrendingUp} />
            <KpiCard label="Custo total" value={fmt(totalCost)} sub="Valor de aquisição" color="#F59E0B" Icon={BarChart2} />
            <KpiCard label="Fiado total" value={fmt(totalPend)} sub="Ainda a receber" color="#9C27B0" Icon={Percent} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-rose-50">
            <h3 className="font-semibold text-gray-800 mb-0.5">Evolução mensal</h3>
            <p className="text-xs text-gray-400 mb-4">Receita paga · últimos 6 meses</p>
            {months.some(m => m.value > 0) ? <MiniBarChart data={months.map((m,i) => ({ ...m, color: i===months.length-1 ? "#9C27B0" : undefined }))} /> : <p className="text-center text-gray-400 text-sm py-8">Sem pedidos pagos ainda.</p>}
          </div>
          {byBrand.length > 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-rose-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-rose-50 flex justify-between items-center">
                <h3 className="font-semibold text-gray-800">Por Marca</h3>
                <span className="text-xs text-gray-400">{LABELS[period]}</span>
              </div>
              <div className="divide-y divide-rose-50">
                {byBrand.map(b => {
                  const marg = b.revenue > 0 ? ((b.profit/b.revenue)*100).toFixed(0) : 0;
                  const maxRev = byBrand[0]?.revenue || 1;
                  return (
                    <div key={b.id} className="flex items-center gap-3 px-4 py-3">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center text-[9px] font-extrabold shrink-0" style={{ background:b.light, color:b.color }}>{b.short}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800">{b.name}</p>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mt-1">
                          <div className="h-full rounded-full" style={{ width:`${(b.revenue/maxRev)*100}%`, background:b.color }} />
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold text-gray-800">{fmt(b.revenue)}</p>
                        <p className="text-xs" style={{ color:b.color }}>lucro {marg}%</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : <div className="bg-white rounded-2xl shadow-sm border border-rose-50 flex items-center justify-center p-8 text-gray-400 text-sm">Sem dados pagos neste período.</div>}
        </div>

        {/* ── PARCELAS ── */}
        {pendInst.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-rose-50 overflow-hidden">
            <div className="px-4 py-3 border-b border-rose-50 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-800">Parcelas a Receber</h3>
                <p className="text-xs text-gray-400 mt-0.5">{pendInst.length} parcela(s) · {fmt(pendInst.reduce((s,i)=>s+Number(i.amount),0))}</p>
              </div>
              {overdueInst.length > 0 && (
                <span className="flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 border border-red-200 px-2.5 py-1 rounded-full">
                  <AlertTriangle size={11} /> {overdueInst.length} atrasada(s)
                </span>
              )}
            </div>
            <div className="divide-y divide-rose-50">
              {[...overdueInst, ...upcomingInst].map(inst => {
                const order = orders.find(o => o.id === inst.order_id);
                const ov = isOverdue(inst.due_date, inst.status);
                return (
                  <div key={inst.id} className="flex items-center gap-3 px-4 py-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{order?.client_name || "—"}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Parcela {inst.number} · vence {ptDate(inst.due_date)}
                        {ov && <span className="text-red-500 font-semibold ml-1">· ATRASADA</span>}
                      </p>
                    </div>
                    <div className="text-right shrink-0 mr-2">
                      <p className="text-sm font-bold" style={{ color: ov ? "#ef4444" : "#374151" }}>{fmt(inst.amount)}</p>
                    </div>
                    <button
                      onClick={() => payInstallment(inst.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-white text-xs font-semibold shrink-0"
                      style={{ background: "linear-gradient(135deg, #E91E8C, #9C27B0)" }}>
                      <Check size={11} /> Pagar
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}