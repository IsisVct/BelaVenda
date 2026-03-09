// ── FORMATTERS ────────────────────────────────────────────────────────────────
export const fmt = (n) =>
  Number(n || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const today = () => new Date().toISOString().slice(0, 10);

export const ptDate = (str) =>
  str ? new Date(str + "T00:00:00").toLocaleDateString("pt-BR") : "";

export const addMonths = (dateStr, n) => {
  const d = new Date(dateStr + "T00:00:00");
  d.setMonth(d.getMonth() + n);
  return d.toISOString().slice(0, 10);
};

export const isOverdue = (due_date, status) => {
  if (status === "pago") return false;
  return new Date(due_date + "T00:00:00") < new Date(new Date().toDateString());
};

export const isDueSoon = (due_date, status, days = 3) => {
  if (status === "pago") return false;
  const d   = new Date(due_date + "T00:00:00");
  const now = new Date(new Date().toDateString());
  const diff = (d - now) / 86400000;
  return diff >= 0 && diff <= days;
};

// ── BRANDS ────────────────────────────────────────────────────────────────────
export const BRANDS = [
  { id: "boticario", name: "O Boticário",  short: "BOT", color: "#6B2D8B", light: "#f3e8ff" },
  { id: "avon",      name: "Avon",          short: "AVN", color: "#E21C24", light: "#fee2e2" },
  { id: "natura",    name: "Natura",        short: "NAT", color: "#00A651", light: "#dcfce7" },
  { id: "eudora",    name: "Eudora",        short: "EUD", color: "#B8860B", light: "#fef9c3" },
  { id: "abelha",    name: "Abelha Rainha", short: "ABR", color: "#E65100", light: "#ffedd5" },
];

export const BRAND_MAP = Object.fromEntries(BRANDS.map((b) => [b.id, b]));

// ── NAV ───────────────────────────────────────────────────────────────────────
import {
  LayoutDashboard, Users, ShoppingBag, AlertCircle, Package, TrendingUp, BookOpen,
} from "lucide-react";

export const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard",  Icon: LayoutDashboard },
  { id: "clients",   label: "Clientes",   Icon: Users           },
  { id: "orders",    label: "Pedidos",    Icon: ShoppingBag     },
  { id: "debts",     label: "Pendentes",      Icon: AlertCircle     },
  { id: "stock",     label: "Estoque",    Icon: Package         },
  { id: "finance",   label: "Financeiro", Icon: TrendingUp      },
  { id: "catalog",   label: "Catálogo",   Icon: BookOpen        },
];