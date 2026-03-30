import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { motion } from 'motion/react';
import { ArrowLeft, Trophy, Medal } from 'lucide-react';
import { Link } from 'react-router-dom';

type Score = {
  id: string;
  player_name: string;
  score: number;
  total_questions: number;
  created_at: string;
};

export default function HighScores() {
  const [scores, setScores] = useState<Score[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchScores();
  }, []);

  async function fetchScores() {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('Scores')
        .select('*')
        .order('score', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        throw error;
      }

      if (data) {
        setScores(data);
      }
    } catch (err: any) {
      console.error('Erro ao buscar pontuações:', err);
      setError('Não foi possível carregar as pontuações. A tabela "Scores" pode não existir.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen text-white p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/" className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-xl font-bold flex items-center gap-3">
            <Trophy className="text-yellow-400 drop-shadow-md" />
            Melhores Pontuações
          </h1>
        </div>

        {loading ? (
          <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden shadow-xl">
            <div className="grid grid-cols-12 gap-4 p-4 border-b border-white/10 bg-white/5">
              <div className="col-span-2 text-center h-6 bg-white/10 rounded animate-pulse"></div>
              <div className="col-span-6 h-6 bg-white/10 rounded animate-pulse"></div>
              <div className="col-span-4 h-6 bg-white/10 rounded animate-pulse"></div>
            </div>
            <div className="divide-y divide-white/5">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="grid grid-cols-12 gap-4 p-4 items-center">
                  <div className="col-span-2 flex justify-center">
                    <div className="w-8 h-8 bg-white/10 rounded-full animate-pulse"></div>
                  </div>
                  <div className="col-span-6 h-6 bg-white/10 rounded animate-pulse"></div>
                  <div className="col-span-4 h-8 bg-white/10 rounded animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-500/20 backdrop-blur-md border border-red-500/50 text-red-100 p-6 rounded-xl text-center shadow-xl">
            <p className="mb-4">{error}</p>
            <div className="bg-black/30 p-4 rounded text-left text-sm font-mono overflow-x-auto border border-white/10">
              <p className="text-slate-300 mb-2">Execute este SQL no Supabase para criar a tabela:</p>
              <pre className="text-green-400">
{`CREATE TABLE "Scores" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_name TEXT NOT NULL,
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE "Scores" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Leitura pública em Scores" ON "Scores" FOR SELECT USING (true);
CREATE POLICY "Inserção pública em Scores" ON "Scores" FOR INSERT WITH CHECK (true);`}
              </pre>
            </div>
          </div>
        ) : scores.length === 0 ? (
          <div className="text-center text-slate-300 py-12 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-xl">
            Nenhuma pontuação registrada ainda. Seja o primeiro a jogar!
          </div>
        ) : (
          <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden shadow-xl">
            <div className="grid grid-cols-12 gap-4 p-4 border-b border-white/10 bg-white/5 font-semibold text-slate-300">
              <div className="col-span-2 text-center">Posição</div>
              <div className="col-span-6">Jogador</div>
              <div className="col-span-4 text-right">Pontuação</div>
            </div>
            <div className="divide-y divide-white/5">
              {scores.map((score, index) => (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  key={score.id}
                  className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-white/5 transition-colors"
                >
                  <div className="col-span-2 flex justify-center">
                    {index === 0 ? (
                      <Medal className="text-yellow-400 drop-shadow-md" size={28} />
                    ) : index === 1 ? (
                      <Medal className="text-slate-300 drop-shadow-md" size={28} />
                    ) : index === 2 ? (
                      <Medal className="text-amber-600 drop-shadow-md" size={28} />
                    ) : (
                      <span className="text-slate-400 font-bold text-lg">{index + 1}º</span>
                    )}
                  </div>
                  <div className="col-span-6 font-medium text-lg truncate text-slate-100">
                    {score.player_name}
                  </div>
                  <div className="col-span-4 text-right">
                    <span className="text-2xl font-bold text-cyan-400 drop-shadow-sm">{score.score}</span>
                    <span className="text-slate-400 text-sm ml-1">/ {score.total_questions}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
