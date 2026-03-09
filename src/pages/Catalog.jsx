import { useState, useMemo } from "react";
import { BRANDS, BRAND_MAP } from "../constants";
import { useProducts } from "../hooks/useProducts";
import { Package, Search, BookOpen, ChevronLeft, ChevronRight } from "lucide-react";

// ── CATALOG ───────────────────────────────────────────────────────────────────
export default function Catalog() {
  const { products } = useProducts();
  const [brandFilter, setBrandFilter] = useState(BRANDS[0].id);
  const [search, setSearch] = useState("");
  const [pg, setPg] = useState(0);
  const PER_PAGE = 30;

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return products.filter(p => p.brand === brandFilter && (!q || p.name.toLowerCase().includes(q)));
  }, [products, brandFilter, search]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const slice = filtered.slice(pg * PER_PAGE, (pg + 1) * PER_PAGE);
  const brand = BRAND_MAP[brandFilter];

  const changeBrand = (id) => { setBrandFilter(id); setSearch(""); setPg(0); };

  return (
    <div>
      <div className="relative px-5 pt-12 pb-5 md:pt-5 md:rounded-2xl overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${brand?.color || "#E91E8C"}, ${brand?.color || "#9C27B0"}99)` }}>
        <div className="absolute -top-8 -right-8 w-36 h-36 rounded-full bg-white/10" />
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 className="text-white font-bold text-2xl">Catálogo</h1>
            <p className="text-white/70 text-sm">{filtered.length} produtos · {brand?.name}</p>
          </div>
          <div className="relative md:w-72">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" />
            <input value={search} onChange={e => { setSearch(e.target.value); setPg(0); }} placeholder="Buscar produto..."
              className="w-full bg-white/20 border border-white/30 rounded-xl pl-9 pr-4 py-2.5 text-white placeholder-white/50 text-sm outline-none" />
          </div>
        </div>
      </div>

      <div className="px-4 md:px-0 py-4 space-y-4 pb-10">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {BRANDS.map(b => (
            <button key={b.id} onClick={() => changeBrand(b.id)}
              className="shrink-0 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all"
              style={brandFilter===b.id ? { background:b.color, color:"#fff" } : { background:"#fff", color:"#6b7280", border:`1px solid ${b.light}` }}>
              {b.name}
            </button>
          ))}
        </div>

        {products.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen size={48} className="mx-auto text-gray-200 mb-3" />
            <p className="text-gray-500 font-semibold">Carregando catálogo...</p>
            <p className="text-gray-400 text-sm mt-1">1.915 produtos das marcas cadastradas.</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20"><Search size={40} className="mx-auto text-gray-200 mb-2" /><p className="text-gray-400 text-sm">Nenhum produto encontrado.</p></div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5">
              {slice.map((p, i) => (
                <div key={i} className="bg-white rounded-2xl p-3.5 shadow-sm border hover:shadow-md transition-shadow" style={{ borderColor: brand?.light || "#fce7f3" }}>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: brand?.light }}>
                      <Package size={15} style={{ color: brand?.color }} />
                    </div>
                    <p className="text-sm font-medium text-gray-800 leading-snug line-clamp-2">{p.name}</p>
                  </div>
                </div>
              ))}
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 pt-2">
                <button onClick={() => setPg(p => Math.max(0, p-1))} disabled={pg===0}
                  className="w-9 h-9 rounded-xl bg-white border border-rose-100 flex items-center justify-center disabled:opacity-40">
                  <ChevronLeft size={16} className="text-rose-500" />
                </button>
                <span className="text-sm text-gray-500 font-medium">{pg+1} / {totalPages}</span>
                <button onClick={() => setPg(p => Math.min(totalPages-1, p+1))} disabled={pg===totalPages-1}
                  className="w-9 h-9 rounded-xl bg-white border border-rose-100 flex items-center justify-center disabled:opacity-40">
                  <ChevronRight size={16} className="text-rose-500" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}