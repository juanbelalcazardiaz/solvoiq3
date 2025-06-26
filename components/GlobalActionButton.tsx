
import React from 'react';
import { Plus } from 'lucide-react';
import { PageId } from '../types';

interface GlobalActionButtonProps {
  currentPage: PageId;
  onOpenClientForm: () => void;
  onOpenTaskForm: () => void;
  onOpenKpiForm: () => void;
  onOpenTeamMemberForm: () => void;
  onOpenTemplateForm: () => void;
}

export const GlobalActionButton: React.FC<GlobalActionButtonProps> = ({ 
    currentPage, 
    onOpenClientForm,
    onOpenTaskForm,
    onOpenKpiForm,
    onOpenTeamMemberForm,
    onOpenTemplateForm
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const getActionForPage = () => {
    switch(currentPage) {
      case 'clients': return { label: 'New Client', action: onOpenClientForm };
      case 'tasks': return { label: 'New Task', action: onOpenTaskForm };
      case 'kpi-library': return { label: 'New KPI', action: onOpenKpiForm };
      case 'team': return { label: 'New Team Member', action: onOpenTeamMemberForm };
      case 'templates': return { label: 'New Template', action: onOpenTemplateForm };
      default: return { label: 'New Task', action: onOpenTaskForm }; // Default action
    }
  };

  const primaryAction = getActionForPage();
  
  // Basic structure, can be expanded with more options if isOpen is true
  return (
    <div className="relative">
        <button
            onClick={primaryAction.action}
            title={primaryAction.label}
            className="bg-primary hover:bg-primary-dark text-white rounded-full p-4 shadow-lg transition-all duration-300 ease-in-out focus:outline-none focus-visible:shadow-hero-glow-light hover:scale-105 hover:shadow-hero-glow-light animate-fabPulse"
            aria-label={primaryAction.label}
        >
            <Plus size={24} />
        </button>
    </div>
  );
};
