
import React from 'react';
import { Task, Client, TeamMember, TaskStatus } from '../types';
import { Edit2, Trash2, UserCircle2, Briefcase, Clock, AlertTriangle, CheckCircle, PlayCircle, PauseCircle } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  clientName?: string;
  teamMember?: TeamMember;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onMarkComplete: (taskId: string) => void; // New prop
  onStartTimer: (taskId: string) => void; // New prop
  onStopTimer: (taskId: string) => void; // New prop
  isTimerActive: boolean; // New prop
  elapsedTime: number; // New prop in seconds
  formatTime: (totalSeconds: number) => string; // New prop
}

const getStatusColorClasses = (status: TaskStatus, isActuallyOverdue: boolean): string => {
  if (isActuallyOverdue && status !== TaskStatus.COMPLETED) return 'border-l-danger'; 

  switch (status) {
    case TaskStatus.PENDING: return 'border-l-warning'; 
    case TaskStatus.IN_PROGRESS: return 'border-l-primary';
    case TaskStatus.COMPLETED: return 'border-l-success';
    default: return 'border-l-light-text';
  }
};

const getDueDateInfo = (dueDateStr: string, status: TaskStatus): { textClass: string, icon?: React.ReactNode, isUrgent: boolean, isDueToday: boolean } => {
  const dueDate = new Date(dueDateStr);
  const today = new Date();
  today.setHours(0,0,0,0);
  dueDate.setHours(0,0,0,0);

  const diffTime = dueDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (status === TaskStatus.COMPLETED) return { textClass: 'text-medium-text', isUrgent: false, isDueToday: false };

  if (diffDays < 0) return { textClass: 'text-danger font-semibold', icon: <AlertTriangle size={14} className="mr-1 inline-block" />, isUrgent: true, isDueToday: false };
  if (diffDays === 0) return { textClass: 'text-danger font-semibold', icon: <Clock size={14} className="mr-1 inline-block text-danger" />, isUrgent: true, isDueToday: true };
  if (diffDays <= 3) return { textClass: 'text-warning', icon: <Clock size={14} className="mr-1 inline-block text-warning" />, isUrgent: true, isDueToday: false };
  
  return { textClass: 'text-medium-text', isUrgent: false, isDueToday: false };
};


export const TaskCard: React.FC<TaskCardProps> = ({ 
  task, clientName, teamMember, onEditTask, onDeleteTask,
  onMarkComplete, onStartTimer, onStopTimer, isTimerActive, elapsedTime, formatTime
}) => {
  const dueDate = new Date(task.dueDate);
  const isActuallyOverdue = task.status !== TaskStatus.COMPLETED && dueDate < new Date(); // Removed checking status !== TaskStatus.OVERDUE
  const displayOverdueIndicator = task.status === TaskStatus.OVERDUE || isActuallyOverdue;
  
  const dueDateInfo = getDueDateInfo(task.dueDate, task.status);
  const isTaskCompleted = task.status === TaskStatus.COMPLETED;

  return (
    <div className={`bg-input-bg shadow-sm rounded-md p-3 mb-3 border-l-4 ${getStatusColorClasses(task.status, displayOverdueIndicator)} hover:shadow-card-hover transition-shadow duration-200 ease-in-out cursor-grab active:cursor-grabbing border border-border-color`}>
      <div className="flex justify-between items-start mb-1.5">
        <h4 className="font-semibold text-dark-text text-sm flex-grow min-w-0 mr-1">
          <span className="truncate block" title={task.title}>{task.title}</span>
        </h4>
        <div className="flex space-x-0.5 flex-shrink-0">
           <button 
            onClick={(e) => { e.stopPropagation(); onEditTask(task); }}
            className="p-1 text-medium-text hover:text-blue-400 transition-colors rounded-md"
            title="Edit Task"
            aria-label="Edit Task"
          >
            <Edit2 size={15} />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onDeleteTask(task.id); }}
            className="p-1 text-medium-text hover:text-danger transition-colors rounded-md"
            title="Delete Task"
            aria-label="Delete Task"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>
      <p className="text-xs text-medium-text mb-2 h-9 overflow-hidden" title={task.description}>{task.description}</p>
      
      <div className={`text-xs mb-1.5 flex items-center ${dueDateInfo.textClass}`}>
        {dueDateInfo.icon}
        Due: {dueDate.toLocaleDateString()}
        {displayOverdueIndicator && !dueDateInfo.isDueToday && <span className="ml-1.5 px-1 py-0.5 text-[10px] bg-danger-light text-danger rounded-full">Overdue</span>}
        {dueDateInfo.isDueToday && <span className="ml-1.5 px-1 py-0.5 text-[10px] bg-danger-light text-danger rounded-full">Due Today!</span>}
      </div>

      {clientName && (
        <div className="text-xs text-medium-text mb-1 flex items-center">
          <Briefcase size={11} className="mr-1.5 text-light-text" /> {clientName}
        </div>
      )}
      
      <div className="text-xs text-medium-text mb-2 flex items-center">
        <UserCircle2 size={11} className="mr-1.5 text-light-text" />
        {teamMember?.name || 'Unassigned'}
      </div>

      {/* Timer and Completion Controls */}
      <div className="mt-2 pt-2 border-t border-border-color/60 flex items-center justify-between">
        <div className="flex items-center space-x-1.5">
          {!isTaskCompleted && (
            <>
              {isTimerActive ? (
                <button 
                  onClick={(e) => { e.stopPropagation(); onStopTimer(task.id); }}
                  className="p-1 text-warning hover:text-orange-400 transition-colors rounded-md"
                  title="Stop Timer"
                  aria-label="Stop Timer"
                >
                  <PauseCircle size={18} />
                </button>
              ) : (
                <button 
                  onClick={(e) => { e.stopPropagation(); onStartTimer(task.id); }}
                  className="p-1 text-primary hover:text-primary-dark transition-colors rounded-md"
                  title="Start Timer"
                  aria-label="Start Timer"
                >
                  <PlayCircle size={18} />
                </button>
              )}
            </>
          )}
          <span className={`text-xs font-mono ${isTimerActive ? 'text-warning' : 'text-medium-text'}`}>
            {formatTime(elapsedTime)}
          </span>
        </div>
        
        <button
          onClick={(e) => { e.stopPropagation(); onMarkComplete(task.id); }}
          disabled={isTaskCompleted}
          className={`p-1 text-medium-text transition-colors rounded-md ${isTaskCompleted ? 'text-success cursor-not-allowed' : 'hover:text-success'}`}
          title={isTaskCompleted ? "Task Completed" : "Mark as Complete"}
          aria-label={isTaskCompleted ? "Task Completed" : "Mark as Complete"}
        >
          <CheckCircle size={18} className={isTaskCompleted ? 'text-success': ''}/>
        </button>
      </div>
    </div>
  );
};