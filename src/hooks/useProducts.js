import { useState, useEffect } from "react";
import supabase from "../lib/supabase";

export function useProducts() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    async function fetchAll() {
      const PAGE = 1000;
      let all = [], from = 0, done = false;

      while (!done) {
        const { data, error } = await supabase
          .from("products")
          .select("name,brand")
          .order("name")
          .range(from, from + PAGE - 1);

        if (error || !data || data.length === 0) { done = true; break; }
        all = [...all, ...data];
        if (data.length < PAGE) done = true;
        else from += PAGE;
      }

      setProducts(all);
    }
    fetchAll();
  }, []);

  return { products };
}