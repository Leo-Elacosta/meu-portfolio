// src/app/admin/page.tsx
"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Session } from "@supabase/supabase-js";
import Link from "next/link";

export default function AdminPage() {
  // === ESTADOS DE AUTENTICAÇÃO ===
  // O tipo 'any' aqui é um atalho, em produção idealmente usaríamos o tipo Session do Supabase
  const [session, setSession] = useState<Session | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState("");

  // === ESTADOS DO FORMULÁRIO DE PROJETOS ===
  const [titleEn, setTitleEn] = useState("");
  const [titlePt, setTitlePt] = useState("");
  const [descEn, setDescEn] = useState("");
  const [descPt, setDescPt] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [liveUrl, setLiveUrl] = useState("");
  const [status, setStatus] = useState("");

  // Verifica se o usuário já está logado quando a página carrega
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
    });

    // Escuta mudanças no login (ex: quando o usuário faz login ou logout)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Função para fazer o Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setAuthError(error.message);
    }
    setAuthLoading(false);
  };

  // Função para fazer Logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  // Função para salvar o projeto
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("Salvando projeto...");

    const { error } = await supabase.from("projects").insert([
      {
        title_en: titleEn,
        title_pt: titlePt,
        description_en: descEn,
        description_pt: descPt,
        image_url: imageUrl,
        github_url: githubUrl,
        live_url: liveUrl || null, // Se estiver vazio, manda null ao invés de string vazia
      },
    ]);

    if (error) {
      console.error(error);
      setStatus("Erro ao salvar: " + error.message);
    } else {
      setStatus("Projeto adicionado com sucesso! 🎉");
      setTitleEn(""); setTitlePt(""); setDescEn(""); setDescPt("");
      setImageUrl(""); setGithubUrl(""); setLiveUrl("");
    }
  };

  // === TELA DE CARREGAMENTO INICIAL ===
  if (authLoading && !session) {
    return <div className="min-h-screen flex items-center justify-center">Verificando acesso...</div>;
  }

  // === TELA DE LOGIN (Se não houver sessão) ===
  if (!session) {
    return (
      <main className="min-h-screen flex items-center justify-center p-8">
        <div className="bg-zinc-900/80 p-8 rounded-2xl border border-zinc-800 w-full max-w-md">
          <h1 className="text-2xl font-bold mb-6 text-center">Acesso Restrito</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">E-mail</label>
              <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-gray-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">Senha</label>
              <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-gray-400" />
            </div>
            {authError && <p className="text-red-400 text-sm">{authError}</p>}
            <button type="submit" disabled={authLoading}
              className="w-full py-3 bg-white text-black font-medium rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50">
              {authLoading ? "Entrando..." : "Entrar"}
            </button>
          </form>
          <div className="mt-4 text-center">
            <Link href="/" className="text-zinc-500 hover:text-white text-sm transition-colors">Voltar ao Portfólio</Link>
          </div>
        </div>
      </main>
    );
  }

  // === TELA DO PAINEL DE ADMINISTRAÇÃO (Se estiver logado) ===
  return (
    <main className="min-h-screen p-8 md:p-24 max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-8 border-b border-zinc-700 pb-4">
        <h1 className="text-3xl font-bold">Painel de Administração</h1>
        <div className="flex items-center gap-4">
          <Link href="/" className="text-zinc-400 hover:text-white transition-colors text-sm">
            Ver Portfólio
          </Link>
          <button onClick={handleLogout} className="px-4 py-2 bg-red-900/30 text-red-400 rounded-lg hover:bg-red-900/50 transition-colors text-sm">
            Sair
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-zinc-900/50 p-8 rounded-2xl border border-zinc-800">
        {/* Títulos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Título (EN)</label>
            <input required type="text" value={titleEn} onChange={(e) => setTitleEn(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-gray-400" />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Título (PT)</label>
            <input required type="text" value={titlePt} onChange={(e) => setTitlePt(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-gray-400" />
          </div>
        </div>

        {/* Descrições */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Descrição (EN)</label>
            <textarea required value={descEn} onChange={(e) => setDescEn(e.target.value)} rows={3}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-gray-400" />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Descrição (PT)</label>
            <textarea required value={descPt} onChange={(e) => setDescPt(e.target.value)} rows={3}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-gray-400" />
          </div>
        </div>

        {/* Links */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">URL da Imagem</label>
            <input required type="url" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-gray-400" />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">URL do GitHub</label>
            <input required type="url" value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-gray-400" />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">URL do Projeto Online (Opcional)</label>
            <input type="url" value={liveUrl} onChange={(e) => setLiveUrl(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-gray-400" />
          </div>
        </div>

        <div className="flex items-center gap-4 pt-4">
          <button type="submit" className="px-6 py-3 bg-white text-black font-medium rounded-lg hover:bg-gray-200 transition-colors">
            Adicionar Projeto
          </button>
          {status && <span className="text-sm font-medium text-gray-300">{status}</span>}
        </div>
      </form>
    </main>
  );
}