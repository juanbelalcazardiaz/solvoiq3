
import React from 'react';
import { Client, Task, TeamMember, ClientStatus, TaskStatus, SOPDetails, KpiReportingDetails } from '../types';
import { Users, ExternalLink, Edit2, Trash2, CheckSquare, CalendarCheck2, BookOpen, AlertCircle, CheckCircle } from 'lucide-react';

interface ClientCardProps {
  client: Client;
  tasks: Task[];
  teamMembers: TeamMember[];
  onSelectClient: (client: Client) => void;
  onEditClient: (client: Client) => void;
  onDeleteClient: (clientId: string) => void;
  parsedPoc?: string; // Kept for potential temporary display if notes parsing is complex
}

const getStatusColorClasses = (status: ClientStatus) => {
  switch (status) {
    case ClientStatus.HEALTHY: return 'bg-success-light text-success';
    case ClientStatus.AT_RISK: return 'bg-warning-light text-warning';
    case ClientStatus.CRITICAL: return 'bg-danger-light text-danger';
    default: return 'bg-light-border text-medium-text';
  }
};

const getStatusDotIndicatorClass = (status: ClientStatus) => {
  switch (status) {
    case ClientStatus.HEALTHY: return 'bg-success';
    case ClientStatus.AT_RISK: return 'bg-warning';
    case ClientStatus.CRITICAL: return 'bg-danger';
    default: return 'bg-light-text';
  }
};

export const ClientCard: React.FC<ClientCardProps> = ({ 
    client, tasks, teamMembers, onSelectClient, onEditClient, onDeleteClient, parsedPoc
}) => {
  const openTasksCount = tasks.filter(task => task.clientId === client.id && task.status !== TaskStatus.COMPLETED).length;
  const assignedMembers = teamMembers.filter(tm => client.assignedTeamMembers.includes(tm.id));

  const displaySopExists = client.sop?.exists;
  const displayKpiReportingFrequency = client.kpiReporting?.frequency;


  return (
    <div className="bg-input-bg shadow-card rounded-lg overflow-hidden transition-all duration-300 ease-in-out hover:shadow-card-hover hover:scale-[1.02] flex flex-col justify-between border border-border-color">
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full mr-2.5 flex-shrink-0 ${getStatusDotIndicatorClass(client.status)}`}></div>
            <h3 className="text-lg font-semibold text-primary hover:text-primary-dark cursor-pointer truncate" title={client.name} onClick={() => onSelectClient(client)}>
              {client.name}
            </h3>
          </div>
          <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${getStatusColorClasses(client.status)}`}>
            {client.status}
          </span>
        </div>
        
        {parsedPoc && ( // This can be removed if notes parsing is fully robust or not needed on card
            <p className="text-xs text-light-text mb-1 ml-[22px] truncate" title={`POC: ${parsedPoc}`}>POC: {client.contactInfo.email || 'N/A'}</p>
        )}
        
        <p className="text-sm text-medium-text mb-3 h-10 overflow-hidden ml-[22px]" title={client.notes.substring(0, 200)}>
          {client.notes.substring(0, 75)}{client.notes.length > 75 && '...'}
        </p>

        <div className="mb-3">
          {client.tags.slice(0, 3).map(tag => (
            <span key={tag} className="inline-block bg-sidebar-bg text-medium-text text-xs px-2 py-1 rounded-full mr-1 mb-1 border border-light-border">
              {tag}
            </span>
          ))}
          {client.tags.length > 3 && <span className="text-xs text-light-text">+{client.tags.length - 3} more</span>}
        </div>

        <div className="space-y-1.5 text-sm">
            <div className="flex items-center text-medium-text">
                <Users size={15} className="mr-2 text-primary" />
                <span>{openTasksCount} Open Task{openTasksCount !== 1 ? 's' : ''}</span>
            </div>
            {typeof displaySopExists === 'boolean' && (
              <div className="flex items-center text-medium-text">
                {displaySopExists ? <CheckSquare size={15} className="mr-2 text-success" /> : <BookOpen size={15} className="mr-2 text-warning" />}
                <span>SOP: {displaySopExists ? 'Exists' : 'Missing'}</span>
                {displaySopExists && client.sop?.format && client.sop.format !== 'Not Set' && <span className="text-xs text-light-text ml-1">({client.sop.format})</span>}
              </div>
            )}
            {displayKpiReportingFrequency && displayKpiReportingFrequency !== 'Not Set' && (
                 <div className="flex items-center text-medium-text">
                    <CalendarCheck2 size={15} className="mr-2 text-blue-400" />
                    <span>KPIs: {displayKpiReportingFrequency}</span>
                </div>
            )}
        </div>
        
        <div className="flex items-center space-x-2 mt-4">
          <span className="text-sm text-medium-text">Team:</span>
          <div className="flex -space-x-2">
            {assignedMembers.slice(0,3).map(member => (
              <div 
                key={member.id} 
                title={member.name}
                className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center text-xs border-2 border-input-bg"
              >
                {member.avatarInitials || member.name.substring(0,1)}
              </div>
            ))}
            {assignedMembers.length > 3 && (
              <div className="w-7 h-7 rounded-full bg-sidebar-bg text-dark-text flex items-center justify-center text-xs border-2 border-input-bg">
                +{assignedMembers.length - 3}
              </div>
            )}
            {assignedMembers.length === 0 && <span className="text-xs text-light-text italic">None</span>}
          </div>
        </div>
      </div>
      <div className="bg-sidebar-bg p-3 flex justify-end space-x-1 border-t border-border-color">
        <button 
          onClick={() => onSelectClient(client)}
          className="p-1.5 text-medium-text hover:text-primary transition-colors rounded-md"
          title="View Details"
          aria-label={`View details for ${client.name}`}
        >
          <ExternalLink size={18} />
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); onEditClient(client); }}
          className="p-1.5 text-medium-text hover:text-blue-400 transition-colors rounded-md"
          title="Edit Client"
          aria-label={`Edit ${client.name}`}
        >
          <Edit2 size={18} />
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); onDeleteClient(client.id); }}
          className="p-1.5 text-medium-text hover:text-danger transition-colors rounded-md"
          title="Delete Client"
          aria-label={`Delete ${client.name}`}
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
};