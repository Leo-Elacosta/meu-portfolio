"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useTransition, useSpring, useInView, animated } from "@react-spring/web";
import { ArrowLeft, ArrowUpRight, Globe, X, Code2 } from "lucide-react";
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
    switchLang: "Português",
    portfolio: "Portfolio",
  },
  en: {
    back: "Back to Portfolio",
    githubBtn: "View Source Code",
    liveBtn: "Visit Live Demo",
    galleryTitle: "Project Gallery",
    notFound: "Project not found.",
    switchLang: "English",
    portfolio: "Portfolio",
  },
};

const GithubIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.2c3-.3 6-1.5 6-6.5a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 5 3 6.2 6 6.5a4.8 4.8 0 0 0-1 3.2v4" />
  </svg>
);

// === COMPONENTE: SEÇÃO ANIMADA DIRECIONAL ===
function AnimatedSection({ children, direction, delay = 0, className = "" }: { children: React.ReactNode, direction: "left" | "right" | "up", delay?: number, className?: string }) {
  const [ref, springs] = useInView(
    () => ({
      from: { opacity: 0, x: direction === "left" ? -50 : direction === "right" ? 50 : 0, y: direction === "up" ? 50 : 0 },
      to: { opacity: 1, x: 0, y: 0 },
      config: { tension: 200, friction: 20 },
      delay: delay,
    }),
    { rootMargin: "-10% 0px" }
  );

  return (
    <animated.div ref={ref} style={springs} className={className}>
      {children}
    </animated.div>
  );
}

