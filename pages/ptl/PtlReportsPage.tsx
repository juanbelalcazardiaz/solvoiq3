
import React, { useState, useMemo } from 'react';
import { NewPtlReportForm } from './NewPtlReportForm';
import { TeamMember, Client, PtlReport, TurnoverRiskLevel, FormMode, PtlMainDriver } from '../../types';
import { Modal } from '../../components/Modal';
import { EmptyState } from '../../components/EmptyState';
import { PlusCircle, Edit2, Trash2, Filter, ArrowDownUp, ClipboardPen, UserCircle, AlertTriangle, CheckCircle, Activity } from 'lucide-react';

interface PtlReportsPageProps {
  ptlReports: PtlReport[];
  teamMembers: TeamMember[];
  clients: Client[];
  currentUser: TeamMember;
  onAddPtlReport: (reportData: Omit<PtlReport, 'id'>) => void;
  onUpdatePtlReport: (reportData: PtlReport) => void;
  onDeletePtlReport: (reportId: string) => void;
}

const getRiskLevelIconAndColor = (riskLevel: TurnoverRiskLevel) => {
  switch (riskLevel) {
    case TurnoverRiskLevel.LOW: return { icon: <CheckCircle size={16} className="text-success" />, pillClass: 'bg-success-light text-success border-success/30' };
    case TurnoverRiskLevel.MEDIUM: return { icon: <Activity size={16} className="text-warning" />, pillClass: 'bg-warning-light text-warning border-warning/30' };
    case TurnoverRiskLevel.HIGH: return { icon: <AlertTriangle size={16} className="text-danger" />, pillClass: 'bg-danger-light text-danger border-danger/30' };
    default: return { icon: <UserCircle size={16} className="text-light-text" />, pillClass: 'bg-light-border text-medium-text border-medium-text/30' };
  }
};

