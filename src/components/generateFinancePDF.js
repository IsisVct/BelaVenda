import { fmt, ptDate, BRANDS, BRAND_MAP } from "../constants";

export function generateFinancePDF(orders) {
  const now = new Date();
  const paid = orders.filter(o => o.status === "pago");
  const pend = orders.filter(o => o.status === "pendente");
  const totalRev    = paid.reduce((s, o) => s + Number(o.total), 0);
  const totalCost   = paid.reduce((s, o) => s + Number(o.cost || 0), 0);
  const totalProfit = totalRev - totalCost;
  const totalPend   = pend.reduce((s, o) => s + Number(o.total), 0);
  const margin = totalRev > 0 ? ((totalProfit / totalRev) * 100).toFixed(1) : "0";

  const byBrand = BRANDS.map(b => {
    const bo  = paid.filter(o => o.brand === b.id);
    const rev = bo.reduce((s, o) => s + Number(o.total), 0);
    const co  = bo.reduce((s, o) => s + Number(o.cost || 0), 0);
    return { ...b, rev, profit: rev - co, count: bo.length };
  }).filter(b => b.count > 0).sort((a, z) => z.rev - a.rev);

  const rows = [...paid, ...pend].sort((a, b) => (b.date || "").localeCompare(a.date || "")).slice(0, 50);

  const html = `<!DOCTYPE html>
<html lang="pt-BR"><head><meta charset="UTF-8">
<title>Relatório Financeiro BelaVenda</title>
<style>
* { margin:0; padding:0; box-sizing:border-box; }
body { font-family: Arial, sans-serif; font-size: 12px; color: #333; padding: 32px; background: #fff; }
h1 { font-size: 22px; color: #E91E8C; margin-bottom: 4px; }
.sub { color: #888; font-size: 11px; margin-bottom: 24px; }
.kpis { display: grid; grid-template-columns: repeat(4,1fr); gap: 12px; margin-bottom: 24px; }
.kpi { background: #FFF5F8; border: 1px solid #fce7f3; border-radius: 10px; padding: 14px; }
.kpi-label { font-size: 10px; color: #888; text-transform: uppercase; letter-spacing:.05em; }
.kpi-value { font-size: 18px; font-weight: 700; color: #333; margin-top: 4px; }
.kpi-sub { font-size: 10px; color: #aaa; margin-top: 2px; }
h2 { font-size: 14px; font-weight: 700; margin: 20px 0 10px; border-bottom: 2px solid #fce7f3; padding-bottom: 6px; }
table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 11px; }
th { background: #E91E8C; color: #fff; padding: 8px 10px; text-align: left; }
td { padding: 7px 10px; border-bottom: 1px solid #fce7f3; }
tr:nth-child(even) td { background: #FFF5F8; }
.pago { background:#DCFCE7; color:#16A34A; padding:2px 7px; border-radius:20px; font-size:10px; font-weight:700; }
.pend { background:#FEF9C3; color:#CA8A04; padding:2px 7px; border-radius:20px; font-size:10px; font-weight:700; }
.footer { margin-top: 32px; text-align: center; color: #bbb; font-size: 10px; }
@media print { body { padding: 16px; } }
</style></head><body>
<h1>💜 BelaVenda — Relatório Financeiro</h1>
<p class="sub">Gerado em ${now.toLocaleString("pt-BR")} · Todos os pedidos</p>
<div class="kpis">
  <div class="kpi"><div class="kpi-label">Receita total (pago)</div><div class="kpi-value">${fmt(totalRev)}</div></div>
  <div class="kpi"><div class="kpi-label">Lucro total</div><div class="kpi-value">${fmt(totalProfit)}</div><div class="kpi-sub">Margem ${margin}%</div></div>
  <div class="kpi"><div class="kpi-label">Custo total</div><div class="kpi-value">${fmt(totalCost)}</div></div>
  <div class="kpi"><div class="kpi-label">A receber (fiado)</div><div class="kpi-value">${fmt(totalPend)}</div><div class="kpi-sub">${pend.length} pedidos</div></div>
</div>
<h2>Por Marca</h2>
<table>
  <tr><th>Marca</th><th>Pedidos</th><th>Receita</th><th>Custo</th><th>Lucro</th><th>Margem</th></tr>
  ${byBrand.map(b => `<tr>
    <td><strong>${b.name}</strong></td><td>${b.count}</td>
    <td>${fmt(b.rev)}</td><td>${fmt(b.rev - b.profit)}</td>
    <td style="color:#16A34A;font-weight:700">${fmt(b.profit)}</td>
    <td>${b.rev > 0 ? ((b.profit/b.rev)*100).toFixed(0) : 0}%</td>
  </tr>`).join("")}
</table>
<h2>Últimos 50 Pedidos</h2>
<table>
  <tr><th>Data</th><th>Cliente</th><th>Produto</th><th>Marca</th><th>Total</th><th>Lucro</th><th>Status</th></tr>
  ${rows.map(o => {
    const b = BRAND_MAP[o.brand];
    const profit = Number(o.total) - Number(o.cost || 0);
    return `<tr>
      <td>${ptDate(o.date)}</td><td>${o.client_name || "—"}</td>
      <td>${(o.product || "").substring(0, 38)}</td>
      <td>${b?.name || "—"}</td>
      <td style="font-weight:700">${fmt(o.total)}</td>
      <td style="color:#16A34A">${fmt(profit)}</td>
      <td><span class="${o.status === "pago" ? "pago" : "pend"}">${o.status}</span></td>
    </tr>`;
  }).join("")}
</table>
<div class="footer">BelaVenda · ${now.toLocaleDateString("pt-BR")} · Imprima ou salve como PDF (Ctrl+P)</div>
<script>window.onload=()=>window.print();</script>
</body></html>`;

  const blob = new Blob([html], { type: "text/html" });
  window.open(URL.createObjectURL(blob), "_blank");
}