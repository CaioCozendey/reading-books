const PublicBookCard = ({ book }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
      <div className="relative h-80 bg-gray-200 dark:bg-gray-700">
        {book.imageUrl ? (
          <img
            src={book.imageUrl}
            alt={book.title}
            className="w-full h-full object-cover"
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
        {book.saga && (
          <div className="absolute top-2 left-2">
            <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-medium">
              {book.saga}
            </span>
          </div>
        )}
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

        {/* Badges estáticos - somente leitura, sem checkbox editável */}
        <div className="flex gap-2 mt-4">
          <span
            className={`flex-1 text-center py-2 rounded-lg text-sm font-medium ${
              book.purchased
                ? "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300"
                : "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
            }`}
          >
            {book.purchased ? "✅ Comprado" : "⬜ Não comprado"}
          </span>

          <span
            className={`flex-1 text-center py-2 rounded-lg text-sm font-medium ${
              book.read
                ? "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300"
                : "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
            }`}
          >
            {book.read ? "✅ Já lido" : "⬜ Não lido"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PublicBookCard;
