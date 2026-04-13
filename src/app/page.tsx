"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { motion, Variants } from "framer-motion";
import { ArrowUpRight, Settings, Globe, Code2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

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

const dictionaries = {
  pt: {
    heroTitle: "Leandro Lima",
    heroSubtitle: "Desenvolvedor",
    heroDescription: "Focado em transformar visões estratégicas em produtos digitais de alto impacto. Especializado na criação de sites e aplicativos sob medida, entrego soluções que unem design sofisticado, performance impecável e código escalável.",
    linkedinBtn: "Conectar no LinkedIn",
    projectsTitle: "Projetos em Destaque",
    githubBtn: "Código Fonte",
    liveBtn: "Visualizar Projeto",
    empty: "Nenhum projeto encontrado.",
    switchLang: "English",
    techTitle: "Tecnologias & Ferramentas",
  },
  en: {
    heroTitle: "Leandro Lima",
    heroSubtitle: "Developer",
    heroDescription: "Focused on turning strategic visions into high-impact digital products. Specialized in crafting custom websites and applications, I deliver solutions that blend sophisticated design, flawless performance, and scalable code.",
    linkedinBtn: "Connect on LinkedIn",
    projectsTitle: "Featured Projects",
    githubBtn: "Source Code",
    liveBtn: "Live Demo",
    empty: "No projects found.",
    switchLang: "Português",
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
    <main className="min-h-screen bg-zinc-950 text-zinc-300 antialiased selection:bg-zinc-800 selection:text-white">
      <div className="absolute top-0 left-0 w-full h-[500px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900/40 via-zinc-950 to-zinc-950 -z-10"></div>

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
              className="text-zinc-400 hover:bg-zinc-100 hover:text-zinc-950 transition-colors duration-300 text-xs uppercase tracking-widest font-bold" 
              asChild
            >
              <Link href="/admin"><Settings className="w-3.5 h-3.5 mr-2" /> Admin</Link>
            </Button>
            
            <div className="w-[1px] h-4 bg-zinc-800"></div>

            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setLanguage(language === "pt" ? "en" : "pt")}
              className="text-zinc-400 hover:bg-zinc-100 hover:text-zinc-950 transition-colors duration-300 text-xs font-bold"
            >
              <Globe className="w-3.5 h-3.5 mr-2" /> {t.switchLang}
            </Button>
          </motion.div>
        </nav>

        <motion.div variants={containerVariants} initial="hidden" animate="show">
          
          <header className="mb-32">
            <motion.div variants={itemVariants} className="inline-flex items-center mb-6 px-3 py-1 border border-zinc-800/60 bg-zinc-900/30 backdrop-blur-sm rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-400 font-bold">{t.heroSubtitle}</span>
            </motion.div>
            
            <motion.h1 variants={itemVariants} className="text-5xl md:text-6xl font-light tracking-tight text-white mb-6">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-zinc-200 to-zinc-500">
                {t.heroTitle}
              </span>
            </motion.h1>
            
            <motion.p variants={itemVariants} className="text-lg text-zinc-400 max-w-xl leading-relaxed font-light mb-10">
              {t.heroDescription}
            </motion.p>
            
            <motion.div variants={itemVariants}>
              <Button 
                asChild 
                className="bg-white text-zinc-950 hover:bg-zinc-900 hover:text-white border border-transparent hover:border-zinc-700 font-bold rounded-full px-6 h-12 transition-all duration-300 hover:scale-105 active:scale-95 group"
              >
                <Link href="https://www.linkedin.com/in/leandrolimaandrade/" target="_blank">
                  <LinkedinIcon className="w-4 h-4 mr-2 text-zinc-950 group-hover:text-white transition-colors duration-300" />
                  {t.linkedinBtn}
                </Link>
              </Button>
            </motion.div>

            <motion.div variants={itemVariants} className="mt-20">
              <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 font-bold mb-6 flex items-center gap-2">
                {t.techTitle}
              </p>
              <div className="flex flex-wrap gap-2.5">
                {["Next.js", "React", "TypeScript", "Tailwind CSS"].map((tech) => (
                  <Badge key={tech} variant="secondary" className="bg-zinc-100 text-zinc-900 hover:bg-white text-[10px] uppercase tracking-widest px-3 py-1.5 shadow-sm transition-colors">
                    {tech}
                  </Badge>
                ))}
                {["Node.js", "Supabase", "PostgreSQL", "Git"].map((tech) => (
                  <Badge key={tech} variant="outline" className="border-zinc-800 text-zinc-400 hover:text-zinc-200 text-[10px] uppercase tracking-widest px-3 py-1.5 bg-zinc-950/50 backdrop-blur-sm transition-colors">
                    {tech}
                  </Badge>
                ))}
              </div>
            </motion.div>
          </header>

          <section>
            <motion.h2 variants={itemVariants} className="text-xs uppercase tracking-[0.3em] text-zinc-400 mb-12 flex items-center gap-6 font-bold">
              {t.projectsTitle}
              <span className="h-[1px] flex-grow bg-gradient-to-r from-zinc-800 to-transparent"></span>
            </motion.h2>

            {loading ? (
              <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {[1, 2].map((i) => (
                  <div key={i} className="flex flex-col p-5 rounded-3xl bg-zinc-900/40 border border-zinc-800/50">
                    <Skeleton className="aspect-[4/3] w-full rounded-2xl bg-zinc-800/50 mb-6" />
                    <Skeleton className="h-6 w-3/4 bg-zinc-800/50 mb-3" />
                    <Skeleton className="h-4 w-full bg-zinc-800/50 mb-2" />
                    <Skeleton className="h-4 w-5/6 bg-zinc-800/50" />
                  </div>
                ))}
              </motion.div>
            ) : projects.length === 0 ? (
              <motion.p variants={itemVariants} className="text-zinc-600 font-light italic">{t.empty}</motion.p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {projects.map((project) => (
                  <motion.div 
                    key={project.id} 
                    variants={itemVariants} 
                    className="flex flex-col group p-5 rounded-3xl bg-zinc-900/40 border border-zinc-800/50 hover:bg-zinc-800/40 hover:border-zinc-700/50 transition-all duration-500 shadow-sm hover:shadow-xl hover:shadow-black/20"
                  >
                    <div className="relative aspect-[4/3] bg-zinc-100 rounded-2xl overflow-hidden mb-6 shadow-md">
                      <img
                        src={project.image_url}
                        alt={project.title_pt}
                        className="object-cover w-full h-full opacity-90 transition-all duration-700 group-hover:opacity-100 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-zinc-950/10 group-hover:bg-transparent transition-colors duration-500"></div>
                    </div>

                    <div className="px-1 flex flex-col flex-grow">
                      <h3 className="text-white text-xl font-bold mb-3 transition-colors group-hover:text-zinc-200">
                        {language === "pt" ? project.title_pt : project.title_en}
                      </h3>
                      <p className="text-zinc-400 text-sm font-light leading-relaxed mb-6 line-clamp-3 flex-grow group-hover:text-zinc-300 transition-colors">
                        {language === "pt" ? project.description_pt : project.description_en}
                      </p>
                      
                      <div className="flex gap-6 mt-auto">
                        <Link href={project.github_url} target="_blank" className="flex items-center text-[10px] uppercase tracking-widest text-zinc-500 hover:text-white transition-colors font-bold group/link">
                          <GithubIcon className="w-3.5 h-3.5 mr-2 group-hover/link:text-white transition-colors" />
                          {t.githubBtn}
                        </Link>
                        {project.live_url && (
                          <Link href={project.live_url} target="_blank" className="flex items-center text-[10px] uppercase tracking-widest text-zinc-500 hover:text-white transition-colors font-bold group/link">
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
            <p className="text-[11px] uppercase tracking-[0.5em] text-zinc-600 font-bold">
              L. Lima &bull; {new Date().getFullYear()}
            </p>
          </motion.footer>

        </motion.div>
      </div>
    </main>
  );
}