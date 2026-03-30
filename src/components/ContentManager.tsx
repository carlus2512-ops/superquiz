import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { ArrowLeft, Trash2, ChevronLeft, ChevronRight, Database, Folder, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

type Category = { id: string; name: string };
type Theme = { id: string; name: string; category_id: string };
type Question = {
  id: string;
  text: string;
  category_id: string;
  theme_id: string;
  correct_answer: string;
};

export default function ContentManager() {
  const [view, setView] = useState<'categories' | 'themes' | 'questions'>('categories');
  const [categoriesList, setCategoriesList] = useState<Category[]>([]);
  const [themesList, setThemesList] = useState<Theme[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [questionToDelete, setQuestionToDelete] = useState<string | null>(null);
  const itemsPerPage = 20;

  useEffect(() => {
    fetchRefs();
  }, []);

  useEffect(() => {
    if (view === 'questions' && selectedTheme) {
      fetchQuestions();
    }
  }, [currentPage, view, selectedTheme]);

  async function fetchRefs() {
    setLoading(true);
    const [catRes, themeRes] = await Promise.all([
      supabase.from('Categories').select('*').order('name'),
      supabase.from('themes').select('*').order('name')
    ]);

    if (catRes.data) setCategoriesList(catRes.data);
    if (themeRes.data) setThemesList(themeRes.data);
    setLoading(false);
  }

  async function fetchQuestions() {
    if (!selectedTheme) return;
    setLoading(true);

    const { count } = await supabase
      .from('Questions')
      .select('*', { count: 'exact', head: true })
      .eq('theme_id', selectedTheme.id);

    if (count !== null) setTotalCount(count);

    const from = (currentPage - 1) * itemsPerPage;
    const to = from + itemsPerPage - 1;

    const { data, error } = await supabase
      .from('Questions')
      .select('*')
      .eq('theme_id', selectedTheme.id)
      .order('id', { ascending: false })
      .range(from, to);

    if (data) {
      setQuestions(data);
    }
    setLoading(false);
  }

  async function confirmDelete() {
    if (!questionToDelete) return;
    const { error } = await supabase.from('Questions').delete().eq('id', questionToDelete);
    if (!error) {
      fetchQuestions();
    }
    setQuestionToDelete(null);
  }

  const totalPages = Math.ceil(totalCount / itemsPerPage) || 1;

  return (
    <div className="min-h-screen text-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link to="/admin" className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <ArrowLeft size={24} />
            </Link>
            <h1 className="text-xl font-bold text-slate-50 drop-shadow-md flex items-center gap-3">
              Gerenciador de Conteúdo
            </h1>
          </div>
          {view === 'questions' && (
            <div className="text-cyan-100 font-medium bg-white/10 backdrop-blur-md px-4 py-2 rounded-lg border border-white/20 shadow-xl">
              Total: {totalCount} perguntas
            </div>
          )}
        </div>

        {/* Breadcrumbs */}
        <div className="flex gap-2 text-sm mb-8 bg-white/5 backdrop-blur-md px-4 py-3 rounded-lg border border-white/10 shadow-xl overflow-x-auto items-center justify-center text-center group">
          <button
            onClick={() => { setView('categories'); setSelectedCategory(null); setSelectedTheme(null); }}
            className={`hover:text-cyan-300 text-center itens-center transition-colors whitespace-nowrap ${view === 'categories' ? 'font-bold text-cyan-400' : 'text-slate-300'}`}
          >
            Categorias
          </button>
          {selectedCategory && (
            <>
              <ChevronRight size={16} className="text-slate-400 shrink-0" />
              <button
                onClick={() => { setView('themes'); setSelectedTheme(null); }}
                className={`hover:text-cyan-300 transition-colors whitespace-nowrap ${view === 'themes' ? 'font-semibold text-cyan-400' : 'text-slate-300'}`}
              >
                {selectedCategory.name}
              </button>
            </>
          )}
          {selectedTheme && (
            <>
              <ChevronRight size={16} className="text-slate-400 shrink-0" />
              <span className="font-semibold text-cyan-400 whitespace-nowrap">{selectedTheme.name}</span>
            </>
          )}
        </div>

        {/* Views */}
        {loading && view !== 'questions' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white/5 backdrop-blur-md p-6 rounded-xl border border-white/10 h-40 animate-pulse flex flex-col items-center justify-center gap-4 shadow-xl">
                <div className="w-16 h-16 bg-white/10 rounded-full"></div>
                <div className="w-24 h-4 bg-white/10 rounded"></div>
              </div>
            ))}
          </div>
        ) : view === 'categories' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {categoriesList.map(cat => (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat);
                  setView('themes');
                }}
                className="bg-white/5 backdrop-blur-md p-6 rounded-xl shadow-xl border border-white/10 hover:border-cyan-500/50 hover:bg-white/10 transition-all flex flex-col items-center justify-center gap-4 text-center group"
              >
                <div className="bg-cyan-500/20 p-4 rounded-full group-hover:bg-cyan-500/40 group-hover:scale-110 transition-all border border-cyan-500/30">
                  <Folder className="text-cyan-300" size={32} />
                </div>
                <span className="font-semibold text-slate-200 text-lg">{cat.name}</span>
              </button>
            ))}
            {categoriesList.length === 0 && (
              <div className="col-span-full text-center p-12 text-slate-300 bg-white/5 backdrop-blur-md rounded-xl border border-white/10 shadow-xl">
                Nenhuma categoria encontrada.
              </div>
            )}
          </div>
        ) : view === 'themes' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {themesList.filter(t => t.category_id === selectedCategory?.id).map(theme => (
              <button
                key={theme.id}
                onClick={() => {
                  setSelectedTheme(theme);
                  setCurrentPage(1);
                  setView('questions');
                }}
                className="bg-white/5 backdrop-blur-md p-6 rounded-xl shadow-xl border border-white/10 hover:border-purple-500/50 hover:bg-white/10 transition-all flex flex-col items-center justify-center gap-4 text-center group"
              >
                <div className="bg-purple-500/20 p-4 rounded-full group-hover:bg-purple-500/40 group-hover:scale-110 transition-all border border-purple-500/30">
                  <BookOpen className="text-purple-300" size={32} />
                </div>
                <span className="font-semibold text-slate-200 text-lg">{theme.name}</span>
              </button>
            ))}
            {themesList.filter(t => t.category_id === selectedCategory?.id).length === 0 && (
              <div className="col-span-full text-center p-12 text-slate-300 bg-white/5 backdrop-blur-md rounded-xl border border-white/10 shadow-xl">
                Nenhum tema encontrado nesta categoria.
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white/5 backdrop-blur-md rounded-xl shadow-xl border border-white/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/5 border-b border-white/10 text-slate-300">
                    <th className="p-4 font-semibold">Pergunta</th>
                    <th className="p-4 font-semibold w-24 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {loading ? (
                    [...Array(5)].map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="p-4">
                          <div className="h-5 bg-white/10 rounded w-3/4 mb-2"></div>
                          <div className="h-4 bg-white/10 rounded w-1/4"></div>
                        </td>
                        <td className="p-4 text-center">
                          <div className="h-8 w-8 bg-white/10 rounded-lg mx-auto"></div>
                        </td>
                      </tr>
                    ))
                  ) : questions.length === 0 ? (
                    <tr>
                      <td colSpan={2} className="p-8 text-center text-slate-300">
                        Nenhuma pergunta encontrada neste tema.
                      </td>
                    </tr>
                  ) : (
                    questions.map(q => (
                      <tr key={q.id} className="hover:bg-white/5 transition-colors">
                        <td className="p-4 text-slate-200">
                          <div className="font-medium">{q.text}</div>
                          <div className="text-sm text-slate-400 mt-1">R: {q.correct_answer}</div>
                        </td>
                        <td className="p-4 text-center">
                          <button
                            onClick={() => setQuestionToDelete(q.id)}
                            className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                            title="Excluir"
                          >
                            <Trash2 size={20} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalCount > 0 && (
              <div className="bg-white/5 p-4 border-t border-white/10 flex items-center justify-between">
                <div className="text-sm text-slate-300">
                  Página <span className="font-bold text-white">{currentPage}</span> de <span className="font-bold text-white">{totalPages}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1 || loading}
                    className="p-2 border border-white/20 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center text-white"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages || loading || totalPages === 0}
                    className="p-2 border border-white/20 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center text-white"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Delete Modal */}
      {questionToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6 max-w-md w-full shadow-2xl border border-white/20">
            <h3 className="text-xl font-bold text-white mb-2 drop-shadow-md">Excluir Pergunta</h3>
            <p className="text-slate-300 mb-6">
              Tem certeza que deseja excluir esta pergunta? Esta ação não pode ser desfeita.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setQuestionToDelete(null)}
                className="px-4 py-2 text-slate-200 bg-white/10 hover:bg-white/20 rounded-lg font-medium transition-colors border border-white/10"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-500/80 hover:bg-red-500 text-white rounded-lg font-medium transition-colors border border-red-500/50 shadow-lg"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