export default function ProjectPage() {
  const params = useParams();
  const id = params.id as string;
  
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState<"pt" | "en">("pt");
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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedImage(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const t = dictionaries[language];

  // Animação do Lightbox usando React Spring
  const lightboxTransitions = useTransition(selectedImage, {
    from: { opacity: 0, scale: 0.9, y: 20 },
    enter: { opacity: 1, scale: 1, y: 0 },
    leave: { opacity: 0, scale: 0.9, y: 20 },
    config: { tension: 300, friction: 25 }
  });

  // Animação de troca de idioma
  const contentTransitions = useTransition(language, {
    mode: "out-in",
    from: { opacity: 0 },
    enter: { opacity: 1 },
    leave: { opacity: 0 },
    config: { duration: 300 },
  });

  // Animação da Navbar
  const navAnimation = useSpring({
    from: { opacity: 0, y: -20 },
    to: { opacity: 1, y: 0 },
    config: { tension: 280, friction: 20 },
  });

  return (
    <>
      {/* LIGHTBOX */}
      {lightboxTransitions((style, item) => 
        item && (
          <animated.div
            style={{ opacity: style.opacity }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8 bg-black/90 backdrop-blur-md cursor-zoom-out"
            onClick={() => setSelectedImage(null)}
          >
            <button
              className="absolute top-6 right-6 p-2 text-zinc-400 hover:text-white bg-zinc-900/50 hover:bg-zinc-800 rounded-full transition-all duration-300 z-[101] border border-zinc-700/50"
              onClick={() => setSelectedImage(null)}
            >
              <X className="w-6 h-6" />
            </button>
            <animated.img
              style={{ scale: style.scale, y: style.y }}
              src={item}
              alt="Imagem em tela cheia"
              className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl cursor-default border border-zinc-800/50"
              onClick={(e) => e.stopPropagation()}
            />
          </animated.div>
        )
      )}

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

        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 md:py-24 overflow-hidden">
          
          <animated.nav style={navAnimation} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-16 md:mb-24">
            <Link href="/" className="inline-flex items-center text-xs tracking-widest uppercase font-bold text-zinc-400 hover:text-white transition-colors duration-300 group">
              <ArrowLeft className="w-4 h-4 mr-3 group-hover:-translate-x-1 transition-transform" /> 
              {t.back}
            </Link>

            <div className="flex gap-4 items-center w-full sm:w-auto justify-between sm:justify-end">
              <span className="text-xs tracking-[0.3em] uppercase font-bold text-zinc-500 hidden sm:flex items-center gap-2">
                <Code2 className="w-4 h-4" /> {t.portfolio}
              </span>
              <div className="w-[1px] h-4 bg-zinc-700 hidden sm:block"></div>
              <Button variant="ghost" size="sm" onClick={() => setLanguage(language === "pt" ? "en" : "pt")} className="text-zinc-300 hover:bg-zinc-800/60 hover:text-white transition-colors duration-300 text-xs font-bold backdrop-blur-sm">
                <Globe className="w-3.5 h-3.5 mr-2" /> {t.switchLang}
              </Button>
            </div>
          </animated.nav>

          {loading ? (
            <div className="space-y-8">
              <Skeleton className="h-16 w-3/4 bg-zinc-800/50 rounded-2xl" />
              <Skeleton className="h-4 w-full bg-zinc-800/50" />
              <Skeleton className="h-4 w-5/6 bg-zinc-800/50" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 mt-12">
                <Skeleton className="aspect-video bg-zinc-800/50 rounded-2xl" />
                <Skeleton className="aspect-video bg-zinc-800/50 rounded-2xl" />
              </div>
            </div>
          ) : !project ? (
            <div className="text-center py-20">
              <p className="text-zinc-500 font-light italic">{t.notFound}</p>
            </div>
          ) : (
            contentTransitions((style, item) => {
              const currentLang = dictionaries[item];
              return (
                <animated.div style={style}>
                  
                  {/* TÍTULO E DESCRIÇÃO DO PROJETO */}
                  <AnimatedSection direction="left" className="mb-16 md:mb-24">
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tighter text-white mb-6 leading-[1.1]">
                      <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-zinc-200 to-zinc-500">
                        {item === "pt" ? project.title_pt : project.title_en}
                      </span>
                    </h1>
                    <p className="text-base sm:text-lg text-zinc-400 max-w-2xl leading-relaxed font-light mb-10">
                      {item === "pt" ? project.description_pt : project.description_en}
                    </p>

                    <div className="flex flex-wrap gap-4">
                      {project.github_url && (
                        <Button asChild className="bg-zinc-200 text-zinc-950 hover:bg-zinc-900 hover:text-white border border-transparent hover:border-zinc-500 font-bold rounded-full px-6 transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg group">
                          <Link href={project.github_url} target="_blank">
                            <GithubIcon className="w-4 h-4 mr-2 text-zinc-950 group-hover:text-white transition-colors duration-300" /> 
                            {currentLang.githubBtn}
                          </Link>
                        </Button>
                      )}
                      {project.live_url && (
                        <Button asChild variant="outline" className="bg-zinc-900/40 border-zinc-700 text-zinc-200 hover:bg-zinc-800 hover:text-white font-bold rounded-full px-6 backdrop-blur-md transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg group">
                          <Link href={project.live_url} target="_blank">
                            <ArrowUpRight className="w-4 h-4 mr-2 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" /> 
                            {currentLang.liveBtn}
                          </Link>
                        </Button>
                      )}
                    </div>
                  </AnimatedSection>

                  {/* GALERIA DE FOTOS */}
                  {project.image_urls && project.image_urls.length > 0 && (
                    <AnimatedSection direction="up" delay={200}>
                      <h2 className="text-[10px] sm:text-xs uppercase tracking-[0.3em] text-zinc-500 font-bold mb-8 flex items-center gap-4">
                        {currentLang.galleryTitle}
                        <span className="h-[1px] flex-grow bg-gradient-to-r from-zinc-700 to-transparent"></span>
                      </h2>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                        {project.image_urls.map((url, index) => (
                          <div 
                            key={index}
                            onClick={() => setSelectedImage(url)}
                            className="relative aspect-video bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800/50 shadow-lg group cursor-zoom-in"
                          >
                            <img 
                              src={url} 
                              alt={`Galeria ${index + 1}`} 
                              className="object-cover w-full h-full opacity-80 group-hover:opacity-100 transition-all duration-700 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-zinc-950/20 group-hover:bg-transparent transition-colors duration-500"></div>
                          </div>
                        ))}
                      </div>
                    </AnimatedSection>
                  )}

                  <footer className="mt-24 mb-8 md:mb-10 text-center">
                    <p className="text-[10px] sm:text-[11px] uppercase tracking-[0.5em] text-zinc-500 font-bold">
                      L. Lima &bull; {new Date().getFullYear()}
                    </p>
                  </footer>

                </animated.div>
              );
            })
          )}
        </div>
      </main>
    </>
  );
}