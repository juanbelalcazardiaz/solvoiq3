import React from 'react';
import { MailX } from 'lucide-react';
import { EmptyState } from '../components/EmptyState';

export const EmailToolsPage: React.FC = () => {
  return (
    <div className="p-4">
      <EmptyState
        icon={MailX}
        title="Email Tools Feature Removed"
        message="To streamline the application and focus on core operational features, the AI Email Tools have been removed. We appreciate your understanding!"
      />
    </div>
  );
};
