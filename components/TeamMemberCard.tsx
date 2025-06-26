


import React from 'react';
import { TeamMember, Client, Task, ClientStatus, TaskStatus, OneOnOneSession, TurnoverRiskLevel, HomeOfficeStatus, Kpi } from '../types';
import { Mail, Phone, AlertTriangle, Briefcase, ListChecks, Edit2, Trash2, CheckCircle2, XCircle, Users, ClipboardList, CheckSquare, Home, ShieldAlert, BadgeInfo, Star, Zap, ClockIcon, UserCheck, UserX, CheckCircle, Activity, Target } from 'lucide-react';

const avatarColors = [
  'bg-sky-600', 'bg-emerald-600', 'bg-amber-600', 'bg-violet-600', 
  'bg-rose-600', 'bg-teal-600', 'bg-cyan-600', 'bg-lime-600',
  'bg-fuchsia-600', 'bg-orange-600', 'bg-pink-600', 'bg-blue-600'
]; 

interface TeamMemberCardProps {
  member: TeamMember;
  clients: Client[];
  tasks: Task[];
  kpis: Kpi[];
  oneOnOneSessions: OneOnOneSession[];
  onEditTeamMember: (member: TeamMember) => void;
  onDeleteTeamMember: (memberId: string) => void;
  onOpenOneOnOneSessionsModal: (member: TeamMember) => void;
  activeUserId?: string; // Added to prevent deleting self
}

function getDynamicAvatarStyles(id: string): {bgColor: string} {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash; 
  }
  const index = Math.abs(hash) % avatarColors.length;
  return { bgColor: avatarColors[index] };
}

const getTurnoverRiskPill = (riskLevel?: TurnoverRiskLevel) => {
  if (!riskLevel) return <span className={`px-1.5 py-0.5 text-[10px] font-semibold rounded-full bg-light-border text-medium-text flex items-center`} title="Turnover Risk: Unknown"><BadgeInfo size={13} className="mr-1"/>Unknown Risk</span>;
  
  let pillClass = 'bg-light-border text-medium-text';
  let icon = <BadgeInfo size={13} className="mr-1" />;
  let displayTextToShow: string;

  switch (riskLevel) {
    case TurnoverRiskLevel.LOW:
      pillClass = 'bg-success-light text-success';
      icon = <CheckCircle size={13} className="mr-1 text-success"/>;
      displayTextToShow = 'Low Risk';
      break;
    case TurnoverRiskLevel.MEDIUM:
      pillClass = 'bg-warning-light text-warning';
      icon = <Activity size={13} className="mr-1 text-warning"/>;
      displayTextToShow = 'Med Risk';
      break;
    case TurnoverRiskLevel.HIGH:
      pillClass = 'bg-danger-light text-danger';
      icon = <AlertTriangle size={13} className="mr-1 text-danger"/>;
      displayTextToShow = 'High Risk';
      break;
    default:
      displayTextToShow = riskLevel; // Fallback to enum value if somehow not covered (should be exhaustive)
      break;
  }
  return <span className={`px-1.5 py-0.5 text-[10px] font-semibold rounded-full ${pillClass} flex items-center`} title={`Turnover Risk: ${riskLevel}`}>{icon}{displayTextToShow}</span>;
};


const getHomeOfficeStatusPill = (status?: HomeOfficeStatus, notes?: string) => {
    if (!status) return <span className={`px-1.5 py-0.5 text-[10px] font-semibold rounded-full bg-light-border text-medium-text flex items-center`} title="Home Office: Unknown"><BadgeInfo size={13} className="mr-1"/>HO: Unknown</span>;
    
    let pillClass = 'bg-light-border text-medium-text';
    let icon = <Home size={13} className="mr-1"/>;
    let displayTextToShow: string;
    let titleText = `Home Office: ${status}`;

    switch(status) {
        case HomeOfficeStatus.APPROVED:
            pillClass = 'bg-success-light text-success';
            displayTextToShow = 'HO: Approved';
            icon = <CheckSquare size={13} className="mr-1 text-success"/>;
            break;
        case HomeOfficeStatus.ELIGIBLE:
            pillClass = 'bg-blue-500/20 text-blue-400';
            displayTextToShow = 'HO: Eligible';
            icon = <Home size={13} className="mr-1 text-blue-400"/>;
            break;
        case HomeOfficeStatus.PENDING_CLIENT_APPROVAL:
            pillClass = 'bg-warning-light text-warning';
            displayTextToShow = 'HO: Pending';
            icon = <ShieldAlert size={13} className="mr-1 text-warning"/>;
            break;
        case HomeOfficeStatus.ON_SITE_ONLY:
            pillClass = 'bg-light-border text-medium-text';
            displayTextToShow = 'HO: On-Site';
            break;
        default:
            displayTextToShow = status; // Fallback
            break;
    }
    if (notes) titleText += ` | Notes: ${notes}`;
    return <span className={`px-1.5 py-0.5 text-[10px] font-semibold rounded-full ${pillClass} flex items-center`} title={titleText}>{icon}{displayTextToShow}</span>;
}


