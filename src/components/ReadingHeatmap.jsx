const formatDateKey = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const getColorClass = (pages, maxPages) => {
  if (!pages || pages === 0) return "bg-gray-200 dark:bg-gray-700";
  const ratio = pages / maxPages;
  if (ratio > 0.75) return "bg-green-800 dark:bg-green-400";
  if (ratio > 0.5) return "bg-green-600 dark:bg-green-500";
  if (ratio > 0.25) return "bg-green-400 dark:bg-green-600";
  return "bg-green-200 dark:bg-green-800";
};

/**
 * sessions: array de { date: 'YYYY-MM-DD', pages: number }
 * finished: se true (livro já lido), o heatmap NÃO avança até hoje,
 *           fica congelado no período em que houve leitura.
 */
const ReadingHeatmap = ({ sessions = [], finished = false }) => {
  if (sessions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        Nenhuma leitura registrada ainda. Adicione seu primeiro registro abaixo!
        📖
      </div>
    );
  }

  // Agrupa páginas lidas por dia (soma múltiplos registros do mesmo dia)
  const pagesByDay = {};
  sessions.forEach((session) => {
    pagesByDay[session.date] =
      (pagesByDay[session.date] || 0) + Number(session.pages || 0);
  });

  const dates = Object.keys(pagesByDay).sort();
  const firstDateStr = dates[0];
  const lastDateStr = finished
    ? dates[dates.length - 1]
    : formatDateKey(new Date());

  const startDate = new Date(firstDateStr + "T00:00:00");
  const endDate = new Date(lastDateStr + "T00:00:00");

  // Recua até o domingo da semana inicial, para alinhar como no GitHub
  const gridStart = new Date(startDate);
  gridStart.setDate(gridStart.getDate() - gridStart.getDay());

  const days = [];
  const cursor = new Date(gridStart);
  while (cursor <= endDate) {
    const key = formatDateKey(cursor);
    days.push({
      date: key,
      pages: pagesByDay[key] || 0,
      inRange: cursor >= startDate && cursor <= endDate,
    });
    cursor.setDate(cursor.getDate() + 1);
  }

  const maxPages = Math.max(...Object.values(pagesByDay), 1);

  // Organiza em semanas (cada semana = 1 coluna de 7 dias)
  const weeks = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  return (
    <div>
      <div className="flex gap-1 overflow-x-auto pb-2">
        {weeks.map((week, wIndex) => (
          <div key={wIndex} className="flex flex-col gap-1">
            {week.map((day, dIndex) => (
              <div
                key={dIndex}
                title={day.inRange ? `${day.date}: ${day.pages} páginas` : ""}
                className={`w-3 h-3 rounded-sm ${
                  day.inRange
                    ? getColorClass(day.pages, maxPages)
                    : "bg-transparent"
                }`}
              />
            ))}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 mt-3 text-xs text-gray-500 dark:text-gray-400">
        <span>Menos</span>
        <div className="w-3 h-3 rounded-sm bg-gray-200 dark:bg-gray-700"></div>
        <div className="w-3 h-3 rounded-sm bg-green-200 dark:bg-green-800"></div>
        <div className="w-3 h-3 rounded-sm bg-green-400 dark:bg-green-600"></div>
        <div className="w-3 h-3 rounded-sm bg-green-600 dark:bg-green-500"></div>
        <div className="w-3 h-3 rounded-sm bg-green-800 dark:bg-green-400"></div>
        <span>Mais</span>
      </div>

      {finished && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          📘 Livro já concluído — exibindo apenas o período em que foi lido.
        </p>
      )}
    </div>
  );
};

export default ReadingHeatmap;
