import { useState } from "react";
import { fmt, today, addMonths, ptDate } from "../constants";
import { inp } from "./ui";

export function InstallmentsEditor({ total, installments, setInstallments }) {
  const [numParcelas, setNumParcelas] = useState(1);
  const [firstDate, setFirstDate] = useState(today());
  const generate = () => {
    if (!total || total <= 0) return;
    const amount = Number((total / numParcelas).toFixed(2));
    setInstallments(Array.from({ length: numParcelas }, (_, i) => ({
      due_date: addMonths(firstDate, i),
      amount: i === numParcelas - 1 ? Number((total - amount * (numParcelas - 1)).toFixed(2)) : amount,
    })));
  };
  return (
    <div className="mb-4">
      <label className="block text-xs font-semibold text-gray-500 mb-2">Parcelamento</label>
      <div className="border border-rose-100 rounded-xl p-3 bg-rose-50/30">
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div>
            <label className="text-[9px] text-gray-400 font-bold uppercase">Nº parcelas</label>
            <input type="number" min="1" max="24" className={inp + " mt-0.5"} value={numParcelas} onChange={(e) => setNumParcelas(Number(e.target.value))} />
          </div>
          <div>
            <label className="text-[9px] text-gray-400 font-bold uppercase">1ª parcela</label>
            <input type="date" className={inp + " mt-0.5"} value={firstDate} onChange={(e) => setFirstDate(e.target.value)} />
          </div>
        </div>
        <button onClick={generate} className="w-full text-xs text-white py-2 rounded-xl font-semibold"
          style={{ background: "linear-gradient(135deg, #E91E8C, #9C27B0)" }}>
          Gerar parcelas {total > 0 ? `(${fmt(total)})` : ""}
        </button>
        {installments.length > 0 && (
          <div className="mt-3 space-y-1.5">
            {installments.map((inst, i) => (
              <div key={i} className="flex justify-between items-center text-sm bg-white rounded-lg px-3 py-2 border border-rose-100">
                <span className="text-gray-500 text-xs">{i + 1}ª · {ptDate(inst.due_date)}</span>
                <span className="font-semibold text-gray-800">{fmt(inst.amount)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}