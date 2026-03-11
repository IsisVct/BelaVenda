import { useState, useRef } from "react";
import { BRANDS, BRAND_MAP, fmt, today } from "../constants";
import { Toast, useToast, inp, Field } from "../components/ui";
import {
  Upload, FileText, Sparkles, Check, X, Trash2, Plus,
  Package, AlertTriangle, ShoppingBag, ChevronRight,
} from "lucide-react";

export default function ImportNota({ addStock, updateStock, stock, addOrder, clients }) {
  const [stage, setStage]       = useState("idle");
  const [items, setItems]       = useState([]);
  const [brand, setBrand]       = useState("");
  const [clientId, setClientId] = useState("");
  const [date, setDate]         = useState(today());
  const [error, setError]       = useState("");
  const [fileName, setFileName] = useState("");
  const { toast, show }         = useToast();
  const inputRef                = useRef();

  const processFile = async (file) => {
    setError("");
    setFileName(file.name || "nota");
    setStage("uploading");

    try {
      const isImage = file.type.startsWith("image/");
      const isPDF   = file.type === "application/pdf";
      if (!isImage && !isPDF) throw new Error("Use uma imagem (JPG, PNG) ou PDF.");

      const base64 = await new Promise((res, rej) => {
        const r = new FileReader();
        r.onload  = () => res(r.result.split(",")[1]);
        r.onerror = () => rej(new Error("Erro ao ler arquivo"));
        r.readAsDataURL(file);
      });

      const contentBlock = isPDF
        ? { type: "document", source: { type: "base64", media_type: "application/pdf", data: base64 } }
        : { type: "image",    source: { type: "base64", media_type: file.type,           data: base64 } };

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{
            role: "user",
            content: [
              contentBlock,
              {
                type: "text",
                text: `Analise esta nota fiscal de cosméticos e extraia os produtos.
Retorne SOMENTE JSON válido, sem markdown, sem texto extra:
{
  "brand": "avon" ou "natura" ou "boticario" ou "eudora" ou "abelha" ou "",
  "items": [
    { "name": "nome limpo do produto sem código", "qty": número inteiro, "cost": preço unitário decimal }
  ]
}`,
              },
            ],
          }],
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || "Erro na IA");

      const text   = data.content.find(b => b.type === "text")?.text || "";
      const clean  = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);

      if (!parsed.items?.length) throw new Error("Nenhum produto encontrado na nota.");

      setItems(parsed.items.map((it, i) => ({
        id: i, name: it.name || "", qty: Number(it.qty) || 1,
        cost: Number(it.cost) || 0, sale_price: "", include: true,
      })));

      if (parsed.brand) setBrand(parsed.brand);
      setStage("reviewing");

    } catch (e) {
      setError(e.message || "Erro ao processar nota.");
      setStage("idle");
    }
  };

  const onDrop = (e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) processFile(f); };
  const onPick = (e) => { const f = e.target.files[0]; if (f) processFile(f); };

  const updateItem = (id, field, val) =>
    setItems(p => p.map(it => it.id === id ? { ...it, [field]: val } : it));
  const removeItem = (id) => setItems(p => p.filter(it => it.id !== id));
  const addItem = () => setItems(p => [...p, { id: Date.now(), name: "", qty: 1, cost: 0, sale_price: "", include: true }]);

  const save = async () => {
    const selected = items.filter(it => it.include && it.name.trim());
    if (!selected.length) return show("Selecione ao menos um produto.", "error");
    setStage("saving");

    for (const it of selected) {
      const existing = stock.find(s =>
        s.name.toLowerCase().trim() === it.name.toLowerCase().trim() && s.brand === brand
      );
      if (existing) {
        await updateStock(existing.id, {
          name: existing.name, brand: existing.brand,
          qty: String(existing.qty + it.qty),
          costPrice: String(it.cost),
          salePrice: String(it.sale_price || existing.sale_price || ""),
          notes: existing.notes || "",
        });
      } else {
        await addStock({ name: it.name, brand, qty: String(it.qty), costPrice: String(it.cost), salePrice: String(it.sale_price || ""), notes: "" });
      }
    }

    if (clientId) {
      const client = clients.find(c => c.id === clientId);
      await addOrder(
        { clientId, date, status: "pendente", notes: `Nota: ${fileName}` },
        client?.name || "",
        selected.map(it => ({ product: it.name, brand, qty: it.qty, unit_price: it.sale_price || it.cost, cost: it.cost })),
        []
      );
    }

    setStage("done");
    show(`${selected.length} produtos importados! ✅`);
  };

  const reset = () => { setStage("idle"); setItems([]); setBrand(""); setClientId(""); setError(""); setFileName(""); setDate(today()); };

  const selectedCount = items.filter(it => it.include).length;
  const totalCost     = items.filter(it => it.include).reduce((s, it) => s + it.qty * Number(it.cost), 0);

  return (
    <div>
      <Toast msg={toast?.msg} type={toast?.type} />

      <div className="relative px-5 pt-12 pb-5 md:pt-5 md:rounded-2xl overflow-hidden"
        style={{ background: "linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)" }}>
        <div className="absolute -top-8 -right-8 w-36 h-36 rounded-full bg-white/10" />
        <div className="relative">
          <h1 className="text-white font-bold text-2xl">Importar Nota</h1>
          <p className="text-indigo-200 text-sm">IA lê a nota e atualiza seu estoque</p>
        </div>
      </div>

      <div className="px-4 md:px-0 pt-4 pb-28 md:pb-10 space-y-4">

        {/* IDLE */}
        {stage === "idle" && (
          <>
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3">
                <AlertTriangle size={16} className="text-red-500 shrink-0" />
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}
            <div onDrop={onDrop} onDragOver={e => e.preventDefault()} onClick={() => inputRef.current?.click()}
              className="border-2 border-dashed border-indigo-200 rounded-3xl bg-indigo-50/50 p-12 text-center cursor-pointer hover:bg-indigo-50 hover:border-indigo-400 transition-all">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ background: "linear-gradient(135deg, #6366F1, #8B5CF6)" }}>
                <Upload size={28} className="text-white" />
              </div>
              <p className="font-bold text-gray-700 text-lg">Arraste a nota aqui</p>
              <p className="text-gray-400 text-sm mt-1">ou clique para selecionar</p>
              <p className="text-xs text-gray-300 mt-3">JPG, PNG ou PDF</p>
            </div>
            <input ref={inputRef} type="file" accept="image/*,application/pdf" className="hidden" onChange={onPick} />
          </>
        )}

        {/* UPLOADING */}
        {stage === "uploading" && (
          <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-indigo-100">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: "linear-gradient(135deg, #6366F1, #8B5CF6)" }}>
              <Sparkles size={24} className="text-white animate-pulse" />
            </div>
            <p className="font-bold text-gray-700">Analisando nota fiscal...</p>
            <p className="text-gray-400 text-sm mt-1">A IA está lendo os produtos 🔍</p>
            <div className="flex justify-center mt-5">
              <div className="w-6 h-6 border-2 border-indigo-200 border-t-indigo-500 rounded-full animate-spin" />
            </div>
          </div>
        )}

        {/* REVIEWING */}
        {stage === "reviewing" && (
          <>
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-indigo-100">
              <p className="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-3">Informações da Nota</p>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Marca">
                  <select className={inp} value={brand} onChange={e => setBrand(e.target.value)}>
                    <option value="">Selecionar...</option>
                    {BRANDS.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </Field>
                <Field label="Data da nota">
                  <input type="date" className={inp} value={date} onChange={e => setDate(e.target.value)} />
                </Field>
              </div>
              <Field label="Criar pedido para cliente (opcional)">
                <select className={inp} value={clientId} onChange={e => setClientId(e.target.value)}>
                  <option value="">Só atualizar estoque</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </Field>
            </div>

            <div className="flex items-center justify-between bg-indigo-50 rounded-2xl px-4 py-3 border border-indigo-100">
              <div className="flex items-center gap-2">
                <FileText size={16} className="text-indigo-500" />
                <span className="text-sm font-semibold text-indigo-700 truncate max-w-[180px]">{fileName}</span>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs text-indigo-400">{selectedCount} selecionados · custo total</p>
                <p className="font-bold text-indigo-700">{fmt(totalCost)}</p>
              </div>
            </div>

            <div className="space-y-2">
              {items.map(it => (
                <div key={it.id} className={`bg-white rounded-2xl border p-4 transition-all ${it.include ? "border-indigo-100 shadow-sm" : "border-gray-100 opacity-50"}`}>
                  <div className="flex items-start gap-3">
                    <button onClick={() => updateItem(it.id, "include", !it.include)}
                      className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${it.include ? "border-indigo-500 bg-indigo-500" : "border-gray-300"}`}>
                      {it.include && <Check size={12} className="text-white" />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <input value={it.name} onChange={e => updateItem(it.id, "name", e.target.value)}
                        className="w-full text-sm font-semibold text-gray-800 bg-transparent outline-none border-b border-transparent hover:border-indigo-200 focus:border-indigo-400 pb-0.5 mb-2" />
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="text-[9px] text-gray-400 font-bold uppercase">Qtd</label>
                          <input type="number" min="1" value={it.qty} onChange={e => updateItem(it.id, "qty", Number(e.target.value))}
                            className={inp + " mt-0.5 py-1.5 text-xs"} />
                        </div>
                        <div>
                          <label className="text-[9px] text-gray-400 font-bold uppercase">Custo unit.</label>
                          <input type="number" step="0.01" value={it.cost} onChange={e => updateItem(it.id, "cost", e.target.value)}
                            className={inp + " mt-0.5 py-1.5 text-xs"} />
                        </div>
                        <div>
                          <label className="text-[9px] text-gray-400 font-bold uppercase">Preço venda</label>
                          <input type="number" step="0.01" value={it.sale_price} placeholder="—"
                            onChange={e => updateItem(it.id, "sale_price", e.target.value)}
                            className={inp + " mt-0.5 py-1.5 text-xs"} />
                        </div>
                      </div>
                    </div>
                    <button onClick={() => removeItem(it.id)} className="text-gray-300 hover:text-red-400 transition-colors shrink-0 mt-0.5">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button onClick={addItem}
              className="w-full py-3 rounded-2xl border-2 border-dashed border-indigo-200 text-indigo-400 text-sm font-semibold flex items-center justify-center gap-2 hover:border-indigo-400 hover:text-indigo-600 transition-all">
              <Plus size={16} /> Adicionar produto manualmente
            </button>

            <div className="flex gap-3 pt-2">
              <button onClick={reset} className="flex-1 py-3 rounded-2xl bg-gray-100 text-gray-600 text-sm font-semibold flex items-center justify-center gap-2">
                <X size={16} /> Cancelar
              </button>
              <button onClick={save} disabled={selectedCount === 0}
                className="flex-[2] py-3 rounded-2xl text-white text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                style={{ background: "linear-gradient(135deg, #6366F1, #8B5CF6)" }}>
                <Package size={16} />
                Salvar {selectedCount} produto{selectedCount !== 1 ? "s" : ""}
                {clientId && <><ChevronRight size={13} /><ShoppingBag size={13} /></>}
              </button>
            </div>
          </>
        )}

        {/* SAVING */}
        {stage === "saving" && (
          <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-indigo-100">
            <div className="w-6 h-6 border-2 border-indigo-200 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4" />
            <p className="font-bold text-gray-700">Salvando no estoque...</p>
          </div>
        )}

        {/* DONE */}
        {stage === "done" && (
          <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-green-100">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <Check size={32} className="text-green-500" />
            </div>
            <p className="font-bold text-gray-800 text-lg">Nota importada!</p>
            <p className="text-gray-400 text-sm mt-1">Estoque atualizado com sucesso.</p>
            {clientId && <p className="text-indigo-500 text-sm mt-1 font-semibold">Pedido criado! ✅</p>}
            <button onClick={reset} className="mt-6 px-6 py-3 rounded-2xl text-white text-sm font-semibold"
              style={{ background: "linear-gradient(135deg, #6366F1, #8B5CF6)" }}>
              Importar outra nota
            </button>
          </div>
        )}
      </div>
    </div>
  );
}