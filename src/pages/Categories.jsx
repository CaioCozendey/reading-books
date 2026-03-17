import { useState, useEffect } from 'react';
import { collection, addDoc, deleteDoc, doc, onSnapshot, query, orderBy, where } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'categories'),
      where('userId', '==', user.uid)
      // Removemos o orderBy('name') temporariamente
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const categoriesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      // Ordenamos no JavaScript ao invés do Firestore
      categoriesData.sort((a, b) => a.name.localeCompare(b.name));
      setCategories(categoriesData);
    });

    return () => unsubscribe();
  }, [user]);

  const handleAddCategory = async (e) => {
    e.preventDefault();

    if (!newCategory.trim()) {
      alert('Digite um nome para a categoria');
      return;
    }

    // Verifica se já existe
    const exists = categories.some(
      cat => cat.name.toLowerCase() === newCategory.trim().toLowerCase()
    );

    if (exists) {
      alert('Esta categoria já existe!');
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, 'categories'), {
        name: newCategory.trim(),
        userId: user.uid, // Adiciona o ID do usuário
        createdAt: new Date()
      });
      setNewCategory('');
      alert('Categoria adicionada com sucesso!');
    } catch (error) {
      console.error('Erro ao adicionar categoria:', error);
      alert('Erro ao adicionar categoria');
    }
    setLoading(false);
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Tem certeza que deseja excluir a categoria "${name}"?`)) {
      setLoading(true);
      try {
        await deleteDoc(doc(db, 'categories', id));
        alert('Categoria excluída com sucesso!');
      } catch (error) {
        console.error('Erro ao excluir categoria:', error);
        alert('Erro ao excluir categoria');
      }
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-8">
          Gerenciar Categorias
        </h2>

        {/* Formulário de Adicionar */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
            Adicionar Nova Categoria
          </h3>

          <form onSubmit={handleAddCategory} className="flex gap-4">
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="Ex: Ficção, Romance, Suspense..."
              className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Adicionando...' : 'Adicionar'}
            </button>
          </form>
        </div>

        {/* Lista de Categorias */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
            Categorias Cadastradas ({categories.length})
          </h3>

          {categories.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-400 text-center py-8">
              Nenhuma categoria cadastrada ainda.
              <br />
              Adicione sua primeira categoria acima!
            </p>
          ) : (
            <div className="space-y-2">
              {categories.map(category => (
                <div
                  key={category.id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">📚</span>
                    <span className="text-lg font-medium text-gray-800 dark:text-white">
                      {category.name}
                    </span>
                  </div>

                  <button
                    onClick={() => handleDelete(category.id, category.name)}
                    disabled={loading}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                  >
                    Excluir
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Dica */}
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            💡 <strong>Dica:</strong> As categorias que você adicionar aqui aparecerão na lista de seleção quando for cadastrar um novo livro.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Categories;
