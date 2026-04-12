// src/app/page.tsx
"use client"; 

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import { supabase } from "@/lib/supabase";

// Defining the shape of our Project data coming from Supabase
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

export default function Home() {
  const { t, language, toggleLanguage } = useLanguage();
  
  // State to store the projects and loading status
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch projects when the component mounts
  useEffect(() => {
    async function fetchProjects() {
      try {
        // Fetching all data from the 'projects' table
        const { data, error } = await supabase
          .from("projects")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;
        
        if (data) {
          setProjects(data);
        }
      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        setIsLoading(false); // Stop loading regardless of success or error
      }
    }

    fetchProjects();
  }, []); // The empty array means this runs only once when the page loads

  return (
    <main className="flex flex-col items-center min-h-screen p-8 md:p-24 max-w-6xl mx-auto relative">
      
      {/* Language Toggle */}
      <div className="absolute top-8 right-8">
        <button 
          onClick={toggleLanguage}
          className="px-4 py-2 border border-zinc-700 rounded-full hover:bg-zinc-800 transition-colors text-sm font-medium"
        >
          {language === "en" ? "PT-BR" : "EN-US"}
        </button>
      </div>

      {/* Hero Section */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.8 }}
        className="text-center space-y-6 mt-16 md:mt-0"
      >
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
          {t.hero.greeting} <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-200 to-gray-500">{t.hero.role}</span>
        </h1>
        
        <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto">
          {t.hero.description}
        </p>

        <div className="flex gap-4 justify-center mt-8">
          <Link href="https://www.linkedin.com/in/leandrolimaandrade/" target="_blank" className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-full transition-colors font-medium">
            {t.hero.linkedin}
          </Link>
          <Link href="https://github.com/Leo-Elacosta" target="_blank" className="px-6 py-3 bg-white text-black hover:bg-gray-200 rounded-full transition-colors font-medium">
            {t.hero.github}
          </Link>
        </div>
      </motion.section>

      {/* Projects Section */}
      <motion.section 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        transition={{ duration: 1, delay: 0.5 }}
        className="mt-32 w-full"
      >
        <h2 className="text-3xl font-semibold mb-12 border-b border-zinc-700 pb-4">
          {t.projects.title}
        </h2>

        {isLoading ? (
          <div className="text-center text-zinc-500 animate-pulse">Loading projects...</div>
        ) : (
          /* CSS Grid for responsive cards */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project) => (
              <motion.div 
                key={project.id}
                whileHover={{ y: -5 }} // Slight lift effect on hover
                className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col"
              >
                {/* Project Image Placeholder */}
                <div className="h-48 bg-zinc-800 w-full relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={project.image_url} alt="Project" className="object-cover w-full h-full opacity-80" />
                </div>
                
                {/* Project Info */}
                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="text-xl font-bold mb-2">
                    {/* Choose title based on active language */}
                    {language === "en" ? project.title_en : project.title_pt}
                  </h3>
                  <p className="text-zinc-400 text-sm flex-grow mb-6">
                    {/* Choose description based on active language */}
                    {language === "en" ? project.description_en : project.description_pt}
                  </p>
                  
                  {/* Links */}
                  <div className="flex gap-4 text-sm font-medium">
                    <Link href={project.github_url} target="_blank" className="hover:text-gray-300 transition-colors">
                      GitHub →
                    </Link>
                    <Link href={project.live_url} target="_blank" className="hover:text-gray-300 transition-colors">
                      Live Demo →
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.section>

    </main>
  );
}