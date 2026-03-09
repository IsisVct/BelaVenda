import { fmt, ptDate, isOverdue, isDueSoon } from "../constants";
import { AlertTriangle, Clock, Calendar, Bell, X, Check } from "lucide-react";

export default function NotificationsPanel({ installments, orders, onClose }) {
  const overdue = installments.filter(i => isOverdue(i.due_date, i.status));
  const dueSoon = installments.filter(i => isDueSoon(i.due_date, i.status));
  const getClient = (orderId) => orders.find(o => o.id === orderId)?.client_name || "—";

  return (
    <div className="fixed inset-0 z-50 flex justify-end" style={{ background: "rgba(0,0,0,0.3)" }} onClick={onClose}>
      <div className="bg-white w-full max-w-sm h-full shadow-2xl overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b border-rose-50 px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell size={18} className="text-rose-500" />
            <h2 className="font-bold text-gray-800">Notificações</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center text-rose-400"><X size={15} /></button>
        </div>
        <div className="p-4 space-y-4">
          {overdue.length === 0 && dueSoon.length === 0 && (
            <div className="text-center py-16">
              <Check size={40} className="mx-auto text-green-300 mb-2" />
              <p className="text-gray-500 font-semibold">Tudo em dia!</p>
              <p className="text-xs text-gray-400 mt-1">Nenhuma parcela atrasada ou vencendo em breve.</p>
            </div>
          )}
          {overdue.length > 0 && (
            <div>
              <p className="text-xs font-bold text-red-500 uppercase tracking-widest mb-2 flex items-center gap-1">
                <AlertTriangle size={11} /> {overdue.length} Atrasada(s)
              </p>
              <div className="space-y-2">
                {overdue.map(inst => (
                  <div key={inst.id} className="bg-red-50 border border-red-200 rounded-xl p-3">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-red-700 text-sm">{getClient(inst.order_id)}</p>
                      <span className="font-bold text-red-600">{fmt(inst.amount)}</span>
                    </div>
                    <p className="text-xs text-red-400 mt-0.5 flex items-center gap-1">
                      <Calendar size={10} /> Parcela {inst.number} · venceu {ptDate(inst.due_date)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
          {dueSoon.length > 0 && (
            <div>
              <p className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-2 flex items-center gap-1">
                <Clock size={11} /> {dueSoon.length} Vencendo em breve
              </p>
              <div className="space-y-2">
                {dueSoon.map(inst => {
                  const diff = Math.ceil((new Date(inst.due_date + "T00:00:00") - new Date(new Date().toDateString())) / 86400000);
                  return (
                    <div key={inst.id} className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-amber-700 text-sm">{getClient(inst.order_id)}</p>
                        <span className="font-bold text-amber-600">{fmt(inst.amount)}</span>
                      </div>
                      <p className="text-xs text-amber-500 mt-0.5 flex items-center gap-1">
                        <Calendar size={10} /> Parcela {inst.number} · vence {diff === 0 ? "hoje" : `em ${diff}d`} ({ptDate(inst.due_date)})
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}