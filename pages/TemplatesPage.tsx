


import React, { useState, useMemo } from 'react';
import { Template, FormMode, TemplateCategory } from '../types';
import { PlusCircle, Edit2, Trash2, LayoutTemplate, Search, Tag, Eye } from 'lucide-react';
import { EmptyState } from '../components/EmptyState';


interface TemplatesPageProps {
  templates: Template[];
  onOpenTemplateForm: (mode: FormMode, template?: Template) => void;
  onDeleteTemplate: (id: string) => void;
  onOpenTemplatePreviewModal: (template: Template) => void;
}

const getCategoryColorClass = (category: TemplateCategory): string => {
  switch (category) {
    case TemplateCategory.EMAIL: return 'bg-tag-blue-bg text-tag-blue-text border-tag-blue-text/30';
    case TemplateCategory.MESSAGE: return 'bg-tag-green-bg text-tag-green-text border-tag-green-text/30';
    case TemplateCategory.IT_TICKET: return 'bg-tag-orange-bg text-tag-orange-text border-tag-orange-text/30';
    case TemplateCategory.REPORT: return 'bg-tag-purple-bg text-tag-purple-text border-tag-purple-text/30';
    default: return 'bg-sidebar-bg text-medium-text border-light-border';
  }
};

export const TemplatesPage: React.FC<TemplatesPageProps> = ({ templates, onOpenTemplateForm, onDeleteTemplate, onOpenTemplatePreviewModal }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<TemplateCategory | 'all'>('all');

  const filteredTemplates = useMemo(() => {
    return templates.filter(template => {
      const termMatch = searchTerm.trim() === '' ||
        template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      const categoryMatch = categoryFilter === 'all' || template.category === categoryFilter;
      return termMatch && categoryMatch;
    }).sort((a,b) => b.updatedAt.localeCompare(a.updatedAt)); 
  }, [templates, searchTerm, categoryFilter]);

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold text-dark-text flex items-center">
          <LayoutTemplate size={32} className="mr-3 text-primary" />
          Templates
        </h1>
        <button
          onClick={() => onOpenTemplateForm('add')}
          className="flex items-center bg-primary hover:bg-primary-dark text-white font-medium py-2.5 px-5 rounded-md text-sm transition-all duration-300 shadow-md hover:shadow-hero-glow-light hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-light-bg focus-visible:ring-primary"
        >
          <PlusCircle size={18} className="mr-2" /> Add New Template
        </button>
      </div>

      <div className="p-4 bg-sidebar-bg rounded-lg shadow-subtle flex flex-col md:flex-row flex-wrap gap-4 border border-border-color items-center">
        <div className="relative flex-grow w-full md:w-auto">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-placeholder-color" />
          </div>
          <input
            type="search"
            placeholder="Search templates by name, content, or tag..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-border-color rounded-md leading-5 bg-input-bg text-dark-text placeholder-placeholder-color focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm shadow-subtle"
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Tag className="h-5 w-5 text-light-text" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as TemplateCategory | 'all')}
            className="form-select w-full md:w-auto rounded-md border-border-color shadow-subtle focus:border-primary focus:ring-1 focus:ring-primary text-sm py-2 bg-input-bg text-dark-text appearance-none"
          >
            <option value="all" className="bg-input-bg text-dark-text">All Categories</option>
            {Object.values(TemplateCategory).map(cat => (
              <option key={cat} value={cat} className="bg-input-bg text-dark-text">{cat}</option>
            ))}
          </select>
        </div>
      </div>
      
      {templates.length === 0 ? (
         <EmptyState
          icon={LayoutTemplate}
          title="No Templates Created"
          message="Streamline your communications by creating reusable templates."
          actionButtonText="Add New Template"
          onAction={() => onOpenTemplateForm('add')}
        />
      ) : filteredTemplates.length === 0 ? (
        <EmptyState
            icon={Search}
            title="No Templates Found"
            message="Try adjusting your search or filter criteria."
        />
      ) : (
        <div className="bg-input-bg shadow-card rounded-lg overflow-x-auto border border-border-color">
          <table className="min-w-full divide-y divide-border-color">
            <thead className="bg-sidebar-bg">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-light-text uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-light-text uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-light-text uppercase tracking-wider">Tags</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-light-text uppercase tracking-wider">Last Updated</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-light-text uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-input-bg divide-y divide-border-color">
              {filteredTemplates.map(template => (
                <tr key={template.id} className="hover:bg-sidebar-bg transition-colors duration-150">
                  <td className="px-6 py-4">
                    <div 
                      className="text-sm font-medium text-primary hover:text-primary-dark hover:underline cursor-pointer"
                      onClick={() => onOpenTemplatePreviewModal(template)}
                      title={`Preview: ${template.name}`}
                    >
                      {template.name}
                    </div>
                    <div className="text-xs text-light-text truncate max-w-md" title={template.content}>
                      {template.content.substring(0, 100)}{template.content.length > 100 && '...'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                     <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${getCategoryColorClass(template.category)}`}>
                        {template.category}
                     </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-wrap gap-1">
                      {template.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="px-2 py-0.5 text-xs rounded-full bg-sidebar-bg text-medium-text border border-light-border">
                          {tag}
                        </span>
                      ))}
                      {template.tags.length > 3 && <span className="text-xs text-light-text self-center">+{template.tags.length - 3}</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-medium-text">
                    {formatDate(template.updatedAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-1">
                    <button 
                        onClick={() => onOpenTemplatePreviewModal(template)} 
                        className="text-blue-400 hover:text-blue-500 p-1 rounded-md" 
                        title="Preview Template">
                        <Eye size={18} />
                    </button>
                    <button 
                        onClick={() => onOpenTemplateForm('edit', template)} 
                        className="text-primary hover:text-primary-dark p-1 rounded-md" 
                        title="Edit Template">
                        <Edit2 size={18} />
                    </button>
                    <button 
                        onClick={() => onDeleteTemplate(template.id)} 
                        className="text-danger hover:text-red-600 p-1 rounded-md" 
                        title="Delete Template">
                        <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};