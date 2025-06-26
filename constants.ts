

import { Client, TeamMember, Task, Kpi, ClientStatus, TaskStatus, NavSection, TaskPriority, Template, TemplateCategory, ITTicketPriority, RecentActivityItem, OneOnOneSession, HomeOfficeStatus, SOPDetails, KpiReportingDetails, HomeOfficeDetails, ClientDocumentationChecklist, FolderOrganizationStatus, PtlMainDriver, PtlReport, CoachingFeedForward, CoachingFeeling, CoachingReason, ClientEmailLog, PulseLogEntry, TurnoverRiskLevel, MitigationActionItem } from './types';
import { Home, Users, Briefcase, ListTodo, Presentation, LayoutTemplate, CheckCircle, UserPlus, FilePlus, Zap, Edit3, ClipboardPen, ClipboardEdit, TrendingUp } from 'lucide-react';

export const APP_NAME = "SolvoIQ";
export const APP_TAGLINE = "Intelligence Operations";

// --- LOGIN USER PROFILES (as TeamMember type for consistency) ---
export const JUAN_BELCAZAR_PROFILE: TeamMember = {
  id: "juan.belalcazar",
  name: "Juan Belalcázar",
  role: "Operations Supervisor",
  email: "juan.belalcazar@solvoglobal.com",
  avatarInitials: "JB",
  department: "Management",
  skills: ['Management', 'Operations', 'Strategy', 'AI Integration'],
  hireDate: new Date('2020-01-15T00:00:00Z').toISOString(),
  homeOffice: { 
    status: HomeOfficeStatus.APPROVED, 
    notes: "HO Approved for supervisor.",
    approvalDate: new Date('2020-03-01T00:00:00Z').toISOString(),
    daysPerWeek: 2,
    clientApprovalDocumentLink: 'sharepoint.com/ho/supervisor_approval.pdf'
  },
  assignedKpis: [] 
};

export const EMILIO_ALVEAR_PROFILE: TeamMember = {
  id: "emilio.alvear",
  name: "Emilio Alvear",
  role: "Operations Manager",
  email: "emilio.alvear@solvoglobal.com",
  avatarInitials: "EA",
  department: "Management",
  skills: ['Senior Management', 'Client Relations', 'Process Optimization', 'Reporting'],
  hireDate: new Date('2019-05-10T00:00:00Z').toISOString(),
  homeOffice: {
    status: HomeOfficeStatus.APPROVED,
    notes: "HO approved for manager.",
    approvalDate: new Date('2019-07-01T00:00:00Z').toISOString(),
    daysPerWeek: 2,
  },
  assignedKpis: [] 
};

export const AVAILABLE_USER_PROFILES: Record<string, TeamMember> = {
  [JUAN_BELCAZAR_PROFILE.id]: JUAN_BELCAZAR_PROFILE,
  [EMILIO_ALVEAR_PROFILE.id]: EMILIO_ALVEAR_PROFILE,
};
// --- END LOGIN USER PROFILES ---


export const NAVIGATION_LINKS: NavSection[] = [
  {
    title: "OPERATIONS",
    links: [
      { name: "Dashboard", icon: Home, pageId: 'dashboard' },
      { name: "Clients", icon: Users, pageId: 'clients' },
      { name: "Team", icon: Briefcase, pageId: 'team' },
      { name: "Tasks", icon: ListTodo, pageId: 'tasks' },
      { name: "PTL Reports", icon: ClipboardPen, pageId: 'ptl-reports'},
      { name: "Coaching Feed Forward", icon: ClipboardEdit, pageId: 'coaching-feed-forward' },
    ],
  },
  {
    title: "INTELLIGENCE SUITE",
    links: [
      { name: "KPI Library", icon: Presentation, pageId: 'kpi-library' },
      { name: "KPI Goals", icon: TrendingUp, pageId: 'kpi-goals' },
      { name: "Templates", icon: LayoutTemplate, pageId: 'templates' },
    ],
  },
];

// Helper to map Soulvers names from KPI table to TeamMember IDs
const soulversToTmIdMap: { [key: string]: string } = {
  "ROMERO VARGAS NEIDER ANDRES": "solaj418",
  "RESTREPO MARTÍNEZ JUANITA": "solaj421",
  "COBA CEPEDA SILVANA": "solaj969",
  "PEÑA CORREA MARIANA ANDREA": "solam122",
  "RODRIGUEZ SANCHEZ WENDY GISSELLA": "solan248",
  "TARQUINO MARTINEZ JULIANA": "solaj337",
  "SANTANA CORONADO ANGELICA MARIA": "solae075",
  "PUPO RODRIGUEZ MELANIE PATRICIA": "solam156",
  "MOLINA MONTALVO LIZETH ALEJANDRA": "solam272",
  "PULID GARZON RICARDO": "solam977",
};

// Helper to map Account names from KPI table to Client IDs
const accountToClientIdMap: { [key: string]: string } = {
  "Care of Fairfield LLC dba Synergy Homecare": "c997",
  "Endredy Enterprises LLC dba SYNERGY HomeCare": "c1035",
  "Just One Step LLC dba SYNERGY HomeCare": "c860",
  "Synergy HomeCare of Fredericksburg": "c1250",
  "Synergy HomeCare of Mendon": "c1495",
  "SYNERGY HomeCare of Sierra Vista": "c946",
  "Weama LLC dba SYNERGY HomeCare": "c468",
  "Toledo Home Care Company dba Synergy HomeCare": "c1259",
  "Synergy Home Care of Yuma": "c1293",
};


export const INITIAL_TEAM_MEMBERS: TeamMember[] = [
  // Juan Belalcazar (updated to match login profile)
  { 
    ...JUAN_BELCAZAR_PROFILE, 
    assignedKpis: [
      'kpi_c2552_onboarding_1', 
      'kpi_c2552_onboarding_2', 
      'kpi_c2552_onboarding_3'
    ] 
  }, 
  // Emilio Alvear (newly added for login)
  { ...EMILIO_ALVEAR_PROFILE },
  // Existing team members
  {
    id: 'solae075', name: 'Angelica Maria Santana Coronado', role: 'Recruiter', email: 'angelica.santana@solvoglobal.com', department: "Recruitment", 
    assignedKpis: ['kpi_c1259_solae075_1'], // Added existing KPI
    avatarInitials: 'AS', skills: ['Scheduling', 'Logistics', 'Communication', 'Recruitment'], 
    hireDate: new Date('2023-06-09T00:00:00Z').toISOString(),
    homeOffice: { 
      status: HomeOfficeStatus.ELIGIBLE,
      notes: "Eligible for HO. Previously assigned to Weama LLC; now Recruiter for Toledo.", 
      approvalDate: undefined,
      daysPerWeek: undefined,
      clientApprovalDocumentLink: undefined
    }
  },
  {
    id: 'solan248', name: 'Wendy Gissella Rodriguez Sanchez', role: 'Recruiter', email: 'wendy.rodriguez@solvoglobal.com', department: "Recruitment",
    assignedKpis: ['kpi_c1495_solan248_1', 'kpi_c1495_solan248_2', 'kpi_c1495_solan248_3', 'kpi_c1495_solan248_4'], avatarInitials: 'WR', skills: ['Recruitment', 'HR', 'Interviewing'],
    hireDate: new Date('2023-05-31T00:00:00Z').toISOString(),
    homeOffice: { 
      status: HomeOfficeStatus.APPROVED,
      notes: "HO Approved by client Synergy HomeCare of Mendon.",
      approvalDate: new Date('2024-06-10T00:00:00Z').toISOString(),
      daysPerWeek: 1,
      clientApprovalDocumentLink: 'sharepoint.com/ho/c1495_wendy_approval.pdf'
    }
  },
  { 
    id: 'solan772', name: 'Mariana Marcela Arevalo Gutierrez', role: 'Recruiter', email: 'mariana.arevalo@solvoglobal.com', department: "Recruitment & HR", 
    assignedKpis: [
        'kpi_generic_recruitment_1',
        'kpi_c1168_solan772_1',
        'kpi_c1168_solan772_2',
        'kpi_c1168_solan772_3',
        'kpi_c1168_solan772_recruitment_1', // New
        'kpi_c1168_solan772_recruitment_2'  // New
    ], 
    avatarInitials: 'MA', skills: ['HR Policies', 'Recruitment', 'Marketing'],
    hireDate: new Date('2024-01-05T00:00:00Z').toISOString(),
    homeOffice: { 
      status: HomeOfficeStatus.PENDING_CLIENT_APPROVAL,
      notes: "Pending client confirmation for HO for Synergy Homecare of South Austin (c1168).",
      approvalDate: undefined,
      daysPerWeek: undefined,
      clientApprovalDocumentLink: undefined
    } 
  },
  { 
    id: 'solak310', name: 'Sebastian Cantera Perez', role: 'Scheduler', email: 'sebastian.cantera@solvoglobal.com', department: "Operations Support", 
    assignedKpis: [
        'kpi_c1168_solak310_1',
        'kpi_c1168_solak310_2',
        'kpi_c1168_solak310_marketing_1', // New
        'kpi_c1168_solak310_marketing_2', // New
        'kpi_c1168_solak310_marketing_3', // New
        'kpi_c1168_solak310_scheduling_1' // New
    ], 
    avatarInitials: 'SC', skills: ['HR Admin', 'Onboarding', 'Scheduling', 'Marketing Support'], 
    hireDate: new Date('2024-01-05T00:00:00Z').toISOString(),
    homeOffice: { 
      status: HomeOfficeStatus.PENDING_CLIENT_APPROVAL,
      notes: "Pending client confirmation for HO for Synergy Homecare of South Austin (c1168). IT onboarding tasks pending.",
      approvalDate: undefined,
      daysPerWeek: undefined,
      clientApprovalDocumentLink: undefined
    }
  },
  {
    id: 'solam122', name: 'Mariana Andrea Peña Correa', role: 'Recruiter', email: 'mariana.pena@solvoglobal.com', department: "Recruitment",
    assignedKpis: [
        'kpi_c1250_solam122_1', 
        'kpi_c1250_solam122_2', 
        'kpi_c1250_solam122_3',
        'kpi_c2552_solam122_recruitment_1', // New
        'kpi_c2552_solam122_recruitment_2', // New
        'kpi_c2552_solam122_recruitment_3'  // New
    ], 
    avatarInitials: 'MP', skills: ['Sourcing', 'Candidate Management'],
    hireDate: new Date('2024-01-25T00:00:00Z').toISOString(),
    homeOffice: { 
      status: HomeOfficeStatus.ON_SITE_ONLY, 
      notes: "Resigned. Client (Beata - c1250) had verbally agreed to HO, but situation changed. Now also supporting Apollo Beach recruitment.",
      approvalDate: undefined,
      daysPerWeek: undefined,
      clientApprovalDocumentLink: undefined
    }
  },
  {
    id: 'solaj418', name: 'Neider Andres Romero Vargas', role: 'Recruiter', email: 'neider.romero@solvoglobal.com', department: "Recruitment",
    assignedKpis: ['kpi_c997_solaj418_1', 'kpi_c997_solaj418_2', 'kpi_c997_solaj418_3', 'kpi_c997_solaj418_4'], avatarInitials: 'NR', skills: ['Technical Recruiting', 'Negotiation'],
    hireDate: new Date('2023-09-14T00:00:00Z').toISOString(),
    homeOffice: { 
      status: HomeOfficeStatus.APPROVED, 
      notes: "HO approved by Care of Fairfield LLC after recent positive review and salary increase finalization.",
      approvalDate: new Date('2025-06-12T00:00:00Z').toISOString(),
      daysPerWeek: 1,
      clientApprovalDocumentLink: 'sharepoint.com/ho/c997_neider_approval.pdf'
    }
  },
  {
    id: 'solaj421', name: 'Juanita Restrepo Martinez', role: 'Recruiter', email: 'juanita.restrepo@solvoglobal.com', department: "Recruitment",
    assignedKpis: ['kpi_c1035_solaj421_1', 'kpi_c1035_solaj421_2', 'kpi_c1035_solaj421_3', 'kpi_c1035_solaj421_4', 'kpi_c1035_solaj421_5'], avatarInitials: 'JR', skills: ['High-Volume Recruiting', 'ATS Management'],
    hireDate: new Date('2023-09-12T00:00:00Z').toISOString(),
    homeOffice: { 
      status: HomeOfficeStatus.ON_SITE_ONLY, 
      notes: "Client (Mike/Linda - c1035) explicitly wants on-site due to past leave issues. HO not currently an option for this assignment.",
      approvalDate: undefined,
      daysPerWeek: undefined,
      clientApprovalDocumentLink: undefined
    }
  },
  {
    id: 'solaj969', name: 'Silvana Coba Cepeda', role: 'HR Assistant', email: 'silvana.coba@solvoglobal.com', department: "HR", 
    assignedKpis: ['kpi_c860_solaj969_1', 'kpi_c860_solaj969_2', 'kpi_c860_solaj969_3'], avatarInitials: 'SC', skills: ['HR Coordination', 'Compliance', 'Reporting'],
    hireDate: new Date('2023-08-14T00:00:00Z').toISOString(),
    homeOffice: { 
      status: HomeOfficeStatus.ELIGIBLE,
      notes: "Eligible for HO, pending client (Just One Step LLC - c860) discussion.",
      approvalDate: undefined,
      daysPerWeek: undefined,
      clientApprovalDocumentLink: undefined
    }
  },
  {
    id: 'solaj337', name: 'Juliana Tarquino Martinez', role: 'Scheduler', email: 'juliana.tarquino@solvoglobal.com', department: "Operations Support",
    assignedKpis: ['kpi_c946_solaj337_1', 'kpi_c946_solaj337_2', 'kpi_c946_solaj337_3', 'kpi_c946_solaj337_4'], avatarInitials: 'JT', skills: ['Shift Management', 'Problem Solving'],
    hireDate: new Date('2023-07-17T00:00:00Z').toISOString(),
    homeOffice: { 
      status: HomeOfficeStatus.ELIGIBLE,
      notes: "Eligible for HO. Client (Hyman & Hyman - c946) seems open, need to formally propose.",
      approvalDate: undefined,
      daysPerWeek: undefined,
      clientApprovalDocumentLink: undefined
    }
  },
  { 
    id: 'solas093', name: 'Cristian Adrián Klen Torres', role: 'Accounting Clerk', email: 'cristian.klen@solvoglobal.com', department: "Finance", 
    assignedKpis: ['kpi_generic_accounting_1'],
    avatarInitials: 'CT', skills: ['Accounting', 'Data Entry', 'Excel'], 
    hireDate: new Date('2023-11-21T00:00:00Z').toISOString(),
    homeOffice: { 
      status: HomeOfficeStatus.ELIGIBLE,
      notes: "Client (Synergy Franchising - c1868) appreciates organized work, HO could be discussed. Confirm if MS Authentication IT issue is resolved. Based in Peru.",
      approvalDate: undefined,
      daysPerWeek: undefined,
      clientApprovalDocumentLink: undefined
    }
  },
  {
    id: 'solam156', name: 'Melanie Patricia Pupo Rodriguez', role: 'Recruiter', email: 'melanie.pupo@solvoglobal.com', department: "Recruitment",
    assignedKpis: ['kpi_c1259_solam156_1', 'kpi_c1259_solam156_2', 'kpi_c1259_solam156_3', 'kpi_c1259_solam156_4', 'kpi_c1259_solam156_5'], avatarInitials: 'MP', skills: ['Recruiting Strategy', 'Communication'],
    hireDate: new Date('2024-02-18T00:00:00Z').toISOString(),
    homeOffice: { 
      status: HomeOfficeStatus.ELIGIBLE,
      notes: "Eligible for HO. Client: Toledo Home Care Company (c1259). Need to initiate discussion.",
      approvalDate: undefined,
      daysPerWeek: undefined,
      clientApprovalDocumentLink: undefined
    }
  },
  {
    id: 'solam272', name: 'Lizeth Alejandra Molina Montalvo', role: 'Recruiter/HR', email: 'lizeth.molina@solvoglobal.com', department: "Recruitment & HR", 
    assignedKpis: ['kpi_c1293_solam272_1', 'kpi_c1293_solam272_2'], 
    avatarInitials: 'LM', skills: ['Coordination', 'Time Management', 'Recruitment', 'HR'], 
    hireDate: new Date('2024-02-20T00:00:00Z').toISOString(),
    homeOffice: { 
      status: HomeOfficeStatus.ELIGIBLE,
      notes: "Eligible for HO. Client: SYNERGY HomeCare of Yuma (c1293). Role changed from Case Manager to Recruiter/HR due to U.S. regulations for Yuma account.",
      approvalDate: undefined,
      daysPerWeek: undefined,
      clientApprovalDocumentLink: undefined
    }
  },
  {
    id: 'solam977', name: 'Ricardo Pulido Garzon', role: 'Marketing Assistant', email: 'ricardo.pulido@solvoglobal.com', department: "Marketing", 
    assignedKpis: ['kpi_c1293_solam977_1', 'kpi_c1293_solam977_2', 'kpi_c1293_solam977_3'], avatarInitials: 'RP', skills: ['Digital Marketing', 'Content Creation', 'SEO'],
    hireDate: new Date('2024-02-20T00:00:00Z').toISOString(),
    homeOffice: { 
      status: HomeOfficeStatus.ELIGIBLE,
      notes: "Eligible for HO. Client: SYNERGY HomeCare of Yuma (c1293). Part of discussion with Lizeth's HO.",
      approvalDate: undefined,
      daysPerWeek: undefined,
      clientApprovalDocumentLink: undefined
    }
  },
  { 
    id: 'solau089', name: 'Angie Paola Acuña Patiño', role: 'Scheduler', email: 'angie.acuna@solvoglobal.com', department: "Operations Support", 
    assignedKpis: [
        'kpi_c2551_solau089_scheduling_1', // New
        'kpi_c2551_solau089_scheduling_2', // New
        'kpi_c2551_solau089_scheduling_3'  // New
    ], 
    avatarInitials: 'AA', skills: ['Scheduling', 'Customer Service'],
    hireDate: new Date('2024-03-01T00:00:00Z').toISOString(), 
    homeOffice: { 
      status: HomeOfficeStatus.ON_SITE_ONLY, 
      notes: "New hire, HO discussion pending after probationary period and client assignment stability (c2551). Submit IT ticket for onboarding setup.",
      approvalDate: undefined,
      daysPerWeek: undefined,
      clientApprovalDocumentLink: undefined
    }
  },
  { 
    id: 'solaj001', name: 'Julie Doe', role: 'Scheduler', email: 'julie.doe@solvoglobal.com', department: "Operations Support", 
    assignedKpis: [], avatarInitials: 'JD', skills: ['Scheduling'],
    hireDate: new Date('2024-06-01T00:00:00Z').toISOString(), 
    homeOffice: { 
      status: HomeOfficeStatus.ON_SITE_ONLY,
      notes: "New team member, HO status to be determined. Requires IT onboarding."
    }
  },
];


