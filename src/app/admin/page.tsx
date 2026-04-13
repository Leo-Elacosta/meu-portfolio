"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2, Save, Loader2, Pencil, X } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  // Estados do formulário
  const [titlePt, setTitlePt] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [descPt, setDescPt] = useState("");
  const [descEn, setDescEn] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [liveUrl, setLiveUrl] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([""]);
  
  // Estados de controle
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // O "Gatilho" para atualizar a lista sem causar problemas de cascata no linter
  const [refreshKey, setRefreshKey] = useState(0);

  // O useEffect reage apenas ao refreshKey. Definimos a busca de dados dentro dele.
  useEffect(() => {
    let isMounted = true;

    const loadProjects = async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false });

      // O isMounted garante que o estado só seja atualizado se o componente ainda existir na tela
      if (isMounted && !error && data) {
        setProjects(data);
      }
    };

    loadProjects();

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [refreshKey]); // Toda vez que refreshKey mudar, ele busca os projetos novamente!

  // Controle de Múltiplas Imagens
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

  // Limpar formulário
  const resetForm = () => {
    setTitlePt(""); setTitleEn(""); setDescPt(""); setDescEn("");
    setGithubUrl(""); setLiveUrl(""); setImageUrls([""]);
    setEditingId(null);
  };

  // Salvar (Criar ou Atualizar)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const validImages = imageUrls.filter(url => url.trim() !== "");
    const projectData = {
      title_pt: titlePt,
      title_en: titleEn,
      description_pt: descPt,
      description_en: descEn,
      image_urls: validImages,
      github_url: githubUrl,
      live_url: liveUrl,
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

    setIsSubmitting(false);

    if (!error) {
      alert(editingId ? "✅ Projeto atualizado com sucesso!" : "✅ Projeto adicionado com sucesso!");
      resetForm();
      setRefreshKey(prev => prev + 1); // Dispara o gatilho para atualizar a lista
    } else {
      alert("❌ Erro ao salvar: " + error.message);
    }
  };

  // Iniciar Edição
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

  // Excluir Projeto
  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Tem certeza que deseja excluir o projeto "${title}"? Esta ação não pode ser desfeita.`)) {
      return;
    }

    const { error } = await supabase.from("projects").delete().eq("id", id);

    if (!error) {
      alert("🗑️ Projeto excluído com sucesso!");
      if (editingId === id) resetForm();
      setRefreshKey(prev => prev + 1); // Dispara o gatilho para atualizar a lista
    } else {
      alert("❌ Erro ao excluir: " + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200 selection:bg-zinc-700 selection:text-white py-12 px-6">
      <div className="max-w-3xl mx-auto">
        
        <div className="mb-10 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center text-zinc-400 hover:text-white transition-colors text-sm font-medium">
            <ArrowLeft className="w-4 h-4 mr-2" /> Voltar ao Portfólio
          </Link>
          <span className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 border border-zinc-800 px-3 py-1 rounded-full bg-zinc-900/50">
            Painel Admin
          </span>
        </div>

        {/* === FORMULÁRIO === */}
        <div className={`bg-zinc-900/40 border transition-colors duration-500 backdrop-blur-md rounded-3xl p-8 md:p-10 shadow-2xl mb-16 ${editingId ? 'border-emerald-500/50 shadow-emerald-900/20' : 'border-zinc-800/60'}`}>
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-white tracking-tight">
              {editingId ? "Editar Projeto" : "Adicionar Novo Projeto"}
            </h1>
            {editingId && (
              <Button type="button" onClick={resetForm} variant="ghost" className="text-zinc-400 hover:text-white hover:bg-zinc-800">
                <X className="w-4 h-4 mr-2" /> Cancelar Edição
              </Button>
            )}
          </div>
          
          <form onSubmit={handleSubmit} className="flex flex-col gap-8">
            
            {/* Títulos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-zinc-400 font-bold ml-1">Título (PT)</label>
                <input
                  type="text"
                  value={titlePt}
                  onChange={(e) => setTitlePt(e.target.value)}
                  placeholder="Ex: Sistema de Vendas"
                  className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-200 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition-all placeholder:text-zinc-600"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-zinc-400 font-bold ml-1">Título (EN)</label>
                <input
                  type="text"
                  value={titleEn}
                  onChange={(e) => setTitleEn(e.target.value)}
                  placeholder="Ex: Sales System"
                  className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-200 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition-all placeholder:text-zinc-600"
                  required
                />
              </div>
            </div>

            {/* Descrições */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-zinc-400 font-bold ml-1">Descrição (PT)</label>
                <textarea
                  value={descPt}
                  onChange={(e) => setDescPt(e.target.value)}
                  placeholder="Explique o projeto detalhadamente..."
                  rows={4}
                  className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-200 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition-all placeholder:text-zinc-600 resize-none"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-zinc-400 font-bold ml-1">Descrição (EN)</label>
                <textarea
                  value={descEn}
                  onChange={(e) => setDescEn(e.target.value)}
                  placeholder="Explain the project in detail..."
                  rows={4}
                  className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-200 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition-all placeholder:text-zinc-600 resize-none"
                  required
                />
              </div>
            </div>

            {/* Links */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-zinc-400 font-bold ml-1">Repositório GitHub</label>
                <input
                  type="url"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  placeholder="https://github.com/..."
                  className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-200 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition-all placeholder:text-zinc-600"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-zinc-400 font-bold ml-1">Projeto em Produção (Live)</label>
                <input
                  type="url"
                  value={liveUrl}
                  onChange={(e) => setLiveUrl(e.target.value)}
                  placeholder="https://meuprojeto.com (opcional)"
                  className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-200 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition-all placeholder:text-zinc-600"
                />
              </div>
            </div>

            {/* Seção de Múltiplas Imagens */}
            <div className="space-y-4 pt-4 border-t border-zinc-800/50">
              <div className="flex items-center justify-between">
                <label className="text-xs uppercase tracking-widest text-zinc-400 font-bold ml-1">Galeria de Imagens (URLs)</label>
                <span className="text-[10px] text-zinc-500 bg-zinc-900 px-2 py-1 rounded-md border border-zinc-800">
                  {imageUrls.length} {imageUrls.length === 1 ? 'imagem' : 'imagens'}
                </span>
              </div>
              
              <div className="space-y-3">
                {imageUrls.map((url, index) => (
                  <div key={index} className="flex gap-3 items-center group">
                    <span className="text-xs font-bold text-zinc-600 w-4">{index + 1}.</span>
                    <input
                      type="url"
                      value={url}
                      onChange={(e) => handleImageChange(index, e.target.value)}
                      placeholder="https://site.com/imagem.jpg"
                      className="flex-grow bg-zinc-950/80 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-zinc-500 transition-all placeholder:text-zinc-700"
                      required={index === 0}
                    />
                    {imageUrls.length > 1 && (
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleRemoveImageField(index)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-950/30 rounded-xl shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              <Button 
                type="button" 
                variant="outline" 
                onClick={handleAddImageField} 
                className="w-full border-dashed border-zinc-700 bg-transparent text-zinc-400 hover:text-white hover:bg-zinc-800 hover:border-zinc-600 rounded-xl py-6 mt-2 transition-all"
              >
                <Plus className="w-4 h-4 mr-2" /> Adicionar nova imagem
              </Button>
            </div>

            {/* Submit */}
            <div className="pt-6">
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className={`w-full text-zinc-950 font-bold py-6 rounded-xl transition-all shadow-lg shadow-white/5 disabled:opacity-50 disabled:cursor-not-allowed ${editingId ? 'bg-emerald-400 hover:bg-emerald-300' : 'bg-zinc-100 hover:bg-white'}`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Salvando...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5 mr-2" /> {editingId ? "Atualizar Projeto" : "Publicar Projeto"}
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>

        {/* === LISTA DE PROJETOS === */}
        <div className="mt-20">
          <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-4">
            Projetos Cadastrados
            <span className="h-[1px] flex-grow bg-gradient-to-r from-zinc-800 to-transparent"></span>
          </h2>
          
          {projects.length === 0 ? (
            <p className="text-zinc-500 text-center py-10 italic bg-zinc-900/20 border border-zinc-800/50 rounded-2xl">
              Nenhum projeto cadastrado ainda.
            </p>
          ) : (
            <div className="space-y-4">
              {projects.map((project) => (
                <div 
                  key={project.id} 
                  className={`flex flex-col md:flex-row md:items-center justify-between p-5 rounded-2xl border transition-all ${editingId === project.id ? 'bg-emerald-950/10 border-emerald-500/30' : 'bg-zinc-900/30 border-zinc-800/60 hover:bg-zinc-900/60 hover:border-zinc-700'}`}
                >
                  <div className="mb-4 md:mb-0">
                    <h3 className="text-lg font-bold text-zinc-100 mb-1">{project.title_pt}</h3>
                    <p className="text-xs font-medium text-zinc-500 tracking-wide">{project.title_en}</p>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Button 
                      type="button"
                      variant="outline" 
                      onClick={() => handleEdit(project)}
                      className={`rounded-lg transition-colors ${editingId === project.id ? 'bg-emerald-900/30 text-emerald-400 border-emerald-800' : 'bg-zinc-950 border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800'}`}
                    >
                      <Pencil className="w-4 h-4 mr-2" /> {editingId === project.id ? 'Editando...' : 'Editar'}
                    </Button>
                    <Button 
                      type="button"
                      variant="destructive" 
                      onClick={() => handleDelete(project.id, project.title_pt)}
                      className="bg-red-950/40 text-red-400 border border-red-900/50 hover:bg-red-900 hover:text-white rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}