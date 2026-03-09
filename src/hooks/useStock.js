import { useState, useEffect, useCallback } from "react";
import supabase from "../lib/supabase";

export function useStock() {
  const [stock, setStock]     = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const { data } = await supabase.from("stock").select("*").order("name");
    setStock(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const add = async (form) => {
    const { data, error } = await supabase
      .from("stock")
      .insert([{
        name: form.name,
        brand: form.brand,
        qty: Number(form.qty || 0),
        cost_price: Number(form.costPrice || 0),
        sale_price: Number(form.salePrice || 0),
        notes: form.notes,
      }]).select().single();
    if (!error) setStock((p) => [...p, data].sort((a, b) => a.name.localeCompare(b.name)));
    return { data, error };
  };

  const update = async (id, form) => {
    const { data, error } = await supabase
      .from("stock")
      .update({
        name: form.name,
        brand: form.brand,
        qty: Number(form.qty || 0),
        cost_price: Number(form.costPrice || 0),
        sale_price: Number(form.salePrice || 0),
        notes: form.notes,
      })
      .eq("id", id).select().single();
    if (!error) setStock((p) => p.map((s) => s.id === id ? data : s).sort((a, b) => a.name.localeCompare(b.name)));
    return { data, error };
  };

  const updateQty = async (id, delta) => {
    const item = stock.find((s) => s.id === id);
    if (!item) return;
    const newQty = Math.max(0, item.qty + delta);
    await supabase.from("stock").update({ qty: newQty }).eq("id", id);
    setStock((p) => p.map((s) => s.id === id ? { ...s, qty: newQty } : s));
  };

  const remove = async (id) => {
    await supabase.from("stock").delete().eq("id", id);
    setStock((p) => p.filter((s) => s.id !== id));
  };

  return { stock, loading, add, update, updateQty, remove };
}