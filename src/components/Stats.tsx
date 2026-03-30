import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, ChartColumn, CheckCircle, XCircle, Activity, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

type GameStat = {
  date: string;
  score: number;
  total: number;
};

type UserStats = {
  totalGames: number;
  totalQuestions: number;
  correctAnswers: number;
  history: GameStat[];
};

export default function Stats() {
  const [stats, setStats] = useState<UserStats | null>(null);

  useEffect(() => {
    const savedStats = localStorage.getItem('quiz_stats');
    if (savedStats) {
      setStats(JSON.parse(savedStats));
    }
  }, []);

  if (!stats || stats.totalGames === 0) {
    return (
      <div className="min-h-screen text-white p-4 md:p-8 flex flex-col items-center justify-center">
        <ChartColumn size={64} className="text-purple-400 mb-6 drop-shadow-md" />
        <h2 className="text-2xl font-bold mb-4 text-center">Nenhuma estatística disponível</h2>
        <p className="text-slate-300 mb-8 text-center max-w-md">
          Jogue algumas partidas para ver seu histórico de erros e acertos aqui.
        </p>
        <Link to="/" className="bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 text-white px-8 py-3 rounded-full font-bold transition-colors shadow-xl">
          Voltar ao Início
        </Link>
      </div>
    );
  }

  const incorrectAnswers = stats.totalQuestions - stats.correctAnswers;
  const accuracy = Math.round((stats.correctAnswers / stats.totalQuestions) * 100) || 0;

  return (
    <div className="min-h-screen text-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/" className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-xl font-bold flex items-center gap-3">
            <ChartColumn className="text-purple-400 drop-shadow-md" />
            Meu Histórico
          </h1>
        </div>

        {/* Resumo Geral */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10 flex flex-col items-center justify-center text-center shadow-xl"
          >
            <Activity className="text-cyan-400 mb-2 drop-shadow-md" size={32} />
            <div className="text-3xl font-black text-white mb-1 drop-shadow-sm">{stats.totalGames}</div>
            <div className="text-sm text-slate-300 font-medium uppercase tracking-wider">Partidas Jogadas</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10 flex flex-col items-center justify-center text-center shadow-xl"
          >
            <ChartColumn className="text-purple-400 mb-2 drop-shadow-md" size={32} />
            <div className="text-3xl font-black text-white mb-1 drop-shadow-sm">{accuracy}%</div>
            <div className="text-sm text-slate-300 font-medium uppercase tracking-wider">Precisão Média</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-green-500/10 backdrop-blur-md p-6 rounded-2xl border border-green-500/30 flex flex-col items-center justify-center text-center relative overflow-hidden shadow-xl"
          >
            <div className="absolute inset-0 bg-green-500/5"></div>
            <CheckCircle className="text-green-400 mb-2 relative z-10 drop-shadow-md" size={32} />
            <div className="text-3xl font-black text-green-400 mb-1 relative z-10 drop-shadow-sm">{stats.correctAnswers}</div>
            <div className="text-sm text-green-400/80 font-medium uppercase tracking-wider relative z-10">Acertos Totais</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-red-500/10 backdrop-blur-md p-6 rounded-2xl border border-red-500/30 flex flex-col items-center justify-center text-center relative overflow-hidden shadow-xl"
          >
            <div className="absolute inset-0 bg-red-500/5"></div>
            <XCircle className="text-red-400 mb-2 relative z-10 drop-shadow-md" size={32} />
            <div className="text-3xl font-black text-red-400 mb-1 relative z-10 drop-shadow-sm">{incorrectAnswers}</div>
            <div className="text-sm text-red-400/80 font-medium uppercase tracking-wider relative z-10">Erros Totais</div>
          </motion.div>
        </div>

        {/* Histórico de Partidas */}
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Calendar className="text-slate-300 drop-shadow-md" />
          Últimas Partidas
        </h2>
        
        <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden shadow-xl">
          <div className="grid grid-cols-12 gap-4 p-4 border-b border-white/10 bg-white/5 font-semibold text-slate-200">
            <div className="col-span-4 md:col-span-3">Data</div>
            <div className="col-span-4 md:col-span-6 text-center">Desempenho</div>
            <div className="col-span-4 md:col-span-3 text-right">Acertos</div>
          </div>
          <div className="divide-y divide-white/5">
            {stats.history.map((game, index) => {
              const gameAccuracy = Math.round((game.score / game.total) * 100);
              const date = new Date(game.date);
              
              return (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  key={index}
                  className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-white/5 transition-colors"
                >
                  <div className="col-span-4 md:col-span-3 text-sm text-slate-300">
                    {date.toLocaleDateString('pt-BR')} <br className="md:hidden" />
                    <span className="text-slate-400 text-xs">{date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  
                  <div className="col-span-4 md:col-span-6 flex items-center justify-center gap-3">
                    <div className="w-full max-w-[200px] h-3 bg-black/30 rounded-full overflow-hidden flex border border-white/5">
                      <div 
                        className="h-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" 
                        style={{ width: `${gameAccuracy}%` }}
                      ></div>
                      <div 
                        className="h-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" 
                        style={{ width: `${100 - gameAccuracy}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-bold w-12 text-center hidden md:block text-slate-200">
                      {gameAccuracy}%
                    </span>
                  </div>
                  
                  <div className="col-span-4 md:col-span-3 text-right">
                    <span className="text-xl font-bold text-green-400 drop-shadow-sm">{game.score}</span>
                    <span className="text-slate-400 text-sm ml-1">/ {game.total}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
