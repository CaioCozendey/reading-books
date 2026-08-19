import { useState, useEffect, useMemo } from "react";
import { collection, query, onSnapshot, where } from "firebase/firestore";

import { db } from "../config/firebase";
import { useAuth } from "../contexts/AuthContext";

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const PIE_COLORS = [
  "#3B82F6",
  "#10B981",
  "#8B5CF6",
  "#F97316",
  "#EC4899",
  "#14B8A6",
  "#F59E0B",
  "#6366F1",
  "#EF4444",
  "#84CC16",
];

const pad = (n) => String(n).padStart(2, "0");

const toMonthKey = (date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}`;

const toDayKey = (date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

const getDefaultMonthRange = (monthsBack) => {
  const end = new Date();
  const start = new Date();

  start.setMonth(start.getMonth() - (monthsBack - 1));

  return {
    start: toMonthKey(start),
    end: toMonthKey(end),
  };
};

const getDefaultDayRange = (daysBack) => {
  const end = new Date();
  const start = new Date();

  start.setDate(start.getDate() - (daysBack - 1));

  return {
    start: toDayKey(start),
    end: toDayKey(end),
  };
};

const monthLabel = (key) => {
  const [y, m] = key.split("-").map(Number);
  const d = new Date(y, m - 1, 1);

  return d.toLocaleDateString("pt-BR", {
    month: "short",
    year: "2-digit",
  });
};

const dayLabel = (key) => {
  const d = new Date(key + "T00:00:00");

  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  });
};

const generateMonthKeys = (startKey, endKey) => {
  if (!startKey || !endKey || startKey > endKey) {
    return [];
  }

  const [sy, sm] = startKey.split("-").map(Number);
  const [ey, em] = endKey.split("-").map(Number);

  const keys = [];

  let y = sy;
  let m = sm;

  while (y < ey || (y === ey && m <= em)) {
    keys.push(`${y}-${pad(m)}`);

    m++;

    if (m > 12) {
      m = 1;
      y++;
    }
  }

  return keys;
};

const generateDayKeys = (startKey, endKey) => {
  if (!startKey || !endKey || startKey > endKey) {
    return [];
  }

  const keys = [];

  const cursor = new Date(startKey + "T00:00:00");
  const end = new Date(endKey + "T00:00:00");

  while (cursor <= end) {
    keys.push(toDayKey(cursor));

    cursor.setDate(cursor.getDate() + 1);
  }

  return keys;
};

// Retorna a data (YYYY-MM-DD) de conclusão de um livro lido, ou null
const getCompletionDate = (book) => {
  if (!book.read) {
    return null;
  }

  const sessions = book.readingSessions || [];

  if (sessions.length > 0) {
    return sessions.reduce(
      (max, s) => (s.date > max ? s.date : max),
      sessions[0].date,
    );
  }

  if (book.updatedAt?.toDate) {
    return toDayKey(book.updatedAt.toDate());
  }

  if (book.createdAt?.toDate) {
    return toDayKey(book.createdAt.toDate());
  }

  return null;
};

/*
 * Card dos gráficos
 *
 * O range recebido pelo componente representa o range APLICADO.
 *
 * tempRange representa o que o usuário está digitando/selecionando.
 *
 * Portanto:
 * - alterar o input NÃO altera o gráfico;
 * - clicar em "Aplicar" altera o range usado pelo gráfico.
 */
const ChartCard = ({ title, children, range, onRangeChange, rangeType }) => {
  const [tempRange, setTempRange] = useState(range);

  // Mantém os inputs sincronizados caso o range aplicado
  // seja alterado externamente.
  useEffect(() => {
    setTempRange(range);
  }, [range]);

  const handleApply = () => {
    if (!tempRange.start || !tempRange.end) {
      return;
    }

    if (tempRange.start > tempRange.end) {
      alert("A data inicial não pode ser maior que a data final.");
      return;
    }

    onRangeChange(tempRange);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
          {title}
        </h3>

        {range && (
          <div className="flex flex-wrap items-end gap-3">
            {/* Data inicial */}
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                De
              </label>

              <input
                type={rangeType}
                value={tempRange.start}
                onChange={(e) =>
                  setTempRange({
                    ...tempRange,
                    start: e.target.value,
                  })
                }
                className="
                  px-2
                  py-1
                  text-sm
                  border
                  border-gray-300
                  dark:border-gray-600
                  rounded-lg
                  bg-white
                  dark:bg-gray-700
                  text-gray-800
                  dark:text-white
                  focus:ring-2
                  focus:ring-blue-500
                  focus:border-blue-500
                  outline-none
                "
              />
            </div>

            {/* Data final */}
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                Até
              </label>

              <input
                type={rangeType}
                value={tempRange.end}
                onChange={(e) =>
                  setTempRange({
                    ...tempRange,
                    end: e.target.value,
                  })
                }
                className="
                  px-2
                  py-1
                  text-sm
                  border
                  border-gray-300
                  dark:border-gray-600
                  rounded-lg
                  bg-white
                  dark:bg-gray-700
                  text-gray-800
                  dark:text-white
                  focus:ring-2
                  focus:ring-blue-500
                  focus:border-blue-500
                  outline-none
                "
              />
            </div>

            {/* Botão Aplicar */}
            <button
              type="button"
              onClick={handleApply}
              className="
                px-4
                py-2
                text-sm
                font-medium
                text-white
                bg-blue-600
                hover:bg-blue-700
                active:bg-blue-800
                rounded-lg
                transition-colors
                shadow-sm
              "
            >
              Aplicar
            </button>
          </div>
        )}
      </div>

      {children}
    </div>
  );
};

const Statistics = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  const { user } = useAuth();

  // Range aplicado aos gráficos
  const [booksMonthRange, setBooksMonthRange] = useState(() =>
    getDefaultMonthRange(12),
  );

  const [pagesDayRange, setPagesDayRange] = useState(() =>
    getDefaultDayRange(30),
  );

  const [pagesMonthRange, setPagesMonthRange] = useState(() =>
    getDefaultMonthRange(12),
  );

  useEffect(() => {
    if (!user) {
      return;
    }

    const q = query(collection(db, "books"), where("userId", "==", user.uid));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setBooks(
          snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })),
        );

        setLoading(false);
      },
      () => setLoading(false),
    );

    return () => unsubscribe();
  }, [user]);

  /*
   * 1. Livros lidos por mês
   */
  const booksPerMonthData = useMemo(() => {
    const monthKeys = generateMonthKeys(
      booksMonthRange.start,
      booksMonthRange.end,
    );

    const counts = {};

    monthKeys.forEach((k) => {
      counts[k] = 0;
    });

    books.forEach((book) => {
      const completion = getCompletionDate(book);

      if (!completion) {
        return;
      }

      const mKey = completion.slice(0, 7);

      if (counts[mKey] !== undefined) {
        counts[mKey]++;
      }
    });

    return monthKeys.map((k) => ({
      name: monthLabel(k),
      livros: counts[k],
    }));
  }, [books, booksMonthRange]);

  /*
   * 2. Páginas lidas por dia
   */
  const pagesPerDayData = useMemo(() => {
    const dayKeys = generateDayKeys(pagesDayRange.start, pagesDayRange.end);

    const counts = {};

    dayKeys.forEach((k) => {
      counts[k] = 0;
    });

    books.forEach((book) => {
      (book.readingSessions || []).forEach((s) => {
        if (counts[s.date] !== undefined) {
          counts[s.date] += Number(s.pages || 0);
        }
      });
    });

    return dayKeys.map((k) => ({
      name: dayLabel(k),
      paginas: counts[k],
    }));
  }, [books, pagesDayRange]);

  /*
   * 3. Páginas lidas por mês
   */
  const pagesPerMonthData = useMemo(() => {
    const monthKeys = generateMonthKeys(
      pagesMonthRange.start,
      pagesMonthRange.end,
    );

    const counts = {};

    monthKeys.forEach((k) => {
      counts[k] = 0;
    });

    books.forEach((book) => {
      (book.readingSessions || []).forEach((s) => {
        const mKey = s.date.slice(0, 7);

        if (counts[mKey] !== undefined) {
          counts[mKey] += Number(s.pages || 0);
        }
      });
    });

    return monthKeys.map((k) => ({
      name: monthLabel(k),
      paginas: counts[k],
    }));
  }, [books, pagesMonthRange]);

  /*
   * 4. Livros lidos por ano
   *    Sem limite, desde o primeiro ano com dados.
   */
  const booksPerYearData = useMemo(() => {
    const counts = {};

    books.forEach((book) => {
      const completion = getCompletionDate(book);

      if (!completion) {
        return;
      }

      const yKey = completion.slice(0, 4);

      counts[yKey] = (counts[yKey] || 0) + 1;
    });

    const years = Object.keys(counts).sort();

    if (years.length === 0) {
      return [];
    }

    const firstYear = Number(years[0]);

    const lastYear = Math.max(
      Number(years[years.length - 1]),
      new Date().getFullYear(),
    );

    const result = [];

    for (let y = firstYear; y <= lastYear; y++) {
      result.push({
        name: String(y),
        livros: counts[String(y)] || 0,
      });
    }

    return result;
  }, [books]);

  /*
   * 5. Pizza: livros lidos por categoria
   */
  const categoryReadData = useMemo(() => {
    const counts = {};

    books
      .filter((b) => b.read)
      .forEach((b) => {
        const cat = b.category || "Sem categoria";

        counts[cat] = (counts[cat] || 0) + 1;
      });

    return Object.entries(counts).map(([name, value]) => ({
      name,
      value,
    }));
  }, [books]);

  /*
   * 6. Pizza: livros totais por categoria
   */
  const categoryAllData = useMemo(() => {
    const counts = {};

    books.forEach((b) => {
      const cat = b.category || "Sem categoria";

      counts[cat] = (counts[cat] || 0) + 1;
    });

    return Object.entries(counts).map(([name, value]) => ({
      name,
      value,
    }));
  }, [books]);

  /*
   * Loading
   */
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center text-gray-600 dark:text-gray-400">
        Carregando estatísticas...
      </div>
    );
  }

  /*
   * Sem livros
   */
  if (books.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 text-center text-gray-600 dark:text-gray-400">
        Você ainda não tem livros cadastrados. Adicione livros e registre
        leituras para ver suas estatísticas aqui!
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <h2 className="text-3xl font-bold text-gray-800 dark:text-white">
        📊 Estatísticas
      </h2>

      {/* =========================================================
          1. Livros lidos por mês
          ========================================================= */}
      <ChartCard
        title="Livros Lidos por Mês"
        range={booksMonthRange}
        onRangeChange={setBooksMonthRange}
        rangeType="month"
      >
        <ResponsiveContainer width="100%" height={320}>
          <LineChart
            data={booksPerMonthData}
            margin={{
              left: 0,
              right: 20,
              bottom: 20,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} />

            <YAxis allowDecimals={false} />

            <Tooltip />

            <Line
              type="monotone"
              dataKey="livros"
              stroke="#3B82F6"
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* =========================================================
          2. Páginas lidas por dia
          ========================================================= */}
      <ChartCard
        title="Páginas Lidas por Dia"
        range={pagesDayRange}
        onRangeChange={setPagesDayRange}
        rangeType="date"
      >
        <ResponsiveContainer width="100%" height={320}>
          <LineChart
            data={pagesPerDayData}
            margin={{
              left: 0,
              right: 20,
              bottom: 20,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis
              dataKey="name"
              angle={-45}
              textAnchor="end"
              height={60}
              interval="preserveStartEnd"
            />

            <YAxis allowDecimals={false} />

            <Tooltip />

            <Line
              type="monotone"
              dataKey="paginas"
              stroke="#10B981"
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* =========================================================
          3. Páginas lidas por mês
          ========================================================= */}
      <ChartCard
        title="Páginas Lidas por Mês"
        range={pagesMonthRange}
        onRangeChange={setPagesMonthRange}
        rangeType="month"
      >
        <ResponsiveContainer width="100%" height={320}>
          <LineChart
            data={pagesPerMonthData}
            margin={{
              left: 0,
              right: 20,
              bottom: 20,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} />

            <YAxis allowDecimals={false} />

            <Tooltip />

            <Line
              type="monotone"
              dataKey="paginas"
              stroke="#F97316"
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* =========================================================
          4. Livros lidos por ano
          ========================================================= */}
      <ChartCard title="Livros Lidos por Ano">
        {booksPerYearData.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400 py-8">
            Nenhum livro lido ainda.
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={booksPerYearData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="livros" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

      {/* =========================================================
          5 e 6. Gráficos por categoria
          ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* =======================================================
            5. Livros lidos por categoria
            ======================================================= */}
        <ChartCard title="Livros Lidos por Categoria">
          {categoryReadData.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400 py-8">
              Nenhum livro lido ainda.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie
                  data={categoryReadData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {categoryReadData.map((entry, index) => (
                    <Cell
                      key={index}
                      fill={PIE_COLORS[index % PIE_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => {
                    const total = categoryReadData.reduce(
                      (sum, d) => sum + d.value,
                      0,
                    );

                    const percent =
                      total > 0 ? ((value / total) * 100).toFixed(1) : 0;

                    return [`${percent}%`, name];
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
        {/* =======================================================
            6. Livros totais por categoria
            ======================================================= */}
        <ChartCard title="Livros Totais por Categoria">
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie
                data={categoryAllData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {categoryAllData.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={PIE_COLORS[index % PIE_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value, name) => {
                  const total = categoryAllData.reduce(
                    (sum, d) => sum + d.value,
                    0,
                  );

                  const percent =
                    total > 0 ? ((value / total) * 100).toFixed(1) : 0;

                  return [`${percent}%`, name];
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
};

export default Statistics;
