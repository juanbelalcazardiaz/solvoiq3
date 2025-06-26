

import React, { useMemo, useState } from 'react';
import { Task, TeamMember, TaskStatus, TaskPriority, Client } from '../types';
import { Coffee, Utensils, Brain, Clock, Sparkles, AlertTriangle } from 'lucide-react';
import { TaskDetailModal } from './modals/TaskDetailModal';

interface DailyRoutinePlannerProps {
  tasks: Task[];
  currentUser: TeamMember;
  clients: Client[]; // Added clients to look up client names
}

interface TimeSlot {
  id: string;
  start: string;
  end: string;
  label: string;
  type: 'work' | 'break' | 'lunch';
  icon?: React.ElementType;
  breakName?: string;
}

const timeSlots: TimeSlot[] = [
  { id: 'ts_0800_0900', start: '08:00', end: '09:00', label: '08:00 - 09:00', type: 'work' },
  { id: 'ts_0900_1000', start: '09:00', end: '10:00', label: '09:00 - 10:00', type: 'work' },
  { id: 'ts_1000_1015', start: '10:00', end: '10:15', label: '10:00 - 10:15', type: 'break', icon: Coffee, breakName: 'Active Pause' },
  { id: 'ts_1015_1100', start: '10:15', end: '11:00', label: '10:15 - 11:00', type: 'work' },
  { id: 'ts_1100_1200', start: '11:00', end: '12:00', label: '11:00 - 12:00', type: 'work' },
  { id: 'ts_1200_1300', start: '12:00', end: '13:00', label: '12:00 - 01:00 PM', type: 'lunch', icon: Utensils, breakName: 'Lunch Break' },
  { id: 'ts_1300_1400', start: '13:00', end: '14:00', label: '01:00 - 02:00 PM', type: 'work' },
  { id: 'ts_1400_1500', start: '14:00', end: '15:00', label: '02:00 - 03:00 PM', type: 'work' },
  { id: 'ts_1500_1515', start: '15:00', end: '15:15', label: '03:00 - 03:15 PM', type: 'break', icon: Sparkles, breakName: 'Active Pause' },
  { id: 'ts_1515_1600', start: '15:15', end: '16:00', label: '03:15 - 04:00 PM', type: 'work' },
  { id: 'ts_1600_1700', start: '16:00', end: '17:00', label: '04:00 - 05:00 PM', type: 'work' },
];

const getTaskPrioritySortValue = (priority: TaskPriority): number => {
  switch (priority) {
    case TaskPriority.HIGH: return 1;
    case TaskPriority.MEDIUM: return 2;
    case TaskPriority.LOW: return 3;
    default: return 4;
  }
};

const getMondayOfCurrentWeek = (date: Date = new Date()): Date => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
};

const getCurrentWeekdayIndex = () => {
  const today = new Date().getDay(); // Sunday is 0, Monday is 1, ..., Saturday is 6
  if (today === 0 || today === 6) return 0; // Default to Monday if weekend
  return today - 1; // Adjust to 0-4 range (Mon-Fri)
};

