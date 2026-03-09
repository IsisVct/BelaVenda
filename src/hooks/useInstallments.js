import { useState, useEffect, useCallback } from "react";
import supabase from "../lib/supabase";

export function useInstallments() {
  const [installments, setInstallments] = useState([]);

  const load = useCallback(async () => {
    const { data } = await supabase.from("installments").select("*").order("due_date");
    setInstallments(data || []);
  }, []);

  useEffect(() => { load(); }, [load]);

  const payInstallment = async (id) => {
    await supabase
      .from("installments")
      .update({ status: "pago", paid_at: new Date().toISOString() })
      .eq("id", id);
    setInstallments((p) => p.map((i) => i.id === id ? { ...i, status: "pago" } : i));
  };

  return { installments, payInstallment };
}