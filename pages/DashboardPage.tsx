

import React, { useMemo } from 'react';
import { Client, TeamMember, Kpi, HomeOfficeStatus, SOPDetails, FolderOrganizationStatus, ClientStatus, Task, TaskStatus } from '../types';
import { ShieldCheck, Target, Users, Home as HomeIconLucide, BookOpen, FolderCheck, AlertTriangle, CheckCircle, Activity, Info, Link as LinkIcon, Edit3, TrendingUp, Users2, FileText, PieChart as PieChartIcon, BarChart3, ListChecks, CalendarClock } from 'lucide-react';
import { SimpleDoughnutChart } from '../components/SimpleDoughnutChart'; 
import { SimplePieChart } from '../components/SimplePieChart';
import { DailyRoutinePlanner } from '../components/DailyRoutinePlanner'; // Added import

// --- Re-usable Tailwind classes from your theme for charts ---
const tailwindColors = {
  primary: '#58A6FF', // primary.DEFAULT
  success: '#3FB950', // success
  warning: '#F0883E', // warning
  danger: '#F85149',  // danger
  mediumText: '#8B949E', // medium-text
  lightBorder: '#484F58', // light-border
  tagBlueText: '#79C0FF',
  tagOrangeText: '#FFA657',
  inputBg: '#21262D',
  sidebarBg: '#161B22',
  borderCol: '#30363D',
  darkText: '#E6EDF3',
};

interface DashboardPageProps {
  clients: Client[];
  tasks: Task[]; 
  teamMembers: TeamMember[];
  user: TeamMember; 
  recentActivity: any[]; 
  kpis: Kpi[];
}

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 18) return "Good Afternoon";
  return "Good Evening";
};

const formatDate = (isoString?: string) => isoString ? new Date(isoString).toLocaleDateString() : 'N/A';
const calculateTenure = (hireDate?: string): string => {
  if (!hireDate) return 'N/A';
  const start = new Date(hireDate);
  const now = new Date();
  let years = now.getFullYear() - start.getFullYear();
  let months = now.getMonth() - start.getMonth();
  if (months < 0) {
    years--;
    months += 12;
  }
  return `${years > 0 ? `${years}y ` : ''}${months}m`;
};

const DashboardSection: React.FC<{ title: string; icon: React.ElementType; children: React.ReactNode; summaryStats?: React.ReactNode, sectionClass?: string }> = ({ title, icon: Icon, children, summaryStats, sectionClass = "bg-input-bg" }) => (
  <section className={`${sectionClass} p-5 rounded-lg shadow-card border border-border-color`}>
    <h2 className="text-xl font-semibold text-dark-text mb-4 flex items-center">
      <Icon size={24} className="mr-3 text-primary" /> {title}
    </h2>
    {summaryStats && <div className="mb-6">{summaryStats}</div>}
    <div className="overflow-x-auto custom-scrollbar">{children}</div>
  </section>
);

const SummaryStatCard: React.FC<{ label: string; value: string | number; icon: React.ElementType; iconColorClass?: string; }> = ({ label, value, icon: Icon, iconColorClass = "text-primary" }) => (
    <div className="bg-sidebar-bg p-4 rounded-lg shadow-subtle border border-border-color flex flex-col items-start transition-all duration-300 ease-in-out hover:shadow-card hover:border-primary/30 hover:scale-[1.02]">
        <Icon size={24} className={`${iconColorClass} mb-2.5`} strokeWidth={1.5}/>
        <p className="text-xs text-medium-text uppercase tracking-wider mb-0.5">{label}</p>
        <p className="text-2xl font-bold text-dark-text">{value}</p>
    </div>
);


const Table: React.FC<{ headers: string[]; children: React.ReactNode }> = ({ headers, children }) => (
  <table className="min-w-full divide-y divide-border-color text-sm">
    <thead className="bg-sidebar-bg">
      <tr>
        {headers.map(header => (
          <th key={header} scope="col" className="px-4 py-2.5 text-left text-xs font-medium text-light-text uppercase tracking-wider">{header}</th>
        ))}
      </tr>
    </thead>
    <tbody className="bg-input-bg divide-y divide-border-color">{children}</tbody>
  </table>
);

