"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowUpRight, Globe, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

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

const dictionaries = {
  pt: {
    back: "Voltar ao Portfólio",
    githubBtn: "Ver Código Fonte",
    liveBtn: "Acessar Projeto",
    galleryTitle: "Galeria do Projeto",
    notFound: "Projeto não encontrado.",
    switchLang: "Português"
  },
  en: {
    back: "Back to Portfolio",
    githubBtn: "View Source Code",
    liveBtn: "Visit Live Project",
    galleryTitle: "Project Gallery",
    notFound: "Project not found.",
    switchLang: "English"
  },
};

const GithubIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.2c3-.3 6-1.5 6-6.5a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 5 3 6.2 6 6.5a4.8 4.8 0 0 0-1 3.2v4" />
  </svg>
);

export default function ProjectPage() {
  const params = useParams();
  const id = params.id as string;
  
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState<"pt" | "en">("pt");
  
  // NOVO: Estado para controlar o Lightbox
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProject() {
      if (!id) return;
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", id)
        .single();

      if (!error && data) setProject(data);
      setLoading(false);
    }
    fetchProject();
  }, [id]);

  // NOVO: Adiciona um listener para fechar o lightbox com a tecla ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedImage(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const t = dictionaries[language];

  return (
    <>
      {/* NOVO: Componente do Lightbox */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8 bg-black/90 backdrop-blur-md cursor-zoom-out"
            onClick={() => setSelectedImage(null)}
          >
            <button
              className="absolute top-6 right-6 p-2 text-zinc-400 hover:text-white bg-black/50 hover:bg-black/80 rounded-full transition-all duration-300 z-[101]"
              onClick={() => setSelectedImage(null)}
            >
              <X className="w-6 h-6" />
            </button>
            <motion.img
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              src={selectedImage}
              alt="Imagem em tela cheia"
              className="max-w-full max-h-[90vh] object-contain rounded-md shadow-2xl cursor-default"
              onClick={(e) => e.stopPropagation()} // Evita que clicar na imagem feche o lightbox
            />
          </motion.div>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes metallic-pan {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-metallic {
          background: linear-gradient(105deg, #000000 0%, #27272a 25%, #09090b 50%, #3f3f46 75%, #000000 100%);
          background-size: 300% 300%;
          animation: metallic-pan 20s ease-in-out infinite;
        }
      `}} />

      <main className="min-h-screen text-zinc-200 antialiased selection:bg-zinc-700 selection:text-white relative z-0">
        <div className="fixed inset-0 w-full h-full animate-metallic -z-20"></div>
        <div className="fixed inset-0 w-full h-full bg-black/40 backdrop-blur-[1px] -z-10"></div>

        <div className="max-w-5xl mx-auto px-6 py-12 md:py-24">
          
          <nav className="flex justify-between items-center mb-16">
            <Link 
              href="/" 
              className="inline-flex items-center text-xs tracking-widest uppercase font-bold text-zinc-400 hover:text-white transition-colors duration-300 group"
            >
              <ArrowLeft className="w-4 h-4 mr-3 group-hover:-translate-x-1 transition-transform" /> 
              {t.back}
            </Link>

            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setLanguage(language === "pt" ? "en" : "pt")}
              className="text-zinc-300 hover:bg-zinc-800/60 hover:text-white transition-colors duration-300 text-xs font-bold backdrop-blur-sm"
            >
              <Globe className="w-3.5 h-3.5 mr-2" /> {t.switchLang}
            </Button>
          </nav>

          {loading ? (
            <div className="space-y-8">
              <Skeleton className="h-16 w-3/4 bg-zinc-800/50 rounded-2xl" />
              <Skeleton className="h-4 w-full bg-zinc-800/50" />
              <Skeleton className="h-4 w-5/6 bg-zinc-800/50" />
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-12">
                <Skeleton className="aspect-video bg-zinc-800/50 rounded-2xl" />
                <Skeleton className="aspect-video bg-zinc-800/50 rounded-2xl" />
                <Skeleton className="aspect-video bg-zinc-800/50 rounded-2xl" />
              </div>
            </div>
          ) : !project ? (
            <div className="text-center py-20">
              <p className="text-zinc-500 font-light italic">{t.notFound}</p>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div 
                key={language}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                <header className="mb-16">
                  <h1 className="text-4xl md:text-5xl font-light tracking-tight text-white mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-zinc-200 to-zinc-400">
                    {language === "pt" ? project.title_pt : project.title_en}
                  </h1>
                  <p className="text-lg text-zinc-400 leading-relaxed font-light mb-10 max-w-3xl">
                    {language === "pt" ? project.description_pt : project.description_en}
                  </p>

                  <div className="flex flex-wrap gap-4">
                    {project.github_url && (
                      <Button asChild className="bg-zinc-100 text-zinc-950 hover:bg-white font-bold rounded-xl px-6">
                        <Link href={project.github_url} target="_blank">
                          <GithubIcon className="w-4 h-4 mr-2" /> {t.githubBtn}
                        </Link>
                      </Button>
                    )}
                    {project.live_url && (
                      <Button asChild variant="outline" className="bg-zinc-900/40 border-zinc-700 text-zinc-200 hover:bg-zinc-800 hover:text-white font-bold rounded-xl px-6 backdrop-blur-md">
                        <Link href={project.live_url} target="_blank">
                          <ArrowUpRight className="w-4 h-4 mr-2" /> {t.liveBtn}
                        </Link>
                      </Button>
                    )}
                  </div>
                </header>

                {project.image_urls && project.image_urls.length > 0 && (
                  <section>
                    <h2 className="text-xs uppercase tracking-[0.3em] text-zinc-500 font-bold mb-8 flex items-center gap-4">
                      {t.galleryTitle}
                      <span className="h-[1px] flex-grow bg-gradient-to-r from-zinc-800 to-transparent"></span>
                    </h2>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                      {project.image_urls.map((url, index) => (
                        <motion.div 
                          key={index}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.1, duration: 0.4 }}
                          // NOVO: Evento de clique para abrir o lightbox
                          onClick={() => setSelectedImage(url)}
                          className="relative aspect-video bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800/60 shadow-lg group cursor-zoom-in"
                        >
                          <img 
                            src={url} 
                            alt={`Galeria ${index + 1}`} 
                            className="object-cover w-full h-full opacity-80 group-hover:opacity-100 transition-all duration-700 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </motion.div>
                      ))}
                    </div>
                  </section>
                )}

              </motion.div>
            </AnimatePresence>
          )}

          <footer className="mt-32 mb-10 text-center">
            <p className="text-[11px] uppercase tracking-[0.5em] text-zinc-600 font-bold">
              L. Lima &bull; {new Date().getFullYear()}
            </p>
          </footer>
        </div>
      </main>
    </>
  );
}