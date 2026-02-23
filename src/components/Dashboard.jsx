const Dashboard = ({ books }) => {
  const stats = {
    total: books.length,
    read: books.filter(book => book.read).length,
    purchased: books.filter(book => book.purchased).length,
    toRead: books.filter(book => !book.read).length
  };

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
      title: 'Já Lidos',
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
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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
          
          {/* Barra de progresso para "Já Lidos" */}
          {stat.title === 'Já Lidos' && stats.total > 0 && (
            <div className="mt-4">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className={`${stat.bgColor} h-2 rounded-full transition-all duration-300`}
                  style={{ width: `${(stats.read / stats.total) * 100}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 text-right">
                {Math.round((stats.read / stats.total) * 100)}% concluído
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default Dashboard;
