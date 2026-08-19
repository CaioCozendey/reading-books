import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../config/firebase";
import PublicBookCard from "../components/PublicBookCard";

const SharedList = () => {
  const { shareId } = useParams();
  const [shareData, setShareData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchSharedList = async () => {
      try {
        const shareRef = doc(db, "shares", shareId);
        const shareSnap = await getDoc(shareRef);

        if (shareSnap.exists()) {
          setShareData(shareSnap.data());
        } else {
          setNotFound(true);
        }
      } catch (error) {
        console.error("Erro ao carregar lista compartilhada:", error);
        setNotFound(true);
      }
      setLoading(false);
    };

    fetchSharedList();
  }, [shareId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <p className="text-gray-600 dark:text-gray-400">Carregando lista...</p>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
        <div className="text-center">
          <p className="text-2xl mb-2">😕</p>
          <p className="text-xl text-gray-700 dark:text-gray-300 mb-2">
            Lista não encontrada
          </p>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Este link pode ter expirado ou a pessoa parou de compartilhar a
            lista.
          </p>
          <Link
            to="/"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Voltar para o início
          </Link>
        </div>
      </div>
    );
  }

  const books = shareData.books || [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-md">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            📚 Lista de Leitura Compartilhada
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Visualização somente leitura • {books.length}{" "}
            {books.length === 1 ? "livro" : "livros"}
          </p>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {books.length === 0 ? (
          <p className="text-center text-gray-600 dark:text-gray-400 py-16">
            Esta lista ainda não tem livros.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {books.map((book, index) => (
              <PublicBookCard key={index} book={book} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SharedList;
