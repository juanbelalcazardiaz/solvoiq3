

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import ReactDOM from 'react-dom';
import { Sidebar } from './components/Sidebar';
import { SearchBar } from './components/SearchBar';
import { DashboardPage } from './pages/DashboardPage';
import { ClientsPage } from './pages/ClientsPage';
import { TeamPage } from './pages/TeamPage';
import { TasksPage } from './pages/TasksPage';
import { KpiLibraryPage } from './pages/KpiLibraryPage';
import { TemplatesPage } from './pages/TemplatesPage';
import { SearchResultsPage } from './pages/SearchResultsPage';
import { PtlReportsPage } from './pages/ptl/PtlReportsPage';
import { CoachingFeedForwardPage } from './pages/coaching/CoachingFeedForwardPage';
import { KpiGoalsPage } from './pages/KpiGoalsPage'; // Import new page
import { Modal } from './components/Modal';
import { KpiForm } from './components/forms/KpiForm';
import { ClientForm } from './components/forms/ClientForm';
import { TaskForm } from './components/forms/TaskForm';
import { TeamMemberForm } from './components/forms/TeamMemberForm';
import { TemplateForm } from './components/forms/TemplateForm';
import { TemplatePreviewContent } from './components/TemplatePreviewContent';
import { GlobalActionButton } from './components/GlobalActionButton';
import { OneOnOneSessionsModal } from './components/modals/OneOnOneSessionsModal';
import { OneOnOneSessionForm } from './components/forms/OneOnOneSessionForm';
import LandingPage from './pages/LandingPage';
import { GoogleGenAI } from "@google/genai";
import { LogKpiDataModal } from './components/modals/LogKpiDataModal';
import { LoadingSpinner } from './components/LoadingSpinner';

import { Client, TeamMember, Task, Kpi, Template, PageId, SearchResultItem, EditableItem, FormMode, PulseLogEntry, RecentActivityItem, OneOnOneSession, PtlReport, CoachingFeedForward, ClientEmailLog, KpiHistoricalDataEntry } from './types';
import { INITIAL_CLIENTS, INITIAL_TEAM_MEMBERS, INITIAL_TASKS, INITIAL_KPIS, INITIAL_TEMPLATES, APP_NAME, APP_TAGLINE, NAVIGATION_LINKS, RECENT_ACTIVITY_ITEMS, GEMINI_MODEL_TEXT, AVAILABLE_USER_PROFILES, JUAN_BELCAZAR_PROFILE } from './constants';

let appAiInstance: GoogleGenAI | null = null;

const getAppAiInstance = () => {
  if (!appAiInstance) {
    if (!process.env.API_KEY) {
      console.error("API_KEY environment variable is not set for Gemini!");
      // Potentially throw an error or return a mock/stub if critical
    }
    appAiInstance = new GoogleGenAI({ apiKey: process.env.API_KEY! });
  }
  return appAiInstance;
};

const loadFromLocalStorage = <T,>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    if (item) {
      const parsed = JSON.parse(item);
      if (Array.isArray(defaultValue) && !Array.isArray(parsed)) {
        console.warn(`LocalStorage item for ${key} was not an array, using default.`);
        return defaultValue;
      }
      return parsed as T;
    }
  } catch (error) {
    console.warn(`Error loading or parsing localStorage item "${key}":`, error);
  }
  return defaultValue;
};

const saveToLocalStorage = <T,>(key: string, data: T) => {
  try {
    const stringifiedData = JSON.stringify(data);
    localStorage.setItem(key, stringifiedData);
  } catch (error) {
    console.error(`Error saving to localStorage item "${key}":`, error);
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        alert(`Error: Local storage quota exceeded. Some data might not be saved. Please consider clearing some browser storage.`);
    } else {
        alert(`Error saving data for ${key}. Some data might not persist. Please check console for details.`);
    }
  }
};


