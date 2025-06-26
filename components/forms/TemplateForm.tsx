import React, { useState, useEffect } from 'react';
import { Template, FormMode, TemplateCategory, ITTicketPriority, EmailTemplate, MessageTemplate, ITTicketTemplate, ReportTemplate } from '../../types';
import { GoogleGenAI } from "@google/genai";
import { GEMINI_MODEL_TEXT } from '../../constants';
import { LoadingSpinner } from '../LoadingSpinner';
import { Wand2 } from 'lucide-react';

interface TemplateFormProps {
  onSubmit: (data: Template | Omit<Template, 'id' | 'createdAt' | 'updatedAt'>) => void;
  initialData?: Template;
  mode: FormMode;
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const inputClasses = "mt-1 block w-full px-3 py-2 border border-border-color rounded-md shadow-subtle focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm bg-input-bg text-dark-text placeholder-placeholder-color";
const buttonClasses = "inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary";
const labelClasses = "block text-sm font-medium text-medium-text";

export const TemplateForm: React.FC<TemplateFormProps> = ({ onSubmit, initialData, mode }) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<TemplateCategory>(TemplateCategory.EMAIL);
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState('');

  // Category-specific fields
  const [subject, setSubject] = useState(''); // Email
  const [ticketPriority, setTicketPriority] = useState<ITTicketPriority>('Medium'); // IT Ticket
  const [assigneeSuggestion, setAssigneeSuggestion] = useState(''); // IT Ticket
  const [reportType, setReportType] = useState(''); // Report
  const [dataFields, setDataFields] = useState<string[]>([]); // Report
  const [currentDataField, setCurrentDataField] = useState(''); // Report

  const [isAiOptimizing, setIsAiOptimizing] = useState(false);
  const [aiOptimizeError, setAiOptimizeError] = useState<string | null>(null);


  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setCategory(initialData.category);
      setContent(initialData.content);
      setTags(initialData.tags || []);
      
