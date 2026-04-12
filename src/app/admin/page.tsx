// src/app/admin/page.tsx
"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Session } from "@supabase/supabase-js";
import Link from "next/link";

interface Project {
  id: string;
  title_en: string;
  title_pt: string;
  description_en: string;
  description_pt: string;
  image_url: string;
  github_url: string;
  live_url: string;
}

export default function AdminPage() {
  // 1. PRIMEIRO: Todos os estados (Memória)
  const [session, setSession] = useState<Session | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState("");

  const [projects, setProjects] = useState<Project[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const [titleEn, setTitleEn] = useState("");
  const [titlePt, setTitlePt] = useState("");
  const [descEn, setDescEn] = useState("");
  const [descPt, setDescPt] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [liveUrl, setLiveUrl] = useState("");
  const [status, setStatus] = useState("");

  // 2. SEGUNDO: Criamos a função de busca ANTES de usá-la no useEffect
  const fetchProjects = async () => {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setProjects(data);
    }
  };

  // 3. TERCEIRO: O useEffect agora pode usar a função com segurança
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
      if (session) fetchProjects();
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchProjects();
    });

    return () => subscription.unsubscribe();
  }, []); // A lista de dependências vazia diz para rodar apenas ao carregar a página

  // 4. QUARTO: Restante das funções
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setAuthError(error.message);
    setAuthLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const resetForm = () => {
    setEditingId(null);
    setTitleEn(""); setTitlePt(""); setDescEn(""); setDescPt("");
    setImageUrl(""); setGithubUrl(""); setLiveUrl("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("Salvando projeto...");

    const projectData = {
      title_en: titleEn,
      title_pt: titlePt,
      description_en: descEn,
      description_pt: descPt,
      image_url: imageUrl,
      github_url: githubUrl,
      live_url: liveUrl || null,
    };

    let error;

    if (editingId) {
      const { error: updateError } = await supabase
        .from("projects")
        .update(projectData)
        .eq("id", editingId);
      error = updateError;
    } else {
      const { error: insertError } = await supabase
        .from("projects")
        .insert([projectData]);
      error = insertError;
    }

    if (error) {
      console.error(error);
      setStatus("Erro ao salvar: " + error.message);
    } else {
      setStatus(editingId ? "Projeto atualizado! 🎉" : "Projeto adicionado! 🎉");
      resetForm();
      fetchProjects();
      setTimeout(() => setStatus(""), 3000);
    }
  };

  const handleEditClick = (project: Project) => {
    setEditingId(project.id);
    setTitleEn(project.title_en);
    setTitlePt(project.title_pt);
    setDescEn(project.description_en);
    setDescPt(project.description_pt);
    setImageUrl(project.image_url || "");
    setGithubUrl(project.github_url || "");
    setLiveUrl(project.live_url || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Tem certeza que deseja excluir este projeto? Esta ação não pode ser desfeita.")) {
      return;
    }
    const { error } = await supabase.from("projects").delete().eq("id", id);
    if (error) {
      alert("Erro ao excluir: " + error.message);
    } else {
      fetchProjects();
      if (editingId === id) resetForm();
    }
  };

  const filteredProjects = projects.filter((project) => 
    project.title_pt.toLowerCase().includes(searchTerm.toLowerCase()) || 
    project.title_en.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // === RENDERIZAÇÃO DA TELA (HTML/JSX) ===

  if (authLoading && !session) return <div className="min-h-screen flex items-center justify-center">Verificando acesso...</div>;

  if (!session) {
    return (
      <main className="min-h-screen flex items-center justify-center p-8">
        <div className="bg-zinc-900/80 p-8 rounded-2xl border border-zinc-800 w-full max-w-md">
          <h1 className="text-2xl font-bold mb-6 text-center">Acesso Restrito</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">E-mail</label>
              <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-gray-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">Senha</label>
              <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-gray-400" />
            </div>
            {authError && <p className="text-red-400 text-sm">{authError}</p>}
            <button type="submit" disabled={authLoading} className="w-full py-3 bg-white text-black font-medium rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50">
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

  return (
    <main className="min-h-screen p-8 md:p-12 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-8 border-b border-zinc-700 pb-4">
        <h1 className="text-3xl font-bold">Painel de Administração</h1>
        <div className="flex items-center gap-4">
          <Link href="/" className="text-zinc-400 hover:text-white transition-colors text-sm">Ver Portfólio</Link>
          <button onClick={handleLogout} className="px-4 py-2 bg-red-900/30 text-red-400 rounded-lg hover:bg-red-900/50 transition-colors text-sm">Sair</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div>
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            {editingId ? "✏️ Editando Projeto" : "✨ Novo Projeto"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-5 bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Título (EN)</label>
                <input required type="text" value={titleEn} onChange={(e) => setTitleEn(e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:border-gray-400 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Título (PT)</label>
                <input required type="text" value={titlePt} onChange={(e) => setTitlePt(e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:border-gray-400 text-sm" />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Descrição (EN)</label>
                <textarea required value={descEn} onChange={(e) => setDescEn(e.target.value)} rows={2} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:border-gray-400 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Descrição (PT)</label>
                <textarea required value={descPt} onChange={(e) => setDescPt(e.target.value)} rows={2} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:border-gray-400 text-sm" />
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">URL da Imagem</label>
                <input required type="url" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:border-gray-400 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">URL do GitHub</label>
                <input required type="url" value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:border-gray-400 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">URL Live (Opcional)</label>
                <input type="url" value={liveUrl} onChange={(e) => setLiveUrl(e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:border-gray-400 text-sm" />
              </div>
            </div>

            <div className="flex items-center gap-4 pt-2">
              <button type="submit" className="px-6 py-2 bg-white text-black font-medium rounded-lg hover:bg-gray-200 transition-colors text-sm">
                {editingId ? "Atualizar Projeto" : "Adicionar"}
              </button>
              {editingId && (
                <button type="button" onClick={resetForm} className="px-4 py-2 bg-transparent text-zinc-400 hover:text-white transition-colors text-sm">
                  Cancelar
                </button>
              )}
              {status && <span className="text-sm text-green-400 font-medium ml-auto">{status}</span>}
            </div>
          </form>
        </div>

        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Seus Projetos</h2>
          </div>

          <div className="mb-6 relative">
            <input 
              type="text" 
              placeholder="🔍 Pesquisar projeto..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-gray-400"
            />
          </div>

          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {filteredProjects.length === 0 ? (
              <p className="text-zinc-500 text-center py-8">Nenhum projeto encontrado.</p>
            ) : (
              filteredProjects.map((project) => (
                <div key={project.id} className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800 flex flex-col sm:flex-row gap-4 items-center sm:items-start justify-between group">
                  <div className="flex gap-4 items-center w-full sm:w-auto">
                    <div className="w-16 h-16 bg-zinc-800 rounded-lg overflow-hidden flex-shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={project.image_url} alt="thumbnail" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{project.title_pt}</h3>
                      <p className="text-xs text-zinc-500">EN: {project.title_en}</p>
                    </div>
                  </div>

                  <div className="flex gap-2 w-full sm:w-auto justify-end">
                    <button 
                      onClick={() => handleEditClick(project)}
                      className="px-3 py-1 bg-zinc-800 text-white rounded hover:bg-zinc-700 transition-colors text-xs font-medium"
                    >
                      Editar
                    </button>
                    <button 
                      onClick={() => handleDelete(project.id)}
                      className="px-3 py-1 bg-red-900/20 text-red-400 rounded hover:bg-red-900/50 transition-colors text-xs font-medium"
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </main>
  );
}