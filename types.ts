

import React from 'react';

export enum ClientStatus {
  HEALTHY = 'Healthy',
  AT_RISK = 'At-Risk',
  CRITICAL = 'Critical',
}

export enum TaskStatus {
  PENDING = 'Pending',
  IN_PROGRESS = 'In Progress',
  OVERDUE = 'Overdue',
  COMPLETED = 'Completed',
}

export enum TaskPriority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  dueDate: string; // ISO string
  assignedTo: string; // Team member name (aligns with current usage)
  clientId: string | null;
  priority: TaskPriority;
  elapsedTimeSeconds?: number; // Added for persistent timer
}

export interface PulseLogEntry {
  id: string;
  date: string;
  notes: string;
  type: 'Call' | 'Email' | 'Meeting';
}

export interface SOPDetails {
  exists: boolean;
  lastUpdatedDate?: string; // ISO date
  documentLink?: string; // URL to SharePoint or similar
  format?: 'Document' | 'Video' | 'Template' | 'Not Set';
}

export interface KpiReportingDetails {
  frequency: 'Weekly' | 'Monthly' | 'As Requested' | 'Client Declined Weekly' | 'Not Set';
  lastReportSentDate?: string; // ISO date
  reportLocationLink?: string; // URL to SharePoint folder
  clientPreferenceNotes?: string; // Notes on client's specific preferences
}

export interface ClientDocumentationChecklist {
  accountInfo: boolean;
  kpiReports: boolean;
  hoApproval: boolean; // Home Office Approvals for team members on this client
  sops: boolean;
}

export type FolderOrganizationStatus = 'Organized' | 'Needs Review' | 'Not Set';

// --- Client Email Log Types ---
export interface EmailAttachment {
  id: string;
  name: string;
  type: string; // e.g., 'application/pdf', 'image/jpeg'
  size?: number; // in bytes
  // url?: string; // If we were to store/link them
}

export interface ClientEmailLog {
  id: string;
  clientId: string; // To associate with the client - MADE NON-OPTIONAL
  direction: 'Sent' | 'Received';
  emailDate: string; // ISO string for date & time
  subject: string;
  fromAddress: string;
  toAddresses: string[];
  ccAddresses?: string[];
  bccAddresses?: string[];
  body: string; // Can be plain text or HTML
  attachments: EmailAttachment[];
  loggedBy: string; // User ID
  loggedAt: string; // ISO string
}
// --- End Client Email Log Types ---


export interface Client {
  id: string;
  name: string;
  status: ClientStatus;
  tags: string[];
  contactInfo: {
    email: string;
    phone: string;
    address: string;
  };
  notes: string;
  assignedTeamMembers: string[]; // Array of team member IDs
  pulseLog: PulseLogEntry[];
  sop?: SOPDetails; 
  kpiReporting?: KpiReportingDetails;
  // New Audit fields from boss's email
  sharepointFolderLink?: string;
  documentationChecklist?: ClientDocumentationChecklist;
  folderOrganizationStatus?: FolderOrganizationStatus;
  emailLogs?: ClientEmailLog[]; // Added for the new feature
}

export enum HomeOfficeStatus {
  ON_SITE_ONLY = 'On-Site Only',
  ELIGIBLE = 'Eligible for HO', // Based on tenure (e.g., >3 months)
  PENDING_CLIENT_APPROVAL = 'HO Pending Client Approval',
  APPROVED = 'HO Approved'
}

export interface HomeOfficeDetails {
  status: HomeOfficeStatus;
  approvalDate?: string; // Date client approved
  daysPerWeek?: 1 | 2;
  clientApprovalDocumentLink?: string; // URL to SharePoint
  notes?: string;
}

// UserProfile type for logged-in user context
export interface UserProfile {
  id: string;
  name: string;
  title: string;
  initials: string;
  email: string;
}

export interface TeamMember {
  id: string; // Will be username for login-capable users
  name: string;
  role: string; // Title
  email: string; // Made mandatory for potential user profiles
  hireDate?: string; // ISO date, for HO eligibility
  assignedKpis?: string[]; // Array of KPI IDs
  avatarInitials?: string; // Initials
  skills?: string[];
  homeOffice?: HomeOfficeDetails;
  department?: string; // Optional: internal department
}

