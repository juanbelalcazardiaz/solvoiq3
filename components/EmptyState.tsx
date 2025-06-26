import React from 'react';
import { PlusCircle } from 'lucide-react';

interface EmptyStateProps {
  icon: React.ElementType;
  title: string;
  message: string;
  actionButtonText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon: Icon, title, message, actionButtonText, onAction }) => {
  return (
    <div className="text-center py-20 px-6 bg-gradient-to-br from-input-bg via-sidebar-bg to-input-bg rounded-xl border border-border-color shadow-md mt-4">
      <div className="animate-emptyStateIconFloat">
        <Icon size={72} className="mx-auto text-primary opacity-70 mb-8" strokeWidth={1}/>
      </div>
      <h3 className="text-2xl font-semibold text-dark-text mb-4">{title}</h3>
      <p className="text-medium-text mb-10 max-w-md mx-auto leading-relaxed">{message}</p>
      {actionButtonText && onAction && (
        <button
          onClick={onAction}
          className="flex items-center justify-center mx-auto bg-primary hover:bg-primary-dark text-white font-medium py-3 px-8 rounded-lg text-base transition-all duration-300 shadow-lg hover:shadow-primary/40 transform hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-input-bg focus-visible:ring-primary"
        >
          <PlusCircle size={22} className="mr-2.5"/> {actionButtonText}
        </button>
      )}
    </div>
  );
};