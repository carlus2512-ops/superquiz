import { motion } from 'motion/react';
import { Play } from 'lucide-react';

type WelcomeStepProps = {
  onNext: () => void;
};

export function WelcomeStep({ onNext }: WelcomeStepProps) {
  return (
    <motion.div
      key="welcome-step"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="w-full flex flex-col items-center"
    >
      <button
        onClick={onNext}
        className="flex items-center justify-center gap-2 border border-white/20 bg-white/10 backdrop-blur-md text-white px-8 py-4 rounded-full font-bold text-lg transition-all hover:bg-white/20 hover:scale-105 active:scale-95 w-full max-w-xs shadow-xl"
      >
        <Play size={24} />
        Iniciar Jogo
      </button>
    </motion.div>
  );
}