export const App = (): JSX.Element => {
  const [activeUser, setActiveUser] = useState<TeamMember>(() => {
    const storedUser = loadFromLocalStorage<TeamMember | null>('solvoiq_local_active_user', null);
    if (storedUser && AVAILABLE_USER_PROFILES[storedUser.id]) {
      return storedUser; 
    }
    saveToLocalStorage('solvoiq_local_active_user', JUAN_BELCAZAR_PROFILE);
    return JUAN_BELCAZAR_PROFILE;
  });
  
  const [clients, setClients] = useState<Client[]>(() => loadFromLocalStorage<Client[]>('solvoiq_local_clients', INITIAL_CLIENTS.map(c => ({...c, emailLogs: c.emailLogs || []}))));
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(() => loadFromLocalStorage<TeamMember[]>('solvoiq_local_teamMembers', INITIAL_TEAM_MEMBERS));
  const [tasks, setTasks] = useState<Task[]>(() => loadFromLocalStorage<Task[]>('solvoiq_local_tasks', INITIAL_TASKS));
  const [kpis, setKpis] = useState<Kpi[]>(() => loadFromLocalStorage<Kpi[]>('solvoiq_local_kpis', INITIAL_KPIS));
  const [templates, setTemplates] = useState<Template[]>(() => loadFromLocalStorage<Template[]>('solvoiq_local_templates', INITIAL_TEMPLATES));
  const [oneOnOneSessions, setOneOnOneSessions] = useState<OneOnOneSession[]>(() => loadFromLocalStorage<OneOnOneSession[]>('solvoiq_local_oneOnOneSessions', []));
  const [ptlReports, setPtlReports] = useState<PtlReport[]>(() => loadFromLocalStorage<PtlReport[]>('solvoiq_local_ptlReports', []));
  const [coachingFeedForwards, setCoachingFeedForwards] = useState<CoachingFeedForward[]>(() => loadFromLocalStorage<CoachingFeedForward[]>('solvoiq_local_coachingFeedForwards', []));

  const [isLoading, setIsLoading] = useState<boolean>(false); 
  const [error, setError] = useState<string | null>(null); 

  // UI States
  const [recentActivity, setRecentActivity] = useState<RecentActivityItem[]>(RECENT_ACTIVITY_ITEMS);
  const [currentPage, setCurrentPage] = useState<PageId>('dashboard');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalTitle, setModalTitle] = useState<string>('');
  const [modalContent, setModalContent] = useState<React.ReactNode>(null);
  const [editingItem, setEditingItem] = useState<EditableItem | TeamMember | null>(null);
  const [formMode, setFormMode] = useState<FormMode>('add');
  const [selectedTemplateForPreview, setSelectedTemplateForPreview] = useState<Template | null>(null);
  const [isTemplatePreviewModalOpen, setIsTemplatePreviewModalOpen] = useState<boolean>(false);
  const [isWhatsNewModalOpen, setIsWhatsNewModalOpen] = useState<boolean>(false);
  const [isOneOnOneSessionsModalOpen, setIsOneOnOneSessionsModalOpen] = useState<boolean>(false);
  const [selectedTeamMemberForOneOnOnes, setSelectedTeamMemberForOneOnOnes] = useState<TeamMember | null>(null);
  const [isOneOnOneFormModalOpen, setIsOneOnOneFormModalOpen] = useState<boolean>(false);
  const [editingOneOnOneSession, setEditingOneOnOneSession] = useState<OneOnOneSession | null>(null);
  const [oneOnOneFormMode, setOneOnOneFormMode] = useState<FormMode>('add');
  const [isLogKpiDataModalOpen, setIsLogKpiDataModalOpen] = useState<boolean>(false);
  const [kpiToLogDataFor, setKpiToLogDataFor] = useState<Kpi | null>(null);

  const [showLandingPage, setShowLandingPage] = useState<boolean>(() => {
    return localStorage.getItem('solvoiq_local_has_seen_landing') !== 'true';
  });
  
  // Save states to localStorage
  useEffect(() => { saveToLocalStorage('solvoiq_local_active_user', activeUser); }, [activeUser]);
  useEffect(() => { saveToLocalStorage('solvoiq_local_clients', clients); }, [clients]);
  useEffect(() => { saveToLocalStorage('solvoiq_local_teamMembers', teamMembers); }, [teamMembers]);
  useEffect(() => { saveToLocalStorage('solvoiq_local_tasks', tasks); }, [tasks]);
  useEffect(() => { saveToLocalStorage('solvoiq_local_kpis', kpis); }, [kpis]);
  useEffect(() => { saveToLocalStorage('solvoiq_local_templates', templates); }, [templates]);
  useEffect(() => { saveToLocalStorage('solvoiq_local_oneOnOneSessions', oneOnOneSessions); }, [oneOnOneSessions]);
  useEffect(() => { saveToLocalStorage('solvoiq_local_ptlReports', ptlReports); }, [ptlReports]);
  useEffect(() => { saveToLocalStorage('solvoiq_local_coachingFeedForwards', coachingFeedForwards); }, [coachingFeedForwards]);
  

  const handleEnterDashboardFromLanding = () => {
    setShowLandingPage(false);
    localStorage.setItem('solvoiq_local_has_seen_landing', 'true');
  };

  const handleLogout = () => {
    localStorage.removeItem('solvoiq_local_active_user');
    localStorage.removeItem('solvoiq_local_has_seen_landing'); 
    
    const defaultUser = JUAN_BELCAZAR_PROFILE;
    setActiveUser(defaultUser); 
    saveToLocalStorage('solvoiq_local_active_user', defaultUser);

    setShowLandingPage(true);
    setCurrentPage('dashboard');
  };

  useEffect(() => {
    const lastSeenVersion = localStorage.getItem('solvoiq_local_last_seen_version');
    const currentAppVersion = "1.8.0_feature_removal"; // Updated version
    if (lastSeenVersion !== currentAppVersion && activeUser) {
      setIsWhatsNewModalOpen(true);
      localStorage.setItem('solvoiq_local_last_seen_version', currentAppVersion);
    }
  }, [activeUser]);

  const performSearch = useCallback((term: string) => {
    if (term.trim() === '') { setSearchResults([]); return; }
    const lowerCaseTerm = term.toLowerCase();
    const newResults: SearchResultItem[] = [];
    clients.forEach(clientItem => { if (clientItem.name.toLowerCase().includes(lowerCaseTerm) || clientItem.notes.toLowerCase().includes(lowerCaseTerm) || clientItem.tags.some(tag => tag.toLowerCase().includes(lowerCaseTerm))) { newResults.push({ type: 'client', data: clientItem }); }});
    teamMembers.forEach(memberItem => { if (memberItem.name.toLowerCase().includes(lowerCaseTerm) || memberItem.role.toLowerCase().includes(lowerCaseTerm) || memberItem.skills?.some(skill => skill.toLowerCase().includes(lowerCaseTerm))) { newResults.push({ type: 'teamMember', data: memberItem }); }});
    tasks.forEach(taskItem => { if (taskItem.title.toLowerCase().includes(lowerCaseTerm) || taskItem.description.toLowerCase().includes(lowerCaseTerm)) { newResults.push({ type: 'task', data: taskItem }); }});
    templates.forEach(templateItem => { if (templateItem.name.toLowerCase().includes(lowerCaseTerm) || templateItem.content.toLowerCase().includes(lowerCaseTerm) || templateItem.tags.some(tag => tag.toLowerCase().includes(lowerCaseTerm))) { newResults.push({ type: 'template', data: templateItem }); }});
    setSearchResults(newResults);
  }, [clients, teamMembers, tasks, templates]);

  const debouncedSearch = useMemo(() => { let timeoutId: ReturnType<typeof setTimeout>; return (termToSearch: string) => { clearTimeout(timeoutId); timeoutId = setTimeout(() => { performSearch(termToSearch); }, 300); }; }, [performSearch]);
  const handleSearchChange = (termToSearch: string) => { setSearchTerm(termToSearch); debouncedSearch(termToSearch); };

  const openModal = (modalDialogTitle: string, modalDialogContent: React.ReactNode, currentFormMode: FormMode = 'add', currentItem: EditableItem | TeamMember | null = null) => { setModalTitle(modalDialogTitle); setModalContent(modalDialogContent); setFormMode(currentFormMode); setEditingItem(currentItem); setIsModalOpen(true); };
  const closeModal = () => { setIsModalOpen(false); setModalTitle(''); setModalContent(null); setEditingItem(null); };
  const openTemplatePreviewModal = (templateToPreview: Template) => { setSelectedTemplateForPreview(templateToPreview); setIsTemplatePreviewModalOpen(true); };
  const closeTemplatePreviewModal = () => { setIsTemplatePreviewModalOpen(false); setSelectedTemplateForPreview(null); };
  const openWhatsNewModal = () => setIsWhatsNewModalOpen(true);
  const closeWhatsNewModal = () => setIsWhatsNewModalOpen(false);
  const openOneOnOneSessionsForMember = (memberForSessions: TeamMember) => { setSelectedTeamMemberForOneOnOnes(memberForSessions); setIsOneOnOneSessionsModalOpen(true); };
  const closeOneOnOneSessionsModal = () => { setIsOneOnOneSessionsModalOpen(false); setSelectedTeamMemberForOneOnOnes(null); };
  const openOneOnOneForm = (currentOneOnOneFormMode: FormMode, session?: OneOnOneSession, teamMemberForSession?: TeamMember) => { setOneOnOneFormMode(currentOneOnOneFormMode); setEditingOneOnOneSession(session || null); setSelectedTeamMemberForOneOnOnes(teamMemberForSession || selectedTeamMemberForOneOnOnes); setIsOneOnOneFormModalOpen(true); if(isOneOnOneSessionsModalOpen) setIsOneOnOneSessionsModalOpen(false); };
  const closeOneOnOneFormModal = () => { setIsOneOnOneFormModalOpen(false); setEditingOneOnOneSession(null); if (selectedTeamMemberForOneOnOnes && !isOneOnOneSessionsModalOpen) { setIsOneOnOneSessionsModalOpen(true); }};
  const openLogKpiDataModal = (kpiToLog: Kpi) => { setKpiToLogDataFor(kpiToLog); setIsLogKpiDataModalOpen(true); };
  const closeLogKpiDataModal = () => { setKpiToLogDataFor(null); setIsLogKpiDataModalOpen(false); };

  // CRUD operations
  const handleAddKpiHistoricalData = (kpiIdToAddDataTo: string, dataEntry: Omit<KpiHistoricalDataEntry, 'id' | 'loggedBy'>) => {
    setKpis(prevKpis => prevKpis.map(k => k.id === kpiIdToAddDataTo ? {
        ...k,
        actual: dataEntry.actual, 
        historicalData: [{ ...dataEntry, id: `hist-${Date.now()}`, loggedBy: activeUser.id }, ...k.historicalData].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    } : k));
    closeLogKpiDataModal();
  };

  const handleAddKpi = (kpiDataToAdd: Omit<Kpi, 'id'>) => {
    const newKpi: Kpi = { ...kpiDataToAdd, id: `kpi-${Date.now()}-${Math.random().toString(16).slice(2)}`, historicalData: [] };
     if (kpiDataToAdd.actual && !newKpi.historicalData.some(h => h.actual === kpiDataToAdd.actual)) {
        newKpi.historicalData.push({
            id: `hist-init-${Date.now()}`,
            date: new Date().toISOString(),
            actual: kpiDataToAdd.actual,
            target: kpiDataToAdd.target,
            loggedBy: activeUser?.id || "system-initial",
            notes: 'Initial KPI value setting.'
        });
    }
    setKpis(prev => [...prev, newKpi]);
    closeModal();
  };
  const handleUpdateKpi = (kpiDataToUpdate: Kpi) => {
    setKpis(prev => prev.map(k => k.id === kpiDataToUpdate.id ? kpiDataToUpdate : k));
    closeModal();
  };
  const handleDeleteKpi = (idToDelete: string) => {
    if (window.confirm(`Are you sure you want to delete KPI?`)) {
      setKpis(prev => prev.filter(k => k.id !== idToDelete));
      setTeamMembers(prevMembers => prevMembers.map(memberItem => ({ ...memberItem, assignedKpis: memberItem.assignedKpis?.filter(kpiId => kpiId !== idToDelete) })));
    }
  };
  const openKpiForm = (currentFormMode: FormMode, kpiItem?: Kpi) => { openModal(currentFormMode === 'add' ? 'Add New KPI' : 'Edit KPI', <KpiForm onSubmit={currentFormMode === 'add' ? handleAddKpi : handleUpdateKpi} initialData={kpiItem} mode={currentFormMode} />, currentFormMode, kpiItem); };

  const handleAddClient = (clientDataToAdd: Omit<Client, 'id'>) => {
    const newClient: Client = { ...clientDataToAdd, id: `client-${Date.now()}-${Math.random().toString(16).slice(2)}`, pulseLog: [], emailLogs: [] };
    setClients(prev => [...prev, newClient]);
    closeModal();
  };
  const handleUpdateClient = (clientDataToUpdate: Client) => {
    setClients(prev => prev.map(c => c.id === clientDataToUpdate.id ? clientDataToUpdate : c));
    closeModal();
    if (currentPage === 'clients' && editingItem && (editingItem as Client).id === clientDataToUpdate.id) { setEditingItem(clientDataToUpdate); }
  };
  const handleDeleteClient = (idToDelete: string) => {
    if (window.confirm(`Are you sure you want to delete client? This may affect associated tasks.`)) {
      setClients(prev => prev.filter(c => c.id !== idToDelete));
      setTasks(prevTasks => prevTasks.map(t => t.clientId === idToDelete ? { ...t, clientId: null } : t));
    }
  };
  const openClientForm = (currentFormMode: FormMode, clientItem?: Client) => { openModal(currentFormMode === 'add' ? 'Add New Client' : 'Edit Client', <ClientForm onSubmit={currentFormMode === 'add' ? handleAddClient : handleUpdateClient} initialData={clientItem} mode={currentFormMode} teamMembers={teamMembers} />, currentFormMode, clientItem); };

  const handleAddPulseLogEntry = (clientIdToLogTo: string, entryDataToAdd: Omit<PulseLogEntry, 'id'>) => {
    setClients(prev => prev.map(c => c.id === clientIdToLogTo ? { ...c, pulseLog: [{ ...entryDataToAdd, id: `pulse-${Date.now()}`}, ...c.pulseLog] } : c));
  };

  const handleAddClientEmailLog = (clientIdForEmailLog: string, emailLogDataToAdd: Omit<ClientEmailLog, 'id' | 'loggedAt' | 'loggedBy' | 'clientId'>) => {
    const newLog: ClientEmailLog = { ...emailLogDataToAdd, clientId: clientIdForEmailLog, id: `email-${Date.now()}`, loggedAt: new Date().toISOString(), loggedBy: activeUser.id };
    setClients(prevClients => prevClients.map(clientItem => clientItem.id === clientIdForEmailLog ? {...clientItem, emailLogs: [newLog, ...(clientItem.emailLogs || [])]} : clientItem ));
  };

  const handleDeleteClientEmailLog = (clientIdForEmailLog: string, emailLogIdToDelete: string) => {
    if (window.confirm('Are you sure you want to delete this email log?')) {
        setClients(prevClients => prevClients.map(clientItem => clientItem.id === clientIdForEmailLog ? {...clientItem, emailLogs: (clientItem.emailLogs || []).filter(log => log.id !== emailLogIdToDelete)} : clientItem));
    }
  };

  const handleAddTask = (taskDataToAdd: Omit<Task, 'id'>) => {
    const newTask: Task = { ...taskDataToAdd, id: `task-${Date.now()}-${Math.random().toString(16).slice(2)}` };
    setTasks(prev => [...prev, newTask]);
    closeModal();
    if(isOneOnOneFormModalOpen) closeOneOnOneFormModal();
  };
  const handleUpdateTask = (taskDataToUpdate: Task) => {
    setTasks(prev => prev.map(t => t.id === taskDataToUpdate.id ? taskDataToUpdate : t));
    closeModal();
    if(isOneOnOneFormModalOpen) closeOneOnOneFormModal();
  };
  const handleDeleteTask = (idToDelete: string) => {
    if (window.confirm(`Are you sure you want to delete task?`)) { setTasks(prev => prev.filter(t => t.id !== idToDelete)); }
  };
  const openTaskForm = (currentFormMode: FormMode, taskItem?: Task) => {
    openModal(currentFormMode === 'add' ? 'Add New Task' : 'Edit Task', <TaskForm onSubmit={currentFormMode === 'add' ? handleAddTask : handleUpdateTask} initialData={taskItem} mode={currentFormMode} clients={clients} teamMembers={teamMembers} currentUser={activeUser} />, currentFormMode, taskItem);
  };

  const handleAddTeamMember = (memberDataToAdd: Omit<TeamMember, 'id'>) => {
    const newMember: TeamMember = { ...memberDataToAdd, id: `tm-${Date.now()}-${Math.random().toString(16).slice(2)}` };
    setTeamMembers(prev => [...prev, newMember]);
    closeModal();
  };
  const handleUpdateTeamMember = (memberDataToUpdate: TeamMember) => {
    setTeamMembers(prev => prev.map(m => m.id === memberDataToUpdate.id ? memberDataToUpdate : m));
    closeModal();
  };
  const handleDeleteTeamMember = (idToDelete: string) => {
    const memberToDeleteItem = teamMembers.find(m => m.id === idToDelete);
    if (memberToDeleteItem?.id === activeUser.id) { alert("Cannot delete your own user profile."); return; }
    if (window.confirm(`Are you sure you want to delete team member? This will reassign their tasks to ${activeUser.name} and remove them from client assignments.`)) {
      setTeamMembers(prev => prev.filter(m => m.id !== idToDelete));
      setClients(prevClientsList => prevClientsList.map(c => ({ ...c, assignedTeamMembers: c.assignedTeamMembers.filter(memberId => memberId !== idToDelete) })));
      setTasks(prevTasksList => prevTasksList.map(t => (t.assignedTo === memberToDeleteItem?.name ? { ...t, assignedTo: activeUser.name } : t)));
      setOneOnOneSessions(prevSessions => prevSessions.filter(s => s.teamMemberId !== idToDelete));
      setPtlReports(prev => prev.filter(r => r.soulverId !== idToDelete));
      setCoachingFeedForwards(prev => prev.filter(cff => cff.soulverId !== idToDelete));
    }
  };
  const openTeamMemberForm = (currentFormMode: FormMode, memberItem?: TeamMember) => { openModal(currentFormMode === 'add' ? 'Add New Team Member' : 'Edit Team Member', <TeamMemberForm onSubmit={(data) => { if (currentFormMode === 'add') { handleAddTeamMember(data as Omit<TeamMember, 'id'>); } else { handleUpdateTeamMember(data as TeamMember); } }} initialData={memberItem} mode={currentFormMode} allKpis={kpis} />, currentFormMode, memberItem); };

  const handleAddTemplate = (templateDataToAdd: Omit<Template, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newTemplate = { ...templateDataToAdd, id: `tpl-${Date.now()}`, createdAt: now, updatedAt: now } as Template;
    setTemplates(prev => [...prev, newTemplate]);
    closeModal();
  };
  const handleUpdateTemplate = (templateDataToUpdate: Template) => {
    const updatedTemplate = { ...templateDataToUpdate, updatedAt: new Date().toISOString() };
    setTemplates(prev => prev.map(t => t.id === updatedTemplate.id ? updatedTemplate : t));
    closeModal();
  };
  const handleDeleteTemplate = (idToDelete: string) => {
    if (window.confirm(`Are you sure you want to delete template?`)) {
      setTemplates(prev => prev.filter(t => t.id !== idToDelete));
    }
  };
  const openTemplateForm = (currentFormMode: FormMode, templateItem?: Template) => { openModal(currentFormMode === 'add' ? 'Add New Template' : 'Edit Template', <TemplateForm onSubmit={currentFormMode === 'add' ? handleAddTemplate : handleUpdateTemplate} initialData={templateItem} mode={currentFormMode} />, currentFormMode, templateItem); };

  const handleAddOneOnOneSession = (sessionDataToAdd: Omit<OneOnOneSession, 'id'>) => {
    const newSession: OneOnOneSession = { ...sessionDataToAdd, id: `oos-${Date.now()}` };
    setOneOnOneSessions(prev => [...prev, newSession]);
    closeOneOnOneFormModal();
  };
  const handleUpdateOneOnOneSession = (sessionDataToUpdate: OneOnOneSession) => {
    setOneOnOneSessions(prev => prev.map(s => s.id === sessionDataToUpdate.id ? sessionDataToUpdate : s));
    closeOneOnOneFormModal();
  };
  const handleDeleteOneOnOneSession = (sessionIdToDelete: string) => {
    if (window.confirm('Are you sure you want to delete this 1-on-1 session?')) {
      setOneOnOneSessions(prev => prev.filter(s => s.id !== sessionIdToDelete));
    }
  };

  const handleAddPtlReport = (reportDataToAdd: Omit<PtlReport, 'id'>) => {
    const newReport: PtlReport = { ...reportDataToAdd, id: `ptl-${Date.now()}` };
    setPtlReports(prev => [...prev, newReport]);
  };
  const handleUpdatePtlReport = (reportDataToUpdate: PtlReport) => {
    setPtlReports(prev => prev.map(r => r.id === reportDataToUpdate.id ? reportDataToUpdate : r));
  };
  const handleDeletePtlReport = (reportIdToDelete: string) => {
    if (window.confirm('Are you sure you want to delete this PTL report?')) {
      setPtlReports(prev => prev.filter(r => r.id !== reportIdToDelete));
    }
  };

  const handleAddCoachingFeedForward = (cffDataToAdd: Omit<CoachingFeedForward, 'id'>) => {
    const newCff: CoachingFeedForward = { ...cffDataToAdd, id: `cff-${Date.now()}` };
    setCoachingFeedForwards(prev => [...prev, newCff]);
  };
  const handleUpdateCoachingFeedForward = (cffDataToUpdate: CoachingFeedForward) => {
    setCoachingFeedForwards(prev => prev.map(c => c.id === cffDataToUpdate.id ? cffDataToUpdate : c));
  };
  const handleDeleteCoachingFeedForward = (cffIdToDelete: string) => {
    if (window.confirm('Are you sure you want to delete this Coaching Feed Forward entry?')) {
      setCoachingFeedForwards(prev => prev.filter(c => c.id !== cffIdToDelete));
    }
  };

  const renderPage = () => {
    if (isLoading) { return <div className="flex justify-center items-center h-full"><LoadingSpinner text="Loading data..." /></div>; }
    if (error) { return <div className="text-center text-danger p-10">{error}</div>; }

    if (searchTerm.trim() !== '' && searchResults.length > 0) { return <SearchResultsPage results={searchResults} setCurrentPage={setCurrentPage} setSearchTerm={setSearchTerm} />; }
    if (searchTerm.trim() !== '' && searchResults.length === 0) { return <SearchResultsPage results={searchResults} setCurrentPage={setCurrentPage} setSearchTerm={setSearchTerm} />; }

    switch (currentPage) {
      case 'dashboard': return <DashboardPage clients={clients} tasks={tasks} teamMembers={teamMembers} user={activeUser} recentActivity={recentActivity} kpis={kpis} />;
      case 'clients': return <ClientsPage clients={clients} tasks={tasks} teamMembers={teamMembers} onOpenClientForm={openClientForm} onDeleteClient={handleDeleteClient} handleAddPulseLogEntry={handleAddPulseLogEntry} allKpis={kpis} onUpdateClient={handleUpdateClient} onAddClientEmailLog={handleAddClientEmailLog} onDeleteClientEmailLog={handleDeleteClientEmailLog} onOpenLogKpiDataModal={openLogKpiDataModal} userProfile={activeUser} setClients={setClients} />;
      case 'team': return <TeamPage teamMembers={teamMembers} clients={clients} tasks={tasks} kpis={kpis} oneOnOneSessions={oneOnOneSessions} onOpenTeamMemberForm={openTeamMemberForm} onDeleteTeamMember={handleDeleteTeamMember} onOpenOneOnOneSessionsModal={openOneOnOneSessionsForMember} activeUserId={activeUser.id} />;
      case 'tasks': return <TasksPage tasks={tasks} clients={clients} teamMembers={teamMembers} currentUser={activeUser} onOpenTaskForm={openTaskForm} onDeleteTask={handleDeleteTask} updateTaskStatus={handleUpdateTask} setTasks={setTasks} />;
      case 'kpi-library': return <KpiLibraryPage kpis={kpis} onOpenKpiForm={openKpiForm} onDeleteKpi={handleDeleteKpi} onOpenLogKpiDataModal={openLogKpiDataModal} />;
      case 'kpi-goals': return <KpiGoalsPage kpis={kpis} />;
      case 'templates': return <TemplatesPage templates={templates} onOpenTemplateForm={openTemplateForm} onDeleteTemplate={handleDeleteTemplate} onOpenTemplatePreviewModal={openTemplatePreviewModal} />;
      case 'ptl-reports': return <PtlReportsPage ptlReports={ptlReports} teamMembers={teamMembers} clients={clients} currentUser={activeUser} onAddPtlReport={handleAddPtlReport} onUpdatePtlReport={handleUpdatePtlReport} onDeletePtlReport={handleDeletePtlReport} />;
      case 'coaching-feed-forward': return <CoachingFeedForwardPage coachingFeedForwards={coachingFeedForwards} teamMembers={teamMembers} currentUser={activeUser} onAddCoachingFeedForward={handleAddCoachingFeedForward} onUpdateCoachingFeedForward={handleUpdateCoachingFeedForward} onDeleteCoachingFeedForward={handleDeleteCoachingFeedForward} />;
      default: return <DashboardPage clients={clients} tasks={tasks} teamMembers={teamMembers} user={activeUser} recentActivity={recentActivity} kpis={kpis} />;
    }
  };

  const globalActionButtonContainer = document.getElementById('global-action-button-container');
  const aiChatWidgetContainer = document.getElementById('ai-chat-widget-container'); 

  if (showLandingPage) { 
    return <LandingPage onEnterDashboard={handleEnterDashboardFromLanding} />; 
  }

  return (
    <div className="flex h-screen bg-light-bg">
      <Sidebar currentPage={currentPage} onNavigate={(pageId) => { setSearchTerm(''); setSearchResults([]); setCurrentPage(pageId as PageId); }} appName={APP_NAME} appTagline={APP_TAGLINE} userProfile={activeUser} navLinks={NAVIGATION_LINKS} onShowWhatsNew={openWhatsNewModal} onLogout={handleLogout}/>
      <div className="flex-1 flex flex-col overflow-hidden ml-64">
        <header className="bg-sidebar-bg shadow-subtle p-4 border-b border-border-color">
          <SearchBar searchTerm={searchTerm} onSearchChange={handleSearchChange} />
        </header>
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-light-bg p-6 custom-scrollbar">
          {renderPage()}
        </main>
      </div>
      {globalActionButtonContainer && ReactDOM.createPortal( <GlobalActionButton currentPage={currentPage} onOpenClientForm={() => openClientForm('add')} onOpenTaskForm={() => openTaskForm('add')} onOpenKpiForm={() => openKpiForm('add')} onOpenTeamMemberForm={() => openTeamMemberForm('add')} onOpenTemplateForm={() => openTemplateForm('add')} />, globalActionButtonContainer)}
      {aiChatWidgetContainer && ReactDOM.createPortal( null, aiChatWidgetContainer )} 

      {isModalOpen && modalContent && !isTemplatePreviewModalOpen && !isWhatsNewModalOpen && !isOneOnOneSessionsModalOpen && !isOneOnOneFormModalOpen && !isLogKpiDataModalOpen && ( <Modal isOpen={isModalOpen} onClose={closeModal} title={modalTitle}> {modalContent} </Modal> )}
      {isTemplatePreviewModalOpen && selectedTemplateForPreview && ( <Modal isOpen={isTemplatePreviewModalOpen} onClose={closeTemplatePreviewModal} title={selectedTemplateForPreview.name}> <TemplatePreviewContent template={selectedTemplateForPreview} /> </Modal> )}
      {isWhatsNewModalOpen && ( <Modal isOpen={isWhatsNewModalOpen} onClose={closeWhatsNewModal} title="🚀 What's New in SolvoIQ!"> <div className="space-y-3 text-sm text-medium-text max-h-[70vh] overflow-y-auto custom-scrollbar pr-2"> <p className="font-semibold text-dark-text text-base">Version 1.8.0: Feature Optimization</p> <ul className="list-disc list-inside space-y-2"><li><strong>Streamlined Experience:</strong> Removed AI Chat Widget, AI Assistants, Knowledge Center, and Email Tools to focus on core operational management.</li><li><strong>Performance:</strong> This update aims to simplify the application and improve overall responsiveness.</li></ul> <p className="font-semibold text-dark-text text-base mt-3">Previous Update (v1.7.0): JSON Data Import/Export</p> <ul className="list-disc list-inside space-y-2"> <li><strong>Export/Import Tasks:</strong> You can now export all tasks to a JSON file and import them back. Access this from the Tasks page filter bar.</li> <li><strong>Export/Import Clients:</strong> Client data can also be exported and imported via JSON files from the Clients page filter bar.</li><li><strong>Data Safety:</strong> Importing data will replace existing data for that category (Tasks or Clients). Please use with caution and ensure your JSON file format is correct. Basic validation is in place.</li><li><strong className="text-warning">Note:</strong> This feature is useful for backups or transferring data between browsers/devices.</li></ul> <p className="pt-2 text-xs text-light-text">This version streamlines the application by removing selected features.</p> </div> </Modal> )}
      {isOneOnOneSessionsModalOpen && selectedTeamMemberForOneOnOnes && ( <OneOnOneSessionsModal isOpen={isOneOnOneSessionsModalOpen} onClose={closeOneOnOneSessionsModal} teamMember={selectedTeamMemberForOneOnOnes} sessions={oneOnOneSessions.filter(s => s.teamMemberId === selectedTeamMemberForOneOnOnes.id)} onAddNewSession={() => openOneOnOneForm('add', undefined, selectedTeamMemberForOneOnOnes)} onEditSession={(session) => openOneOnOneForm('edit', session, selectedTeamMemberForOneOnOnes)} onDeleteSession={handleDeleteOneOnOneSession} supervisors={teamMembers} /> )}
      {isOneOnOneFormModalOpen && selectedTeamMemberForOneOnOnes && activeUser && ( <Modal isOpen={isOneOnOneFormModalOpen} onClose={closeOneOnOneFormModal} title={oneOnOneFormMode === 'add' ? `New 1-on-1 for ${selectedTeamMemberForOneOnOnes.name}` : `Edit 1-on-1 for ${selectedTeamMemberForOneOnOnes.name}`}> <OneOnOneSessionForm teamMember={selectedTeamMemberForOneOnOnes} currentUser={activeUser} onSubmit={oneOnOneFormMode === 'add' ? handleAddOneOnOneSession : handleUpdateOneOnOneSession} initialData={editingOneOnOneSession} mode={oneOnOneFormMode} onCancel={closeOneOnOneFormModal} onTaskCreate={handleAddTask} /> </Modal> )}
      {isLogKpiDataModalOpen && kpiToLogDataFor && activeUser && ( <LogKpiDataModal isOpen={isLogKpiDataModalOpen} onClose={closeLogKpiDataModal} kpi={kpiToLogDataFor} onSubmit={handleAddKpiHistoricalData} currentUser={activeUser} /> )}
    </div>
  );
};