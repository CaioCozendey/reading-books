import { useState, useEffect } from "react";
import {
  collection,
  query,
  onSnapshot,
  where,
  doc,
  setDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { useAuth } from "../contexts/AuthContext";
import BookCard from "../components/BookCard";
import Dashboard from "../components/Dashboard";
import { useNavigate } from "react-router-dom";

const BookList = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sagaFilter, setSagaFilter] = useState("all");
  const [sharing, setSharing] = useState(false);
  const [isShared, setIsShared] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, "books"), where("userId", "==", user.uid));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const booksData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        booksData.sort((a, b) => {
          const dateA = a.createdAt?.toDate() || new Date(0);
          const dateB = b.createdAt?.toDate() || new Date(0);
          return dateB - dateA;
        });
        setBooks(booksData);
        setLoading(false);
      },
      (error) => {
        console.error("Erro ao carregar livros:", error);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [user]);

  const handleEdit = (book) => {
    navigate("/adicionar", { state: { book } });
  };

  // NOVA FUNÇÃO: Compartilhar lista
  const handleShare = async () => {
    setSharing(true);
    try {
      // Cria uma cópia "somente leitura" dos livros (sem dados sensíveis)
      const booksSnapshot = books.map((book) => ({
        title: book.title || "",
        imageUrl: book.imageUrl || "",
        purchaseLink: book.purchaseLink || "",
        category: book.category || "",
        saga: book.saga || "",
        purchased: book.purchased || false,
        read: book.read || false,
      }));

      // Usa o UID do usuário como ID do documento de compartilhamento
      const shareRef = doc(db, "shares", user.uid);
      await setDoc(shareRef, {
        ownerId: user.uid,
        books: booksSnapshot,
        updatedAt: serverTimestamp(),
      });

      const shareUrl = `${window.location.origin}/compartilhar/${user.uid}`;

      // Copia o link para a área de transferência
      await navigator.clipboard.writeText(shareUrl);

      setIsShared(true);
      alert(
        `Link copiado para a área de transferência! 🎉\n\n${shareUrl}\n\nEnvie esse link para quem você quiser compartilhar sua lista.`,
      );
    } catch (error) {
      console.error("Erro ao compartilhar lista:", error);
      alert("Erro ao gerar link de compartilhamento. Tente novamente.");
    }
    setSharing(false);
  };

  // NOVA FUNÇÃO: Parar de compartilhar
  const handleStopSharing = async () => {
    if (
      !window.confirm(
        "Tem certeza que deseja parar de compartilhar sua lista? O link parará de funcionar.",
      )
    ) {
      return;
    }

    setSharing(true);
    try {
      await deleteDoc(doc(db, "shares", user.uid));
      setIsShared(false);
      alert("Compartilhamento removido com sucesso!");
    } catch (error) {
      console.error("Erro ao remover compartilhamento:", error);
      alert("Erro ao remover compartilhamento. Tente novamente.");
    }
    setSharing(false);
  };

  const categories = ["all", ...new Set(books.map((book) => book.category))];
  const sagas = [
    "all",
    ...new Set(books.map((book) => book.saga).filter(Boolean)),
  ];

  const filteredBooks = books.filter((book) => {
    if (categoryFilter !== "all" && book.category !== categoryFilter) {
      return false;
    }

    if (sagaFilter !== "all") {
      if (sagaFilter === "sem-saga" && book.saga) {
        return false;
      }
      if (sagaFilter !== "sem-saga" && book.saga !== sagaFilter) {
        return false;
      }
    }

    if (filter === "read") return book.read;
    if (filter === "unread") return !book.read - !book.purchased;
    if (filter === "purchased") return book.purchased;
    if (filter === "notPurchased") return !book.purchased;
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
      <Dashboard books={books} />

      <div className="mb-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white">
            Meus Livros ({filteredBooks.length})
          </h2>

          {/* NOVOS BOTÕES: Compartilhar lista */}
          <div className="flex gap-2">
            <button
              onClick={handleShare}
              disabled={sharing || books.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              🔗 {sharing ? "Gerando..." : "Compartilhar Lista"}
            </button>
            {isShared && (
              <button
                onClick={handleStopSharing}
                disabled={sharing}
                className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                Parar de Compartilhar
              </button>
            )}
          </div>
        </div>

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
              {categories
                .filter((c) => c !== "all")
                .map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Filtrar por saga:
            </label>
            <select
              value={sagaFilter}
              onChange={(e) => setSagaFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">Todas</option>
              <option value="sem-saga">Sem saga</option>
              {sagas
                .filter((s) => s !== "all")
                .map((saga) => (
                  <option key={saga} value={saga}>
                    {saga}
                  </option>
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
            onClick={() => navigate("/adicionar")}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg transition-colors"
          >
            Adicionar primeiro livro
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredBooks.map((book) => (
            <BookCard key={book.id} book={book} onEdit={handleEdit} />
          ))}
        </div>
      )}
    </div>
  );
};

export default BookList;
