import { useState, useRef } from "react";
import { BRANDS, fmt, today } from "../constants";
import { Toast, useToast, inp, Field } from "../components/ui";
import {
  Upload, FileText, Check, X, Trash2, Plus,
  Package, AlertTriangle, ShoppingBag, ChevronRight,
} from "lucide-react";

// ── Detectar marca pelo texto ─────────────────────────────────────────────────
function detectBrand(text) {
  const t = text.toUpperCase();
  if (t.includes("BOTICARIO") || t.includes("BOTICÁRIO")) return "boticario";
  if (t.includes("NATURA COSMETICOS") || t.includes("NATURA COSMÉTICOS")) return "natura";
  if (t.includes("AVON"))   return "avon";
  if (t.includes("EUDORA")) return "eudora";
  return "";
}

// ── Extrair produtos do texto da NF ──────────────────────────────────────────
function extractItems(text) {

  const items = [];
  text = text.replace(/Nº:\s*\d+\s*Série:.*?CÓD\. PROD\.\s*DESCRIÇÃO DO PRODUTO \/ SERVIÇO/gi, "CÓD. PROD. DESCRIÇÃO DO PRODUTO / SERVIÇO");
  // remove cabeçalhos de páginas intermediárias da DANFE
text = text.replace(
  /Nº:\s*\d+\s*Série:.*?Consulta de autenticidade.*?Protocolo de autorização.*?Nosso Pedido nº.*?CÓD\. PROD\./gis,
  "CÓD. PROD."
);
// ── corta cabeçalho da DANFE ──
  const start = text.indexOf("CÓD. PROD.");
  if (start !== -1) {
    text = text.slice(start);
  }
  const end = text.indexOf("DADOS ADICIONAIS");
  if (end !== -1) {
    text = text.slice(0, end);
  }
  // remove a linha do cabeçalho da tabela
  text = text.replace(
    /CÓD\.\s*PROD\.\s*DESCRIÇÃO\s*DO\s*PRODUTO\s*\/\s*SERVIÇO.*?ALIQ\.\s*IPI/gi,
    ""
  );
  // ── Normaliza o texto ─────────────────────
  let flat = text
  .replace(/\r/g, "")

  // remove UUID
  .replace(/[A-F0-9]{8}-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{12}/gi, "")

  // remove restos de UUID quebrado
  .replace(/[A-F0-9]{8}-[A-F0-9]{4}-[A-F0-9]{4}-/gi, "")
  .replace(/-[A-F0-9]{4}-[A-F0-9]{12}/gi, "")

  // junta linhas
  .replace(/\n/g, " ")

  // limpa espaços
  .replace(/\s{2,}/g, " ")
  .trim();
// remove possíveis pedaços de cabeçalho restantes
flat = flat.replace(/Nº:\s*\d+\s*Série:[^0-9]+/gi, "");
  // ── Regex de produto da DANFE ─────────────
  const re =
    /(\d{5,6})\s+(.+?)\s+(\d{4}\.\d{2}\.\d{2}[\w.]*)\s+\d+\s+\d+\s+(PEC|UN|PCT|CX)\s+(\d+)\s+([\d,]+)/gi;

  let m;

  while ((m = re.exec(flat)) !== null) {

      // DEPOIS:
    let name = m[2].trim();
    name = name.replace(/^\d{5,6}\s*/, "");
    // remove fragmento de UUID partido que ficou no nome
    name = name.replace(/\s+[A-F0-9]{8}-\s*[A-F0-9]{4}-[A-F0-9]{0,4}\s*$/i, "").trim();
    name = name.replace(/\s+[A-F0-9]{8}-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{8,12}\s*$/i, "").trim();

    const qty = parseInt(m[5]);
    const cost = parseFloat(m[6].replace(",", "."));

    if (!name) continue;

    // ignora catálogos
    if (/CATALOGO/i.test(name)) continue;

    if (qty > 0 && cost > 0) {

      items.push({
        id: items.length,
        name,
        qty,
        cost,
        sale_price: "",
        include: true
      });

    }

  }

  return items;
}

