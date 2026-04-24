import { useState } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock } from "lucide-react";
import useNoteStore from "../stores/useNoteStore";
import { useEffect } from "react";

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { fetchNotes, notes } = useNoteStore();

  useEffect(() => { fetchNotes({}); }, []);

  const tasks = (notes || []).filter(n => n.type === "task" && n.dueDate);
  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const getTasksForDay = (day) => {
    if (!day) return [];
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return tasks.filter(t => t.dueDate?.startsWith(dateStr));
  };

  const monthName = currentDate.toLocaleDateString("es", { month: "long", year: "numeric" });

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold gradient-text mb-1">📅 Calendario</h1>
          <p className="text-gray-500">Vista mensual</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="font-semibold capitalize">{monthName}</span>
          <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden">
        <div className="grid grid-cols-7 bg-gray-50 dark:bg-gray-800">
          {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((d) => (
            <div key={d} className="p-3 text-center text-sm font-semibold text-gray-500">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {days.map((day, i) => {
            const dayTasks = getTasksForDay(day);
            return (
              <div key={i} className={`min-h-[100px] p-2 border-t border-r border-gray-100 dark:border-gray-800 ${!day ? "bg-gray-50 dark:bg-gray-800/50" : ""}`}>
                {day && (
                  <>
                    <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-sm ${dayTasks.length > 0 ? "bg-primary-500 text-white" : ""}`}>
                      {day}
                    </span>
                    <div className="mt-1 space-y-1">
                      {dayTasks.slice(0, 2).map((task) => (
                        <div key={task._id} className="text-xs p-1 bg-primary-50 dark:bg-primary-900/30 rounded truncate">
                          {task.title}
                        </div>
                      ))}
                      {dayTasks.length > 2 && (
                        <div className="text-xs text-gray-500">+{dayTasks.length - 2} más</div>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}