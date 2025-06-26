
import React from 'react';
import { Template, TemplateCategory, EmailTemplate, ITTicketTemplate, ReportTemplate } from '../types';
import { Tag, Calendar, RefreshCw, Type, Inbox, AlertCircle, FileText, ListChecks } from 'lucide-react';

interface TemplatePreviewContentProps {
  template: Template;
}

const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString(undefined, {
    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });
};

const getCategorySpecificPillClass = (category: TemplateCategory) => {
    switch (category) {
        case TemplateCategory.EMAIL: return 'bg-tag-blue-bg text-tag-blue-text border-tag-blue-text/30';
        case TemplateCategory.MESSAGE: return 'bg-tag-green-bg text-tag-green-text border-tag-green-text/30';
        case TemplateCategory.IT_TICKET: return 'bg-tag-orange-bg text-tag-orange-text border-tag-orange-text/30';
        case TemplateCategory.REPORT: return 'bg-tag-purple-bg text-tag-purple-text border-tag-purple-text/30';
        default: return 'bg-sidebar-bg text-medium-text border-light-border';
    }
}

export const TemplatePreviewContent: React.FC<TemplatePreviewContentProps> = ({ template }) => {
  return (
    <div className="space-y-5 text-dark-text">
      <div className="border-b border-border-color pb-4">
        <div className="flex justify-between items-start">
            <h1 className="text-2xl font-bold text-primary mb-1">{template.name}</h1>
            <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getCategorySpecificPillClass(template.category)}`}>
                {template.category}
            </span>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-medium-text mt-1.5">
          <span className="flex items-center"><Calendar size={14} className="mr-1.5 text-light-text" /> Created: {formatDate(template.createdAt)}</span>
          <span className="flex items-center"><RefreshCw size={14} className="mr-1.5 text-light-text" /> Updated: {formatDate(template.updatedAt)}</span>
        </div>
      </div>

      {/* Category Specific Details */}
      {template.category === TemplateCategory.EMAIL && (
        <div className="bg-sidebar-bg p-3 rounded-md border border-light-border text-sm">
          <span className="flex items-center text-medium-text"><Inbox size={15} className="mr-2 text-tag-blue-text" /><strong>Subject:</strong>&nbsp;{(template as EmailTemplate).subject}</span>
        </div>
      )}
      {template.category === TemplateCategory.IT_TICKET && (
        <div className="bg-sidebar-bg p-3 rounded-md border border-light-border text-sm space-y-1">
          <span className="flex items-center text-medium-text"><AlertCircle size={15} className="mr-2 text-tag-orange-text" /><strong>Priority:</strong>&nbsp;{(template as ITTicketTemplate).ticketPriority}</span>
          {(template as ITTicketTemplate).assigneeSuggestion && (
            <span className="flex items-center text-medium-text"><Type size={15} className="mr-2 text-tag-orange-text" /><strong>Suggested Assignee:</strong>&nbsp;{(template as ITTicketTemplate).assigneeSuggestion}</span>
          )}
        </div>
      )}
      {template.category === TemplateCategory.REPORT && (
        <div className="bg-sidebar-bg p-3 rounded-md border border-light-border text-sm space-y-1">
          <span className="flex items-center text-medium-text"><FileText size={15} className="mr-2 text-tag-purple-text" /><strong>Report Type:</strong>&nbsp;{(template as ReportTemplate).reportType}</span>
          {(template as ReportTemplate).dataFields && (template as ReportTemplate).dataFields!.length > 0 && (
            <div>
                <span className="flex items-center text-medium-text"><ListChecks size={15} className="mr-2 text-tag-purple-text" /><strong>Data Fields:</strong></span>
                <div className="flex flex-wrap gap-1.5 mt-1 pl-6">
                    {(template as ReportTemplate).dataFields!.map(field => (
                        <span key={field} className="px-2 py-0.5 text-xs rounded-full bg-input-bg text-light-text border border-border-color">
                            {field}
                        </span>
                    ))}
                </div>
            </div>
          )}
        </div>
      )}


      {template.tags && template.tags.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <Tag size={16} className="text-primary mr-1" />
          {template.tags.map(tag => (
            <span key={tag} className="px-2.5 py-1 text-xs font-medium rounded-full bg-primary-light text-primary border border-primary/30">
              {tag}
            </span>
          ))}
        </div>
      )}

      <div>
        <h2 className="text-sm font-semibold text-light-text uppercase tracking-wider mb-2">Content</h2>
        <div className="prose prose-sm prose-invert max-w-none bg-sidebar-bg p-4 rounded-md border border-border-color max-h-[45vh] overflow-y-auto custom-scrollbar">
          <p className="whitespace-pre-wrap text-medium-text leading-relaxed">
            {template.content}
          </p>
        </div>
      </div>
    </div>
  );
};