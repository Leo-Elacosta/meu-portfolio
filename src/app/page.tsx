"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { motion, Variants, AnimatePresence } from "framer-motion";
import { ArrowUpRight, Settings, Globe, Code2 } from "lucide-react";
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
    heroTitle: "Leandro Lima",
    heroSubtitle: "Desenvolvedor de Software",
    heroDescription: "Sou um desenvolvedor apaixonado por transformar desafios complexos em produtos digitais elegantes e de alto desempenho. Meu foco vai além de apenas escrever código: trabalho lado a lado com você para entender os objetivos do seu negócio e construir soluções sob medida que engajam usuários, escalam com segurança e impulsionam resultados reais. Seja para criar um site institucional de alto impacto, um aplicativo inovador ou uma plataforma corporativa robusta, estou pronto para unir design sofisticado a uma arquitetura tecnológica impecável e tirar a sua visão do papel.",
    linkedinBtn: "Vamos conversar no LinkedIn",
    projectsTitle: "Projetos em Destaque",
    githubBtn: "Código Fonte",
    liveBtn: "Visualizar Projeto",
    empty: "Nenhum projeto encontrado.",
    switchLang: "Português",
    techTitle: "Tecnologias & Ferramentas",
  },
  en: {
    heroTitle: "Leandro Lima",
    heroSubtitle: "Software Developer",
    heroDescription: "I am a developer passionate about transforming complex challenges into elegant, high-performance digital products. My focus goes beyond merely writing code: I work closely with you to understand your business goals and build custom solutions that engage users, scale securely, and drive tangible results. Whether you need a high-impact institutional website, an innovative mobile app, or a robust corporate platform, I am ready to combine sophisticated design with flawless technical architecture and bring your vision to life.",
    linkedinBtn: "Let's connect on LinkedIn",
    projectsTitle: "Featured Projects",
    githubBtn: "Source Code",
    liveBtn: "Live Demo",
    empty: "No projects found.",
    switchLang: "English",
    techTitle: "Tech Stack & Tools",
  },
};

// === ÍCONES DE MARCAS INLINE ===
const GithubIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.2c3-.3 6-1.5 6-6.5a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 5 3 6.2 6 6.5a4.8 4.8 0 0 0-1 3.2v4" />
  </svg>
);

const LinkedinIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

