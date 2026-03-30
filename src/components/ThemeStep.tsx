import { motion } from 'motion/react';
import { ArrowLeft, Dices, BookOpen } from 'lucide-react';
import { ActionCard } from './ui/ActionCard';

type Theme = { id: string; name: string; category_id: string };

type ThemeStepProps = {
  themes: Theme[];
  categoryName?: string;
  onBack: () => void;
  onSelectTheme: (id: string) => void;
  onPlayAny: () => void;
};

export function ThemeStep({ themes, categoryName, onBack, onSelectTheme, onPlayAny }: ThemeStepProps) {
  return (
    <motion.div
      key="theme-step"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="w-full"
    >
      <div className="flex items-center justify-center gap-4 mb-6 relative">
        <button 
          onClick={onBack} 
          className="absolute left-0 p-2 hover:bg-white/10 rounded-full transition-colors text-slate-300 hover:text-white"
        >
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-200 px-10 text-center">
          Temas em {categoryName}
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <ActionCard
          onClick={onPlayAny}
          icon={<Dices size={40} />}
          title="Qualquer Tema"
          iconColorClass="text-purple-400"
          hoverBorderClass="hover:border-purple-500"
        />

        {themes.map(t => (
          <ActionCard
            key={t.id}
            onClick={() => onSelectTheme(t.id)}
            icon={<BookOpen size={40} />}
            title={t.name}
            iconColorClass="text-purple-400"
            hoverBorderClass="hover:border-purple-500"
          />
        ))}
      </div>
    </motion.div>
  );
}
