import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../lib/supabase';
import { BrainCog } from 'lucide-react';

import { WelcomeStep } from './WelcomeStep';
import { CategoryStep } from './CategoryStep';
import { ThemeStep } from './ThemeStep';

type Category = { id: string; name: string };
type Theme = { id: string; name: string; category_id: string };

export default function Welcome() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [themes, setThemes] = useState<Theme[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [step, setStep] = useState<'welcome' | 'category' | 'theme'>('welcome');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const [catRes, themeRes] = await Promise.all([
        supabase.from('Categories').select('*').order('name'),
        supabase.from('themes').select('*').order('name')
      ]);
      if (catRes.data) setCategories(catRes.data);
      if (themeRes.data) setThemes(themeRes.data);
      setLoading(false);
    }
    fetchData();
  }, []);

  const filteredThemes = themes.filter(t => t.category_id === selectedCategory);

  const handleSelectCategory = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setStep('theme');
  };

  const handleStartGame = (themeId?: string) => {
    const params = new URLSearchParams();
    if (selectedCategory && step === 'theme') params.append('category', selectedCategory);
    if (themeId) params.append('theme', themeId);
    navigate(`/game?${params.toString()}`);
  };

  return (
    <div className="flex flex-col items-center justify-center text-white p-4 min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-4xl w-full"
      >
        <div className="flex justify-center mb-6 pt-12">
          <div className="bg-gradient-to-br from-cyan-500/20 to-violet-600/20 p-4 rounded-full border border-white/10 shadow-2xl">
            <BrainCog size={64} className="text-sky-400" />
          </div>
        </div>
        
        <h1 className="text-5xl md:text-5xl font-black mb-6 text-transparent bg-clip-text bg-sky-300">
          Super Quiz
        </h1>
        <p className="text-slate-100 text-base sm:text-lg md:text-xl text-center font-bold">
            Bem-vindo!
          </p>

          <p className="text-slate-100 text-sm sm:text-base md:text-lg text-center leading-relaxed mb-12">
            Teste seus conhecimentos, desafie sua mente e aprenda algo novo todos os dias.
          </p>
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 w-full max-w-md mx-auto">
            <div className="h-16 w-full bg-white/5 backdrop-blur-md rounded-2xl mb-4 animate-pulse border border-white/10 shadow-xl"></div>
            <div className="h-16 w-full bg-white/5 backdrop-blur-md rounded-2xl mb-4 animate-pulse border border-white/10 shadow-xl"></div>
            <div className="h-16 w-full bg-white/5 backdrop-blur-md rounded-2xl animate-pulse border border-white/10 shadow-xl"></div>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {step === 'welcome' && (
              <WelcomeStep onNext={() => setStep('category')} />
            )}

            {step === 'category' && (
              <CategoryStep
                categories={categories}
                onBack={() => setStep('welcome')}
                onSelectCategory={handleSelectCategory}
                onPlayAny={() => {
                  setSelectedCategory('');
                  handleStartGame();
                }}
              />
            )}

            {step === 'theme' && (
              <ThemeStep
                themes={filteredThemes}
                categoryName={categories.find(c => c.id === selectedCategory)?.name}
                onBack={() => setStep('category')}
                onSelectTheme={handleStartGame}
                onPlayAny={() => handleStartGame()}
              />
            )}
          </AnimatePresence>
        )}
      </motion.div>
    </div>
  );
}
