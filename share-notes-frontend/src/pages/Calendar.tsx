import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import useNoteStore from '../stores/useNoteStore';
import { useEffect } from 'react';

interface TaskItem {
  _id: string;
  title: string;
  type?: string;
  dueDate?: string;
}

const CalendarPage: React.FC = () => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const { fetchNotes, notes } = useNoteStore();

  useEffect(() => { fetchNotes({ type: 'task' }); }, [fetchNotes]);

  const tasks: TaskItem[] = (notes || []).filter((n: TaskItem) => n.type === 'task' && n.dueDate);
  const month: number = currentDate.getMonth();
  const year: number = currentDate.getFullYear();

  const firstDay: number = new Date(year, month, 1).getDay();
  const daysInMonth: number = new Date(year, month + 1, 0).getDate();

  const days: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const getTasksForDay = (day: number | null): TaskItem[] => {
    if (!day) return [];
    const dateStr: string = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return tasks.filter((t: TaskItem) => t.dueDate?.startsWith(dateStr));
  };

  const monthName: string = currentDate.toLocaleDateString('es', { month: 'long', year: 'numeric' });

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-1">Calendario</h1>
          <p className="text-slate-500 dark:text-slate-500">Vista mensual</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))} className="p-2 hover:bg-slate-100 dark:hover:bg-white/[0.05] rounded-xl text-slate-700 dark:text-white">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="font-semibold capitalize text-slate-800 dark:text-white">{monthName}</span>
          <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))} className="p-2 hover:bg-slate-100 dark:hover:bg-white/[0.05] rounded-xl text-slate-700 dark:text-white">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-[#0d0b1f] border border-slate-200 dark:border-white/[0.06] rounded-xl overflow-hidden">
        <div className="grid grid-cols-7 bg-slate-100 dark:bg-white/[0.03]">
          {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((d: string) => (
            <div key={d} className="p-3 text-center text-sm font-semibold text-slate-500 dark:text-slate-400">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {days.map((day: number | null, i: number) => {
            const dayTasks: TaskItem[] = getTasksForDay(day);
            return (
              <div key={i} className={`min-h-[100px] p-2 border-t border-r border-slate-200 dark:border-white/[0.06] ${!day ? 'bg-slate-100 dark:bg-white/[0.05]/30' : 'bg-white dark:bg-[#0d0b1f]'}`}>
                {day && (
                  <>
                    <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-sm text-slate-700 dark:text-white ${dayTasks.length > 0 ? 'bg-primary-500 text-white' : 'hover:bg-slate-100 dark:hover:bg-white/[0.05]'}`}>
                      {day}
                    </span>
                    <div className="mt-1 space-y-1">
                      {dayTasks.slice(0, 2).map((task: TaskItem) => (
                        <div key={task._id} className="text-xs p-1 bg-primary-500/10 text-primary-400 rounded truncate">
                          {task.title}
                        </div>
                      ))}
                      {dayTasks.length > 2 && (
                        <div className="text-xs text-slate-500 dark:text-slate-500">+{dayTasks.length - 2} más</div>
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
};

export default CalendarPage;