export const TeamMemberCard: React.FC<TeamMemberCardProps> = ({ member, clients, tasks, kpis, oneOnOneSessions, onEditTeamMember, onDeleteTeamMember, onOpenOneOnOneSessionsModal, activeUserId }) => {
  const assignedClients = clients.filter(client => client.assignedTeamMembers.includes(member.id));
  
  const memberTasks = tasks.filter(task => task.assignedTo === member.name);
  const pendingTasks = memberTasks.filter(task => task.status === TaskStatus.PENDING && new Date(task.dueDate) >= new Date()).length;
  const inProgressTasks = memberTasks.filter(task => task.status === TaskStatus.IN_PROGRESS && new Date(task.dueDate) >= new Date()).length;
  const overdueTasks = memberTasks.filter(task => {
    const isPastDue = new Date(task.dueDate) < new Date();
    return task.status === TaskStatus.OVERDUE || (isPastDue && (task.status === TaskStatus.PENDING || task.status === TaskStatus.IN_PROGRESS));
  }).length;

  const healthyClientsCount = assignedClients.filter(c => c.status === ClientStatus.HEALTHY).length;
  const atRiskClientsCount = assignedClients.filter(c => c.status === ClientStatus.AT_RISK).length;
  const criticalClientsCount = assignedClients.filter(c => c.status === ClientStatus.CRITICAL).length;
  
  const assignedKpisCount = member.assignedKpis?.length || 0;
  const showKpiWarning = assignedKpisCount > 0 && assignedKpisCount < 2;

  const { bgColor: avatarBgColor } = getDynamicAvatarStyles(member.id);

  const latestSession = oneOnOneSessions
    .filter(s => s.teamMemberId === member.id)
    .sort((a,b) => new Date(b.sessionDate).getTime() - new Date(a.sessionDate).getTime())[0];
  const latestTurnoverRisk = latestSession?.turnoverRisk;
  
  const memberEmail = member.email; // Use mandatory email from TeamMember
  const memberPhone = `(555) ${member.id.substring(member.id.length - 3) || Math.floor(100 + Math.random() * 900)}-${member.id.substring(member.id.length - 7, member.id.length -3) || Math.floor(1000 + Math.random() * 9000)}`;


  return (
    <div className="bg-input-bg shadow-card rounded-lg flex flex-col justify-between transition-all duration-300 ease-in-out hover:shadow-card-hover hover:scale-[1.02] border border-border-color">
      <div className="p-4 space-y-3">
        {/* Header Section */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-16 h-16 rounded-full ${avatarBgColor} text-white flex items-center justify-center text-2xl font-semibold shadow-sm border-2 border-input-bg shrink-0`}>
              {member.avatarInitials || member.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-dark-text leading-tight">{member.name}</h3>
              <p className="text-sm font-medium text-primary leading-tight">{member.role}</p>
              {member.department && <p className="text-xs text-light-text leading-tight">{member.department}</p>}
            </div>
          </div>
          <div className="flex flex-col items-end space-y-1 flex-shrink-0 ml-2">
            {getTurnoverRiskPill(latestTurnoverRisk)}
            {getHomeOfficeStatusPill(member.homeOffice?.status, member.homeOffice?.notes)}
          </div>
        </div>

        {/* Contact Info */}
        <div className="flex items-center space-x-4 text-xs text-medium-text border-t border-b border-border-color py-1.5 px-1">
          <a href={`mailto:${memberEmail}`} className="flex items-center hover:text-primary transition-colors truncate" title={memberEmail}>
            <Mail size={14} className="mr-1.5 text-light-text shrink-0" /> <span className="truncate">{memberEmail}</span>
          </a>
          <span className="text-light-text">|</span>
          <a href={`tel:${memberPhone}`} className="flex items-center hover:text-primary transition-colors truncate" title={memberPhone}>
            <Phone size={14} className="mr-1.5 text-light-text shrink-0" /> <span className="truncate">{memberPhone}</span>
          </a>
        </div>
        
        {/* Skills Section */}
        {member.skills && member.skills.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-light-text mb-1 flex items-center">
                <Star size={14} className="mr-1.5 text-light-text"/> Skills
              </h4>
              <div className="flex flex-wrap gap-1">
                {member.skills.slice(0, 4).map(skill => (
                  <span key={skill} className="text-xs bg-tag-blue-bg text-tag-blue-text px-2 py-0.5 rounded-full border border-tag-blue-text/30">
                    {skill}
                  </span>
                ))}
                {member.skills.length > 4 && (
                  <span className="text-xs bg-light-border text-light-text px-2 py-0.5 rounded-full">+{member.skills.length - 4} more</span>
                )}
              </div>
            </div>
          )}

        {/* Key Metrics Section */}
        <div className="space-y-2 pt-1">
          <div>
            <h4 className="text-xs font-semibold text-light-text mb-1 flex items-center"><ListChecks size={14} className="mr-1.5 text-light-text"/> Task Snapshot</h4>
            <div className="grid grid-cols-3 gap-1.5 text-xs text-center">
              <div className="bg-sidebar-bg p-1.5 rounded border border-light-border">
                <p className="font-bold text-warning flex items-center justify-center"><ClockIcon size={12} className="mr-1"/>{pendingTasks}</p>
                <p className="text-light-text">Pending</p>
              </div>
              <div className="bg-sidebar-bg p-1.5 rounded border border-light-border">
                <p className="font-bold text-primary flex items-center justify-center"><Zap size={12} className="mr-1"/>{inProgressTasks}</p>
                <p className="text-light-text">In Prog.</p>
              </div>
              <div className="bg-sidebar-bg p-1.5 rounded border border-light-border">
                <p className="font-bold text-danger flex items-center justify-center"><AlertTriangle size={12} className="mr-1"/>{overdueTasks}</p>
                <p className="text-light-text">Overdue</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-sidebar-bg p-2 rounded border border-light-border">
              <p className="text-light-text mb-0.5 flex items-center"><Target size={13} className="mr-1"/> KPIs Assigned</p>
              <p className={`font-bold ${showKpiWarning ? 'text-warning' : 'text-dark-text'}`}>
                {assignedKpisCount} {showKpiWarning && <AlertTriangle size={12} className="inline ml-1 text-warning" />}
              </p>
            </div>
            <div className="bg-sidebar-bg p-2 rounded border border-light-border">
              <p className="text-light-text mb-0.5 flex items-center"><Briefcase size={13} className="mr-1"/> Client Portfolio</p>
              <p className="font-bold text-dark-text">{assignedClients.length} Client{assignedClients.length !==1 ? 's' : ''}</p>
            </div>
          </div>
          
          {assignedClients.length > 0 && (
            <div className="bg-sidebar-bg p-2 rounded border border-light-border text-xs">
              <p className="text-light-text mb-1">Client Health Mix:</p>
              <div className="flex justify-around items-center">
                  <span className="flex items-center text-success" title="Healthy Clients"><CheckCircle2 size={14} className="mr-1"/>{healthyClientsCount}</span>
                  <span className="flex items-center text-warning" title="At-Risk Clients"><AlertTriangle size={14} className="mr-1"/>{atRiskClientsCount}</span>
                  <span className="flex items-center text-danger" title="Critical Clients"><XCircle size={14} className="mr-1"/>{criticalClientsCount}</span>
              </div>
            </div>
          )}
        </div>
        
        {/* Assigned Clients List */}
        {assignedClients.length > 0 && (
            <div className="pt-1">
                <h4 className="text-xs font-semibold text-light-text mb-0.5 flex items-center"><Users size={14} className="mr-1.5 text-light-text"/>Assigned Clients:</h4>
                <p className="text-xs text-medium-text truncate" title={assignedClients.map(c => c.name).join(', ')}>
                    {assignedClients.slice(0,2).map(c => c.name).join(', ')}
                    {assignedClients.length > 2 && `, +${assignedClients.length - 2} more`}
                </p>
            </div>
        )}

      </div>
      <div className="bg-sidebar-bg p-2.5 flex justify-end space-x-1 border-t border-border-color">
        <button 
          onClick={() => onOpenOneOnOneSessionsModal(member)}
          className="p-1.5 text-medium-text hover:text-green-400 transition-colors rounded-md"
          title="View 1-on-1 Sessions"
          aria-label={`View 1-on-1 sessions for ${member.name}`}
        >
          <ClipboardList size={16} />
        </button>
        <button 
          onClick={() => onEditTeamMember(member)}
          className="p-1.5 text-medium-text hover:text-blue-400 transition-colors rounded-md"
          title="Edit Team Member"
        >
          <Edit2 size={16} />
        </button>
        <button 
          onClick={() => onDeleteTeamMember(member.id)}
          className="p-1.5 text-medium-text hover:text-danger transition-colors rounded-md"
          title="Delete Team Member"
          disabled={member.id === activeUserId} // Disable if it's the active user's profile
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
};