const StatusPill: React.FC<{ status: string; type: 'success' | 'warning' | 'danger' | 'info' | 'neutral' }> = ({ status, type }) => {
  const SvgIcon = type === 'success' ? CheckCircle : type === 'warning' || type === 'danger' ? AlertTriangle : Info;
  const colorClasses = {
    success: 'bg-success-light text-success border-success/30',
    warning: 'bg-warning-light text-warning border-warning/30',
    danger: 'bg-danger-light text-danger border-danger/30',
    info: 'bg-primary-light text-primary border-primary/30',
    neutral: 'bg-light-border text-medium-text border-medium-text/30'
  };
  return (
    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full flex items-center border ${colorClasses[type]}`}>
      <SvgIcon size={13} className="mr-1" /> {status}
    </span>
  );
};

const ChartTableLayout: React.FC<{ chart: React.ReactNode, table: React.ReactNode, chartTitle?: string, tableTitle?: string }> = ({ chart, table, chartTitle, tableTitle }) => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1 bg-sidebar-bg p-4 rounded-md border border-border-color">
        {chartTitle && <h3 className="text-md font-semibold text-dark-text mb-3 text-center">{chartTitle}</h3>}
        {chart}
      </div>
      <div className="lg:col-span-2">
         {tableTitle && <h3 className="text-md font-semibold text-dark-text mb-2">{tableTitle}</h3>}
        {table}
      </div>
    </div>
  );


export const DashboardPage: React.FC<DashboardPageProps> = ({ clients, tasks, teamMembers, user, kpis }) => {

  const kpiReportingStats = useMemo(() => {
    let clientsWithRoiAlignedKpis = 0;
    const clientsWithAnyKpisCount = clients.filter(client => {
        const assignedMembersForClient = teamMembers.filter(tm => client.assignedTeamMembers.includes(tm.id));
        return assignedMembersForClient.some(member => member.assignedKpis && member.assignedKpis.length > 0);
    }).length;

    clients.forEach(client => {
        const assignedMembersForClient = teamMembers.filter(tm => client.assignedTeamMembers.includes(tm.id));
        if (assignedMembersForClient.length === 0 || !assignedMembersForClient.some(m => m.assignedKpis && m.assignedKpis.length > 0)) return;
        
        let clientHasAllRoiAligned = true;
        assignedMembersForClient.forEach(member => {
            if (member.assignedKpis && member.assignedKpis.length > 0) {
                const memberKpis = kpis.filter(kpi => member.assignedKpis!.includes(kpi.id));
                if (!memberKpis.every(k => k.clientNeedAlignment && k.roiDemonstration)) {
                    clientHasAllRoiAligned = false;
                }
            }
        });
        if (clientHasAllRoiAligned) clientsWithRoiAlignedKpis++;
    });
    const percentClientsRoiAligned = clientsWithAnyKpisCount > 0 ? ((clientsWithRoiAlignedKpis / clientsWithAnyKpisCount) * 100).toFixed(0) + '%' : 'N/A';
    return { percentClientsRoiAligned, clientsWithRoiAlignedKpis, clientsWithAnyKpisCount };
  }, [clients, teamMembers, kpis]);

  const homeOfficeStats = useMemo(() => {
    const statusCounts: Record<string, number> = {};
    teamMembers.forEach(member => {
      const status = member.homeOffice?.status || HomeOfficeStatus.ON_SITE_ONLY;
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });
    const chartData = Object.entries(statusCounts).map(([label, value]) => {
        let color = tailwindColors.mediumText;
        if (label === HomeOfficeStatus.APPROVED) color = tailwindColors.success;
        else if (label === HomeOfficeStatus.ELIGIBLE) color = tailwindColors.primary;
        else if (label === HomeOfficeStatus.PENDING_CLIENT_APPROVAL) color = tailwindColors.warning;
        return { label, value, color };
    });
    return { 
        approved: statusCounts[HomeOfficeStatus.APPROVED] || 0, 
        eligible: statusCounts[HomeOfficeStatus.ELIGIBLE] || 0,
        pending: statusCounts[HomeOfficeStatus.PENDING_CLIENT_APPROVAL] || 0,
        onSite: statusCounts[HomeOfficeStatus.ON_SITE_ONLY] || 0,
        chartData 
    };
  }, [teamMembers]);

  return (
    <div className="space-y-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-dark-text">{getGreeting()}, {user.name}!</h1>
        <p className="text-medium-text">Here's what's happening with your operations today.</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
          <SummaryStatCard label="Total Clients" value={clients.length} icon={Users2} iconColorClass="text-primary" />
          <SummaryStatCard label="Active Team Members" value={teamMembers.length} icon={Users} iconColorClass="text-success" />
          <SummaryStatCard label="Total KPIs Tracked" value={kpis.length} icon={Target} iconColorClass="text-warning" />
          <SummaryStatCard label="Open Tasks" value={tasks.filter(t => t.status !== TaskStatus.COMPLETED).length} icon={ListChecks} iconColorClass="text-danger" />
      </div>

      <DashboardSection title="Today's Focus & Routine" icon={CalendarClock}>
        <DailyRoutinePlanner tasks={tasks} currentUser={user} clients={clients} />
      </DashboardSection>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6"> {/* Adjusted to 2 columns */}
        <DashboardSection title="Home Office Status" icon={HomeIconLucide} sectionClass="bg-input-bg">
             <SimpleDoughnutChart data={homeOfficeStats.chartData} size={220} />
        </DashboardSection>
        
        <DashboardSection title="KPI Reporting & Audit Readiness" icon={FileText} sectionClass="bg-input-bg"
            summaryStats={
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm mb-3"> {/* Adjusted to 2 cols for consistency */}
                <p className="text-medium-text">Clients w/ ROI KPIs: <strong className="text-dark-text">{kpiReportingStats.percentClientsRoiAligned}</strong> ({kpiReportingStats.clientsWithRoiAlignedKpis}/{kpiReportingStats.clientsWithAnyKpisCount})</p>
                {/* Can add another summary stat here if needed */}
            </div>
            }
        >
            <div className="max-h-60 overflow-y-auto custom-scrollbar">
                <Table headers={['Client', 'SOP Status', 'Folder Org.']}>
                {clients.filter(c => !c.sop?.exists || c.folderOrganizationStatus === 'Needs Review' || c.folderOrganizationStatus === 'Not Set').slice(0,5).map(client => (
                    <tr key={client.id}>
                    <td className="px-4 py-2 text-dark-text">{client.name}</td>
                    <td className="px-4 py-2"><StatusPill status={client.sop?.exists ? `Exists (${client.sop.format || 'N/A'})` : 'Missing'} type={client.sop?.exists ? 'success' : 'warning'} /></td>
                    <td className="px-4 py-2"><StatusPill status={client.folderOrganizationStatus || 'Not Set'} type={client.folderOrganizationStatus === 'Organized' ? 'success' : 'warning'} /></td>
                    </tr>
                ))}
                </Table>
            </div>
        </DashboardSection>
      </div>
    </div>
  );
};