export const INITIAL_CLIENTS: Client[] = [
  {
    id: 'c997', 
    name: 'Care of Fairfield LLC dba Synergy Homecare', 
    status: ClientStatus.HEALTHY,
    tags: ['HomeCare', 'Recruitment Focus'],
    contactInfo: { email: 'jaykiley@synergyhomecare.com', phone: '(203) 923-8866', address: '', },
    notes: `POC: Jay Kiley and Laurie Kiley (Additional Emails: lauriekiley@synergyhomecare.com)\nSales Manager: Victor Arocho\nStart Date: September 14, 2023\nSeniority: 1.74 years\nSolversary: September 14\nSOP: Yes (Date: January 22, 2024)\nIdentifiable KPIs: Yes\nWBR Scheduled: Yes (Frequency: Monthly, Day/Time: Cloudtalk)\nPhone System: Cloudtalk\nStatus Description: Strong client relationship; the client is described as kind and cooperative. Dashboard (tracking applicants, calls, texts, interviews, and hires) presented and well-received. Neider's 5% salary increase has been approved. Confirmed client's preferred weekly report format is current one. Increase proposal for Neider sent June 19, 2025, client requested a day to evaluate offering more.`,
    assignedTeamMembers: ['solaj418', JUAN_BELCAZAR_PROFILE.id], 
    pulseLog: [
        {id: 'pl-c997-new1', date: new Date('2025-06-25T10:00:00Z').toISOString(), type: 'Meeting', notes: "Internal discussion (Juan Emilio & Juan Sebastián): Proposal for Neider's increase sent June 19th. Client asked for a day to consider offering more than 5%. Follow-up needed."},
        {id: 'pl-c997-1', date: new Date('2025-06-10T10:00:00Z').toISOString(), type: 'Email', notes: 'Sent email about scheduling dashboard presentation.'},
        {id: 'pl-c997-2', date: new Date('2025-06-12T14:30:00Z').toISOString(), type: 'Call', notes: 'Brief call with Jay, mentioned he would check his calendar.'},
        {id: 'pl-c997-3', date: new Date('2025-06-11T14:00:00Z').toISOString(), type: 'Meeting', notes: "Met with Jay and Laurie Kiley. Dashboard well-received. Neider's salary increase approved, effective next pay period. Client confirmed preference for current weekly report format."}
    ],
    sop: { exists: true, lastUpdatedDate: new Date('2024-01-22T00:00:00Z').toISOString(), documentLink: 'sharepoint.com/sop/c997.pdf', format: 'Document' },
    kpiReporting: { frequency: 'Monthly', lastReportSentDate: new Date('2025-06-01T00:00:00Z').toISOString(), reportLocationLink: 'sharepoint.com/reports/c997/', clientPreferenceNotes: 'Prefers summary dashboard view, current format is good.' },
    sharepointFolderLink: 'sharepoint.com/clients/c997/',
    documentationChecklist: { accountInfo: true, kpiReports: true, hoApproval: true, sops: true },
    folderOrganizationStatus: 'Organized',
    emailLogs: []
  },
  {
    id: 'c1035', 
    name: 'Endredy Enterprises LLC dba Synergy HomeCare',
    status: ClientStatus.AT_RISK,
    tags: ['HomeCare', 'HR Issues', 'High Touch'],
    contactInfo: { email: 'lindamorales@synergyhomecare.com', phone: '(480) 377-6770', address: '', },
    notes: `POC: Linda Morales (Owner: Mike)\nSales Manager: Victor Arocho\nStart Date: September 12, 2023\nSeniority: 1.75 years\nSolversary: September 12\nSOP: Yes (Date: November 30, 2023)\nIdentifiable KPIs: Yes\nWBR Scheduled: Yes (Frequency: Bi Weekly, Day/Time: Cloudtalk)\nPhone System: Cloudtalk\nStatus Description: The relationship remains tense due to frustration from Mike (owner) and Linda (POC) over Juanita’s frequent leave requests. They have demanded direct approval of permissions and escalated the issue. Juanita’s leave report has been sent. A follow-up meeting was held; client is still wary but agreed to monitor for a month. Juanita’s performance (recruiting) is otherwise noted as strong, and she received a raise in December.`,
    assignedTeamMembers: ['solaj421', JUAN_BELCAZAR_PROFILE.id], 
    pulseLog: [],
    sop: { exists: true, lastUpdatedDate: new Date('2023-11-30T00:00:00Z').toISOString(), format: 'Document' },
    kpiReporting: { frequency: 'Client Declined Weekly', lastReportSentDate: new Date('2025-05-28T00:00:00Z').toISOString(), clientPreferenceNotes: "Client prefers direct communication over weekly reports currently due to ongoing issues." },
    sharepointFolderLink: 'sharepoint.com/clients/c1035/',
    documentationChecklist: { accountInfo: true, kpiReports: true, hoApproval: false, sops: true },
    folderOrganizationStatus: 'Organized',
    emailLogs: []
  },
  {
    id: 'c946', 
    name: 'Hyman & Hyman Synergy HomeCare of Sierra Vista',
    status: ClientStatus.HEALTHY,
    tags: ['HomeCare', 'SOP Development'],
    contactInfo: { email: 'kellyhyman@synergyhomecare.com', phone: '(520) 685-1035', address: '', },
    notes: `POC: Kelly Hyman, Barbie Knight, and Michael Hyman (Additional Emails: barbieknight@synergyhomecare.com, michaelhyman@synergyhomecare.com)\nSales Manager: Victor Arocho\nStart Date: July 17, 2023\nSeniority: 1.90 years\nSolversary: July 17\nSOP: No (Date: N/A) - In progress\nIdentifiable KPIs: Yes\nWBR Scheduled: Yes (Frequency: Monthly, Day/Time: Zoom)\nPhone System: Zoom\nStatus Description: Good relationship. SOP creation is underway with Juliana's assistance. Next WBR confirmed.`,
    assignedTeamMembers: ['solaj337'], 
    pulseLog: [],
    sop: { exists: false, lastUpdatedDate: undefined, documentLink: undefined, format: 'Not Set' },
    kpiReporting: { frequency: 'Monthly', lastReportSentDate: new Date('2025-06-03T00:00:00Z').toISOString(), reportLocationLink: 'sharepoint.com/reports/c946/', clientPreferenceNotes: "Prefers Zoom for WBRs." },
    sharepointFolderLink: 'sharepoint.com/clients/c946/',
    documentationChecklist: { accountInfo: true, kpiReports: true, hoApproval: true, sops: false },
    folderOrganizationStatus: 'Needs Review',
    emailLogs: []
  },
  {
    id: 'c860', 
    name: 'Just One Step LLC Synergy of Rockville MD',
    status: ClientStatus.HEALTHY, 
    tags: ['HomeCare', 'HR Coordination'],
    contactInfo: { email: 'robertmahar@synergyhomecare.com', phone: '(301) 200-9292', address: '', },
    notes: `POC: Robbie Mahar and Davina (Additional Emails: davinaphil@gmail.com)\nSales Manager: Victor Arocho\nStart Date: August 14, 2023\nSeniority: 1.83 years\nSolversary: August 14\nSOP: Yes (Date: November 7, 2023)\nIdentifiable KPIs: Yes\nWBR Scheduled: Yes (Frequency: Monthly, Day/Time: Snap mobile)\nPhone System: Snap mobile\nStatus Description: Client is satisfied with Silvana's HR coordination. Routine check-in scheduled. Juan Emilio to reach out (June 26, 2025).`,
    assignedTeamMembers: ['solaj969', JUAN_BELCAZAR_PROFILE.id], 
    pulseLog: [
      {id: 'pl-c860-new1', date: new Date('2025-06-25T10:00:00Z').toISOString(), type: 'Meeting', notes: "Internal discussion (Juan Emilio & Juan Sebastián): Plan to reach out to client for general check-in."},
      {id: 'pl-c860-1', date: new Date('2025-06-05T11:00:00Z').toISOString(), type: 'Call', notes: "Routine check-in call with Robbie Mahar. Expressed satisfaction with Silvana's work. No outstanding issues. Confirmed next monthly WBR via Snap mobile."}
    ],
    sop: { exists: true, lastUpdatedDate: new Date('2023-11-07T00:00:00Z').toISOString(), format: 'Document' },
    kpiReporting: { frequency: 'Monthly', reportLocationLink: 'sharepoint.com/reports/c860/', lastReportSentDate: new Date('2025-06-01T00:00:00Z').toISOString() },
    sharepointFolderLink: 'sharepoint.com/clients/c860/',
    documentationChecklist: { accountInfo: true, kpiReports: true, hoApproval: true, sops: true },
    folderOrganizationStatus: 'Organized',
    emailLogs: []
  },
  {
    id: 'c1868', 
    name: 'Synergy Homecare Franchising, LLC',
    status: ClientStatus.HEALTHY,
    tags: ['HomeCare', 'Franchising', 'Accounting'],
    contactInfo: { email: 'juliehalls@synergyhomecare.com', phone: '(208) 998-0834', address: '', },
    notes: `POC: Julie Halls\nSales Manager: Victor Arocho\nStart Date: November 21, 2024\nSeniority: 0.56 years\nSolversary: November 21\nSOP: No (Date: N/A)\nIdentifiable KPIs: Yes - Proposal sent\nWBR Scheduled: Yes (Frequency: Weekly, Day/Time: Zoom)\nPhone System: Zoom\nStatus Description: Strong relationship with Julie. KPI proposal for Christian sent and pending review. IT issue concerning Christian’s Microsoft authentication reported and escalated; resolution pending. Christian Adrián Klen Torres based in Peru.`,
    assignedTeamMembers: ['solas093', JUAN_BELCAZAR_PROFILE.id], 
    pulseLog: [],
    sop: { exists: false, format: 'Not Set' },
    kpiReporting: { frequency: 'Weekly', lastReportSentDate: new Date('2025-06-10T00:00:00Z').toISOString(), clientPreferenceNotes: "Julie prefers quick reporting, focused on efficiency metrics." },
    sharepointFolderLink: 'sharepoint.com/clients/c1868/',
    documentationChecklist: { accountInfo: true, kpiReports: false, hoApproval: false, sops: false },
    folderOrganizationStatus: 'Needs Review',
    emailLogs: []
  },
  {
    id: 'c1495', 
    name: 'Synergy HomeCare of Mendon',
    status: ClientStatus.HEALTHY, 
    tags: ['HomeCare', 'Recruitment Success'],
    contactInfo: { email: 'michaelbotelho@synergyhomecare.com', phone: '(401) 447-8982', address: '', },
    notes: `POC: Michael Botelho\nSales Manager: Victor Arocho\nStart Date: May 31, 2024\nSeniority: 1.03 years\nSolversary: May 31\nSOP: Yes (Date: August 6, 2024)\nIdentifiable KPIs: Yes\nWBR Scheduled: Yes (Frequency: Monthly, Day/Time: RingCentral)\nPhone System: RingCentral\nStatus Description: Excellent relationship. Mike (owner/POC) is proactive. Wendy’s $200 raise effective June 15 payroll confirmed. Last monthly meeting held, everything smooth.`,
    assignedTeamMembers: ['solan248', JUAN_BELCAZAR_PROFILE.id], 
    pulseLog: [],
    sop: { exists: true, lastUpdatedDate: new Date('2024-08-06T00:00:00Z').toISOString(), format: 'Document' }, 
    kpiReporting: { frequency: 'Monthly', lastReportSentDate: new Date('2025-06-05T00:00:00Z').toISOString(), reportLocationLink: 'sharepoint.com/reports/c1495/', clientPreferenceNotes: "Prefers one monthly meeting." },
    sharepointFolderLink: 'sharepoint.com/clients/c1495/',
    documentationChecklist: { accountInfo: true, kpiReports: true, hoApproval: true, sops: true },
    folderOrganizationStatus: 'Organized',
    emailLogs: []
  },
  {
    id: 'c1168', 
    name: 'Synergy Homecare of South Austin',
    status: ClientStatus.CRITICAL, 
    tags: ['HomeCare', 'Marketing Support', 'Risk of Churn'],
    contactInfo: { email: 'yammilegallegos@synergyhomecare.com', phone: '(512) 872-6116', address: '', },
    notes: `POC: Yammile Gallegos and Margaret Barba (Additional Emails: barbam@synergyhomecare.com)\nSales Manager: Victor Arocho\nStart Date: January 5, 2024\nSeniority: 1.45 years approx.\nSolversary: January 5\nSOP: Yes (Date: July 23, 2024)\nIdentifiable KPIs: Yes\nWBR Scheduled: Yes (Frequency: Monthly, Day/Time: Cloudtalk)\nPhone System: Cloudtalk\nStatus Description: Status is positive but urgent. Jamile struggling with low client hours, pivoting to part-time caregiver roles. Marketing plan in progress. Meeting held June 13 to discuss marketing, Mariana’s vacation, and KPIs. Risk of contract termination if client numbers do not improve. Marketing phase one (Social Media) launched, phase two (Domain) pending. Juan Emilio to reach out (June 26, 2025).`,
    assignedTeamMembers: ['solan772', 'solak310', JUAN_BELCAZAR_PROFILE.id], 
    pulseLog: [
        {id: 'pl-c1168-new1', date: new Date('2025-06-25T10:00:00Z').toISOString(), type: 'Meeting', notes: "Internal discussion (Juan Emilio & Juan Sebastián): Plan to reach out to client for general check-in and marketing support discussion."},
        {id: 'pl-c1168-1', date: new Date('2025-06-13T11:00:00Z').toISOString(), type: 'Meeting', notes: "Meeting with Jamile Gallegos. Presented phase 1 marketing results (Social Media). Discussed Mariana's vacation coverage. Agreed on initial set of KPIs for new part-time focus. Client cautiously optimistic but emphasized urgency for results. Discussed domain purchase for phase 2."}
    ],
    sop: { exists: true, lastUpdatedDate: new Date('2024-07-23T00:00:00Z').toISOString(), format: 'Video' }, 
    kpiReporting: { frequency: 'Monthly', lastReportSentDate: new Date('2025-06-15T00:00:00Z').toISOString(), 
      clientPreferenceNotes: "Requires frequent updates on marketing efforts and lead generation." },
    sharepointFolderLink: 'sharepoint.com/clients/c1168/',
    documentationChecklist: { accountInfo: true, kpiReports: true, hoApproval: false, sops: true },
    folderOrganizationStatus: 'Needs Review',
    emailLogs: []
  },
  {
    id: 'c1293', 
    name: 'SYNERGY HomeCare of Yuma',
    status: ClientStatus.HEALTHY, 
    tags: ['HomeCare', 'New Team Assigned'],
    contactInfo: { email: 'rob@yumahomecare.com', phone: '(928) 817-7172', address: '1405 W 16th Street, Yuma, AZ', },
    notes: `POC: Rob Dunn and Mayra Santiago (Additional Emails: mayra@yumahomecare.com)\nSales Manager: Victor Arocho\nStart Date: February 20, 2024\nSeniority: 1.31 years\nSolversary: February 20\nSOP: Yes (Date: August 14, 2023)\nIdentifiable KPIs: Yes - To be set with client\nWBR Scheduled: Yes (Frequency: Monthly, Day/Time: First Tuesday of the month (1:00 PM CST))\nPhone System: RingCentral\nStatus Description: Met with Rob Dunn to introduce new team (Lizeth - Recruiter/HR and Ricardo - Marketing Assistant). Discussed initial expectations and plan to set KPIs in next meeting. Client seems positive about new support.`,
    assignedTeamMembers: ['solam272', 'solam977', JUAN_BELCAZAR_PROFILE.id], 
    pulseLog: [],
    sop: { exists: true, lastUpdatedDate: new Date('2023-08-14T00:00:00Z').toISOString(), format: 'Document' },
    kpiReporting: { frequency: 'Monthly', lastReportSentDate: new Date('2025-06-04T00:00:00Z').toISOString(), reportLocationLink: 'sharepoint.com/reports/c1293/', clientPreferenceNotes: "First Tuesday of month for WBR." },
    sharepointFolderLink: 'sharepoint.com/clients/c1293/',
    documentationChecklist: { accountInfo: true, kpiReports: true, hoApproval: true, sops: true },
    folderOrganizationStatus: 'Organized',
    emailLogs: []
  },
  {
    id: 'c1250', 
    name: 'Synergy of Fredericksburg VA', 
    status: ClientStatus.CRITICAL, 
    tags: ['HomeCare', 'Shared Resource Issue', 'Resignation Impact'],
    contactInfo: { email: 'beataalghabra@synergyhomecare.com', phone: '(571) 752-2991', address: '', },
    notes: `POC: Beata Alghabra and Jalal Alghabra (Additional Emails: jalalalghabra@synergyhomecare.com)\nSales Manager: Victor Arocho\nStart Date: January 25, 2024\nSeniority: 1.38 years\nSolversary: January 25\nSOP: Yes (Date: May 27, 2024)\nIdentifiable KPIs: Yes\nWBR Scheduled: Yes (Frequency: Bi-Weekly, Day/Time: Cloudtalk)\nPhone System: Cloudtalk\nStatus Description: Relationship is tense. Mariana Peña (solam122), a shared resource, has resigned (last day June 26, 2025). Client previously felt they were not getting enough dedicated time. Urgent need to manage replacement and communication. Billing to be stopped from Mariana's last day.`,
    assignedTeamMembers: [EMILIO_ALVEAR_PROFILE.id], // Emilio is handling this based on tasks
    pulseLog: [
      {id: 'pl-c1250-new1', date: new Date('2025-06-25T10:00:00Z').toISOString(), type: 'Meeting', notes: "Internal discussion (Juan Emilio & Juan Sebastián): Mariana (shared resource) resigned. Last day June 26. Beata needs immediate solution. Plan to email options: share new person or find dedicated resource. Billing to stop."},
      {id: 'pl-c1250-1', date: new Date('2025-06-12T15:00:00Z').toISOString(), type: 'Call', notes: "Call with Beata Alghabra. Expressed strong concerns about Mariana's availability and impact. Explained shared resource model and assured her of dedicated focus during allocated times. Scheduled a follow-up to review specific tasks and outcomes next week."}
    ],
    sop: { exists: true, lastUpdatedDate: new Date('2024-05-27T00:00:00Z').toISOString(), format: 'Template' },
    kpiReporting: { frequency: 'Client Declined Weekly', lastReportSentDate: new Date('2025-06-03T00:00:00Z').toISOString(), clientPreferenceNotes: "Wants direct updates due to concerns, bi-weekly calls are key. Will not be charged for service from Mariana's last day until replacement starts." },
    sharepointFolderLink: 'sharepoint.com/clients/c1250/',
    documentationChecklist: { accountInfo: true, kpiReports: true, hoApproval: true, sops: true },
    folderOrganizationStatus: 'Organized',
    emailLogs: []
  },
  {
    id: 'c1259', 
    name: 'Toledo Home Care Company dba Synergy HomeCare',
    status: ClientStatus.HEALTHY, 
    tags: ['HomeCare', 'Stable Account', 'Recruitment'],
    contactInfo: { email: 'toddleonard@synergyhomecare.com', phone: '(419) 220-5002', address: '', },
    notes: `POC: Todd Leonard\nSales Manager: Victor Arocho\nStart Date: February 18, 2024\nSeniority: 1.32 years\nSolversary: February 18\nSOP: Yes (Date: April 22, 2024)\nIdentifiable KPIs: Yes\nWBR Scheduled: Yes (Frequency: Monthly, Day/Time: Last Friday of the month (7:00 AM CST))\nPhone System: Mobile connect\nStatus Description: Account is stable. Routine WBR conducted. Client satisfied with Melanie's performance. Angelica Maria Santana Coronado (solae075) added as Recruiter.`,
    assignedTeamMembers: ['solam156', 'solae075'], 
    pulseLog: [],
    sop: { exists: true, lastUpdatedDate: new Date('2024-04-22T00:00:00Z').toISOString(), format: 'Document' },
    kpiReporting: { frequency: 'Monthly', lastReportSentDate: new Date('2025-05-31T00:00:00Z').toISOString(), reportLocationLink: 'sharepoint.com/reports/c1259/', clientPreferenceNotes: "Last Friday of month for WBR." },
    sharepointFolderLink: 'sharepoint.com/clients/c1259/',
    documentationChecklist: { accountInfo: true, kpiReports: true, hoApproval: true, sops: true },
    folderOrganizationStatus: 'Organized',
    emailLogs: []
  },
  {
    id: 'c468', 
    name: 'Weama LLC dba SYNERGY HomeCare',
    status: ClientStatus.HEALTHY, 
    tags: ['HomeCare', 'Long Term Client', 'SOP Needed'],
    contactInfo: { email: 'weamakassem@synergyhomecare.com', phone: '(405) 254-3046', address: '', },
    notes: `POC: Weama Kassem, Faisal Saheli, and Dari Montebon (Additional Emails: faisalsaheli@synergyhomecare.com, darimontebon@synergyhomecare.com)\nSales Manager: Victor Arocho\nStart Date: June 9, 2022\nSeniority: 3.01 years\nSolversary: June 9\nSOP: No (Date: N/A) - To be discussed\nIdentifiable KPIs: Yes\nWBR Scheduled: Yes (Frequency: Monthly, Day/Time: Zoom)\nPhone System: Zoom\nStatus Description: Long-term client, generally stable. SOP creation needs to be prioritized for this account. Angelica (solae075) was performing well as Scheduler, but has been reassigned as Recruiter to Toledo account. Scheduling coverage needs review.`,
    assignedTeamMembers: [], 
    pulseLog: [],
    sop: { exists: false, format: 'Not Set' },
    kpiReporting: { frequency: 'Monthly', lastReportSentDate: new Date('2025-06-07T00:00:00Z').toISOString(), reportLocationLink: 'sharepoint.com/reports/c468/' },
    sharepointFolderLink: 'sharepoint.com/clients/c468/',
    documentationChecklist: { accountInfo: true, kpiReports: true, hoApproval: true, sops: false }, 
    folderOrganizationStatus: 'Needs Review',
    emailLogs: []
  },
  {
    id: 'c2551', 
    name: 'SYNERGY HomeCare of Cape May Court House',
    status: ClientStatus.HEALTHY, 
    tags: ['HomeCare', 'New Account Setup'],
    contactInfo: { email: 'dennis@shcsouthjersey.com', phone: '', address: '', },
    notes: `POC: Dennis\nSales Manager: Victor Arocho (assumed)\nStart Date: N/A - Recently Onboarded May 2025\nSeniority: N/A - <1 month\nSolversary: N/A\nSOP: N/A (Date: N/A) - To be created\nIdentifiable KPIs: N/A - To be defined\nWBR Scheduled: N/A (Frequency: N/A, Day/Time: N/A) - To be scheduled\nPhone System: N/A\nStatus Description: New client, onboarding Angie (solau089). Initial setup phase. Need to define SOP, KPIs, and WBR schedule.`,
    assignedTeamMembers: ['solau089', JUAN_BELCAZAR_PROFILE.id], 
    pulseLog: [],
    sop: { exists: false, format: 'Not Set' },
    kpiReporting: { frequency: 'As Requested', clientPreferenceNotes: "WBR schedule and KPI reporting to be defined post-onboarding." },
    sharepointFolderLink: 'sharepoint.com/clients/c2551_capemay/', 
    documentationChecklist: { accountInfo: false, kpiReports: false, hoApproval: false, sops: false },
    folderOrganizationStatus: 'Not Set',
    emailLogs: []
  },
  {
    id: 'c2552', 
    name: 'Synergy of Apollo Beach',
    status: ClientStatus.HEALTHY, 
    tags: ['HomeCare', 'Information Needed'],
    contactInfo: { email: '', phone: '', address: '', },
    notes: `POC: N/A\nSales Manager: N/A\nStart Date: N/A\nSeniority: N/A\nSolversary: N/A\nSOP: N/A (Date: N/A)\nIdentifiable KPIs: N/A\nWBR Scheduled: N/A (Frequency: N/A, Day/Time: N/A)\nPhone System: N/A\nStatus Description: This account is listed as one of the "remaining accounts" to be covered. No detailed status, employees, KPIs, tasks, follow-ups, or action plan are provided. Need to gather all information.`,
    assignedTeamMembers: [JUAN_BELCAZAR_PROFILE.id, 'solam122'], 
    pulseLog: [],
    sop: { exists: false, format: 'Not Set' },
    kpiReporting: { frequency: 'As Requested' },
    sharepointFolderLink: '',
    documentationChecklist: { accountInfo: false, kpiReports: false, hoApproval: false, sops: false },
    folderOrganizationStatus: 'Not Set',
    emailLogs: []
  },
  { 
    id: 'c3000',
    name: 'Crowdfunding Agency (Details TBD)',
    status: ClientStatus.HEALTHY, 
    tags: ['Crowdfunding', 'Data Accuracy Issue', 'Dashboard Presented'],
    contactInfo: { email: 'tbd@crowdfunding.com', phone: 'N/A', address: 'N/A' },
    notes: "POC: TBD\nSales Manager: TBD\nStart Date: TBD\nStatus Description: Dashboard presented. Client wasn't very impressed due to inaccurate data provided by them (internal disconnect between recruiter, scheduler, hiring manager). JSB updated applicant numbers, but client didn't update hires, skewing conversion rates. Client saw tool's potential if they organize internally.",
    assignedTeamMembers: [JUAN_BELCAZAR_PROFILE.id], 
    pulseLog: [
      { id: 'pl-c3000-1', date: new Date('2025-06-25T10:00:00Z').toISOString(), type: 'Meeting', notes: "Dashboard presentation. Client had data accuracy issues (internal disconnect: recruiter/scheduler/hiring manager). Client saw potential of tool if they get organized." }
    ],
    sop: { exists: false, format: 'Not Set' },
    kpiReporting: { frequency: 'Not Set' },
    sharepointFolderLink: '',
    documentationChecklist: { accountInfo: false, kpiReports: false, hoApproval: false, sops: false },
    folderOrganizationStatus: 'Not Set',
    emailLogs: [],
  }
];

const dashboardTasksDueDate = new Date('2025-07-10T00:00:00Z').toISOString();
const dashboardTasksForClients: Task[] = INITIAL_CLIENTS.map(client => ({
  id: `task_dashboard_${client.id}`,
  title: `Create KPI Dashboard for ${client.name}`,
  description: `Develop and present a comprehensive KPI dashboard for ${client.name} to track key performance metrics and provide actionable insights.`,
  status: TaskStatus.COMPLETED, // Marked as completed as per user request
  dueDate: dashboardTasksDueDate,
  assignedTo: JUAN_BELCAZAR_PROFILE.name,
  clientId: client.id,
  priority: TaskPriority.MEDIUM,
  elapsedTimeSeconds: 0,
}));

// New User Requested Tasks
const attendanceTaskDueDate = new Date('2025-06-27T00:00:00Z').toISOString(); // This Friday (assuming today is ~June 25, 2025)
const kpiFilesTaskDueDate = new Date('2025-06-26T00:00:00Z').toISOString(); // Tomorrow
const juneClosureEmailDueDate = new Date('2025-06-28T00:00:00Z').toISOString(); // 3 days from ~June 25

const junePerformanceClosureTasks: Task[] = INITIAL_CLIENTS.map(client => ({
  id: `task_jun_closure_${client.id}`,
  title: `Send June Performance Closure Email to ${client.name}`,
  description: `Draft and send an email to ${client.name} summarizing their performance for June. Include key achievements, KPI results, and any relevant notes for the month's closure.`,
  status: TaskStatus.PENDING,
  dueDate: juneClosureEmailDueDate,
  assignedTo: JUAN_BELCAZAR_PROFILE.name,
  clientId: client.id,
  priority: TaskPriority.MEDIUM,
  elapsedTimeSeconds: 0,
}));


