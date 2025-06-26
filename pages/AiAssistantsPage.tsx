
import React, { useState, useMemo } from 'react';
import { Client, TeamMember } from '../types';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Bot, FileText, Ticket, Send, MessageSquareText, Edit, CheckCircle } from 'lucide-react'; 
import { GoogleGenAI } from "@google/genai";
import { GEMINI_MODEL_TEXT } from '../constants';

interface IntelligenceBriefingResult {
  sentiment: string;
  keyPoints: string[];
  actionItems: string[];
}

interface JiraTicketResult {
  ticketSummary: string;
  ticketDescription: string;
}

interface PerformanceFeedbackResult {
  feedbackText: string;
}

interface AiAssistantsPageProps {
  clients: Client[];
  teamMembers: TeamMember[];
  currentUser: TeamMember;
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const TONE_OPTIONS_FEEDBACK = ["Constructive", "Encouraging", "Formal", "Direct", "Balanced"];


export const AiAssistantsPage: React.FC<AiAssistantsPageProps> = ({ clients, teamMembers, currentUser }) => {
  const [activeTab, setActiveTab] = useState<'briefing' | 'jira' | 'feedback'>('briefing');

  // --- State for Intelligence Briefing ---
  const [emailContent, setEmailContent] = useState('');
  const [briefingResult, setBriefingResult] = useState<IntelligenceBriefingResult | null>(null);
  const [isBriefingLoading, setIsBriefingLoading] = useState(false);
  const [briefingError, setBriefingError] = useState<string | null>(null);

  // --- State for Jira Ticket Assistant ---
  const [jiraClient, setJiraClient] = useState<string>(clients[0]?.id || '');
  const [jiraTeamMember, setJiraTeamMember] = useState<string>(teamMembers[0]?.id || '');
  const [jiraIssueDescription, setJiraIssueDescription] = useState('');
  const [jiraTicketResult, setJiraTicketResult] = useState<JiraTicketResult | null>(null);
  const [isJiraLoading, setIsJiraLoading] = useState(false);
  const [jiraError, setJiraError] = useState<string | null>(null);

  // --- State for Performance Feedback Generator ---
  const [feedbackTeamMemberId, setFeedbackTeamMemberId] = useState<string>(teamMembers.filter(tm => tm.id !== currentUser.id)[0]?.id || '');
  const [feedbackPerformancePeriod, setFeedbackPerformancePeriod] = useState('');
  const [feedbackStrengths, setFeedbackStrengths] = useState('');
  const [feedbackAreasForImprovement, setFeedbackAreasForImprovement] = useState('');
  const [feedbackAchievements, setFeedbackAchievements] = useState('');
  const [feedbackNextGoals, setFeedbackNextGoals] = useState('');
  const [feedbackTone, setFeedbackTone] = useState<string>(TONE_OPTIONS_FEEDBACK[0]);
  const [feedbackResult, setFeedbackResult] = useState<PerformanceFeedbackResult | null>(null);
  const [isFeedbackLoading, setIsFeedbackLoading] = useState(false);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  
  const inputClasses = "w-full p-2.5 border border-border-color rounded-md shadow-subtle focus:ring-1 focus:ring-primary focus:border-primary text-sm bg-input-bg text-dark-text placeholder-placeholder-color";
  const selectClasses = "w-full form-select rounded-md border-border-color shadow-subtle text-sm focus:ring-1 focus:ring-primary focus:border-primary py-2.5 bg-input-bg text-dark-text appearance-none";
  const labelClasses = "block text-sm font-medium text-medium-text mb-1";
  const buttonBaseClasses = "w-full flex items-center justify-center font-semibold py-2.5 px-4 rounded-md transition-all duration-300 disabled:opacity-60 shadow-md hover:shadow-hero-glow-light hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-input-bg";
  
  const buttonPrimaryClasses = `${buttonBaseClasses} bg-primary hover:bg-primary-dark text-white focus-visible:ring-primary`;
  const buttonSuccessClasses = `${buttonBaseClasses} bg-success hover:bg-emerald-600 text-white focus-visible:ring-success`;
  const buttonPurpleClasses = `${buttonBaseClasses} bg-purple-600 hover:bg-purple-700 text-white focus-visible:ring-purple-600`;

  const handleIntelligenceBriefing = async () => {
    if (!emailContent.trim()) {
      setBriefingError('Please paste email content.');
      return;
    }
    setIsBriefingLoading(true);
    setBriefingError(null);
    setBriefingResult(null);

    const prompt = `
      Analyze the following email content and provide a structured intelligence briefing.
      Email Content:
      ---
      ${emailContent}
      ---
      Extract the overall sentiment, key points (as an array of strings), and action items (as an array of strings).
      Respond in JSON format with keys: "sentiment" (string), "keyPoints" (array of strings), "actionItems" (array of strings).
    `;
    try {
      const genAIResponse = await ai.models.generateContent({
        model: GEMINI_MODEL_TEXT, contents: prompt, config: { responseMimeType: "application/json" }
      });
      let jsonStr = genAIResponse.text.trim();
      const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
      const match = jsonStr.match(fenceRegex);
      if (match && match[2]) { jsonStr = match[2].trim(); }
      setBriefingResult(JSON.parse(jsonStr));
    } catch (err: any) { setBriefingError(err.message || 'Failed to generate briefing.');
    } finally { setIsBriefingLoading(false); }
  };

  const handleJiraTicket = async () => {
    if (!jiraIssueDescription.trim()) {
      setJiraError('Please describe the issue.');
      return;
    }
    setIsJiraLoading(true);
    setJiraError(null);
    setJiraTicketResult(null);
    const selectedClientName = clients.find(c => c.id === jiraClient)?.name || 'N/A';
    const selectedTeamMemberName = teamMembers.find(tm => tm.id === jiraTeamMember)?.name || 'N/A';
    const prompt = `
      Generate a Jira ticket summary and description based on the following information:
      - Client: ${selectedClientName}
      - Team Member to investigate/assign (optional): ${selectedTeamMemberName}
      - Issue Description: ${jiraIssueDescription}
      Provide a concise ticketSummary (max 15 words) and a detailed ticketDescription.
      The description should be formatted nicely for Jira.
      Respond in JSON format with keys: "ticketSummary" (string) and "ticketDescription" (string).
    `;
    try {
      const genAIResponse = await ai.models.generateContent({
        model: GEMINI_MODEL_TEXT, contents: prompt, config: { responseMimeType: "application/json" }
      });
      let jsonStr = genAIResponse.text.trim();
      const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
      const match = jsonStr.match(fenceRegex);
      if (match && match[2]) { jsonStr = match[2].trim(); }
      setJiraTicketResult(JSON.parse(jsonStr));
    } catch (err: any) { setJiraError(err.message || 'Failed to generate Jira ticket content.');
    } finally { setIsJiraLoading(false); }
  };

  const handleGeneratePerformanceFeedback = async () => {
    if (!feedbackTeamMemberId || !feedbackPerformancePeriod.trim() || !feedbackStrengths.trim() || !feedbackAreasForImprovement.trim()) {
      setFeedbackError('Please select a Team Member and fill in Period, Strengths, and Areas for Improvement.');
      return;
    }
    setIsFeedbackLoading(true);
    setFeedbackError(null);
    setFeedbackResult(null);

    const memberName = teamMembers.find(tm => tm.id === feedbackTeamMemberId)?.name || 'Team Member';

    const prompt = `
      Generate structured performance feedback for ${memberName} for the period "${feedbackPerformancePeriod}".
      The desired tone for the feedback is: ${feedbackTone}.

      Key Strengths:
      ${feedbackStrengths}

      Areas for Improvement:
      ${feedbackAreasForImprovement}

      Key Achievements/Contributions (if any):
      ${feedbackAchievements || "None specified."}

      Next Period Goals (if any):
      ${feedbackNextGoals || "None specified."}

      Combine these points into a coherent feedback narrative suitable for a performance review.
      Ensure the feedback flows well, is constructive, and maintains the specified tone.
      Respond in JSON format with a single key "feedbackText" (string).
    `;

    try {
      const genAIResponse = await ai.models.generateContent({
        model: GEMINI_MODEL_TEXT, contents: prompt, config: { responseMimeType: "application/json" }
      });
      let jsonStr = genAIResponse.text.trim();
      const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
      const match = jsonStr.match(fenceRegex);
      if (match && match[2]) { jsonStr = match[2].trim(); }
      setFeedbackResult(JSON.parse(jsonStr));
    } catch (err: any) { setFeedbackError(err.message || 'Failed to generate performance feedback.');
    } finally { setIsFeedbackLoading(false); }
  };
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      alert("Copied to clipboard!");
    }).catch(err => {
      console.error('Failed to copy: ', err);
      alert(`Failed to copy to clipboard.`);
    });
  };


  const renderAssistantContent = () => {
    switch (activeTab) {
      case 'briefing':
        return (
          <section className="bg-input-bg p-6 rounded-lg shadow-card border border-border-color">
            <h2 className="text-xl font-medium text-dark-text mb-4 flex items-center"><FileText size={22} className="mr-2 text-primary"/>Intelligence Briefing from Email</h2>
            <textarea value={emailContent} onChange={(e) => setEmailContent(e.target.value)} placeholder="Paste email content here..." rows={6} className={`${inputClasses} mb-3`}/>
            <button onClick={handleIntelligenceBriefing} disabled={isBriefingLoading} className={buttonPrimaryClasses}>
              {isBriefingLoading ? <LoadingSpinner size="sm"/> : <Send size={18} className="mr-2" />}Generate Briefing
            </button>
            {briefingError && <p className="text-danger text-sm mt-3 text-center">{briefingError}</p>}
            {isBriefingLoading && <div className="mt-4"><LoadingSpinner text="Generating briefing..."/></div>}
            {briefingResult && !isBriefingLoading && (
              <div className="mt-4 p-4 border border-light-border rounded-md bg-sidebar-bg space-y-3">
                <div><strong className="text-sm text-dark-text">Sentiment:</strong> <span className="text-sm text-medium-text">{briefingResult.sentiment}</span></div>
                <div><strong className="text-sm text-dark-text">Key Points:</strong>
                  <ul className="list-disc list-inside ml-4 text-sm text-medium-text">
                    {briefingResult.keyPoints.map((item, i) => <li key={i}>{item}</li>)}
                  </ul>
                </div>
                <div><strong className="text-sm text-dark-text">Action Items:</strong>
                  <ul className="list-disc list-inside ml-4 text-sm text-medium-text">
                    {briefingResult.actionItems.map((item, i) => <li key={i}>{item}</li>)}
                  </ul>
                </div>
              </div>
            )}
          </section>
        );
      case 'jira':
        return (
          <section className="bg-input-bg p-6 rounded-lg shadow-card border border-border-color">
            <h2 className="text-xl font-medium text-dark-text mb-4 flex items-center"><Ticket size={22} className="mr-2 text-success"/>Jira Ticket Assistant</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
              <div>
                <label htmlFor="jiraClient" className={labelClasses}>Client</label>
                <select id="jiraClient" value={jiraClient} onChange={(e) => setJiraClient(e.target.value)} className={selectClasses}>
                  {clients.map(c => <option key={c.id} value={c.id} className="bg-input-bg text-dark-text">{c.name}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="jiraTeamMember" className={labelClasses}>Assign To (Optional)</label>
                <select id="jiraTeamMember" value={jiraTeamMember} onChange={(e) => setJiraTeamMember(e.target.value)} className={selectClasses}>
                  {teamMembers.map(tm => <option key={tm.id} value={tm.id} className="bg-input-bg text-dark-text">{tm.name}</option>)}
                </select>
              </div>
            </div>
            <textarea value={jiraIssueDescription} onChange={(e) => setJiraIssueDescription(e.target.value)} placeholder="Describe the issue or feature request..." rows={4} className={`${inputClasses} mb-3`}/>
            <button onClick={handleJiraTicket} disabled={isJiraLoading} className={buttonSuccessClasses}>
              {isJiraLoading ? <LoadingSpinner size="sm"/> : <Send size={18} className="mr-2" />}Generate Jira Content
            </button>
            {jiraError && <p className="text-danger text-sm mt-3 text-center">{jiraError}</p>}
            {isJiraLoading && <div className="mt-4"><LoadingSpinner text="Generating Jira content..."/></div>}
            {jiraTicketResult && !isJiraLoading && (
              <div className="mt-4 p-4 border border-light-border rounded-md bg-sidebar-bg space-y-3">
                <div><strong className="text-sm text-dark-text">Ticket Summary:</strong> <p className="text-sm text-medium-text p-3 bg-input-bg rounded-md border border-light-border mt-1">{jiraTicketResult.ticketSummary}</p></div>
                <div><strong className="text-sm text-dark-text">Ticket Description:</strong> <div className="text-sm text-medium-text whitespace-pre-wrap p-3 bg-input-bg rounded-md border border-light-border mt-1">{jiraTicketResult.ticketDescription}</div></div>
              </div>
            )}
          </section>
        );
      case 'feedback':
        return (
          <section className="bg-input-bg p-6 rounded-lg shadow-card border border-border-color">
            <h2 className="text-xl font-medium text-dark-text mb-4 flex items-center"><Edit size={22} className="mr-2 text-purple-500"/>Performance Feedback Generator</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
              <div>
                <label htmlFor="feedbackTeamMember" className={labelClasses}>Team Member</label>
                <select id="feedbackTeamMember" value={feedbackTeamMemberId} onChange={(e) => setFeedbackTeamMemberId(e.target.value)} className={selectClasses}>
                  {teamMembers.filter(tm => tm.id !== currentUser.id).map(tm => <option key={tm.id} value={tm.id} className="bg-input-bg text-dark-text">{tm.name}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="feedbackPerformancePeriod" className={labelClasses}>Performance Period</label>
                <input type="text" id="feedbackPerformancePeriod" value={feedbackPerformancePeriod} onChange={(e) => setFeedbackPerformancePeriod(e.target.value)} placeholder="E.g., Q3 2025, Annual 2024" className={inputClasses} />
              </div>
            </div>
            <div className="mb-3">
              <label htmlFor="feedbackStrengths" className={labelClasses}>Key Strengths</label>
              <textarea id="feedbackStrengths" value={feedbackStrengths} onChange={(e) => setFeedbackStrengths(e.target.value)} placeholder="List strengths (bullet points or paragraph)" rows={3} className={inputClasses} />
            </div>
            <div className="mb-3">
              <label htmlFor="feedbackAreasForImprovement" className={labelClasses}>Areas for Improvement</label>
              <textarea id="feedbackAreasForImprovement" value={feedbackAreasForImprovement} onChange={(e) => setFeedbackAreasForImprovement(e.target.value)} placeholder="List areas for improvement (bullet points or paragraph)" rows={3} className={inputClasses} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                <div>
                    <label htmlFor="feedbackAchievements" className={labelClasses}>Key Achievements/Contributions (Optional)</label>
                    <textarea id="feedbackAchievements" value={feedbackAchievements} onChange={(e) => setFeedbackAchievements(e.target.value)} placeholder="List achievements" rows={2} className={inputClasses} />
                </div>
                <div>
                    <label htmlFor="feedbackNextGoals" className={labelClasses}>Next Period Goals (Optional)</label>
                    <textarea id="feedbackNextGoals" value={feedbackNextGoals} onChange={(e) => setFeedbackNextGoals(e.target.value)} placeholder="List goals for next period" rows={2} className={inputClasses} />
                </div>
            </div>
             <div className="mb-4">
                <label htmlFor="feedbackTone" className={labelClasses}>Overall Tone</label>
                <select id="feedbackTone" value={feedbackTone} onChange={(e) => setFeedbackTone(e.target.value)} className={selectClasses}>
                  {TONE_OPTIONS_FEEDBACK.map(opt => <option key={opt} value={opt} className="bg-input-bg text-dark-text">{opt}</option>)}
                </select>
            </div>
            <button onClick={handleGeneratePerformanceFeedback} disabled={isFeedbackLoading} className={buttonPurpleClasses}>
              {isFeedbackLoading ? <LoadingSpinner size="sm"/> : <Send size={18} className="mr-2" />}Generate Feedback
            </button>
            {feedbackError && <p className="text-danger text-sm mt-3 text-center">{feedbackError}</p>}
            {isFeedbackLoading && <div className="mt-4"><LoadingSpinner text="Generating feedback..."/></div>}
            {feedbackResult && !isFeedbackLoading && (
              <div className="mt-4 p-4 border border-light-border rounded-md bg-sidebar-bg space-y-3">
                <div className="flex justify-between items-center">
                    <strong className="text-sm text-dark-text">Generated Feedback:</strong>
                    <button onClick={() => copyToClipboard(feedbackResult.feedbackText)} className="text-purple-400 hover:text-purple-300 text-xs flex items-center font-medium">
                        <CheckCircle size={13} className="mr-1" /> Copy Feedback
                    </button>
                </div>
                <div className="text-sm text-medium-text whitespace-pre-wrap p-3 bg-input-bg rounded-md border border-light-border max-h-80 overflow-y-auto custom-scrollbar">{feedbackResult.feedbackText}</div>
              </div>
            )}
          </section>
        );
      default:
        return null;
    }
  };

  const tabs = [
    { id: 'briefing', label: 'Email Briefing', icon: FileText },
    { id: 'jira', label: 'Jira Assistant', icon: Ticket },
    { id: 'feedback', label: 'Performance Feedback', icon: Edit },
  ] as const;


  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-dark-text mb-6 flex items-center">
        <Bot size={32} className="mr-3 text-primary"/>AI Assistants
      </h1>
      
      <div className="border-b border-border-color">
        <nav className="-mb-px flex space-x-2 overflow-x-auto custom-scrollbar pb-1 px-1" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              aria-current={tab.id === activeTab ? 'page' : undefined}
              className={`group inline-flex items-center py-2.5 px-3.5 border-b-2 font-medium text-sm whitespace-nowrap rounded-t-md transition-colors
                ${tab.id === activeTab
                  ? 'border-primary text-primary'
                  : 'border-transparent text-medium-text hover:text-dark-text hover:border-light-border'
                }`}
            >
              <tab.icon size={16} className={`mr-2 ${tab.id === activeTab ? 'text-primary' : 'text-light-text group-hover:text-medium-text'}`} />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-6">
        {renderAssistantContent()}
      </div>
    </div>
  );
};
