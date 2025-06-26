


import React, { useState, useMemo } from 'react';
import { TeamMember, Client, Task, Kpi, FormMode, ClientStatus, TaskStatus, OneOnOneSession, TurnoverRiskLevel, HomeOfficeStatus } from '../types';
import { TeamMemberCard } from '../components/TeamMemberCard';
import { PlusCircle, Users, ListChecks, AlertTriangle as AlertTriangleIcon, Filter as FilterIcon, PieChart, ArrowDownUp, Briefcase, Target, ShieldCheck, Home as HomeIconLucide, Activity } from 'lucide-react';
import { SimpleDoughnutChart } from '../components/SimpleDoughnutChart';

interface TeamPageProps {
  teamMembers: TeamMember[];
  clients: Client[];
  tasks: Task[];
  kpis: Kpi[]; 
  oneOnOneSessions: OneOnOneSession[];
  onOpenTeamMemberForm: (mode: FormMode, member?: TeamMember) => void;
  onDeleteTeamMember: (memberId: string) => void;
  onOpenOneOnOneSessionsModal: (member: TeamMember) => void;
  activeUserId: string; // Added activeUserId prop
}

type SortOption = 
  | 'name-asc' | 'name-desc' 
  | 'role-asc' | 'role-desc' 
  | 'tasks-asc' | 'tasks-desc' 
  | 'clients-asc' | 'clients-desc';

// Re-usable Tailwind classes from your theme for charts
const tailwindColors = {
  primary: '#58A6FF',
  success: '#3FB950',
  warning: '#F0883E',
  danger: '#F85149',
  mediumText: '#8B949E',
  lightBorder: '#484F58',
  tagBlueText: '#79C0FF', // For 'Eligible' or 'Info'
  inputBg: '#21262D',
  sidebarBg: '#161B22',
};

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ElementType; iconColorClass?: string; valueClass?: string; containerClass?: string }> = 
  ({ title, value, icon: Icon, iconColorClass = "text-primary", valueClass = "text-dark-text", containerClass = "bg-input-bg" }) => (
  <div className={`${containerClass} p-4 rounded-lg shadow-card border border-border-color flex items-center space-x-3 transition-all duration-300 ease-in-out hover:shadow-card-hover hover:scale-[1.02]`}>
    <div className={`p-2.5 rounded-full ${iconColorClass.replace('text-', 'bg-')}/10`}> {/* Dynamic bg from icon color */}
      <Icon size={20} className={iconColorClass} />
    </div>
    <div>
      <p className="text-xs text-medium-text uppercase tracking-wider">{title}</p>
      <p className={`text-xl font-bold ${valueClass}`}>{value}</p>
    </div>
  </div>
);

