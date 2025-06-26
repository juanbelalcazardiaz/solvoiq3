

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


const StatCard: React.FC<{ title: string; value: string | number; icon: React.ElementType; iconColorClass?: string; containerClass?: string }> =
  ({ title, value, icon: Icon, iconColorClass = "text-primary", containerClass = "bg-input-bg" }) => (
  <div className={`${containerClass} p-4 rounded-lg shadow-subtle border border-border-color flex flex-col items-start transition-all duration-300 ease-in-out hover:shadow-card hover:border-primary/30 hover:scale-[1.02]`}>
    <Icon size={24} className={`${iconColorClass} mb-2.5`} strokeWidth={1.5}/>
    <p className="text-xs text-medium-text uppercase tracking-wider mb-0.5">{title}</p>
    <p className="text-2xl font-bold text-dark-text">{value}</p>
  </div>
);

const TeamMemberTaskLoadChart: React.FC<{ tasks: Task[], teamMembers: TeamMember[] }> = ({ tasks, teamMembers }) => {
    const openTasks = tasks.filter(task => task.status !== TaskStatus.COMPLETED);
    const taskLoadData = useMemo(() => {
        return teamMembers.map(member => {
            const memberTasksCount = openTasks.filter(task => task.assignedTo === member.name).length;
            return { name: member.name, tasks: memberTasksCount };
        }).filter(member => member.tasks > 0) 
          .sort((a, b) => b.tasks - a.tasks);
    }, [openTasks, teamMembers]);

    if (taskLoadData.length === 0) {
        return <p className="text-sm text-medium-text text-center py-4">No open tasks assigned to team members.</p>;
    }

    const maxTasks = Math.max(...taskLoadData.map(d => d.tasks), 0);

    return (
        <div className="space-y-2.5 max-h-60 overflow-y-auto custom-scrollbar pr-2">
            {taskLoadData.map(member => (
                <div key={member.name} className="flex items-center text-xs">
                    <span className="w-28 truncate text-medium-text mr-2" title={member.name}>{member.name}</span>
                    <div className="flex-grow bg-border-color rounded-full h-4 relative">
                        <div
                            className="bg-primary h-4 rounded-full flex items-center justify-end pr-1"
                            style={{ width: maxTasks > 0 ? `${(member.tasks / maxTasks) * 100}%` : '0%' }}
                            title={`${member.tasks} open tasks`}
                        >
                           <span className="text-white text-[10px] font-medium">{member.tasks}</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};


export const TasksPage: React.FC<TasksPageProps> = ({ tasks, clients, teamMembers, currentUser, onOpenTaskForm, onDeleteTask, updateTaskStatus, setTasks }) => {
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>(() => {
    try {
      const persistedViewMode = localStorage.getItem(TASKS_VIEW_MODE_KEY);
      return (persistedViewMode === 'list' || persistedViewMode === 'kanban') ? persistedViewMode : 'kanban'; // Default to Kanban
    } catch (error) {
      console.warn("Could not read tasks view mode from localStorage", error);
      return 'kanban'; // Default to Kanban
    }
  });
  const [userFilter, setUserFilter] = useState<'all' | 'my-tasks'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'overdue' | 'open'>('all');
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
  const importFileRef = useRef<HTMLInputElement>(null);

  const [activeTimerTaskId, setActiveTimerTaskId] = useState<string | null>(null);
  const [taskTimers, setTaskTimers] = useState<Record<string, { elapsedSeconds: number; intervalId: number | null }>>({});

  useEffect(() => {
    try {
      localStorage.setItem(TASKS_VIEW_MODE_KEY, viewMode);
    } catch (error) {
      console.warn("Could not save tasks view mode to localStorage", error);
    }
  }, [viewMode]);

  useEffect(() => {
    try {
      localStorage.setItem(TASKS_PRIORITY_FILTER_KEY, priorityFilter);
    } catch (error) {
      console.warn("Could not save tasks priority filter to localStorage", error);
    }
  }, [priorityFilter]);

  const openTasks = useMemo(() => tasks.filter(task => task.status !== TaskStatus.COMPLETED), [tasks]);

  const taskStats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 7);
    sevenDaysAgo.setHours(0,0,0,0);

    const dueTodayCount = openTasks.filter(task => {
      const dueDate = new Date(task.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      return dueDate.getTime() === today.getTime();
    }).length;

    const overdueCount = openTasks.filter(task => new Date(task.dueDate) < today).length;
    
    const completedThisWeekCount = tasks.filter(task => {
        if (task.status !== TaskStatus.COMPLETED) return false;
        // Check against when it was completed if that data is available, otherwise due date
        // For now, using due date as a proxy if completion date isn't stored
        const dueDate = new Date(task.dueDate); 
        return dueDate >= sevenDaysAgo && dueDate <= today; 
    }).length;

    const statusDistribution = openTasks.reduce((acc, task) => {
      const isTaskOverdue = new Date(task.dueDate) < new Date();
      const statusKey = isTaskOverdue ? TaskStatus.OVERDUE : task.status;
      acc[statusKey] = (acc[statusKey] || 0) + 1;
      return acc;
    }, {} as Record<TaskStatus, number>);

    const priorityDistribution = openTasks.reduce((acc, task) => {
      acc[task.priority] = (acc[task.priority] || 0) + 1;
      return acc;
    }, {} as Record<TaskPriority, number>);

    return {
      totalOpen: openTasks.length,
      dueToday: dueTodayCount,
      overdue: overdueCount,
      completedThisWeek: completedThisWeekCount,
      statusChartData: [
        { label: 'Pending', value: statusDistribution[TaskStatus.PENDING] || 0, color: tailwindColors.warning },
        { label: 'In Progress', value: statusDistribution[TaskStatus.IN_PROGRESS] || 0, color: tailwindColors.primary },
        { label: 'Overdue', value: statusDistribution[TaskStatus.OVERDUE] || 0, color: tailwindColors.danger },
      ].filter(d => d.value > 0),
      priorityChartData: [
        { label: 'Low', value: priorityDistribution[TaskPriority.LOW] || 0, color: tailwindColors.success },
        { label: 'Medium', value: priorityDistribution[TaskPriority.MEDIUM] || 0, color: tailwindColors.warning },
        { label: 'High', value: priorityDistribution[TaskPriority.HIGH] || 0, color: tailwindColors.danger },
      ].filter(d => d.value > 0),
    };
  }, [openTasks, tasks]);

  const filteredTasks = useMemo(() => {
    let currentTasks = tasks;
    if (userFilter === 'my-tasks') {
      currentTasks = tasks.filter(task => task.assignedTo === currentUser.name);
    }
    
    if (statusFilter === 'overdue') {
      currentTasks = currentTasks.filter(task => task.status === TaskStatus.OVERDUE || (new Date(task.dueDate) < new Date() && task.status !== TaskStatus.COMPLETED));
    } else if (statusFilter === 'open') {
        currentTasks = currentTasks.filter(task => task.status !== TaskStatus.COMPLETED);
    }

    if (priorityFilter !== 'all') {
        currentTasks = currentTasks.filter(task => task.priority === priorityFilter);
    }

    return currentTasks.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime() || a.title.localeCompare(b.title));
  }, [tasks, userFilter, statusFilter, priorityFilter, currentUser.name]);

  const kanbanColumns = useMemo(() => {
    const columns: { [key in TaskStatus]?: Task[] } = {
      [TaskStatus.PENDING]: [],
      [TaskStatus.IN_PROGRESS]: [],
      [TaskStatus.OVERDUE]: [],
      [TaskStatus.COMPLETED]: [],
    };

    filteredTasks.forEach(task => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const dueDate = new Date(task.dueDate);
      dueDate.setHours(0, 0, 0, 0);

      if (task.status === TaskStatus.COMPLETED) {
        columns[TaskStatus.COMPLETED]?.push(task);
      } else if (task.status === TaskStatus.OVERDUE || (dueDate < today && (task.status === TaskStatus.PENDING || task.status === TaskStatus.IN_PROGRESS))) {
        columns[TaskStatus.OVERDUE]?.push(task);
      } else if (task.status === TaskStatus.PENDING) { 
        columns[TaskStatus.PENDING]?.push(task);
      } else if (task.status === TaskStatus.IN_PROGRESS) { 
        columns[TaskStatus.IN_PROGRESS]?.push(task);
      }
    });
    return columns;
  }, [filteredTasks]);


  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, taskId: string) => {
    e.dataTransfer.setData('taskId', taskId);
    e.currentTarget.classList.add('opacity-50', 'scale-95');
  };
  
  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.classList.remove('opacity-50', 'scale-95');
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, newStatus: TaskStatus) => {
    e.preventDefault();
    e.currentTarget.classList.remove('border-primary', 'bg-primary-light/10');
    const taskId = e.dataTransfer.getData('taskId');
    const taskToUpdate = tasks.find(t => t.id === taskId);

    if (taskToUpdate && taskToUpdate.status !== newStatus) {
      const today = new Date();
      today.setHours(0,0,0,0);
      const dueDate = new Date(taskToUpdate.dueDate);
      dueDate.setHours(0,0,0,0);

      let finalStatus = newStatus;
      if (newStatus === TaskStatus.COMPLETED) {
        if (activeTimerTaskId === taskId) handleStopTimer(taskId); 
      } else if (dueDate < today ) { 
        finalStatus = TaskStatus.OVERDUE;
      }
      updateTaskStatus({ ...taskToUpdate, status: finalStatus });
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.classList.add('border-primary', 'bg-primary-light/10');
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.classList.remove('border-primary', 'bg-primary-light/10');
  };
  
  const getKanbanColumnIcon = (status: TaskStatus): React.ReactNode => {
    switch(status) {
        case TaskStatus.PENDING: return <Clock size={18} className="text-warning" />;
        case TaskStatus.IN_PROGRESS: return <ListChecks size={18} className="text-primary" />;
        case TaskStatus.OVERDUE: return <AlertTriangle size={18} className="text-danger" />;
        case TaskStatus.COMPLETED: return <CheckSquare size={18} className="text-success" />;
        default: return null;
    }
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
        if (!Array.isArray(importedTasks)) throw new Error("Imported data is not an array.");
        if (importedTasks.length > 0 && (!importedTasks[0].id || !importedTasks[0].title)) {
          throw new Error("Imported data does not seem to be a valid task list.");
        }
        
        if (window.confirm(`Are you sure you want to import ${importedTasks.length} tasks? This will replace all current tasks.`)) {
          setTasks(importedTasks.map(task => ({ ...task, elapsedTimeSeconds: task.elapsedTimeSeconds || 0 })));
          alert("Tasks imported successfully!");
        }
      } catch (error: any) {
        alert(`Error importing tasks: ${error.message}`);
        console.error("Import error:", error);
      } finally {
        if(importFileRef.current) importFileRef.current.value = ""; 
      }
    };
    reader.readAsText(file);
  };

  const handleStartTimer = useCallback((taskId: string) => {
    if (activeTimerTaskId && activeTimerTaskId !== taskId) {
        const currentActiveTimer = taskTimers[activeTimerTaskId];
        if (currentActiveTimer && currentActiveTimer.intervalId) {
            clearInterval(currentActiveTimer.intervalId);
            setTasks(prevTasks => prevTasks.map(task =>
                task.id === activeTimerTaskId ? { ...task, elapsedTimeSeconds: currentActiveTimer.elapsedSeconds } : task
            ));
            setTaskTimers(prev => ({
                ...prev,
                [activeTimerTaskId]: { ...currentActiveTimer, intervalId: null }
            }));
        }
    }

    setActiveTimerTaskId(taskId);

    setTaskTimers(prev => {
        const taskBeingStarted = tasks.find(t => t.id === taskId);
        const initialElapsed = prev[taskId]?.intervalId === null 
            ? prev[taskId].elapsedSeconds 
            : (taskBeingStarted?.elapsedTimeSeconds || 0);

        if (prev[taskId]?.intervalId) clearInterval(prev[taskId].intervalId as any);

        const intervalId = setInterval(() => {
            setTaskTimers(currentTimers => {
                const currentTimerData = currentTimers[taskId];
                if (!currentTimerData) { 
                    clearInterval(intervalId as any);
                    return currentTimers;
                }
                return {
                    ...currentTimers,
                    [taskId]: {
                        ...currentTimerData,
                        elapsedSeconds: currentTimerData.elapsedSeconds + 1,
                    }
                };
            });
        }, 1000);

        return {
            ...prev,
            [taskId]: { elapsedSeconds: initialElapsed, intervalId: intervalId as any }
        };
    });
  }, [activeTimerTaskId, taskTimers, tasks, setTasks]);

  const handleStopTimer = useCallback((taskId: string) => {
    const timer = taskTimers[taskId];
    if (timer && timer.intervalId) {
        clearInterval(timer.intervalId);
        setTasks(prevTasks => prevTasks.map(task =>
            task.id === taskId ? { ...task, elapsedTimeSeconds: timer.elapsedSeconds } : task
        ));
        setTaskTimers(prev => ({
            ...prev,
            [taskId]: { ...timer, intervalId: null } 
        }));
    }
    if (activeTimerTaskId === taskId) {
        setActiveTimerTaskId(null);
    }
  }, [taskTimers, activeTimerTaskId, setTasks]);
  
  const handleMarkComplete = (taskId: string) => {
    const taskToUpdate = tasks.find(t => t.id === taskId);
    if (taskToUpdate) {
        let finalElapsedTime = taskToUpdate.elapsedTimeSeconds || 0;

        if (activeTimerTaskId === taskId && taskTimers[taskId]) {
            const timerData = taskTimers[taskId];
            if (timerData.intervalId) {
                clearInterval(timerData.intervalId);
            }
            finalElapsedTime = timerData.elapsedSeconds;
            
            setTaskTimers(prev => ({
                ...prev,
                [taskId]: { elapsedSeconds: finalElapsedTime, intervalId: null }
            }));
            setActiveTimerTaskId(null);
        }
        updateTaskStatus({ ...taskToUpdate, status: TaskStatus.COMPLETED, elapsedTimeSeconds: finalElapsedTime });
    }
  };
  
  const formatTime = (totalSeconds: number): string => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  useEffect(() => {
    return () => { 
      Object.values(taskTimers).forEach(timer => {
        if (timer.intervalId) clearInterval(timer.intervalId);
      });
    };
  }, [taskTimers]);


  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-bold text-dark-text">Task Management</h1>
        <button 
            onClick={() => onOpenTaskForm('add')}
            className="flex items-center bg-primary hover:bg-primary-dark text-white font-medium py-2.5 px-5 rounded-md text-sm transition-all duration-300 shadow-md hover:shadow-hero-glow-light hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-light-bg focus-visible:ring-primary"
        >
            <PlusCircle size={18} className="mr-2"/> Add New Task
        </button>
      </div>

      <section className="bg-input-bg p-5 rounded-lg shadow-card border border-border-color">
        <h2 className="text-xl font-semibold text-dark-text mb-4 flex items-center">
          <PieChart size={22} className="mr-3 text-primary" /> Task Overview
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard title="Total Open Tasks" value={taskStats.totalOpen} icon={ListChecks} iconColorClass="text-primary" containerClass="bg-sidebar-bg"/>
          <StatCard title="Due Today" value={taskStats.dueToday} icon={Clock} iconColorClass="text-warning" containerClass="bg-sidebar-bg"/>
          <StatCard title="Overdue Tasks" value={taskStats.overdue} icon={AlertTriangle} iconColorClass="text-danger" containerClass="bg-sidebar-bg"/>
          <StatCard title="Completed This Week" value={taskStats.completedThisWeek} icon={CheckSquare} iconColorClass="text-success" containerClass="bg-sidebar-bg"/>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-sidebar-bg p-4 rounded-md border border-border-color flex flex-col items-center">
                <h3 className="text-sm font-semibold text-medium-text mb-2">Open Task Status</h3>
                <SimpleDoughnutChart data={taskStats.statusChartData} size={160} />
            </div>
            <div className="bg-sidebar-bg p-4 rounded-md border border-border-color flex flex-col items-center">
                <h3 className="text-sm font-semibold text-medium-text mb-2">Open Task Priority</h3>
                <SimpleDoughnutChart data={taskStats.priorityChartData} size={160} />
            </div>
             <div className="bg-sidebar-bg p-4 rounded-md border border-border-color">
                <h3 className="text-sm font-semibold text-medium-text mb-3 flex items-center"><Users size={16} className="mr-1.5"/>Team Task Load</h3>
                <TeamMemberTaskLoadChart tasks={openTasks} teamMembers={teamMembers} />
            </div>
        </div>
      </section>

      <div className="p-4 bg-sidebar-bg rounded-lg shadow-subtle flex flex-col md:flex-row flex-wrap gap-4 border border-border-color items-center">
        <div className="flex items-center gap-2">
          <FilterIconLucide className="h-5 w-5 text-light-text"/>
          <select value={userFilter} onChange={e => setUserFilter(e.target.value as 'all' | 'my-tasks')} className="form-select rounded-md border-border-color shadow-subtle text-xs py-2 bg-input-bg text-dark-text appearance-none">
            <option value="all" className="bg-input-bg text-dark-text">All Tasks</option>
            <option value="my-tasks" className="bg-input-bg text-dark-text">My Tasks</option>
          </select>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as 'all' | 'overdue' | 'open')} className="form-select rounded-md border-border-color shadow-subtle text-xs py-2 bg-input-bg text-dark-text appearance-none">
            <option value="all" className="bg-input-bg text-dark-text">All Statuses</option>
            <option value="open" className="bg-input-bg text-dark-text">Open Tasks</option>
            <option value="overdue" className="bg-input-bg text-dark-text">Overdue Tasks</option>
          </select>
           <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value as TaskPriority | 'all')} className="form-select rounded-md border-border-color shadow-subtle text-xs py-2 bg-input-bg text-dark-text appearance-none">
            <option value="all" className="bg-input-bg text-dark-text">All Priorities</option>
            {Object.values(TaskPriority).map(p => <option key={p} value={p} className="bg-input-bg text-dark-text">{p}</option>)}
          </select>
        </div>
        <div className="flex items-center space-x-2 ml-auto">
             <button
                onClick={handleExportTasks}
                className="p-1.5 text-medium-text hover:text-primary transition-colors rounded-md border border-border-color hover:border-primary bg-input-bg flex items-center text-xs"
                title="Export Tasks (JSON)"
              >
                <Download size={16} className="mr-1" /> Export
              </button>
              <input type="file" ref={importFileRef} onChange={handleImportTasks} accept=".json" style={{ display: 'none' }} />
              <button
                onClick={() => importFileRef.current?.click()}
                className="p-1.5 text-medium-text hover:text-primary transition-colors rounded-md border border-border-color hover:border-primary bg-input-bg flex items-center text-xs"
                title="Import Tasks (JSON)"
              >
                <Upload size={16} className="mr-1" /> Import
              </button>
            <div className="flex items-center space-x-1 border border-border-color rounded-md p-0.5 bg-border-color">
                <button onClick={() => setViewMode('list')} title="List View" aria-pressed={viewMode === 'list'} className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-primary text-white' : 'text-medium-text hover:bg-input-bg'}`}>
                    <List size={20} />
                </button>
                <button onClick={() => setViewMode('kanban')} title="Kanban View" aria-pressed={viewMode === 'kanban'} className={`p-1.5 rounded ${viewMode === 'kanban' ? 'bg-primary text-white' : 'text-medium-text hover:bg-input-bg'}`}>
                    <Columns size={20} />
                </button>
            </div>
        </div>
      </div>
      
      {tasks.length === 0 ? (
        <EmptyState 
            icon={ListChecks}
            title="No Tasks Yet"
            message="Get started by adding your first task."
            actionButtonText="Add New Task"
            onAction={() => onOpenTaskForm('add')}
        />
      ) : filteredTasks.length === 0 ? (
         <EmptyState
            icon={FilterIconLucide}
            title="No Tasks Match Filters"
            message="Try adjusting your filter criteria."
        />
      ) : viewMode === 'list' ? (
        <div className="bg-input-bg shadow-card rounded-lg overflow-x-auto border border-border-color">
          <table className="min-w-full divide-y divide-border-color">
            <thead className="bg-sidebar-bg">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-light-text uppercase tracking-wider">Title</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-light-text uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-light-text uppercase tracking-wider">Priority</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-light-text uppercase tracking-wider">Due Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-light-text uppercase tracking-wider">Time to Due</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-light-text uppercase tracking-wider">Assigned To</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-light-text uppercase tracking-wider">Client</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-light-text uppercase tracking-wider">Time Logged</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-light-text uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-input-bg divide-y divide-border-color">
              {filteredTasks.map(task => {
                const client = clients.find(c => c.id === task.clientId);
                const dueDateInfo = getDueDateInfoList(task.dueDate, task.status);
                const displayLoggedTime = formatTime(task.elapsedTimeSeconds || 0);
                return (
                  <tr key={task.id} className="hover:bg-sidebar-bg transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm font-medium text-dark-text">{task.title}</div>
                      <div className="text-xs text-light-text truncate max-w-xs" title={task.description}>{task.description}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusPillClasses(task.status)}`}>
                        {task.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        task.priority === TaskPriority.HIGH ? 'bg-danger-light text-danger' :
                        task.priority === TaskPriority.MEDIUM ? 'bg-warning-light text-warning' :
                        'bg-success-light text-success'
                      }`}>
                        {task.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-medium-text">{new Date(task.dueDate).toLocaleDateString()}</td>
                    <td className={`px-4 py-3 whitespace-nowrap text-xs ${dueDateInfo.textClass}`}>
                        {dueDateInfo.icon} {dueDateInfo.daysDiffText}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-medium-text">{task.assignedTo}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-medium-text">{client?.name || 'N/A'}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-medium-text font-mono">{displayLoggedTime}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium space-x-1">
                      <button onClick={() => onOpenTaskForm('edit', task)} className="text-primary hover:text-primary-dark p-1 rounded-md" title="Edit Task"><Edit2 size={16}/></button>
                      <button onClick={() => onDeleteTask(task.id)} className="text-danger hover:text-red-600 p-1 rounded-md" title="Delete Task"><Trash2 size={16}/></button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : ( 
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {(Object.keys(kanbanColumns) as TaskStatus[]).map(status => {
            const columnTasks = kanbanColumns[status] || [];
            const isWipExceeded = status === TaskStatus.IN_PROGRESS && columnTasks.length > KANBAN_IN_PROGRESS_WIP_LIMIT;
            const columnHeaderClasses = `font-semibold text-dark-text mb-3 text-sm border-b pb-2 flex justify-between items-center ${isWipExceeded ? 'border-warning text-warning' : 'border-light-border'}`;

            return (
            <div 
              key={status} 
              className={`p-3 rounded-lg min-h-[200px] ${getKanbanColumnBg(status, columnTasks.length)} border border-border-color flex-1 transition-all duration-200`}
              onDrop={(e) => handleDrop(e, status)}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <h3 className={columnHeaderClasses}>
                <span className="flex items-center">
                    {getKanbanColumnIcon(status)}
                    <span className="ml-1.5">{status}</span>
                </span>
                <span className={`font-bold ${isWipExceeded ? 'text-warning' : 'text-dark-text'}`}>({columnTasks.length})</span>
                {isWipExceeded && (
                    <AlertTriangle size={16} className="text-warning ml-1" aria-label={`WIP Limit Exceeded (>${KANBAN_IN_PROGRESS_WIP_LIMIT})`}/>
                )}
              </h3>
              <div className="space-y-2.5 min-h-[100px] max-h-[calc(100vh-350px)] overflow-y-auto custom-scrollbar pr-1">
                {columnTasks.map(task => {
                  const taskCurrentTimer = taskTimers[task.id];
                  const displayElapsedTime = taskCurrentTimer?.intervalId != null
                                              ? taskCurrentTimer.elapsedSeconds
                                              : task.elapsedTimeSeconds || 0;
                  return (
                  <div key={task.id} draggable={task.status !== TaskStatus.COMPLETED} onDragStart={(e) => handleDragStart(e, task.id)} onDragEnd={handleDragEnd}>
                    <TaskCard
                      task={task}
                      clientName={clients.find(c => c.id === task.clientId)?.name}
                      teamMember={teamMembers.find(tm => tm.name === task.assignedTo)}
                      onEditTask={(taskToEdit: Task) => onOpenTaskForm('edit', taskToEdit)}
                      onDeleteTask={onDeleteTask}
                      onMarkComplete={handleMarkComplete}
                      onStartTimer={handleStartTimer}
                      onStopTimer={handleStopTimer}
                      isTimerActive={activeTimerTaskId === task.id && (taskTimers[task.id]?.intervalId !== null)}
                      elapsedTime={displayElapsedTime}
                      formatTime={formatTime}
                    />
                  </div>
                  );
                })}
                {columnTasks.length === 0 && (
                    <div className="text-xs text-center text-light-text pt-8">No tasks in this stage.</div>
                )}
              </div>
            </div>
          );
        })}
        </div>
      )}
    </div>
  );
};
