
import React from 'react';
import { Task, Client, TaskStatus, TaskPriority } from '../../types';
import { Modal } from '../Modal';
import { CheckCircle, AlertTriangle, ListChecks, Clock, User, Briefcase, MessageSquare, Tag, Calendar } from 'lucide-react';

interface TaskDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  clients: Client[];
}

const getStatusPill = (status: TaskStatus) => {
  switch (status) {
    case TaskStatus.PENDING:
      return <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-warning-light text-warning flex items-center"><AlertTriangle size={13} className="mr-1" />Pending</span>;
    case TaskStatus.IN_PROGRESS:
      return <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-primary-light text-primary flex items-center"><ListChecks size={13} className="mr-1" />In Progress</span>;
    case TaskStatus.OVERDUE:
      return <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-danger-light text-danger flex items-center"><AlertTriangle size={13} className="mr-1" />Overdue</span>;
    case TaskStatus.COMPLETED:
      return <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-success-light text-success flex items-center"><CheckCircle size={13} className="mr-1" />Completed</span>;
    default:
      return <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-light-border text-medium-text">{status}</span>;
  }
};

const getPriorityPill = (priority: TaskPriority) => {
  switch (priority) {
    case TaskPriority.HIGH:
      return <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-danger-light text-danger">High</span>;
    case TaskPriority.MEDIUM:
      return <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-warning-light text-warning">Medium</span>;
    case TaskPriority.LOW:
      return <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-success-light text-success">Low</span>;
    default:
      return <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-light-border text-medium-text">{priority}</span>;
  }
};

const formatTime = (totalSeconds?: number): string => {
  if (totalSeconds === undefined || totalSeconds === null || totalSeconds < 0) return '00:00:00';
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ isOpen, onClose, task, clients }) => {
  if (!isOpen || !task) return null;

  const clientName = task.clientId ? clients.find(c => c.id === task.clientId)?.name : 'N/A';
  const loggedTime = formatTime(task.elapsedTimeSeconds);

  const DetailItem: React.FC<{ icon: React.ElementType, label: string, value: React.ReactNode }> = ({ icon: Icon, label, value }) => (
    <div className="flex items-start py-2 border-b border-border-color/30 last:border-b-0">
      <Icon size={16} className="mr-3 mt-0.5 text-primary flex-shrink-0" />
      <div className="flex-grow">
        <p className="text-xs text-medium-text">{label}</p>
        <div className="text-sm text-dark-text font-medium">{value}</div>
      </div>
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={task.title}>
      <div className="space-y-4">
        <DetailItem icon={Tag} label="Status" value={getStatusPill(task.status)} />
        <DetailItem icon={AlertTriangle} label="Priority" value={getPriorityPill(task.priority)} />
        <DetailItem icon={Calendar} label="Due Date" value={new Date(task.dueDate).toLocaleDateString()} />
        <DetailItem icon={User} label="Assigned To" value={task.assignedTo} />
        {task.clientId && <DetailItem icon={Briefcase} label="Client" value={clientName} />}
        <DetailItem icon={Clock} label="Logged Time" value={<span className="font-mono">{loggedTime}</span>} />
        
        <div className="pt-2">
          <h4 className="text-xs text-medium-text mb-1 flex items-center">
            <MessageSquare size={16} className="mr-2 text-primary" /> Description
          </h4>
          <div className="p-3 bg-sidebar-bg rounded-md border border-border-color/50 max-h-40 overflow-y-auto custom-scrollbar">
            <p className="text-sm text-dark-text whitespace-pre-wrap">
              {task.description || <span className="italic text-light-text">No description provided.</span>}
            </p>
          </div>
        </div>

        <div className="flex justify-end pt-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-primary hover:bg-primary-dark text-white text-sm font-medium rounded-md transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};
