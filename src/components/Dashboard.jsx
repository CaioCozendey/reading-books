const Dashboard = ({ books }) => {
  const stats = {
    total: books.length,
    read: books.filter(book => book.read).length,
    purchased: books.filter(book => book.purchased).length,
    toRead: books.filter(book => !book.read).length
  };

  // Junta todas as sessões de leitura de todos os livros
  const allSessions = books.flatMap(book => book.readingSessions || []);

  const totalPagesReadAll = allSessions.reduce((sum, s) => sum + Number(s.pages || 0), 0);

  const formatDateKey = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const today = new Date();
  const cutoff = new Date();
  cutoff.setDate(today.getDate() - 29); // últimos 30 dias (incluindo hoje)
  const cutoffKey = formatDateKey(cutoff);

  const last30DaysPages = allSessions
    .filter(s => s.date >= cutoffKey)
    .reduce((sum, s) => sum + Number(s.pages || 0), 0);

  const monthlyAverage = Math.round(last30DaysPages / 30);

  const statCards = [
    {
      title: 'Total de Livros',
      value: stats.total,
      icon: '📚',
      bgColor: 'bg-blue-500',
      textColor: 'text-blue-500',
      bgLight: 'bg-blue-50 dark:bg-blue-900/20'
    },
    {
      title: 'Lidos',
      value: stats.read,
      icon: '✅',
      bgColor: 'bg-green-500',
      textColor: 'text-green-500',
      bgLight: 'bg-green-50 dark:bg-green-900/20'
    },
    {
      title: 'Comprados',
      value: stats.purchased,
      icon: '🛒',
      bgColor: 'bg-purple-500',
      textColor: 'text-purple-500',
      bgLight: 'bg-purple-50 dark:bg-purple-900/20'
    },
    {
      title: 'Para Ler',
      value: stats.toRead,
      icon: '📖',
      bgColor: 'bg-orange-500',
      textColor: 'text-orange-500',
      bgLight: 'bg-orange-50 dark:bg-orange-900/20'
    },
    {
      title: 'Média de Páginas/Mês',
      value: monthlyAverage,
      icon: '📈',
      bgColor: 'bg-teal-500',
      textColor: 'text-teal-500',
      bgLight: 'bg-teal-50 dark:bg-teal-900/20'
    },
    {
      title: 'Total de Páginas Lidas',
      value: totalPagesReadAll,
      icon: '📄',
      bgColor: 'bg-indigo-500',
      textColor: 'text-indigo-500',
      bgLight: 'bg-indigo-50 dark:bg-indigo-900/20'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
      {statCards.map((stat, index) => (
        <div
          key={index}
          className={`${stat.bgLight} rounded-lg shadow-md p-6 transition-transform hover:scale-105`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                {stat.title}
              </p>
              <p className={`text-3xl font-bold ${stat.textColor}`}>
                {stat.value}
              </p>
            </div>
            <div className={`w-12 h-12 ${stat.bgColor} rounded-full flex items-center justify-center text-2xl`}>
              {stat.icon}
            </div>
          </div>
          
          {/* Barra de progresso para "Lidos" */}
          {stat.title === 'Lidos' && stats.purchased > 0 && (
            <div className="mt-4">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className={`${stat.bgColor} h-2 rounded-full transition-all duration-300`}
                  style={{ width: `${(stats.read / stats.purchased) * 100}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 text-right">
                {Math.round((stats.read / stats.purchased) * 100)}% concluído
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default Dashboard;