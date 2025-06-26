
import React from 'react';
import { SearchResultItem, Client, TeamMember, Task, Template, PageId } from '../types';
import { User, Briefcase, ListChecks, BookOpen, Search as SearchIconLucide, LayoutTemplate } from 'lucide-react';

interface SearchResultsPageProps {
  results: SearchResultItem[];
  setCurrentPage: (pageId: PageId) => void;
  setSearchTerm: (term: string) => void;
}

const ResultCard: React.FC<{ item: SearchResultItem, onClick?: () => void }> = ({ item, onClick }) => {
  let icon, title, details, itemTypeLabel;
  let itemTypeClasses = ''; // Combined class string for border, bg, text

  switch (item.type) {
    case 'client':
      const client = item.data as Client;
      icon = <Briefcase className="text-primary" size={24} />;
      title = client.name;
      details = `Status: ${client.status}. Notes: ${client.notes.substring(0, 100)}...`;
      itemTypeLabel = 'Client';
      itemTypeClasses = 'border-primary bg-primary-light text-primary';
      break;
    case 'teamMember':
      const member = item.data as TeamMember;
      icon = <User className="text-success" size={24} />;
      title = member.name;
      details = `Role: ${member.role}. Skills: ${(member.skills || []).join(', ') || 'N/A'}`;
      itemTypeLabel = 'Team Member';
      itemTypeClasses = 'border-success bg-success-light text-success';
      break;
    case 'task':
      const task = item.data as Task;
      icon = <ListChecks className="text-warning" size={24} />;
      title = task.title;
      details = `Status: ${task.status}. Due: ${new Date(task.dueDate).toLocaleDateString()}. Assignee: ${task.assignedTo}`;
      itemTypeLabel = 'Task';
      itemTypeClasses = 'border-warning bg-warning-light text-warning';
      break;
    // Removed KnowledgeArticle case
    case 'template':
      const template = item.data as Template;
      icon = <LayoutTemplate className="text-teal-500" size={24} />;
      title = template.name;
      details = `Category: ${template.category}. Tags: ${template.tags.join(', ')}.`;
      itemTypeLabel = 'Template';
      itemTypeClasses = 'border-teal-500 bg-teal-100 text-teal-600';
      break;
    default:
      icon = <SearchIconLucide size={24} />;
      title = 'Unknown Item';
      details = 'No details available.';
      itemTypeLabel = 'Unknown';
      itemTypeClasses = 'border-gray-300 bg-gray-100 text-gray-700';
  }

  const borderClass = itemTypeClasses.split(' ')[0];
  const bgAndTextClasses = itemTypeClasses.substring(borderClass.length).trim();


  return (
    <div
      className={`bg-input-bg p-4 rounded-lg shadow-card border-l-4 ${borderClass} hover:shadow-card-hover transition-shadow cursor-pointer border border-border-color`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick?.(); }}
      aria-label={`View details for ${title}, type ${itemTypeLabel}`}
    >
      <div className="flex items-start space-x-3">
        <div className={`p-2 rounded-full ${bgAndTextClasses.split(' ')[0] || 'bg-gray-100'} flex-shrink-0`}>
           {icon}
        </div>
        <div className="flex-1 min-w-0"> {/* Added min-w-0 for proper truncation */}
          <div className="flex justify-between items-center">
            <h3 className="text-md font-semibold text-dark-text truncate" title={title}>{title}</h3>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${bgAndTextClasses}`}>{itemTypeLabel}</span>
          </div>
          <p className="text-xs text-medium-text mt-1 max-h-16 overflow-hidden text-ellipsis" title={details}>{details}</p>
        </div>
      </div>
    </div>
  );
};

export const SearchResultsPage: React.FC<SearchResultsPageProps> = ({ results, setCurrentPage, setSearchTerm }) => {
  const handleResultClick = (item: SearchResultItem) => {
    setSearchTerm(''); 
    switch (item.type) {
      case 'client':
        setCurrentPage('clients');
        break;
      case 'teamMember':
        setCurrentPage('team');
        break;
      case 'task':
        setCurrentPage('tasks');
        break;
      // Removed KnowledgeArticle case
      case 'template':
        setCurrentPage('templates');
        break;
    }
  };

  if (results.length === 0) {
    return (
      <div className="text-center p-10">
        <SearchIconLucide size={48} className="mx-auto text-light-text mb-4" />
        <h2 className="text-xl font-semibold text-dark-text mb-2">No Results Found</h2>
        <p className="text-medium-text">Try refining your search term.</p>
      </div>
    );
  }

  const groupedResults: { [key in SearchResultItem['type']]?: SearchResultItem[] } = results.reduce((acc, item) => {
    if (!acc[item.type]) {
      acc[item.type] = [];
    }
    acc[item.type]!.push(item);
    return acc;
  }, {} as { [key in SearchResultItem['type']]?: SearchResultItem[] });

  const typeOrder: SearchResultItem['type'][] = ['client', 'task', 'teamMember', 'template'];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-dark-text">Search Results ({results.length})</h1>
      {typeOrder.map(type => {
        const itemsOfType = groupedResults[type];
        if (!itemsOfType || itemsOfType.length === 0) return null;

        let typeLabel = '';
        switch(type) {
            case 'client': typeLabel = 'Clients'; break;
            case 'teamMember': typeLabel = 'Team Members'; break;
            case 'task': typeLabel = 'Tasks'; break;
            case 'template': typeLabel = 'Templates'; break;
            default: typeLabel = 'Other Items';
        }

        return (
            <section key={type} className="mb-8">
                <h2 className="text-xl font-medium text-dark-text mb-3 border-b border-border-color pb-1.5">{typeLabel} ({itemsOfType.length})</h2>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {itemsOfType.map((item, index) => (
                        // Using item.data.id if available, otherwise index for key.
                        <ResultCard key={`${item.type}-${(item.data as any).id || index}`} item={item} onClick={() => handleResultClick(item)} />
                    ))}
                </div>
            </section>
        );
      })}
    </div>
  );
};
