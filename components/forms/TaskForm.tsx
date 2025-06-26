

import React, { useState, useEffect, useRef } from 'react';
import { Task, TaskStatus, Client, TeamMember, FormMode, TaskPriority } from '../../types';
import { GEMINI_MODEL_TEXT } from '../../constants';
import { Wand2, AlertTriangle, Copy } from 'lucide-react';
import { LoadingSpinner } from '../LoadingSpinner';
import { GoogleGenAI } from "@google/genai";

interface TaskFormProps {
  onSubmit: (data: Task | Omit<Task, 'id'>) => void;
  initialData?: Task;
  mode: FormMode;
  clients: Client[];
  teamMembers: TeamMember[];
  currentUser: TeamMember; // Added currentUser
}

const inputBaseClasses = "mt-1 block w-full px-3 py-2 border border-border-color rounded-md shadow-subtle focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm bg-input-bg text-dark-text placeholder-placeholder-color";
const buttonPrimaryClasses = "inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary";
const labelClasses = "block text-sm font-medium text-medium-text";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

export const TaskForm: React.FC<TaskFormProps> = ({ onSubmit, initialData, mode, clients, teamMembers, currentUser }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>(TaskStatus.PENDING);
  const [dueDate, setDueDate] = useState('');
  const [assignedTo, setAssignedTo] = useState(currentUser.name); // Default to current user
  const [clientId, setClientId] = useState<string | null>(null);
  const [priority, setPriority] = useState<TaskPriority>(TaskPriority.MEDIUM);
  
  const [isSuggestingDescription, setIsSuggestingDescription] = useState(false);
  const [isSuggestingPriority, setIsSuggestingPriority] = useState(false);
  const [aiSuggestedPriority, setAiSuggestedPriority] = useState<TaskPriority | null>(null);
  const [aiPriorityRationale, setAiPriorityRationale] = useState<string | null>(null);
  const [isSuggestingSubtasks, setIsSuggestingSubtasks] = useState(false);
  const [aiSuggestedSubtasks, setAiSuggestedSubtasks] = useState<string[]>([]);
  const [aiError, setAiError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setDescription(initialData.description);
      setStatus(initialData.status);
      setDueDate(initialData.dueDate ? new Date(initialData.dueDate).toISOString().substring(0, 10) : '');
      setAssignedTo(initialData.assignedTo);
      setClientId(initialData.clientId);
      setPriority(initialData.priority || TaskPriority.MEDIUM);
    } else {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setDueDate(tomorrow.toISOString().substring(0,10));
      setPriority(TaskPriority.MEDIUM);
      setTitle('');
      setDescription('');
      setStatus(TaskStatus.PENDING);
      setAssignedTo(currentUser.name); // Default to current user on add
      setClientId(null);
    }
    setAiSuggestedPriority(null);
    setAiPriorityRationale(null);
    setAiSuggestedSubtasks([]);
    setAiError(null);
  }, [initialData, mode, currentUser.name]); // Add currentUser.name to dependency array

  const handleSuggestDescription = async () => {
    if (!title.trim()) {
      setAiError("Please enter a task title first to suggest description.");
      return;
    }
    setIsSuggestingDescription(true);
    setAiError(null);
    const selectedClientName = clientId ? clients.find(c => c.id === clientId)?.name : null;
    
    let promptContext = `Task Title: ${title}`;
    if (selectedClientName) {
      promptContext += `\nFor Client: ${selectedClientName}`;
    }

    const prompt = `
      Based on the following context, generate a concise and actionable task description (around 1-3 sentences).
      ${promptContext}
      
      Example desired output for "Schedule meeting with Client X":
      "Organize and confirm a meeting with Client X to discuss project updates. Prepare agenda and send calendar invites."
    `;

    try {
      const response = await ai.models.generateContent({
        model: GEMINI_MODEL_TEXT,
        contents: prompt,
      });
      const suggestedDesc = response.text.trim();
      setDescription(suggestedDesc);
    } catch (err: any) {
      console.error("Error suggesting description:", err);
      setAiError(err.message || "Failed to suggest description.");
    } finally {
      setIsSuggestingDescription(false);
    }
  };

  const handleSuggestPriority = async () => {
    if (!title.trim() && !description.trim()) {
        setAiError("Please enter a title or description to suggest priority.");
        return;
    }
    setIsSuggestingPriority(true);
    setAiError(null);
    setAiSuggestedPriority(null);
    setAiPriorityRationale(null);

    const clientInfo = clientId ? clients.find(c => c.id === clientId) : null;
    const clientStatusText = clientInfo ? `for a client whose status is ${clientInfo.status}` : "not linked to a specific client";

    const prompt = `
        Analyze the following task details and suggest a priority (Low, Medium, or High) and a brief rationale (1-2 sentences).
        Task Title: ${title || "(No title provided)"}
        Task Description: ${description || "(No description provided)"}
        Due Date: ${dueDate ? new Date(dueDate).toLocaleDateString() : "Not set"}
        Client Context: This task is ${clientStatusText}.

        Consider urgency based on due date and importance based on description and client status.
        Respond in JSON format with keys: "suggestedPriority" (string, must be "Low", "Medium", or "High") and "rationale" (string).
        Example:
        {
          "suggestedPriority": "High",
          "rationale": "This task is for a Critical client and is due soon."
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
        if (Object.values(TaskPriority).includes(parsedResult.suggestedPriority as TaskPriority)) {
            setAiSuggestedPriority(parsedResult.suggestedPriority as TaskPriority);
            setAiPriorityRationale(parsedResult.rationale || "AI suggested this priority based on task details.");
        } else {
            throw new Error("AI returned an invalid priority value.");
        }
    } catch (err: any) {
        console.error("Error suggesting priority:", err);
        setAiError(err.message || "Failed to suggest priority.");
    } finally {
        setIsSuggestingPriority(false);
    }
  };
  
  const handleApplySuggestedPriority = () => {
    if (aiSuggestedPriority) {
        setPriority(aiSuggestedPriority);
        setAiSuggestedPriority(null);
        setAiPriorityRationale(null);
    }
  };

  const handleSuggestSubtasks = async () => {
    if (!title.trim() || !description.trim()) {
        setAiError("Please enter a title and description to suggest sub-tasks.");
        return;
    }
    setIsSuggestingSubtasks(true);
    setAiError(null);
    setAiSuggestedSubtasks([]);

    const prompt = `
        Based on the following main task, generate a list of 3-5 logical, smaller, actionable sub-task titles.
        Main Task Title: ${title}
        Main Task Description: ${description}

        Respond in JSON format with a single key "subtasks" which is an array of strings (the sub-task titles).
        Example:
        {
          "subtasks": ["Compile Q3 performance data", "Draft presentation outline", "Design presentation slides"]
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
        setAiSuggestedSubtasks(parsedResult.subtasks || []);
    } catch (err: any) {
        console.error("Error suggesting sub-tasks:", err);
        setAiError(err.message || "Failed to suggest sub-tasks.");
    } finally {
        setIsSuggestingSubtasks(false);
    }
  };

  const copySubtasksToClipboard = () => {
    const subtaskListText = aiSuggestedSubtasks.map(subtask => `- ${subtask}`).join('\n');
    navigator.clipboard.writeText(subtaskListText)
        .then(() => alert("Sub-tasks copied to clipboard!"))
        .catch(err => console.error("Failed to copy sub-tasks: ", err));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const taskData = {
      title,
      description,
      status,
      dueDate: new Date(dueDate).toISOString(),
      assignedTo,
      clientId,
      priority,
    };

    if (mode === 'edit' && initialData) {
      onSubmit({ ...initialData, ...taskData });
    } else {
      onSubmit(taskData as Omit<Task, 'id'>);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {aiError && (
        <div className="p-3 bg-danger-light text-danger text-sm rounded-md flex items-center">
            <AlertTriangle size={18} className="mr-2"/> {aiError}
        </div>
      )}
      <div>
        <label htmlFor="task-title" className={labelClasses}>Title</label>
        <input type="text" id="task-title" value={title} onChange={(e) => setTitle(e.target.value)} required className={inputBaseClasses} />
      </div>

      <div>
        <div className="flex justify-between items-center">
            <label htmlFor="task-description" className={labelClasses}>Description</label>
            <button 
                type="button" 
                onClick={handleSuggestDescription} 
                disabled={isSuggestingDescription || !title.trim()}
                className="text-xs text-primary hover:text-primary-dark flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                title="Suggest description with AI"
            >
                {isSuggestingDescription ? 
                    <LoadingSpinner size="sm" /> : 
                    <Wand2 size={14} className="mr-1" />
                }
                Suggest with AI
            </button>
        </div>
        <div className="relative">
            <textarea 
                id="task-description" 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                rows={3} 
                className={`${inputBaseClasses}`}  
            />
        </div>
      </div>
       {/* AI Sub-task Suggestion */}
        <div>
            <button
                type="button"
                onClick={handleSuggestSubtasks}
                disabled={isSuggestingSubtasks || !title.trim() || !description.trim()}
                className="w-full text-xs text-teal-500 hover:text-teal-400 flex items-center justify-center p-1.5 border border-teal-500/50 rounded-md hover:bg-teal-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Suggest sub-tasks with AI"
            >
                {isSuggestingSubtasks ? <LoadingSpinner size="sm"/> : <Wand2 size={14} className="mr-1"/>}
                Suggest Sub-tasks with AI
            </button>
            {aiSuggestedSubtasks.length > 0 && (
                <div className="mt-2 p-3 bg-sidebar-bg border border-border-color rounded-md">
                    <h4 className="text-xs font-semibold text-medium-text mb-1.5">AI Suggested Sub-tasks:</h4>
                    <ul className="list-disc list-inside text-xs text-dark-text space-y-1">
                        {aiSuggestedSubtasks.map((subtask, index) => <li key={index}>{subtask}</li>)}
                    </ul>
                    <button type="button" onClick={copySubtasksToClipboard} className="mt-2 text-xs text-primary hover:underline flex items-center">
                        <Copy size={12} className="mr-1"/> Copy Sub-tasks
                    </button>
                </div>
            )}
      </div>


      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="task-status" className={labelClasses}>Status</label>
          <select id="task-status" value={status} onChange={(e) => setStatus(e.target.value as TaskStatus)} className={`${inputBaseClasses} appearance-none`}>
            {Object.values(TaskStatus).map(s => <option key={s} value={s} className="bg-input-bg text-dark-text">{s}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="task-dueDate" className={labelClasses}>Due Date</label>
          <input type="date" id="task-dueDate" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required className={`${inputBaseClasses} dark:[color-scheme:dark]`} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
        <div>
          <div className="flex justify-between items-center">
            <label htmlFor="task-priority" className={labelClasses}>Priority</label>
            <button
                type="button"
                onClick={handleSuggestPriority}
                disabled={isSuggestingPriority || (!title.trim() && !description.trim())}
                className="text-xs text-primary hover:text-primary-dark flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                title="Suggest priority with AI"
            >
                {isSuggestingPriority ? <LoadingSpinner size="sm"/> : <Wand2 size={14} className="mr-1"/>}
                AI Suggest
            </button>
          </div>
          <select id="task-priority" value={priority} onChange={(e) => setPriority(e.target.value as TaskPriority)} className={`${inputBaseClasses} appearance-none`}>
            {Object.values(TaskPriority).map(p => <option key={p} value={p} className="bg-input-bg text-dark-text">{p}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="task-assignedTo" className={labelClasses}>Assigned To</label>
          <select id="task-assignedTo" value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)} className={`${inputBaseClasses} appearance-none`}>
            {teamMembers.map(member => <option key={member.id} value={member.name} className="bg-input-bg text-dark-text">{member.name}</option>)}
          </select>
        </div>
      </div>
      {aiSuggestedPriority && aiPriorityRationale && (
        <div className="mt-2 p-3 bg-sidebar-bg border border-border-color rounded-md">
            <h4 className="text-xs font-semibold text-medium-text">AI Priority Suggestion: <span className={`font-bold ${aiSuggestedPriority === TaskPriority.HIGH ? 'text-danger' : aiSuggestedPriority === TaskPriority.MEDIUM ? 'text-warning' : 'text-success'}`}>{aiSuggestedPriority}</span></h4>
            <p className="text-xs text-dark-text mt-1">{aiPriorityRationale || ''}</p>
            <button type="button" onClick={handleApplySuggestedPriority} className="mt-2 text-xs bg-primary hover:bg-primary-dark text-white px-2 py-1 rounded-md">
                Apply Suggestion
            </button>
        </div>
      )}


      <div>
        <label htmlFor="task-client" className={labelClasses}>Associated Client (Optional)</label>
        <select id="task-client" value={clientId || ''} onChange={(e) => setClientId(e.target.value || null)} className={`${inputBaseClasses} appearance-none`}>
          <option value="" className="bg-input-bg text-dark-text">None</option>
          {clients.map(client => <option key={client.id} value={client.id} className="bg-input-bg text-dark-text">{client.name}</option>)}
        </select>
      </div>

      <div className="flex justify-end pt-2">
        <button type="submit" className={buttonPrimaryClasses} disabled={isSuggestingDescription || isSuggestingPriority || isSuggestingSubtasks}>
          {mode === 'add' ? 'Add Task' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
};