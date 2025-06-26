
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { TeamMember, Client, TurnoverRiskLevel, PtlReport, PtlMainDriver, FormMode } from '../../types';
import { PTL_MAIN_DRIVERS, GEMINI_MODEL_TEXT } from '../../constants';
import { Save, UserCircle, Briefcase, AlertTriangle, Wand2, MessageSquare } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { LoadingSpinner } from '../../components/LoadingSpinner';

interface NewPtlReportFormProps {
  teamMembers: TeamMember[];
  clients: Client[];
  currentUser: TeamMember;
  onSave: (reportData: PtlReport | Omit<PtlReport, 'id'>) => void;
  initialData?: PtlReport | null;
  formMode: FormMode;
}

const cardBaseClasses = "bg-input-bg p-5 rounded-lg shadow-card border border-border-color";
const labelClasses = "block text-sm font-medium text-medium-text mb-1.5";
const inputBaseClasses = "w-full p-2.5 border border-border-color rounded-md shadow-subtle focus:ring-1 focus:ring-primary focus:border-primary text-sm bg-sidebar-bg text-dark-text placeholder-placeholder-color disabled:opacity-70 disabled:cursor-not-allowed";
const textareaBaseClasses = `${inputBaseClasses} min-h-[80px] resize-y`;
const buttonPrimaryClasses = "flex items-center justify-center bg-primary hover:bg-primary-dark text-white font-semibold py-2.5 px-5 rounded-md transition-colors shadow-sm hover:shadow-md disabled:opacity-50";
const charCounterClasses = "text-xs text-light-text text-right mt-0.5";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