// === ANIMAÇÕES DO FRAMER MOTION ===
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.1 },
  },
  exit: { 
    opacity: 0,
    transition: { duration: 0.3, ease: "easeInOut" }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { 
    opacity: 1, 
    y: 0, 
    transition: { type: "spring" as const, stiffness: 300, damping: 24 } 
  },
};

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState<"pt" | "en">("pt");

  useEffect(() => {
    async function fetchProjects() {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) setProjects(data);
      setLoading(false);
    }
    fetchProjects();
  }, []);

  const t = dictionaries[language];

  return (
    <>
      {/* CSS embutido para o efeito metálico animado */}
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
        
        {/* Camadas do Background Metálico */}
        <div className="fixed inset-0 w-full h-full animate-metallic -z-20"></div>
        <div className="fixed inset-0 w-full h-full bg-black/40 backdrop-blur-[1px] -z-10"></div>

        <div className="max-w-4xl mx-auto px-6 py-12 md:py-24">
          
          <nav className="flex justify-between items-center mb-24">
            <motion.span 
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}
              className="text-xs tracking-[0.3em] uppercase font-bold text-zinc-400 flex items-center gap-2"
            >
              <Code2 className="w-4 h-4" /> Portfolio / {new Date().getFullYear()}
            </motion.span>
            
            <motion.div 
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}
              className="flex gap-4 items-center"
            >
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-zinc-300 hover:bg-zinc-800/60 hover:text-white transition-colors duration-300 text-xs uppercase tracking-widest font-bold backdrop-blur-sm" 
                asChild
              >
                <Link href="/admin"><Settings className="w-3.5 h-3.5 mr-2" /> Admin</Link>
              </Button>
              
              <div className="w-[1px] h-4 bg-zinc-700"></div>

              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setLanguage(language === "pt" ? "en" : "pt")}
                className="text-zinc-300 hover:bg-zinc-800/60 hover:text-white transition-colors duration-300 text-xs font-bold backdrop-blur-sm"
              >
                <Globe className="w-3.5 h-3.5 mr-2" /> {t.switchLang}
              </Button>
            </motion.div>
          </nav>

          <AnimatePresence mode="wait">
            <motion.div 
              key={language} 
              variants={containerVariants} 
              initial="hidden" 
              animate="show"
              exit="exit"
            >
              
              <header className="mb-32">
                <motion.div variants={itemVariants} className="inline-flex items-center mb-6 px-3 py-1 border border-zinc-700/50 bg-zinc-900/40 backdrop-blur-md rounded-full shadow-lg">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>
                  <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-300 font-bold">{t.heroSubtitle}</span>
                </motion.div>
                
                <motion.h1 variants={itemVariants} className="text-5xl md:text-6xl font-light tracking-tight text-white mb-6">
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-zinc-300 to-zinc-500">
                    {t.heroTitle}
                  </span>
                </motion.h1>
                
                <motion.p variants={itemVariants} className="text-lg text-zinc-400 max-w-xl leading-relaxed font-light mb-10">
                  {t.heroDescription}
                </motion.p>
                
                <motion.div variants={itemVariants}>
                  <Button 
                    asChild 
                    className="bg-zinc-200 text-zinc-950 hover:bg-zinc-900 hover:text-white border border-transparent hover:border-zinc-500 font-bold rounded-full px-6 h-12 transition-all duration-300 hover:scale-105 active:scale-95 group shadow-lg"
                  >
                    <Link href="https://www.linkedin.com/in/leandrolimaandrade/" target="_blank">
                      <LinkedinIcon className="w-4 h-4 mr-2 text-zinc-950 group-hover:text-white transition-colors duration-300" />
                      {t.linkedinBtn}
                    </Link>
                  </Button>
                </motion.div>

                <motion.div variants={itemVariants} className="mt-24">
                  <p className="text-[11px] uppercase tracking-[0.3em] text-zinc-500 font-bold mb-8 flex items-center gap-4">
                    {t.techTitle}
                    <span className="h-[1px] flex-grow bg-gradient-to-r from-zinc-700 to-transparent"></span>
                  </p>
                  
                  <div className="flex flex-wrap gap-3 md:gap-4">
                    {["Next.js", "React", "TypeScript", "Tailwind CSS"].map((tech) => (
                      <motion.div 
                        key={tech} 
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-5 py-2.5 rounded-xl border border-zinc-600/50 bg-zinc-800/40 backdrop-blur-md text-zinc-100 text-sm font-semibold tracking-wide hover:bg-zinc-700/60 hover:border-zinc-400 transition-colors shadow-lg cursor-default flex items-center justify-center"
                      >
                        {tech}
                      </motion.div>
                    ))}
                    {["Node.js", "Supabase", "PostgreSQL", "Git"].map((tech) => (
                      <motion.div 
                        key={tech} 
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-5 py-2.5 rounded-xl border border-zinc-800/60 bg-zinc-950/50 backdrop-blur-md text-zinc-400 text-sm font-medium tracking-wide hover:text-zinc-200 hover:border-zinc-600 hover:bg-zinc-900/60 transition-colors shadow-md cursor-default flex items-center justify-center"
                      >
                        {tech}
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </header>

              <section>
                <motion.h2 variants={itemVariants} className="text-xs uppercase tracking-[0.3em] text-zinc-400 mb-12 flex items-center gap-6 font-bold">
                  {t.projectsTitle}
                  <span className="h-[1px] flex-grow bg-gradient-to-r from-zinc-700 to-transparent"></span>
                </motion.h2>

                {loading ? (
                  <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {[1, 2].map((i) => (
                      <div key={i} className="flex flex-col p-5 rounded-3xl bg-zinc-950/40 border border-zinc-700/50 backdrop-blur-md">
                        <Skeleton className="aspect-[4/3] w-full rounded-2xl bg-zinc-800/50 mb-6" />
                        <Skeleton className="h-6 w-3/4 bg-zinc-800/50 mb-3" />
                        <Skeleton className="h-4 w-full bg-zinc-800/50 mb-2" />
                        <Skeleton className="h-4 w-5/6 bg-zinc-800/50" />
                      </div>
                    ))}
                  </motion.div>
                ) : projects.length === 0 ? (
                  <motion.p variants={itemVariants} className="text-zinc-500 font-light italic">{t.empty}</motion.p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {projects.map((project) => (
                      <motion.div 
                        key={project.id} 
                        variants={itemVariants} 
                        // ADICIONADO: 'relative' para o container prender o link expandido
                        className="relative flex flex-col group p-5 rounded-3xl bg-zinc-950/40 border border-zinc-700/50 backdrop-blur-md hover:bg-zinc-900/60 hover:border-zinc-500/50 transition-all duration-500 shadow-lg hover:shadow-2xl hover:shadow-black/50 cursor-pointer"
                      >
                        {/* NOVO: Link invisível que cobre o card inteiro */}
                        <Link href={`/projects/${project.id}`} className="absolute inset-0 z-10">
                          <span className="sr-only">Ver detalhes do projeto {project.title_pt}</span>
                        </Link>

                        <div className="relative aspect-[4/3] bg-zinc-800 rounded-2xl overflow-hidden mb-6 shadow-md border border-zinc-800/50">
                          <img
                            src={project.image_urls?.[0] || "/placeholder.jpg"}
                            alt={project.title_pt}
                            className="object-cover w-full h-full opacity-80 transition-all duration-700 group-hover:opacity-100 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-zinc-950/20 group-hover:bg-transparent transition-colors duration-500"></div>
                        </div>

                        <div className="px-1 flex flex-col flex-grow">
                          <h3 className="text-zinc-100 text-xl font-bold mb-3 transition-colors group-hover:text-white">
                            {language === "pt" ? project.title_pt : project.title_en}
                          </h3>
                          <p className="text-zinc-400 text-sm font-light leading-relaxed mb-6 line-clamp-3 flex-grow group-hover:text-zinc-300 transition-colors">
                            {language === "pt" ? project.description_pt : project.description_en}
                          </p>
                          
                          {/* ADICIONADO: 'relative z-20' para que estes links fiquem ACIMA do link invisível do card */}
                          <div className="flex gap-6 mt-auto relative z-20">
                            <Link href={project.github_url} target="_blank" className="flex items-center text-[10px] uppercase tracking-widest text-zinc-500 hover:text-white transition-colors font-bold group/link relative">
                              <GithubIcon className="w-3.5 h-3.5 mr-2 group-hover/link:text-white transition-colors" />
                              {t.githubBtn}
                            </Link>
                            {project.live_url && (
                              <Link href={project.live_url} target="_blank" className="flex items-center text-[10px] uppercase tracking-widest text-zinc-500 hover:text-white transition-colors font-bold group/link relative">
                                <ArrowUpRight className="w-3.5 h-3.5 mr-1 group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5 transition-transform" />
                                {t.liveBtn}
                              </Link>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </section>

              <motion.footer variants={itemVariants} className="mt-40 mb-10 text-center">
                <p className="text-[11px] uppercase tracking-[0.5em] text-zinc-500 font-bold">
                  L. Lima &bull; {new Date().getFullYear()}
                </p>
              </motion.footer>

            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </>
  );
}