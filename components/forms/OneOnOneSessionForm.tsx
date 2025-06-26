

import React, { useState, useEffect, useRef } from 'react';
import { OneOnOneSession, TeamMember, TurnoverRiskLevel, FormMode, RiskAssessmentDetails, MitigationActionItem, Task, TaskStatus, TaskPriority } from '../../types';
import { GEMINI_MODEL_TEXT } from '../../constants';
import { GoogleGenAI } from "@google/genai";
import { Wand2, PlusCircle, Trash2, ListChecks, CheckSquare, Square } from 'lucide-react';
import { LoadingSpinner } from '../LoadingSpinner';

interface OneOnOneSessionFormProps {
  teamMember: TeamMember;
  currentUser: TeamMember;
  onSubmit: (data: OneOnOneSession | Omit<OneOnOneSession, 'id'>) => void;
  initialData?: OneOnOneSession | null;
  mode: FormMode;
  onCancel: () => void;
  onTaskCreate: (taskData: Omit<Task, 'id'>) => void;
}

const inputBaseClasses = "mt-1 block w-full px-3 py-2 border border-border-color rounded-md shadow-subtle focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm bg-input-bg text-dark-text placeholder-placeholder-color";
const buttonPrimaryClasses = "inline-flex items-center justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50";
const buttonSecondaryClasses = "inline-flex items-center justify-center py-2 px-4 border border-border-color shadow-sm text-sm font-medium rounded-md text-medium-text bg-input-bg hover:bg-border-color focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-dark";
const labelClasses = "block text-sm font-medium text-medium-text";
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

