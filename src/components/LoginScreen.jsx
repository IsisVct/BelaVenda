import { useState } from "react";
import supabase from "../lib/supabase";
import { Sparkles, AlertTriangle, Check, LogIn, Mail, Lock, Eye, EyeOff, Users } from "lucide-react";

export default function LoginScreen() {
  const [mode, setMode]       = useState("login"); // login | register | reset
  const [email, setEmail]     = useState("");
  const [password, setPass]   = useState("");
  const [name, setName]       = useState("");
  const [showPw, setShowPw]   = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [success, setSuccess] = useState("");

  const handle = async () => {
    setError(""); setSuccess(""); setLoading(true);
    try {
      if (mode === "reset") {
        const { error: e } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.href });
        if (e) throw e;
        setSuccess("Email de recuperação enviado! Verifique sua caixa de entrada.");
      } else if (mode === "register") {
        const { error: e } = await supabase.auth.signUp({ email, password, options: { data: { name } } });
        if (e) throw e;
        setSuccess("Conta criada! Verifique seu email para confirmar o cadastro.");
      } else {
        const { error: e } = await supabase.auth.signInWithPassword({ email, password });
        if (e) throw e;
      }
    } catch (e) {
      const msgs = {
        "Invalid login credentials":                 "Email ou senha incorretos.",
        "Email not confirmed":                       "Confirme seu email antes de entrar.",
        "User already registered":                   "Este email já está cadastrado.",
        "Password should be at least 6 characters": "A senha deve ter pelo menos 6 caracteres.",
      };
      setError(msgs[e.message] || e.message);
    }
    setLoading(false);
  };

  const titles    = { login: "Entrar", register: "Criar conta", reset: "Recuperar senha" };
  const btnLabels = { login: "Entrar", register: "Criar conta", reset: "Enviar email" };
  const change    = (m) => { setMode(m); setError(""); setSuccess(""); };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative"
      style={{ background: "linear-gradient(135deg, #fce4ec 0%, #f3e5f5 50%, #ede7f6 100%)", fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-20" style={{ background: "radial-gradient(circle, #E91E8C, transparent)" }} />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full opacity-20" style={{ background: "radial-gradient(circle, #9C27B0, transparent)" }} />
      </div>

      <div className="relative w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg mx-auto mb-4"
            style={{ background: "linear-gradient(135deg, #E91E8C, #9C27B0)" }}>
            <Sparkles size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold">
            <span style={{ color: "#E91E8C" }}>Bela</span>
            <span className="text-gray-700">Venda</span>
          </h1>
          <p className="text-gray-500 text-sm mt-1">Gestão para revendedoras</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-5">{titles[mode]}</h2>

          <div className="space-y-3">
            {mode === "register" && (
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><Users size={16} /></span>
                <input value={name} onChange={e => setName(e.target.value)} placeholder="Seu nome completo"
                  className="w-full pl-9 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-rose-400 focus:bg-white transition-all" />
              </div>
            )}
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><Mail size={16} /></span>
              <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="Seu email"
                onKeyDown={e => e.key === "Enter" && handle()}
                className="w-full pl-9 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-rose-400 focus:bg-white transition-all" />
            </div>
            {mode !== "reset" && (
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><Lock size={16} /></span>
                <input value={password} onChange={e => setPass(e.target.value)} type={showPw ? "text" : "password"} placeholder="Senha"
                  onKeyDown={e => e.key === "Enter" && handle()}
                  className="w-full pl-9 pr-10 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-rose-400 focus:bg-white transition-all" />
                <button onClick={() => setShowPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            )}
          </div>

          {error && (
            <div className="mt-3 flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5">
              <AlertTriangle size={14} className="text-red-500 shrink-0" />
              <p className="text-red-600 text-xs">{error}</p>
            </div>
          )}
          {success && (
            <div className="mt-3 flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-3 py-2.5">
              <Check size={14} className="text-green-500 shrink-0" />
              <p className="text-green-700 text-xs">{success}</p>
            </div>
          )}

          <button onClick={handle} disabled={loading}
            className="mt-4 w-full py-3 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-60"
            style={{ background: "linear-gradient(135deg, #E91E8C, #9C27B0)" }}>
            {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <LogIn size={16} />}
            {btnLabels[mode]}
          </button>

          <div className="mt-4 space-y-2 text-center">
            {mode === "login" && (
              <>
                <button onClick={() => change("reset")} className="text-xs text-gray-400 hover:text-rose-500 transition-colors block w-full">
                  Esqueci minha senha
                </button>
                <p className="text-xs text-gray-400">
                  Não tem conta?{" "}
                  <button onClick={() => change("register")} className="font-semibold" style={{ color: "#E91E8C" }}>Criar conta</button>
                </p>
              </>
            )}
            {(mode === "register" || mode === "reset") && (
              <button onClick={() => change("login")} className="text-xs text-gray-400 hover:text-rose-500 transition-colors">
                ← Voltar para login
              </button>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">BelaVenda · Gestão de Revendas</p>
      </div>
    </div>
  );
}