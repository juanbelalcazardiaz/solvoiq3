
import React, { useState, useMemo } from 'react';
import { Kpi } from '../types';
import { TrendingUp, Search, ArrowDownUp, Tag, Info } from 'lucide-react';
import { EmptyState } from '../components/EmptyState';

interface KpiGoalsPageProps {
  kpis: Kpi[];
}

type SortOption = 'name-asc' | 'name-desc' | 'target-asc' | 'target-desc' | 'category-asc' | 'category-desc';

export const KpiGoalsPage: React.FC<KpiGoalsPageProps> = ({ kpis }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('name-asc');

  const filteredAndSortedKpis = useMemo(() => {
    let currentKpis = kpis.filter(kpi => 
      kpi.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (kpi.category || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      kpi.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return currentKpis.sort((a, b) => {
      switch (sortOption) {
        case 'name-desc': return b.name.localeCompare(a.name);
        case 'target-asc': return a.target - b.target;
        case 'target-desc': return b.target - a.target;
        case 'category-asc': return (a.category || '').localeCompare(b.category || '');
        case 'category-desc': return (b.category || '').localeCompare(a.category || '');
        case 'name-asc':
        default: return a.name.localeCompare(b.name);
      }
    });
  }, [kpis, searchTerm, sortOption]);

  const SortableHeader: React.FC<{ column: SortOption, label: string }> = ({ column, label }) => {
    const isCurrentSort = sortOption === column || sortOption === `${column.split('-')[0]}-desc` || sortOption === `${column.split('-')[0]}-asc`;
    const isAsc = sortOption === `${column.split('-')[0]}-asc`;
    const isDesc = sortOption === `${column.split('-')[0]}-desc`;
    
    let newSortOption: SortOption;
    if (isCurrentSort) {
      if (isAsc) newSortOption = `${column.split('-')[0]}-desc` as SortOption;
      else newSortOption = `${column.split('-')[0]}-asc` as SortOption;
    } else {
      newSortOption = `${column.split('-')[0]}-asc` as SortOption;
    }


    return (
      <th 
        scope="col" 
        className="px-4 py-3 text-left text-xs font-medium text-light-text uppercase tracking-wider cursor-pointer hover:bg-border-color transition-colors"
        onClick={() => setSortOption(newSortOption)}
        aria-sort={isCurrentSort ? (isAsc ? 'ascending' : 'descending') : 'none'}
      >
        <div className="flex items-center">
          {label}
          {isCurrentSort && <ArrowDownUp size={14} className={`ml-1.5 ${isDesc ? 'transform rotate-180' : ''}`} />}
        </div>
      </th>
    );
  };


  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold text-dark-text flex items-center">
          <TrendingUp size={32} className="mr-3 text-primary" /> KPI Goals Overview
        </h1>
      </div>

      <div className="p-4 bg-sidebar-bg rounded-lg shadow-subtle flex flex-col md:flex-row flex-wrap gap-4 border border-border-color items-center">
        <div className="relative flex-grow w-full md:w-auto">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-placeholder-color" />
          </div>
          <input
            type="search"
            placeholder="Search KPIs by name, category, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-border-color rounded-md leading-5 bg-input-bg text-dark-text placeholder-placeholder-color focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm shadow-subtle"
          />
        </div>
        {/* Additional filters can be added here if needed in the future, like category filter */}
      </div>
      
      {kpis.length === 0 ? (
         <EmptyState
          icon={TrendingUp}
          title="No KPIs Available"
          message="KPIs and their goals will be displayed here once they are added in the KPI Library."
        />
      ) : filteredAndSortedKpis.length === 0 ? (
        <EmptyState
            icon={Search}
            title="No KPIs Match Your Search"
            message="Try adjusting your search term."
        />
      ) : (
        <div className="bg-input-bg shadow-card rounded-lg overflow-x-auto border border-border-color">
          <table className="min-w-full divide-y divide-border-color">
            <thead className="bg-sidebar-bg">
              <tr>
                <SortableHeader column="name-asc" label="KPI Name" />
                <SortableHeader column="category-asc" label="Category" />
                <SortableHeader column="target-asc" label="Current Goal" />
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-light-text uppercase tracking-wider">Description</th>
              </tr>
            </thead>
            <tbody className="bg-input-bg divide-y divide-border-color">
              {filteredAndSortedKpis.map(kpi => (
                <tr key={kpi.id} className="hover:bg-sidebar-bg transition-colors duration-150">
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-dark-text">{kpi.name}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className="px-2 py-0.5 text-xs rounded-full bg-sidebar-bg text-medium-text border border-light-border">
                      {kpi.category || 'General'}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-dark-text font-semibold">{kpi.target}</td>
                  <td className="px-4 py-4">
                    <div className="text-sm text-medium-text truncate max-w-md" title={kpi.description}>
                      {kpi.description.substring(0,100)}{kpi.description.length > 100 ? '...' : ''}
                    </div>
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
