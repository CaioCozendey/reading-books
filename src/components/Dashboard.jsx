const Dashboard = ({ books }) => {
  const stats = {
    total: books.length,
    read: books.filter((book) => book.read).length,
    purchased: books.filter((book) => book.purchased).length,
    toRead: books.filter((book) => book.purchased && !book.read).length,
  };

  // Junta todas as sessões de leitura de todos os livros
  const allSessions = books.flatMap((book) => book.readingSessions || []);

  const totalPagesReadAll = allSessions.reduce(
    (sum, s) => sum + Number(s.pages || 0),
    0,
  );

  const categoriaMaisLida =
    Object.entries(
      books
        .filter((book) => book.read)
        .reduce((acc, book) => {
          acc[book.category] = (acc[book.category] || 0) + 1;
          return acc;
        }, {}),
    ).sort((a, b) => b[1] - a[1])[0]?.[0] || "Nenhuma";

  const formatDateKey = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");

    return `${y}-${m}-${d}`;
  };

  const today = new Date();

  const cutoff = new Date();
  cutoff.setDate(today.getDate() - 29);

  const cutoffKey = formatDateKey(cutoff);

  const last30DaysPages = allSessions
    .filter((s) => s.date >= cutoffKey)
    .reduce((sum, s) => sum + Number(s.pages || 0), 0);

  const monthlyAverage = Math.round(last30DaysPages / 12);
  const daylyAverage = Math.round(last30DaysPages / 30);

  const mesAtual = new Date().toLocaleString("pt-BR", {
    month: "long",
  });

  const hoje = new Date();

  const inicio = new Date(hoje);
  inicio.setDate(hoje.getDate() - 30);

  const formatarData = (data) => {
    return data.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
    });
  };

  const periodo = `${formatarData(inicio)} - ${formatarData(hoje)}`;

  const statCards = [
    {
      title: "Total de Livros",
      value: stats.total,
      icon: "📚",
      bgColor: "bg-blue-500",
      textColor: "text-blue-500",
      bgLight: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
      title: "Lidos",
      value: stats.read,
      icon: "✅",
      bgColor: "bg-green-500",
      textColor: "text-green-500",
      bgLight: "bg-green-50 dark:bg-green-900/20",
    },
    {
      title: "Comprados",
      value: stats.purchased,
      icon: "🛒",
      bgColor: "bg-purple-500",
      textColor: "text-purple-500",
      bgLight: "bg-purple-50 dark:bg-purple-900/20",
    },
    {
      title: "Para Ler",
      value: stats.toRead,
      icon: "📖",
      bgColor: "bg-orange-500",
      textColor: "text-orange-500",
      bgLight: "bg-orange-50 dark:bg-orange-900/20",
    },
    {
      title: "Média de Páginas/Mês",
      texto: `Últimos 12 meses`,
      value: monthlyAverage,
      icon: "📈",
      bgColor: "bg-teal-500",
      textColor: "text-teal-500",
      bgLight: "bg-teal-50 dark:bg-teal-900/20",
    },
    {
      title: "Média de Páginas/Dia",
      texto: periodo,
      value: daylyAverage,
      icon: "📈",
      bgColor: "bg-yellow-500",
      textColor: "text-yellow-500",
      bgLight: "bg-yellow-50 dark:bg-yellow-900/20",
    },
    {
      title: "Total de Páginas Lidas",
      value: totalPagesReadAll,
      icon: "📄",
      bgColor: "bg-indigo-500",
      textColor: "text-indigo-500",
      bgLight: "bg-indigo-50 dark:bg-indigo-900/20",
    },
    {
      title: "Principal interesse lido",
      value: categoriaMaisLida,
      icon: "📄",
      bgColor: "bg-rose-500",
      textColor: "text-rose-500",
      bgLight: "bg-rose-50 dark:bg-rose-900/20",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
      {statCards.map((stat, index) => (
        <div
          key={index}
          className={`
            ${stat.bgLight}
            rounded-xl
            shadow-md
            p-5
            min-h-[150px]
            flex
            flex-col
            justify-between
            transition-all
            duration-200
            hover:scale-[1.02]
            hover:shadow-lg
          `}
        >
          {/* Cabeçalho */}
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-600 dark:text-gray-300 truncate">
                {stat.title}
              </p>

              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 min-h-[16px]">
                {stat.texto || "\u00A0"}
              </p>
            </div>

            <div
              className={`
                flex-shrink-0
                w-11
                h-11
                ${stat.bgColor}
                rounded-full
                flex
                items-center
                justify-center
                text-xl
                shadow-sm
              `}
            >
              {stat.icon}
            </div>
          </div>

          {/* Valor */}
          <div className="mt-3">
            <p className={`text-3xl font-bold ${stat.textColor}`}>
              {stat.value.toLocaleString("pt-BR")}
            </p>
          </div>

          {/* Barra de progresso para "Lidos" */}
          {stat.title === "Lidos" && stats.purchased > 0 && (
            <div className="mt-3">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                <div
                  className={`${stat.bgColor} h-2 rounded-full transition-all duration-300`}
                  style={{
                    width: `${Math.min(
                      (stats.read / stats.purchased) * 100,
                      100,
                    )}%`,
                  }}
                />
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 text-right">
                {Math.round((stats.read / stats.purchased) * 100)}% concluído
              </p>
            </div>
          )}
          {/* Barra de progresso para "Comprados" */}
          {stat.title === "Comprados" && stats.purchased > 0 && (
            <div className="mt-3">
              
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                <div
                  className={`${stat.bgColor} h-2 rounded-full transition-all duration-300`}
                  style={{
                    width: `${Math.min(
                      (stats.purchased / stats.total) * 100,
                      100,
                    )}%`,
                  }}
                />
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 text-right">
                {Math.round((stats.purchased / stats.total) * 100)}% concluído
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default Dashboard;