export const PtlReportsPage: React.FC<PtlReportsPageProps> = ({ 
  ptlReports,
  teamMembers, 
  clients, 
  currentUser, 
  onAddPtlReport,
  onUpdatePtlReport,
  onDeletePtlReport,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReport, setEditingReport] = useState<PtlReport | null>(null);
  const [formMode, setFormMode] = useState<FormMode>('add');

  const [filterSoulverId, setFilterSoulverId] = useState<string>('all');
  const [filterRiskLevel, setFilterRiskLevel] = useState<TurnoverRiskLevel | 'all'>('all');
  const [sortOption, setSortOption] = useState<'date-desc' | 'date-asc' | 'risk-desc' | 'risk-asc'>('date-desc');

  const openModal = (mode: FormMode, report?: PtlReport) => {
    setFormMode(mode);
    setEditingReport(report || null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingReport(null);
  };

  const handleSaveReport = (reportData: PtlReport | Omit<PtlReport, 'id'>) => {
    if (formMode === 'add') {
      onAddPtlReport(reportData as Omit<PtlReport, 'id'>);
    } else if (editingReport) {
      onUpdatePtlReport({ ...editingReport, ...reportData } as PtlReport);
    }
    closeModal();
  };

  const getSoulverNameById = (soulverId: string): string => {
    return teamMembers.find(tm => tm.id === soulverId)?.name || 'Unknown Soulver';
  };

  const filteredAndSortedReports = useMemo(() => {
    let reports = [...ptlReports];

    if (filterSoulverId !== 'all') {
      reports = reports.filter(report => report.soulverId === filterSoulverId);
    }
    if (filterRiskLevel !== 'all') {
      reports = reports.filter(report => report.riskLevel === filterRiskLevel);
    }

    reports.sort((a, b) => {
      switch (sortOption) {
        case 'date-asc':
          return new Date(a.reportDate).getTime() - new Date(b.reportDate).getTime();
        case 'risk-desc':
          const riskOrderDesc = { [TurnoverRiskLevel.HIGH]: 0, [TurnoverRiskLevel.MEDIUM]: 1, [TurnoverRiskLevel.LOW]: 2 };
          return riskOrderDesc[a.riskLevel] - riskOrderDesc[b.riskLevel];
        case 'risk-asc':
          const riskOrderAsc = { [TurnoverRiskLevel.LOW]: 0, [TurnoverRiskLevel.MEDIUM]: 1, [TurnoverRiskLevel.HIGH]: 2 };
          return riskOrderAsc[a.riskLevel] - riskOrderAsc[b.riskLevel];
        case 'date-desc':
        default:
          return new Date(b.reportDate).getTime() - new Date(a.reportDate).getTime();
      }
    });
    return reports;
  }, [ptlReports, filterSoulverId, filterRiskLevel, sortOption]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold text-dark-text flex items-center">
          <ClipboardPen size={32} className="mr-3 text-primary" /> PTL Reports
        </h1>
        <button
          onClick={() => openModal('add')}
          className="flex items-center bg-primary hover:bg-primary-dark text-white font-medium py-2.5 px-5 rounded-md text-sm transition-all duration-300 shadow-md hover:shadow-hero-glow-light hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-light-bg focus-visible:ring-primary"
        >
          <PlusCircle size={18} className="mr-2" /> Add New PTL Report
        </button>
      </div>

      <div className="p-4 bg-sidebar-bg rounded-lg shadow-subtle flex flex-col md:flex-row flex-wrap gap-4 border border-border-color items-center">
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter size={18} className="text-light-text" />
          <select
            value={filterSoulverId}
            onChange={(e) => setFilterSoulverId(e.target.value)}
            className="form-select flex-grow md:flex-grow-0 rounded-md border-border-color shadow-subtle focus:border-primary focus:ring-1 focus:ring-primary text-xs py-2 bg-input-bg text-dark-text appearance-none"
          >
            <option value="all" className="bg-input-bg text-dark-text">All Soulvers</option>
            {teamMembers.map(tm => <option key={tm.id} value={tm.id} className="bg-input-bg text-dark-text">{tm.name}</option>)}
          </select>
          <select
            value={filterRiskLevel}
            onChange={(e) => setFilterRiskLevel(e.target.value as TurnoverRiskLevel | 'all')}
            className="form-select flex-grow md:flex-grow-0 rounded-md border-border-color shadow-subtle focus:border-primary focus:ring-1 focus:ring-primary text-xs py-2 bg-input-bg text-dark-text appearance-none"
          >
            <option value="all" className="bg-input-bg text-dark-text">All Risk Levels</option>
            {Object.values(TurnoverRiskLevel).map(level => <option key={level} value={level} className="bg-input-bg text-dark-text">{level}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <ArrowDownUp size={18} className="text-light-text" />
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value as any)}
            className="form-select flex-grow md:flex-grow-0 rounded-md border-border-color shadow-subtle focus:border-primary focus:ring-1 focus:ring-primary text-xs py-2 bg-input-bg text-dark-text appearance-none"
          >
            <option value="date-desc" className="bg-input-bg text-dark-text">Date (Newest First)</option>
            <option value="date-asc" className="bg-input-bg text-dark-text">Date (Oldest First)</option>
            <option value="risk-desc" className="bg-input-bg text-dark-text">Risk (High to Low)</option>
            <option value="risk-asc" className="bg-input-bg text-dark-text">Risk (Low to High)</option>
          </select>
        </div>
      </div>

      {ptlReports.length === 0 ? (
        <EmptyState
          icon={ClipboardPen}
          title="No PTL Reports Yet"
          message="Start by creating a new PTL report to track performance and talent levels."
          actionButtonText="Add New PTL Report"
          onAction={() => openModal('add')}
        />
      ) : filteredAndSortedReports.length === 0 ? (
        <EmptyState
          icon={Filter}
          title="No Reports Match Filters"
          message="Try adjusting your filter criteria."
        />
      ) : (
        <div className="bg-input-bg shadow-card rounded-lg overflow-x-auto border border-border-color">
          <table className="min-w-full divide-y divide-border-color">
            <thead className="bg-sidebar-bg">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-light-text uppercase tracking-wider">Soulver</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-light-text uppercase tracking-wider">Report Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-light-text uppercase tracking-wider">Risk Level</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-light-text uppercase tracking-wider">Main Drivers</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-light-text uppercase tracking-wider">Findings (Snippet)</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-light-text uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-input-bg divide-y divide-border-color">
              {filteredAndSortedReports.map(report => {
                const { icon: riskIcon, pillClass: riskPillClass } = getRiskLevelIconAndColor(report.riskLevel);
                return (
                  <tr key={report.id} className="hover:bg-sidebar-bg transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-dark-text font-medium">{getSoulverNameById(report.soulverId)}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-medium-text">{new Date(report.reportDate).toLocaleDateString()}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full border flex items-center ${riskPillClass}`}>
                        {riskIcon} <span className="ml-1.5">{report.riskLevel}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-medium-text">
                      {report.mainDrivers.slice(0, 2).join(', ')}
                      {report.mainDrivers.length > 2 && ` +${report.mainDrivers.length - 2} more`}
                    </td>
                    <td className="px-4 py-3 text-xs text-medium-text truncate max-w-xs" title={report.findings}>
                      {report.findings.substring(0, 60)}{report.findings.length > 60 && '...'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium space-x-1">
                      <button onClick={() => openModal('edit', report)} className="text-primary hover:text-primary-dark p-1 rounded-md" title="View/Edit Report">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => onDeletePtlReport(report.id)} className="text-danger hover:text-red-600 p-1 rounded-md" title="Delete Report">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
        <Modal isOpen={isModalOpen} onClose={closeModal} title={formMode === 'add' ? 'Add New PTL Report' : `Edit PTL Report for ${getSoulverNameById(editingReport?.soulverId || '')}`}>
          <NewPtlReportForm
            teamMembers={teamMembers}
            clients={clients}
            currentUser={currentUser}
            onSave={handleSaveReport}
            initialData={editingReport}
            formMode={formMode}
          />
        </Modal>
      )}
    </div>
  );
};