export interface KpiHistoricalDataEntry {
  id: string; // Unique ID for this historical entry
  date: string; // ISO string
  actual: number;
  target?: number; // Optional target for this specific period
  notes?: string;
  loggedBy: string; // User ID of who logged this entry
}

export interface Kpi {
  id: string;
  name: string;
  description: string;
  target: number;
  actual: number; // This could represent the latest actual value or be derived from historicalData
  category?: string;
  clientNeedAlignment?: string; 
  roiDemonstration?: string; 
  historicalData: KpiHistoricalDataEntry[];
}

export enum TemplateCategory {
  EMAIL = 'Email',
  MESSAGE = 'Message',
  IT_TICKET = 'IT Ticket',
  REPORT = 'Report',
}

export interface BaseTemplate {
  id: string;
  name: string;
  category: TemplateCategory;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface EmailTemplate extends BaseTemplate {
  category: TemplateCategory.EMAIL;
  subject: string;
}

export interface MessageTemplate extends BaseTemplate {
  category: TemplateCategory.MESSAGE;
}

export type ITTicketPriority = 'Low' | 'Medium' | 'High';
export interface ITTicketTemplate extends BaseTemplate {
  category: TemplateCategory.IT_TICKET;
  ticketPriority: ITTicketPriority;
  assigneeSuggestion?: string;
}

export interface ReportTemplate extends BaseTemplate {
  category: TemplateCategory.REPORT;
  reportType: string; 
  dataFields?: string[]; 
}

export type Template = EmailTemplate | MessageTemplate | ITTicketTemplate | ReportTemplate;


export interface NavLink {
  name: string;
  icon: React.ElementType;
  pageId: PageId;
}

export interface NavSection {
  title: string;
  links: NavLink[];
}

export type PageId = 
  | 'dashboard' | 'clients' | 'team' | 'tasks' 
  | 'kpi-library' | 'templates' | 'kpi-goals'
  | 'ptl-reports' | 'coaching-feed-forward';
  // Removed: 'knowledge-center', 'email-tools', 'ai-assistants'

export type SearchResultItem = 
  | { type: 'client'; data: Client }
  | { type: 'teamMember'; data: TeamMember }
  | { type: 'task'; data: Task }
  | { type: 'template'; data: Template };
  // KnowledgeArticle removed

export interface RecentActivityItem {
  id: string;
  type: 'task_completed' | 'task_created' | 'client_added' | 'kpi_updated' | 'article_added' | 'team_join';
  text: string;
  timestamp: string; // ISO string or human-readable like "2 hours ago"
  icon: React.ElementType; // Lucide icon component
  userId?: string; // Optional: ID of user who performed action
}

// --- 1-on-1 Session Feature Types ---
export enum TurnoverRiskLevel {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
}

export interface MitigationActionItem {
  id: string;
  description: string;
  completed: boolean;
  taskId?: string; // Optional: links to a Task ID if created
}

export interface RiskAssessmentDetails {
  identifiedRisk: string;
  rootCause: string;
  suggestedMitigationPlan: string;
}

export interface OneOnOneSession {
  id: string;
  teamMemberId: string;
  sessionDate: string; // ISO string format
  supervisorId: string; // User ID of the supervisor conducting the session
  turnoverRisk: TurnoverRiskLevel;
  generalNotes: string;
  riskAssessment?: RiskAssessmentDetails; // Only if turnoverRisk is Medium or High
  actionItems?: MitigationActionItem[];
}
// --- End 1-on-1 Session Feature Types ---

// --- PTL Report Types ---
export type PtlMainDriver = 
  | 'Familiar' | 'Labor Discontent' | 'Studies' | 'Travel' | 'Tiredness'
  | 'Schedules' | 'Bonuses' | 'Leadership' | 'Transition – Company Change' | 'Facilities'
  | 'Requests Approvals' | 'Training' | 'Payroll' | 'Working Tools' | 'Job Offer'
  | 'Disciplinary' | 'Personal reasons' | 'Work environment' | 'Health issues'
  | 'Career path' | 'Trial Period' | 'Performance' | 'Risk of losing account'
  | 'Client not happy with soulver' | 'Promotion';

export interface PtlReport {
  id: string;
  soulverId: string; // TeamMember ID
  supervisorId: string; // User ID (from USER_PROFILE)
  reportDate: string; // ISO string date
  riskLevel: TurnoverRiskLevel;
  findings: string;
  mainDrivers: PtlMainDriver[];
  rootCause: string;
}
// --- End PTL Report Types ---

// --- Coaching Feed Forward Types ---
export type CoachingFeeling = 'Angry' | 'Tired' | 'Neutral' | 'Sad' | 'Happy';

export type CoachingReason = 
  | 'Account or project they work on' 
  | 'Key performance indicators' 
  | 'Task performed' 
  | 'Leadership experiences' 
  | 'Personal subjects' 
  | 'Other';

export interface CoachingLink {
  id: string; 
  title: string;
  url: string;
}

export interface CoachingFeedForward {
  id: string;
  soulverId: string; // TeamMember ID
  supervisorId: string; // User ID (from USER_PROFILE)
  feedForwardDate: string; // ISO string date
  soulverFeelings: CoachingFeeling;
  reasons: CoachingReason[];
  otherReasonText?: string; // Specific text if 'Other' reason is chosen
  leaderActions: string; // Max 500 chars
  soulverActions: string; // Max 500 chars
  hrSupportId: string | null; // TeamMember ID for HR support, can be null if not selected
  links: CoachingLink[];
}
// --- End Coaching Feed Forward Types ---


export type EditableItem = Client | Task | Kpi | TeamMember | Template | OneOnOneSession | PtlReport | CoachingFeedForward | ClientEmailLog | null; 
// Removed KnowledgeArticle, ClientEmailLog was already present

export type FormMode = 'add' | 'edit';


// Speech Recognition API Type Augmentation
// Based on MDN and common usage for Web Speech API (experimental)

export interface SpeechRecognitionEventMap {
  "audiostart": Event;
  "audioend": Event;
  "end": Event;
  "error": SpeechRecognitionErrorEvent; // Use specific event type if available or 'any'
  "nomatch": SpeechRecognitionEvent; // Use specific event type if available or 'any'
  "result": SpeechRecognitionEvent; // Use specific event type if available or 'any'
  "soundstart": Event;
  "soundend": Event;
  "speechstart": Event;
  "speechend": Event;
  "start": Event;
}

// Basic definition for SpeechRecognitionEvent, can be expanded
export interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
  // readonlyemma?: any; // For Emma support, if needed
  // readonlyinterpretation?: any; // For interpretation, if needed
}

