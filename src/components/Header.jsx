import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Header = ({ darkMode, setDarkMode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    const result = await logout();
    if (result.success) {
      navigate('/login');
    }
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-md">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            <a href="/">
              📚 Lista de Leitura
            </a>
          </h1>

          <nav className="flex items-center gap-6">
            <Link
              to="/"
              className={`font-medium transition-colors ${location.pathname === '/'
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
                }`}
            >
              Meus Livros
            </Link>
            <Link
              to="/adicionar"
              className={`font-medium transition-colors ${location.pathname === '/adicionar'
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
                }`}
            >
              Adicionar Livro
            </Link>
            <Link
              to="/categorias"
              className={`font-medium transition-colors ${location.pathname === '/categorias'
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
                }`}
            >
              Categorias
            </Link>
            <Link
              to="/sagas"
              className={`font-medium transition-colors ${location.pathname === '/sagas'
                ? 'text-purple-600 dark:text-purple-400'
                : 'text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400'
                }`}
            >
              Sagas
            </Link>

            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              aria-label="Alternar modo escuro"
            >
              {darkMode ? '☀️' : '🌙'}
            </button>

            {user && (
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
              >
                Sair
              </button>
            )}
          </nav>
        </div>

        {user && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Logado como: {user.email}
          </p>
        )}
      </div>
    </header>
  );
};

export default Header;