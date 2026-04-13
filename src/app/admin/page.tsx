"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { 
  ArrowLeft, Plus, Trash2, Save, Loader2, Pencil, X, 
  Lock, LogOut 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Session } from "@supabase/supabase-js";

interface Project {
  id: string;
  title_en: string;
  title_pt: string;
  description_en: string;
  description_pt: string;
  image_urls: string[];
  github_url: string;
  live_url: string;
}

export default function AdminPage() {
  const router = useRouter();

  // --- ESTADOS DE AUTENTICAÇÃO ---
  const [session, setSession] = useState<Session | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // --- ESTADOS DO FORMULÁRIO DE PROJETOS ---
  const [titlePt, setTitlePt] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [descPt, setDescPt] = useState("");
  const [descEn, setDescEn] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [liveUrl, setLiveUrl] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([""]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // 1. Verificar Sessão ao Carregar
  useEffect(() => {
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setLoadingAuth(false);
    };

    getInitialSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // 2. Carregar Projetos (apenas se logado)
  useEffect(() => {
    if (!session) return;

    let isMounted = true;
    const loadProjects = async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false });

      if (isMounted && !error && data) {
        setProjects(data);
      }
    };

    loadProjects();
    return () => { isMounted = false; };
  }, [refreshKey, session]);

  // --- FUNÇÕES DE AUTH ---
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError("");

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setLoginError("Acesso negado. Verifique suas credenciais.");
    }
    setIsLoggingIn(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/"); 
  };

  // --- FUNÇÕES DE GERENCIAMENTO (Originais) ---
  const handleAddImageField = () => setImageUrls([...imageUrls, ""]);
  const handleImageChange = (index: number, value: string) => {
    const newUrls = [...imageUrls];
    newUrls[index] = value;
    setImageUrls(newUrls);
  };
  const handleRemoveImageField = (index: number) => {
    const newUrls = imageUrls.filter((_, i) => i !== index);
    setImageUrls(newUrls);
  };

  const resetForm = () => {
    setTitlePt(""); setTitleEn(""); setDescPt(""); setDescEn("");
    setGithubUrl(""); setLiveUrl(""); setImageUrls([""]);
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const validImages = imageUrls.filter(url => url.trim() !== "");
    const projectData = {
      title_pt: titlePt, title_en: titleEn,
      description_pt: descPt, description_en: descEn,
      image_urls: validImages, github_url: githubUrl, live_url: liveUrl,
    };

    let error;
    if (editingId) {
      const { error: updateError } = await supabase.from("projects").update(projectData).eq("id", editingId);
      error = updateError;
    } else {
      const { error: insertError } = await supabase.from("projects").insert([projectData]);
      error = insertError;
    }

    setIsSubmitting(false);
    if (!error) {
      alert("✅ Sucesso!");
      resetForm();
      setRefreshKey(prev => prev + 1);
    } else {
      alert("❌ Erro: " + error.message);
    }
  };

  const handleEdit = (project: Project) => {
    setEditingId(project.id);
    setTitlePt(project.title_pt);
    setTitleEn(project.title_en);
    setDescPt(project.description_pt);
    setDescEn(project.description_en);
    setGithubUrl(project.github_url);
    setLiveUrl(project.live_url || "");
    setImageUrls(project.image_urls?.length > 0 ? project.image_urls : [""]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Excluir "${title}"?`)) return;
    const { error } = await supabase.from("projects").delete().eq("id", id);
    if (!error) {
      setRefreshKey(prev => prev + 1);
    }
  };

  // --- RENDEREIZAÇÃO CONDICIONAL ---

  // 1. Carregando Sessão
  if (loadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <Loader2 className="w-8 h-8 text-zinc-500 animate-spin" />
      </div>
    );
  }

  // 2. Tela de Login (Barreira de Segurança)
  if (!session) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 text-zinc-200">
        <Link href="/" className="absolute top-8 left-8 flex items-center text-xs tracking-widest uppercase font-bold text-zinc-500 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Voltar ao Portfólio
        </Link>
        <div className="w-full max-w-md bg-zinc-900/50 border border-zinc-800 p-8 rounded-3xl backdrop-blur-md">
          <div className="flex flex-col items-center mb-8">
            <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center mb-4">
              <Lock className="w-6 h-6 text-zinc-400" />
            </div>
            <h1 className="text-2xl font-bold text-white">Área Restrita</h1>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input 
              type="email" placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} required
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-zinc-500"
            />
            <input 
              type="password" placeholder="Senha" value={password} onChange={(e) => setPassword(e.target.value)} required
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-zinc-500"
            />
            {loginError && <p className="text-red-400 text-xs text-center font-bold">{loginError}</p>}
            <Button type="submit" disabled={isLoggingIn} className="w-full bg-zinc-100 text-zinc-950 hover:bg-white font-bold h-12 rounded-xl">
              {isLoggingIn ? <Loader2 className="animate-spin" /> : "Acessar Painel"}
            </Button>
          </form>
        </div>
      </div>
    );
  }

  // 3. Painel Admin (Apenas se logado)
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200 selection:bg-zinc-700 selection:text-white py-12 px-6">
      <div className="max-w-3xl mx-auto">
        
        <div className="mb-10 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center text-zinc-400 hover:text-white transition-colors text-sm font-medium">
            <ArrowLeft className="w-4 h-4 mr-2" /> Ver Portfólio
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 border border-zinc-800 px-3 py-1 rounded-full bg-zinc-900/50">
              Admin: {session.user.email}
            </span>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 text-xs font-bold text-red-500 hover:text-red-400 transition-colors uppercase tracking-tighter"
            >
              <LogOut className="w-4 h-4" /> Sair
            </button>
          </div>
        </div>

        {/* === FORMULÁRIO (Seu código original mantido) === */}
        <div className={`bg-zinc-900/40 border transition-colors duration-500 backdrop-blur-md rounded-3xl p-8 md:p-10 shadow-2xl mb-16 ${editingId ? 'border-emerald-500/50 shadow-emerald-900/20' : 'border-zinc-800/60'}`}>
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-white tracking-tight">
              {editingId ? "Editar Projeto" : "Adicionar Novo Projeto"}
            </h1>
            {editingId && (
              <Button type="button" onClick={resetForm} variant="ghost" className="text-zinc-400 hover:text-white hover:bg-zinc-800">
                <X className="w-4 h-4 mr-2" /> Cancelar
              </Button>
            )}
          </div>
          
          <form onSubmit={handleSubmit} className="flex flex-col gap-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-zinc-400 font-bold ml-1">Título (PT)</label>
                <input type="text" value={titlePt} onChange={(e) => setTitlePt(e.target.value)} placeholder="Ex: Sistema de Vendas" className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-200 focus:outline-none focus:border-zinc-500 transition-all" required />
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-zinc-400 font-bold ml-1">Título (EN)</label>
                <input type="text" value={titleEn} onChange={(e) => setTitleEn(e.target.value)} placeholder="Ex: Sales System" className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-200 focus:outline-none focus:border-zinc-500 transition-all" required />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-zinc-400 font-bold ml-1">Descrição (PT)</label>
                <textarea value={descPt} onChange={(e) => setDescPt(e.target.value)} rows={4} className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-200 focus:outline-none focus:border-zinc-500 resize-none" required />
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-zinc-400 font-bold ml-1">Descrição (EN)</label>
                <textarea value={descEn} onChange={(e) => setDescEn(e.target.value)} rows={4} className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-200 focus:outline-none focus:border-zinc-500 resize-none" required />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-zinc-400 font-bold ml-1">GitHub</label>
                <input type="url" value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)} className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-200 focus:outline-none focus:border-zinc-500" required />
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-zinc-400 font-bold ml-1">Live Demo</label>
                <input type="url" value={liveUrl} onChange={(e) => setLiveUrl(e.target.value)} className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-200 focus:outline-none focus:border-zinc-500" />
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-zinc-800/50">
              <label className="text-xs uppercase tracking-widest text-zinc-400 font-bold ml-1">Imagens</label>
              {imageUrls.map((url, index) => (
                <div key={index} className="flex gap-3">
                  <input type="url" value={url} onChange={(e) => handleImageChange(index, e.target.value)} placeholder="URL da Imagem" className="flex-grow bg-zinc-950/80 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm" required={index === 0} />
                  {imageUrls.length > 1 && (
                    <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveImageField(index)} className="text-red-400 hover:bg-red-950/30">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button type="button" variant="outline" onClick={handleAddImageField} className="w-full border-dashed border-zinc-700 bg-transparent text-zinc-400 hover:bg-zinc-800 rounded-xl py-6">
                <Plus className="w-4 h-4 mr-2" /> Adicionar imagem
              </Button>
            </div>

            <Button type="submit" disabled={isSubmitting} className={`w-full text-zinc-950 font-bold py-6 rounded-xl transition-all ${editingId ? 'bg-emerald-400 hover:bg-emerald-300' : 'bg-zinc-100 hover:bg-white'}`}>
              {isSubmitting ? <Loader2 className="animate-spin" /> : <><Save className="w-5 h-5 mr-2" /> {editingId ? "Atualizar" : "Publicar"}</>}
            </Button>
          </form>
        </div>

        {/* === LISTA (Seu código original mantido) === */}
        <div className="mt-20">
          <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-4">Projetos <span className="h-[1px] flex-grow bg-zinc-800"></span></h2>
          <div className="space-y-4">
            {projects.map((project) => (
              <div key={project.id} className={`flex flex-col md:flex-row items-center justify-between p-5 rounded-2xl border ${editingId === project.id ? 'bg-emerald-950/10 border-emerald-500/30' : 'bg-zinc-900/30 border-zinc-800/60'}`}>
                <div>
                  <h3 className="text-lg font-bold text-zinc-100">{project.title_pt}</h3>
                  <p className="text-xs text-zinc-500">{project.title_en}</p>
                </div>
                <div className="flex gap-3 mt-4 md:mt-0">
                  <Button onClick={() => handleEdit(project)} variant="outline" className="rounded-lg bg-zinc-950 border-zinc-700 text-zinc-300">
                    <Pencil className="w-4 h-4 mr-2" /> Editar
                  </Button>
                  <Button onClick={() => handleDelete(project.id, project.title_pt)} variant="destructive" className="bg-red-950/40 text-red-400 border-red-900/50 rounded-lg">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}