export const TeamPage: React.FC<TeamPageProps> = ({ teamMembers, clients, tasks, kpis, oneOnOneSessions, onOpenTeamMemberForm, onDeleteTeamMember, onOpenOneOnOneSessionsModal, activeUserId }) => {
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [clientAssignmentFilter, setClientAssignmentFilter] = useState<'all' | 'with-critical' | 'healthy-only' | 'unassigned'>('all');
  const [sortOption, setSortOption] = useState<SortOption>('name-asc');

  const uniqueRoles = useMemo(() => {
    const roles = new Set(teamMembers.map(member => member.role));
    return ['all', ...Array.from(roles)];
  }, [teamMembers]);

  const filteredAndSortedTeamMembers = useMemo(() => {
    let filtered = teamMembers.filter(member => {
      const roleMatch = roleFilter === 'all' || member.role === roleFilter;
      
      const memberClients = clients.filter(c => c.assignedTeamMembers.includes(member.id));
      let assignmentMatch = true;
      if (clientAssignmentFilter === 'with-critical') {
        assignmentMatch = memberClients.some(c => c.status === ClientStatus.CRITICAL || c.status === ClientStatus.AT_RISK);
      } else if (clientAssignmentFilter === 'healthy-only') {
        assignmentMatch = memberClients.length > 0 && memberClients.every(c => c.status === ClientStatus.HEALTHY);
      } else if (clientAssignmentFilter === 'unassigned') {
        assignmentMatch = memberClients.length === 0;
      }
      return roleMatch && assignmentMatch;
    });

    return filtered.sort((a, b) => {
      switch (sortOption) {
        case 'name-asc': return a.name.localeCompare(b.name);
        case 'name-desc': return b.name.localeCompare(a.name);
        case 'role-asc': return a.role.localeCompare(b.role);
        case 'role-desc': return b.role.localeCompare(a.role);
        case 'tasks-asc':
          return tasks.filter(t => t.assignedTo === a.name && t.status !== TaskStatus.COMPLETED).length - tasks.filter(t => t.assignedTo === b.name && t.status !== TaskStatus.COMPLETED).length;
        case 'tasks-desc':
          return tasks.filter(t => t.assignedTo === b.name && t.status !== TaskStatus.COMPLETED).length - tasks.filter(t => t.assignedTo === a.name && t.status !== TaskStatus.COMPLETED).length;
        case 'clients-asc':
          return clients.filter(c => c.assignedTeamMembers.includes(a.id)).length - clients.filter(c => c.assignedTeamMembers.includes(b.id)).length;
        case 'clients-desc':
          return clients.filter(c => c.assignedTeamMembers.includes(b.id)).length - clients.filter(c => c.assignedTeamMembers.includes(a.id)).length;
        default: return 0;
      }
    });
  }, [teamMembers, clients, tasks, roleFilter, clientAssignmentFilter, sortOption]);

  // Summary Stats Calculations
  const totalTeamMembers = teamMembers.length;
  const totalOpenTasksTeamWide = tasks.filter(task => task.status !== TaskStatus.COMPLETED).length;
  const membersWithCriticalClients = teamMembers.filter(member => {
    return clients.some(client => 
      client.assignedTeamMembers.includes(member.id) && 
      (client.status === ClientStatus.CRITICAL || client.status === ClientStatus.AT_RISK)
    );
  }).length;
  
  const totalKpisTracked = useMemo(() => {
    const kpiSet = new Set<string>();
    teamMembers.forEach(member => {
      member.assignedKpis?.forEach(kpiId => kpiSet.add(kpiId));
    });
    return kpiSet.size;
  }, [teamMembers]);

  const overallTeamKpiPerformance = useMemo(() => {
    let onTrackCount = 0;
    let relevantKpiCount = 0;
    const processedKpiIds = new Set<string>();

    teamMembers.forEach(member => { // Iterate all team members for overall KPI perf
      member.assignedKpis?.forEach(kpiId => {
        if (!processedKpiIds.has(kpiId)) {
          const kpi = kpis.find(k => k.id === kpiId);
          if (kpi) {
            relevantKpiCount++;
            // Define "lower is better" KPIs
            const lowerIsBetterKpis = ["cancelled visits", "attrition", "absenteeism", "turnover"];
            const isLowerBetter = lowerIsBetterKpis.some(term => kpi.name.toLowerCase().includes(term));

            if (isLowerBetter) {
              if (kpi.actual <= kpi.target) onTrackCount++;
            } else {
              if (kpi.actual >= kpi.target) onTrackCount++;
            }
            processedKpiIds.add(kpiId);
          }
        }
      });
    });
    return relevantKpiCount > 0 ? Math.round((onTrackCount / relevantKpiCount) * 100) : 0;
  }, [teamMembers, kpis]);

  // Data for Turnover Risk Chart
  const turnoverRiskChartData = useMemo(() => {
    const counts: Record<TurnoverRiskLevel, number> = { Low: 0, Medium: 0, High: 0 };
    teamMembers.forEach(member => {
      const latestSession = oneOnOneSessions
        .filter(s => s.teamMemberId === member.id)
        .sort((a,b) => new Date(b.sessionDate).getTime() - new Date(a.sessionDate).getTime())[0];
      const risk = latestSession?.turnoverRisk || TurnoverRiskLevel.LOW; // Default to Low if no session
      counts[risk]++;
    });
    return [
      { label: 'Low Risk', value: counts.Low, color: tailwindColors.success },
      { label: 'Medium Risk', value: counts.Medium, color: tailwindColors.warning },
      { label: 'High Risk', value: counts.High, color: tailwindColors.danger },
    ];
  }, [teamMembers, oneOnOneSessions]);


  // Data for Home Office Status Chart
  const homeOfficeChartData = useMemo(() => {
    const counts: Record<HomeOfficeStatus, number> = {
      [HomeOfficeStatus.APPROVED]: 0,
      [HomeOfficeStatus.ELIGIBLE]: 0,
      [HomeOfficeStatus.PENDING_CLIENT_APPROVAL]: 0,
      [HomeOfficeStatus.ON_SITE_ONLY]: 0,
    };
    teamMembers.forEach(member => {
      const status = member.homeOffice?.status || HomeOfficeStatus.ON_SITE_ONLY;
      counts[status]++;
    });
    return [
      { label: 'Approved', value: counts[HomeOfficeStatus.APPROVED], color: tailwindColors.success },
      { label: 'Eligible', value: counts[HomeOfficeStatus.ELIGIBLE], color: tailwindColors.tagBlueText },
      { label: 'Pending Approval', value: counts[HomeOfficeStatus.PENDING_CLIENT_APPROVAL], color: tailwindColors.warning },
      { label: 'On-Site Only', value: counts[HomeOfficeStatus.ON_SITE_ONLY], color: tailwindColors.mediumText },
    ];
  }, [teamMembers]);

  const chartCardClass = "bg-sidebar-bg p-4 rounded-lg shadow-sm border border-border-color flex flex-col items-center justify-center";


  return (
    <div className="space-y-7">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-bold text-dark-text">Team Management Hub</h1>
         <button 
            onClick={() => onOpenTeamMemberForm('add')}
            className="flex items-center bg-primary hover:bg-primary-dark text-white font-medium py-2.5 px-5 rounded-md text-sm transition-all duration-300 shadow-md hover:shadow-hero-glow-light hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-light-bg focus-visible:ring-primary"
        >
            <PlusCircle size={18} className="mr-2"/> Add Team Member
        </button>
      </div>
      
      {/* Team Performance Overview Section */}
      <section className="bg-input-bg p-5 rounded-lg shadow-card border border-border-color">
        <h2 className="text-xl font-semibold text-dark-text mb-5 flex items-center">
          <PieChart size={22} className="mr-3 text-primary" /> Team Performance Overview
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-6"> {/* Adjusted to 3 columns for charts */}
          {/* Charts Row */}
          <div className={chartCardClass}>
            <h3 className="text-sm font-semibold text-medium-text mb-2 text-center">Turnover Risk</h3>
            <SimpleDoughnutChart data={turnoverRiskChartData} size={150} holeSize={0.65} />
          </div>
          <div className={chartCardClass}>
            <h3 className="text-sm font-semibold text-medium-text mb-2 text-center">Home Office Status</h3>
            <SimpleDoughnutChart data={homeOfficeChartData} size={150} holeSize={0.65} />
          </div>
          {/* Prominent KPI Stat */}
           <div className={`${chartCardClass} justify-center items-center bg-gradient-to-br from-primary/10 via-input-bg to-input-bg border-primary/40`}>
            <Target size={28} className="text-primary mb-2.5" />
            <p className="text-xs text-medium-text uppercase tracking-wider mb-0.5">Team KPI Success</p>
            <p className={`text-4xl font-bold ${overallTeamKpiPerformance >= 80 ? 'text-success' : overallTeamKpiPerformance >=50 ? 'text-warning' : 'text-danger'}`}>{overallTeamKpiPerformance}%</p>
          </div>
        </div>

        {/* Key Numerical Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Members" value={totalTeamMembers} icon={Users} containerClass="bg-sidebar-bg" />
          <StatCard title="Open Tasks" value={totalOpenTasksTeamWide} icon={ListChecks} iconColorClass="text-warning" containerClass="bg-sidebar-bg" />
          <StatCard title="Critical Assign." value={membersWithCriticalClients} icon={AlertTriangleIcon} iconColorClass="text-danger" containerClass="bg-sidebar-bg" />
          <StatCard title="KPIs Tracked" value={totalKpisTracked} icon={Briefcase} iconColorClass="text-tagBlueText" containerClass="bg-sidebar-bg" />
        </div>
      </section>

      <div className="p-4 bg-sidebar-bg rounded-lg shadow-subtle flex flex-col md:flex-row flex-wrap justify-between items-center gap-3 border border-border-color">
          <div className="flex items-center gap-2">
            <FilterIcon className="h-5 w-5 text-light-text"/>
            <select
              id="role-filter"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="form-select pl-2 pr-7 py-1.5 rounded-md border-border-color shadow-subtle focus:border-primary focus:ring-1 focus:ring-primary text-xs bg-input-bg text-dark-text appearance-none"
            >
              {uniqueRoles.map(role => (
                <option key={role} value={role} className="bg-input-bg text-dark-text">{role === 'all' ? 'All Roles' : role}</option>
              ))}
            </select>
            <select
              id="client-assignment-filter"
              value={clientAssignmentFilter}
              onChange={(e) => setClientAssignmentFilter(e.target.value as any)}
              className="form-select pl-2 pr-7 py-1.5 rounded-md border-border-color shadow-subtle focus:border-primary focus:ring-1 focus:ring-primary text-xs bg-input-bg text-dark-text appearance-none"
            >
              <option value="all" className="bg-input-bg text-dark-text">All Assignments</option>
              <option value="with-critical" className="bg-input-bg text-dark-text">With Critical/At-Risk</option>
              <option value="healthy-only" className="bg-input-bg text-dark-text">Healthy Clients Only</option>
              <option value="unassigned" className="bg-input-bg text-dark-text">Unassigned</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <ArrowDownUp className="h-5 w-5 text-light-text"/>
            <select
              id="sort-order"
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as SortOption)}
              className="form-select pl-2 pr-7 py-1.5 rounded-md border-border-color shadow-subtle focus:border-primary focus:ring-1 focus:ring-primary text-xs bg-input-bg text-dark-text appearance-none"
            >
              <option value="name-asc" className="bg-input-bg text-dark-text">Name (A-Z)</option>
              <option value="name-desc" className="bg-input-bg text-dark-text">Name (Z-A)</option>
              <option value="role-asc" className="bg-input-bg text-dark-text">Role (A-Z)</option>
              <option value="role-desc" className="bg-input-bg text-dark-text">Role (Z-A)</option>
              <option value="tasks-asc" className="bg-input-bg text-dark-text">Open Tasks (Low-High)</option>
              <option value="tasks-desc" className="bg-input-bg text-dark-text">Open Tasks (High-Low)</option>
              <option value="clients-asc" className="bg-input-bg text-dark-text">Clients (Low-High)</option>
              <option value="clients-desc" className="bg-input-bg text-dark-text">Clients (High-Low)</option>
            </select>
          </div>
      </div>
      
      {filteredAndSortedTeamMembers.length === 0 && (
        <p className="text-center text-light-text py-8">
          No team members match the current filters.
        </p>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filteredAndSortedTeamMembers.map(member => (
          <TeamMemberCard 
            key={member.id} 
            member={member} 
            clients={clients} 
            tasks={tasks} 
            kpis={kpis} 
            oneOnOneSessions={oneOnOneSessions}
            onEditTeamMember={() => onOpenTeamMemberForm('edit', member)}
            onDeleteTeamMember={onDeleteTeamMember}
            onOpenOneOnOneSessionsModal={onOpenOneOnOneSessionsModal}
            activeUserId={activeUserId} // Pass activeUserId here
          />
        ))}
      </div>
    </div>
  );
};
