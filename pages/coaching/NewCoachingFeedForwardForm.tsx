
import React, { useState, useEffect, useMemo } from 'react';
import { TeamMember, CoachingFeedForward, CoachingFeeling, CoachingReason, CoachingLink, FormMode } from '../../types';
import { COACHING_FEELINGS_OPTIONS, COACHING_REASONS_OPTIONS, GEMINI_MODEL_TEXT } from '../../constants';
import { Save, UserCircle, Smile, Meh, Frown, Angry, Briefcase, Users, Link, PlusCircle, XCircle, Wand2, MessageCircleMore, AlertTriangle, BookOpen } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { LoadingSpinner } from '../../components/LoadingSpinner';

interface NewCoachingFeedForwardFormProps {
  teamMembers: TeamMember[];
  currentUser: TeamMember;
  onSave: (cffData: CoachingFeedForward | Omit<CoachingFeedForward, 'id'>) => void;
  initialData?: CoachingFeedForward | null;
  formMode: FormMode;
}

const cardBaseClasses = "bg-input-bg p-5 rounded-lg shadow-card border border-border-color";
const labelClasses = "block text-sm font-medium text-medium-text mb-1.5";
const inputBaseClasses = "w-full p-2.5 border border-border-color rounded-md shadow-subtle focus:ring-1 focus:ring-primary focus:border-primary text-sm bg-sidebar-bg text-dark-text placeholder-placeholder-color disabled:opacity-70 disabled:cursor-not-allowed";
const textareaBaseClasses = `${inputBaseClasses} min-h-[80px] resize-y`;
const buttonPrimaryClasses = "flex items-center justify-center bg-primary hover:bg-primary-dark text-white font-semibold py-2.5 px-5 rounded-md transition-colors shadow-sm hover:shadow-md disabled:opacity-50";
const charCounterClasses = "text-xs text-light-text text-right mt-0.5";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

interface AiSuggestedResource {
  title: string;
  descriptionOrLink: string;
}

