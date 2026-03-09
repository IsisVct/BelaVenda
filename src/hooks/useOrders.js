import { useState, useEffect, useCallback } from "react";
import supabase from "../lib/supabase";

export function useOrders() {
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const { data } = await supabase.from("orders").select("*").order("date", { ascending: false });
    setOrders(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const add = async (form, clientName, items, installmentsList) => {
    const total = items.reduce((s, i) => s + i.qty * Number(i.unit_price), 0);
    const cost  = items.reduce((s, i) => s + i.qty * Number(i.cost || 0), 0);
    const brand = items[0]?.brand || form.brand || "";

    const { data: order, error } = await supabase.from("orders").insert([{
      client_id: form.clientId,
      client_name: clientName,
      brand,
      product: items.map((i) => i.product).join(", "),
      qty: items.reduce((s, i) => s + i.qty, 0),
      total, cost,
      status: form.status,
      date: form.date,
      notes: form.notes,
    }]).select().single();

    if (error) return { error };

    if (items.length > 0)
      await supabase.from("order_items").insert(
        items.map((i) => ({
          order_id: order.id,
          product: i.product,
          brand: i.brand,
          qty: i.qty,
          unit_price: Number(i.unit_price),
          cost: Number(i.cost || 0),
        }))
      );

    if (installmentsList.length > 0)
      await supabase.from("installments").insert(
        installmentsList.map((inst, idx) => ({
          order_id: order.id,
          number: idx + 1,
          due_date: inst.due_date,
          amount: inst.amount,
          status: "pendente",
        }))
      );

    setOrders((p) => [{ ...order, total, cost, brand }, ...p]);
    return { data: order, error: null };
  };

  const update = async (id, fields) => {
    const { data, error } = await supabase.from("orders").update(fields).eq("id", id).select().single();
    if (!error) setOrders((p) => p.map((o) => o.id === id ? { ...o, ...data } : o));
    return { data, error };
  };

  const toggleStatus = async (id, current) => {
    const next = current === "pago" ? "pendente" : "pago";
    await supabase.from("orders").update({ status: next }).eq("id", id);
    setOrders((p) => p.map((o) => o.id === id ? { ...o, status: next } : o));
  };

  const payAllByClient = async (clientId) => {
    await supabase.from("orders").update({ status: "pago" }).eq("client_id", clientId).eq("status", "pendente");
    setOrders((p) => p.map((o) => o.client_id === clientId && o.status === "pendente" ? { ...o, status: "pago" } : o));
  };

  const remove = async (id) => {
    await supabase.from("orders").delete().eq("id", id);
    setOrders((p) => p.filter((o) => o.id !== id));
  };

  return { orders, loading, add, update, toggleStatus, payAllByClient, remove };
}