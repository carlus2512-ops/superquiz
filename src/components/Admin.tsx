import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { generateQuestions } from '../lib/gemini';
import { Loader2, Plus, Sparkles, Save, ArrowLeft, Database, Info, CheckCircle2, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

type Category = { id: string; name: string };
type Theme = { id: string; name: string; category_id: string };

export default function Admin() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [themes, setThemes] = useState<Theme[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  
  const [newCategory, setNewCategory] = useState('');
  const [newTheme, setNewTheme] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTheme, setSelectedTheme] = useState('');
  const [difficulty, setDifficulty] = useState('médio');
  const [questionCount, setQuestionCount] = useState(5);
  
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState('');
  const [generationStatus, setGenerationStatus] = useState<'idle' | 'generating' | 'saving' | 'success' | 'error'>('idle');

  useEffect(() => {
    async function loadInitialData() {
      setInitialLoading(true);
      await Promise.all([fetchCategories(), fetchThemes()]);
      setInitialLoading(false);
    }
    loadInitialData();
  }, []);

  async function fetchCategories() {
    const { data } = await supabase.from('Categories').select('*').order('name');
    if (data) setCategories(data);
  }

  async function fetchThemes() {
    const { data } = await supabase.from('themes').select('*').order('name');
    if (data) setThemes(data);
  }

  async function handleAddCategory(e: React.FormEvent) {
    e.preventDefault();
    if (!newCategory.trim()) return;
    
    setLoading(true);
    const { error } = await supabase.from('Categories').insert([{ name: newCategory }]);
    if (!error) {
      setNewCategory('');
      fetchCategories();
      setMessage('Categoria adicionada!');
    } else {
      console.error('Supabase error:', error);
      setMessage(`Erro ao adicionar categoria: ${error.message}`);
    }
    setLoading(false);
  }

  async function handleAddTheme(e: React.FormEvent) {
    e.preventDefault();
    if (!newTheme.trim() || !selectedCategory) return;
    
    setLoading(true);
    const { error } = await supabase.from('themes').insert([{ name: newTheme, category_id: selectedCategory }]);
    if (!error) {
      setNewTheme('');
      fetchThemes();
      setMessage('Tema adicionado!');
    } else {
      console.error('Supabase error:', error);
      setMessage(`Erro ao adicionar tema: ${error.message}`);
    }
    setLoading(false);
  }

  async function handleGenerateAndSave() {
    if (!selectedCategory || !selectedTheme) {
      setMessage('Selecione uma categoria e um tema primeiro.');
      return;
    }

    const category = categories.find(c => c.id === selectedCategory);
    const theme = themes.find(t => t.id === selectedTheme);

    if (!category || !theme) return;

    setGenerating(true);
    setGenerationStatus('generating');
    setMessage('');
    
    try {
      const questions = await generateQuestions(category.name, theme.name, difficulty, questionCount);
      
      setGenerationStatus('saving');
      
      const formattedQuestions = questions.map((q: any) => ({
        category_id: selectedCategory,
        theme_id: selectedTheme,
        text: q.text,
        options: JSON.stringify(q.options),
        correct_answer: q.correct_answer,
        explanation: q.explanation
      }));

      const { error } = await supabase.from('Questions').insert(formattedQuestions);
      
      if (!error) {
        setGenerationStatus('success');
        setTimeout(() => setGenerationStatus('idle'), 5000);
      } else {
        console.error('Supabase error:', error);
        setGenerationStatus('error');
        setMessage(`Erro ao salvar perguntas: ${error.message}`);
      }
    } catch (error: any) {
      console.error(error);
      setGenerationStatus('error');
      setMessage(`Erro ao gerar perguntas: ${error.message}`);
    }
    setGenerating(false);
  }

  const filteredThemes = themes.filter(t => t.category_id === selectedCategory);

  return (
    <div className="min-h-screen text-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto w-full">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link to="/" className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <ArrowLeft size={24} />
            </Link>
            <h1 className="text-x1 font-bold text-slate-50 drop-shadow-md">Painel de Controle</h1>
          </div>
          <Link 
            to="/admin/content" 
            className="flex items-center gap-2 border border-white/10 bg-sky/5 backdrop-blur-md text-white p-4 rounded-full font-bold transition-colors hover:bg-white/5 shadow-xl"
          >
            <Database size={20} />
            <span className="hidden sm:inline">Gerenciar Perguntas</span>
          </Link>
        </div>

        {message && (
          <div className="bg-blue-500/20 backdrop-blur-md border border-blue-500/50 text-blue-100 p-4 rounded-lg mb-6 shadow-xl">
            {message}
          </div>
        )}

        {initialLoading ? (
          <div className="space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white/5 backdrop-blur-md p-6 rounded-xl border border-white/10 h-48 animate-pulse shadow-xl"></div>
              <div className="bg-white/5 backdrop-blur-md p-6 rounded-xl border border-white/10 h-48 animate-pulse shadow-xl"></div>
            </div>
            <div className="bg-white/5 backdrop-blur-md p-6 rounded-xl border border-white/10 h-64 animate-pulse shadow-xl"></div>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              {/* Categorias */}
              <div className="bg-white/5 backdrop-blur-md p-6 rounded-xl shadow-xl border border-white/10">
                <h2 className="text-xl font-semibold mb-4 text-slate-200">Categorias</h2>
                <form onSubmit={handleAddCategory} className="flex gap-2 mb-4">
                  <input
                    type="text"
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value)}
                    placeholder="Nova categoria..."
                    className="flex-1 bg-black/20 text-white placeholder:text-white/30 text-center border border-white/10 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-sky/10 backdrop-blur-md border border-white/10 text-white p-2 rounded-full hover:bg-cyan-600 disabled:opacity-50 transition-colors shadow-lg"
                  >
                    <Plus size={24} />
                  </button>
                </form>
                <ul className="space-y-2 max-h-48 overflow-y-auto">
                  
                </ul>
              </div>

              {/* Temas */}
              <div className="bg-white/5 backdrop-blur-md text-white p-6 rounded-xl shadow-xl border border-white/10">
                <h2 className="text-xl font-semibold mb-4 text-slate-200">Temas</h2>
                <form onSubmit={handleAddTheme} className="flex flex-col gap-2 mb-4">
                  <select
                    value={selectedCategory}
                    onChange={e => setSelectedCategory(e.target.value)}
                    className="border border-white/10 bg-black/20 rounded-full text-center px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white"
                  >
                    <option value="" className="text-slate-900">Selecione uma categoria...</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id} className="text-slate-900">{c.name}</option>
                    ))}
                  </select>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newTheme}
                      onChange={e => setNewTheme(e.target.value)}
                      placeholder="Novo tema..."
                      className="flex-1 bg-black/20 text-white placeholder:text-white/30 text-center border border-white/10 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                    <button
                      type="submit"
                      disabled={loading || !selectedCategory}
                      className="bg-sky/10 backdrop-blur-md border border-white/10 text-white p-2 rounded-full hover:bg-cyan-600 disabled:opacity-70 transition-colors shadow-lg"
                    >
                      <Plus size={24} />
                    </button>
                  </div>
                </form>
                
              </div>
            </div>

            {/* Gerador de Perguntas */}
            <div className="bg-white/5 backdrop-blur-md text-white p-6 rounded-xl shadow-xl border border-white/10">
              <div className="flex items-center gap-2 mb-6">
                <Sparkles className="text-sky-400 drop-shadow-md" size={24} />
                <h2 className="text-xl font-semibold text-slate-200">Gerador de Perguntas</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-bold text-slate-300">
                    Categoria
                    <div className="group relative flex items-center">
                      <Info size={16} className="text-cyan-400/80 cursor-help" />
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-48 p-2 bg-slate-900/90 backdrop-blur-sm text-white text-xs rounded shadow-lg z-10 text-center border border-white/10">
                        A grande área de conhecimento da pergunta.
                      </div>
                    </div>
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={e => setSelectedCategory(e.target.value)}
                    className="w-full border border-white/10 bg-black/20 text-center rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white"
                  >
                    <option value="" className="text-slate-900">Escolha a Categoria</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id} className="text-slate-900">{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-bold text-slate-300">
                    Tema
                    <div className="group relative flex items-center">
                      <Info size={16} className="text-cyan-400/80 cursor-help" />
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-48 p-2 bg-slate-900/90 backdrop-blur-sm text-white text-xs rounded shadow-lg z-10 text-center border border-white/10">
                        O assunto específico dentro da categoria.
                      </div>
                    </div>
                  </label>
                  <select
                    value={selectedTheme}
                    onChange={e => setSelectedTheme(e.target.value)}
                    className="w-full border border-white/10 bg-black/20 text-center rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white"
                    disabled={!selectedCategory}
                  >
                    <option value="" className="text-sky-900">Escolha o Tema</option>
                    {filteredThemes.map(t => (
                      <option key={t.id} value={t.id} className="text-slate-900">{t.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-bold text-slate-300">
                    Dificuldade
                    <div className="group relative flex items-center">
                      <Info size={16} className="text-cyan-400/80 cursor-help" />
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-48 p-2 bg-slate-900/90 backdrop-blur-sm text-white text-xs rounded shadow-lg z-10 text-center border border-white/10">
                        Nível de complexidade das perguntas geradas.
                      </div>
                    </div>
                  </label>
                  <select
                    value={difficulty}
                    onChange={e => setDifficulty(e.target.value)}
                    className="w-full border border-white/10 bg-black/20 text-center rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white"
                  >
                    <option value="fácil" className="text-slate-900">Fácil</option>
                    <option value="médio" className="text-slate-900">Médio</option>
                    <option value="difícil" className="text-slate-900">Difícil</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-bold text-slate-300">
                    Quantidade
                    <div className="group relative flex items-center">
                      <Info size={16} className="text-cyan-400/80 cursor-help" />
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-48 p-2 bg-slate-900/90 backdrop-blur-sm text-white text-xs rounded shadow-lg z-10 text-center border border-white/10">
                        Número de perguntas a serem geradas (máx 20).
                      </div>
                    </div>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={questionCount}
                    onChange={e => setQuestionCount(Number(e.target.value))}
                    className="w-full bg-black/20 text-white text-center border border-white/10 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>

              {/* Visual Feedback Area */}
              {generationStatus !== 'idle' && (
                <div className={`mb-6 p-4 rounded-lg border backdrop-blur-md flex items-start gap-4 transition-all shadow-xl ${
                  generationStatus === 'error' ? 'bg-red-500/20 border-red-500/50' :
                  generationStatus === 'success' ? 'bg-green-500/20 border-green-500/50' :
                  'bg-purple-500/20 border-purple-500/50'
                }`}>
                  {generationStatus === 'generating' || generationStatus === 'saving' ? (
                    <Loader2 className="animate-spin text-purple-400 mt-0.5 shrink-0" size={20} />
                  ) : generationStatus === 'success' ? (
                    <CheckCircle2 className="text-green-400 mt-0.5 shrink-0" size={20} />
                  ) : (
                    <AlertCircle className="text-red-400 mt-0.5 shrink-0" size={20} />
                  )}
                  
                  <div>
                    <h3 className={`font-bold ${
                      generationStatus === 'error' ? 'text-red-300' :
                      generationStatus === 'success' ? 'text-green-300' :
                      'text-purple-300'
                    }`}>
                      {generationStatus === 'generating' && 'Gerando perguntas com IA...'}
                      {generationStatus === 'saving' && 'Salvando no banco de dados...'}
                      {generationStatus === 'success' && 'Sucesso!'}
                      {generationStatus === 'error' && 'Ocorreu um erro'}
                    </h3>
                    <p className={`text-sm mt-1 ${
                      generationStatus === 'error' ? 'text-red-200' :
                      generationStatus === 'success' ? 'text-green-200' :
                      'text-purple-200'
                    }`}>
                      {generationStatus === 'generating' && `A inteligência artificial está criando ${questionCount} perguntas inéditas. Isso pode levar alguns segundos.`}
                      {generationStatus === 'saving' && 'As perguntas foram geradas e estão sendo armazenadas.'}
                      {generationStatus === 'success' && `${questionCount} perguntas foram geradas e salvas com sucesso!`}
                      {generationStatus === 'error' && message}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex justify-end">
                <button
                  onClick={handleGenerateAndSave}
                  disabled={generating || !selectedCategory || !selectedTheme}
                  className="bg-sky/5 backdrop-blur-md border border-white/10 px-6 py-2.5 rounded-full hover:bg-white/10 disabled:opacity-70 text-cyan-400/80 flex items-center justify-center gap-2 font-bold transition-colors w-full md:w-auto shadow-xl"
                >
                  {generating ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
                  <span className="text-white">{generating ? 'Processando...' : 'Gerar e Salvar'}</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
