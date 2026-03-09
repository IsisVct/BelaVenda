// Arquivo: src/data/constants.js

export const BRANDS = [
  { id: "boticario", name: "O Boticário", short: "BOT", color: "#6B2D8B", light: "#f3e8ff", emoji: "💜" },
  { id: "avon",      name: "Avon",        short: "AVN", color: "#E21C24", light: "#fee2e2", emoji: "❤️" },
  { id: "natura",    name: "Natura",      short: "NAT", color: "#00A651", light: "#dcfce7", emoji: "💚" },
  { id: "eudora",    name: "Eudora",      short: "EUD", color: "#B8860B", light: "#fef9c3", emoji: "💛" },
  { id: "abelha",    name: "Abelha Rainha", short: "ABR", color: "#E65100", light: "#ffedd5", emoji: "🧡" },
];

export const BRAND_MAP = Object.fromEntries(BRANDS.map((b) => [b.id, b]));

export const NAV = [
  { id: "dashboard", label: "Início",     icon: "⊞",  grad: "135deg, #E91E8C, #9C27B0" },
  { id: "clients",   label: "Clientes",   icon: "👥",  grad: "135deg, #9C27B0, #E91E8C" },
  { id: "orders",    label: "Pedidos",    icon: "🛍️", grad: "135deg, #E91E8C, #C2185B" },
  { id: "debts",     label: "Fiado",      icon: "📋",  grad: "135deg, #F59E0B, #EF4444" },
  { id: "stock",     label: "Estoque",    icon: "📦",  grad: "135deg, #00A651, #059669" },
  { id: "finance",   label: "Financeiro", icon: "💰",  grad: "135deg, #9C27B0, #7B1FA2" },
];