export interface SpeechRecognitionErrorEvent extends Event { // Changed from ErrorEvent to Event for basic compatibility
  readonly error: string; // Corresponds to SpeechRecognitionErrorCode
  readonly message: string;
}

// Basic definition for SpeechRecognitionResultList
export interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

// Basic definition for SpeechRecognitionResult
export interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

// Basic definition for SpeechRecognitionAlternative
export interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}


export interface SpeechRecognition extends EventTarget {
  grammars: any; // SpeechGrammarList
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  // serviceURI: string; // Deprecated

  onaudiostart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onaudioend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
  onnomatch: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onsoundstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onsoundend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onspeechstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onspeechend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null;

  abort(): void;
  start(): void;
  stop(): void;

  addEventListener<K extends keyof SpeechRecognitionEventMap>(type: K, listener: (this: SpeechRecognition, ev: SpeechRecognitionEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
  addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
  removeEventListener<K extends keyof SpeechRecognitionEventMap>(type: K, listener: (this: SpeechRecognition, ev: SpeechRecognitionEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
  removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
}

declare global {
  interface Window {
    SpeechRecognition?: { new(): SpeechRecognition };
    webkitSpeechRecognition?: { new(): SpeechRecognition };
  }
}

// --- AI Chat Widget Types ---
export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string; // ISO string
}
// --- End AI Chat Widget Types ---