export const OneOnOneSessionForm: React.FC<OneOnOneSessionFormProps> = ({
  teamMember, currentUser, onSubmit, initialData, mode, onCancel, onTaskCreate
}) => {
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().split('T')[0]);
  const [generalNotes, setGeneralNotes] = useState('');
  const [turnoverRisk, setTurnoverRisk] = useState<TurnoverRiskLevel>(TurnoverRiskLevel.LOW);
  
  const [riskAssessment, setRiskAssessment] = useState<RiskAssessmentDetails | undefined>(undefined);
  const [actionItems, setActionItems] = useState<MitigationActionItem[]>([]);
  const [newActionItemDescription, setNewActionItemDescription] = useState('');

  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setSessionDate(new Date(initialData.sessionDate).toISOString().split('T')[0]);
      setGeneralNotes(initialData.generalNotes);
      setTurnoverRisk(initialData.turnoverRisk);
      setRiskAssessment(initialData.riskAssessment);
      setActionItems(initialData.actionItems || []);
    } else {
      // Reset for new form
      setSessionDate(new Date().toISOString().split('T')[0]);
      setGeneralNotes('');
      setTurnoverRisk(TurnoverRiskLevel.LOW);
      setRiskAssessment(undefined);
      setActionItems([]);
    }
  }, [initialData]);

  const handleAiAnalysis = async () => {
    if (!generalNotes.trim() || (turnoverRisk !== TurnoverRiskLevel.MEDIUM && turnoverRisk !== TurnoverRiskLevel.HIGH)) {
      setAiError("Please provide general notes and select Medium or High risk before AI analysis.");
      return;
    }
    setIsAiAnalyzing(true);
    setAiError(null);
    const prompt = `
      Team Member: ${teamMember.name} (Role: ${teamMember.role})
      Supervisor: ${currentUser.name}
      1-on-1 General Notes:
      ---
      ${generalNotes}
      ---
      Identified Turnover Risk Level: ${turnoverRisk}

      Based on the notes and risk level, provide a concise:
      1. Identified Risk (summary of the core issue contributing to turnover risk)
      2. Root Cause (underlying reason for the identified risk)
      3. Suggested Mitigation Plan (actionable steps to address the root cause and reduce risk)

      Respond in JSON format with keys: "identifiedRisk", "rootCause", "suggestedMitigationPlan".
      Each value should be a string. The suggestedMitigationPlan can include multiple steps, perhaps using newlines.
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
      
      const analysisResult: RiskAssessmentDetails = JSON.parse(jsonStr);
      setRiskAssessment(analysisResult);
    } catch (err: any) {
      console.error("AI Analysis Error:", err);
      setAiError(err.message || "Failed to get AI analysis.");
      setRiskAssessment(undefined);
    } finally {
      setIsAiAnalyzing(false);
    }
  };

  const handleAddActionItem = () => {
    if (!newActionItemDescription.trim()) return;
    const newItem: MitigationActionItem = {
      id: `action-${Date.now()}`,
      description: newActionItemDescription.trim(),
      completed: false,
    };
    setActionItems([...actionItems, newItem]);
    setNewActionItemDescription('');
  };

  const handleToggleActionItemComplete = (itemId: string) => {
    setActionItems(items => items.map(item => item.id === itemId ? { ...item, completed: !item.completed } : item));
  };

  const handleDeleteActionItem = (itemId: string) => {
    setActionItems(items => items.filter(item => item.id !== itemId));
  };

  const handleCreateTaskFromActionItem = (item: MitigationActionItem) => {
    const taskTitle = `1-on-1 Action: ${item.description.substring(0,50)}${item.description.length > 50 ? '...' : ''}`;
    const taskDescription = `From 1-on-1 session with ${teamMember.name} on ${new Date(sessionDate).toLocaleDateString()}.\nOriginal Action Item: ${item.description}\n\nContext:\n${riskAssessment?.suggestedMitigationPlan || generalNotes}`;
    
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7); // Default due in 7 days

    const newTaskData: Omit<Task, 'id'> = {
      title: taskTitle,
      description: taskDescription,
      status: TaskStatus.PENDING,
      dueDate: dueDate.toISOString(),
      assignedTo: currentUser.name, // Assign to supervisor
      clientId: null, 
      priority: TaskPriority.MEDIUM,
    };
    onTaskCreate(newTaskData);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const sessionData = {
      teamMemberId: teamMember.id,
      supervisorId: currentUser.id,
      sessionDate: new Date(sessionDate).toISOString(),
      generalNotes,
      turnoverRisk,
      riskAssessment: (turnoverRisk === TurnoverRiskLevel.MEDIUM || turnoverRisk === TurnoverRiskLevel.HIGH) ? riskAssessment : undefined,
      actionItems,
    };

    if (mode === 'edit' && initialData) {
      onSubmit({ ...initialData, ...sessionData });
    } else {
      onSubmit(sessionData as Omit<OneOnOneSession, 'id'>);
    }
  };
  
  const showRiskAssessmentSection = turnoverRisk === TurnoverRiskLevel.MEDIUM || turnoverRisk === TurnoverRiskLevel.HIGH;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="sessionDate" className={labelClasses}>Session Date</label>
        <input type="date" id="sessionDate" value={sessionDate} onChange={(e) => setSessionDate(e.target.value)} required className={`${inputBaseClasses} dark:[color-scheme:dark]`} />
      </div>
      <div>
        <label htmlFor="supervisor" className={labelClasses}>Supervisor</label>
        <input type="text" id="supervisor" value={currentUser.name} readOnly className={`${inputBaseClasses} bg-sidebar-bg`} />
      </div>
      <div>
        <label htmlFor="generalNotes" className={labelClasses}>General Notes / Discussion Points</label>
        <div className="relative">
          <textarea id="generalNotes" value={generalNotes} onChange={(e) => setGeneralNotes(e.target.value)} rows={4} required className={`${inputBaseClasses}`} />
        </div>
      </div>
      <div>
        <label htmlFor="turnoverRisk" className={labelClasses}>Turnover Risk Level</label>
        <select id="turnoverRisk" value={turnoverRisk} onChange={(e) => setTurnoverRisk(e.target.value as TurnoverRiskLevel)} required className={`${inputBaseClasses} appearance-none`}>
          {Object.values(TurnoverRiskLevel).map(level => <option key={level} value={level} className="bg-input-bg text-dark-text">{level}</option>)}
        </select>
      </div>

      {showRiskAssessmentSection && (
        <div className="p-4 border border-border-color rounded-md space-y-4 bg-sidebar-bg">
          <h3 className="text-md font-semibold text-dark-text border-b border-light-border pb-2">Risk Assessment & Mitigation</h3>
          <button
            type="button"
            onClick={handleAiAnalysis}
            disabled={isAiAnalyzing || !generalNotes.trim()}
            className={`${buttonPrimaryClasses} w-full bg-teal-600 hover:bg-teal-700 disabled:bg-teal-600/50`}
          >
            {isAiAnalyzing ? <LoadingSpinner size="sm" /> : <Wand2 size={16} className="mr-2" />}
            Analyze Notes with AI
          </button>
          {aiError && <p className="text-xs text-danger text-center">{aiError}</p>}
          
          <div>
            <label htmlFor="identifiedRisk" className={labelClasses}>Identified Risk (AI Suggested)</label>
            <textarea id="identifiedRisk" value={riskAssessment?.identifiedRisk || ''} onChange={(e) => setRiskAssessment(prev => ({...prev!, identifiedRisk: e.target.value}))} rows={2} className={inputBaseClasses} />
          </div>
          <div>
            <label htmlFor="rootCause" className={labelClasses}>Root Cause (AI Suggested)</label>
            <textarea id="rootCause" value={riskAssessment?.rootCause || ''} onChange={(e) => setRiskAssessment(prev => ({...prev!, rootCause: e.target.value}))} rows={2} className={inputBaseClasses} />
          </div>
          <div>
            <label htmlFor="suggestedMitigationPlan" className={labelClasses}>Suggested Mitigation Plan (AI Suggested)</label>
            <textarea id="suggestedMitigationPlan" value={riskAssessment?.suggestedMitigationPlan || ''} onChange={(e) => setRiskAssessment(prev => ({...prev!, suggestedMitigationPlan: e.target.value}))} rows={3} className={inputBaseClasses} />
          </div>
        </div>
      )}

      {showRiskAssessmentSection && (
        <div className="p-4 border border-border-color rounded-md space-y-3 bg-sidebar-bg">
            <h3 className="text-md font-semibold text-dark-text border-b border-light-border pb-2">Action Items</h3>
            <div className="flex gap-2">
                <input 
                    type="text" 
                    value={newActionItemDescription} 
                    onChange={(e) => setNewActionItemDescription(e.target.value)}
                    placeholder="Describe an action item..."
                    className={`${inputBaseClasses} mt-0 flex-grow`}
                />
                <button type="button" onClick={handleAddActionItem} className={`${buttonPrimaryClasses} self-end px-3 py-2.5 h-[calc(2.625rem)]`} title="Add Action Item">
                    <PlusCircle size={18}/>
                </button>
            </div>
            {actionItems.length === 0 && <p className="text-xs text-light-text text-center">No action items added yet.</p>}
            <ul className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar pr-1">
                {actionItems.map(item => (
                    <li key={item.id} className="flex items-center justify-between p-2 bg-input-bg border border-light-border rounded-md text-sm">
                        <div className="flex items-center flex-grow">
                             <button type="button" onClick={() => handleToggleActionItemComplete(item.id)} className="mr-2 p-0.5 text-medium-text hover:text-primary">
                                {item.completed ? <CheckSquare size={18} className="text-success"/> : <Square size={18} />}
                            </button>
                            <span className={`${item.completed ? 'line-through text-light-text' : 'text-medium-text'}`}>{item.description}</span>
                        </div>
                        <div className="flex-shrink-0 space-x-1.5">
                            {!item.taskId && !item.completed && (
                                <button type="button" onClick={() => handleCreateTaskFromActionItem(item)} className="text-xs text-blue-500 hover:text-blue-400 p-0.5" title="Create Task">
                                    <ListChecks size={16}/>
                                </button>
                            )}
                            <button type="button" onClick={() => handleDeleteActionItem(item.id)} className="text-xs text-danger hover:text-red-700 p-0.5" title="Delete Action">
                                <Trash2 size={16}/>
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
      )}

      <div className="flex justify-end space-x-3 pt-3">
        <button type="button" onClick={onCancel} className={buttonSecondaryClasses}>Cancel</button>
        <button type="submit" className={buttonPrimaryClasses}>
          {mode === 'add' ? 'Save Session' : 'Update Session'}
        </button>
      </div>
    </form>
  );
};