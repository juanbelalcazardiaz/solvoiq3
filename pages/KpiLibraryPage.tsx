

import React from 'react';
import { Kpi, FormMode } from '../types';
import { PlusCircle, Edit2, Trash2, TrendingUp, TrendingDown, Minus, BarChartHorizontal, Info, CalendarPlus } from 'lucide-react';
import { EmptyState } from '../components/EmptyState';


interface KpiLibraryPageProps {
  kpis: Kpi[];
  onOpenKpiForm: (mode: FormMode, kpi?: Kpi) => void;
  onDeleteKpi: (id: string) => void;
  onOpenLogKpiDataModal: (kpi: Kpi) => void;
}

const getProgressColor = (kpi: Kpi) => {
    const { actual, target, lowerIsBetter } = kpi;

    if (target === 0 && actual === 0) return 'bg-success'; 
    if (target === 0 && actual > 0 && !lowerIsBetter) return 'bg-danger'; 
    
    if (lowerIsBetter) {
        if (actual <= target) return 'bg-success'; 
        if (actual <= target * 1.2) return 'bg-warning'; 
        return 'bg-danger'; 
    }
    
    const percentage = target > 0 ? (actual / target) * 100 : 0;
    if (percentage >= 100) return 'bg-success';
    if (percentage >= 70) return 'bg-warning';
    return 'bg-danger';
};

const getTrendIcon = (kpi: Kpi) => {
    const { actual, target, lowerIsBetter } = kpi;

    if (target === 0 && actual === 0) return <Minus size={18} className="text-medium-text" />;
    
    if (lowerIsBetter) {
        if (actual <= target) return <TrendingDown size={18} className="text-success" />; 
        if (actual > target) return <TrendingUp size={18} className="text-danger" />; 
        return <Minus size={18} className="text-warning" />;
    }
    
    if (target === 0 && actual > 0) return <TrendingUp size={18} className="text-danger" />; 
    const percentage = target > 0 ? (actual / target) * 100 : 0;
    if (percentage >= 100) return <TrendingUp size={18} className="text-success" />;
    if (percentage < 70) return <TrendingDown size={18} className="text-danger" />;
    return <Minus size={18} className="text-warning" />;
};

export const KpiLibraryPage: React.FC<KpiLibraryPageProps> = ({ kpis, onOpenKpiForm, onDeleteKpi, onOpenLogKpiDataModal }) => {
  return (
    <div>
      <div className="mb-8 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-dark-text">KPI Library</h1>
        <button
          onClick={() => onOpenKpiForm('add')}
          className="flex items-center bg-primary hover:bg-primary-dark text-white font-medium py-2.5 px-5 rounded-md text-sm transition-all duration-300 shadow-md hover:shadow-hero-glow-light hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-light-bg focus-visible:ring-primary"
        >
          <PlusCircle size={18} className="mr-2" /> Add KPI
        </button>
      </div>

      {kpis.length === 0 && (
        <EmptyState
          icon={BarChartHorizontal}
          title="No KPIs Defined"
          message='Your Key Performance Indicators will appear here once you add them.'
          actionButtonText="Add New KPI"
          onAction={() => onOpenKpiForm('add')}
        />
      )}
      
      {kpis.length > 0 && (
        <div className="bg-input-bg shadow-card rounded-lg overflow-x-auto border border-border-color">
          <table className="min-w-full divide-y divide-border-color">
            <thead className="bg-sidebar-bg">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-light-text uppercase tracking-wider">KPI Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-light-text uppercase tracking-wider">Category</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-light-text uppercase tracking-wider">Description</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-light-text uppercase tracking-wider">Target</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-light-text uppercase tracking-wider">Actual</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-light-text uppercase tracking-wider">Progress</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-light-text uppercase tracking-wider text-center">Trend</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-light-text uppercase tracking-wider">Client Need</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-light-text uppercase tracking-wider">ROI Demo</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-light-text uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-input-bg divide-y divide-border-color">
              {kpis.map(kpi => (
                <tr key={kpi.id} className="hover:bg-sidebar-bg transition-colors duration-150">
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-dark-text">{kpi.name}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-medium-text">{kpi.category || 'N/A'}</td>
                  <td className="px-4 py-4">
                    <div className="text-sm text-medium-text truncate max-w-[200px]" title={kpi.description}>{kpi.description}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-medium-text">{kpi.target}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-medium-text">{kpi.actual}</td>
                  <td className="px-4 py-4 whitespace-nowrap">
                      <div className="w-full bg-border-color rounded-full h-2.5">
                          <div 
                              className={`h-2.5 rounded-full ${getProgressColor(kpi)}`} 
                              style={{ width: `${kpi.target > 0 ? Math.min((kpi.actual / kpi.target) * 100, 100) : (kpi.actual > 0 ? (kpi.target === 0 ? 0 : 100) : (kpi.target === 0 ? 100 : 0) )}%` }}
                          ></div>
                      </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-center">
                    {getTrendIcon(kpi)}
                  </td>
                  <td className="px-4 py-4 text-sm text-medium-text truncate max-w-[150px]">
                    {kpi.clientNeedAlignment ? <span title={kpi.clientNeedAlignment}>{kpi.clientNeedAlignment}</span> : 'N/A'}
                  </td>
                  <td className="px-4 py-4 text-sm text-medium-text truncate max-w-[150px]">
                    {kpi.roiDemonstration ? <span title={kpi.roiDemonstration}>{kpi.roiDemonstration}</span> : 'N/A'}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium space-x-1">
                    <button 
                        onClick={() => onOpenLogKpiDataModal(kpi)} 
                        className="text-green-500 hover:text-green-600 p-1 rounded-md" 
                        title="Log KPI Data"
                        aria-label={`Log data for KPI ${kpi.name}`}
                    >
                        <CalendarPlus size={16} />
                    </button>
                    <button onClick={() => onOpenKpiForm('edit', kpi)} className="text-primary hover:text-primary-dark p-1 rounded-md" title="Edit KPI">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => onDeleteKpi(kpi.id)} className="text-danger hover:text-red-600 p-1 rounded-md" title="Delete KPI">
                      <Trash2 size={16} />
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