export const NewCoachingFeedForwardForm: React.FC<NewCoachingFeedForwardFormProps> = ({
  teamMembers,
  currentUser,
  onSave,
  initialData,
  formMode
}) => {
  const [selectedSoulverId, setSelectedSoulverId] = useState<string>('');
  const [feedForwardDate, setFeedForwardDate] = useState(new Date().toISOString().split('T')[0]);
  const [context, setContext] = useState(''); // New state for context
  const [soulverFeelings, setSoulverFeelings] = useState<CoachingFeeling>('Neutral');
  const [selectedReasons, setSelectedReasons] = useState<CoachingReason[]>([]);
  const [otherReasonText, setOtherReasonText] = useState('');
  const [leaderActions, setLeaderActions] = useState('');
  const [soulverActions, setSoulverActions] = useState('');
  const [hrSupportId, setHrSupportId] = useState<string | null>(null);
  const [links, setLinks] = useState<CoachingLink[]>([]);
  const [currentLinkTitle, setCurrentLinkTitle] = useState('');
  const [currentLinkUrl, setCurrentLinkUrl] = useState('');

  const [isAiSuggestingLeader, setIsAiSuggestingLeader] = useState(false);
  const [aiLeaderError, setAiLeaderError] = useState<string | null>(null);
  const [isAiSuggestingSoulver, setIsAiSuggestingSoulver] = useState(false);
  const [aiSoulverError, setAiSoulverError] = useState<string | null>(null);
  const [isAiSuggestingResources, setIsAiSuggestingResources] = useState(false);
  const [aiResourcesError, setAiResourcesError] = useState<string | null>(null);
  const [aiSuggestedResources, setAiSuggestedResources] = useState<AiSuggestedResource[]>([]);

  const hrTeamMembers = useMemo(() => {
    const hrs = teamMembers.filter(tm => 
        (tm.department?.toLowerCase().includes('hr') || tm.role.toLowerCase().includes('hr')) &&
        tm.id !== currentUser.id 
    );
    return hrs.length > 0 ? hrs : teamMembers.filter(tm => tm.id !== currentUser.id); 
  }, [teamMembers, currentUser.id]);


  useEffect(() => {
    if (initialData && formMode === 'edit') {
      setSelectedSoulverId(initialData.soulverId);
      setFeedForwardDate(new Date(initialData.feedForwardDate).toISOString().split('T')[0]);
      setSoulverFeelings(initialData.soulverFeelings);
      setSelectedReasons(initialData.reasons);
      setOtherReasonText(initialData.reasons.includes('Other') ? (initialData.otherReasonText || '') : '');
      setLeaderActions(initialData.leaderActions);
      setSoulverActions(initialData.soulverActions);
      setHrSupportId(initialData.hrSupportId);
      setLinks(initialData.links || []);
      setContext(''); // Context is not saved, reset for edit mode
    } else {
      // Reset for new form
      setSelectedSoulverId('');
      setFeedForwardDate(new Date().toISOString().split('T')[0]);
      setSoulverFeelings('Neutral');
      setSelectedReasons([]);
      setOtherReasonText('');
      setLeaderActions('');
      setSoulverActions('');
      setHrSupportId(null);
      setLinks([]);
      setContext('');
    }
    setAiSuggestedResources([]); // Clear AI resources on form mode change/init
  }, [initialData, formMode]);
  
  const soulver = useMemo(() => teamMembers.find(tm => tm.id === selectedSoulverId), [teamMembers, selectedSoulverId]);

  const handleReasonToggle = (reason: CoachingReason) => {
    const isCurrentlySelected = selectedReasons.includes(reason);
    if (reason === 'Other' && isCurrentlySelected) { 
      setOtherReasonText('');
    }
    setSelectedReasons(prev =>
      isCurrentlySelected ? prev.filter(r => r !== reason) : [...prev, reason]
    );
  };

  const handleAddLink = () => {
    if (currentLinkTitle.trim() && currentLinkUrl.trim()) {
      try {
        new URL(currentLinkUrl); 
        setLinks([...links, { id: `link-${Date.now()}`, title: currentLinkTitle.trim(), url: currentLinkUrl.trim() }]);
        setCurrentLinkTitle('');
        setCurrentLinkUrl('');
      } catch (e) {
        alert('Please enter a valid URL for the link (e.g., https://example.com)');
      }
    } else {
      alert('Please provide both a title and a URL for the link.');
    }
  };

  const handleRemoveLink = (linkId: string) => {
    setLinks(links.filter(link => link.id !== linkId));
  };
  
  const getAiSuggestion = async (
    targetField: 'leaderActions' | 'soulverActions',
    setLoading: React.Dispatch<React.SetStateAction<boolean>>,
    setError: React.Dispatch<React.SetStateAction<string | null>>,
    setField: React.Dispatch<React.SetStateAction<string>>
  ) => {
    if (!soulver) {
        setError("Please select a Soulver first.");
        return;
    }
    if (selectedReasons.length === 0 && !otherReasonText.trim()) {
        setError("Please select at least one reason or specify 'Other'.");
        return;
    }

    setLoading(true);
    setError(null);

    const allReasonsForPrompt: string[] = [];
    selectedReasons.forEach(reason => {
        if (reason === 'Other' && otherReasonText.trim()) {
            allReasonsForPrompt.push(`Other: ${otherReasonText.trim()}`);
        } else if (reason !== 'Other') { 
            allReasonsForPrompt.push(reason);
        } else if (reason === 'Other' && !otherReasonText.trim()) { 
            allReasonsForPrompt.push(reason);
        }
    });
    
    const roleForPrompt = targetField === 'leaderActions' ? 'leader' : 'Soulver';

    let promptString = "You are an AI assistant helping a supervisor prepare for a Coaching Feed Forward session.\n";
    promptString += `The Soulver is ${soulver.name}, who works as a ${soulver.role}.\n`;
    promptString += `Their current feeling about working at Solvo is: ${soulverFeelings}.\n`;
    promptString += `The reason(s) identified for this feeling are: ${allReasonsForPrompt.join(', ')}.\n`;
    promptString += `Supervisor-Provided Context (if any):\n` +
                    `---\n${context || "None provided."}\n---\n\n`;
    promptString += `Suggest 2-3 concise and actionable ${roleForPrompt} actions (max 500 characters total for all actions for this ${roleForPrompt}).\n`;
    promptString += "These actions should aim to address the identified feelings, reasons, and context, fostering growth and well-being.\n";
    promptString += "Format the response as a single string, with each action on a new line or as a short paragraph.\n\n";
    promptString += `For example, if feeling is 'Tired' and reason is 'Account or project they work on', ${roleForPrompt} actions could be:\n`;
    promptString += "- Discuss current workload distribution and identify any bottlenecks.\n";
    promptString += "- Explore possibilities for a short break or a change of pace in tasks.\n";
    promptString += `- Ensure ${soulver.name} feels supported and has resources to manage project demands.\n\n`;
    promptString += `Suggested ${roleForPrompt} actions:`;


    try {
        const response = await ai.models.generateContent({
            model: GEMINI_MODEL_TEXT,
            contents: promptString,
        });
        setField(response.text.trim());
    } catch (err: any) {
        console.error(`AI Suggestion Error for ${targetField}:`, err);
        setError(err.message || `Failed to get AI suggestion for ${targetField}.`);
    } finally {
        setLoading(false);
    }
  };

  const handleAiSuggestResources = async () => {
    if (!soulver) {
        setAiResourcesError("Please select a Soulver first.");
        return;
    }
    if (selectedReasons.length === 0 && !otherReasonText.trim()) {
        setAiResourcesError("Please select at least one reason or specify 'Other'.");
        return;
    }
    setIsAiSuggestingResources(true);
    setAiResourcesError(null);
    setAiSuggestedResources([]);

    const allReasonsForPrompt: string[] = [];
    selectedReasons.forEach(reason => {
        if (reason === 'Other' && otherReasonText.trim()) {
            allReasonsForPrompt.push(`Other: ${otherReasonText.trim()}`);
        } else if (reason !== 'Other') { 
            allReasonsForPrompt.push(reason);
        }
    });

    const prompt = `
        A Soulver named ${soulver.name} (Role: ${soulver.role}) is feeling ${soulverFeelings}.
        The identified reason(s) are: ${allReasonsForPrompt.join(', ')}.
        Supervisor-Provided Context (if any):
        ---
        ${context || "None provided."}
        ---

        Suggest 2-3 relevant resources or advice snippets that could help address these feelings, reasons, and context.
        These can be general advice or references to hypothetical internal Solvo resources (e.g., "Review time management guide on SolvoNet", "Article: Dealing with Project Stress").
        Focus on actionable and supportive suggestions.

        Respond in JSON format with a key "suggestedResources" which is an array of objects, each object having "title" (string) and "descriptionOrLink" (string - if it's a link, make it a placeholder like '/kb/resource-name').
        Example:
        {
          "suggestedResources": [
            {"title": "Guide: Managing Workload Effectively", "descriptionOrLink": "Review strategies for task prioritization and delegation. (Link: /kb/workload-management)"},
            {"title": "Talk to HR about Career Pathing", "descriptionOrLink": "Schedule a discussion with HR to explore career development opportunities within Solvo."}
          ]
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
        setAiSuggestedResources(parsedResult.suggestedResources || []);
    } catch (error: any) {
        console.error("AI Resources Suggestion Error:", error);
        setAiResourcesError(error.message || "Failed to get AI suggestion for resources.");
    } finally {
        setIsAiSuggestingResources(false);
    }
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSoulverId && formMode === 'add') {
      alert('Please select a Soulver.');
      return;
    }

    const cffData = {
      soulverId: selectedSoulverId || initialData!.soulverId,
      supervisorId: currentUser.id,
      feedForwardDate: new Date(feedForwardDate).toISOString(),
      soulverFeelings,
      reasons: selectedReasons,
      otherReasonText: selectedReasons.includes('Other') && otherReasonText.trim() ? otherReasonText.trim() : undefined,
      leaderActions,
      soulverActions,
      hrSupportId: hrSupportId === "" ? null : hrSupportId, // Ensure empty string becomes null
      links,
    };

    if (formMode === 'edit' && initialData) {
      onSave({ ...initialData, ...cffData });
    } else {
      onSave(cffData as Omit<CoachingFeedForward, 'id'>);
    }
  };
  
  const feelingEmojis: Record<CoachingFeeling, React.ReactNode> = {
    Angry: <Angry size={32} className="text-danger" />,
    Tired: <Frown size={32} className="text-yellow-500" />, 
    Neutral: <Meh size={32} className="text-blue-400" />,
    Sad: <Frown size={32} className="text-warning" />,
    Happy: <Smile size={32} className="text-success" />,
  };

  const canSuggestActionsOrResources = soulver && (selectedReasons.length > 0 || (selectedReasons.includes('Other') && otherReasonText.trim()));
  const leaderActionsCharCount = `${leaderActions.length}/500`;
  const soulverActionsCharCount = `${soulverActions.length}/500`;
  const contextCharCount = `${context.length}/500`;


  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-h-[75vh] overflow-y-auto custom-scrollbar pr-3">
      {formMode === 'add' && <h1 className="text-xl font-bold text-dark-text mb-1">New Coaching Feed Forward</h1>}
      {formMode === 'add' && <p className="text-xs text-medium-text mb-4">Capture important coaching conversations and action plans.</p>}

      <div className={cardBaseClasses}>
        <h2 className="text-lg font-semibold text-dark-text mb-3 flex items-center">
          <UserCircle size={20} className="mr-2 text-primary" /> Soulver & Date
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="soulver-cff" className={labelClasses}>Select Soulver</label>
            <select
              id="soulver-cff"
              value={selectedSoulverId}
              onChange={(e) => setSelectedSoulverId(e.target.value)}
              required
              disabled={formMode === 'edit'}
              className={`${inputBaseClasses} appearance-none`}
            >
              <option value="" disabled className="bg-sidebar-bg">-- Select a Soulver --</option>
              {teamMembers.filter(tm => tm.id !== currentUser.id).map(tm => ( // Exclude current user (supervisor)
                <option key={tm.id} value={tm.id} className="bg-sidebar-bg text-dark-text">{tm.name} ({tm.role})</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="feedForwardDate" className={labelClasses}>Feed Forward Date</label>
            <input type="date" id="feedForwardDate" value={feedForwardDate} onChange={(e) => setFeedForwardDate(e.target.value)} required className={`${inputBaseClasses} dark:[color-scheme:dark]`} />
          </div>
        </div>
      </div>
      
      <div className={cardBaseClasses}>
        <h2 className="text-lg font-semibold text-dark-text mb-3 flex items-center">
          <MessageCircleMore size={20} className="mr-2 text-primary" /> Context for AI Suggestions (Optional)
        </h2>
        <div>
            <label htmlFor="cff-context" className={`${labelClasses} mb-0`}>
                Provide additional context about the Soulver or situation to help AI generate more relevant suggestions.
            </label>
            <div className="relative">
                <textarea
                  id="cff-context"
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  rows={3}
                  maxLength={500}
                  className={`${textareaBaseClasses}`}
                  placeholder="E.g., Recent performance data, specific challenges, team morale..."
                />
            </div>
            <p className={charCounterClasses}>{contextCharCount}</p>
        </div>
      </div>

      <div className={cardBaseClasses}>
        <h2 className="text-lg font-semibold text-dark-text mb-3 flex items-center">
          <MessageCircleMore size={20} className="mr-2 text-primary" /> Soulver's Feedback
        </h2>
        <div className="space-y-4">
          <div>
            <label className={labelClasses}>1. Current Soulver's feelings about working at Solvo *</label>
            <div className="flex justify-around items-center p-3 bg-sidebar-bg rounded-md border border-light-border">
              {COACHING_FEELINGS_OPTIONS.map(feeling => (
                <button
                  type="button"
                  key={feeling}
                  onClick={() => setSoulverFeelings(feeling)}
                  className={`p-2 rounded-lg flex flex-col items-center w-16 transition-all duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-sidebar-bg focus:ring-primary ${soulverFeelings === feeling ? 'bg-primary-light shadow-md ring-2 ring-primary' : 'hover:bg-input-bg'}`}
                  aria-pressed={soulverFeelings === feeling}
                  title={feeling}
                >
                  {feelingEmojis[feeling]}
                  <span className={`mt-1.5 text-xs font-medium ${soulverFeelings === feeling ? 'text-primary' : 'text-medium-text'}`}>{feeling}</span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className={labelClasses}>2. It is because of:</label>
            <div className="flex flex-wrap gap-2.5 p-3 bg-sidebar-bg rounded-md border border-light-border">
              {COACHING_REASONS_OPTIONS.map(reason => (
                <button
                  type="button"
                  key={reason}
                  onClick={() => handleReasonToggle(reason)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors duration-150 ${selectedReasons.includes(reason) ? 'bg-primary text-white border-primary-dark' : 'bg-input-bg text-medium-text border-light-border hover:bg-border-color hover:text-dark-text'}`}
                  aria-pressed={selectedReasons.includes(reason)}
                >
                  {reason}
                </button>
              ))}
            </div>
            {selectedReasons.includes('Other') && (
              <div className="mt-2.5">
                <label htmlFor="otherReasonText" className={`${labelClasses} text-xs`}>Specify "Other" Reason:</label>
                <input type="text" id="otherReasonText" value={otherReasonText} onChange={(e) => setOtherReasonText(e.target.value)} className={`${inputBaseClasses} text-xs p-1.5`} placeholder="Please specify..."/>
              </div>
            )}
          </div>
          <div>
             <button 
                type="button" 
                onClick={handleAiSuggestResources}
                disabled={!canSuggestActionsOrResources || isAiSuggestingResources}
                className="w-full text-xs text-teal-500 hover:text-teal-400 flex items-center justify-center p-1.5 border border-teal-500/50 rounded-md hover:bg-teal-500/10 disabled:opacity-50"
            >
                {isAiSuggestingResources ? <LoadingSpinner size="sm" /> : <BookOpen size={14} className="mr-1" />}
                AI Suggest Resources/Advice
            </button>
            {aiResourcesError && <p className="text-xs text-danger mt-1 text-center">{aiResourcesError}</p>}
            {aiSuggestedResources.length > 0 && (
                <div className="mt-2 p-3 bg-sidebar-bg border border-border-color rounded-md">
                    <h4 className="text-xs font-semibold text-medium-text mb-1.5">AI Suggested Resources/Advice:</h4>
                    <ul className="list-disc list-inside text-xs text-dark-text space-y-1.5">
                        {aiSuggestedResources.map((res, index) => (
                            <li key={index}>
                                <strong>{res.title}:</strong> {res.descriptionOrLink}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
          </div>
        </div>
      </div>
      
      <div className={cardBaseClasses}>
         <h2 className="text-lg font-semibold text-dark-text mb-3 flex items-center">
            <Briefcase size={20} className="mr-2 text-primary" /> Actions & Agreements
        </h2>
        <div className="space-y-4">
            <div>
                <div className="flex justify-between items-center">
                    <label htmlFor="leaderActions" className={`${labelClasses} mb-0`}>Leader Actions / Commitments</label>
                    <button type="button" onClick={() => getAiSuggestion('leaderActions', setIsAiSuggestingLeader, setAiLeaderError, setLeaderActions)} disabled={!canSuggestActionsOrResources || isAiSuggestingLeader} className="text-xs text-primary hover:text-primary-dark flex items-center disabled:opacity-50">
                        {isAiSuggestingLeader ? <LoadingSpinner size="sm"/> : <Wand2 size={14} className="mr-1"/>} AI Suggest
                    </button>
                </div>
                <textarea id="leaderActions" value={leaderActions} onChange={(e) => setLeaderActions(e.target.value)} rows={3} maxLength={500} className={`${textareaBaseClasses} border-orange-400/50 focus:border-orange-500 focus:ring-orange-500`} />
                <p className={charCounterClasses}>{leaderActionsCharCount}</p>
                {aiLeaderError && <p className="text-xs text-danger mt-1">{aiLeaderError}</p>}
            </div>
            <div>
                <div className="flex justify-between items-center">
                    <label htmlFor="soulverActions" className={`${labelClasses} mb-0`}>Soulver Actions / Commitments</label>
                     <button type="button" onClick={() => getAiSuggestion('soulverActions', setIsAiSuggestingSoulver, setAiSoulverError, setSoulverActions)} disabled={!canSuggestActionsOrResources || isAiSuggestingSoulver} className="text-xs text-primary hover:text-primary-dark flex items-center disabled:opacity-50">
                        {isAiSuggestingSoulver ? <LoadingSpinner size="sm"/> : <Wand2 size={14} className="mr-1"/>} AI Suggest
                    </button>
                </div>
                <textarea id="soulverActions" value={soulverActions} onChange={(e) => setSoulverActions(e.target.value)} rows={3} maxLength={500} className={`${textareaBaseClasses} border-teal-400/50 focus:border-teal-500 focus:ring-teal-500`} />
                <p className={charCounterClasses}>{soulverActionsCharCount}</p>
                {aiSoulverError && <p className="text-xs text-danger mt-1">{aiSoulverError}</p>}
            </div>
        </div>
      </div>

      <div className={cardBaseClasses}>
        <h2 className="text-lg font-semibold text-dark-text mb-3 flex items-center">
            <Users size={20} className="mr-2 text-primary" /> HR Support (Optional)
        </h2>
        <select id="hrSupportId" value={hrSupportId || ''} onChange={(e) => setHrSupportId(e.target.value || null)} className={`${inputBaseClasses} appearance-none`}>
          <option value="" className="bg-sidebar-bg">-- Select HR Representative (Optional) --</option>
          {hrTeamMembers.map(hr => (
            <option key={hr.id} value={hr.id} className="bg-sidebar-bg text-dark-text">{hr.name} ({hr.role})</option>
          ))}
        </select>
      </div>
      
      <div className={cardBaseClasses}>
        <h2 className="text-lg font-semibold text-dark-text mb-3 flex items-center">
            <Link size={20} className="mr-2 text-primary" /> Links & Documents (Optional)
        </h2>
        <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-end">
                <input type="text" value={currentLinkTitle} onChange={(e) => setCurrentLinkTitle(e.target.value)} placeholder="Link Title or Description" className={`${inputBaseClasses} md:mt-0`} />
                <input type="url" value={currentLinkUrl} onChange={(e) => setCurrentLinkUrl(e.target.value)} placeholder="Link URL (e.g., https://...)" className={`${inputBaseClasses} md:mt-0`} />
            </div>
            <button type="button" onClick={handleAddLink} className="w-full text-xs bg-input-bg hover:bg-border-color text-primary border border-primary py-1.5 px-3 rounded-md transition-colors shadow-sm flex items-center justify-center">
                <PlusCircle size={14} className="mr-1.5"/> Add Link
            </button>
            {links.length > 0 && (
                <ul className="space-y-1.5 text-xs max-h-32 overflow-y-auto custom-scrollbar pr-1">
                {links.map(link => (
                    <li key={link.id} className="flex justify-between items-center p-1.5 bg-sidebar-bg border border-light-border rounded-md">
                    <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline truncate mr-2" title={`${link.title} - ${link.url}`}>{link.title}</a>
                    <button type="button" onClick={() => handleRemoveLink(link.id)} className="text-danger hover:text-red-700 p-0.5" title="Remove link"><XCircle size={14}/></button>
                    </li>
                ))}
                </ul>
            )}
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button type="submit" className={buttonPrimaryClasses} disabled={(formMode === 'add' && !selectedSoulverId) || isAiSuggestingLeader || isAiSuggestingSoulver || isAiSuggestingResources}>
          <Save size={18} className="mr-2" /> {formMode === 'add' ? 'Save Feed Forward' : 'Update Feed Forward'}
        </button>
      </div>
    </form>
  );
};
