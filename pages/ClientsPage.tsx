
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Client, Task, TeamMember, ClientStatus, TaskStatus, FormMode, PulseLogEntry, Kpi, SOPDetails, KpiReportingDetails, HomeOfficeStatus, ClientDocumentationChecklist, FolderOrganizationStatus, ClientEmailLog } from '../types';
import { ClientCard } from '../components/ClientCard';
import { Filter, List, LayoutGrid, PlusCircle, Users, Edit2, Trash2, X, BarChart2, MessageSquare, Briefcase as BriefcaseIcon, Info, Phone, Mail, MapPin, PhoneCall, Bot as BotIcon, TrendingUp, AlertTriangle, CheckCircle, ArrowDownUp, Search as SearchIcon, Users2, BookOpen, CalendarCheck2, Home, CheckSquare, Link as LinkIcon, Edit3, Folder, ListChecks, FileText, MailOpen, Send as SendIcon, CornerDownRight, Eye, CalendarPlus, Download, Upload } from 'lucide-react';
import { GEMINI_MODEL_TEXT } from '../constants';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';
import { GoogleGenAI } from "@google/genai";
import { EmailLogForm } from '../components/forms/EmailLogForm';
import { Modal } from '../components/Modal';
import { ViewEmailModal } from '../components/modals/ViewEmailModal';


const CLIENTS_VIEW_MODE_KEY = 'solvoiq_clients_view_mode';
const CLIENTS_STATUS_FILTER_KEY = 'solvoiq_clients_status_filter';

interface ClientsPageProps {
  clients: Client[];
  tasks: Task[];
  teamMembers: TeamMember[];
  onOpenClientForm: (mode: FormMode, client?: Client) => void;
  onDeleteClient: (clientId: string) => void;
  handleAddPulseLogEntry: (clientId: string, entryData: Omit<PulseLogEntry, 'id'>) => void;
  allKpis: Kpi[];
  onUpdateClient: (clientData: Client) => void; 
  onAddClientEmailLog: (clientId: string, emailLogData: Omit<ClientEmailLog, 'id' | 'loggedAt' | 'loggedBy' | 'clientId'>) => void;
  onDeleteClientEmailLog: (clientId: string, emailLogId: string) => void;
  onOpenLogKpiDataModal: (kpi: Kpi) => void;
  userProfile: TeamMember;
  setClients: React.Dispatch<React.SetStateAction<Client[]>>; // Added for import
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  colorClass: string;
  bgColorClass: string;
  ariaLabel: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, colorClass, bgColorClass, ariaLabel }) => (
  <div 
    className={`bg-input-bg p-4 rounded-lg shadow-card border border-border-color flex items-center space-x-3 transition-all duration-300 ease-in-out hover:shadow-card-hover hover:scale-[1.02]`} 
    aria-label={ariaLabel}
  >
    <div className={`p-2.5 rounded-full ${bgColorClass}`}>
      <Icon size={20} className={colorClass} />
    </div>
    <div>
      <p className="text-xs text-medium-text">{title}</p>
      <p className="text-xl font-semibold text-dark-text">{value}</p>
    </div>
  </div>
);


