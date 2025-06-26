import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  const titleId = `modal-title-${Math.random().toString(36).substring(2, 9)}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 backdrop-blur-md transition-opacity duration-300 ease-in-out"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <div className="bg-input-bg rounded-lg shadow-modal m-4 max-w-2xl w-full max-h-[90vh] flex flex-col transform transition-all duration-300 ease-in-out scale-95 opacity-0 animate-modalShow border border-border-color">
        <div className="flex items-center justify-between p-5 border-b border-border-color">
          <h3 id={titleId} className="text-lg font-semibold text-dark-text">{title}</h3>
          <button
            onClick={onClose}
            className="text-medium-text hover:text-primary transition-colors rounded-full p-1 -mr-1"
            aria-label="Close modal"
          >
            <X size={24} />
          </button>
        </div>
        <div className="p-6 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};