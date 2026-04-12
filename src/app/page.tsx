"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
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

const dictionaries = {
  pt: {
    heroTitle: "Leandro Lima",
    heroSubtitle: "Desenvolvedor",
    heroDescription: "Desenvolvedor focado em transformar visões estratégicas em produtos digitais de alto impacto. Especializado na criação de sites e aplicativos sob medida, entrego soluções que unem design sofisticado, performance impecável e código escalável. Meu compromisso é garantir que cada detalhe da interface e cada linha de código contribuam diretamente para o sucesso e o crescimento do seu negócio.",
    linkedinBtn: "LinkedIn",
    projectsTitle: "Projetos",
    githubBtn: "GitHub",
    liveBtn: "Demo",
    loading: "Carregando...",
    empty: "Nenhum projeto encontrado.",
    switchLang: "PT",
  },
  en: {
    heroTitle: "Leandro Lima",
    heroSubtitle: "Developer",
    heroDescription: "Developer focused on turning strategic visions into high-impact digital products. Specialized in crafting custom websites and applications, I deliver solutions that blend sophisticated design, flawless performance, and scalable code. My commitment is to ensure that every interface detail and every line of code contributes directly to the success and growth of your business.",
    linkedinBtn: "LinkedIn",
    projectsTitle: "Projects",
    githubBtn: "GitHub",
    liveBtn: "Demo",
    loading: "Loading...",
    empty: "No projects found.",
    switchLang: "EN",
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
    <main className="min-h-screen bg-gradient-to-b from-zinc-950 to-zinc-900 text-zinc-300 antialiased">
      <div className="max-w-4xl mx-auto px-6 py-12 md:py-24">
        
        {/* Nav - PORTFOLIO MAIS DESTACADO */}
        <nav className="flex justify-between items-center mb-24">
          <span className="text-xs tracking-[0.3em] uppercase font-bold text-zinc-400">
            Portfolio / {new Date().getFullYear()}
          </span>
          <div className="flex gap-8 items-center">
            <Link href="/admin" className="text-zinc-500 hover:text-white transition-colors text-[10px] uppercase tracking-widest font-bold">
              Admin
            </Link>
            <button
              onClick={() => setLanguage(language === "pt" ? "en" : "pt")}
              className="text-xs font-bold hover:text-white transition-colors text-zinc-400 border-l border-zinc-800 pl-4"
            >
              {t.switchLang}
            </button>
          </div>
        </nav>

        {/* Hero Section */}
        <header className="mb-32">
          <div className="inline-block mb-4 px-3 py-1 border border-zinc-800 rounded-full">
            <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-400 font-bold">{t.heroSubtitle}</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-light tracking-tight text-white mb-6">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-zinc-200 to-zinc-400">
              {t.heroTitle}
            </span>
          </h1>
          <p className="text-lg text-zinc-400 max-w-xl leading-relaxed font-light mb-10">
            {t.heroDescription}
          </p>
          
          <Link 
            href="https://www.linkedin.com/in/leandrolimaandrade/" 
            target="_blank" 
            className="group flex items-center gap-3 text-sm text-zinc-100 hover:text-white transition-colors font-medium"
          >
            <span className="w-8 h-[1px] bg-zinc-700 group-hover:w-12 group-hover:bg-white transition-all"></span>
            {t.linkedinBtn}
          </Link>

          {/* Tecnologias em Destaque */}
          <div className="mt-16">
            <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 font-bold mb-6">
              {language === "pt" ? "Tecnologias & Ferramentas" : "Tech Stack & Tools"}
            </p>
            <div className="flex flex-wrap gap-3">
              {/* Principais com destaque (combinando com os cards) */}
              {["Next.js", "React", "TypeScript", "Tailwind CSS"].map((tech) => (
                <span key={tech} className="px-4 py-2 bg-zinc-100 text-zinc-900 text-[10px] font-bold uppercase tracking-widest rounded-lg shadow-sm">
                  {tech}
                </span>
              ))}
              
              {/* Secundárias com contorno discreto */}
              {["Node.js", "Supabase", "PostgreSQL", "Git"].map((tech) => (
                <span key={tech} className="px-4 py-2 border border-zinc-800 text-zinc-400 text-[10px] font-bold uppercase tracking-widest rounded-lg hover:border-zinc-600 transition-colors">
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </header>

        {/* Seção de Projetos */}
        <section>
          <h2 className="text-xs uppercase tracking-[0.3em] text-zinc-500 mb-12 flex items-center gap-4 font-bold">
            {t.projectsTitle}
            <span className="h-[1px] flex-grow bg-zinc-900"></span>
          </h2>

          {loading ? (
            <div className="text-zinc-600 font-medium text-sm italic">{t.loading}</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {projects.map((project) => (
                <div key={project.id} className="flex flex-col group">
                  <div className="aspect-[4/3] bg-zinc-100 rounded-2xl overflow-hidden mb-6 transition-transform duration-500 group-hover:-translate-y-2 shadow-sm">
                    <img
                      src={project.image_url}
                      alt={project.title_pt}
                      className="object-cover w-full h-full opacity-90 hover:opacity-100 transition-opacity duration-500"
                    />
                  </div>

                  <div className="px-1">
                    <h3 className="text-white text-lg font-bold mb-2 transition-colors group-hover:text-zinc-300">
                      {language === "pt" ? project.title_pt : project.title_en}
                    </h3>
                    <p className="text-zinc-500 text-sm font-light leading-relaxed mb-4 line-clamp-2">
                      {language === "pt" ? project.description_pt : project.description_en}
                    </p>
                    
                    <div className="flex gap-4">
                      <Link href={project.github_url} target="_blank" className="text-[10px] uppercase tracking-widest text-zinc-400 hover:text-white transition-colors font-bold">
                        {t.githubBtn}
                      </Link>
                      {project.live_url && (
                        <Link href={project.live_url} target="_blank" className="text-[10px] uppercase tracking-widest text-zinc-400 hover:text-white transition-colors font-bold">
                          {t.liveBtn}
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Footer - L. LIMA MAIS DESTACADO */}
        <footer className="mt-40 mb-10 text-center">
          <p className="text-[11px] uppercase tracking-[0.5em] text-zinc-500 font-bold">
            L. Lima &bull; {new Date().getFullYear()}
          </p>
        </footer>
      </div>
    </main>
  );
}