// ── FUNÇÃO QUE INTERPRETA UM PRODUTO ─────────────────────
function parseProduct(text) {

  if (!text) return null;

  // ignora linhas que não são produto
  if (/CATALOGO|RECEBEMOS|CHAVE DE|CÓD\. PROD/i.test(text)) return null;

  const match = text.match(
    /^\d{5,6}\s+(.+?)\s+(\d{4}\.\d{2}\.\d{2}[\w.]*)\s+\d+\s+\d+\s+(PEC|UN|PCT|CX)\s+(\d+)\s+([\d,]+)/
  );

  if (!match) return null;

  let name = match[1].trim();

  const qty = parseInt(match[4]);
  const cost = parseFloat(match[5].replace(",", "."));

  if (!name || name.length < 3) return null;
  if (!qty || !cost) return null;

  return {
    name,
    qty,
    cost
  };

}

// ── Carregar PDF.js do CDN ────────────────────────────────────────────────────
function loadPdfJs() {
  return new Promise((resolve, reject) => {
    if (window.pdfjsLib) return resolve(window.pdfjsLib);
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
    script.onload = () => {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc =
        "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
      resolve(window.pdfjsLib);
    };
    script.onerror = () => reject(new Error("Falha ao carregar PDF.js"));
    document.head.appendChild(script);
  });
}

// ── Extrair texto de todas as páginas do PDF ──────────────────────────────────
async function extractPdfText(file) {
  const pdfjsLib = await loadPdfJs();
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let fullText = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    // Preservar quebras de linha usando o campo hasEOL ou variação de Y
    let lastY = null;
    let pageLine = "";
    for (const item of content.items) {
      const y = item.transform ? Math.round(item.transform[5]) : null;
      if (lastY !== null && y !== null && Math.abs(y - lastY) > 2) {
        fullText += pageLine.trim() + "\n";
        pageLine = "";
      }
      pageLine += item.str + " ";
      lastY = y;
    }
    if (pageLine.trim()) fullText += pageLine.trim() + "\n";
  }
  return fullText;
}

// ── COMPONENTE PRINCIPAL ──────────────────────────────────────────────────────
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
      if (file.type !== "application/pdf")
        throw new Error("Por enquanto só PDF é suportado.");

      const text = await extractPdfText(file);
      const extracted = extractItems(text);
      const detectedBrand = detectBrand(text);

      if (!extracted.length)
        throw new Error("Nenhum produto encontrado. Verifique se o PDF é uma nota fiscal válida.");

      setItems(extracted);
      if (detectedBrand) setBrand(detectedBrand);
      setStage("reviewing");

    } catch (e) {
      setError(e.message || "Erro ao processar PDF.");
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
    // após o loop de addStock/updateStock, adiciona:
    const productUpserts = selected.map(it => ({
      name: it.name,
      brand: brand,
    }));

    await supabase
      .from("products")
      .upsert(productUpserts, { onConflict: "name,brand", ignoreDuplicates: true });

    setStage("done");
    show(`${selected.length} produtos importados! ✅`);
  };

  const reset = () => {
    setStage("idle"); setItems([]); setBrand(""); setClientId(""); setError(""); setFileName(""); setDate(today());
  };

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
          <p className="text-indigo-200 text-sm">PDF da nota fiscal → estoque automático</p>
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
              <p className="font-bold text-gray-700 text-lg">Arraste o PDF aqui</p>
              <p className="text-gray-400 text-sm mt-1">ou clique para selecionar</p>
              <p className="text-xs text-gray-300 mt-3">Apenas PDF</p>
            </div>
            <input ref={inputRef} type="file" accept="application/pdf" className="hidden" onChange={onPick} />
          </>
        )}

        {/* UPLOADING */}
        {stage === "uploading" && (
          <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-indigo-100">
            <div className="w-6 h-6 border-2 border-indigo-200 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4" />
            <p className="font-bold text-gray-700">Lendo a nota fiscal...</p>
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
                <p className="text-xs text-indigo-400">{selectedCount} selecionados · custo</p>
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