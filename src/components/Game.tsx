import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, CheckCircle2, XCircle, Trophy, RefreshCw } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';

type Question = {
  id: string;
  text: string;
  options: string;
  correct_answer: string;
  explanation: string;
};

export default function Game() {
  const [searchParams] = useSearchParams();
  const categoryId = searchParams.get('category');
  const themeId = searchParams.get('theme');

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [statsSavedLocal, setStatsSavedLocal] = useState(false);

  useEffect(() => {
    fetchQuestions();
  }, [categoryId, themeId]);

  useEffect(() => {
    if (gameOver && !statsSavedLocal) {
      const savedStats = localStorage.getItem('quiz_stats');
      const stats = savedStats ? JSON.parse(savedStats) : { totalGames: 0, totalQuestions: 0, correctAnswers: 0, history: [] };

      stats.totalGames += 1;
      stats.totalQuestions += questions.length;
      stats.correctAnswers += score;
      stats.history.unshift({
        date: new Date().toISOString(),
        score,
        total: questions.length
      });

      if (stats.history.length > 50) stats.history.pop();

      localStorage.setItem('quiz_stats', JSON.stringify(stats));
      setStatsSavedLocal(true);
    }
  }, [gameOver, statsSavedLocal, questions.length, score]);

  async function fetchQuestions() {
    setLoading(true);
    
    let query = supabase.from('Questions').select('*');
    
    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }
    if (themeId) {
      query = query.eq('theme_id', themeId);
    }

    const { data, error } = await query;
      
    if (data && data.length > 0) {
      // Shuffle all matching questions to ensure randomness and avoid repetition
      const shuffled = [...data].sort(() => 0.5 - Math.random());
      // Take up to 10 questions for the session
      setQuestions(shuffled.slice(0, 10));
    } else {
      setQuestions([]);
    }
    setLoading(false);
  }

  function handleAnswer(answer: string) {
    if (selectedAnswer) return;
    
    setSelectedAnswer(answer);
    setShowExplanation(true);
    
    if (answer === questions[currentIndex].correct_answer) {
      setScore(s => s + 1);
    }
  }

  function nextQuestion() {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(c => c + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      setGameOver(true);
    }
  }

  function restartGame() {
    setCurrentIndex(0);
    setScore(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setGameOver(false);
    setScoreSaved(false);
    setStatsSavedLocal(false);
    setPlayerName('');
    fetchQuestions();
  }

  const [playerName, setPlayerName] = useState('');
  const [scoreSaved, setScoreSaved] = useState(false);
  const [savingScore, setSavingScore] = useState(false);

  async function saveScore() {
    if (!playerName.trim() || scoreSaved) return;
    setSavingScore(true);
    
    const { error } = await supabase.from('Scores').insert([{
      player_name: playerName.trim(),
      score: score,
      total_questions: questions.length
    }]);

    if (!error) {
      setScoreSaved(true);
    } else {
      console.error('Erro ao salvar pontuação:', error);
      alert('Erro ao salvar pontuação. Certifique-se de que a tabela Scores existe.');
    }
    setSavingScore(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen text-white p-4 md:p-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <Link to="/" className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <ArrowLeft size={24} />
            </Link>
            <div className="h-6 w-32 bg-white/10 rounded animate-pulse"></div>
            <div className="h-8 w-24 bg-white/10 rounded-full animate-pulse"></div>
          </div>
          <div className="bg-white/5 backdrop-blur-md p-6 md:p-8 rounded-2xl border border-white/10 shadow-xl">
            <div className="h-8 bg-white/10 rounded w-3/4 mb-4 animate-pulse"></div>
            <div className="h-8 bg-white/10 rounded w-1/2 mb-8 animate-pulse"></div>
            <div className="flex flex-col gap-3 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-16 bg-white/10 rounded-xl animate-pulse"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-white p-4">
        <h2 className="text-2xl mb-4 text-center">Nenhuma pergunta encontrada para os filtros selecionados.</h2>
        <Link to="/" className="bg-cyan-600/80 backdrop-blur-md border border-cyan-500/50 px-6 py-3 rounded-full font-bold mb-4 hover:bg-cyan-600 transition-colors shadow-lg">
          Voltar e escolher outra categoria
        </Link>
        <Link to="/admin" className="bg-white/10 backdrop-blur-md border border-white/20 px-6 py-3 rounded-full font-bold hover:bg-white/20 transition-colors shadow-lg">
          Ir para o Painel de Controle para criar perguntas
        </Link>
      </div>
    );
  }

  if (gameOver) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-white p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white/5 backdrop-blur-xl p-8 rounded-2xl max-w-md w-full text-center border border-white/10 shadow-2xl"
        >
          <Trophy className="w-24 h-24 mx-auto text-yellow-400 mb-6 drop-shadow-lg" />
          <h2 className="text-4xl font-black mb-2">Fim de Jogo!</h2>
          <p className="text-xl text-slate-300 mb-8">
            Você acertou {score} de {questions.length} perguntas.
          </p>

          {!scoreSaved ? (
            <div className="mb-8 flex flex-col gap-2">
              <input
                type="text"
                placeholder="Seu nome"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                className="bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-white/30"
              />
              <button
                onClick={saveScore}
                disabled={savingScore || !playerName.trim()}
                className="bg-teal-600/80 backdrop-blur-md border border-teal-500/50 hover:bg-teal-600 text-white px-6 py-3 rounded-xl font-bold transition-colors disabled:opacity-50 shadow-lg"
              >
                {savingScore ? 'Salvando...' : 'Salvar Pontuação'}
              </button>
            </div>
          ) : (
            <div className="mb-8 bg-teal-500/20 border border-teal-500/50 text-teal-100 p-4 rounded-xl backdrop-blur-md">
              Pontuação salva com sucesso!
            </div>
          )}

          <div className="flex flex-col gap-4">
            <button
              onClick={restartGame}
              className="bg-cyan-600/80 backdrop-blur-md border border-cyan-500/50 hover:bg-cyan-600 text-white px-6 py-3 rounded-xl font-bold transition-colors shadow-lg"
            >
              Jogar Novamente
            </button>
            <Link
              to="/highscores"
              className="bg-purple-600/80 backdrop-blur-md border border-purple-500/50 hover:bg-purple-600 text-white px-6 py-3 rounded-xl font-bold transition-colors shadow-lg"
            >
              Ver Melhores Pontuações
            </Link>
            <Link
              to="/"
              className="bg-white/10 backdrop-blur-md hover:bg-white/20 border border-white/20 text-white px-6 py-3 rounded-xl font-bold transition-colors shadow-lg"
            >
              Voltar ao Início
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  let options: string[] = [];
  try {
    options = typeof currentQ.options === 'string' ? JSON.parse(currentQ.options) : currentQ.options;
  } catch (e) {
    options = [];
  }

  return (
    <div className="min-h-screen text-white p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Link to="/" className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <ArrowLeft size={24} />
          </Link>
          <div className="text-slate-300 font-medium">
            Pergunta {currentIndex + 1} de {questions.length}
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/10 px-4 py-1 rounded-full font-bold text-white">
            Pontos: {score}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -50, opacity: 0 }}
            className="bg-white/5 backdrop-blur-xl p-6 md:p-8 rounded-2xl border border-white/10 shadow-2xl"
          >
            <h2 className="text-md md:text-md font-bold mb-8 leading-tight">
              {currentQ.text}
            </h2>

            <div className="flex flex-col gap-3 mb-8">
              {options.map((opt, i) => {
                const isSelected = selectedAnswer === opt;
                const isCorrect = opt === currentQ.correct_answer;
                const showStatus = selectedAnswer !== null;
                
                let btnClass = "bg-white/5 hover:bg-white/10 border-white/10";
                if (showStatus) {
                  if (isCorrect) btnClass = "bg-teal-500/20 border-teal-500/50 text-teal-100";
                  else if (isSelected) btnClass = "bg-rose-500/20 border-rose-500/50 text-rose-100";
                  else btnClass = "bg-white/5 border-white/5 opacity-50";
                }

                return (
                  <button
                    key={i}
                    onClick={() => handleAnswer(opt)}
                    disabled={showStatus}
                    className={`p-4 rounded-xl border-2 text-left text-md font-medium transition-all flex items-center justify-between backdrop-blur-sm ${btnClass}`}
                  >
                    <span>{opt}</span>
                    {showStatus && isCorrect && <CheckCircle2 className="text-teal-400" />}
                    {showStatus && isSelected && !isCorrect && <XCircle className="text-rose-400" />}
                  </button>
                );
              })}
            </div>

          </motion.div>
        </AnimatePresence>
      </div>

      {/* Modal de Feedback */}
      <AnimatePresence>
        {showExplanation && (
          <div className="fixed inset-0 bg-sky/20 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-blue-900/10 backdrop-blur-xl border border-white/20 p-8 rounded-2xl max-w-lg w-full shadow-2xl relative"
            >
              <div className="flex flex-col items-center text-center mb-6">
                {selectedAnswer === currentQ.correct_answer ? (
                  <>
                    <div className="w-16 h-16 bg-teal-500/20 rounded-full flex items-center justify-center mb-4 shrink-0 border border-teal-500/30">
                      <CheckCircle2 className="text-teal-400 w-10 h-10" />
                    </div>
                    <h2 className="text-2xl sm:text-xl font-bold text-teal-400 mb-2">Parabéns, você acertou.</h2>
                  </>
                ) : (
                  <>
                    <div className="w-16 h-16 bg-rose-500/20 rounded-full flex items-center justify-center mb-4 shrink-0 border border-rose-500/30">
                      <XCircle className="text-rose-400 w-10 h-10" />
                    </div>
                    <h2 className="text-2xl sm:text-xl font-bold text-rose-400 mb-2">Resposta errada.</h2>
                  </>
                )}
              </div>
              
              <div className="bg-black/30 p-6 rounded-xl border border-white/10 mb-8 max-h-64 overflow-y-auto">
                <h3 className="font-bold text-cyan-400 mb-2 text-left">Explicação:</h3>
                <p className="text-slate-200 leading-relaxed text-left">{currentQ.explanation}</p>
              </div>

              <button
                onClick={nextQuestion}
                className="w-full bg-sky/10 backdrop-blur-md border border-white/10 hover:bg-cyan/50 text-white p-4 rounded-full font-bold text-lg transition-colors shadow-lg"
              >
                {currentIndex < questions.length - 1 ? 'Próxima Pergunta' : 'Ver Resultado'}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
