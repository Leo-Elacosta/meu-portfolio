"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

// 1. Tipagem do Projeto
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

// 2. Dicionário de Traduções (Substitua pelos seus arquivos reais, se preferir)
const dictionaries = {
  pt: {
    heroTitle: "Olá, me chamo Leandro Lima 👋",
    heroDescription: "Sou um Desenvolvedor apaixonado por criar soluções modernas e eficientes. Meu foco é transformar ideias complexas em interfaces simples, elegantes e com código de alta qualidade. Bem-vindo ao meu portfólio digital!",
    linkedinBtn: "Conectar no LinkedIn",
    projectsTitle: "Meus Projetos",
    githubBtn: "GitHub →",
    liveBtn: "Live Demo →",
    loading: "Carregando projetos...",
    empty: "Nenhum projeto encontrado.",
    switchLang: "🇧🇷 Português ",
  },
  en: {
    heroTitle: "Hello, I'm Leandro Lima 👋",
    heroDescription: "I'm a Developer passionate about building modern and efficient solutions. My focus is turning complex ideas into simple, elegant interfaces with high-quality code. Welcome to my digital portfolio!",
    linkedinBtn: "Connect on LinkedIn",
    projectsTitle: "My Projects",
    githubBtn: "GitHub →",
    liveBtn: "Live Demo →",
    loading: "Loading projects...",
    empty: "No projects found.",
    switchLang: "🇺🇸 English",
  },
};

export default function Home() {
  // === ESTADOS (Memória) ===
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState<"pt" | "en">("pt");

  // === BUSCA DE DADOS ===
  useEffect(() => {
    async function fetchProjects() {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        setProjects(data);
      }
      setLoading(false);
    }

    fetchProjects();
  }, []);

  // Seleciona as traduções atuais com base no estado 'language'
  const t = dictionaries[language];

  // === RENDERIZAÇÃO ===
  return (
    <main className="min-h-screen p-8 md:p-16 max-w-5xl mx-auto">
      
      {/* Cabeçalho: Botões de Admin e Troca de Idioma */}
      <div className="flex justify-end gap-6 items-center mb-8">
        <Link href="/admin" className="text-zinc-500 hover:text-white transition-colors text-sm font-medium">
          Acesso Admin
        </Link>
        <button
          onClick={() => setLanguage(language === "pt" ? "en" : "pt")}
          className="px-4 py-2 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-colors text-sm font-medium"
        >
          {t.switchLang}
        </button>
      </div>

      {/* Área de Apresentação (Hero) */}
      <div className="mb-16 mt-12">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white tracking-tight">
          {t.heroTitle}
        </h1>
        <p className="text-lg md:text-xl text-zinc-400 max-w-2xl leading-relaxed">
          {t.heroDescription}
        </p>
        
        {/* === BOTÃO DO LINKEDIN ADICIONADO AQUI === */}
        <div className="mt-8 flex gap-4">
          <Link 
            href="https://www.linkedin.com/in/leandrolimaandrade/" 
            target="_blank" 
            className="px-6 py-3 bg-[#0A66C2] hover:bg-[#004182] text-white font-medium rounded-lg transition-colors flex items-center gap-2"
          >
            {t.linkedinBtn}
          </Link>
        </div>
      </div>

      {/* Seção de Projetos */}
      <h2 className="text-2xl font-bold mb-8 border-b border-zinc-800 pb-4">
        {t.projectsTitle}
      </h2>

      {/* Lógica de Carregamento e Lista Vazia */}
      {loading ? (
        <p className="text-zinc-500">{t.loading}</p>
      ) : projects.length === 0 ? (
        <p className="text-zinc-500">{t.empty}</p>
      ) : (
        // Grid de Cards dos Projetos
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {projects.map((project) => (
            <div key={project.id} className="bg-zinc-900/50 rounded-2xl border border-zinc-800 overflow-hidden flex flex-col group">
              
              {/* Imagem do Projeto */}
              <div className="h-48 bg-zinc-800 w-full relative overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={project.image_url}
                  alt="Snapshot do Projeto"
                  className="object-cover w-full h-full opacity-80 transition-all duration-300 group-hover:opacity-100 group-hover:scale-105"
                />
              </div>

              {/* Informações do Projeto */}
              <div className="p-6 flex flex-col flex-grow">
                {/* Título Dinâmico */}
                <h3 className="text-xl font-bold mb-2 text-white">
                  {language === "pt" ? project.title_pt : project.title_en}
                </h3>
                
                {/* Descrição Dinâmica */}
                <p className="text-zinc-400 text-sm mb-6 flex-grow">
                  {language === "pt" ? project.description_pt : project.description_en}
                </p>

                {/* Links */}
                <div className="flex gap-4 text-sm font-medium mt-auto">
                  <Link href={project.github_url} target="_blank" className="text-white hover:text-gray-300 transition-colors">
                    {t.githubBtn}
                  </Link>
                  
                  {project.live_url && (
                    <Link href={project.live_url} target="_blank" className="text-zinc-400 hover:text-white transition-colors">
                      {t.liveBtn}
                    </Link>
                  )}
                </div>
              </div>
              
            </div>
          ))}
        </div>
      )}
    </main>
  );
}