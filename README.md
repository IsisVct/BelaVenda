<div align="center">

<br>

<img src="https://img.shields.io/badge/-✨_BelaVenda-E91E8C?style=for-the-badge&labelColor=9C27B0&color=E91E8C" height="40"/>

### Sistema de gestão para revendedoras de cosméticos
**Vendas · Estoque · Financeiro — tudo em um só lugar**

<br>

[![Ver demo](https://img.shields.io/badge/Ver_demo_ao_vivo-E91E8C?style=for-the-badge&logo=vercel&logoColor=white)](https://bela-venda.vercel.app)
[![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/IsisVct/BelaVenda)

<br>

![React](https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat-square&logo=supabase&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000?style=flat-square&logo=vercel&logoColor=white)

</div>

---

## 📸 Screenshots

| Dashboard | Pedidos |
|-----------|---------|
| <img width="1280" height="1024" alt="bela_venda_dashboardd" src="https://github.com/user-attachments/assets/4ce292c3-bd5b-422b-bb55-9ac937323a1f" />| <img width="1280" height="1024" alt="bela_vendas_pedidos" src="https://github.com/user-attachments/assets/acb72448-c4a2-48bf-9e2f-7d7561b07324" />|

| Estoque | Importar Nota Fiscal |
|---------|---------------------|
| <img width="1280" height="1024" alt="bela_venda_estoque" src="https://github.com/user-attachments/assets/50fcc838-b29a-4863-a855-02145beeba3e" />| <img width="1280" height="1024" alt="bela_venda_importar_nota" src="https://github.com/user-attachments/assets/5d419191-a030-40f2-aa42-16e4fd72f3c6" />|

---

## ✨ Funcionalidades

| | Funcionalidade | Descrição |
|---|---|---|
| 📊 | **Dashboard** | Receita, lucro estimado, gráfico mensal e receita por marca |
| 🛍️ | **Pedidos** | Autocomplete do estoque, custo automático e desconto de quantidade ao salvar |
| 📦 | **Estoque** | Produtos por marca com controle de quantidade e margem |
| 💸 | **Fiado** | Parcelas, datas de vencimento e alertas de atraso |
| 💰 | **Financeiro** | Resumo de receitas, custos e lucro por período |
| 📚 | **Catálogo** | ~3.800 produtos do Boticário, Avon, Natura e Eudora |
| 📄 | **Importar Nota Fiscal** | Lê DANFE em PDF e atualiza o estoque automaticamente — sem backend |

---


## 💡 Destaques técnicos

**Parser de DANFE client-side**
Lê PDFs de nota fiscal via PDF.js diretamente no browser, sem backend. Trata UUIDs partidos entre linhas, cabeçalhos de página repetidos e variações de formatação da DANFE.

**RLS + trigger automático no Supabase**
Isolamento total de dados por usuária via Row Level Security, com trigger que preenche `user_id` automaticamente em todos os inserts.

**Autocomplete inteligente**
Busca em ~3.800 produtos do catálogo priorizando itens em estoque, com badge de quantidade disponível e preenchimento automático de custo ao selecionar.

**Recuperação de senha**
Fluxo completo via evento `PASSWORD_RECOVERY` do Supabase Auth, com tela dedicada e redirect automático após atualização.

---

## 🚀 Como rodar localmente

```bash
git clone https://github.com/IsisVct/BelaVenda.git
cd BelaVenda
npm install
cp .env.example .env
npm run dev
```

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-anon-key
```

---

## 📁 Estrutura

```
src/
├── App.jsx                  # Shell principal + auth + recuperação de senha
├── constants.js             # Marcas, navegação e helpers
├── lib/supabase.js
├── data/constants.js
├── hooks/
│   ├── useAuth.js
│   ├── useClients.js
│   ├── useOrders.js
│   ├── useStock.js
│   ├── useInstallments.js
│   └── useProducts.js
├── pages/
│   ├── Dashboard.jsx
│   ├── Clients.jsx
│   ├── Orders.jsx
│   ├── Debts.jsx
│   ├── Stock.jsx
│   ├── Finance.jsx
│   ├── Catalog.jsx
│   └── ImportNota.jsx       # Parser DANFE + integração Supabase
└── components/
    ├── ui.jsx
    ├── LoginScreen.jsx
    ├── ProductAutocomplete.jsx
    ├── ItemsEditor.jsx
    ├── InstallmentsEditor.jsx
    ├── generateFinancePDF.js
    └── NotificationsPanel.jsx
    
```

---

<div align="center">

Desenvolvido por **[Isis](https://github.com/IsisVct)** &nbsp;·&nbsp; [bela-venda.vercel.app](https://bela-venda.vercel.app)

</div>