export const INITIAL_TASKS: Task[] = [
  { id: 'task_c997_1', title: 'Schedule an urgent meeting to present the dashboard.', description: 'Present dashboard tracking applicants, calls, texts, interviews, and hires.', status: TaskStatus.COMPLETED, dueDate: new Date('2025-06-13T00:00:00Z').toISOString(), assignedTo: JUAN_BELCAZAR_PROFILE.name, clientId: 'c997', priority: TaskPriority.HIGH, elapsedTimeSeconds: 3665 },
  { id: 'task_c997_2', title: 'Finalize Neider’s 5% salary increase.', description: 'Discuss and finalize Neider Andres Romero Vargas 5% salary increase as per contract clause.', status: TaskStatus.COMPLETED, dueDate: new Date('2025-06-15T00:00:00Z').toISOString(), assignedTo: JUAN_BELCAZAR_PROFILE.name, clientId: 'c997', priority: TaskPriority.MEDIUM, elapsedTimeSeconds: 1200 },
  { id: 'task_c997_3', title: 'Confirm the client’s preferred weekly report format.', description: 'Clarify preferred format for weekly reports.', status: TaskStatus.COMPLETED, dueDate: new Date('2025-06-20T00:00:00Z').toISOString(), assignedTo: JUAN_BELCAZAR_PROFILE.name, clientId: 'c997', priority: TaskPriority.LOW, elapsedTimeSeconds: 0 },
  { id: 'task_c997_f1', title: 'Follow-up email to POC for meeting.', description: 'Send a follow-up email to Jay Kiley/Laurie Kiley to schedule the dashboard presentation meeting.', status: TaskStatus.COMPLETED, dueDate: new Date('2025-06-05T00:00:00Z').toISOString(), assignedTo: JUAN_BELCAZAR_PROFILE.name, clientId: 'c997', priority: TaskPriority.HIGH, elapsedTimeSeconds: 0 },
  { id: 'task_c997_f2', title: 'Document Neider\'s raise approval status.', description: 'Update records with the approval status of Neider\'s 5% salary increase.', status: TaskStatus.COMPLETED, dueDate: new Date('2025-06-12T00:00:00Z').toISOString(), assignedTo: JUAN_BELCAZAR_PROFILE.name, clientId: 'c997', priority: TaskPriority.MEDIUM, elapsedTimeSeconds: 0 },
  
  { id: 'task_c1035_1', title: 'Compile Juanita\'s leave report since last year.', description: 'Include permissions and early outs in Juanita Restrepo Martinez\'s leave report.', status: TaskStatus.COMPLETED, dueDate: new Date('2025-06-03T00:00:00Z').toISOString(), assignedTo: JUAN_BELCAZAR_PROFILE.name, clientId: 'c1035', priority: TaskPriority.HIGH, elapsedTimeSeconds: 0 }, 
  { id: 'task_c1035_2', title: 'Schedule call to rebuild trust with Mike and Linda.', description: 'Address concerns regarding Juanita\'s leave and aim to rebuild trust.', status: TaskStatus.COMPLETED, dueDate: new Date('2025-06-10T00:00:00Z').toISOString(), assignedTo: JUAN_BELCAZAR_PROFILE.name, clientId: 'c1035', priority: TaskPriority.HIGH, elapsedTimeSeconds: 0 }, 
  { id: 'task_c1035_f1', title: 'Email the leave report to Mike/Linda.', description: 'Send the compiled leave report for Juanita to Mike and Linda.', status: TaskStatus.COMPLETED, dueDate: new Date('2025-06-03T00:00:00Z').toISOString(), assignedTo: JUAN_BELCAZAR_PROFILE.name, clientId: 'c1035', priority: TaskPriority.MEDIUM, elapsedTimeSeconds: 0 },
  { id: 'task_c1035_f2', title: 'Escalate the permission issue to the boss.', description: 'Inform management about the client\'s demand for direct approval of permissions.', status: TaskStatus.COMPLETED, dueDate: new Date('2025-06-04T00:00:00Z').toISOString(), assignedTo: JUAN_BELCAZAR_PROFILE.name, clientId: 'c1035', priority: TaskPriority.HIGH, elapsedTimeSeconds: 0 }, 
  { id: 'task_c1035_3', title: 'Monitor Juanita\'s attendance and client feedback (Endredy).', description: 'Closely monitor Juanita\'s adherence to schedule and gather client feedback for the next month.', status: TaskStatus.COMPLETED, dueDate: new Date('2025-07-10T00:00:00Z').toISOString(), assignedTo: JUAN_BELCAZAR_PROFILE.name, clientId: 'c1035', priority: TaskPriority.HIGH, elapsedTimeSeconds: 0 },

  { id: 'task_c1868_1', title: 'Send a KPI proposal to Julie.', description: 'Propose KPIs for Christian Adrian Seclen Torres, focusing on quick reporting.', status: TaskStatus.COMPLETED, dueDate: new Date('2025-06-05T00:00:00Z').toISOString(), assignedTo: JUAN_BELCAZAR_PROFILE.name, clientId: 'c1868', priority: TaskPriority.MEDIUM, elapsedTimeSeconds: 0 }, 
  { id: 'task_c1868_2', title: 'Escalate Christian\'s IT authentication issue.', description: 'Report Microsoft authentication issue for Christian to the IT team.', status: TaskStatus.COMPLETED, dueDate: new Date('2025-06-14T00:00:00Z').toISOString(), assignedTo: JUAN_BELCAZAR_PROFILE.name, clientId: 'c1868', priority: TaskPriority.HIGH, elapsedTimeSeconds: 0 },
  { id: 'task_c1868_3', title: 'Gather Christian’s performance metrics.', description: 'Collect performance data for Christian (e.g., invoice processing, accuracy).', status: TaskStatus.COMPLETED, dueDate: new Date('2025-06-16T00:00:00Z').toISOString(), assignedTo: JUAN_BELCAZAR_PROFILE.name, clientId: 'c1868', priority: TaskPriority.LOW, elapsedTimeSeconds: 0 },
  { id: 'task_c1868_f1', title: 'Email KPI proposal to Julie.', description: 'Send the drafted KPI proposal to Julie Halls.', status: TaskStatus.COMPLETED, dueDate: new Date('2025-06-05T00:00:00Z').toISOString(), assignedTo: JUAN_BELCAZAR_PROFILE.name, clientId: 'c1868', priority: TaskPriority.MEDIUM, elapsedTimeSeconds: 0 },
  { id: 'task_c1868_f2', title: 'Follow up with IT on authentication fix for Christian.', description: 'Check status of Christian\'s Microsoft authentication issue with the IT team.', status: TaskStatus.COMPLETED, dueDate: new Date('2025-06-17T00:00:00Z').toISOString(), assignedTo: JUAN_BELCAZAR_PROFILE.name, clientId: 'c1868', priority: TaskPriority.MEDIUM, elapsedTimeSeconds: 0 },

  { id: 'task_c1495_1', title: 'Confirm Wendy’s $200 raise is processed.', description: 'Verify that Wendy Gissella Rodriguez Sanchez\'s $200 raise is reflected by June 15 payroll.', status: TaskStatus.COMPLETED, dueDate: new Date('2025-06-15T00:00:00Z').toISOString(), assignedTo: JUAN_BELCAZAR_PROFILE.name, clientId: 'c1495', priority: TaskPriority.HIGH, elapsedTimeSeconds: 0 },
  { id: 'task_c1495_2', title: 'Schedule the next monthly meeting with Mike Botelho.', description: 'Plan the next monthly review meeting for July.', status: TaskStatus.COMPLETED, dueDate: new Date('2025-06-25T00:00:00Z').toISOString(), assignedTo: JUAN_BELCAZAR_PROFILE.name, clientId: 'c1495', priority: TaskPriority.MEDIUM, elapsedTimeSeconds: 0 },
  { id: 'task_c1495_f1', title: 'Email Mike to confirm Wendy\'s raise.', description: 'Send confirmation email to Michael Botelho regarding Wendy\'s raise.', status: TaskStatus.COMPLETED, dueDate: new Date('2025-06-02T00:00:00Z').toISOString(), assignedTo: JUAN_BELCAZAR_PROFILE.name, clientId: 'c1495', priority: TaskPriority.MEDIUM, elapsedTimeSeconds: 0 }, 
  { id: 'task_c1495_f2', title: 'Plan the next meeting agenda for July WBR.', description: 'Prepare agenda for the next monthly meeting with Michael Botelho.', status: TaskStatus.COMPLETED, dueDate: new Date('2025-06-28T00:00:00Z').toISOString(), assignedTo: JUAN_BELCAZAR_PROFILE.name, clientId: 'c1495', priority: TaskPriority.LOW, elapsedTimeSeconds: 0 },

  { id: 'task_c1168_1', title: 'Prepare marketing plan presentation.', description: 'Include domain and SEO strategy for meeting with Jamile Gallegos.', status: TaskStatus.COMPLETED, dueDate: new Date('2025-06-12T00:00:00Z').toISOString(), assignedTo: JUAN_BELCAZAR_PROFILE.name, clientId: 'c1168', priority: TaskPriority.HIGH, elapsedTimeSeconds: 0 },
  { id: 'task_c1168_2', title: 'Discuss Mariana’s vacation (July 7–11).', description: 'Address Mariana Marcela Arevalo Gutierrez\'s vacation plans during the meeting.', status: TaskStatus.COMPLETED, dueDate: new Date('2025-06-13T00:00:00Z').toISOString(), assignedTo: JUAN_BELCAZAR_PROFILE.name, clientId: 'c1168', priority: TaskPriority.MEDIUM, elapsedTimeSeconds: 0 },
  { id: 'task_c1168_3', title: 'Set KPIs with Jamile.', description: 'Define and agree on Key Performance Indicators with Jamile Gallegos.', status: TaskStatus.COMPLETED, dueDate: new Date('2025-06-13T00:00:00Z').toISOString(), assignedTo: JUAN_BELCAZAR_PROFILE.name, clientId: 'c1168', priority: TaskPriority.HIGH, elapsedTimeSeconds: 0 },
  { id: 'task_c1168_f1', title: 'Send meeting agenda to Jamile.', description: 'Email agenda for June 13 meeting to Jamile Gallegos.', status: TaskStatus.COMPLETED, dueDate: new Date('2025-06-10T00:00:00Z').toISOString(), assignedTo: JUAN_BELCAZAR_PROFILE.name, clientId: 'c1168', priority: TaskPriority.MEDIUM, elapsedTimeSeconds: 0 }, 
  { id: 'task_c1168_f2', title: 'Confirm Mariana\'s vacation approval.', description: 'Follow up and document approval for Mariana\'s vacation post-meeting.', status: TaskStatus.COMPLETED, dueDate: new Date('2025-06-14T00:00:00Z').toISOString(), assignedTo: JUAN_BELCAZAR_PROFILE.name, clientId: 'c1168', priority: TaskPriority.LOW, elapsedTimeSeconds: 0 },
  { id: 'task_c1168_4', title: 'Implement Phase 2 Marketing (Domain Setup) for South Austin.', description: 'Purchase domain and set up redirection for Synergy Homecare of South Austin as discussed.', status: TaskStatus.COMPLETED, dueDate: new Date('2025-06-20T00:00:00Z').toISOString(), assignedTo: JUAN_BELCAZAR_PROFILE.name, clientId: 'c1168', priority: TaskPriority.HIGH, elapsedTimeSeconds: 0 },

  { id: 'task_c1293_1', title: 'Identify the POC and confirm client expectations.', description: 'Clarify main point of contact and specific expectations for SYNERGY HomeCare of Yuma.', status: TaskStatus.COMPLETED, dueDate: new Date('2025-06-14T00:00:00Z').toISOString(), assignedTo: JUAN_BELCAZAR_PROFILE.name, clientId: 'c1293', priority: TaskPriority.MEDIUM, elapsedTimeSeconds: 0 },
  { id: 'task_c1293_2', title: 'Set KPIs with Yuma client.', description: 'Discuss and establish KPIs for Lizeth Molina (Recruiter/HR) and Ricardo Garzon (Marketing Specialist) during next WBR.', status: TaskStatus.COMPLETED, dueDate: new Date('2025-07-02T00:00:00Z').toISOString(), assignedTo: JUAN_BELCAZAR_PROFILE.name, clientId: 'c1293', priority: TaskPriority.HIGH, elapsedTimeSeconds: 0 }, 
  { id: 'task_c1293_3', title: 'Gather Lizeth and Ricardo’s performance metrics.', description: 'Collect initial performance data for Lizeth Molina and Ricardo Garzon.', status: TaskStatus.COMPLETED, dueDate: new Date('2025-06-28T00:00:00Z').toISOString(), assignedTo: JUAN_BELCAZAR_PROFILE.name, clientId: 'c1293', priority: TaskPriority.LOW, elapsedTimeSeconds: 0 },
  { id: 'task_c1293_f1', title: 'Email POC for KPI discussion.', description: 'Contact Rob Dunn/Mayra Santiago to schedule a meeting for KPI discussion.', status: TaskStatus.COMPLETED, dueDate: new Date('2025-06-12T00:00:00Z').toISOString(), assignedTo: JUAN_BELCAZAR_PROFILE.name, clientId: 'c1293', priority: TaskPriority.MEDIUM, elapsedTimeSeconds: 0 }, 
  { id: 'task_c1293_f2', title: 'Collect performance metrics for Yuma team.', description: 'Gather performance metrics for Lizeth and Ricardo.', status: TaskStatus.COMPLETED, dueDate: new Date('2025-06-25T00:00:00Z').toISOString(), assignedTo: JUAN_BELCAZAR_PROFILE.name, clientId: 'c1293', priority: TaskPriority.MEDIUM, elapsedTimeSeconds: 0 },
  
  { id: 'task_c946_1', title: 'Collaborate on SOP documentation for Sierra Vista.', description: 'Work with Juliana and client (Kelly/Barbie) to document key processes for the SOP.', status: TaskStatus.COMPLETED, dueDate: new Date('2025-06-30T00:00:00Z').toISOString(), assignedTo: 'Juliana Tarquino Martinez', clientId: 'c946', priority: TaskPriority.MEDIUM, elapsedTimeSeconds: 0 },
  
  { id: 'task_c1250_1', title: 'Address Mariana Peña\'s resignation with Fredericksburg.', description: 'Communicate resignation, stop billing, and present replacement options to Beata Alghabra.', status: TaskStatus.COMPLETED, dueDate: new Date('2025-06-27T00:00:00Z').toISOString(), assignedTo: EMILIO_ALVEAR_PROFILE.name, clientId: 'c1250', priority: TaskPriority.HIGH, elapsedTimeSeconds: 0 },
  
  { id: 'task_c468_1', title: 'Draft initial SOP for Weama LLC.', description: 'Angelica Santana to draft the initial scheduling and operational SOP for Weama LLC.', status: TaskStatus.COMPLETED, dueDate: new Date('2025-06-21T00:00:00Z').toISOString(), assignedTo: 'Angelica Maria Santana Coronado', clientId: 'c468', priority: TaskPriority.MEDIUM, elapsedTimeSeconds: 0 },
  { id: 'task_c2551_1', title: 'Define SOP, KPIs, WBR for Cape May.', description: 'Work with Dennis and Angie to establish SOP, initial KPIs, and WBR schedule for new client.', status: TaskStatus.COMPLETED, dueDate: new Date('2025-06-28T00:00:00Z').toISOString(), assignedTo: JUAN_BELCAZAR_PROFILE.name, clientId: 'c2551', priority: TaskPriority.HIGH, elapsedTimeSeconds: 0 },
  { id: 'task_c2552_1', title: 'Gather info for Apollo Beach account.', description: 'Follow up with Sales for POC and onboarding details for Synergy of Apollo Beach.', status: TaskStatus.COMPLETED, dueDate: new Date('2025-06-17T00:00:00Z').toISOString(), assignedTo: JUAN_BELCAZAR_PROFILE.name, clientId: 'c2552', priority: TaskPriority.MEDIUM, elapsedTimeSeconds: 0 },
  
  // New Tasks from Transcript
  { id: 'task_transcript_1', title: 'Follow up with Fairfield (c997) on Neider\'s increase proposal.', description: 'Client asked for a day on June 19th to evaluate offering more than 5%. Follow up.', status: TaskStatus.COMPLETED, dueDate: new Date('2025-06-26T00:00:00Z').toISOString(), assignedTo: EMILIO_ALVEAR_PROFILE.name, clientId: 'c997', priority: TaskPriority.MEDIUM, elapsedTimeSeconds: 0 },
  { id: 'task_transcript_2', title: 'Get approval from Andrea/Daniel for Beata/Sheila email plan.', description: 'Seek internal approval for the proposed email to Beata (c1250) and Sheila (Client TBD) regarding Mariana\'s replacement.', status: TaskStatus.COMPLETED, dueDate: new Date('2025-06-26T00:00:00Z').toISOString(), assignedTo: EMILIO_ALVEAR_PROFILE.name, clientId: null, priority: TaskPriority.HIGH, elapsedTimeSeconds: 0 },
  { id: 'task_transcript_3', title: 'Send email to Beata (c1250) & Sheila (Client TBD) with replacement options.', description: 'Outline options: shared resource (concurrent interview) or dedicated resources.', status: TaskStatus.COMPLETED, dueDate: new Date('2025-06-27T00:00:00Z').toISOString(), assignedTo: EMILIO_ALVEAR_PROFILE.name, clientId: 'c1250', priority: TaskPriority.HIGH, elapsedTimeSeconds: 0 },
  { id: 'task_transcript_4', title: 'Submit resignation report for Mariana Peña (solam122).', description: 'Process official resignation for Mariana, last day June 26, 2025.', status: TaskStatus.COMPLETED, dueDate: new Date('2025-06-26T00:00:00Z').toISOString(), assignedTo: JUAN_BELCAZAR_PROFILE.name, clientId: null, priority: TaskPriority.HIGH, elapsedTimeSeconds: 0 },
  { id: 'task_transcript_5', title: 'Notify Billing to stop charges for c1250 & Sheila\'s Client.', description: 'Inform billing department to cease charges for services provided by Mariana from June 26, 2025 onwards for c1250 and Sheila\'s client account.', status: TaskStatus.COMPLETED, dueDate: new Date('2025-06-26T00:00:00Z').toISOString(), assignedTo: EMILIO_ALVEAR_PROFILE.name, clientId: 'c1250', priority: TaskPriority.HIGH, elapsedTimeSeconds: 0 },
  { id: 'task_transcript_6', title: 'Reach out to Soto Austin (c1168).', description: 'General follow-up or check-in with client Soto Austin.', status: TaskStatus.COMPLETED, dueDate: new Date('2025-06-26T00:00:00Z').toISOString(), assignedTo: EMILIO_ALVEAR_PROFILE.name, clientId: 'c1168', priority: TaskPriority.MEDIUM, elapsedTimeSeconds: 0 },
  { id: 'task_transcript_7', title: 'Reach out to Just One Step (c860).', description: 'General follow-up or check-in with client Just One Step.', status: TaskStatus.COMPLETED, dueDate: new Date('2025-06-26T00:00:00Z').toISOString(), assignedTo: EMILIO_ALVEAR_PROFILE.name, clientId: 'c860', priority: TaskPriority.MEDIUM, elapsedTimeSeconds: 0 },
  { id: 'task_transcript_8', title: 'Complete personnel master spreadsheet.', description: 'Emilio Alvear to finalize his master table with all personnel names, roles, and pricing.', status: TaskStatus.COMPLETED, dueDate: new Date('2025-07-05T00:00:00Z').toISOString(), assignedTo: EMILIO_ALVEAR_PROFILE.name, clientId: null, priority: TaskPriority.LOW, elapsedTimeSeconds: 0 },
  { id: 'task_transcript_9', title: 'Investigate Zoom migration for internal team meetings.', description: 'Juan Belalcázar to explore advantages and feasibility of moving internal meetings from Teams to Zoom.', status: TaskStatus.COMPLETED, dueDate: new Date('2025-07-12T00:00:00Z').toISOString(), assignedTo: JUAN_BELCAZAR_PROFILE.name, clientId: null, priority: TaskPriority.LOW, elapsedTimeSeconds: 0 },
  { id: 'task_transcript_10', title: 'Gather full details for "Crowdfunding Agency" client (c3000).', description: 'Collect POC, contact info, service scope, etc., for the new client.', status: TaskStatus.COMPLETED, dueDate: new Date('2025-07-05T00:00:00Z').toISOString(), assignedTo: JUAN_BELCAZAR_PROFILE.name, clientId: 'c3000', priority: TaskPriority.MEDIUM, elapsedTimeSeconds: 0 },
  { id: 'task_transcript_11', title: 'Identify Sheila\'s client account and update re: Mariana\'s resignation.', description: 'Determine which client account Sheila manages (shared Mariana) and apply necessary updates regarding resignation and replacement.', status: TaskStatus.COMPLETED, dueDate: new Date('2025-06-28T00:00:00Z').toISOString(), assignedTo: JUAN_BELCAZAR_PROFILE.name, clientId: null, priority: TaskPriority.HIGH, elapsedTimeSeconds: 0 },
  
  // User Requested Tasks
  { 
    id: 'task_user_attendance', 
    title: 'Complete Weekly Attendance File', 
    description: 'Update and finalize the weekly attendance records for all team members. This is a recurring weekly task.', 
    status: TaskStatus.PENDING, 
    dueDate: attendanceTaskDueDate, 
    assignedTo: JUAN_BELCAZAR_PROFILE.name, 
    clientId: null, 
    priority: TaskPriority.HIGH,
    elapsedTimeSeconds: 0,
  },
  { 
    id: 'task_user_kpi_files', 
    title: 'Prepare Weekly KPI Files', 
    description: 'Compile, verify, and distribute the weekly KPI reports for all relevant clients. This is an URGENT recurring weekly task.', 
    status: TaskStatus.PENDING, 
    dueDate: kpiFilesTaskDueDate, 
    assignedTo: JUAN_BELCAZAR_PROFILE.name, 
    clientId: null, 
    priority: TaskPriority.HIGH,
    elapsedTimeSeconds: 1800, // Example: 30 mins already logged
  },
  ...junePerformanceClosureTasks,
  ...dashboardTasksForClients,
];