const getStatusPillClasses = (status: ClientStatus) => {
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

interface ParsedNotes {
  poc?: string;
  additionalEmails?: string;
  salesManager?: string;
  startDate?: string;
  seniority?: string;
  solversary?: string;
  sopStatus?: string; 
  sopDate?: string;
  kpisIdentifiable?: string; 
  wbrScheduled?: string; 
  wbrFrequency?: string;
  wbrDayTime?: string;
  phoneSystem?: string;
  statusDescription?: string;
  rawNotesLines: string[];
}

const parseClientNotes = (notes: string): ParsedNotes => {
  const parsed: Partial<ParsedNotes> = {};
  const lines = notes.split('\n');
  const remainingLines: string[] = [];
  let statusDescFound = false;

  lines.forEach(line => {
    if (statusDescFound) { 
        if (/^[A-Z\s]+ Manager:|^Start Date:|^Seniority:|^Solversary:|^SOP:|^Identifiable KPIs:|^WBR Scheduled:|^Phone System:|^POC:/.test(line)) {
            statusDescFound = false; 
        } else {
            parsed.statusDescription = (parsed.statusDescription ? parsed.statusDescription + '\n' : '') + line;
            return;
        }
    }

    const pocMatch = line.match(/^POC:\s*(.*?)(?:\s*\(Additional Emails:\s*(.*?)\))?$/i);
    if (pocMatch) {
      parsed.poc = pocMatch[1]?.trim();
      if (pocMatch[2]) {
        parsed.additionalEmails = pocMatch[2]?.trim();
      }
      return;
    }
    
    const salesManagerMatch = line.match(/^Sales Manager:\s*(.*)/i);
    if (salesManagerMatch) { parsed.salesManager = salesManagerMatch[1]?.trim(); return; }

    const startDateMatch = line.match(/^Start Date:\s*(.*)/i);
    if (startDateMatch) { parsed.startDate = startDateMatch[1]?.trim(); return; }
    
    const seniorityMatch = line.match(/^Seniority:\s*(.*)/i);
    if (seniorityMatch) { parsed.seniority = seniorityMatch[1]?.trim(); return; }

    const solversaryMatch = line.match(/^Solversary:\s*(.*)/i);
    if (solversaryMatch) { parsed.solversary = solversaryMatch[1]?.trim(); return; }

    const sopMatch = line.match(/^SOP:\s*(YES|NO|N\/A)(?:\s*\(Date:\s*(.*?)\))?/i);
    if (sopMatch) {
      parsed.sopStatus = sopMatch[1]?.trim().toUpperCase();
      parsed.sopDate = sopMatch[2]?.trim() || (parsed.sopStatus !== 'YES' ? 'N/A' : '');
      return;
    }

    const kpisMatch = line.match(/^Identifiable KPIs:\s*(YES|NO)/i);
    if (kpisMatch) { parsed.kpisIdentifiable = kpisMatch[1]?.trim().toUpperCase(); return; }
    
    const wbrMatch = line.match(/^WBR Scheduled:\s*(YES|NO)(?:\s*\(Frequency:\s*(.*?)(?:,\s*Day\/Time:\s*(.*?))?\))?/i);
    if (wbrMatch) {
      parsed.wbrScheduled = wbrMatch[1]?.trim().toUpperCase();
      parsed.wbrFrequency = wbrMatch[2]?.trim();
      parsed.wbrDayTime = wbrMatch[3]?.trim();
      return;
    }

    const phoneSystemMatch = line.match(/^Phone System:\s*(.*)/i);
    if (phoneSystemMatch) { parsed.phoneSystem = phoneSystemMatch[1]?.trim(); return; }
    
    const statusDescMatch = line.match(/^Status Description:\s*(.*)/i);
    if (statusDescMatch) {
        parsed.statusDescription = statusDescMatch[1]?.trim();
        statusDescFound = true; 
        return;
    }

    remainingLines.push(line);
  });
  parsed.rawNotesLines = remainingLines.filter(line => line.trim() !== '' && line !== parsed.statusDescription); 
  if (parsed.statusDescription) parsed.statusDescription = parsed.statusDescription.trim();
  return parsed as ParsedNotes;
};

interface ClientDetailPanelProps {
  client: Client;
  tasks: Task[];
  allTeamMembers: TeamMember[];
  allKpis: Kpi[];
  onClose: () => void;
  onOpenClientForm: (mode: FormMode, client?: Client) => void;
  handleAddPulseLogEntry: (clientId: string, entryData: Omit<PulseLogEntry, 'id'>) => void;
  onUpdateClient: (clientData: Client) => void;
  panelVisible: boolean;
  onAddClientEmailLog: (clientId: string, emailLogData: Omit<ClientEmailLog, 'id' | 'loggedAt' | 'loggedBy' | 'clientId'>) => void;
  onDeleteClientEmailLog: (clientId: string, emailLogId: string) => void;
  onOpenLogKpiDataModal: (kpi: Kpi) => void;
  currentUser: TeamMember; 
}

const ClientDetailPanel: React.FC<ClientDetailPanelProps> = ({ 
    client, tasks, allTeamMembers, allKpis, onClose, onOpenClientForm, 
    handleAddPulseLogEntry, onUpdateClient, panelVisible,
    onAddClientEmailLog, onDeleteClientEmailLog, onOpenLogKpiDataModal, currentUser
 }) => {
  const [detailPanelTab, setDetailPanelTab] = useState<'overview' | 'tasks' | 'pulse' | 'kpis' | 'audit' | 'email-log'>('overview');
  const [pulseLogType, setPulseLogType] = useState<'Call' | 'Email' | 'Meeting'>('Call');
  const [pulseLogNotes, setPulseLogNotes] = useState('');
  const [pulseLogDate, setPulseLogDate] = useState(new Date().toISOString().split('T')[0]);

  const [aiPulseSummaryLoading, setAiPulseSummaryLoading] = useState(false);
  const [aiPulseSummaryError, setAiPulseSummaryError] = useState<string | null>(null);
  const [aiPulseSummaryResult, setAiPulseSummaryResult] = useState<{ sentiment: string; themes: string[]; suggestions: string[] } | null>(null);

  const [isEmailLogFormOpen, setIsEmailLogFormOpen] = useState(false);
  const [editingEmailLog, setEditingEmailLog] = useState<ClientEmailLog | null>(null); 
  const [emailLogFormMode, setEmailLogFormMode] = useState<FormMode>('add');
  
  const [isViewEmailModalOpen, setIsViewEmailModalOpen] = useState(false);
  const [selectedEmailForView, setSelectedEmailForView] = useState<ClientEmailLog | null>(null);


  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

  const clientTasks = tasks.filter(task => task.clientId === client.id);
  const clientTeamMembers = allTeamMembers.filter(tm => client.assignedTeamMembers.includes(tm.id));
  const parsedNotes = useMemo(() => parseClientNotes(client.notes), [client.notes]);
  const clientEmailLogs = useMemo(() => (client.emailLogs || []).sort((a,b) => new Date(b.emailDate).getTime() - new Date(a.emailDate).getTime()), [client.emailLogs]);


  const handleLogPulseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pulseLogNotes.trim() || !pulseLogDate) return;
    handleAddPulseLogEntry(client.id, { date: new Date(pulseLogDate).toISOString(), type: pulseLogType, notes: pulseLogNotes });
    setPulseLogNotes('');
  };

  const handleLogKpiReportSent = () => {
    if (window.confirm("Are you sure you want to log that the KPI report has been sent today?")) {
        const updatedClient = {
            ...client,
            kpiReporting: {
                ...(client.kpiReporting || { frequency: 'Not Set' }), 
                lastReportSentDate: new Date().toISOString(),
            }
        };
        onUpdateClient(updatedClient);
    }
  };

  const handleOpenEmailLogForm = (mode: FormMode, emailLog?: ClientEmailLog) => {
    setEmailLogFormMode(mode);
    setEditingEmailLog(emailLog || null); 
    setIsEmailLogFormOpen(true);
  };
  
  const handleSaveEmailLog = (emailLogData: Omit<ClientEmailLog, 'id' | 'loggedAt' | 'loggedBy'>) => {
      onAddClientEmailLog(client.id, emailLogData);
      setIsEmailLogFormOpen(false);
      setEditingEmailLog(null);
  };

  const handleOpenViewEmailModal = (email: ClientEmailLog) => {
    setSelectedEmailForView(email);
    setIsViewEmailModalOpen(true);
  };


  const relevantKpis = useMemo(() => {
    const memberKpiIds = new Set<string>();
    clientTeamMembers.forEach(member => {
      member.assignedKpis?.forEach(kpiId => memberKpiIds.add(kpiId));
    });
    if (memberKpiIds.size === 0 && client.name) { 
        return allKpis.filter(kpi => kpi.category?.toLowerCase().includes(client.name.toLowerCase()));
    }
    return allKpis.filter(kpi => memberKpiIds.has(kpi.id));
  }, [clientTeamMembers, allKpis, client.name]);

  const DetailItem: React.FC<{ icon?: React.ElementType, label: string, value?: string | React.ReactNode, valueClass?: string, fullWidthValue?: boolean }> = 
    ({ icon: IconComponent, label, value, valueClass = "text-medium-text", fullWidthValue = false }) => {
    if (!value && typeof value !== 'number' && typeof value !== 'boolean') return null; 
    return (
        <div className={`flex items-start py-1.5 ${fullWidthValue ? 'flex-col items-start' : 'items-center'}`}>
            <div className="flex items-center flex-shrink-0 w-40 md:w-48">
                {IconComponent && <IconComponent size={14} className="mr-2.5 text-light-text" />}
                {!IconComponent && <div className="w-[14px] mr-2.5"></div>} 
                <span className="text-xs font-semibold text-light-text uppercase tracking-wider">{label}:</span>
            </div>
            {typeof value === 'string' ? <span className={`text-sm ${valueClass} ${fullWidthValue ? 'mt-1 w-full' : 'break-words'}`}>{value}</span> : value}
        </div>
    );
  };

  const getPulseLogIcon = (type: PulseLogEntry['type']) => {
    switch (type) {
        case 'Call': return <PhoneCall size={15} className="text-blue-400 mr-2" />;
        case 'Email': return <Mail size={15} className="text-green-400 mr-2" />;
        case 'Meeting': return <Users size={15} className="text-purple-400 mr-2" />;
        default: return null;
    }
  };
  
  const handleGetAiPulseSummary = async () => {
    if (!client.pulseLog || client.pulseLog.length === 0) {
      setAiPulseSummaryError("No pulse log entries to analyze.");
      setAiPulseSummaryResult(null);
      return;
    }
    setAiPulseSummaryLoading(true);
    setAiPulseSummaryError(null);
    setAiPulseSummaryResult(null);

    const formattedLogEntries = client.pulseLog.map(entry => 
      `Date: ${new Date(entry.date).toLocaleDateString()}, Type: ${entry.type}, Notes: ${entry.notes}`
    ).join('\n---\n');

    const prompt = `
      Analyze the following communication pulse log entries for client "${client.name}".
      Provide an overall sentiment (Positive, Neutral, Negative, Mixed), key recurring themes or topics (as an array of strings), and suggested next steps or discussion points (as an array of strings).

      Pulse Log Entries:
      ---
      ${formattedLogEntries}
      ---

      Respond in JSON format with three keys: "sentiment" (string), "themes" (array of strings), and "suggestions" (array of strings).
      Example:
      {
        "sentiment": "Generally Positive",
        "themes": ["Dashboard presentation", "Salary increase discussion", "Weekly report format"],
        "suggestions": ["Follow up on scheduling the dashboard presentation meeting.", "Confirm preferred weekly report format with the client."]
      }
    `;

    try {
      const response = await ai.models.generateContent({
        model: GEMINI_MODEL_TEXT,
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });
      
      let jsonStr = response.text.trim();
      const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
      const match = jsonStr.match(fenceRegex);
      if (match && match[2]) { jsonStr = match[2].trim(); }
      
      const parsedResult = JSON.parse(jsonStr);
      setAiPulseSummaryResult(parsedResult);

    } catch (error: any) {
      console.error("Error getting AI pulse summary:", error);
      setAiPulseSummaryError(error.message || 'Failed to get AI summary.');
    } finally {
      setAiPulseSummaryLoading(false);
    }
  };

    return (
      <div className={`fixed inset-y-0 right-0 w-full md:w-1/2 lg:w-2/5 bg-sidebar-bg shadow-2xl z-30 transform transition-transform duration-300 ease-in-out ${panelVisible ? 'animate-panelShow' : 'translate-x-full'} border-l-2 border-primary`}>
        <div className="flex flex-col h-full">
          <header className="p-5 border-b border-border-color bg-light-bg"> 
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-primary flex items-center">
                <div className={`w-3 h-3 rounded-full mr-2.5 ${getStatusDotIndicatorClass(client.status)}`}></div>
                {client.name}
              </h2>
              <button onClick={onClose} className="text-medium-text hover:text-primary rounded-full p-1 -mr-1" aria-label="Close detail panel">
                <X size={24} />
              </button>
            </div>
            <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full inline-block mt-1.5 ml-[22px] ${getStatusPillClasses(client.status)}`}>
              {client.status}
            </span>
          </header>
          
          <nav className="border-b border-border-color bg-light-bg"> 
            <div className="flex space-x-1 p-2 overflow-x-auto custom-scrollbar">
              {([
                { id: 'overview', label: 'Overview', icon: Info },
                { id: 'tasks', label: 'Tasks', icon: BriefcaseIcon },
                { id: 'pulse', label: 'Pulse Log', icon: MessageSquare },
                { id: 'email-log', label: 'Email Log', icon: MailOpen },
                { id: 'kpis', label: 'KPIs', icon: BarChart2 },
                { id: 'audit', label: 'Audit', icon: CheckSquare }
              ] as const).map((tabInfo) => (
                <button
                  key={tabInfo.id}
                  onClick={() => setDetailPanelTab(tabInfo.id)}
                  aria-pressed={detailPanelTab === tabInfo.id}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${detailPanelTab === tabInfo.id ? 'bg-primary text-white shadow-sm' : 'text-medium-text hover:text-dark-text hover:bg-input-bg'}`}
                >
                  <tabInfo.icon size={16} className="mr-1.5" /> {tabInfo.label}
                </button>
              ))}
            </div>
          </nav>

          <main className="flex-grow p-5 overflow-y-auto space-y-5 bg-input-bg custom-scrollbar"> 
            {detailPanelTab === 'overview' && (
              <>
                <section className="bg-sidebar-bg p-4 rounded-md shadow-sm border border-border-color">
                  <h4 className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">Key Details</h4>
                  <div className="space-y-0.5">
                    <DetailItem label="Client Code" value={client.id.toUpperCase()} />
                    <DetailItem label="POC" value={parsedNotes.poc || 'N/A'} />
                    {parsedNotes.additionalEmails && <DetailItem label="Other Emails" value={parsedNotes.additionalEmails} valueClass="text-medium-text text-xs break-all" />}
                    <DetailItem label="Sales Manager" value={parsedNotes.salesManager || 'N/A'} />
                    <DetailItem label="Start Date" value={parsedNotes.startDate || 'N/A'} />
                    <DetailItem label="Seniority" value={parsedNotes.seniority || 'N/A'} />
                    <DetailItem label="Solversary" value={parsedNotes.solversary || 'N/A'} />
                  </div>
                </section>
                
                {parsedNotes.statusDescription && (
                    <section className="bg-sidebar-bg p-4 rounded-md shadow-sm border border-border-color">
                        <h4 className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">Status Description</h4>
                        <p className="text-sm text-medium-text whitespace-pre-wrap">{parsedNotes.statusDescription}</p>
                    </section>
                )}
                
                <section className="bg-sidebar-bg p-4 rounded-md shadow-sm border border-border-color">
                  <h4 className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">Contact & Location</h4>
                   <div className="space-y-0.5">
                    <DetailItem icon={Mail} label="Email" value={client.contactInfo.email ? <a href={`mailto:${client.contactInfo.email}`} className="text-primary hover:underline">{client.contactInfo.email}</a> : 'N/A'} />
                    <DetailItem icon={Phone} label="Phone" value={client.contactInfo.phone || 'N/A'} />
                    <DetailItem icon={MapPin} label="Address" value={client.contactInfo.address || 'N/A'} />
                  </div>
                </section>

                <section className="bg-sidebar-bg p-4 rounded-md shadow-sm border border-border-color">
                  <h4 className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">Tags</h4>
                    {client.tags.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                        {client.tags.map(tag => <span key={tag} className="bg-border-color text-medium-text px-2.5 py-1 text-xs rounded-full font-medium border border-light-border">{tag}</span>)}
                        </div>
                    ) : <p className="text-sm text-light-text">No tags assigned.</p>}
                </section>
                
                {parsedNotes.rawNotesLines && parsedNotes.rawNotesLines.length > 0 && (
                    <section className="bg-sidebar-bg p-4 rounded-md shadow-sm border border-border-color">
                        <h4 className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">Additional Notes (from original text)</h4>
                        <p className="text-sm text-medium-text whitespace-pre-wrap">{parsedNotes.rawNotesLines.join('\n')}</p>
                    </section>
                )}
              </>
            )}
            {detailPanelTab === 'tasks' && (
              <div className="bg-sidebar-bg p-4 rounded-md shadow-sm border border-border-color">
                <h4 className="text-md font-semibold text-dark-text mb-3">Tasks ({clientTasks.length})</h4>
                {clientTasks.length === 0 ? <p className="text-sm text-light-text text-center py-4">No tasks for this client.</p> : (
                  <ul className="space-y-2.5 max-h-96 overflow-y-auto custom-scrollbar pr-1">
                    {clientTasks.slice().sort((a,b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()).map(task => (
                      <li key={task.id} className="p-3 border border-light-border rounded-md bg-input-bg hover:shadow-sm transition-shadow">
                        <p className="font-medium text-sm text-dark-text">{task.title} 
                          <span className={`ml-2 text-xs font-semibold px-1.5 py-0.5 rounded-full ${
                            task.status === TaskStatus.COMPLETED ? 'bg-success-light text-success' :
                            task.status === TaskStatus.OVERDUE || (new Date(task.dueDate) < new Date()) ? 'bg-danger-light text-danger' :
                            task.status === TaskStatus.IN_PROGRESS ? 'bg-primary-light text-primary' :
                            'bg-warning-light text-warning' 
                          }`}>
                            {task.status}
                          </span>
                        </p>
                        <p className="text-xs text-light-text mt-0.5">Due: {new Date(task.dueDate).toLocaleDateString()} | Assigned to: {task.assignedTo}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
            {detailPanelTab === 'pulse' && (
              <div className="bg-sidebar-bg p-4 rounded-md shadow-sm border border-border-color space-y-4">
                <div>
                    <h4 className="text-md font-semibold text-dark-text mb-3">Communication Log ({client.pulseLog.length})</h4>
                    <form onSubmit={handleLogPulseSubmit} className="space-y-3 p-3 border border-light-border rounded-md bg-input-bg">
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label htmlFor="pulse-date" className="block text-xs font-medium text-medium-text mb-0.5">Date</label>
                                <input type="date" id="pulse-date" value={pulseLogDate} onChange={(e) => setPulseLogDate(e.target.value)} required className="w-full form-input p-1.5 border-border-color rounded-md shadow-subtle text-xs bg-sidebar-bg text-dark-text dark:[color-scheme:dark]" />
                            </div>
                            <div>
                                <label htmlFor="pulse-type" className="block text-xs font-medium text-medium-text mb-0.5">Type</label>
                                <select id="pulse-type" value={pulseLogType} onChange={(e) => setPulseLogType(e.target.value as PulseLogEntry['type'])} className="w-full form-select p-1.5 border-border-color rounded-md shadow-subtle text-xs bg-sidebar-bg text-dark-text appearance-none">
                                    <option value="Call" className="bg-sidebar-bg">Call</option>
                                    <option value="Email" className="bg-sidebar-bg">Email</option>
                                    <option value="Meeting" className="bg-sidebar-bg">Meeting</option>
                                </select>
                            </div>
                        </div>
                        <div className="relative">
                            <label htmlFor="pulse-notes" className="block text-xs font-medium text-medium-text mb-0.5">Notes</label>
                            <textarea id="pulse-notes" value={pulseLogNotes} onChange={(e) => setPulseLogNotes(e.target.value)} required rows={3} className="w-full form-textarea p-1.5 border-border-color rounded-md shadow-subtle text-xs bg-sidebar-bg text-dark-text placeholder-placeholder-color" placeholder="Log details..."></textarea>
                        </div>
                        <button type="submit" className="w-full text-xs bg-primary hover:bg-primary-dark text-white font-medium py-1.5 px-3 rounded-md transition-colors shadow-sm">Add Log Entry</button>
                    </form>
                </div>

                <button 
                    onClick={handleGetAiPulseSummary} 
                    disabled={aiPulseSummaryLoading || client.pulseLog.length === 0}
                    className="w-full flex items-center justify-center bg-teal-600 hover:bg-teal-700 text-white font-medium py-2 px-3 rounded-md text-sm transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {aiPulseSummaryLoading ? <LoadingSpinner size="sm"/> : <BotIcon size={16} className="mr-2" />} Get AI Summary & Insights
                </button>
                {aiPulseSummaryError && <p className="text-danger text-xs mt-2 text-center">{aiPulseSummaryError}</p>}
                {aiPulseSummaryLoading && <div className="mt-3"><LoadingSpinner text="AI is analyzing pulse logs..."/></div>}

                {aiPulseSummaryResult && !aiPulseSummaryLoading && (
                    <div className="mt-3 p-4 border border-teal-500/30 rounded-md bg-input-bg space-y-3 text-sm shadow-md">
                        <p className="font-semibold text-teal-400">AI Pulse Insights:</p>
                        <div className="pl-2">
                             <p><strong className="text-medium-text">Sentiment:</strong> <span className={`font-semibold ${aiPulseSummaryResult.sentiment.toLowerCase().includes('positive') ? 'text-success' : aiPulseSummaryResult.sentiment.toLowerCase().includes('negative') ? 'text-danger' : 'text-warning'}`}>{aiPulseSummaryResult.sentiment}</span></p>
                            {aiPulseSummaryResult.themes?.length > 0 && (
                                <div className="mt-1.5">
                                    <strong className="text-medium-text">Key Themes:</strong>
                                    <ul className="list-disc list-inside ml-2 text-light-text text-xs space-y-0.5">
                                        {aiPulseSummaryResult.themes.map((theme, i) => <li key={`theme-${i}`}>{theme}</li>)}
                                    </ul>
                                </div>
                            )}
                            {aiPulseSummaryResult.suggestions?.length > 0 && (
                                <div className="mt-1.5">
                                    <strong className="text-medium-text">Suggestions:</strong>
                                    <ul className="list-disc list-inside ml-2 text-light-text text-xs space-y-0.5">
                                        {aiPulseSummaryResult.suggestions.map((sugg, i) => <li key={`sugg-${i}`}>{sugg}</li>)}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {client.pulseLog.length === 0 ? <p className="text-sm text-light-text text-center pt-2">No communication log entries.</p> : (
                  <ul className="space-y-3 max-h-72 overflow-y-auto pr-1 custom-scrollbar">
                    {client.pulseLog.slice().sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(log => (
                      <li key={log.id} className="p-3 border border-light-border rounded-md bg-input-bg hover:shadow-sm transition-shadow">
                        <div className="flex justify-between items-center text-xs text-light-text mb-1">
                          <span className="flex items-center">{getPulseLogIcon(log.type)} {new Date(log.date).toLocaleDateString()}</span>
                          <span className="font-semibold">{log.type}</span>
                        </div>
                        <p className="text-sm text-medium-text whitespace-pre-wrap">{log.notes}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
            {detailPanelTab === 'email-log' && (
              <div className="bg-sidebar-bg p-4 rounded-md shadow-sm border border-border-color space-y-4">
                <div className="flex justify-between items-center">
                    <h4 className="text-md font-semibold text-dark-text">Email Log ({clientEmailLogs.length})</h4>
                    <button 
                        onClick={() => handleOpenEmailLogForm('add')}
                        className="flex items-center bg-primary hover:bg-primary-dark text-white font-medium py-1.5 px-3 rounded-md text-xs transition-colors shadow-sm"
                    >
                        <PlusCircle size={14} className="mr-1.5"/> Log New Email
                    </button>
                </div>
                {clientEmailLogs.length === 0 ? (
                    <EmptyState 
                        icon={MailOpen}
                        title="No Emails Logged"
                        message="Log sent or received emails related to this client for better tracking."
                        actionButtonText="Log First Email"
                        onAction={() => handleOpenEmailLogForm('add')}
                    />
                ) : (
                  <ul className="space-y-3 max-h-[70vh] overflow-y-auto pr-1 custom-scrollbar">
                    {clientEmailLogs.map(email => (
                      <li key={email.id} className="p-3 border border-light-border rounded-md bg-input-bg hover:shadow-sm transition-shadow">
                        <div className="flex justify-between items-start mb-1.5">
                            <div className="flex items-center min-w-0">
                                {email.direction === 'Sent' ? 
                                    <SendIcon size={15} className="text-blue-400 mr-2 flex-shrink-0" /> : 
                                    <CornerDownRight size={15} className="text-green-400 mr-2 flex-shrink-0" />
                                }
                                <span className="text-sm font-medium text-dark-text truncate flex-grow" title={email.subject}>{email.subject}</span>
                            </div>
                            <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold flex-shrink-0 ${email.direction === 'Sent' ? 'bg-blue-500/10 text-blue-400' : 'bg-green-500/10 text-green-400'}`}>
                                {email.direction}
                            </span>
                        </div>
                        <p className="text-xs text-medium-text ml-7 truncate" title={email.direction === 'Sent' ? `To: ${email.toAddresses.join(', ')}` : `From: ${email.fromAddress}`}>
                            {email.direction === 'Sent' ? `To: ${email.toAddresses.join(', ')}` : `From: ${email.fromAddress}`}
                        </p>
                        <p className="text-xs text-light-text ml-7">{new Date(email.emailDate).toLocaleString()}</p>
                        <div className="mt-2 pt-2 border-t border-border-color/50 flex justify-end space-x-2">
                            <button onClick={() => handleOpenViewEmailModal(email)} className="text-xs text-blue-400 hover:underline flex items-center">
                                <Eye size={14} className="mr-1"/> View
                            </button>
                            <button onClick={() => onDeleteClientEmailLog(client.id, email.id)} className="text-xs text-danger hover:underline">Delete</button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
             {detailPanelTab === 'kpis' && (
              <div className="bg-sidebar-bg p-4 rounded-md shadow-sm border border-border-color">
                <h4 className="text-md font-semibold text-dark-text mb-3">Relevant KPIs ({relevantKpis.length})</h4>
                {relevantKpis.length === 0 ? <p className="text-sm text-light-text text-center py-4">No KPIs directly assigned to this client's team members or matching client name.</p> : (
                  <ul className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar pr-1">
                    {relevantKpis.map(kpi => (
                      <li key={kpi.id} className="p-3 border border-light-border rounded-md bg-input-bg">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="font-medium text-sm text-dark-text">{kpi.name} <span className="text-xs text-light-text">({kpi.category || 'General'})</span></p>
                                <p className="text-xs text-medium-text mt-0.5">Target: {kpi.target}, Actual: {kpi.actual}</p>
                            </div>
                            <button 
                                onClick={() => onOpenLogKpiDataModal(kpi)} 
                                className="text-green-500 hover:text-green-600 p-1 rounded-md ml-2" 
                                title="Log Data for this KPI"
                                aria-label={`Log data for KPI ${kpi.name}`}
                            >
                                <CalendarPlus size={18} />
                            </button>
                        </div>
                        <div className="w-full bg-border-color rounded-full h-2 mt-1.5">
                            <div 
                                className={`h-2 rounded-full ${kpi.actual >= kpi.target ? 'bg-success' : kpi.actual >= kpi.target * 0.7 ? 'bg-warning' : 'bg-danger'}`} 
                                style={{ width: `${kpi.target > 0 ? Math.min((kpi.actual / kpi.target) * 100, 100) : (kpi.actual > 0 ? (kpi.target === 0 ? 0 : 100) : (kpi.target === 0 ? 100 : 0) )}%` }}
                            ></div>
                        </div>
                         {kpi.clientNeedAlignment && <p className="text-xs text-light-text mt-1 italic"><strong>Aligns with:</strong> {kpi.clientNeedAlignment}</p>}
                         {kpi.roiDemonstration && <p className="text-xs text-light-text mt-0.5 italic"><strong>ROI:</strong> {kpi.roiDemonstration}</p>}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
             {detailPanelTab === 'audit' && (
                <div className="bg-sidebar-bg p-4 rounded-md shadow-sm border border-border-color space-y-4">
                    <h4 className="text-md font-semibold text-dark-text mb-1">Audit & Compliance Overview</h4>
                    
                    <div className="p-3 border border-light-border rounded-md bg-input-bg">
                        <h5 className="text-sm font-semibold text-medium-text mb-1.5 flex items-center">
                            <BookOpen size={16} className="mr-2 text-primary"/> SOP Information
                        </h5>
                        <DetailItem label="SOP Exists" value={client.sop?.exists ? <CheckCircle size={15} className="text-success"/> : <AlertTriangle size={15} className="text-danger"/>} />
                        {client.sop?.exists && (
                            <>
                                <DetailItem label="SOP Format" value={client.sop.format || 'N/A'}/>
                                <DetailItem label="SOP Last Updated" value={client.sop.lastUpdatedDate ? new Date(client.sop.lastUpdatedDate).toLocaleDateString() : 'N/A'}/>
                                <DetailItem label="SOP Document" value={client.sop.documentLink ? <a href={client.sop.documentLink} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center text-sm"><LinkIcon size={14} className="mr-1"/>Link</a> : 'N/A'}/>
                            </>
                        )}
                    </div>

                    <div className="p-3 border border-light-border rounded-md bg-input-bg">
                        <h5 className="text-sm font-semibold text-medium-text mb-1.5 flex items-center">
                            <CalendarCheck2 size={16} className="mr-2 text-primary"/> KPI Reporting
                        </h5>
                        <DetailItem label="Reporting Freq." value={client.kpiReporting?.frequency || 'N/A'}/>
                        <DetailItem label="Last Report Sent" value={client.kpiReporting?.lastReportSentDate ? new Date(client.kpiReporting.lastReportSentDate).toLocaleDateString() : 'N/A'}/>
                        <DetailItem label="Report Location" value={client.kpiReporting?.reportLocationLink ? <a href={client.kpiReporting.reportLocationLink} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center text-sm"><LinkIcon size={14} className="mr-1"/>Link</a> : 'N/A'}/>
                        <DetailItem label="Client Preferences" value={client.kpiReporting?.clientPreferenceNotes || 'N/A'} fullWidthValue/>
                        <button 
                            onClick={handleLogKpiReportSent} 
                            className="mt-2 text-xs bg-blue-500 hover:bg-blue-600 text-white font-medium py-1 px-2.5 rounded-md transition-colors shadow-sm flex items-center"
                        >
                            <Edit3 size={13} className="mr-1.5"/> Log KPI Report Sent Today
                        </button>
                    </div>

                    <div className="p-3 border border-light-border rounded-md bg-input-bg">
                        <h5 className="text-sm font-semibold text-medium-text mb-1.5 flex items-center">
                            <Folder size={16} className="mr-2 text-primary"/> SharePoint & Documentation
                        </h5>
                        <DetailItem label="Main Folder" value={client.sharepointFolderLink ? <a href={client.sharepointFolderLink} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center text-sm"><LinkIcon size={14} className="mr-1"/>Link</a> : 'N/A'}/>
                        <DetailItem label="Folder Org." value={client.folderOrganizationStatus || 'N/A'} valueClass={client.folderOrganizationStatus === 'Organized' ? 'text-success' : client.folderOrganizationStatus === 'Needs Review' ? 'text-warning' : 'text-medium-text'}/>
                        <div>
                            <p className="text-xs font-semibold text-light-text uppercase tracking-wider mt-2 mb-1">Documentation Checklist:</p>
                            <ul className="list-none space-y-0.5 pl-1">
                                {client.documentationChecklist && (Object.keys(client.documentationChecklist) as Array<keyof ClientDocumentationChecklist>).map(key => {
                                    return (
                                        <li key={key} className="flex items-center text-sm">
                                            {client.documentationChecklist![key] ? <CheckSquare size={15} className="mr-2 text-success"/> : <AlertTriangle size={15} className="mr-2 text-warning"/>}
                                            <span className={client.documentationChecklist![key] ? 'text-medium-text' : 'text-warning'}>
                                                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                            </span>
                                        </li>
                                    );
                                })}
                                {!client.documentationChecklist && <p className="text-xs text-light-text">Not set.</p>}
                            </ul>
                        </div>
                    </div>

                    <div className="p-3 border border-light-border rounded-md bg-input-bg">
                       <h5 className="text-sm font-semibold text-medium-text mb-1.5 flex items-center">
                            <Users2 size={16} className="mr-2 text-primary"/> Team Home Office Status
                        </h5>
                        {clientTeamMembers.length > 0 ? clientTeamMembers.map(tm => (
                            <div key={tm.id} className="text-xs mb-1">
                                <span className="font-medium text-dark-text">{tm.name}: </span>
                                <span className="text-medium-text">{tm.homeOffice?.status || 'N/A'}</span>
                                {tm.homeOffice?.status === HomeOfficeStatus.APPROVED && tm.homeOffice.clientApprovalDocumentLink && 
                                  <a href={tm.homeOffice.clientApprovalDocumentLink} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline ml-1">(Proof)</a>}
                                {(tm.homeOffice?.status === HomeOfficeStatus.ELIGIBLE || tm.homeOffice?.status === HomeOfficeStatus.PENDING_CLIENT_APPROVAL) && !client.documentationChecklist?.hoApproval &&
                                  <span className="text-warning ml-1 text-[10px]">(Client HO Approval Doc Missing)</span>
                                }
                            </div>
                        )) : <p className="text-xs text-light-text">No team members assigned to this client.</p>}
                    </div>
                </div>
            )}


          </main>
          <footer className="p-4 border-t border-border-color bg-light-bg">
            <button 
              onClick={() => onOpenClientForm('edit', client)}
              className="w-full flex items-center justify-center bg-primary hover:bg-primary-dark text-white font-medium py-2.5 px-4 rounded-md text-sm transition-colors shadow-sm hover:shadow-md transform hover:scale-[1.01] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-light-bg focus-visible:ring-primary"
            >
              <Edit2 size={16} className="mr-2"/> Edit Client Details
            </button>
          </footer>
        </div>
        {isEmailLogFormOpen && client && currentUser && (
            <Modal 
                isOpen={isEmailLogFormOpen} 
                onClose={() => { setIsEmailLogFormOpen(false); setEditingEmailLog(null); }} 
                title={emailLogFormMode === 'add' ? `Log New Email for ${client.name}` : `Edit Email Log for ${client.name}`}
            >
                <EmailLogForm
                    onSave={handleSaveEmailLog}
                    initialData={editingEmailLog}
                    formMode={emailLogFormMode}
                    clientId={client.id}
                    currentUser={currentUser}
                />
            </Modal>
        )}
        {isViewEmailModalOpen && selectedEmailForView && (
            <ViewEmailModal
                isOpen={isViewEmailModalOpen}
                onClose={() => { setIsViewEmailModalOpen(false); setSelectedEmailForView(null);}}
                email={selectedEmailForView}
            />
        )}
      </div>
    );
};


export const ClientsPage: React.FC<ClientsPageProps> = ({ 
    clients, tasks, teamMembers, onOpenClientForm, onDeleteClient, handleAddPulseLogEntry, allKpis, onUpdateClient,
    onAddClientEmailLog, onDeleteClientEmailLog, onOpenLogKpiDataModal, userProfile, setClients
 }) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(() => {
    try {
      const persistedViewMode = localStorage.getItem(CLIENTS_VIEW_MODE_KEY);
      return (persistedViewMode === 'grid' || persistedViewMode === 'list') ? persistedViewMode : 'grid';
    } catch (error) {
      console.warn("Could not read clients view mode from localStorage", error);
      return 'grid';
    }
  });

  const [statusFilter, setStatusFilter] = useState<ClientStatus | 'all'>(() => {
    try {
        const persistedFilter = localStorage.getItem(CLIENTS_STATUS_FILTER_KEY);
        return Object.values(ClientStatus).includes(persistedFilter as ClientStatus) || persistedFilter === 'all' 
            ? persistedFilter as ClientStatus | 'all' 
            : 'all';
    } catch (error) {
        console.warn("Could not read clients status filter from localStorage", error);
        return 'all';
    }
  });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState<'name-asc' | 'name-desc' | 'status' | 'tasks-desc' | 'tasks-asc'>('name-asc');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const importFileRef = useRef<HTMLInputElement>(null);


  useEffect(() => {
    try {
      localStorage.setItem(CLIENTS_VIEW_MODE_KEY, viewMode);
    } catch (error) {
       console.warn("Could not save clients view mode to localStorage", error);
    }
  }, [viewMode]);

  useEffect(() => {
    try {
        localStorage.setItem(CLIENTS_STATUS_FILTER_KEY, statusFilter);
    } catch (error) {
        console.warn("Could not save clients status filter to localStorage", error);
    }
  }, [statusFilter]);
  
  useEffect(() => { 
    if (selectedClient) {
        const updatedSelectedClient = clients.find(c => c.id === selectedClient.id);
        setSelectedClient(updatedSelectedClient || null);
    }
  }, [clients, selectedClient]);


  const filteredAndSortedClients = useMemo(() => {
    let currentClients = clients.filter(client => 
      (statusFilter === 'all' || client.status === statusFilter) &&
      (client.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
       client.notes.toLowerCase().includes(searchTerm.toLowerCase()) ||
       client.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
    );

    return currentClients.sort((a, b) => {
      switch (sortOption) {
        case 'name-asc': return a.name.localeCompare(b.name);
        case 'name-desc': return b.name.localeCompare(a.name);
        case 'status': 
          const statusOrder = { [ClientStatus.CRITICAL]: 0, [ClientStatus.AT_RISK]: 1, [ClientStatus.HEALTHY]: 2 };
          return statusOrder[a.status] - statusOrder[b.status];
        case 'tasks-desc':
          return tasks.filter(t => t.clientId === b.id && t.status !== TaskStatus.COMPLETED).length - tasks.filter(t => t.clientId === a.id && t.status !== TaskStatus.COMPLETED).length;
        case 'tasks-asc':
          return tasks.filter(t => t.clientId === a.id && t.status !== TaskStatus.COMPLETED).length - tasks.filter(t => t.clientId === b.id && t.status !== TaskStatus.COMPLETED).length;
        default: return 0;
      }
    });
  }, [clients, statusFilter, searchTerm, sortOption, tasks]);

  const stats = useMemo(() => {
    const totalClients = clients.length;
    const healthy = clients.filter(c => c.status === ClientStatus.HEALTHY).length;
    const atRisk = clients.filter(c => c.status === ClientStatus.AT_RISK).length;
    const critical = clients.filter(c => c.status === ClientStatus.CRITICAL).length;
    return { totalClients, healthy, atRisk, critical };
  }, [clients]);

  const handleExportClients = () => {
    const filename = `solvoiq_clients_export_${new Date().toISOString().split('T')[0]}.json`;
    const jsonStr = JSON.stringify(clients, null, 2); // Export all clients data
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const href = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = href;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(href);
  };

  const handleImportClients = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedClients = JSON.parse(e.target?.result as string) as Client[];
        if (!Array.isArray(importedClients)) throw new Error("Imported data is not an array.");
        if (importedClients.length > 0 && (!importedClients[0].id || !importedClients[0].name || !importedClients[0].contactInfo)) {
          throw new Error("Imported data does not seem to be a valid client list.");
        }
        
        if (window.confirm(`Are you sure you want to import ${importedClients.length} clients? This will replace all current client data.`)) {
          setClients(importedClients);
          alert("Clients imported successfully!");
        }
      } catch (error: any) {
        alert(`Error importing clients: ${error.message}`);
        console.error("Import error:", error);
      } finally {
         if(importFileRef.current) importFileRef.current.value = ""; // Reset file input
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold text-dark-text">Client Management</h1>
        <button 
            onClick={() => onOpenClientForm('add')}
            className="flex items-center bg-primary hover:bg-primary-dark text-white font-medium py-2.5 px-5 rounded-md text-sm transition-all duration-300 shadow-md hover:shadow-hero-glow-light hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-light-bg focus-visible:ring-primary"
        >
            <PlusCircle size={18} className="mr-2"/> Add New Client
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard title="Total Clients" value={stats.totalClients} icon={Users} colorClass="text-primary" bgColorClass="bg-primary-light" ariaLabel={`Total clients: ${stats.totalClients}`} />
        <StatCard title="Healthy" value={stats.healthy} icon={CheckCircle} colorClass="text-success" bgColorClass="bg-success-light" ariaLabel={`Healthy clients: ${stats.healthy}`} />
        <StatCard title="At-Risk" value={stats.atRisk} icon={AlertTriangle} colorClass="text-warning" bgColorClass="bg-warning-light" ariaLabel={`At-risk clients: ${stats.atRisk}`} />
        <StatCard title="Critical" value={stats.critical} icon={TrendingUp} colorClass="text-danger" bgColorClass="bg-danger-light" ariaLabel={`Critical clients: ${stats.critical}`} />
      </div>

      <div className="p-4 bg-sidebar-bg rounded-lg shadow-subtle flex flex-col md:flex-row flex-wrap gap-4 border border-border-color items-center">
        <div className="relative flex-grow w-full md:w-auto">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon className="h-5 w-5 text-placeholder-color" />
            </div>
            <input 
                type="search" 
                placeholder="Search clients by name, notes, tag..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-border-color rounded-md leading-5 bg-input-bg text-dark-text placeholder-placeholder-color focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm shadow-subtle"
            />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
            <Filter size={20} className="text-light-text"/>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as ClientStatus | 'all')} className="form-select w-full md:w-auto rounded-md border-border-color shadow-subtle focus:border-primary focus:ring-1 focus:ring-primary text-sm py-2 bg-input-bg text-dark-text appearance-none">
                <option value="all" className="bg-input-bg text-dark-text">All Statuses</option>
                {Object.values(ClientStatus).map(s => <option key={s} value={s} className="bg-input-bg text-dark-text">{s}</option>)}
            </select>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
            <ArrowDownUp size={20} className="text-light-text"/>
             <select value={sortOption} onChange={e => setSortOption(e.target.value as any)} className="form-select w-full md:w-auto rounded-md border-border-color shadow-subtle focus:border-primary focus:ring-1 focus:ring-primary text-sm py-2 bg-input-bg text-dark-text appearance-none">
                <option value="name-asc" className="bg-input-bg text-dark-text">Name (A-Z)</option>
                <option value="name-desc" className="bg-input-bg text-dark-text">Name (Z-A)</option>
                <option value="status" className="bg-input-bg text-dark-text">Status (Critical First)</option>
                <option value="tasks-desc" className="bg-input-bg text-dark-text">Open Tasks (High-Low)</option>
                <option value="tasks-asc" className="bg-input-bg text-dark-text">Open Tasks (Low-High)</option>
            </select>
        </div>
        <div className="flex items-center space-x-2 ml-auto">
            <button
                onClick={handleExportClients}
                className="p-1.5 text-medium-text hover:text-primary transition-colors rounded-md border border-border-color hover:border-primary bg-input-bg flex items-center text-xs"
                title="Export Clients (JSON)"
            >
                <Download size={16} className="mr-1" /> Export
            </button>
            <input type="file" ref={importFileRef} onChange={handleImportClients} accept=".json" style={{ display: 'none' }} />
            <button
                onClick={() => importFileRef.current?.click()}
                className="p-1.5 text-medium-text hover:text-primary transition-colors rounded-md border border-border-color hover:border-primary bg-input-bg flex items-center text-xs"
                title="Import Clients (JSON)"
            >
                <Upload size={16} className="mr-1" /> Import
            </button>
            <div className="flex items-center space-x-1 border border-border-color rounded-md p-0.5 bg-border-color">
            <button onClick={() => setViewMode('grid')} title="Grid View" aria-pressed={viewMode === 'grid'} className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-primary text-white' : 'text-medium-text hover:bg-input-bg'}`}>
                <LayoutGrid size={20} />
            </button>
            <button onClick={() => setViewMode('list')} title="List View" aria-pressed={viewMode === 'list'} className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-primary text-white' : 'text-medium-text hover:bg-input-bg'}`}>
                <List size={20} />
            </button>
            </div>
        </div>
      </div>
      
      {clients.length === 0 ? (
         <EmptyState 
            icon={Users}
            title="No Clients Added Yet"
            message="Start by adding your first client to manage their details, tasks, and KPIs."
            actionButtonText="Add New Client"
            onAction={() => onOpenClientForm('add')}
         />
      ) : filteredAndSortedClients.length === 0 ? (
        <EmptyState
            icon={SearchIcon}
            title="No Clients Match Filters"
            message="Try adjusting your search or filter criteria."
        />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredAndSortedClients.map(client => (
            <ClientCard
              key={client.id}
              client={client}
              tasks={tasks}
              teamMembers={teamMembers}
              onSelectClient={setSelectedClient}
              onEditClient={() => onOpenClientForm('edit', client)}
              onDeleteClient={onDeleteClient}
              parsedPoc={parseClientNotes(client.notes).poc}
            />
          ))}
        </div>
      ) : ( // List View
        <div className="bg-input-bg shadow-card rounded-lg overflow-x-auto border border-border-color">
          <table className="min-w-full divide-y divide-border-color">
            <thead className="bg-sidebar-bg">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-light-text uppercase tracking-wider">Client Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-light-text uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-light-text uppercase tracking-wider">POC Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-light-text uppercase tracking-wider">Open Tasks</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-light-text uppercase tracking-wider">Assigned Team</th>
                 <th className="px-6 py-3 text-left text-xs font-medium text-light-text uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-input-bg divide-y divide-border-color">
              {filteredAndSortedClients.map(client => {
                const openTasksCount = tasks.filter(t => t.clientId === client.id && t.status !== TaskStatus.COMPLETED).length;
                const assignedMembers = teamMembers.filter(tm => client.assignedTeamMembers.includes(tm.id));

                return (
                  <tr key={client.id} className="hover:bg-sidebar-bg transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`w-2.5 h-2.5 rounded-full mr-2.5 ${getStatusDotIndicatorClass(client.status)}`}></div>
                        <button onClick={() => setSelectedClient(client)} className="text-sm font-medium text-primary hover:underline">{client.name}</button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusPillClasses(client.status)}`}>
                        {client.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-medium-text">{client.contactInfo.email || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-medium-text text-center">{openTasksCount}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-medium-text">
                        {assignedMembers.length > 0 ? assignedMembers.map(m => m.avatarInitials || m.name.charAt(0)).slice(0,3).join(', ') : 'None'}
                        {assignedMembers.length > 3 && ` +${assignedMembers.length-3}`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button onClick={() => setSelectedClient(client)} className="text-blue-500 hover:text-blue-600 p-1 rounded-md" title="View Details"><Info size={18}/></button>
                      <button onClick={() => onOpenClientForm('edit', client)} className="text-primary hover:text-primary-dark p-1 rounded-md" title="Edit Client"><Edit2 size={18}/></button>
                      <button onClick={() => onDeleteClient(client.id)} className="text-danger hover:text-red-600 p-1 rounded-md" title="Delete Client"><Trash2 size={18}/></button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {selectedClient && (
        <ClientDetailPanel
          client={selectedClient}
          tasks={tasks}
          allTeamMembers={teamMembers}
          allKpis={allKpis}
          onClose={() => setSelectedClient(null)}
          onOpenClientForm={onOpenClientForm}
          handleAddPulseLogEntry={handleAddPulseLogEntry}
          onUpdateClient={onUpdateClient}
          panelVisible={!!selectedClient}
          onAddClientEmailLog={onAddClientEmailLog}
          onDeleteClientEmailLog={onDeleteClientEmailLog}
          onOpenLogKpiDataModal={onOpenLogKpiDataModal}
          currentUser={userProfile}
        />
      )}
    </div>
  );
};
