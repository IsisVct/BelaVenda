import { useState, useEffect, useCallback } from "react";
import supabase from "../lib/supabase";

export function useClients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const { data } = await supabase.from("clients").select("*").order("name");
    setClients(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const add = async (form) => {
    const { data, error } = await supabase
      .from("clients")
      .insert([{ name: form.name, phone: form.phone, city: form.city, brand: form.brand, notes: form.notes }])
      .select().single();
    if (!error) setClients((p) => [...p, data].sort((a, b) => a.name.localeCompare(b.name)));
    return { data, error };
  };

  const update = async (id, form) => {
    const { data, error } = await supabase
      .from("clients")
      .update({ name: form.name, phone: form.phone, city: form.city, brand: form.brand, notes: form.notes })
      .eq("id", id).select().single();
    if (!error) setClients((p) => p.map((c) => c.id === id ? data : c).sort((a, b) => a.name.localeCompare(b.name)));
    return { data, error };
  };

  const remove = async (id) => {
    const { error } = await supabase.from("clients").delete().eq("id", id);
    if (!error) setClients((p) => p.filter((c) => c.id !== id));
    return { error };
  };

  return { clients, loading, add, update, remove };
}