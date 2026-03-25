import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { collection, addDoc, doc, updateDoc, serverTimestamp, query, onSnapshot, where } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';

const AddBook = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const editBook = location.state?.book;
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    title: '',
    imageUrl: '',
    purchaseLink: '',
    category: '',
    saga: '', // NOVO CAMPO
    purchased: false,
    read: false
  });
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [sagas, setSagas] = useState([]); // NOVO ESTADO

  // Carregar categorias do Firebase (do usuário logado)
  useEffect(() => {
    if (!user) return;
    
    const q = query(
      collection(db, 'categories'),
      where('userId', '==', user.uid)
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const categoriesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      categoriesData.sort((a, b) => a.name.localeCompare(b.name));
      setCategories(categoriesData);
    });

    return () => unsubscribe();
  }, [user]);

  // NOVO: Carregar sagas do Firebase (do usuário logado)
  useEffect(() => {
    if (!user) return;
    
    const q = query(
      collection(db, 'sagas'),
      where('userId', '==', user.uid)
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const sagasData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      sagasData.sort((a, b) => a.name.localeCompare(b.name));
      setSagas(sagasData);
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (editBook) {
      setFormData({
        title: editBook.title || '',
        imageUrl: editBook.imageUrl || '',
        purchaseLink: editBook.purchaseLink || '',
        category: editBook.category || '',
        saga: editBook.saga || '', // NOVO CAMPO
        purchased: editBook.purchased || false,
        read: editBook.read || false
      });
    }
  }, [editBook]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.category.trim()) {
      alert('Por favor, preencha o título e a categoria');
      return;
    }

    setLoading(true);

    try {
      if (editBook) {
        // Atualizar livro existente
        const bookRef = doc(db, 'books', editBook.id);
        await updateDoc(bookRef, {
          ...formData,
          updatedAt: serverTimestamp()
        });
        alert('Livro atualizado com sucesso!');
      } else {
        // Adicionar novo livro
        await addDoc(collection(db, 'books'), {
          ...formData,
          userId: user.uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        alert('Livro adicionado com sucesso!');
      }
      
      navigate('/');
    } catch (error) {
      console.error('Erro ao salvar livro:', error);
      alert('Erro ao salvar o livro. Tente novamente.');
    }
    
    setLoading(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-8">
          {editBook ? 'Editar Livro' : 'Adicionar Novo Livro'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Título do Livro *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: O Senhor dos Anéis"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              URL da Foto do Livro
            </label>
            <input
              type="url"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500"
              placeholder="https://exemplo.com/imagem.jpg"
            />
            {formData.imageUrl && (
              <div className="mt-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Preview:</p>
                <img
                  src={formData.imageUrl}
                  alt="Preview"
                  className="w-48 h-64 object-cover rounded-lg"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Link para Comprar
            </label>
            <input
              type="url"
              name="purchaseLink"
              value={formData.purchaseLink}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500"
              placeholder="https://www.amazon.com.br/..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Categoria *
            </label>
            {categories.length === 0 ? (
              <div className="space-y-3">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Nenhuma categoria cadastrada ainda.
                </p>
                <button
                  type="button"
                  onClick={() => navigate('/categorias')}
                  className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium"
                >
                  → Ir para Gerenciar Categorias
                </button>
              </div>
            ) : (
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecione uma categoria</option>
                {categories.map(category => (
                  <option key={category.id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
            )}
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Você pode gerenciar suas categorias na página{' '}
              <button
                type="button"
                onClick={() => navigate('/categorias')}
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                Categorias
              </button>
            </p>
          </div>

          {/* NOVO CAMPO: SAGA */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Saga (Opcional)
            </label>
            <select
              name="saga"
              value={formData.saga}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Nenhuma saga</option>
              {sagas.map(saga => (
                <option key={saga.id} value={saga.name}>
                  {saga.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Use sagas para agrupar livros de uma mesma série. Gerencie em{' '}
              <button
                type="button"
                onClick={() => navigate('/sagas')}
                className="text-purple-600 dark:text-purple-400 hover:underline"
              >
                Sagas
              </button>
            </p>
          </div>

          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="purchased"
                checked={formData.purchased}
                onChange={handleChange}
                className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-gray-700 dark:text-gray-300">Comprado</span>
            </label>
            
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="read"
                checked={formData.read}
                onChange={handleChange}
                className="w-5 h-5 text-green-600 rounded focus:ring-2 focus:ring-green-500"
              />
              <span className="text-gray-700 dark:text-gray-300">Já lido</span>
            </label>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Salvando...' : editBook ? 'Atualizar Livro' : 'Adicionar Livro'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 rounded-lg transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddBook;