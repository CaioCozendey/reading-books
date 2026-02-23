import { useState } from 'react';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

const BookCard = ({ book, onEdit }) => {
  const [loading, setLoading] = useState(false);

  const handleToggle = async (field) => {
    setLoading(true);
    try {
      const bookRef = doc(db, 'books', book.id);
      await updateDoc(bookRef, {
        [field]: !book[field]
      });
    } catch (error) {
      console.error('Erro ao atualizar:', error);
      alert('Erro ao atualizar o livro');
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    if (window.confirm('Tem certeza que deseja excluir este livro?')) {
      setLoading(true);
      try {
        await deleteDoc(doc(db, 'books', book.id));
      } catch (error) {
        console.error('Erro ao excluir:', error);
        alert('Erro ao excluir o livro');
      }
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden transition-transform hover:scale-105">
      <div className="relative h-80 bg-gray-200 dark:bg-gray-700">
        {book.imageUrl ? (
          <img
            src={book.imageUrl}
            alt={book.title}
            className="w-auto h-full object-cover mx-auto"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500">
            <span className="text-6xl">📖</span>
          </div>
        )}
        <div className="absolute top-2 right-2">
          <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
            {book.category}
          </span>
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2 line-clamp-2">
          {book.title}
        </h3>
        
        {book.purchaseLink && (
          <a
            href={book.purchaseLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:underline text-sm mb-3 block"
          >
            🔗 Ver onde comprar
          </a>
        )}
        
        <div className="space-y-2 mb-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={book.purchased || false}
              onChange={() => handleToggle('purchased')}
              disabled={loading}
              className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-gray-700 dark:text-gray-300">Comprado</span>
          </label>
          
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={book.read || false}
              onChange={() => handleToggle('read')}
              disabled={loading}
              className="w-5 h-5 text-green-600 rounded focus:ring-2 focus:ring-green-500"
            />
            <span className="text-gray-700 dark:text-gray-300">Já lido</span>
          </label>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(book)}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition-colors"
            disabled={loading}
          >
            Editar
          </button>
          <button
            onClick={handleDelete}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 rounded-lg transition-colors"
            disabled={loading}
          >
            Excluir
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookCard;
