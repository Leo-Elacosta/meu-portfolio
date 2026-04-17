"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useTransition, useSpring, useInView, animated } from "@react-spring/web";
// NOVO: Adicionamos o MapPin aqui nas importações do lucide-react
import { ArrowUpRight, Settings, Globe, Code2, MapPin } from "lucide-react";
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
    heroDescription: "Sou um desenvolvedor apaixonado por transformar desafios complexos em produtos digitais elegantes e de alto desempenho. Meu foco vai além de apenas escrever código: trabalho lado a lado com você para entender os objetivos do seu negócio e construir soluções sob medida que engajam usuários, escalam com segurança e impulsionam resultados reais. Seja para criar um site institucional de alto impacto, um aplicativo inovador ou uma plataforma corporativa robusta, estou pronto para unir design sofisticado a uma arquitetura tecnológica impecável e tirar a sua visão do papel.",
    // NOVO: Traduções dos modelos de atuação
    workTitle: "Modelos de Atuação",
    workLocal: "Presencial & Híbrido",
    workLocalDesc: "Região Metropolitana de Porto Alegre/RS",
    workRemote: "Remoto",
    workRemoteDesc: "Globalmente",
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
    heroDescription: "I am a developer passionate about transforming complex challenges into elegant, high-performance digital products. My focus goes beyond merely writing code: I work closely with you to understand your business goals and build custom solutions that engage users, scale securely, and drive tangible results. Whether you need a high-impact institutional website, an innovative mobile app, or a robust corporate platform, I am ready to combine sophisticated design with flawless technical architecture and bring your vision to life.",
    // NOVO: Traduções dos modelos de atuação em inglês
    workTitle: "Work Models",
    workLocal: "On-site & Hybrid",
    workLocalDesc: "Porto Alegre Metro Area, RS, Brazil",
    workRemote: "Remote",
    workRemoteDesc: "Worldwide",
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
    { name: "Next.js", pt: "Renderização híbrida, velocidade e SEO otimizado.", en: "Hybrid rendering, speed, and optimized SEO." },
    { name: "React", pt: "Criação de interfaces interativas e componentizadas.", en: "Creation of interactive and componentized interfaces." },
    { name: "TypeScript", pt: "Código mais seguro e previsível com tipagem estática.", en: "Safer and more predictable code with static typing." },
    { name: "Tailwind CSS", pt: "Estilização ágil e consistente baseada em utilitários.", en: "Agile and consistent utility-first styling." }
  ],
  backend: [
    { name: "Node.js", pt: "Backend rápido, assíncrono e altamente escalável.", en: "Fast, asynchronous, and highly scalable backend." },
    { name: "Supabase", pt: "BaaS poderoso com autenticação e banco em tempo real.", en: "Powerful BaaS with real-time auth and database." },
    { name: "PostgreSQL", pt: "Banco de dados relacional robusto e super confiável.", en: "Robust and highly reliable relational database." },
    { name: "Git", pt: "Versionamento seguro e colaboração eficiente de código.", en: "Secure versioning and efficient code collaboration." }
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
      <animated.div style={tooltipSpring} className="absolute bottom-[115%] left-1/2 w-48 p-3 rounded-xl bg-zinc-900/95 border border-zinc-700 backdrop-blur-xl shadow-2xl z-50 pointer-events-none origin-bottom">
        <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-zinc-900/95 border-b border-r border-zinc-700 rotate-45"></div>
        <p className="text-xs text-zinc-300 text-center font-medium leading-relaxed relative z-10">{description}</p>
      </animated.div>
      <div className={`px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl border backdrop-blur-md text-xs sm:text-sm font-semibold tracking-wide transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg cursor-default flex items-center justify-center w-full ${baseStyle}`}>
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

  return (
    <animated.div ref={ref} style={springs} className={className}>
      {children}
    </animated.div>
  );
}

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

  const navAnimation = useSpring({
    from: { opacity: 0, y: -20 },
    to: { opacity: 1, y: 0 },
    config: { tension: 280, friction: 20 },
  });

  const contentTransitions = useTransition(language, {
    mode: "out-in",
    from: { opacity: 0 },
    enter: { opacity: 1 },
    leave: { opacity: 0 },
    config: { duration: 300 },
  });

  return (
    <>
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
            <span className="text-xs tracking-[0.3em] uppercase font-bold text-zinc-400 flex items-center gap-2">
              <Code2 className="w-4 h-4" /> Portfolio / {new Date().getFullYear()}
            </span>
            <div className="flex gap-4 items-center w-full sm:w-auto justify-between sm:justify-end">
              <Button variant="ghost" size="sm" className="text-zinc-300 hover:bg-zinc-800/60 hover:text-white transition-colors duration-300 text-xs uppercase tracking-widest font-bold backdrop-blur-sm" asChild>
                <Link href="/admin"><Settings className="w-3.5 h-3.5 mr-2" /> Admin</Link>
              </Button>
              <div className="w-[1px] h-4 bg-zinc-700"></div>
              <Button variant="ghost" size="sm" onClick={() => setLanguage(language === "pt" ? "en" : "pt")} className="text-zinc-300 hover:bg-zinc-800/60 hover:text-white transition-colors duration-300 text-xs font-bold backdrop-blur-sm">
                <Globe className="w-3.5 h-3.5 mr-2" /> {dictionaries[language].switchLang}
              </Button>
            </div>
          </animated.nav>

          {contentTransitions((style, item) => {
            const t = dictionaries[item];

            return (
              <animated.div style={style}>
                
                {/* 1. SEÇÃO NOME */}
                <AnimatedSection direction="left" className="mb-24 md:mb-32">
                  <div className="inline-flex items-center mb-6 px-3 py-1.5 border border-zinc-700/50 bg-zinc-900/40 backdrop-blur-md rounded-full shadow-lg">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>
                    <span className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-zinc-300 font-bold">{t.heroSubtitle}</span>
                  </div>
                  <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tighter leading-[1.1] sm:leading-tight">
                    {/* NOVO: Aqui está a correção do celular! Branco sólido no mobile, gradiente em telas maiores (sm:) */}
                    <span className="text-white sm:bg-clip-text sm:text-transparent sm:bg-gradient-to-r sm:from-white sm:via-zinc-200 sm:to-zinc-500">
                      {t.heroTitle}
                    </span>
                  </h1>
                </AnimatedSection>

                {/* 2. SEÇÃO SOBRE MIM */}
                <AnimatedSection direction="right" delay={200} className="mb-24 md:mb-32 pl-0 sm:pl-8 md:pl-16 border-l-0 sm:border-l sm:border-zinc-800">
                  <h2 className="text-[10px] sm:text-xs uppercase tracking-[0.3em] text-zinc-400 mb-6 flex items-center gap-4 sm:gap-6 font-bold">
                    {t.aboutTitle}
                    <span className="h-[1px] w-12 bg-gradient-to-r from-zinc-700 to-transparent block sm:hidden"></span>
                  </h2>
                  <p className="text-base sm:text-lg text-zinc-400 max-w-xl leading-relaxed font-light mb-10">
                    {t.heroDescription}
                  </p>

                  {/* NOVO: SEÇÃO DE MODELOS DE ATUAÇÃO */}
                  <div className="mb-10">
                    <p className="text-[10px] sm:text-[11px] uppercase tracking-[0.3em] text-zinc-500 font-bold mb-4 flex items-center gap-4">
                      {t.workTitle}
                      <span className="h-[1px] flex-grow bg-gradient-to-r from-zinc-700 to-transparent"></span>
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3">
                      {/* Card Presencial / Híbrido */}
                      <div className="flex items-center gap-4 px-5 py-4 rounded-2xl border border-zinc-800/60 bg-zinc-900/40 backdrop-blur-md flex-1">
                        <div className="p-2 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                          <MapPin className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-zinc-200 leading-tight mb-1">{t.workLocal}</span>
                          <span className="text-xs text-zinc-400">{t.workLocalDesc}</span>
                        </div>
                      </div>
                      
                      {/* Card Remoto */}
                      <div className="flex items-center gap-4 px-5 py-4 rounded-2xl border border-zinc-800/60 bg-zinc-900/40 backdrop-blur-md flex-1">
                        <div className="p-2 bg-blue-500/10 rounded-full border border-blue-500/20">
                          <Globe className="w-5 h-5 text-blue-400" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-zinc-200 leading-tight mb-1">{t.workRemote}</span>
                          <span className="text-xs text-zinc-400">{t.workRemoteDesc}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Botão LinkedIn */}
                  <div className="mb-12">
                    <Button asChild className="w-full sm:w-auto flex justify-center bg-zinc-200 text-zinc-950 hover:bg-zinc-900 hover:text-white border border-transparent hover:border-zinc-500 font-bold rounded-full px-6 md:px-8 h-12 transition-all duration-300 hover:scale-105 active:scale-95 group shadow-lg">
                      <Link href="https://www.linkedin.com/in/leandrolimaandrade/" target="_blank">
                        <LinkedinIcon className="w-4 h-4 mr-2 text-zinc-950 group-hover:text-white transition-colors duration-300" />
                        {t.linkedinBtn}
                      </Link>
                    </Button>
                  </div>

                  <div>
                    <p className="text-[10px] sm:text-[11px] uppercase tracking-[0.3em] text-zinc-500 font-bold mb-6 md:mb-8 flex items-center gap-4">
                      {t.techTitle}
                      <span className="h-[1px] flex-grow bg-gradient-to-r from-zinc-700 to-transparent"></span>
                    </p>
                    <div className="flex flex-col gap-3 sm:gap-4">
                      <div className="flex flex-wrap gap-2 sm:gap-3 md:gap-4">
                        {techData.frontend.map((tech) => (
                          <TechTag key={tech.name} name={tech.name} description={item === "pt" ? tech.pt : tech.en} variant="light" />
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-2 sm:gap-3 md:gap-4">
                        {techData.backend.map((tech) => (
                          <TechTag key={tech.name} name={tech.name} description={item === "pt" ? tech.pt : tech.en} variant="dark" />
                        ))}
                      </div>
                    </div>
                  </div>
                </AnimatedSection>

                {/* 3. SEÇÃO PROJETOS (ATUALIZADA PARA HORIZONTAL) */}
                <AnimatedSection direction="left" className="mb-24">
                  <h2 className="text-[10px] sm:text-xs uppercase tracking-[0.3em] text-zinc-400 mb-8 md:mb-12 flex items-center gap-4 sm:gap-6 font-bold">
                    {t.projectsTitle}
                    <span className="h-[1px] flex-grow bg-gradient-to-r from-zinc-700 to-transparent"></span>
                  </h2>

                  {loading ? (
                    <div className="flex flex-col gap-6 md:gap-8">
                      {[1, 2].map((i) => (
                        <div key={i} className="flex flex-col md:flex-row rounded-3xl bg-zinc-950/40 border border-zinc-700/50 backdrop-blur-md overflow-hidden">
                          <Skeleton className="w-full md:w-[30%] aspect-video md:aspect-auto bg-zinc-800/50" />
                          <div className="flex-1 p-6 flex flex-col justify-center">
                            <Skeleton className="h-6 w-1/2 bg-zinc-800/50 mb-3" />
                            <Skeleton className="h-4 w-full bg-zinc-800/50 mb-2" />
                            <Skeleton className="h-4 w-5/6 bg-zinc-800/50" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : projects.length === 0 ? (
                    <p className="text-zinc-500 font-light italic">{t.empty}</p>
                  ) : (
                    <div className="flex flex-col gap-6 md:gap-8">
                      {projects.map((project) => (
                        <div 
                          key={project.id} 
                          className="relative flex flex-col md:flex-row group rounded-3xl bg-zinc-950/40 border border-zinc-700/50 backdrop-blur-md hover:bg-zinc-900/60 hover:border-zinc-500/50 transition-all duration-500 shadow-lg hover:shadow-2xl hover:shadow-black/50 cursor-pointer overflow-hidden"
                        >
                          <Link href={`/projects/${project.id}`} className="absolute inset-0 z-10">
                            <span className="sr-only">Ver detalhes do projeto {project.title_pt}</span>
                          </Link>

                          <div className="relative w-full md:w-[30%] aspect-video md:aspect-auto overflow-hidden bg-zinc-900 border-b md:border-b-0 md:border-r border-zinc-800/50">
                            <img 
                              src={project.image_urls?.[0] || "/placeholder.jpg"} 
                              alt={project.title_pt} 
                              className="object-cover w-full h-full opacity-80 transition-all duration-700 group-hover:opacity-100 group-hover:scale-110" 
                            />
                            <div className="absolute inset-0 bg-zinc-950/20 group-hover:bg-transparent transition-colors duration-500"></div>
                          </div>

                          <div className="flex-1 p-6 md:p-8 flex flex-col justify-center">
                            <h3 className="text-zinc-100 text-xl md:text-2xl font-bold mb-3 transition-colors group-hover:text-white">
                              {item === "pt" ? project.title_pt : project.title_en}
                            </h3>
                            <p className="text-zinc-400 text-sm md:text-base font-light leading-relaxed mb-6 md:mb-8 line-clamp-3 group-hover:text-zinc-300 transition-colors">
                              {item === "pt" ? project.description_pt : project.description_en}
                            </p>
                            
                            <div className="flex flex-wrap gap-4 sm:gap-6 mt-auto relative z-20">
                              <Link href={project.github_url} target="_blank" className="flex items-center text-[10px] sm:text-xs uppercase tracking-widest text-zinc-500 hover:text-white transition-colors font-bold group/link">
                                <GithubIcon className="w-4 h-4 mr-1.5 sm:mr-2 group-hover/link:text-white transition-colors" />
                                {t.githubBtn}
                              </Link>
                              {project.live_url && (
                                <Link href={project.live_url} target="_blank" className="flex items-center text-[10px] sm:text-xs uppercase tracking-widest text-zinc-500 hover:text-white transition-colors font-bold group/link">
                                  <ArrowUpRight className="w-4 h-4 mr-1 group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5 transition-transform" />
                                  {t.liveBtn}
                                </Link>
                              )}
                            </div>
                          </div>

                        </div>
                      ))}
                    </div>
                  )}
                </AnimatedSection>

                <footer className="mt-24 mb-8 md:mb-10 text-center">
                  <p className="text-[10px] sm:text-[11px] uppercase tracking-[0.5em] text-zinc-500 font-bold">
                    L. Lima &bull; {new Date().getFullYear()}
                  </p>
                </footer>

              </animated.div>
            );
          })}
        </div>
      </main>
    </>
  );
}