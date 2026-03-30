import { BrainCog } from 'lucide-react';
import { motion } from 'motion/react';

export default function LoadingScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-white p-4">
      <motion.div
        animate={{ 
          scale: [1, 1.1, 1],
          opacity: [0.5, 1, 0.5]
        }}
        transition={{ 
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="flex justify-center mb-6"
      >
        <div className="bg-gradient-to-br from-cyan-500/20 to-violet-600/20 p-4 rounded-full border border-slate-700/50 shadow-2xl">
          <BrainCog size={64} className="text-cyan-400" />
        </div>
      </motion.div>
      <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-violet-600 animate-pulse">
        Carregando...
      </h2>
    </div>
  );
}
