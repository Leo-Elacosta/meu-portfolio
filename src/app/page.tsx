"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useTransition, useSpring, useInView, animated } from "@react-spring/web";
// NOVO: Adicionamos ícones para as modalidades de contratação
import { ArrowUpRight, Settings, Globe, Code2, MapPin, Briefcase, UserCheck, FileJson } from "lucide-react";
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
    heroSubtitle: "Desenvolvedor Fullstack",
    aboutTitle: "Sobre mim",
    // Bio atualizada com o chamado (CTA) no final
    heroDescription: "Sou um desenvolvedor apaixonado por transformar desafios complexos em produtos digitais elegantes e de alto desempenho. Meu foco vai além de apenas escrever código: trabalho lado a lado com você para construir soluções sob medida que engajam usuários e impulsionam resultados. Vamos transformar sua visão em realidade?",
    workTitle: "Modelos de Atuação",
    workLocal: "Presencial & Híbrido",
    workLocalDesc: "Porto Alegre/RS",
    workRemote: "Remoto",
    workRemoteDesc: "Global",
    // NOVO: Traduções para contratação
    hiringTitle: "Modalidades de Contratação",
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
    heroSubtitle: "Fullstack Developer",
    aboutTitle: "About Me",
    heroDescription: "I am a developer passionate about transforming complex challenges into elegant, high-performance digital products. My focus goes beyond writing code: I work with you to build custom solutions that engage users and drive results. Shall we turn your vision into reality?",
    workTitle: "Work Models",
    workLocal: "On-site & Hybrid",
    workLocalDesc: "Porto Alegre, BR",
    workRemote: "Remote",
    workRemoteDesc: "Worldwide",
    // NOVO: Traduções para contratação
    hiringTitle: "Hiring Options",
    linkedinBtn: "Let's connect on LinkedIn",
    projectsTitle: "Featured Projects",
    githubBtn: "Source Code",
    liveBtn: "Live Demo",
    empty: "No projects found.",
    switchLang: "English",
    techTitle: "Tech Stack & Tools",
  },
};

const techData = {
  frontend: [
    { name: "Next.js", pt: "Renderização híbrida e SEO.", en: "Hybrid rendering and SEO." },
    { name: "React", pt: "Interfaces interativas.", en: "Interactive interfaces." },
    { name: "TypeScript", pt: "Código seguro e tipado.", en: "Safe, typed code." },
    { name: "Tailwind CSS", pt: "Design moderno e ágil.", en: "Modern, agile design." }
  ],
  backend: [
    { name: "Node.js", pt: "Backend escalável.", en: "Scalable backend." },
    { name: "Supabase", pt: "BaaS e Realtime.", en: "BaaS and Realtime." },
    { name: "PostgreSQL", pt: "Banco relacional robusto.", en: "Robust relational DB." },
    { name: "Git", pt: "Controle de versão.", en: "Version control." }
  ]
};

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

function TechTag({ name, description, variant }: { name: string, description: string, variant: "light" | "dark" }) {
  const [isHovered, setIsHovered] = useState(false);
  const tooltipSpring = useSpring({
    opacity: isHovered ? 1 : 0,
    transform: isHovered ? "translate(-50%, 0px) scale(1)" : "translate(-50%, 10px) scale(0.8)",
    config: { tension: 350, friction: 20 }
  });
  const baseStyle = variant === "light" 
    ? "border-zinc-600/50 bg-zinc-800/40 text-zinc-100 hover:bg-zinc-700/60 hover:border-zinc-400" 
    : "border-zinc-800/60 bg-zinc-950/50 text-zinc-400 hover:text-zinc-200 hover:border-zinc-600 hover:bg-zinc-900/60";

  return (
    <div className="relative flex flex-grow sm:flex-grow-0" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      <animated.div style={tooltipSpring} className="absolute bottom-[115%] left-1/2 w-48 p-3 rounded-xl bg-zinc-900/95 border border-zinc-700 backdrop-blur-xl shadow-2xl z-50 pointer-events-none origin-bottom text-center">
        <p className="text-xs text-zinc-300 font-medium leading-relaxed">{description}</p>
      </animated.div>
      <div className={`px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl border backdrop-blur-md text-xs sm:text-sm font-semibold tracking-wide transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg flex items-center justify-center w-full ${baseStyle}`}>
        {name}
      </div>
    </div>
  );
}

