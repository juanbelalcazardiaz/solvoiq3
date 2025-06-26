
import React from 'react';
import { OneOnOneSession, TeamMember, TurnoverRiskLevel } from '../../types';
import { Modal } from '../Modal';
import { PlusCircle, Edit2, Trash2, CalendarDays, UserSquare, AlertTriangle, CheckCircle, Activity, ChevronRight } from 'lucide-react';

interface OneOnOneSessionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamMember: TeamMember;
  sessions: OneOnOneSession[];
  onAddNewSession: () => void;
  onEditSession: (session: OneOnOneSession) => void;
  onDeleteSession: (sessionId: string) => void;
  supervisors: TeamMember[]; // To display supervisor name
}

const getRiskLevelIcon = (riskLevel: TurnoverRiskLevel) => {
  switch (riskLevel) {
    case TurnoverRiskLevel.LOW: return <CheckCircle size={16} className="text-success" />;
    case TurnoverRiskLevel.MEDIUM: return <Activity size={16} className="text-warning" />;
    case TurnoverRiskLevel.HIGH: return <AlertTriangle size={16} className="text-danger" />;
    default: return <UserSquare size={16} className="text-light-text"/>;
  }
};

const getRiskPillClasses = (riskLevel: TurnoverRiskLevel): string => {
  switch (riskLevel) {
    case TurnoverRiskLevel.LOW: return 'bg-success-light text-success';
    case TurnoverRiskLevel.MEDIUM: return 'bg-warning-light text-warning';
    case TurnoverRiskLevel.HIGH: return 'bg-danger-light text-danger';
    default: return 'bg-light-border text-medium-text';
  }
};

export const OneOnOneSessionsModal: React.FC<OneOnOneSessionsModalProps> = ({
  isOpen, onClose, teamMember, sessions, onAddNewSession, onEditSession, onDeleteSession, supervisors
}) => {
  const sortedSessions = [...sessions].sort((a, b) => new Date(b.sessionDate).getTime() - new Date(a.sessionDate).getTime());

  const getSupervisorName = (supervisorId: string) => {
    return supervisors.find(s => s.id === supervisorId)?.name || 'Unknown Supervisor';
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`1-on-1 Sessions for ${teamMember.name}`}>
      <div className="space-y-4">
        <button
          onClick={onAddNewSession}
          className="w-full flex items-center justify-center bg-primary hover:bg-primary-dark text-white font-medium py-2.5 px-4 rounded-md text-sm transition-colors shadow-sm hover:shadow-md"
        >
          <PlusCircle size={18} className="mr-2" /> Add New Session
        </button>

        {sortedSessions.length === 0 && (
          <p className="text-center text-medium-text py-4">No 1-on-1 sessions logged for {teamMember.name} yet.</p>
        )}

        <div className="max-h-[60vh] overflow-y-auto space-y-3 custom-scrollbar pr-2">
          {sortedSessions.map(session => (
            <div key={session.id} className="bg-input-bg p-3.5 rounded-lg border border-border-color shadow-subtle hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-1.5">
                <div>
                  <p className="text-sm font-semibold text-dark-text flex items-center">
                    <CalendarDays size={15} className="mr-2 text-light-text" />
                    {new Date(session.sessionDate).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-light-text ml-7">
                    With: {getSupervisorName(session.supervisorId)}
                  </p>
                </div>
                <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${getRiskPillClasses(session.turnoverRisk)} flex items-center`}>
                  {getRiskLevelIcon(session.turnoverRisk)}
                  <span className="ml-1.5">{session.turnoverRisk} Risk</span>
                </span>
              </div>
              
              <p className="text-xs text-medium-text mt-1 truncate" title={session.generalNotes}>
                Notes: {session.generalNotes.substring(0, 100)}{session.generalNotes.length > 100 ? '...' : ''}
              </p>
              
              {session.riskAssessment && (session.turnoverRisk === TurnoverRiskLevel.MEDIUM || session.turnoverRisk === TurnoverRiskLevel.HIGH) && (
                <div className="mt-2 text-xs border-t border-light-border pt-2">
                  <p className="text-light-text"><strong className="text-medium-text">Identified Risk:</strong> {session.riskAssessment.identifiedRisk.substring(0,70)}{session.riskAssessment.identifiedRisk.length > 70 ? '...' : ''}</p>
                </div>
              )}

              <div className="mt-2.5 flex justify-end items-center space-x-2 pt-2 border-t border-light-border/50">
                <button
                  onClick={() => onEditSession(session)}
                  className="text-primary hover:text-primary-dark p-1 rounded-md text-xs flex items-center font-medium"
                  title="Edit Session"
                >
                  <Edit2 size={14} className="mr-1" /> Edit
                </button>
                <button
                  onClick={() => onDeleteSession(session.id)}
                  className="text-danger hover:text-red-600 p-1 rounded-md text-xs flex items-center font-medium"
                  title="Delete Session"
                >
                  <Trash2 size={14} className="mr-1" /> Delete
                </button>
                <button
                  onClick={() => onEditSession(session)} // For now, edit also serves as view details
                  className="text-medium-text hover:text-dark-text p-1 rounded-md text-xs flex items-center font-medium"
                  title="View Details"
                >
                  View Details <ChevronRight size={14} className="ml-0.5"/>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
};
