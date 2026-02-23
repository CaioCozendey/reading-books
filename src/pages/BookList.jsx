import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, orderBy, where } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import BookCard from '../components/BookCard';
import Dashboard from '../components/Dashboard';
import { useNavigate } from 'react-router-dom';

const BookList = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    
    const q = query(
      collection(db, 'books'), 
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const booksData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setBooks(booksData);
      setLoading(false);
    }, (error) => {
      console.error('Erro ao carregar livros:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleEdit = (book) => {
    navigate('/adicionar', { state: { book } });
  };

  const categories = ['all', ...new Set(books.map(book => book.category))];

  const filteredBooks = books.filter(book => {
    if (categoryFilter !== 'all' && book.category !== categoryFilter) {
      return false;
    }
    
    if (filter === 'read') return book.read;
    if (filter === 'unread') return !book.read;
    if (filter === 'purchased') return book.purchased;
    if (filter === 'notPurchased') return !book.purchased;
    return true;
  });

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-gray-600 dark:text-gray-400">
          Carregando livros...
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Dashboard com Estatísticas */}
      <Dashboard books={books} />
      
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">
          Meus Livros ({filteredBooks.length})
        </h2>
        
        <div className="flex flex-wrap gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Filtrar por status:
            </label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todos</option>
              <option value="read">Já lidos</option>
              <option value="unread">Não lidos</option>
              <option value="purchased">Comprados</option>
              <option value="notPurchased">Não comprados</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Filtrar por categoria:
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todas</option>
              {categories.filter(c => c !== 'all').map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {filteredBooks.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">
            Nenhum livro encontrado
          </p>
          <button
            onClick={() => navigate('/adicionar')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg transition-colors"
          >
            Adicionar primeiro livro
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredBooks.map(book => (
            <BookCard key={book.id} book={book} onEdit={handleEdit} />
          ))}
        </div>
      )}
    </div>
  );
};

export default BookList;
