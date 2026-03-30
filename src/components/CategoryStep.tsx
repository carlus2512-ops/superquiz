import { motion } from 'motion/react';
import { ArrowLeft, Dices, Folder } from 'lucide-react';
import { ActionCard } from './ui/ActionCard';

type Category = { id: string; name: string };

type CategoryStepProps = {
  categories: Category[];
  onBack: () => void;
  onSelectCategory: (id: string) => void;
  onPlayAny: () => void;
};

export function CategoryStep({ categories, onBack, onSelectCategory, onPlayAny }: CategoryStepProps) {
  return (
    <motion.div
      key="category-step"
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
        <h2 className="text-xl sm:text-2xl font-bold text-slate-200 px-10 text-center">Escolha uma Categoria</h2>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <ActionCard
          onClick={onPlayAny}
          icon={<Dices size={40} />}
          title="Qualquer Categoria"
        />

        {categories.map(c => (
          <ActionCard
            key={c.id}
            onClick={() => onSelectCategory(c.id)}
            icon={<Folder size={40} />}
            title={c.name}
          />
        ))}
      </div>
    </motion.div>
  );
}