      switch (initialData.category) {
        case TemplateCategory.EMAIL:
          setSubject((initialData as EmailTemplate).subject || '');
          break;
        case TemplateCategory.IT_TICKET:
          setTicketPriority((initialData as ITTicketTemplate).ticketPriority || 'Medium');
          setAssigneeSuggestion((initialData as ITTicketTemplate).assigneeSuggestion || '');
          break;
        case TemplateCategory.REPORT:
          setReportType((initialData as ReportTemplate).reportType || '');
          setDataFields((initialData as ReportTemplate).dataFields || []);
          break;
      }
    } else {
        // Reset specific fields when category changes or form is for adding
        setSubject('');
        setTicketPriority('Medium');
        setAssigneeSuggestion('');
        setReportType('');
        setDataFields([]);
    }
  }, [initialData]);
  
  // Reset specific fields when category changes
  useEffect(() => {
    if (mode === 'add' || (initialData && category !== initialData.category)) {
        setSubject('');
        setTicketPriority('Medium');
        setAssigneeSuggestion('');
        setReportType('');
        setDataFields([]);
    }
  }, [category, mode, initialData]);


  const handleAddTag = () => {
    if (currentTag && !tags.includes(currentTag.trim())) {
      setTags([...tags, currentTag.trim()]);
      setCurrentTag('');
    }
  };
  const handleRemoveTag = (tagToRemove: string) => setTags(tags.filter(tag => tag !== tagToRemove));

  const handleAddDataField = () => {
    if (currentDataField && !dataFields.includes(currentDataField.trim())) {
      setDataFields([...dataFields, currentDataField.trim()]);
      setCurrentDataField('');
    }
  };
  const handleRemoveDataField = (fieldToRemove: string) => setDataFields(dataFields.filter(field => field !== fieldToRemove));

  const handleAiOptimizeContent = async () => {
    if (!content.trim()) {
      setAiOptimizeError("Please write some content to optimize.");
      return;
    }
    setIsAiOptimizing(true);
    setAiOptimizeError(null);
    const prompt = `
      Optimize the following template content for clarity, conciseness, and impact.
      Consider its category: "${category}".
      Current Content:
      ---
      ${content}
      ---
      Optimized Content (return only the improved text):
    `;
    try {
      const response = await ai.models.generateContent({
        model: GEMINI_MODEL_TEXT,
        contents: prompt,
      });
      setContent(response.text.trim());
    } catch (err: any) {
      console.error("AI Optimization Error:", err);
      setAiOptimizeError(err.message || "Failed to get AI optimization.");
    } finally {
      setIsAiOptimizing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    let templateData: Omit<Template, 'id' | 'createdAt' | 'updatedAt'>;

    const baseData = { name, content, tags, category };

    switch (category) {
      case TemplateCategory.EMAIL:
        templateData = { ...baseData, category: TemplateCategory.EMAIL, subject } as Omit<EmailTemplate, 'id'|'createdAt'|'updatedAt'>;
        break;
      case TemplateCategory.MESSAGE:
        templateData = { ...baseData, category: TemplateCategory.MESSAGE } as Omit<MessageTemplate, 'id'|'createdAt'|'updatedAt'>;
        break;
      case TemplateCategory.IT_TICKET:
        templateData = { ...baseData, category: TemplateCategory.IT_TICKET, ticketPriority, assigneeSuggestion } as Omit<ITTicketTemplate, 'id'|'createdAt'|'updatedAt'>;
        break;
      case TemplateCategory.REPORT:
        templateData = { ...baseData, category: TemplateCategory.REPORT, reportType, dataFields } as Omit<ReportTemplate, 'id'|'createdAt'|'updatedAt'>;
        break;
      default:
        console.error("Invalid template category in form submission:", category);
        templateData = { ...baseData, category: TemplateCategory.MESSAGE } as Omit<MessageTemplate, 'id'|'createdAt'|'updatedAt'>;
        return; 
    }
    
    if (mode === 'edit' && initialData) {
      onSubmit({ ...initialData, ...templateData } as Template);
    } else {
      onSubmit(templateData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="template-name" className={labelClasses}>Template Name</label>
        <input type="text" id="template-name" value={name} onChange={(e) => setName(e.target.value)} required className={inputClasses} />
      </div>
      <div>
        <label htmlFor="template-category" className={labelClasses}>Category</label>
        <select id="template-category" value={category} onChange={(e) => setCategory(e.target.value as TemplateCategory)} required className={`${inputClasses} appearance-none`}>
          {Object.values(TemplateCategory).map(cat => <option key={cat} value={cat} className="bg-input-bg text-dark-text">{cat}</option>)}
        </select>
      </div>

      {/* Category Specific Fields */}
      {category === TemplateCategory.EMAIL && (
        <div>
          <label htmlFor="template-subject" className={labelClasses}>Subject</label>
          <input type="text" id="template-subject" value={subject} onChange={(e) => setSubject(e.target.value)} required={category === TemplateCategory.EMAIL} className={inputClasses} />
        </div>
      )}
      {category === TemplateCategory.IT_TICKET && (
        <>
          <div>
            <label htmlFor="template-it-priority" className={labelClasses}>Ticket Priority</label>
            <select id="template-it-priority" value={ticketPriority} onChange={(e) => setTicketPriority(e.target.value as ITTicketPriority)} required={category === TemplateCategory.IT_TICKET} className={`${inputClasses} appearance-none`}>
              <option value="Low" className="bg-input-bg text-dark-text">Low</option>
              <option value="Medium" className="bg-input-bg text-dark-text">Medium</option>
              <option value="High" className="bg-input-bg text-dark-text">High</option>
            </select>
          </div>
          <div>
            <label htmlFor="template-it-assignee" className={labelClasses}>Assignee Suggestion (Optional)</label>
            <input type="text" id="template-it-assignee" value={assigneeSuggestion} onChange={(e) => setAssigneeSuggestion(e.target.value)} className={inputClasses} />
          </div>
        </>
      )}
      {category === TemplateCategory.REPORT && (
        <>
          <div>
            <label htmlFor="template-report-type" className={labelClasses}>Report Type</label>
            <input type="text" id="template-report-type" value={reportType} onChange={(e) => setReportType(e.target.value)} required={category === TemplateCategory.REPORT} className={inputClasses} placeholder="e.g., Weekly Summary, Monthly KPI Review"/>
          </div>
          <div>
            <label htmlFor="template-report-datafields" className={labelClasses}>Suggested Data Fields (Optional)</label>
            <div className="flex items-center mt-1">
              <input type="text" value={currentDataField} onChange={(e) => setCurrentDataField(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); handleAddDataField();}}} placeholder="Add a data field..." className={`flex-grow rounded-r-none ${inputClasses}`}/>
              <button type="button" onClick={handleAddDataField} className="px-4 py-2 border border-l-0 border-primary bg-primary text-white rounded-l-none rounded-r-md hover:bg-primary-dark focus:outline-none focus:ring-1 focus:ring-primary h-[calc(2.625rem+2px)] mt-1 text-sm">Add</button>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {dataFields.map(field => (
                <span key={field} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-light text-primary border border-primary/30">
                  {field} <button type="button" onClick={() => handleRemoveDataField(field)} className="ml-1.5 text-primary hover:text-primary-dark">&times;</button>
                </span>
              ))}
            </div>
          </div>
        </>
      )}

      <div>
         <div className="flex justify-between items-center">
            <label htmlFor="template-content" className={labelClasses}>Content</label>
            <button 
                type="button" 
                onClick={handleAiOptimizeContent} 
                disabled={isAiOptimizing || !content.trim()}
                className="text-xs text-primary hover:text-primary-dark flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                title="Optimize content with AI"
            >
                {isAiOptimizing ? 
                    <LoadingSpinner size="sm" /> : 
                    <Wand2 size={14} className="mr-1" />
                }
                AI Optimize
            </button>
        </div>
        <textarea id="template-content" value={content} onChange={(e) => setContent(e.target.value)} required rows={5} className={inputClasses} placeholder="Use {{variableName}} for placeholders." />
        {aiOptimizeError && <p className="text-xs text-danger mt-1">{aiOptimizeError}</p>}
      </div>
      <div>
        <label htmlFor="template-tags" className={labelClasses}>Tags (Optional)</label>
        <div className="flex items-center mt-1">
          <input type="text" value={currentTag} onChange={(e) => setCurrentTag(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); handleAddTag();}}} placeholder="Add a tag..." className={`flex-grow rounded-r-none ${inputClasses}`} />
          <button type="button" onClick={handleAddTag} className="px-4 py-2 border border-l-0 border-primary bg-primary text-white rounded-l-none rounded-r-md hover:bg-primary-dark focus:outline-none focus:ring-1 focus:ring-primary h-[calc(2.625rem+2px)] mt-1 text-sm">Add</button>
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {tags.map(tag => (
            <span key={tag} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-light text-primary border border-primary/30">
              {tag} <button type="button" onClick={() => handleRemoveTag(tag)} className="ml-1.5 text-primary hover:text-primary-dark">&times;</button>
            </span>
          ))}
        </div>
      </div>
      <div className="flex justify-end pt-2">
        <button type="submit" className={buttonClasses}>
          {mode === 'add' ? 'Add Template' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
};