import { useState, useEffect } from 'react';
import { collection, addDoc, deleteDoc, doc, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';

const Sagas = () => {
  const [sagas, setSagas] = useState([]);
  const [newSaga, setNewSaga] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

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
      // Ordenar no JavaScript
      sagasData.sort((a, b) => a.name.localeCompare(b.name));
      setSagas(sagasData);
    });

    return () => unsubscribe();
  }, [user]);

  const handleAddSaga = async (e) => {
    e.preventDefault();
    
    if (!newSaga.trim()) {
      alert('Digite um nome para a saga');
      return;
    }

    // Verifica se já existe
    const exists = sagas.some(
      saga => saga.name.toLowerCase() === newSaga.trim().toLowerCase()
    );

    if (exists) {
      alert('Esta saga já existe!');
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, 'sagas'), {
        name: newSaga.trim(),
        userId: user.uid,
        createdAt: new Date()
      });
      setNewSaga('');
      alert('Saga adicionada com sucesso!');
    } catch (error) {
      console.error('Erro ao adicionar saga:', error);
      alert('Erro ao adicionar saga');
    }
    setLoading(false);
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Tem certeza que deseja excluir a saga "${name}"?`)) {
      setLoading(true);
      try {
        await deleteDoc(doc(db, 'sagas', id));
        alert('Saga excluída com sucesso!');
      } catch (error) {
        console.error('Erro ao excluir saga:', error);
        alert('Erro ao excluir saga');
      }
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-8">
          Gerenciar Sagas
        </h2>

        {/* Formulário de Adicionar */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
            Adicionar Nova Saga
          </h3>
          
          <form onSubmit={handleAddSaga} className="flex gap-4">
            <input
              type="text"
              value={newSaga}
              onChange={(e) => setNewSaga(e.target.value)}
              placeholder="Ex: Harry Potter, O Senhor dos Anéis, Fundação..."
              className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Adicionando...' : 'Adicionar'}
            </button>
          </form>
        </div>

        {/* Lista de Sagas */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
            Sagas Cadastradas ({sagas.length})
          </h3>

          {sagas.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-400 text-center py-8">
              Nenhuma saga cadastrada ainda.
              <br />
              Adicione sua primeira saga acima!
            </p>
          ) : (
            <div className="space-y-2">
              {sagas.map(saga => (
                <div
                  key={saga.id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">📖</span>
                    <span className="text-lg font-medium text-gray-800 dark:text-white">
                      {saga.name}
                    </span>
                  </div>
                  
                  <button
                    onClick={() => handleDelete(saga.id, saga.name)}
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
        <div className="mt-6 p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
          <p className="text-sm text-purple-800 dark:text-purple-200">
            💡 <strong>Dica:</strong> As sagas que você adicionar aqui aparecerão como opção quando for cadastrar um novo livro. Use sagas para agrupar livros de uma mesma série ou universo!
          </p>
        </div>
      </div>
    </div>
  );
};

export default Sagas;