

import React, { useState } from 'react';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Wand2, ClipboardCopy, Send, Info } from 'lucide-react'; 
import { GEMINI_MODEL_TEXT } from '../constants';
import { GoogleGenAI } from "@google/genai";

interface AiResponse {
  rewrittenEmail: string;
  changeAnalysis: string;
  suggestedSubjects?: string[];
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const TONE_OPTIONS = ["Professional", "Friendly", "Formal", "Persuasive", "Empathetic", "Urgent", "Apologetic"];
const GOAL_OPTIONS = ["Provide Update", "Request Information", "Resolve Issue", "Sales Pitch", "Follow-up", "Offer Congratulations", "Decline Request", "Clarify Information"];
const AUDIENCE_OPTIONS = ["Client", "Internal Team", "Prospect", "Executive", "Partner"];

const MAX_DRAFT_LENGTH = 5000; // Example character limit

export const EmailToolsPage: React.FC = () => {
  const [draftEmail, setDraftEmail] = useState('');
  const [audience, setAudience] = useState(AUDIENCE_OPTIONS[0]);
  const [goal, setGoal] = useState(GOAL_OPTIONS[0]);
  const [tone, setTone] = useState(TONE_OPTIONS[0]);
  const [keyInfo, setKeyInfo] = useState('');
  
  const [rewrittenEmail, setRewrittenEmail] = useState('');
  const [changeAnalysis, setChangeAnalysis] = useState('');
  const [suggestedSubjects, setSuggestedSubjects] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEnhanceEmail = async () => {
    if (!draftEmail.trim()) {
      setError('Please enter a draft email.');
      return;
    }
    if (draftEmail.length > MAX_DRAFT_LENGTH) {
      setError(`Draft email is too long. Please keep it under ${MAX_DRAFT_LENGTH} characters.`);
      return;
    }
    setIsLoading(true);
    setError(null);
    setRewrittenEmail('');
    setChangeAnalysis('');
    setSuggestedSubjects([]);

    let promptContext = `Rewrite the following draft email. Also, provide a brief analysis of the changes you made and why. Finally, suggest 3-5 suitable subject lines for the rewritten email.\n\n`;
    promptContext += `Draft Email:\n---\n${draftEmail}\n---\n\n`;
    promptContext += `Context:\n`;
    promptContext += `- Audience: ${audience}\n`;
    promptContext += `- Goal of this email: ${goal}\n`;
    promptContext += `- Desired Tone: ${tone}\n`;
    if (keyInfo.trim()) {
      promptContext += `- Key Information to Include:\n${keyInfo.trim().split('\n').map(info => `  - ${info}`).join('\n')}\n`;
    }
    promptContext += `\nRespond in JSON format with three keys: "rewrittenEmail" (string), "changeAnalysis" (string), and "suggestedSubjects" (array of strings).\n`;
    promptContext += `Example JSON response:\n`;
    promptContext += `{\n`;
    promptContext += `  "rewrittenEmail": "Your rewritten email content here...",\n`;
    promptContext += `  "changeAnalysis": "Summary of changes made: ...",\n`;
    promptContext += `  "suggestedSubjects": ["Subject Line 1", "Subject Line 2", "Subject Line 3"]\n`;
    promptContext += `}`;


    try {
      const response = await ai.models.generateContent({
        model: GEMINI_MODEL_TEXT,
        contents: promptContext,
        config: {
           responseMimeType: "application/json",
        }
      });
      
      let jsonStr = response.text.trim();
      const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
      const match = jsonStr.match(fenceRegex);
      if (match && match[2]) {
        jsonStr = match[2].trim();
      }
      
      const parsedData: AiResponse = JSON.parse(jsonStr);

      setRewrittenEmail(parsedData.rewrittenEmail || 'No rewritten email provided.');
      setChangeAnalysis(parsedData.changeAnalysis || 'No change analysis provided.');
      setSuggestedSubjects(parsedData.suggestedSubjects || []);

    } catch (err: any) {
      console.error("Error enhancing email:", err);
      setError(err.message || 'Failed to enhance email. Please check console for details.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, type: string = "Email") => {
    navigator.clipboard.writeText(text).then(() => {
      alert(`${type} copied to clipboard!`);
    }).catch(err => {
      console.error('Failed to copy: ', err);
      alert(`Failed to copy ${type} to clipboard.`);
    });
  };
  
  const inputClasses = "w-full p-2.5 border border-border-color rounded-md shadow-subtle focus:ring-1 focus:ring-primary focus:border-primary text-sm bg-input-bg text-dark-text placeholder-placeholder-color";
  const selectClasses = "w-full form-select rounded-md border-border-color shadow-subtle text-sm focus:ring-1 focus:ring-primary focus:border-primary py-2.5 bg-input-bg text-dark-text appearance-none";
  const buttonClasses = "w-full flex items-center justify-center bg-primary hover:bg-primary-dark text-white font-semibold py-2.5 px-4 rounded-md transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed shadow-md hover:shadow-hero-glow-light hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-input-bg focus-visible:ring-primary";
  const labelClasses = "block text-sm font-medium text-medium-text mb-1";

  return (
    <div className="max-w-4xl mx-auto p-1">
      <h1 className="text-3xl font-bold text-dark-text mb-8 flex items-center"><Wand2 size={28} className="mr-3 text-primary" />AI Email Enhancer</h1>

      <div className="bg-input-bg p-6 rounded-lg shadow-card border border-border-color mb-6">
        <h2 className="text-xl font-medium text-dark-text mb-4">1. Draft Your Email</h2>
        <textarea
          value={draftEmail}
          onChange={(e) => setDraftEmail(e.target.value)}
          placeholder="Write or paste your draft email here..."
          rows={8}
          className={inputClasses}
          maxLength={MAX_DRAFT_LENGTH}
        />
        <p className={`text-xs text-right mt-1 ${draftEmail.length > MAX_DRAFT_LENGTH - 500 ? (draftEmail.length > MAX_DRAFT_LENGTH ? 'text-danger' : 'text-warning') : 'text-light-text'}`}>
          {draftEmail.length} / {MAX_DRAFT_LENGTH} characters
        </p>
        
        <h2 className="text-xl font-medium text-dark-text mb-3 mt-5">2. Set the Context</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="audience" className={labelClasses}>Audience</label>
            <select id="audience" value={audience} onChange={(e) => setAudience(e.target.value)} className={selectClasses}>
              {AUDIENCE_OPTIONS.map(opt => <option key={opt} value={opt} className="bg-input-bg text-dark-text">{opt}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="goal" className={labelClasses}>Goal</label>
            <select id="goal" value={goal} onChange={(e) => setGoal(e.target.value)} className={selectClasses}>
              {GOAL_OPTIONS.map(opt => <option key={opt} value={opt} className="bg-input-bg text-dark-text">{opt}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="tone" className={labelClasses}>Tone</label>
            <select id="tone" value={tone} onChange={(e) => setTone(e.target.value)} className={selectClasses}>
              {TONE_OPTIONS.map(opt => <option key={opt} value={opt} className="bg-input-bg text-dark-text">{opt}</option>)}
            </select>
          </div>
        </div>
        <div className="mt-4">
            <label htmlFor="keyInfo" className={`${labelClasses} flex items-center`} title="List crucial points (dates, names, specific actions) the AI must include, one per line.">
                Key Information to Include <span className="text-xs text-light-text ml-1">(Optional)</span>
                <Info size={13} className="text-light-text ml-1.5 cursor-help"/>
            </label>
            <textarea
                id="keyInfo"
                value={keyInfo}
                onChange={(e) => setKeyInfo(e.target.value)}
                placeholder="E.g., Mention the deadline: July 25th&#10;Confirm attendance for John Doe&#10;Reference invoice #12345"
                rows={3}
                className={inputClasses}
            />
        </div>
        <button
          onClick={handleEnhanceEmail}
          disabled={isLoading}
          className={`mt-6 ${buttonClasses}`}
        >
          {isLoading ? <LoadingSpinner size="sm" /> : <Send size={18} className="mr-2" />} 
          Enhance with AI
        </button>
        {error && <p className="text-danger text-sm mt-3 text-center">{error}</p>}
      </div>

      {isLoading && (
        <div className="flex justify-center my-8">
          <LoadingSpinner text="AI is working its magic..." />
        </div>
      )}

      {rewrittenEmail && !isLoading && (
        <div className="bg-input-bg p-6 rounded-lg shadow-card border border-border-color mb-6">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-medium text-dark-text">AI-Rewritten Email</h2>
            <button onClick={() => copyToClipboard(rewrittenEmail, "Rewritten email")} className="text-primary hover:text-primary-dark text-sm flex items-center font-medium">
              <ClipboardCopy size={16} className="mr-1" /> Copy Email
            </button>
          </div>
          <div className="p-4 border border-light-border rounded-md bg-sidebar-bg whitespace-pre-wrap text-sm leading-relaxed text-medium-text max-h-96 overflow-y-auto custom-scrollbar">{rewrittenEmail}</div>
        </div>
      )}
      
      {suggestedSubjects.length > 0 && !isLoading && (
        <div className="bg-input-bg p-6 rounded-lg shadow-card border border-border-color mb-6">
          <h2 className="text-xl font-medium text-dark-text mb-3">AI-Suggested Subject Lines</h2>
          <ul className="space-y-2">
            {suggestedSubjects.map((subject, index) => (
              <li key={index} className="flex justify-between items-center p-2.5 border border-light-border rounded-md bg-sidebar-bg text-sm">
                <span className="text-medium-text">{subject}</span>
                <button onClick={() => copyToClipboard(subject, "Subject line")} className="text-primary hover:text-primary-dark text-xs font-medium flex items-center">
                  <ClipboardCopy size={14} className="mr-1" /> Copy
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}


      {changeAnalysis && !isLoading && (
        <div className="bg-input-bg p-6 rounded-lg shadow-card border border-border-color">
          <h2 className="text-xl font-medium text-dark-text mb-3">Change Analysis</h2>
          <div className="p-4 border border-light-border rounded-md bg-sidebar-bg whitespace-pre-wrap text-sm leading-relaxed text-medium-text">{changeAnalysis}</div>
        </div>
      )}
    </div>
  );
};