const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export const DailyRoutinePlanner: React.FC<DailyRoutinePlannerProps> = ({ tasks, currentUser, clients }) => {
  const [selectedDay, setSelectedDay] = useState<number>(getCurrentWeekdayIndex());
  const [selectedTaskDetail, setSelectedTaskDetail] = useState<Task | null>(null);

  const currentDisplayDate = useMemo(() => {
    const mondayOfThisWeek = getMondayOfCurrentWeek();
    const date = new Date(mondayOfThisWeek);
    date.setDate(mondayOfThisWeek.getDate() + selectedDay);
    date.setHours(0, 0, 0, 0);
    return date;
  }, [selectedDay]);

  const tasksForSelectedDayView = useMemo(() => {
    const allUserOpenTasks = tasks.filter(
      task => task.assignedTo === currentUser.name && task.status !== TaskStatus.COMPLETED
    );
    
    const overdueTasks: Task[] = [];
    const dueOnDisplayDateTasks: Task[] = [];
    const upcomingPrioritizedTasks: Task[] = [];
    const otherTasks: Task[] = [];

    const sevenDaysFromDisplayDate = new Date(currentDisplayDate);
    sevenDaysFromDisplayDate.setDate(currentDisplayDate.getDate() + 7);

    allUserOpenTasks.forEach(task => {
      const taskDueDate = new Date(task.dueDate);
      taskDueDate.setHours(0, 0, 0, 0); 

      if (taskDueDate.getTime() < currentDisplayDate.getTime()) {
        overdueTasks.push(task);
      } else if (taskDueDate.getTime() === currentDisplayDate.getTime()) {
        dueOnDisplayDateTasks.push(task);
      } else if (
        (task.priority === TaskPriority.HIGH || task.priority === TaskPriority.MEDIUM) &&
        taskDueDate > currentDisplayDate && taskDueDate <= sevenDaysFromDisplayDate
      ) {
        upcomingPrioritizedTasks.push(task);
      }
      else { 
        otherTasks.push(task);
      }
    });
    
    overdueTasks.sort((a, b) => {
        const dueDateDiff = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        if (dueDateDiff !== 0) return dueDateDiff;
        return getTaskPrioritySortValue(a.priority) - getTaskPrioritySortValue(b.priority);
    });

    const sortByPriorityAndDueDate = (a: Task, b: Task) => {
        const priorityDiff = getTaskPrioritySortValue(a.priority) - getTaskPrioritySortValue(b.priority);
        if (priorityDiff !== 0) return priorityDiff;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    };

    dueOnDisplayDateTasks.sort(sortByPriorityAndDueDate);
    upcomingPrioritizedTasks.sort(sortByPriorityAndDueDate);
    otherTasks.sort(sortByPriorityAndDueDate);

    return [...overdueTasks, ...dueOnDisplayDateTasks, ...upcomingPrioritizedTasks, ...otherTasks];

  }, [tasks, currentUser.name, selectedDay, currentDisplayDate]);

  let taskPointer = 0;

  const handleTaskClick = (task: Task) => {
    setSelectedTaskDetail(task);
  };

  return (
    <div className="bg-sidebar-bg p-4 rounded-lg border border-border-color shadow-inner">
      <div className="mb-4 flex space-x-1 border-b border-border-color pb-2">
        {weekdays.map((day, index) => (
          <button
            key={day}
            onClick={() => setSelectedDay(index)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap
              ${selectedDay === index
                ? 'bg-primary text-white shadow-sm'
                : 'text-medium-text hover:text-dark-text hover:bg-input-bg'
              }
            `}
            aria-pressed={selectedDay === index}
          >
            {day}
          </button>
        ))}
      </div>
      <ul className="space-y-1">
        {timeSlots.map((slot, index) => {
          let slotContent;
          let slotBgClass = 'bg-input-bg';
          let SlotIconComponent = slot.icon;

          if (slot.type === 'break' || slot.type === 'lunch') {
            slotBgClass = slot.type === 'lunch' ? 'bg-green-500/10' : 'bg-blue-500/10';
            slotContent = (
              <div className="flex items-center">
                {SlotIconComponent && <SlotIconComponent size={18} className={`mr-2 ${slot.type === 'lunch' ? 'text-green-400' : 'text-blue-400'}`} />}
                <span className={`font-medium ${slot.type === 'lunch' ? 'text-green-400' : 'text-blue-400'}`}>{slot.breakName}</span>
              </div>
            );
          } else { 
            const tasksForSlot: Task[] = [];
            if (taskPointer < tasksForSelectedDayView.length) {
              tasksForSlot.push(tasksForSelectedDayView[taskPointer++]);
            }
            if (taskPointer < tasksForSelectedDayView.length && (slot.id === 'ts_0800_0900' || slot.id === 'ts_1300_1400' || slot.id === 'ts_1515_1600')) {
              tasksForSlot.push(tasksForSelectedDayView[taskPointer++]);
            }

            if (tasksForSlot.length > 0) {
              slotContent = (
                <ul className="space-y-1.5">
                  {tasksForSlot.map(task => {
                    const taskDueDate = new Date(task.dueDate);
                    taskDueDate.setHours(0, 0, 0, 0);
                    const isOverdueForDisplay = taskDueDate < currentDisplayDate && task.status !== TaskStatus.COMPLETED;

                    let titleColorClass = 'text-dark-text';
                    let iconForTask = null;

                    if (isOverdueForDisplay) {
                      titleColorClass = 'text-danger';
                      iconForTask = <AlertTriangle size={12} className="text-danger" />;
                    } else {
                      switch (task.priority) {
                        case TaskPriority.HIGH:
                          titleColorClass = 'text-warning';
                          break;
                        case TaskPriority.MEDIUM:
                          titleColorClass = 'text-primary';
                          break;
                        case TaskPriority.LOW:
                          titleColorClass = 'text-medium-text';
                          break;
                      }
                    }

                    return (
                      <li key={task.id} className="text-xs group cursor-pointer" onClick={() => handleTaskClick(task)}>
                        <div className="flex items-center">
                          {iconForTask && <span className="mr-1.5 flex-shrink-0">{iconForTask}</span>}
                          <span className={`font-medium group-hover:underline ${titleColorClass}`}>{task.title}</span>
                        </div>
                        <span className={`block text-light-text text-[11px] ${iconForTask ? 'pl-[18px]' : ''}`}>
                          Due: {new Date(task.dueDate).toLocaleDateString()} - P: {task.priority}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              );
            } else {
               slotContent = (
                <div className="flex items-center">
                    <Brain size={16} className="mr-2 text-gray-500"/>
                    <span className="text-xs text-gray-500 italic">
                        {index < 4 ? "Focus Work / Planning" : "Focus Work / Review"}
                    </span>
                </div>
               );
            }
          }

          return (
            <li key={slot.id} className={`flex items-start p-3 rounded-md border border-transparent hover:border-border-color transition-colors ${slotBgClass}`}>
              <div className="w-28 flex-shrink-0 text-xs font-semibold text-primary pr-3 border-r border-border-color mr-3">
                {slot.label}
              </div>
              <div className="flex-grow min-w-0">
                {slotContent}
              </div>
            </li>
          );
        })}
      </ul>
      {selectedTaskDetail && (
        <TaskDetailModal
          isOpen={!!selectedTaskDetail}
          onClose={() => setSelectedTaskDetail(null)}
          task={selectedTaskDetail}
          clients={clients}
        />
      )}
    </div>
  );
};