export const NewPtlReportForm: React.FC<NewPtlReportFormProps> = ({
    teamMembers,
    clients,
    currentUser,
    onSave,
    initialData,
    formMode
}) => {
  const [selectedSoulverId, setSelectedSoulverId] = useState<string>('');
  const [context, setContext] = useState(''); // New state for context
  const [riskLevel, setRiskLevel] = useState<TurnoverRiskLevel>(TurnoverRiskLevel.LOW);
  const [findings, setFindings] = useState('');
  const [selectedMainDrivers, setSelectedMainDrivers] = useState<PtlMainDriver[]>([]);
  const [rootCause, setRootCause] = useState('');
  const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);

  const [isAiSuggestingRootCause, setIsAiSuggestingRootCause] = useState(false);
  const [aiRootCauseError, setAiRootCauseError] = useState<string | null>(null);
  const [isAiSuggestingFindings, setIsAiSuggestingFindings] = useState(false);
  const [aiFindingsError, setAiFindingsError] = useState<string | null>(null);
  const [isAiSuggestingMainDrivers, setIsAiSuggestingMainDrivers] = useState(false);
  const [aiMainDriversError, setAiMainDriversError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData && formMode === 'edit') {
      setSelectedSoulverId(initialData.soulverId);
      setRiskLevel(initialData.riskLevel);
      setFindings(initialData.findings);
      setSelectedMainDrivers(initialData.mainDrivers || []);
      setRootCause(initialData.rootCause);
      setReportDate(new Date(initialData.reportDate).toISOString().split('T')[0]);
      setContext(''); // Context is not saved, reset for edit mode
    } else {
      setSelectedSoulverId('');
      setRiskLevel(TurnoverRiskLevel.LOW);
      setFindings('');
      setSelectedMainDrivers([]);
      setRootCause('');
      setReportDate(new Date().toISOString().split('T')[0]);
      setContext('');
    }
  }, [initialData, formMode]);

  const soulver = useMemo(() => teamMembers.find(tm => tm.id === selectedSoulverId), [teamMembers, selectedSoulverId]);

  const soulverCompany = useMemo(() => {
    if (!soulver || !soulver.id) return 'N/A';
    const assignedClient = clients.find(client => client.assignedTeamMembers.includes(soulver.id));
    return assignedClient ? assignedClient.name : 'N/A';
  }, [soulver, clients]);

  const soulverDepartment = useMemo(() => {
     if (!soulver) return 'N/A';
     return soulver.department || "Solvo Internal Department";
  }, [soulver]);


  const handleMainDriverChange = (driver: PtlMainDriver) => {
    setSelectedMainDrivers(prev =>
      prev.includes(driver) ? prev.filter(d => d !== driver) : [...prev, driver]
    );
  };

  const handleAiSuggestFindings = async () => {
    if (!soulver) {
      setAiFindingsError("Please select a Soulver before using AI suggestion for Findings.");
      return;
    }
    if (riskLevel !== TurnoverRiskLevel.LOW && selectedMainDrivers.length === 0) {
      setAiFindingsError("For Medium or High risk, please select at least one Main Driver before using AI suggestion for Findings.");
      return;
    }

    setIsAiSuggestingFindings(true);
    setAiFindingsError(null);

    let promptString = "";
    if (riskLevel === TurnoverRiskLevel.LOW) {
      promptString = 
        `A supervisor is filling out a Performance & Talent Level (PTL) report for a Soulver named ${soulver.name}.\n` +
        `The Soulver's turnover risk has been assessed as LOW.\n` +
        `Based on the Soulver's details and any provided context, suggest 2-3 positive observations or commendable aspects of their performance or work attitude.\n` +
        `These comments should be suitable for a PTL report context and written from the perspective of a supervisor.\n\n` +
        `Soulver Details:\n` +
        `- Name: ${soulver.name}\n` +
        `- Role: ${soulver.role}\n` +
        `- Department: ${soulverDepartment}\n` +
        `- Working for Client/Company: ${soulverCompany}\n\n` +
        `Supervisor-Provided Context (if any):\n` +
        `---\n${context || "None provided."}\n---\n\n` +
        `Example of good positive comments:\n` +
        `- "${soulver.name} consistently demonstrates a proactive approach and has received positive feedback from ${soulverCompany}."\n` +
        `- "Shows strong commitment to their tasks and actively contributes to team discussions."\n` +
        `- "Maintains a high level of quality in their work and is a reliable member of the team."\n\n` +
        `Suggested Positive Comments (as a single string, with each comment on a new line or separated by a clear marker):`;
    } else {
      promptString = 
        `A supervisor is filling out a Performance & Talent Level (PTL) report for a Soulver named ${soulver.name}.\n` +
        `Suggest potential findings or observations a supervisor might note that could indicate turnover risk.\n` +
        `The findings should be concise, observational, and directly relevant to the selected main drivers of turnover risk and any provided context.\n` +
        `Provide 2-3 distinct findings, written from the perspective of a supervisor.\n\n` +
        `Soulver Details:\n` +
        `- Name: ${soulver.name}\n` +
        `- Role: ${soulver.role}\n` +
        `- Department: ${soulverDepartment}\n` +
        `- Working for Client/Company: ${soulverCompany}\n\n` +
        `Supervisor-Provided Context (if any):\n` +
        `---\n${context || "None provided."}\n---\n\n` +
        `Selected Main Driver(s) for Turnover Risk:\n` +
        `---\n` +
        `${selectedMainDrivers.join(', ')}\n` +
        `---\n\n` +
        `Example of good findings (these are just examples, generate new ones based on input):\n` +
        `- "I've noticed ${soulver.name} expressed frustration with current workload and lack of growth opportunities."\n` +
        `- "Observed a decline in ${soulver.name}'s engagement during team meetings and a lack of initiative on new projects."\n` +
        `- "It was mentioned by ${soulver.name} that they have been receiving unsolicited job offers from other companies."\n\n` +
        `Suggested Findings (as a single string, with each finding on a new line or separated by a clear marker):`;
    }

    try {
      const response = await ai.models.generateContent({
        model: GEMINI_MODEL_TEXT,
        contents: promptString,
      });
      const suggestedText = response.text.trim();
      setFindings(suggestedText);
    } catch (error: any) {
      console.error("AI Findings Suggestion Error:", error);
      setAiFindingsError(error.message || "Failed to get AI suggestion for findings.");
    } finally {
      setIsAiSuggestingFindings(false);
    }
  };

  const handleAiSuggestMainDrivers = async () => {
    if (!soulver) {
        setAiMainDriversError("Please select a Soulver first.");
        return;
    }
    if (!findings.trim()) {
        setAiMainDriversError("Please enter or suggest Findings before suggesting Main Drivers.");
        return;
    }
    setIsAiSuggestingMainDrivers(true);
    setAiMainDriversError(null);

    const prompt = `
        Analyze the following Soulver Findings, context, and details to suggest the most relevant PTL Main Drivers for potential turnover risk.
        Soulver Name: ${soulver.name}
        Soulver Role: ${soulver.role}
        Working for Client/Company: ${soulverCompany}
        Supervisor-Provided Context (if any):
        ---
        ${context || "None provided."}
        ---
        Findings:
        ---
        ${findings}
        ---
        Available PTL Main Drivers: ${PTL_MAIN_DRIVERS.join(', ')}

        Respond in JSON format with a single key "suggestedDrivers" which is an array of 3-5 PTL Main Driver strings from the provided list that are most relevant.
        Example:
        {
          "suggestedDrivers": ["Performance", "Work environment", "Career path"]
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
        if (parsedResult.suggestedDrivers && Array.isArray(parsedResult.suggestedDrivers)) {
            const validSuggestedDrivers = parsedResult.suggestedDrivers.filter((driver: string) => 
                PTL_MAIN_DRIVERS.includes(driver as PtlMainDriver)
            );
            setSelectedMainDrivers(prev => {
                const newSet = new Set([...prev, ...validSuggestedDrivers]);
                return Array.from(newSet);
            });
        } else {
            throw new Error("AI returned an invalid format for suggested drivers.");
        }
    } catch (error: any) {
        console.error("AI Main Drivers Suggestion Error:", error);
        setAiMainDriversError(error.message || "Failed to get AI suggestion for main drivers.");
    } finally {
        setIsAiSuggestingMainDrivers(false);
    }
  };


  const handleAiSuggestRootCause = async () => {
    if (!findings.trim()) {
      setAiRootCauseError("Please provide Findings before using AI suggestion for Root Cause.");
      return;
    }
    if (riskLevel !== TurnoverRiskLevel.LOW && selectedMainDrivers.length === 0) {
      setAiRootCauseError("For Medium or High risk, please select at least one Main Driver before AI suggestion for Root Cause.");
      return;
    }
    if (!soulver) {
        setAiRootCauseError("Please select a Soulver first.");
        return;
    }
    setIsAiSuggestingRootCause(true);
    setAiRootCauseError(null);

    const promptString = 
      `Analyze the following information from a Performance & Talent Level (PTL) report for a Soulver named ${soulver.name}.\n` +
      `Your task is to suggest a concise root cause for the potential turnover risk (1-3 sentences, max 100 words).\n` +
      `The root cause should be written from the perspective of a supervisor and consider all provided information.\n\n` +
      `Soulver Name: ${soulver.name}\n` +
      `Supervisor-Provided Context (if any):\n` +
      `---\n${context || "None provided."}\n---\n\n` +
      `Soulver Findings:\n` +
      `---\n` +
      `${findings}\n` +
      `---\n\n` +
      `Selected Main Driver(s) for Turnover Risk (if applicable, might be empty for Low Risk):\n` +
      `---\n` +
      `${selectedMainDrivers.join(', ')}\n` +
      `---\n` +
      `Current Risk Level: ${riskLevel}\n\n` +
      `Suggested Root Cause:`;

    try {
      const response = await ai.models.generateContent({
        model: GEMINI_MODEL_TEXT,
        contents: promptString,
      });
      const suggestedText = response.text.trim();
      setRootCause(suggestedText);
    } catch (error: any) {
      console.error("AI Root Cause Suggestion Error:", error);
      setAiRootCauseError(error.message || "Failed to get AI suggestion for root cause.");
    } finally {
      setIsAiSuggestingRootCause(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSoulverId && formMode === 'add') {
      alert('Please select a Soulver.');
      return;
    }

    const reportData = {
      soulverId: selectedSoulverId || initialData!.soulverId,
      supervisorId: currentUser.id,
      reportDate: new Date(reportDate).toISOString(),
      riskLevel,
      findings,
      mainDrivers: selectedMainDrivers,
      rootCause,
    };

    if (formMode === 'edit' && initialData) {
        onSave({ ...initialData, ...reportData });
    } else {
        onSave(reportData as Omit<PtlReport, 'id'>);
    }
  };

  const findingsCharCount = `${findings.length}/800`;
  const rootCauseCharCount = `${rootCause.length}/800`;
  const contextCharCount = `${context.length}/500`;
  
  const canSuggestFindings = useMemo(() => {
    if (!soulver) return false;
    if (riskLevel === TurnoverRiskLevel.LOW) return true; 
    return selectedMainDrivers.length > 0; 
  }, [soulver, riskLevel, selectedMainDrivers.length]);

  const canSuggestMainDrivers = useMemo(() => {
    return !!soulver && findings.trim().length > 0;
  }, [soulver, findings]);

  const canSuggestRootCause = useMemo(() => {
    if (!soulver || !findings.trim()) return false; // Ensure findings are present
    if (riskLevel === TurnoverRiskLevel.LOW) return true; // Can suggest even for low risk based on findings
    return selectedMainDrivers.length > 0;
  },[soulver, findings, riskLevel, selectedMainDrivers.length]);


  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-h-[75vh] overflow-y-auto custom-scrollbar pr-3">
      {formMode === 'add' && <h1 className="text-xl font-bold text-dark-text mb-1">New PTL Report</h1> }
      {formMode === 'add' && <p className="text-xs text-medium-text mb-4">Fill in the details for the Performance & Talent Level report.</p> }

      <div className={cardBaseClasses}>
        <h2 className="text-lg font-semibold text-dark-text mb-3 flex items-center">
          <UserCircle size={20} className="mr-2 text-primary" /> Soulver Details
        </h2>
        <div className="space-y-3">
            <div>
                <label htmlFor="soulver" className={labelClasses}>Select Soulver</label>
                <select
                id="soulver"
                value={selectedSoulverId}
                onChange={(e) => setSelectedSoulverId(e.target.value)}
                required
                disabled={formMode === 'edit'}
                className={`${inputBaseClasses} appearance-none`}
                >
                <option value="" disabled className="bg-sidebar-bg">-- Select a Soulver --</option>
                {teamMembers.filter(tm => tm.id !== currentUser.id).map(tm => (
                    <option key={tm.id} value={tm.id} className="bg-sidebar-bg text-dark-text">{tm.name} ({tm.id})</option>
                ))}
                </select>
            </div>

            {soulver && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-xs p-3 border border-light-border rounded-md bg-sidebar-bg">
                    <div><strong className="text-light-text">SOLID:</strong> <span className="text-medium-text">{soulver.id}</span></div>
                    <div><strong className="text-light-text">Full Name:</strong> <span className="text-medium-text">{soulver.name}</span></div>
                    <div><strong className="text-light-text">Department:</strong> <span className="text-medium-text">{soulverDepartment}</span></div>
                    <div><strong className="text-light-text">Position:</strong> <span className="text-medium-text">{soulver.role}</span></div>
                    <div className="sm:col-span-2"><strong className="text-light-text">Working for:</strong> <span className="text-medium-text">{soulverCompany}</span></div>
                </div>
            )}
        </div>
      </div>

      <div className={cardBaseClasses}>
        <h2 className="text-lg font-semibold text-dark-text mb-3 flex items-center">
          <MessageSquare size={20} className="mr-2 text-primary" /> Context for AI Suggestions (Optional)
        </h2>
        <div>
            <label htmlFor="ptl-context" className={`${labelClasses} mb-0`}>
                Provide additional context about the Soulver or situation to help AI generate more relevant suggestions.
            </label>
            <div className="relative">
                <textarea
                  id="ptl-context"
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  rows={3}
                  maxLength={500}
                  className={`${textareaBaseClasses}`}
                  placeholder="E.g., Recent project changes, team dynamics, specific concerns not covered elsewhere..."
                />
            </div>
            <p className={charCounterClasses}>{contextCharCount}</p>
        </div>
      </div>

      <div className={cardBaseClasses}>
        <h2 className="text-lg font-semibold text-dark-text mb-4 flex items-center">
            <Briefcase size={20} className="mr-2 text-primary" /> Report Information
        </h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="reportDate" className={labelClasses}>Report Date</label>
            <input
                type="date"
                id="reportDate"
                value={reportDate}
                onChange={(e) => setReportDate(e.target.value)}
                required
                className={`${inputBaseClasses} dark:[color-scheme:dark]`}
            />
          </div>
          <div>
            <label htmlFor="riskLevel" className={labelClasses}>Risk level</label>
            <select
              id="riskLevel"
              value={riskLevel}
              onChange={(e) => setRiskLevel(e.target.value as TurnoverRiskLevel)}
              className={`${inputBaseClasses} appearance-none`}
            >
              {Object.values(TurnoverRiskLevel).map(level => (
                <option key={level} value={level} className="bg-sidebar-bg text-dark-text">{level}</option>
              ))}
            </select>
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-1">
                <label htmlFor="findings" className={`${labelClasses} mb-0`}>
                    {riskLevel === TurnoverRiskLevel.LOW ? 'Positive Observations / Commendable Aspects:' : 'Which are the findings of your conversation related to the turnover risk?'}
                </label>
                <button
                    type="button"
                    onClick={handleAiSuggestFindings}
                    disabled={!canSuggestFindings || isAiSuggestingFindings}
                    className="ml-2 text-xs text-primary hover:text-primary-dark flex items-center disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                    title={riskLevel === TurnoverRiskLevel.LOW ? "Suggest positive comments with AI" : "Suggest findings with AI based on Soulver and Main Drivers"}
                >
                    {isAiSuggestingFindings ? <LoadingSpinner size="sm" /> : <Wand2 size={14} className="mr-1" />}
                    AI Suggest
                </button>
            </div>
            <div className="relative">
                <textarea
                  id="findings"
                  value={findings}
                  onChange={(e) => setFindings(e.target.value)}
                  rows={4}
                  maxLength={800}
                  className={`${textareaBaseClasses}`}
                  placeholder={riskLevel === TurnoverRiskLevel.LOW ? "Enter positive observations here, or use AI to suggest." : "Enter findings here, or use AI to suggest based on Soulver and Main Drivers."}
                />
            </div>
             <p className={charCounterClasses}>{findingsCharCount}</p>
            {aiFindingsError && <p className="text-xs text-danger mt-1">{aiFindingsError}</p>}
          </div>

          <div>
            <div className="flex justify-between items-center">
                <label className={labelClasses}>Turnover risk - Main driver(s) {riskLevel === TurnoverRiskLevel.LOW ? '(Optional for Low Risk)' : ''}</label>
                 <button
                    type="button"
                    onClick={handleAiSuggestMainDrivers}
                    disabled={!canSuggestMainDrivers || isAiSuggestingMainDrivers}
                    className="ml-2 text-xs text-primary hover:text-primary-dark flex items-center disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                    title="Suggest Main Drivers with AI based on Findings and Soulver"
                >
                    {isAiSuggestingMainDrivers ? <LoadingSpinner size="sm" /> : <Wand2 size={14} className="mr-1" />}
                    AI Suggest Drivers
                </button>
            </div>
            <div className="mt-1.5 grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-48 overflow-y-auto p-2.5 border border-border-color rounded-md bg-sidebar-bg custom-scrollbar">
              {PTL_MAIN_DRIVERS.map(driver => (
                <label key={driver} className="flex items-center space-x-1.5 p-1 hover:bg-input-bg rounded cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={selectedMainDrivers.includes(driver)}
                    onChange={() => handleMainDriverChange(driver)}
                    className="form-checkbox h-3.5 w-3.5 text-primary border-light-border rounded focus:ring-primary bg-input-bg"
                  />
                  <span className="text-xs text-medium-text">{driver}</span>
                </label>
              ))}
            </div>
            {aiMainDriversError && <p className="text-xs text-danger mt-1">{aiMainDriversError}</p>}
          </div>


          <div>
            <div className="flex justify-between items-center mb-1">
              <label htmlFor="rootCause" className={`${labelClasses} mb-0`}>
                Analysis, root cause {riskLevel === TurnoverRiskLevel.LOW ? '(Optional for Low Risk)' : ''}
              </label>
              <button
                type="button"
                onClick={handleAiSuggestRootCause}
                disabled={!canSuggestRootCause || isAiSuggestingRootCause}
                className="ml-2 text-xs text-primary hover:text-primary-dark flex items-center disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                title="Suggest root cause with AI based on Findings and Main Drivers"
              >
                {isAiSuggestingRootCause ? <LoadingSpinner size="sm" /> : <Wand2 size={14} className="mr-1" />}
                AI Suggest
              </button>
            </div>
             <div className="relative">
                <textarea
                  id="rootCause"
                  value={rootCause}
                  onChange={(e) => setRootCause(e.target.value)}
                  rows={4}
                  maxLength={800}
                  className={`${textareaBaseClasses}`}
                  placeholder="Enter root cause analysis here, or use AI to suggest."
                />
            </div>
            <p className={charCounterClasses}>{rootCauseCharCount}</p>
            {aiRootCauseError && <p className="text-xs text-danger mt-1">{aiRootCauseError}</p>}
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-1">
        <button type="submit" className={buttonPrimaryClasses} disabled={(formMode === 'add' && !selectedSoulverId) || isAiSuggestingFindings || isAiSuggestingRootCause || isAiSuggestingMainDrivers}>
          <Save size={18} className="mr-2" /> {formMode === 'add' ? 'Save PTL Report' : 'Update PTL Report'}
        </button>
      </div>
    </form>
  );
};