const parseTarget = (targetValue: string | number): number => {
  if (typeof targetValue === 'number') {
    return targetValue;
  }
  return parseFloat(targetValue.replace('%', ''));
};

export const INITIAL_KPIS: Kpi[] = [
  // Care of Fairfield LLC dba Synergy Homecare (c997) - ROMERO VARGAS NEIDER ANDRES (solaj418)
  { id: 'kpi_c997_solaj418_1', name: 'Recruiting Calls', target: 50, actual: 45, category: 'Recruiter - Care of Fairfield LLC', description: "KPI for Neider Andres Romero Vargas (Recruiter). SUP/POC: Sebastian Belalcazar, Coordinator: DIAZ BENJUMEA DANIELA.", clientNeedAlignment: "Ensure sufficient candidate pipeline.", roiDemonstration: "Reduces time-to-hire, ensuring client staffing needs are met.", historicalData: [] },
  { id: 'kpi_c997_solaj418_2', name: 'Phone Screening', target: 10, actual: 12, category: 'Recruiter - Care of Fairfield LLC', description: "KPI for Neider Andres Romero Vargas (Recruiter). SUP/POC: Sebastian Belalcazar, Coordinator: DIAZ BENJUMEA DANIELA.", clientNeedAlignment: "Qualify candidates effectively.", roiDemonstration: "Improves quality of hires.", historicalData: [] },
  { id: 'kpi_c997_solaj418_3', name: 'Text sent', target: 30, actual: 25, category: 'Recruiter - Care of Fairfield LLC', description: "KPI for Neider Andres Romero Vargas (Recruiter). SUP/POC: Sebastian Belalcazar, Coordinator: DIAZ BENJUMEA DANIELA.", clientNeedAlignment: "Maintain candidate engagement.", roiDemonstration: "Faster response times from candidates.", historicalData: [] },
  { id: 'kpi_c997_solaj418_4', name: 'Emails to applicants', target: 40, actual: 40, category: 'Recruiter - Care of Fairfield LLC', description: "KPI for Neider Andres Romero Vargas (Recruiter). SUP/POC: Sebastian Belalcazar, Coordinator: DIAZ BENJUMEA DANIELA.", clientNeedAlignment: "Formal communication with applicants.", roiDemonstration: "Professional candidate experience.", historicalData: [] },

  // Endredy Enterprises LLC dba SYNERGY HomeCare (c1035) - RESTREPO MARTÍNEZ JUANITA (solaj421)
  { id: 'kpi_c1035_solaj421_1', name: 'Recruiting Calls', target: 20, actual: 15, category: 'Recruiter - Endredy Enterprises LLC', description: "KPI for Juanita Restrepo Martinez (Recruiter). SUP/POC: Sebastian Belalcazar, Coordinator: DIAZ BENJUMEA DANIELA.", clientNeedAlignment: "Active candidate sourcing.", roiDemonstration: "Maintains pool of potential hires.", historicalData: [] },
  { id: 'kpi_c1035_solaj421_2', name: 'Phone screening', target: 10, actual: 8, category: 'Recruiter - Endredy Enterprises LLC', description: "KPI for Juanita Restrepo Martinez (Recruiter). SUP/POC: Sebastian Belalcazar, Coordinator: DIAZ BENJUMEA DANIELA.", clientNeedAlignment: "Qualify candidates", roiDemonstration: "Better hire quality", historicalData: [] },
  { id: 'kpi_c1035_solaj421_3', name: 'Texts Sent', target: 25, actual: 30, category: 'Recruiter - Endredy Enterprises LLC', description: "KPI for Juanita Restrepo Martinez (Recruiter). SUP/POC: Sebastian Belalcazar, Coordinator: DIAZ BENJUMEA DANIELA.", clientNeedAlignment: "Engage candidates", roiDemonstration: "Faster responses", historicalData: [] },
  { id: 'kpi_c1035_solaj421_4', name: 'DCW Scheduled', target: 5, actual: 3, category: 'Recruiter - Endredy Enterprises LLC', description: "KPI for Juanita Restrepo Martinez (Recruiter). SUP/POC: Sebastian Belalcazar, Coordinator: DIAZ BENJUMEA DANIELA.", clientNeedAlignment: "Ensure interviews occur", roiDemonstration: "Progresses hiring funnel", historicalData: [] },
  { id: 'kpi_c1035_solaj421_5', name: 'Hires', target: 2, actual: 2, category: 'Recruiter - Endredy Enterprises LLC', description: "KPI for Juanita Restrepo Martinez (Recruiter). SUP/POC: Sebastian Belalcazar, Coordinator: DIAZ BENJUMEA DANIELA.", clientNeedAlignment: "Fulfill client's direct hiring needs.", roiDemonstration: "Directly impacts client's operational capacity.", historicalData: [] },

  // Just One Step LLC dba Synergy HomeCare (c860) - COBA CEPEDA SILVANA (solaj969)
  { id: 'kpi_c860_solaj969_1', name: 'Productivity', target: parseTarget("88%"), actual: 90, category: 'HR Coordinator - Just One Step LLC', description: "KPI for Silvana Coba Cepeda (HR Coordinator). SUP/POC: Sebastian Belalcazar, Coordinator: DIAZ BENJUMEA DANIELA.", clientNeedAlignment: "Ensure HR tasks are completed efficiently.", roiDemonstration: "Supports overall operational smoothness.", historicalData: [] },
  { id: 'kpi_c860_solaj969_2', name: 'Pre-onboarding Project completion', target: parseTarget("95%"), actual: 92, category: 'HR Coordinator - Just One Step LLC', description: "KPI for Silvana Coba Cepeda (HR Coordinator). SUP/POC: Sebastian Belalcazar, Coordinator: DIAZ BENJUMEA DANIELA.", clientNeedAlignment: "Efficient onboarding", roiDemonstration: "Faster time to productivity", historicalData: [] },
  { id: 'kpi_c860_solaj969_3', name: 'I-9 project', target: parseTarget("95%"), actual: 98, category: 'HR Coordinator - Just One Step LLC', description: "KPI for Silvana Coba Cepeda (HR Coordinator). SUP/POC: Sebastian Belalcazar, Coordinator: DIAZ BENJUMEA DANIELA.", clientNeedAlignment: "Maintain compliance.", roiDemonstration: "Avoids legal and financial penalties for the client.", historicalData: [] },
  
  { id: 'kpi_generic_recruitment_1', name: 'Candidate Engagement Rate', target: 75, actual: 60, category: 'General Recruitment', description: 'Percentage of contacted candidates who respond or engage.', clientNeedAlignment: 'Ensures a responsive candidate pool for client needs.', roiDemonstration: 'Higher engagement leads to faster hiring cycles and better candidate quality.', historicalData: [] },
  { id: 'kpi_generic_accounting_1', name: 'Invoice Processing Accuracy', target: 98, actual: 95, category: 'General Accounting', description: 'Percentage of invoices processed without errors.', clientNeedAlignment: 'Ensures accurate financial records for the client.', roiDemonstration: 'Reduces financial discrepancies and rework.', historicalData: [] },

  // Synergy HomeCare of Fredericksburg (c1250) - PEÑA CORREA MARIANA ANDREA (solam122) - These KPIs likely inactive due to resignation.
  { id: 'kpi_c1250_solam122_1', name: 'Initial Contact', target: parseTarget("100%"), actual: 0, category: 'Recruiter - Synergy HomeCare of Fredericksburg (Inactive)', description: "KPI for Mariana Andrea Peña Correa (Recruiter - Resigned).", clientNeedAlignment: "Prompt candidate interaction", roiDemonstration: "Improves candidate experience", historicalData: [] },
  { id: 'kpi_c1250_solam122_2', name: 'Hires', target: 1, actual: 0, category: 'Recruiter - Synergy HomeCare of Fredericksburg (Inactive)', description: "KPI for Mariana Andrea Peña Correa (Recruiter - Resigned).", clientNeedAlignment: "Fill open positions", roiDemonstration: "Meets client staffing needs", historicalData: [] },
  { id: 'kpi_c1250_solam122_3', name: 'Interviews completed', target: 5, actual: 0, category: 'Recruiter - Synergy HomeCare of Fredericksburg (Inactive)', description: "KPI for Mariana Andrea Peña Correa (Recruiter - Resigned).", clientNeedAlignment: "Screen candidates effectively", roiDemonstration: "Reduces wasted time on unqualified hires", historicalData: [] },

  // Synergy HomeCare of Mendon (c1495) - RODRIGUEZ SANCHEZ WENDY GISSELLA (solan248)
  { id: 'kpi_c1495_solan248_1', name: 'Applicants review', target: 100, actual: 100, category: 'Recruiter - Synergy HomeCare of Mendon', description: "KPI for Wendy Gissella Rodriguez Sanchez (Recruiter). SUP/POC: Sebastian Belalcazar, Coordinator: DIAZ BENJUMEA DANIELA.", clientNeedAlignment: "Efficient applicant processing", roiDemonstration: "Faster hiring", historicalData: [] },
  { id: 'kpi_c1495_solan248_2', name: 'Recruiting Calls', target: 10, actual: 7, category: 'Recruiter - Synergy HomeCare of Mendon', description: "KPI for Wendy Gissella Rodriguez Sanchez (Recruiter). SUP/POC: Sebastian Belalcazar, Coordinator: DIAZ BENJUMEA DANIELA.", clientNeedAlignment: "Build candidate pipeline", roiDemonstration: "More potential hires", historicalData: [] },
  { id: 'kpi_c1495_solan248_3', name: 'Phone screening', target: 5, actual: 5, category: 'Recruiter - Synergy HomeCare of Mendon', description: "KPI for Wendy Gissella Rodriguez Sanchez (Recruiter). SUP/POC: Sebastian Belalcazar, Coordinator: DIAZ BENJUMEA DANIELA.", clientNeedAlignment: "Qualify candidates", roiDemonstration: "Higher quality interviews", historicalData: [] },
  { id: 'kpi_c1495_solan248_4', name: 'Text sent', target: 5, actual: 4, category: 'Recruiter - Synergy HomeCare of Mendon', description: "KPI for Wendy Gissella Rodriguez Sanchez (Recruiter). SUP/POC: Sebastian Belalcazar, Coordinator: DIAZ BENJUMEA DANIELA.", clientNeedAlignment: "Engage candidates quickly", roiDemonstration: "Improved response rates", historicalData: [] },

  // SYNERGY HomeCare of Sierra Vista (c946) - TARQUINO MARTINEZ JULIANA (solaj337)
  { id: 'kpi_c946_solaj337_1', name: 'Open shifts management', target: parseTarget("95%"), actual: 96, category: 'Scheduler - SYNERGY HomeCare of Sierra Vista', description: "KPI for Juliana Tarquino Martinez (Scheduler). SUP/POC: Sebastian Belalcazar, Coordinator: DIAZ BENJUMEA DANIELA.", clientNeedAlignment: "Ensure client shifts are covered.", roiDemonstration: "Maintains service continuity for the client.", historicalData: [] },
  { id: 'kpi_c946_solaj337_2', name: 'Schedule compliance', target: parseTarget("95%"), actual: 90, category: 'Scheduler - SYNERGY HomeCare of Sierra Vista', description: "KPI for Juliana Tarquino Martinez (Scheduler). SUP/POC: Sebastian Belalcazar, Coordinator: DIAZ BENJUMEA DANIELA.", clientNeedAlignment: "Adherence to schedule", roiDemonstration: "Reliable service delivery", historicalData: [] },
  { id: 'kpi_c946_solaj337_3', name: 'Weekend coverage', target: parseTarget("90%"), actual: 85, category: 'Scheduler - SYNERGY HomeCare of Sierra Vista', description: "KPI for Juliana Tarquino Martinez (Scheduler). SUP/POC: Sebastian Belalcazar, Coordinator: DIAZ BENJUMEA DANIELA.", clientNeedAlignment: "Ensure weekend staffing", roiDemonstration: "Consistent client care", historicalData: [] },
  { id: 'kpi_c946_solaj337_4', name: 'Cancelled visits', target: parseTarget("20%"), actual: 22, category: 'Scheduler - SYNERGY HomeCare of Sierra Vista', description: "KPI for Juliana Tarquino Martinez (Scheduler). Target: MINIMIZE to 20% or less. SUP/POC: Sebastian Belalcazar, Coordinator: DIAZ BENJUMEA DANIELA.", clientNeedAlignment: "Minimize service disruptions", roiDemonstration: "Improved client satisfaction", historicalData: [] }, 

  // Weama LLC dba SYNERGY HomeCare (c468) - KPIs may need reassignment as Angelica (solae075) moved.
  { id: 'kpi_c468_solae075_1', name: 'Open shifts management', target: parseTarget("95%"), actual: 0, category: 'Scheduler - Weama LLC (Needs Reassignment)', description: "Previously for Angelica Santana. Role reassigned.", clientNeedAlignment: "Full shift coverage", roiDemonstration: "Client satisfaction", historicalData: [] },
  { id: 'kpi_c468_solae075_2', name: 'Schedule compliance', target: parseTarget("95%"), actual: 0, category: 'Scheduler - Weama LLC (Needs Reassignment)', description: "Previously for Angelica Santana. Role reassigned.", clientNeedAlignment: "Reliable scheduling", roiDemonstration: "Operational efficiency", historicalData: [] },
  { id: 'kpi_c468_solae075_3', name: 'Weekend Coverage', target: parseTarget("90%"), actual: 0, category: 'Scheduler - Weama LLC (Needs Reassignment)', description: "Previously for Angelica Santana. Role reassigned.", clientNeedAlignment: "Continuous care", roiDemonstration: "Dependable service", historicalData: [] },
  { id: 'kpi_c468_solae075_4', name: 'Cancelled Visits', target: parseTarget("20%"), actual: 0, category: 'Scheduler - Weama LLC (Needs Reassignment)', description: "Previously for Angelica Santana. Role reassigned. Target: MINIMIZE.", clientNeedAlignment: "Service reliability", roiDemonstration: "Reduced client inconvenience", historicalData: [] },

  // Toledo Home Care Company dba Synergy HomeCare (c1259) - PUPO RODRIGUEZ MELANIE PATRICIA (solam156)
  { id: 'kpi_c1259_solam156_1', name: 'Initial Contact', target: 100, actual: 90, category: 'Recruiter - Toledo Home Care Company', description: "KPI for Melanie Patricia Pupo Rodriguez (Recruiter). SUP/POC: Sebastian Belalcazar, Coordinator: DIAZ BENJUMEA DANIELA.", clientNeedAlignment: "Timely candidate communication", roiDemonstration: "Better candidate experience", historicalData: [] },
  { id: 'kpi_c1259_solam156_2', name: 'Interviews completed', target: 5, actual: 5, category: 'Recruiter - Toledo Home Care Company', description: "KPI for Melanie Patricia Pupo Rodriguez (Recruiter). SUP/POC: Sebastian Belalcazar, Coordinator: DIAZ BENJUMEA DANIELA.", clientNeedAlignment: "Effective candidate screening", roiDemonstration: "Improved hire quality", historicalData: [] },
  { id: 'kpi_c1259_solam156_3', name: 'Recruitment calls', target: 50, actual: 55, category: 'Recruiter - Toledo Home Care Company', description: "KPI for Melanie Patricia Pupo Rodriguez (Recruiter). SUP/POC: Sebastian Belalcazar, Coordinator: DIAZ BENJUMEA DANIELA.", clientNeedAlignment: "Sufficient candidate outreach", roiDemonstration: "Larger talent pool", historicalData: [] },
  { id: 'kpi_c1259_solam156_4', name: 'Interviews scheduled', target: 7, actual: 6, category: 'Recruiter - Toledo Home Care Company', description: "KPI for Melanie Patricia Pupo Rodriguez (Recruiter). SUP/POC: Sebastian Belalcazar, Coordinator: DIAZ BENJUMEA DANIELA.", clientNeedAlignment: "Maintain interview pipeline", roiDemonstration: "Consistent hiring progress", historicalData: [] },
  { id: 'kpi_c1259_solam156_5', name: 'Hires', target: 1, actual: 1, category: 'Recruiter - Toledo Home Care Company', description: "KPI for Melanie Patricia Pupo Rodriguez (Recruiter). SUP/POC: Sebastian Belalcazar, Coordinator: DIAZ BENJUMEA DANIELA.", clientNeedAlignment: "Meet hiring targets", roiDemonstration: "Client staffing fulfilled", historicalData: [] },
  // KPIs for Angelica (solae075) for Toledo:
  { id: 'kpi_c1259_solae075_1', name: 'Recruiting Efficiency', target: 10, actual: 0, category: 'Recruiter - Toledo Home Care Company', description: "KPI for Angelica Maria Santana Coronado (Recruiter).", clientNeedAlignment: "Efficiently source and screen candidates.", roiDemonstration: "Faster time to fill.", historicalData: [] },
  
  // Synergy Home Care of Yuma (c1293) - MOLINA MONTALVO LIZETH ALEJANDRA (solam272) - Role changed, KPIs may need review
  { id: 'kpi_c1293_solam272_1', name: 'Recruitment Activity', target: 20, actual: 0, category: 'Recruiter/HR - Synergy Home Care of Yuma', description: "KPI for Lizeth Alejandra Molina Montalvo (Recruiter/HR).", clientNeedAlignment: "Active recruitment and HR support", roiDemonstration: "Efficient talent acquisition and HR processes", historicalData: [] },
  { id: 'kpi_c1293_solam272_2', name: 'HR Task Completion', target: 15, actual: 0, category: 'Recruiter/HR - Synergy Home Care of Yuma', description: "KPI for Lizeth Alejandra Molina Montalvo (Recruiter/HR).", clientNeedAlignment: "Timely completion of HR tasks", roiDemonstration: "Smooth HR operations", historicalData: [] },
  
  // Synergy Home Care of Yuma (c1293) - PULID GARZON RICARDO (solam977)
  { id: 'kpi_c1293_solam977_1', name: 'New Leads', target: 8, actual: 9, category: 'Marketing Assistant - Synergy Home Care of Yuma', description: "KPI for Ricardo Pulid Garzon (Marketing Assistant). SUP/POC: Sebastian Belalcazar, Coordinator: DIAZ BENJUMEA DANIELA.", clientNeedAlignment: "Generate new business opportunities for client.", roiDemonstration: "Directly contributes to client growth.", historicalData: [] },
  { id: 'kpi_c1293_solam977_2', name: 'Clients', target: 4, actual: 3, category: 'Marketing Assistant - Synergy Home Care of Yuma', description: "KPI for Ricardo Pulid Garzon (Marketing Assistant). SUP/POC: Sebastian Belalcazar, Coordinator: DIAZ BENJUMEA DANIELA.", clientNeedAlignment: "Convert leads to clients", roiDemonstration: "Increase client base", historicalData: [] },
  { id: 'kpi_c1293_solam977_3', name: 'Marketing proyects', target: parseTarget("90%"), actual: 85, category: 'Marketing Assistant - Synergy Home Care of Yuma', description: "KPI for Ricardo Pulid Garzon (Marketing Assistant). SUP/POC: Sebastian Belalcazar, Coordinator: DIAZ BENJUMEA DANIELA.", clientNeedAlignment: "Execute marketing initiatives", roiDemonstration: "Brand visibility and lead generation", historicalData: [] },

  // KPIs for Synergy Homecare of South Austin (c1168)
  // Mariana Marcela Arevalo Gutierrez (Recruitment)
  { id: 'kpi_c1168_solan772_1', name: 'Part-time Caregiver Leads (Weekly)', target: 15, actual: 5, category: 'Recruiter - Synergy Homecare of South Austin', description: "Number of qualified leads generated for part-time caregiver roles through marketing and recruitment efforts for Synergy South Austin.", clientNeedAlignment: "Directly addresses the client's need to fill part-time caregiver positions to increase service hours.", roiDemonstration: "More leads result in more hires, increasing billable hours and preventing client churn.", historicalData: [] },
  { id: 'kpi_c1168_solan772_2', name: 'New Applicant Conversion Rate (Part-time)', target: 20, actual: 10, category: 'Recruiter - Synergy Homecare of South Austin', description: "Percentage of new part-time caregiver leads that are successfully screened and scheduled for an interview.", clientNeedAlignment: "Ensures marketing efforts translate into a viable candidate pool.", roiDemonstration: "Higher conversion means more efficient use of marketing spend and faster role fulfillment.", historicalData: [] },
  { id: 'kpi_c1168_solan772_3', name: 'Marketing Campaign Engagement', target: 75, actual: 40, category: 'Recruiter/Marketing - Synergy Homecare of South Austin', description: "Track engagement of marketing campaigns launched for Synergy South Austin (e.g., social media interaction, ad clicks).", clientNeedAlignment: "Measures effectiveness of marketing strategies designed to attract part-time caregivers.", roiDemonstration: "Successful campaigns reduce cost per lead/hire and improve brand visibility for recruitment.", historicalData: [] },
  { id: 'kpi_c1168_solan772_recruitment_1', name: 'Time to Fill (Part-time Roles)', target: 14, actual: 20, category: 'Recruiter - Synergy Homecare of South Austin', description: "Average number of days to fill part-time caregiver positions from job posting to offer acceptance.", clientNeedAlignment: "Critical for quickly meeting client's demand for part-time staff.", roiDemonstration: "Reduces vacancy periods, ensuring consistent service delivery and maximizing revenue.", historicalData: [] },
  { id: 'kpi_c1168_solan772_recruitment_2', name: 'Offer Acceptance Rate (Part-time)', target: 85, actual: 70, category: 'Recruiter - Synergy Homecare of South Austin', description: "Percentage of job offers extended to part-time candidates that are accepted.", clientNeedAlignment: "Indicates attractiveness of offers and efficiency of recruitment process.", roiDemonstration: "High acceptance rate reduces wasted effort and speeds up hiring.", historicalData: [] },
  
  // Sebastian Cantera Perez (Marketing & Scheduling) - South Austin (c1168)
  { id: 'kpi_c1168_solak310_1', name: 'Part-time Shift Fill Rate', target: 95, actual: 80, category: 'Scheduler - Synergy Homecare of South Austin', description: "Percentage of requested part-time shifts successfully filled for Synergy South Austin.", clientNeedAlignment: "Ensures client's new part-time service model is adequately staffed.", roiDemonstration: "High fill rates maintain service continuity, improve client satisfaction, and maximize billable hours.", historicalData: [] },
  { id: 'kpi_c1168_solak310_2', name: 'Scheduling Conflict Resolution Time', target: 4, actual: 6, category: 'Scheduler - Synergy Homecare of South Austin', description: "Average time taken to resolve scheduling conflicts or find replacements for part-time shifts (in hours).", clientNeedAlignment: "Minimizes disruption to client service due to scheduler changes.", roiDemonstration: "Quick resolution prevents lost billable hours and maintains client trust.", historicalData: [] },
  { id: 'kpi_c1168_solak310_marketing_1', name: 'Social Media Post Frequency (Weekly)', target: 5, actual: 2, category: 'Marketing - Synergy Homecare of South Austin', description: "Number of social media posts per week aimed at recruiting part-time caregivers.", clientNeedAlignment: "Supports recruitment drive for part-time roles.", roiDemonstration: "Consistent social media presence increases brand visibility and attracts candidates.", historicalData: [] },
  { id: 'kpi_c1168_solak310_marketing_2', name: 'Lead Source Tracking Accuracy', target: 98, actual: 90, category: 'Marketing - Synergy Homecare of South Austin', description: "Percentage of new caregiver leads with accurately documented sources.", clientNeedAlignment: "Essential for evaluating marketing campaign effectiveness.", roiDemonstration: "Accurate tracking allows for optimizing marketing spend and focusing on high-performing channels.", historicalData: [] },
  { id: 'kpi_c1168_solak310_marketing_3', name: 'Campaign Report Submission (Weekly)', target: 1, actual: 1, category: 'Marketing - Synergy Homecare of South Austin', description: "Submission of a weekly marketing campaign performance report to management.", clientNeedAlignment: "Provides regular updates on marketing efforts and outcomes.", roiDemonstration: "Facilitates timely decision-making and strategy adjustments.", historicalData: [] },
  { id: 'kpi_c1168_solak310_scheduling_1', name: 'Client Schedule Confirmation Rate (Part-time)', target: 90, actual: 75, category: 'Scheduler - Synergy Homecare of South Austin', description: "Percentage of part-time caregiver schedules confirmed with clients at least 24 hours in advance.", clientNeedAlignment: "Ensures clients are aware of and agree to scheduled services.", roiDemonstration: "Reduces last-minute cancellations and improves client satisfaction.", historicalData: [] },

  // KPIs for Synergy of Apollo Beach (c2552) - Onboarding (Juan Belalcázar)
  { id: 'kpi_c2552_onboarding_1', name: 'Client Profile Completion', target: 100, actual: 25, category: 'Client Onboarding - Synergy of Apollo Beach', description: "Percentage of essential client information gathered and documented for Synergy of Apollo Beach (POC, contact, service needs, systems).", clientNeedAlignment: "Ensures a full understanding of the new client to tailor services effectively.", roiDemonstration: "Comprehensive client profiles enable faster onboarding of operational team members and reduce initial setup errors.", historicalData: [] },
  { id: 'kpi_c2552_onboarding_2', name: 'Initial KPI Definition', target: 5, actual: 0, category: 'Client Onboarding - Synergy of Apollo Beach', description: "Number of core operational KPIs defined and agreed upon with Synergy of Apollo Beach.", clientNeedAlignment: "Establishes clear performance expectations and measurement criteria from the outset.", roiDemonstration: "Well-defined KPIs align Solvo's efforts with client objectives, demonstrating value early on.", historicalData: [] },
  { id: 'kpi_c2552_onboarding_3', name: 'SOP Outline Creation', target: 1, actual: 0, category: 'Client Onboarding - Synergy of Apollo Beach', description: "Status of Standard Operating Procedure (SOP) outline creation for key processes for Apollo Beach (1 for created, 0 for not).", clientNeedAlignment: "Initiates the process of standardizing operations for the new client.", roiDemonstration: "Early SOP development ensures consistency and quality of service delivery.", historicalData: [] },
  // KPIs for Synergy of Apollo Beach (c2552) - Mariana Andrea Peña Correa (Recruitment)
  { id: 'kpi_c2552_solam122_recruitment_1', name: 'Candidate Sourcing Volume (Apollo Beach)', target: 20, actual: 0, category: 'Recruiter - Synergy of Apollo Beach', description: "Number of new candidates sourced weekly specifically for Apollo Beach client needs.", clientNeedAlignment: "Builds a talent pipeline for a new/growing client.", roiDemonstration: "Ensures staffing readiness as client demands increase.", historicalData: [] },
  { id: 'kpi_c2552_solam122_recruitment_2', name: 'Interview to Offer Ratio (Apollo Beach)', target: 30, actual: 0, category: 'Recruiter - Synergy of Apollo Beach', description: "Percentage of interviewed candidates who receive a job offer for Apollo Beach roles.", clientNeedAlignment: "Measures the quality of candidates being interviewed.", roiDemonstration: "A good ratio indicates efficient screening and interviewing processes.", historicalData: [] },
  { id: 'kpi_c2552_solam122_recruitment_3', name: 'New Hire Onboarding Prep (Apollo Beach)', target: 100, actual: 0, category: 'Recruiter - Synergy of Apollo Beach', description: "Percentage of new hires for Apollo Beach with all pre-onboarding documentation completed on time.", clientNeedAlignment: "Ensures smooth transition for new hires joining the Apollo Beach team.", roiDemonstration: "Reduces onboarding delays and improves new hire experience.", historicalData: [] },

  // KPIs for SYNERGY HomeCare of Cape May Court House (c2551) - Angie Paola Acuña Patiño (Scheduling)
  { id: 'kpi_c2551_solau089_scheduling_1', name: 'Open Shift Coverage Rate (Cape May)', target: 98, actual: 0, category: 'Scheduler - Cape May Court House', description: "Percentage of all open shifts successfully covered for the Cape May client.", clientNeedAlignment: "Ensures service continuity for a new client.", roiDemonstration: "High coverage rate builds client trust and satisfaction from the start.", historicalData: [] },
  { id: 'kpi_c2551_solau089_scheduling_2', name: 'Schedule Accuracy (Cape May)', target: 95, actual: 0, category: 'Scheduler - Cape May Court House', description: "Percentage of schedules published without errors (e.g., correct caregiver, time, location) for Cape May.", clientNeedAlignment: "Minimizes confusion and disruptions for caregivers and clients.", roiDemonstration: "Reduces rework and improves operational efficiency.", historicalData: [] },
  { id: 'kpi_c2551_solau089_scheduling_3', name: 'Client Communication for Schedule Changes (Cape May)', target: 100, actual: 0, category: 'Scheduler - Cape May Court House', description: "Percentage of schedule changes communicated to and confirmed by the Cape May client within 2 hours.", clientNeedAlignment: "Keeps the client informed and involved in their service delivery.", roiDemonstration: "Proactive communication enhances client relationships and reduces misunderstandings.", historicalData: [] },
];