function AnimatedSection({ children, direction, delay = 0, className = "" }: { children: React.ReactNode, direction: "left" | "right", delay?: number, className?: string }) {
  const [ref, springs] = useInView(
    () => ({
      from: { opacity: 0, x: direction === "left" ? -50 : 50 },
      to: { opacity: 1, x: 0 },
      config: { tension: 200, friction: 20 },
      delay: delay,
    }),
    { rootMargin: "-10% 0px" }
  );
  return <animated.div ref={ref} style={springs} className={className}>{children}</animated.div>;
}

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState<"pt" | "en">("pt");

  useEffect(() => {
    async function fetchProjects() {
      const { data, error } = await supabase.from("projects").select("*").order("created_at", { ascending: false });
      if (!error && data) setProjects(data);
      setLoading(false);
    }
    fetchProjects();
  }, []);

  const navAnimation = useSpring({ from: { opacity: 0, y: -20 }, to: { opacity: 1, y: 0 }, config: { tension: 280, friction: 20 } });
  const contentTransitions = useTransition(language, { mode: "out-in", from: { opacity: 0 }, enter: { opacity: 1 }, leave: { opacity: 0 }, config: { duration: 300 } });

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes metallic-pan { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
        .animate-metallic { background: linear-gradient(105deg, #000000 0%, #27272a 25%, #09090b 50%, #3f3f46 75%, #000000 100%); background-size: 300% 300%; animation: metallic-pan 20s ease-in-out infinite; }
      `}} />

      <main className="min-h-screen text-zinc-200 antialiased relative z-0">
        <div className="fixed inset-0 w-full h-full animate-metallic -z-20"></div>
        <div className="fixed inset-0 w-full h-full bg-black/40 backdrop-blur-[1px] -z-10"></div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 md:py-24">
          
          <animated.nav style={navAnimation} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-16 md:mb-24">
            <span className="text-xs tracking-[0.3em] uppercase font-bold text-zinc-400 flex items-center gap-2">
              <Code2 className="w-4 h-4" /> Portfolio / {new Date().getFullYear()}
            </span>
            <div className="flex gap-4 items-center">
              <Button variant="ghost" size="sm" className="text-zinc-300 text-xs font-bold" asChild>
                <Link href="/admin"><Settings className="w-3.5 h-3.5 mr-2" /> Admin</Link>
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setLanguage(language === "pt" ? "en" : "pt")} className="text-zinc-300 text-xs font-bold">
                <Globe className="w-3.5 h-3.5 mr-2" /> {dictionaries[language].switchLang}
              </Button>
            </div>
          </animated.nav>

          {contentTransitions((style, item) => {
            const t = dictionaries[item];
            return (
              <animated.div style={style}>
                
                {/* 1. SEÇÃO NOME E FOTO */}
                <AnimatedSection direction="left" className="mb-24 md:mb-32 flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-10">
                  <div className="relative shrink-0 group">
                    <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden border-2 border-zinc-700/50 shadow-2xl relative z-10 bg-zinc-900 transition-transform duration-500 group-hover:scale-105">
                      {/* Substitua o link abaixo pela sua foto real */}
                      <img src="https://media.licdn.com/dms/image/v2/D4D03AQFmM5vUwGJqhQ/profile-displayphoto-scale_200_200/B4DZ2Z1ISWHYAY-/0/1776402337432?e=1778112000&v=beta&t=3CxVDsN5Ukh_eZUSWWaYaVNvL_5WLndPf7DTKYjkMo4" alt="Leandro Lima" className="w-full h-full object-cover" />
                    </div>
                    {/* AQUI ESTÁ A MODIFICAÇÃO: Aura branca com efeito de hover inserida */}
                    <div className="absolute inset-0 bg-white/20 blur-2xl rounded-full -z-10 transition-all duration-500 group-hover:bg-white/30 group-hover:scale-110"></div>
                  </div>
                  <div>
                    <div className="inline-flex items-center mb-4 sm:mb-6 px-3 py-1.5 border border-zinc-700/50 bg-zinc-900/40 backdrop-blur-md rounded-full shadow-lg">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>
                      <span className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-zinc-300 font-bold">{t.heroSubtitle}</span>
                    </div>
                    <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tighter leading-tight">
                      <span className="text-white sm:bg-clip-text sm:text-transparent sm:bg-gradient-to-r sm:from-white sm:via-zinc-200 sm:to-zinc-500">
                        {t.heroTitle}
                      </span>
                    </h1>
                  </div>
                </AnimatedSection>

                {/* 2. SEÇÃO SOBRE MIM */}
                <AnimatedSection direction="right" delay={200} className="mb-24 md:mb-32 pl-0 sm:pl-8 md:pl-16 border-l-0 sm:border-l sm:border-zinc-800">
                  <h2 className="text-[10px] sm:text-xs uppercase tracking-[0.3em] text-zinc-400 mb-6 font-bold">{t.aboutTitle}</h2>
                  <p className="text-base sm:text-lg text-zinc-400 max-w-xl leading-relaxed font-light mb-10">
                    {t.heroDescription}
                  </p>

                  {/* MODELOS DE ATUAÇÃO E CONTRATAÇÃO */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                    {/* Coluna Atuação */}
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 font-bold mb-4">{t.workTitle}</p>
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-3 text-sm text-zinc-300">
                          <MapPin className="w-4 h-4 text-emerald-400" /> {t.workLocal}
                        </div>
                        <div className="flex items-center gap-3 text-sm text-zinc-300">
                          <Globe className="w-4 h-4 text-blue-400" /> {t.workRemote}
                        </div>
                      </div>
                    </div>

                    {/* Coluna Contratação (NOVA) */}
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 font-bold mb-4">{t.hiringTitle}</p>
                      <div className="flex flex-wrap gap-2">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900/40 text-xs font-bold text-zinc-300">
                          <Briefcase className="w-3.5 h-3.5 text-zinc-500" /> PJ
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900/40 text-xs font-bold text-zinc-300">
                          <UserCheck className="w-3.5 h-3.5 text-zinc-500" /> CLT
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900/40 text-xs font-bold text-zinc-300">
                          <FileJson className="w-3.5 h-3.5 text-zinc-500" /> Freelancer
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <Button asChild className="w-full sm:w-auto bg-zinc-200 text-zinc-950 hover:bg-zinc-900 hover:text-white font-bold rounded-full px-8 h-12 transition-all shadow-lg mb-12">
                    <Link href="https://www.linkedin.com/in/leandrolimaandrade/" target="_blank">
                      <LinkedinIcon className="w-4 h-4 mr-2" /> {t.linkedinBtn}
                    </Link>
                  </Button>

                  {/* TECH STACK */}
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 font-bold mb-6">{t.techTitle}</p>
                    <div className="flex flex-col gap-3">
                      <div className="flex flex-wrap gap-2">
                        {techData.frontend.map((tech) => <TechTag key={tech.name} name={tech.name} description={item === "pt" ? tech.pt : tech.en} variant="light" />)}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {techData.backend.map((tech) => <TechTag key={tech.name} name={tech.name} description={item === "pt" ? tech.pt : tech.en} variant="dark" />)}
                      </div>
                    </div>
                  </div>
                </AnimatedSection>

                {/* 3. SEÇÃO PROJETOS */}
                <AnimatedSection direction="left" className="mb-24">
                  <h2 className="text-[10px] uppercase tracking-[0.3em] text-zinc-400 mb-8 font-bold">{t.projectsTitle}</h2>
                  {loading ? <Skeleton className="h-40 w-full bg-zinc-800/50" /> : (
                    <div className="flex flex-col gap-6">
                      {projects.map((project) => (
                        <div key={project.id} className="group relative flex flex-col md:flex-row rounded-3xl bg-zinc-950/40 border border-zinc-700/50 backdrop-blur-md overflow-hidden hover:border-zinc-500 transition-all shadow-lg">
                          <Link href={`/projects/${project.id}`} className="absolute inset-0 z-10" />
                          <div className="w-full md:w-[30%] aspect-video bg-zinc-900">
                            <img src={project.image_urls?.[0]} alt={project.title_pt} className="object-cover w-full h-full opacity-80 group-hover:scale-105 transition-transform duration-500" />
                          </div>
                          <div className="flex-1 p-6">
                            <h3 className="text-zinc-100 text-xl font-bold mb-2">{item === "pt" ? project.title_pt : project.title_en}</h3>
                            <p className="text-zinc-400 text-sm font-light mb-6 line-clamp-2">{item === "pt" ? project.description_pt : project.description_en}</p>
                            <div className="flex gap-4 relative z-20">
                              <Link href={project.github_url} target="_blank" className="flex items-center text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-white transition-colors">
                                <GithubIcon className="w-4 h-4 mr-1.5" /> {t.githubBtn}
                              </Link>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </AnimatedSection>
              </animated.div>
            );
          })}
        </div>
      </main>
    </>
  );
}