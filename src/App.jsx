import { useState } from "react";
import supabase from "./lib/supabase";

// Hooks
import { useAuth }         from "./hooks/useAuth";
import { useClients }      from "./hooks/useClients";
import { useOrders }       from "./hooks/useOrders";
import { useStock }        from "./hooks/useStock";
import { useInstallments } from "./hooks/useInstallments";

// Pages
import Dashboard from "./pages/Dashboard";
import Clients   from "./pages/Clients";
import Orders    from "./pages/Orders";
import Debts     from "./pages/Debts";
import Stock     from "./pages/Stock";
import Finance   from "./pages/Finance";
import Catalog     from "./pages/Catalog";
import ImportNota  from "./pages/ImportNota";

// Components
import LoginScreen        from "./components/LoginScreen";
import NotificationsPanel from "./components/NotificationsPanel";

// Constants & helpers
import { NAV_ITEMS, isOverdue, isDueSoon } from "./data/constants";

import { Sparkles, Bell, AlertTriangle, LogOut, Lock, Eye, EyeOff } from "lucide-react";


// ── RESET PASSWORD SCREEN ─────────────────────────────────────────────────────
function ResetPasswordScreen() {
  const [password, setPass]   = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw]   = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [success, setSuccess] = useState(false);

  const handle = async () => {
    if (password.length < 6) return setError("A senha deve ter pelo menos 6 caracteres.");
    if (password !== confirm) return setError("As senhas não coincidem.");
    setError(""); setLoading(true);
    const { error: e } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (e) return setError(e.message);
    setSuccess(true);
    setTimeout(() => supabase.auth.signOut(), 2500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "linear-gradient(135deg, #fce4ec 0%, #f3e5f5 50%, #ede7f6 100%)", fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
      <div className="relative w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg mx-auto mb-4"
            style={{ background: "linear-gradient(135deg, #E91E8C, #9C27B0)" }}>
            <Sparkles size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold">
            <span style={{ color: "#E91E8C" }}>Bela</span>
            <span className="text-gray-700">Venda</span>
          </h1>
        </div>
        <div className="bg-white rounded-3xl shadow-xl p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-1">Nova senha</h2>
          <p className="text-xs text-gray-400 mb-5">Digite sua nova senha abaixo.</p>
          {success ? (
            <div className="text-center py-4">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                <Lock size={22} className="text-green-500" />
              </div>
              <p className="font-semibold text-gray-800">Senha alterada!</p>
              <p className="text-xs text-gray-400 mt-1">Redirecionando para o login...</p>
            </div>
          ) : (
            <>
              <div className="space-y-3 mb-4">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><Lock size={16} /></span>
                  <input value={password} onChange={e => setPass(e.target.value)}
                    type={showPw ? "text" : "password"} placeholder="Nova senha"
                    className="w-full pl-9 pr-10 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-rose-400 focus:bg-white transition-all" />
                  <button onClick={() => setShowPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><Lock size={16} /></span>
                  <input value={confirm} onChange={e => setConfirm(e.target.value)}
                    type={showPw ? "text" : "password"} placeholder="Confirmar nova senha"
                    onKeyDown={e => e.key === "Enter" && handle()}
                    className="w-full pl-9 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-rose-400 focus:bg-white transition-all" />
                </div>
              </div>
              {error && <p className="text-red-500 text-xs mb-3">{error}</p>}
              <button onClick={handle} disabled={loading}
                className="w-full py-3 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-60"
                style={{ background: "linear-gradient(135deg, #E91E8C, #9C27B0)" }}>
                {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Lock size={16} />}
                Salvar nova senha
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── APP ───────────────────────────────────────────────────────────────────────
export default function App() {
  const { user, loading: authLoading, isRecovery } = useAuth();

  if (authLoading) return (
    <div className="min-h-screen flex items-center justify-center"
      style={{ background: "linear-gradient(135deg, #fce4ec, #f3e5f5)", fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg mx-auto mb-4"
          style={{ background: "linear-gradient(135deg, #E91E8C, #9C27B0)" }}>
          <Sparkles size={28} className="text-white animate-pulse" />
        </div>
        <div className="w-6 h-6 border-2 border-rose-300 border-t-rose-500 rounded-full animate-spin mx-auto" />
      </div>
    </div>
  );

  if (user && isRecovery) return <ResetPasswordScreen />;
  if (!user) return <LoginScreen />;
  return <AppShell user={user} />;
}

// ── APP SHELL ─────────────────────────────────────────────────────────────────
function AppShell({ user }) {
  const [page, setPage]           = useState("dashboard");
  const [showNotif, setShowNotif] = useState(false);

  const { clients, loading: lc, add: addClient, update: updateClient, remove: removeClient } = useClients();
  const { orders,  loading: lo, add: addOrder,  update: updateOrder,  toggleStatus, payAllByClient, remove: removeOrder } = useOrders();
  const { stock,   loading: ls, add: addStock,  update: updateStock,  updateQty, remove: removeStock } = useStock();
  const { installments, payInstallment } = useInstallments();

  const globalLoading = lc && lo && ls;
  const pendingCount  = orders.filter(o => o.status === "pendente").length;
  const overdueCount  = installments.filter(i => isOverdue(i.due_date, i.status)).length;
  const dueSoonCount  = installments.filter(i => isDueSoon(i.due_date, i.status)).length;
  const notifCount    = overdueCount + dueSoonCount;
  const debtBadge     = overdueCount > 0
    ? { count: "!", red: true }
    : pendingCount > 0 ? { count: pendingCount > 9 ? "9+" : pendingCount, red: false }
    : null;

  const userInitial = (user?.user_metadata?.name || user?.email || "B")[0].toUpperCase();

  const pages = {
    dashboard: <Dashboard clients={clients} orders={orders} stock={stock} installments={installments} loading={globalLoading} user={user} />,
    clients:   <Clients   clients={clients} orders={orders} add={addClient} update={updateClient} remove={removeClient} loading={lc} />,
    orders: <Orders orders={orders} clients={clients} add={addOrder} update={updateOrder} toggleStatus={toggleStatus} remove={removeOrder} loading={lo} stock={stock} updateQty={updateQty} />,
    debts:     <Debts     orders={orders} clients={clients} installments={installments} payInstallment={payInstallment} payAllByClient={payAllByClient} toggleStatus={toggleStatus} />,
    stock:     <Stock     stock={stock} add={addStock} update={updateStock} updateQty={updateQty} remove={removeStock} loading={ls} />,
    finance:   <Finance   orders={orders} installments={installments} payInstallment={payInstallment} loading={lo} />,
    catalog:   <Catalog />,
    import:    <ImportNota addStock={addStock} updateStock={updateStock} stock={stock} addOrder={addOrder} clients={clients} />,
  };

  return (
    <div className="min-h-screen md:flex overflow-x-hidden"
      style={{ background: "#FFF5F8", fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>

      {/* SIDEBAR */}
      <aside className="hidden md:flex flex-col w-56 shrink-0 fixed left-0 top-0 h-screen z-40 bg-white border-r border-rose-100 shadow-sm">
        <div className="flex items-center gap-2.5 px-5 py-5 border-b border-rose-50">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center shadow-sm"
            style={{ background: "linear-gradient(135deg, #E91E8C, #9C27B0)" }}>
            <Sparkles size={15} className="text-white" />
          </div>
          <div>
            <span className="text-base font-bold" style={{ color: "#E91E8C" }}>Bela</span>
            <span className="text-base font-bold text-gray-700">Venda</span>
          </div>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(({ id, label, Icon }) => {
            const active = page === id;
            const isDebt = id === "debts";
            return (
              <button key={id} onClick={() => setPage(id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 ${active ? "text-white shadow-sm" : "text-gray-500 hover:bg-rose-50 hover:text-rose-500"}`}
                style={active ? { background: "linear-gradient(135deg, #E91E8C, #9C27B0)" } : {}}>
                <Icon size={18} strokeWidth={active ? 2.5 : 1.8} />
                <span className="font-medium">{label}</span>
                {isDebt && debtBadge && (
                  <span className="ml-auto text-[9px] min-w-[18px] h-[18px] rounded-full flex items-center justify-center font-bold px-1 shrink-0"
                    style={{ background: debtBadge.red ? "#ef4444" : active ? "rgba(255,255,255,0.3)" : "#fce7f3", color: active || debtBadge.red ? "#fff" : "#E91E8C" }}>
                    {debtBadge.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="px-4 py-4 border-t border-rose-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
              style={{ background: "linear-gradient(135deg, #E91E8C, #9C27B0)" }}>
              {userInitial}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-700 truncate">{user?.user_metadata?.name || "Revendedora"}</p>
              <p className="text-[10px] text-gray-400 truncate">{user?.email}</p>
            </div>
            <button onClick={() => supabase.auth.signOut()} title="Sair"
              className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-400 transition-colors shrink-0">
              <LogOut size={13} />
            </button>
          </div>
        </div>
      </aside>

      {/* TOP BAR */}
      <div className="hidden md:flex fixed top-0 left-56 right-0 h-14 z-30 items-center justify-between px-6 bg-white/90 backdrop-blur-sm border-b border-rose-100 shadow-sm">
        <div>
          <h2 className="text-sm font-bold text-gray-800">{NAV_ITEMS.find(n => n.id === page)?.label}</h2>
          <p className="text-xs text-gray-400 capitalize">
            {new Date().toLocaleString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {overdueCount > 0 && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-1.5">
              <AlertTriangle size={13} className="text-red-500" />
              <span className="text-red-600 text-xs font-bold">{overdueCount} parcela(s) atrasada(s)</span>
            </div>
          )}
          <button onClick={() => setShowNotif(true)} className="w-9 h-9 rounded-full bg-rose-50 flex items-center justify-center relative">
            <Bell size={17} className="text-rose-400" />
            {notifCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
                {notifCount > 9 ? "9+" : notifCount}
              </span>
            )}
          </button>
          <button onClick={() => supabase.auth.signOut()} title={`Sair · ${user?.email}`}
            className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold"
            style={{ background: "linear-gradient(135deg, #E91E8C, #9C27B0)" }}>
            {userInitial}
          </button>
        </div>
      </div>

      {/* MAIN */}
      <main className="w-full min-w-0 md:ml-56 md:mt-14 min-h-screen pb-20 md:pb-0 overflow-x-hidden">
        <div className="w-full md:px-6 md:py-5">
          {pages[page]}
        </div>
      </main>

      {/* BOTTOM NAV */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-sm border-t border-rose-100 shadow-lg">
        <div className="flex">
          {NAV_ITEMS.map(({ id, label, Icon }) => {
            const active = page === id;
            const isDebt = id === "debts";
            return (
              <button key={id} onClick={() => setPage(id)} className="flex-1 flex flex-col items-center py-2 gap-0.5 relative">
                <Icon size={18} strokeWidth={active ? 2.5 : 1.8} style={{ color: active ? "#E91E8C" : "#9ca3af" }} />
                <span className="text-[7px] font-bold uppercase tracking-wide leading-none"
                  style={{ color: active ? "#E91E8C" : "#9ca3af" }}>{label}</span>
                {isDebt && debtBadge && (
                  <span className="absolute top-1 right-0.5 text-white text-[8px] min-w-[14px] h-[14px] rounded-full flex items-center justify-center font-bold px-0.5"
                    style={{ background: debtBadge.red ? "#ef4444" : "#E91E8C" }}>{debtBadge.count}</span>
                )}
                {active && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full" style={{ background: "#E91E8C" }} />}
              </button>
            );
          })}
        </div>
      </nav>

      {showNotif && (
        <NotificationsPanel installments={installments} orders={orders} onClose={() => setShowNotif(false)} />
      )}
    </div>
  );
}