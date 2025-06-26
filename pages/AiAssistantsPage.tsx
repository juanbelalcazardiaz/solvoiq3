import React from 'react';
import { Bot } from 'lucide-react';
import { EmptyState } from '../components/EmptyState';

export const AiAssistantsPage: React.FC = () => {
  return (
    <div className="p-4">
      <EmptyState
        icon={Bot}
        title="AI Assistants Feature Removed"
        message="To streamline the application and focus on core operational features, the AI Assistants page has been removed. We appreciate your understanding!"
      />
    </div>
  );
};
