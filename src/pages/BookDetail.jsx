import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import ReadingHeatmap from '../components/ReadingHeatmap';

const formatDateKey = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const BookDetail = () => {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [totalPagesInput, setTotalPagesInput] = useState('');
  const [savingTotal, setSavingTotal] = useState(false);

  const [sessionDate, setSessionDate] = useState(formatDateKey(new Date()));
  const [sessionPages, setSessionPages] = useState('');
  const [savingSession, setSavingSession] = useState(false);

  useEffect(() => {
    if (!user) return;

    const bookRef = doc(db, 'books', bookId);
    const unsubscribe = onSnapshot(
      bookRef,
      (snap) => {
        if (snap.exists() && snap.data().userId === user.uid) {
          const data = { id: snap.id, ...snap.data() };
          setBook(data);
          setTotalPagesInput(data.totalPages || '');
        } else {
          setNotFound(true);
        }
        setLoading(false);
      },
      () => {
        setNotFound(true);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [bookId, user]);

  const handleSaveTotalPages = async () => {
    if (!totalPagesInput || Number(totalPagesInput) <= 0) {
      alert('Digite um número de páginas válido');
      return;
    }
    setSavingTotal(true);
    try {
      await updateDoc(doc(db, 'books', bookId), {
        totalPages: Number(totalPagesInput)
      });
    } catch (error) {
      console.error(error);
      alert('Erro ao salvar total de páginas');
    }
    setSavingTotal(false);
  };

  const handleAddSession = async (e) => {
    e.preventDefault();
    const pagesNum = Number(sessionPages);
    if (!pagesNum || pagesNum <= 0) {
      alert('Digite uma quantidade de páginas válida');
      return;
    }

    setSavingSession(true);
    try {
      const newSession = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        date: sessionDate,
        pages: pagesNum,
        timestamp: Date.now()
      };
      const updatedSessions = [...(book.readingSessions || []), newSession];
      await updateDoc(doc(db, 'books', bookId), {
        readingSessions: updatedSessions
      });
      setSessionPages('');
    } catch (error) {
      console.error(error);
      alert('Erro ao registrar leitura');
    }
    setSavingSession(false);
  };

  const handleDeleteSession = async (sessionId) => {
    if (!window.confirm('Excluir este registro de leitura?')) return;
    try {
      const updatedSessions = (book.readingSessions || []).filter(s => s.id !== sessionId);
      await updateDoc(doc(db, 'books', bookId), {
        readingSessions: updatedSessions
      });
    } catch (error) {
      console.error(error);
      alert('Erro ao excluir registro');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center text-gray-600 dark:text-gray-400">
        Carregando...
      </div>
    );
  }

  if (notFound || !book) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-gray-600 dark:text-gray-400 mb-4">Livro não encontrado.</p>
        <button onClick={() => navigate('/')} className="text-blue-600 dark:text-blue-400 hover:underline">
          Voltar para Meus Livros
        </button>
      </div>
    );
  }

  const sessions = book.readingSessions || [];
  const totalPagesRead = sessions.reduce((sum, s) => sum + Number(s.pages || 0), 0);
  const totalPages = book.totalPages || 0;
  const progressPercent = totalPages > 0 ? Math.min(100, Math.round((totalPagesRead / totalPages) * 100)) : 0;

  const sortedSessions = [...sessions].sort((a, b) => b.timestamp - a.timestamp);

  return (
    <div className="container mx-auto px-4 py-8">
      <button
        onClick={() => navigate('/')}
        className="text-blue-600 dark:text-blue-400 hover:underline mb-6 inline-block"
      >
        ← Voltar para Meus Livros
      </button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Coluna esquerda: informações do livro */}
        <div className="md:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            <div className="h-96 bg-gray-200 dark:bg-gray-700">
              {book.imageUrl ? (
                <img src={book.imageUrl} alt={book.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-6xl text-gray-400">📖</div>
              )}
            </div>
            <div className="p-4">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">{book.title}</h2>
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm">{book.category}</span>
                {book.saga && (
                  <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm">{book.saga}</span>
                )}
              </div>
              {book.purchaseLink && (
                <a
                  href={book.purchaseLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline text-sm block mb-2"
                >
                  🔗 Ver onde comprar
                </a>
              )}
              <div className="flex gap-2 mt-4 text-sm">
                <span
                  className={`flex-1 text-center py-2 rounded-lg font-medium ${
                    book.purchased
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300'
                      : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                  }`}
                >
                  {book.purchased ? '✅ Comprado' : '⬜ Não comprado'}
                </span>
                <span
                  className={`flex-1 text-center py-2 rounded-lg font-medium ${
                    book.read
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300'
                      : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                  }`}
                >
                  {book.read ? '✅ Já lido' : '⬜ Não lido'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Coluna direita: progresso de leitura */}
        <div className="md:col-span-2 space-y-6">
          {/* Total de páginas */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              Total de Páginas do Livro
            </h3>
            <div className="flex gap-3">
              <input
                type="number"
                min="1"
                value={totalPagesInput}
                onChange={(e) => setTotalPagesInput(e.target.value)}
                placeholder="Ex: 350"
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleSaveTotalPages}
                disabled={savingTotal}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                {savingTotal ? 'Salvando...' : 'Salvar'}
              </button>
            </div>

            {totalPages > 0 && (
              <div className="mt-4">
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                  <span>{totalPagesRead} de {totalPages} páginas</span>
                  <span>{progressPercent}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div
                    className="bg-green-500 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>

          {/* Registrar leitura */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Registrar Leitura</h3>
            <form onSubmit={handleAddSession} className="flex flex-wrap gap-3 items-end">
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Data</label>
                <input
                  type="date"
                  value={sessionDate}
                  onChange={(e) => setSessionDate(e.target.value)}
                  max={formatDateKey(new Date())}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Páginas lidas</label>
                <input
                  type="number"
                  min="1"
                  value={sessionPages}
                  onChange={(e) => setSessionPages(e.target.value)}
                  placeholder="Ex: 20"
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-green-500 w-32"
                />
              </div>
              <button
                type="submit"
                disabled={savingSession}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                {savingSession ? 'Registrando...' : '+ Adicionar'}
              </button>
            </form>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Você pode registrar várias leituras no mesmo dia (ex: manhã e à noite).
            </p>
          </div>

          {/* Heatmap */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Histórico de Leitura</h3>
            <ReadingHeatmap sessions={sessions} finished={book.read} />
          </div>

          {/* Lista de registros */}
          {sortedSessions.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                Registros ({sortedSessions.length})
              </h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {sortedSessions.map(session => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <span className="text-gray-700 dark:text-gray-300 text-sm">
                      {new Date(session.date + 'T00:00:00').toLocaleDateString('pt-BR')} — {session.pages} páginas
                    </span>
                    <button
                      onClick={() => handleDeleteSession(session.id)}
                      className="text-red-600 hover:text-red-700 text-sm font-medium"
                    >
                      Excluir
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookDetail;