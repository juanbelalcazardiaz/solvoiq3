

import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { Task, Client, TeamMember, TaskStatus, FormMode, TaskPriority } from '../types';
import { TaskCard } from '../components/TaskCard';
import { List, Columns, Filter as FilterIconLucide, PlusCircle, Edit2, Trash2, Clock, AlertTriangle, ListChecks, PieChart, BarChart3, CheckSquare, Users, Download, Upload, PlayCircle, PauseCircle, CheckCircle as CheckCircleIcon } from 'lucide-react';
import { EmptyState } from '../components/EmptyState';
import { SimpleDoughnutChart } from '../components/SimpleDoughnutChart';

const TASKS_VIEW_MODE_KEY = 'solvoiq_tasks_view_mode';
const TASKS_PRIORITY_FILTER_KEY = 'solvoiq_tasks_priority_filter';
const KANBAN_IN_PROGRESS_WIP_LIMIT = 5;


interface TasksPageProps {
  tasks: Task[];
  clients: Client[];
  teamMembers: TeamMember[];
  currentUser: { id: string; name: string };
  onOpenTaskForm: (mode: FormMode, task?: Task) => void;
  onDeleteTask: (taskId: string) => void;
  updateTaskStatus: (task: Task) => void;
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>; 
}

const tailwindColors = {
  primary: '#58A6FF',
  success: '#3FB950',
  warning: '#F0883E',
  danger: '#F85149',
  mediumText: '#8B949E',
  lightBorder: '#484F58',
  darkText: '#E6EDF3',
  inputBg: '#21262D',
  sidebarBg: '#161B22',
  warningLight: 'rgba(240, 136, 62, 0.15)',
};

const getStatusPillClasses = (status: TaskStatus): string => {
  switch (status) {
    case TaskStatus.PENDING: return 'bg-warning-light text-warning';
    case TaskStatus.IN_PROGRESS: return 'bg-primary-light text-primary';
    case TaskStatus.OVERDUE: return 'bg-danger-light text-danger';
    case TaskStatus.COMPLETED: return 'bg-success-light text-success';
    default: return 'bg-light-border text-medium-text';
  }
};

const getKanbanColumnBg = (status: TaskStatus, taskCount?: number): string => {
    if (status === TaskStatus.IN_PROGRESS && taskCount && taskCount > KANBAN_IN_PROGRESS_WIP_LIMIT) {
        return 'bg-warning-light/10'; // Subtle warning background
    }
    return 'bg-sidebar-bg';
};

const getDueDateInfoList = (dueDateStr: string, status: TaskStatus): { textClass: string, icon?: React.ReactNode, isUrgent: boolean, isDueToday: boolean, daysDiffText: string } => {
  const dueDate = new Date(dueDateStr);
  const today = new Date();
  today.setHours(0,0,0,0);
  dueDate.setHours(0,0,0,0);

  const diffTime = dueDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  let daysDiffText = '';

  if (status === TaskStatus.COMPLETED) {
      daysDiffText = 'Completed';
      return { textClass: 'text-medium-text', isUrgent: false, isDueToday: false, daysDiffText };
  }

  if (diffDays < 0) {
      daysDiffText = `${Math.abs(diffDays)} days overdue`;
      return { textClass: 'text-danger font-semibold', icon: <AlertTriangle size={14} className="mr-1 inline-block" />, isUrgent: true, isDueToday: false, daysDiffText };
  }
  if (diffDays === 0) {
      daysDiffText = 'Due Today';
      return { textClass: 'text-danger font-semibold', icon: <Clock size={14} className="mr-1 inline-block text-danger" />, isUrgent: true, isDueToday: true, daysDiffText };
  }
  if (diffDays <= 3) {
      daysDiffText = `${diffDays} days left`;
      return { textClass: 'text-warning', icon: <Clock size={14} className="mr-1 inline-block text-warning" />, isUrgent: true, isDueToday: false, daysDiffText };
  }
  
  daysDiffText = `${diffDays} days left`;
  return { textClass: 'text-medium-text', isUrgent: false, isDueToday: false, daysDiffText };
};


export const TasksPage: React.FC<TasksPageProps> = ({ tasks, clients, teamMembers, currentUser, onOpenTaskForm, onDeleteTask, updateTaskStatus, setTasks }) => {
    const [viewMode, setViewMode] = useState<'list' | 'kanban'>(() => {
        try {
            const persistedViewMode = localStorage.getItem(TASKS_VIEW_MODE_KEY);
            return (persistedViewMode === 'list' || persistedViewMode === 'kanban') ? persistedViewMode : 'kanban';
        } catch (error) {
            console.warn("Could not read tasks view mode from localStorage", error);
            return 'kanban';
        }
    });

    const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'all'>(() => {
        try {
            const persistedFilter = localStorage.getItem(TASKS_PRIORITY_FILTER_KEY);
            return Object.values(TaskPriority).includes(persistedFilter as TaskPriority) || persistedFilter === 'all'
                ? persistedFilter as TaskPriority | 'all'
                : 'all';
        } catch (error) {
            console.warn("Could not read tasks priority filter from localStorage", error);
            return 'all';
        }
    });

    const [memberFilter, setMemberFilter] = useState<string>('all');
    const [clientFilter, setClientFilter] = useState<string>('all');
    const [overdueFilter, setOverdueFilter] = useState<boolean>(false);
    const [searchTerm, setSearchTerm] = useState('');

    const [activeTimerId, setActiveTimerId] = useState<string | null>(null);
    const timerIntervalRef = useRef<number | null>(null);

    const importFileRef = useRef<HTMLInputElement>(null);

    const startTimer = useCallback((taskId: string) => {
        if (activeTimerId) {
            clearInterval(timerIntervalRef.current!);
        }
        setActiveTimerId(taskId);
        timerIntervalRef.current = window.setInterval(() => {
            setTasks(prevTasks => prevTasks.map(t =>
                t.id === taskId ? { ...t, elapsedTimeSeconds: (t.elapsedTimeSeconds || 0) + 1 } : t
            ));
        }, 1000);
    }, [activeTimerId, setTasks]);

    const stopTimer = useCallback(() => {
        if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
        }
        setActiveTimerId(null);
    }, []);

    useEffect(() => {
        return () => {
            if (timerIntervalRef.current) {
                clearInterval(timerIntervalRef.current);
            }
        };
    }, []);

    const handleMarkComplete = (taskId: string) => {
        const taskToUpdate = tasks.find(t => t.id === taskId);
        if (taskToUpdate) {
            if (taskId === activeTimerId) {
                stopTimer();
            }
            updateTaskStatus({ ...taskToUpdate, status: TaskStatus.COMPLETED });
        }
    };

    const formatTime = (totalSeconds: number = 0): string => {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    };

    useEffect(() => {
        try { localStorage.setItem(TASKS_VIEW_MODE_KEY, viewMode); } catch (e) { console.warn("Could not save tasks view mode to localStorage", e); }
    }, [viewMode]);

    useEffect(() => {
        try { localStorage.setItem(TASKS_PRIORITY_FILTER_KEY, priorityFilter); } catch (e) { console.warn("Could not save tasks priority filter to localStorage", e); }
    }, [priorityFilter]);

    const filteredTasks = useMemo(() => {
        return tasks.filter(task => {
            const isActuallyOverdue = new Date(task.dueDate) < new Date() && task.status !== TaskStatus.COMPLETED;
            return (
                (priorityFilter === 'all' || task.priority === priorityFilter) &&
                (memberFilter === 'all' || task.assignedTo === memberFilter) &&
                (clientFilter === 'all' || task.clientId === clientFilter) &&
                (!overdueFilter || isActuallyOverdue) &&
                (task.title.toLowerCase().includes(searchTerm.toLowerCase()) || task.description.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        });
    }, [tasks, priorityFilter, memberFilter, clientFilter, overdueFilter, searchTerm]);

    const taskStats = useMemo(() => {
        const total = tasks.length;
        const pending = tasks.filter(t => t.status === TaskStatus.PENDING).length;
        const inProgress = tasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length;
        const overdue = tasks.filter(t => t.status === TaskStatus.OVERDUE || (new Date(t.dueDate) < new Date() && t.status !== TaskStatus.COMPLETED)).length;
        const completed = tasks.filter(t => t.status === TaskStatus.COMPLETED).length;
        const chartData = [
            { label: TaskStatus.PENDING, value: pending, color: tailwindColors.warning },
            { label: TaskStatus.IN_PROGRESS, value: inProgress, color: tailwindColors.primary },
            { label: "Overdue", value: overdue, color: tailwindColors.danger },
            { label: TaskStatus.COMPLETED, value: completed, color: tailwindColors.success },
        ].filter(d => d.value > 0);
        return { total, pending, inProgress, overdue, completed, chartData };
    }, [tasks]);

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, taskId: string) => {
        e.dataTransfer.setData("taskId", taskId);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>, newStatus: TaskStatus) => {
        e.preventDefault();
        const taskId = e.dataTransfer.getData("taskId");
        const taskToUpdate = tasks.find(t => t.id === taskId);
        if (taskToUpdate && taskToUpdate.status !== newStatus) {
            if (activeTimerId === taskId && newStatus === TaskStatus.COMPLETED) {
                stopTimer();
            }
            updateTaskStatus({ ...taskToUpdate, status: newStatus });
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    const handleExportTasks = () => {
        const filename = `solvoiq_tasks_export_${new Date().toISOString().split('T')[0]}.json`;
        const jsonStr = JSON.stringify(tasks, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const href = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = href;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(href);
    };
    
    const handleImportTasks = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedTasks = JSON.parse(e.target?.result as string) as Task[];
                if (!Array.isArray(importedTasks) || (importedTasks.length > 0 && (!importedTasks[0].id || !importedTasks[0].title))) {
                    throw new Error("Imported data does not seem to be a valid task list.");
                }
                if (window.confirm(`This will replace all current tasks with ${importedTasks.length} new tasks. Are you sure?`)) {
                    setTasks(importedTasks);
                    alert("Tasks imported successfully!");
                }
            } catch (error: any) {
                alert(`Error importing tasks: ${error.message}`);
                console.error("Import error:", error);
            } finally {
                if (importFileRef.current) importFileRef.current.value = "";
            }
        };
        reader.readAsText(file);
    };

    const kanbanColumns = useMemo(() => {
        const columns: { [key in TaskStatus]?: Task[] } = {};
        Object.values(TaskStatus).forEach(status => columns[status] = []);
        filteredTasks.forEach(task => {
            if (columns[task.status]) {
                columns[task.status]!.push(task);
            }
        });
        return columns;
    }, [filteredTasks]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
                <h1 className="text-3xl font-bold text-dark-text">Task Board</h1>
                <button onClick={() => onOpenTaskForm('add')} className="flex items-center bg-primary hover:bg-primary-dark text-white font-medium py-2.5 px-5 rounded-md text-sm transition-all duration-300 shadow-md hover:shadow-hero-glow-light hover:scale-105">
                    <PlusCircle size={18} className="mr-2"/> Add New Task
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="lg:col-span-2 bg-sidebar-bg p-4 rounded-lg shadow-sm border border-border-color flex items-center justify-center">
                    <SimpleDoughnutChart data={taskStats.chartData} size={150} holeSize={0.6}/>
                </div>
                <div className="bg-input-bg p-3 rounded-lg shadow-sm border border-border-color"><h3 className="text-xs text-light-text">Total Tasks</h3><p className="text-2xl font-bold text-dark-text">{taskStats.total}</p></div>
                <div className="bg-input-bg p-3 rounded-lg shadow-sm border border-border-color"><h3 className="text-xs text-light-text">Pending</h3><p className="text-2xl font-bold text-warning">{taskStats.pending}</p></div>
                <div className="bg-input-bg p-3 rounded-lg shadow-sm border border-border-color"><h3 className="text-xs text-light-text">Overdue</h3><p className="text-2xl font-bold text-danger">{taskStats.overdue}</p></div>
            </div>

            <div className="p-3 bg-sidebar-bg rounded-lg shadow-subtle flex flex-col md:flex-row flex-wrap gap-3 border border-border-color items-center">
                <input type="search" placeholder="Search tasks..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="form-input flex-grow rounded-md border-border-color shadow-subtle focus:border-primary focus:ring-1 focus:ring-primary text-xs py-1.5 bg-input-bg text-dark-text"/>
                <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value as any)} className="form-select w-full md:w-auto rounded-md border-border-color shadow-subtle focus:border-primary focus:ring-1 focus:ring-primary text-xs py-1.5 bg-input-bg text-dark-text appearance-none">
                    <option value="all">All Priorities</option>
                    {Object.values(TaskPriority).map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                <select value={memberFilter} onChange={e => setMemberFilter(e.target.value)} className="form-select w-full md:w-auto rounded-md border-border-color shadow-subtle focus:border-primary focus:ring-1 focus:ring-primary text-xs py-1.5 bg-input-bg text-dark-text appearance-none">
                    <option value="all">All Members</option>
                    {teamMembers.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
                <select value={clientFilter} onChange={e => setClientFilter(e.target.value)} className="form-select w-full md:w-auto rounded-md border-border-color shadow-subtle focus:border-primary focus:ring-1 focus:ring-primary text-xs py-1.5 bg-input-bg text-dark-text appearance-none">
                    <option value="all">All Clients</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <label className="flex items-center space-x-2 text-xs text-medium-text cursor-pointer hover:text-dark-text">
                    <input type="checkbox" checked={overdueFilter} onChange={() => setOverdueFilter(!overdueFilter)} className="form-checkbox h-3.5 w-3.5 text-danger border-light-border rounded focus:ring-danger bg-sidebar-bg"/>
                    <span>Show Overdue Only</span>
                </label>
                <div className="flex items-center space-x-1 border border-border-color rounded-md p-0.5 bg-border-color ml-auto">
                    <button onClick={() => setViewMode('kanban')} title="Kanban View" className={`p-1.5 rounded ${viewMode === 'kanban' ? 'bg-primary text-white' : 'text-medium-text hover:bg-input-bg'}`}><Columns size={18} /></button>
                    <button onClick={() => setViewMode('list')} title="List View" className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-primary text-white' : 'text-medium-text hover:bg-input-bg'}`}><List size={18} /></button>
                </div>
                 <button onClick={handleExportTasks} className="p-1.5 text-medium-text hover:text-primary transition-colors rounded-md border border-border-color hover:border-primary bg-input-bg flex items-center text-xs" title="Export Tasks (JSON)"><Download size={16} className="mr-1"/>Export</button>
                <input type="file" ref={importFileRef} onChange={handleImportTasks} accept=".json" style={{display: 'none'}} />
                <button onClick={() => importFileRef.current?.click()} className="p-1.5 text-medium-text hover:text-primary transition-colors rounded-md border border-border-color hover:border-primary bg-input-bg flex items-center text-xs" title="Import Tasks (JSON)"><Upload size={16} className="mr-1"/>Import</button>
            </div>

            {filteredTasks.length === 0 ? <EmptyState icon={ListChecks} title="No Tasks Found" message="Try adjusting your filters or add a new task." actionButtonText="Add New Task" onAction={() => onOpenTaskForm('add')} /> : viewMode === 'list' ? (
                <div className="bg-input-bg shadow-card rounded-lg overflow-x-auto border border-border-color">
                    <table className="min-w-full divide-y divide-border-color">
                        <thead className="bg-sidebar-bg">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-light-text uppercase tracking-wider">Title</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-light-text uppercase tracking-wider">Status</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-light-text uppercase tracking-wider">Due Date</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-light-text uppercase tracking-wider">Assignee</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-light-text uppercase tracking-wider">Client</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-light-text uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-input-bg divide-y divide-border-color">
                            {filteredTasks.map(task => {
                                const dueDateInfo = getDueDateInfoList(task.dueDate, task.status);
                                return (
                                <tr key={task.id} className="hover:bg-sidebar-bg transition-colors">
                                    <td className="px-4 py-3 max-w-xs"><div className="text-sm font-medium text-dark-text truncate" title={task.title}>{task.title}</div><p className="text-xs text-medium-text truncate" title={task.description}>{task.description}</p></td>
                                    <td className="px-4 py-3"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusPillClasses(task.status)}`}>{task.status}</span></td>
                                    <td className={`px-4 py-3 text-xs whitespace-nowrap ${dueDateInfo.textClass}`}>{dueDateInfo.daysDiffText}</td>
                                    <td className="px-4 py-3 text-sm text-medium-text">{teamMembers.find(tm => tm.id === task.assignedTo)?.name || 'N/A'}</td>
                                    <td className="px-4 py-3 text-sm text-medium-text">{clients.find(c => c.id === task.clientId)?.name || 'N/A'}</td>
                                    <td className="px-4 py-3 space-x-1"><button onClick={() => onOpenTaskForm('edit', task)} className="p-1 text-primary hover:text-primary-dark rounded-md"><Edit2 size={16}/></button><button onClick={() => onDeleteTask(task.id)} className="p-1 text-danger hover:text-red-600 rounded-md"><Trash2 size={16}/></button></td>
                                </tr>
                            )})}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {Object.values(TaskStatus).map(status => (
                        <div key={status} onDrop={(e) => handleDrop(e, status)} onDragOver={handleDragOver} className={`p-3 rounded-lg ${getKanbanColumnBg(status, kanbanColumns[status]?.length)}`}>
                            <h3 className="text-sm font-semibold text-dark-text mb-3 px-1 flex justify-between items-center border-b border-border-color pb-2">
                                <span>{status}</span>
                                <span className="text-xs text-medium-text bg-border-color px-1.5 py-0.5 rounded-full">{kanbanColumns[status]?.length || 0}</span>
                            </h3>
                            {status === TaskStatus.IN_PROGRESS && (kanbanColumns[status]?.length || 0) > KANBAN_IN_PROGRESS_WIP_LIMIT &&
                                <div className="text-xs text-warning bg-warning-light p-1.5 rounded-md mb-2 flex items-center"><AlertTriangle size={14} className="mr-1.5"/>WIP Limit Exceeded</div>
                            }
                            <div className="space-y-3 h-[60vh] overflow-y-auto custom-scrollbar pr-1">
                                {kanbanColumns[status]?.map(task => (
                                    <div key={task.id} draggable onDragStart={(e) => handleDragStart(e, task.id)}>
                                        <TaskCard 
                                            task={task} 
                                            clientName={clients.find(c => c.id === task.clientId)?.name} 
                                            teamMember={teamMembers.find(tm => tm.id === task.assignedTo)} 
                                            onEditTask={onOpenTaskForm} 
                                            onDeleteTask={onDeleteTask}
                                            onMarkComplete={handleMarkComplete}
                                            onStartTimer={startTimer}
                                            onStopTimer={stopTimer}
                                            isTimerActive={activeTimerId === task.id}
                                            elapsedTime={task.elapsedTimeSeconds || 0}
                                            formatTime={formatTime}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
