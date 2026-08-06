import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  Target,
  Flame,
  GraduationCap,
  Sparkles,
} from "lucide-react";

interface StudyTask {
  id: string;
  title: string;
  subject: string;
  duration: number; // minutes
  completed: boolean;
  createdAt: string;
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const SUBJECT_COLORS = [
  "bg-blue-100 text-blue-700",
  "bg-emerald-100 text-emerald-700",
  "bg-purple-100 text-purple-700",
  "bg-rose-100 text-rose-700",
  "bg-amber-100 text-amber-700",
  "bg-teal-100 text-teal-700",
];

export default function StudyPlanner() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<StudyTask[]>([]);
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [duration, setDuration] = useState(30);
  const [selectedDay, setSelectedDay] = useState(() => {
    const today = new Date().getDay(); // 0 = Sunday
    return DAYS[today === 0 ? 6 : today - 1];
  });
  const [showAdd, setShowAdd] = useState(false);

  // Load tasks from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("oppnav-study-tasks");
      if (stored) setTasks(JSON.parse(stored));
    } catch {
      // ignore corrupt storage
    }
  }, []);

  // Persist tasks
  useEffect(() => {
    localStorage.setItem("oppnav-study-tasks", JSON.stringify(tasks));
  }, [tasks]);

  const addTask = () => {
    if (!title.trim()) return;
    const task: StudyTask = {
      id: crypto.randomUUID(),
      title: title.trim(),
      subject: subject.trim() || "General",
      duration: Math.max(15, duration),
      completed: false,
      createdAt: new Date().toISOString(),
    };
    setTasks((prev) => [task, ...prev]);
    setTitle("");
    setSubject("");
    setDuration(30);
    setShowAdd(false);
  };

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const removeTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const totalMinutes = tasks.reduce((sum, t) => sum + t.duration, 0);
  const completedCount = tasks.filter((t) => t.completed).length;
  const progress = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;
  const streak = localStorage.getItem("oppnav-study-streak") || "0";

  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto">
      <button
        onClick={() => navigate("/dashboard")}
        className="inline-flex items-center gap-2 text-sm text-foreground/60 hover:text-foreground mb-6 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </button>

      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
          <CalendarDays className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="font-heading font-bold text-2xl md:text-3xl text-foreground">
            Study Planner
          </h1>
          <p className="text-foreground/60">
            Plan your study sessions, track progress, and stay consistent.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
        <div className="bg-white border border-border rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-semibold text-foreground/60 uppercase tracking-wider">
              Total Study Time
            </span>
          </div>
          <p className="text-2xl font-heading font-bold text-foreground">
            {hours}h {mins}m
          </p>
        </div>
        <div className="bg-white border border-border rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-semibold text-foreground/60 uppercase tracking-wider">
              Tasks Planned
            </span>
          </div>
          <p className="text-2xl font-heading font-bold text-foreground">{tasks.length}</p>
        </div>
        <div className="bg-white border border-border rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-semibold text-foreground/60 uppercase tracking-wider">
              Completed
            </span>
          </div>
          <p className="text-2xl font-heading font-bold text-foreground">
            {completedCount}
            <span className="text-sm text-foreground/40 font-normal"> / {tasks.length}</span>
          </p>
          <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        <div className="bg-white border border-border rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Flame className="w-4 h-4 text-amber-600" />
            <span className="text-xs font-semibold text-foreground/60 uppercase tracking-wider">
              Day Streak
            </span>
          </div>
          <p className="text-2xl font-heading font-bold text-foreground">{streak} days</p>
        </div>
      </div>

      {/* Day selector */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-heading font-semibold text-lg text-foreground">
            Weekly Schedule
          </h2>
          <button
            onClick={() => setShowAdd(!showAdd)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-on-primary text-sm font-semibold rounded-xl hover:opacity-90 active:scale-[0.97] transition-all duration-150 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Task
          </button>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 mb-5">
          {DAYS.map((day) => {
            const dayTasks = tasks.filter((t) => t.createdAt.includes("2025") || true);
            const isToday = day === DAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];
            void dayTasks;
            return (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  selectedDay === day
                    ? "bg-primary text-on-primary shadow-sm"
                    : "bg-white border border-border text-foreground/70 hover:bg-muted"
                } ${isToday && selectedDay !== day ? "ring-2 ring-primary/30" : ""}`}
              >
                {day}
                {isToday && (
                  <span className="ml-1.5 text-xs">•</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Add task form */}
        {showAdd && (
          <div className="bg-white border border-border rounded-2xl p-5 mb-5 shadow-sm animate-[fadeIn_0.2s_ease-out]">
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-foreground/60 uppercase tracking-wider mb-1.5">
                  Task
                </label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addTask()}
                  placeholder="e.g. Study linear algebra"
                  className="w-full px-3 py-2.5 border-2 border-border rounded-xl text-sm bg-white placeholder:text-foreground/30 focus:border-primary focus:ring-3 focus:ring-ring/20 outline-none transition-all duration-200"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-foreground/60 uppercase tracking-wider mb-1.5">
                  Subject
                </label>
                <input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Math"
                  className="w-full px-3 py-2.5 border-2 border-border rounded-xl text-sm bg-white placeholder:text-foreground/30 focus:border-primary focus:ring-3 focus:ring-ring/20 outline-none transition-all duration-200"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-foreground/60 uppercase tracking-wider mb-1.5">
                  Duration (min)
                </label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full px-3 py-2.5 border-2 border-border rounded-xl text-sm bg-white focus:border-primary focus:ring-3 focus:ring-ring/20 outline-none transition-all duration-200"
                >
                  {[15, 30, 45, 60, 90, 120].map((d) => (
                    <option key={d} value={d}>
                      {d} minutes
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={addTask}
                className="px-5 py-2.5 bg-accent text-white text-sm font-semibold rounded-xl hover:opacity-90 active:scale-[0.97] transition-all duration-150 cursor-pointer"
              >
                Add to plan
              </button>
              <button
                onClick={() => setShowAdd(false)}
                className="px-5 py-2.5 text-sm font-medium text-foreground/60 hover:text-foreground rounded-xl hover:bg-muted transition-all cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Task list */}
        {tasks.length === 0 ? (
          <div className="text-center py-16 bg-white border border-border rounded-2xl">
            <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <GraduationCap className="w-8 h-8 text-emerald-600" />
            </div>
            <h3 className="font-heading font-semibold text-lg text-foreground mb-2">
              No study tasks yet
            </h3>
            <p className="text-foreground/60 max-w-sm mx-auto mb-6">
              Add your first study session and build a consistent routine.
              Small daily wins add up fast!
            </p>
            <button
              onClick={() => setShowAdd(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-on-primary font-medium rounded-xl hover:opacity-90 active:scale-[0.97] transition-all duration-150 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              Plan Your First Session
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => {
              const colorIdx = task.subject.length % SUBJECT_COLORS.length;
              return (
                <div
                  key={task.id}
                  className={`group flex items-center gap-4 bg-white border border-border rounded-2xl p-4 shadow-sm transition-all duration-200 hover:shadow-md ${
                    task.completed ? "opacity-70" : ""
                  }`}
                >
                  <button
                    onClick={() => toggleTask(task.id)}
                    className="shrink-0 cursor-pointer"
                    aria-label={task.completed ? "Mark as not done" : "Mark as done"}
                  >
                    {task.completed ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                    ) : (
                      <Circle className="w-6 h-6 text-foreground/30 hover:text-primary transition-colors" />
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm font-medium text-foreground ${
                        task.completed ? "line-through text-foreground/40" : ""
                      }`}
                    >
                      {task.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                          SUBJECT_COLORS[colorIdx]
                        }`}
                      >
                        {task.subject}
                      </span>
                      <span className="text-xs text-foreground/50 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {task.duration} min
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => removeTask(task.id)}
                    className="p-2 rounded-lg text-foreground/30 hover:text-destructive hover:bg-destructive/10 transition-all cursor-pointer"
                    aria-label="Delete task"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}