import { useState, useEffect } from "react";
import { TrendingUp, FileText, CheckSquare, Tag, Calendar } from "lucide-react";
import api from "../api/axios";

const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
  <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-gray-500 mb-1">{title}</p>
        <p className="text-3xl font-bold">{value}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
      </div>
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  </div>
);

const BarChart = ({ data }) => {
  if (!data || data.length === 0) return null;

  const max = Math.max(...data.map((d) => d.count));

  return (
    <div className="space-y-3">
      {data.map((item, i) => (
        <div key={i} className="flex items-center gap-4">
          <div className="w-24 text-sm text-gray-600 dark:text-gray-400 truncate text-right">
            {item.name}
          </div>
          <div className="flex-1 h-8 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary-500 to-purple-600 rounded-lg transition-all duration-500"
              style={{
                width: `${max > 0 ? (item.count / max) * 100 : 0}%`,
              }}
            />
          </div>
          <div className="w-12 text-sm font-medium text-right">{item.count}</div>
        </div>
      ))}
    </div>
  );
};

const DonutChart = ({ total, completed }) => {
  const pending = total - completed;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  return (
    <div className="flex items-center gap-8">
      <div className="relative">
        <svg width="160" height="160" className="-rotate-90">
          <circle
            cx="80"
            cy="80"
            r={radius}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="20"
          />
          <circle
            cx="80"
            cy="80"
            r={radius}
            fill="none"
            stroke="url(#gradient)"
            strokeWidth="20"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-700"
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold">{percent}%</span>
          <span className="text-xs text-gray-500">completado</span>
        </div>
      </div>
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-primary-500" />
          <span className="text-sm">
            Completadas: <strong>{completed}</strong>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-gray-300" />
          <span className="text-sm">
            Pendientes: <strong>{pending}</strong>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-gray-900 dark:bg-gray-100" />
          <span className="text-sm">
            Totales: <strong>{total}</strong>
          </span>
        </div>
      </div>
    </div>
  );
};

const LineChart = ({ data }) => {
  if (!data || data.length === 0) return null;

  const max = Math.max(...data.map((d) => d.count));
  const height = 120;

  return (
    <div className="relative h-40">
      <svg viewBox={`0 0 ${data.length * 50} ${height}`} className="w-full h-full">
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map((p) => (
          <line
            key={p}
            x1="0"
            y1={`${p}%`}
            x2="100%"
            y2={`${p}%`}
            stroke="#e5e7eb"
            strokeDasharray="4"
          />
        ))}

        {/* Area */}
        <path
          d={`
            M 0 ${height}
            ${data
              .map(
                (d, i) =>
                  `L ${i * 50 + 25} ${height - (d.count / max) * height}`
              )
              .join(" ")}
            L ${(data.length - 1) * 50 + 25} ${height}
            Z
          `}
          fill="url(#lineGradient)"
        />

        {/* Line */}
        <path
          d={`
            M ${data
              .map(
                (d, i) =>
                  `${i === 0 ? "" : " L "}${i * 50 + 25} ${height - (d.count / max) * height}`
              )
              .join("")}
          `}
          fill="none"
          stroke="#6366f1"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Dots */}
        {data.map((d, i) => (
          <circle
            key={i}
            cx={i * 50 + 25}
            cy={height - (d.count / max) * height}
            r="5"
            fill="#6366f1"
            stroke="white"
            strokeWidth="2"
          />
        ))}
      </svg>

      <div className="flex justify-between mt-2 text-xs text-gray-500">
        {data.map((d, i) => (
          <span key={i} className="truncate">
            {d._id?.split("-W")[0]}
          </span>
        ))}
      </div>
    </div>
  );
};

export default function Stats() {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/stats");
        setStats(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!stats) return null;

  const categoryData = stats.byCategory
    ?.filter((s) => s.category)
    .map((s) => ({
      name: s.category.name,
      count: s.count,
    })) || [];

  const notebookData = stats.byNotebook
    ?.filter((s) => s.notebook)
    .map((s) => ({
      name: s.notebook.name,
      count: s.count,
    })) || [];

  const tagData = stats.topTags?.map((t) => ({
    name: t._id,
    count: t.count,
  })) || [];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold gradient-text mb-2">Estadísticas</h1>
        <p className="text-gray-500">Tu actividad en ShareNotes</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total de notas"
          value={stats.totalNotes}
          icon={FileText}
          color="bg-primary-100 text-primary-600"
        />
        <StatCard
          title="Tareas completadas"
          value={stats.tasks?.completed || 0}
          icon={CheckSquare}
          color="bg-green-100 text-green-600"
          subtitle={`de ${stats.tasks?.total || 0} totales`}
        />
        <StatCard
          title="Etiquetas usadas"
          value={tagData.length}
          icon={Tag}
          color="bg-purple-100 text-purple-600"
        />
        <StatCard
          title="Cuadernos"
          value={notebookData.length}
          icon={Calendar}
          color="bg-amber-100 text-amber-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Tasks Progress */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6">
          <h3 className="font-semibold text-lg mb-6">Progreso de tareas</h3>
          <DonutChart
            total={stats.tasks?.total || 0}
            completed={stats.tasks?.completed || 0}
          />
        </div>

        {/* Activity */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6">
          <h3 className="font-semibold text-lg mb-6">Actividad (últimas 8 semanas)</h3>
          <LineChart data={stats.byWeek || []} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Categories */}
        {categoryData.length > 0 && (
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6">
            <h3 className="font-semibold text-lg mb-6">Notas por categoría</h3>
            <BarChart data={categoryData} />
          </div>
        )}

        {/* Notebooks */}
        {notebookData.length > 0 && (
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6">
            <h3 className="font-semibold text-lg mb-6">Notas por cuaderno</h3>
            <BarChart data={notebookData} />
          </div>
        )}

        {/* Tags */}
        {tagData.length > 0 && (
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 lg:col-span-2">
            <h3 className="font-semibold text-lg mb-6">Etiquetas más usadas</h3>
            <div className="flex flex-wrap gap-2">
              {tagData.map((tag, i) => (
                <span
                  key={i}
                  className="px-4 py-2 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-xl text-sm font-medium"
                >
                  #{tag.name} ({tag.count})
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}