export const INITIAL_TEMPLATES: Template[] = [
  {
    id: 'tpl_email_welcome',
    name: 'Welcome Email - New Client',
    category: TemplateCategory.EMAIL,
    subject: 'Welcome to SolvoIQ, {{ClientName}}!',
    content: `Dear {{ClientContactPerson}},

Welcome aboard to SolvoIQ! We're thrilled to have {{ClientName}} as a new partner.

Our team, led by {{AssignedTeamMember}}, is excited to start working with you to achieve your operational goals.

We'll be in touch shortly to schedule an initial kick-off meeting.

Best regards,
The SolvoIQ Team`,
    tags: ['onboarding', 'client communication', 'welcome'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'tpl_msg_quick_update',
    name: 'Quick Update SMS/Chat',
    category: TemplateCategory.MESSAGE,
    content: `Hi {{RecipientName}}, just a quick update on {{Project/Task}}: {{BriefUpdate}}. Will share more details soon. - {{SenderName}}`,
    tags: ['internal', 'client update', 'sms', 'chat'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'tpl_it_login_issue',
    name: 'IT Ticket - Login Issue',
    category: TemplateCategory.IT_TICKET,
    content: `User {{UserName}} ({{UserEmail}}) is reporting an inability to log in to {{SystemName}}.

Error message (if any): {{ErrorMessage}}
Time of occurrence: {{TimeOfOccurrence}}
Steps taken by user: {{StepsTaken}}

Please investigate.`,
    ticketPriority: 'High' as ITTicketPriority,
    assigneeSuggestion: 'IT Support Level 2',
    tags: ['it support', 'login', 'troubleshooting', 'high priority'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'tpl_report_weekly_client',
    name: 'Weekly Client Performance Report',
    category: TemplateCategory.REPORT,
    content: `## Weekly Performance Report for {{ClientName}}
**Week Ending:** {{Date}}

**Key Highlights:**
- {{Highlight1}}
- {{Highlight2}}

**Tasks Completed:**
- {{Task1}}
- {{Task2}}

**Upcoming Priorities:**
- {{Priority1}}
- {{Priority2}}

**KPI Overview:**
{{KPI_Table_Placeholder}}

**Notes/Challenges:**
- {{Note1}}`,
    reportType: 'Weekly Client Performance',
    dataFields: ['Key Highlights', 'Tasks Completed', 'Upcoming Priorities', 'KPI Overview', 'Notes/Challenges'],
    tags: ['client report', 'weekly', 'performance'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];


export const RECENT_ACTIVITY_ITEMS: RecentActivityItem[] = [
  { id: 'act1', type: 'task_completed', text: `Task "Finalize Q3 Budget" marked as completed by ${JUAN_BELCAZAR_PROFILE.name}.`, timestamp: '2 hours ago', icon: CheckCircle, userId: JUAN_BELCAZAR_PROFILE.id },
  { id: 'act2', type: 'client_added', text: 'New client "Innovatech Solutions" onboarded.', timestamp: '1 day ago', icon: UserPlus },
  { id: 'act3', type: 'kpi_updated', text: 'KPI "Customer Satisfaction Score" updated to 92%.', timestamp: '3 days ago', icon: Zap },
  { id: 'act5', type: 'team_join', text: 'Melanie P. (Recruiter) joined the Synergy HomeCare of Yuma account team.', timestamp: '5 days ago', icon: Edit3 },
];

export const INITIAL_ONE_ON_ONE_SESSIONS: OneOnOneSession[] = [
  {
    id: 'oos-solae075-1', teamMemberId: 'solae075', sessionDate: new Date('2025-06-04T00:00:00Z').toISOString(), supervisorId: JUAN_BELCAZAR_PROFILE.id,
    turnoverRisk: TurnoverRiskLevel.LOW,
    generalNotes: "Angelica is performing well as Scheduler for Weama LLC (c468). Client feedback is positive. Discussed progress on creating an SOP for the Weama account; Angelica will assist in documenting current scheduling processes. No concerns regarding performance or morale. HO eligibility noted, will discuss with client if Angelica is interested.",
    actionItems: [{ id: 'oos-action-as1-1', description: "Angelica to draft initial scheduling process for Weama SOP by EOW.", completed: false }]
  },
  {
    id: 'oos-solan248-1', teamMemberId: 'solan248', sessionDate: new Date('2025-06-05T00:00:00Z').toISOString(), supervisorId: JUAN_BELCAZAR_PROFILE.id,
    turnoverRisk: TurnoverRiskLevel.LOW,
    generalNotes: "Wendy is doing exceptionally well with Synergy Mendon (c1495). Client (Mike Botelho) is very pleased and approved her $200 raise. Confirmed raise processing for June 15 payroll. Reviewed recruitment KPIs, all on track. Wendy is motivated and engaged. HO approved by client.",
  },
  {
    id: 'oos-solan772-1', teamMemberId: 'solan772', sessionDate: new Date('2025-06-06T00:00:00Z').toISOString(), supervisorId: JUAN_BELCAZAR_PROFILE.id,
    turnoverRisk: TurnoverRiskLevel.MEDIUM,
    generalNotes: "Mariana A. is managing the critical account Synergy South Austin (c1168). Discussed the pressure and client's urgency for marketing results. Reviewed progress on social media launch and domain purchase strategy. Mariana is handling the stress well but needs support. Vacation July 7-11 discussed, coverage plan in place. HO pending client approval.",
    riskAssessment: {
        identifiedRisk: "Potential burnout or discouragement due to high-pressure client situation (c1168).",
        rootCause: "Client c1168 is facing business challenges, leading to increased scrutiny and demands on Mariana's marketing efforts.",
        suggestedMitigationPlan: "Provide Mariana with additional marketing resources/tools if possible. Ensure regular check-ins to monitor stress levels. Celebrate small wins. Expedite HO approval discussion with client if feasible to improve work-life balance.",
    },
    actionItems: [{id: 'oos-action-ma1-1', description: "Explore budget for small marketing tool for c1168.", completed: false}]
  },
   {
    id: 'oos-solak310-1', teamMemberId: 'solak310', sessionDate: new Date('2025-06-07T00:00:00Z').toISOString(), supervisorId: JUAN_BELCAZAR_PROFILE.id,
    turnoverRisk: TurnoverRiskLevel.MEDIUM,
    generalNotes: "Sebastian is also on Synergy South Austin (c1168) assisting with HR/Recruitment. IT onboarding tasks pending. This needs to be actioned urgently. Discussed workload related to the client's pivot. HO pending client approval.",
    riskAssessment: {
        identifiedRisk: "Lack of full IT/systems setup could lead to compliance issues or inability to properly assess productivity.",
        rootCause: "Unclear if IT ticket was submitted or if there's a technical issue with IT setup for Sebastian.",
        suggestedMitigationPlan: "Immediately verify IT ticket status for Sebastian's IT onboarding setup. Escalate if necessary. Confirm system access once visible. Provide Sebastian with clear instructions on using company systems.",
    },
    actionItems: [
        { id: 'oos-action-sc1-1', description: "Supervisor to check IT ticket status for Sebastian's IT onboarding setup by EOD.", completed: false },
        { id: 'oos-action-sc1-2', description: "Sebastian to complete onboarding policy acknowledgement once setup is confirmed.", completed: false },
    ]
  },
  {
    id: 'oos-solam122-1', teamMemberId: 'solam122', sessionDate: new Date('2025-06-07T00:00:00Z').toISOString(), supervisorId: JUAN_BELCAZAR_PROFILE.id,
    turnoverRisk: TurnoverRiskLevel.MEDIUM,
    generalNotes: "Mariana P. is handling recruiter role for Synergy of Fredericksburg (c1250). Client (Beata) has expressed concerns about Mariana being a shared resource and not getting enough dedicated time. Discussed strategies for managing client expectations and time allocation. Mariana feels stretched. HO is pending client's email confirmation. UPDATE: Mariana P. resigned, last day June 26, 2025.",
    riskAssessment: {
        identifiedRisk: "Client dissatisfaction due to perceived lack of dedicated support from a shared resource. Employee resignation.",
        rootCause: "Client's expectation for a full-time dedicated resource vs. current shared model for Mariana. Underlying reasons for resignation TBD.",
        suggestedMitigationPlan: "Develop clear communication plan with client on Mariana's allocated hours and deliverables. Explore if another small account can be shifted from Mariana to alleviate pressure. Prioritize tasks for c1250 during her allocated time. Secure HO approval to potentially improve focus. Address replacement strategy urgently.",
    },
    actionItems: [
        { id: 'oos-action-mp1-1', description: "Mariana P. to create a time-blocked schedule for c1250 tasks and share with supervisor.", completed: true}, 
        { id: 'oos-action-mp1-2', description: "Supervisor to follow up with Beata (c1250) on HO email confirmation for Mariana P.", completed: false} 
    ]
  },
  {
    id: 'oos-solaj418-1', teamMemberId: 'solaj418', sessionDate: new Date('2025-06-07T00:00:00Z').toISOString(), supervisorId: JUAN_BELCAZAR_PROFILE.id,
    turnoverRisk: TurnoverRiskLevel.LOW,
    generalNotes: "Neider is performing very well with Care of Fairfield (c997). Client is happy, dashboard was well-received, and his salary increase was approved. HO has also been approved by the client. Discussed current recruitment pipeline and future goals. Neider is highly motivated.",
  },
  {
    id: 'oos-solaj421-1', teamMemberId: 'solaj421', sessionDate: new Date('2025-06-06T00:00:00Z').toISOString(), supervisorId: JUAN_BELCAZAR_PROFILE.id,
    turnoverRisk: TurnoverRiskLevel.HIGH,
    generalNotes: "Critical discussion with Juanita regarding Endredy Enterprises (c1035). Client is extremely dissatisfied with her leave frequency and communication. Reviewed specific instances and impact. Juanita acknowledged the severity and impact on the client relationship. Her recruitment performance metrics are strong, but this behavioural issue is overshadowing it. HO is definitely on hold and client wants her on-site only for now.",
    riskAssessment: {
        identifiedRisk: "High risk of losing client c1035 due to Juanita's attendance and communication issues. Also, high personal stress for Juanita if situation doesn't improve.",
        rootCause: "Poor personal time management, underestimation of client expectations regarding presence, and insufficient proactive communication about absences.",
        suggestedMitigationPlan: "Implement a Performance Improvement Plan (PIP) focusing on attendance, punctuality, and client communication. Daily check-ins with supervisor for the next two weeks. Juanita to provide a detailed plan for managing her schedule and any future leave requests. No further unapproved leave. Supervisor to mediate a follow-up with client c1035 in 2-3 weeks to show improvement.",
    },
    actionItems: [
        { id: 'oos-action-jrm1-1', description: "Juanita to draft and submit a personal improvement plan for attendance and communication by EOD Monday.", completed: false },
        { id: 'oos-action-jrm1-2', description: "Supervisor to schedule daily 5-min check-ins with Juanita for next 2 weeks.", completed: false },
        { id: 'oos-action-jrm1-3', description: "Initiate formal PIP documentation.", completed: false}
    ]
  },
  {
    id: 'oos-solaj969-1', teamMemberId: 'solaj969', sessionDate: new Date('2025-06-10T00:00:00Z').toISOString(), supervisorId: JUAN_BELCAZAR_PROFILE.id,
    turnoverRisk: TurnoverRiskLevel.LOW,
    generalNotes: "Silvana continues to do good work as HR Coordinator for Just One Step LLC (c860). Client Robbie Mahar is satisfied. KPIs are being met. Discussed potential for her to take on more complex HR tasks. HO is eligible, will discuss with client.",
    actionItems: [{ id: 'oos-action-sc2-1', description: "Explore advanced HR training/certification for Silvana.", completed: false }]
  },
  {
    id: 'oos-solaj337-1', teamMemberId: 'solaj337', sessionDate: new Date('2025-06-10T00:00:00Z').toISOString(), supervisorId: JUAN_BELCAZAR_PROFILE.id,
    turnoverRisk: TurnoverRiskLevel.LOW,
    generalNotes: "Juliana is performing well as Scheduler for Hyman & Hyman (c946). Client is happy. She's actively assisting with SOP creation. No performance concerns. HO eligible, client seems open, need to formalize the proposal.",
    actionItems: [{ id: 'oos-action-jt1-1', description: "Prepare formal HO proposal for Juliana to present to client c946.", completed: false }]
  },
  {
    id: 'oos-solas093-1', teamMemberId: 'solas093', sessionDate: new Date('2025-06-11T00:00:00Z').toISOString(), supervisorId: JUAN_BELCAZAR_PROFILE.id,
    turnoverRisk: TurnoverRiskLevel.LOW,
    generalNotes: "Christian is well-regarded by client Synergy Franchising (c1868). KPI proposal is with client for review. Main outstanding item is the MS Authentication IT issue. Christian confirmed it's still hampering some tasks. HO eligible, can be discussed once IT issue is fully resolved.",
    actionItems: [{ id: 'oos-action-cs1-1', description: "Escalate Christian's IT authentication issue again with IT Manager, request ETA.", completed: false }]
  },
  {
    id: 'oos-solam156-1', teamMemberId: 'solam156', sessionDate: new Date('2025-06-11T00:00:00Z').toISOString(), supervisorId: JUAN_BELCAZAR_PROFILE.id,
    turnoverRisk: TurnoverRiskLevel.LOW,
    generalNotes: "Melanie is doing well with Toledo Home Care Company (c1259). Client Todd Leonard is satisfied. KPIs on track. Discussed any challenges, none reported. HO eligible, need to initiate discussion with client.",
  },
  {
    id: 'oos-solam272-1', teamMemberId: 'solam272', sessionDate: new Date('2025-06-12T00:00:00Z').toISOString(), supervisorId: JUAN_BELCAZAR_PROFILE.id,
    turnoverRisk: TurnoverRiskLevel.LOW,
    generalNotes: "Lizeth recently started with SYNERGY Yuma (c1293). Initial feedback from intro meeting with client was positive. Discussed her initial tasks and understanding of client needs. KPIs to be set soon. HO eligible, will be part of broader discussion for the Yuma team.",
  },
  {
    id: 'oos-solam977-1', teamMemberId: 'solam977', sessionDate: new Date('2025-06-12T00:00:00Z').toISOString(), supervisorId: JUAN_BELCAZAR_PROFILE.id,
    turnoverRisk: TurnoverRiskLevel.LOW,
    generalNotes: "Ricardo also recently started with SYNERGY Yuma (c1293). Client seemed positive. Discussed his initial marketing ideas and understanding of client's brand. KPIs to be set. HO eligible with Lizeth.",
  },
  {
    id: 'oos-solau089-1', teamMemberId: 'solau089', sessionDate: new Date('2025-06-12T00:00:00Z').toISOString(), supervisorId: JUAN_BELCAZAR_PROFILE.id,
    turnoverRisk: TurnoverRiskLevel.MEDIUM,
    generalNotes: "Angie is a new hire assigned to SYNERGY Cape May (c2551). Main focus is getting her IT systems setup via IT ticket. Without it, difficult to monitor onboarding progress effectively. Discussed initial client interactions and understanding of scheduler role. Seems eager to learn.",
    riskAssessment: {
        identifiedRisk: "Delayed IT setup hindering proper onboarding monitoring and compliance.",
        rootCause: "Dependency on IT for system provisioning.",
        suggestedMitigationPlan: "Daily follow-up on IT ticket for IT setup. Provide Angie with offline resources and shadow opportunities in the meantime. Set clear expectations for first 30 days once systems are active.",
    },
    actionItems: [
        { id: 'oos-action-aa1-1', description: "Follow up daily on IT ticket for Angie's IT setup (solau089).", completed: false },
        { id: 'oos-action-aa1-2', description: "Pair Angie with an experienced scheduler for shadowing this week.", completed: false },
    ]
  },
];

const getDateOffset = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
};

const getRandomItems = <T,>(arr: T[], count: number): T[] => {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

// Moved these definitions to be before their usage in generatedPtlReports & generatedCoachingFeedForwards
export const PTL_MAIN_DRIVERS: PtlMainDriver[] = [
  'Familiar', 'Labor Discontent', 'Studies', 'Travel', 'Tiredness',
  'Schedules', 'Bonuses', 'Leadership', 'Transition – Company Change', 'Facilities',
  'Requests Approvals', 'Training', 'Payroll', 'Working Tools', 'Job Offer',
  'Disciplinary', 'Personal reasons', 'Work environment', 'Health issues',
  'Career path', 'Trial Period', 'Performance', 'Risk of losing account',
  'Client not happy with soulver', 'Promotion'
];

export const COACHING_FEELINGS_OPTIONS: CoachingFeeling[] = ['Angry', 'Tired', 'Neutral', 'Sad', 'Happy'];
export const COACHING_REASONS_OPTIONS: CoachingReason[] = [
  'Account or project they work on', 
  'Key performance indicators', 
  'Task performed', 
  'Leadership experiences', 
  'Personal subjects', 
  'Other'
];


// Clear initial PTL and Coaching data
export const INITIAL_PTL_REPORTS: PtlReport[] = [];
export const INITIAL_COACHING_FEED_FORWARDS: CoachingFeedForward[] = [];

export const GEMINI_MODEL_TEXT = 'gemini-2.5-flash-preview-04-17';