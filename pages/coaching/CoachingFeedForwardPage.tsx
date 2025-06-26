
import React, { useState, useMemo } from 'react';
import { NewCoachingFeedForwardForm } from './NewCoachingFeedForwardForm';
import { TeamMember, CoachingFeedForward, CoachingFeeling, CoachingReason, FormMode } from '../../types';
import { COACHING_FEELINGS_OPTIONS } from '../../constants'; // Import COACHING_FEELINGS_OPTIONS
import { Modal } from '../../components/Modal';
import { EmptyState } from '../../components/EmptyState';
import { PlusCircle, Edit2, Trash2, Filter, ArrowDownUp, ClipboardEdit, UserCircle, MessageSquareHeart, Smile, Meh, Frown, Angry } from 'lucide-react';

interface CoachingFeedForwardPageProps {
  coachingFeedForwards: CoachingFeedForward[];
  teamMembers: TeamMember[];
  currentUser: TeamMember;
  onAddCoachingFeedForward: (cffData: Omit<CoachingFeedForward, 'id'>) => void;
  onUpdateCoachingFeedForward: (cffData: CoachingFeedForward) => void;
  onDeleteCoachingFeedForward: (cffId: string) => void;
}

const getFeelingIconAndColor = (feeling: CoachingFeeling) => {
  switch (feeling) {
    case 'Happy': return { icon: <Smile size={16} className="text-success" />, pillClass: 'bg-success-light text-success border-success/30' };
    case 'Neutral': return { icon: <Meh size={16} className="text-blue-400" />, pillClass: 'bg-blue-500/10 text-blue-400 border-blue-400/30' };
    case 'Tired': return { icon: <Frown size={16} className="text-yellow-500" />, pillClass: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30' };
    case 'Sad': return { icon: <Frown size={16} className="text-warning" />, pillClass: 'bg-warning-light text-warning border-warning/30' };
    case 'Angry': return { icon: <Angry size={16} className="text-danger" />, pillClass: 'bg-danger-light text-danger border-danger/30' };
    default: return { icon: <UserCircle size={16} className="text-light-text" />, pillClass: 'bg-light-border text-medium-text border-medium-text/30' };
  }
};

export const CoachingFeedForwardPage: React.FC<CoachingFeedForwardPageProps> = ({
  coachingFeedForwards,
  teamMembers,
  currentUser,
  onAddCoachingFeedForward,
  onUpdateCoachingFeedForward,
  onDeleteCoachingFeedForward,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCff, setEditingCff] = useState<CoachingFeedForward | null>(null);
  const [formMode, setFormMode] = useState<FormMode>('add');

  const [filterSoulverId, setFilterSoulverId] = useState<string>('all');
  const [filterFeeling, setFilterFeeling] = useState<CoachingFeeling | 'all'>('all');
  const [sortOption, setSortOption] = useState<'date-desc' | 'date-asc' | 'feeling'>('date-desc');

  const openModal = (mode: FormMode, cff?: CoachingFeedForward) => {
    setFormMode(mode);
    setEditingCff(cff || null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCff(null);
  };

  const handleSaveCff = (cffData: CoachingFeedForward | Omit<CoachingFeedForward, 'id'>) => {
    if (formMode === 'add') {
      onAddCoachingFeedForward(cffData as Omit<CoachingFeedForward, 'id'>);
    } else if (editingCff) {
      onUpdateCoachingFeedForward({ ...editingCff, ...cffData } as CoachingFeedForward);
    }
    closeModal();
  };

  const getSoulverNameById = (soulverId: string): string => {
    return teamMembers.find(tm => tm.id === soulverId)?.name || 'Unknown Soulver';
  };

  const filteredAndSortedCffs = useMemo(() => {
    let cffs = [...coachingFeedForwards];

    if (filterSoulverId !== 'all') {
      cffs = cffs.filter(cff => cff.soulverId === filterSoulverId);
    }
    if (filterFeeling !== 'all') {
      cffs = cffs.filter(cff => cff.soulverFeelings === filterFeeling);
    }

    cffs.sort((a, b) => {
      switch (sortOption) {
        case 'date-asc':
          return new Date(a.feedForwardDate).getTime() - new Date(b.feedForwardDate).getTime();
        case 'feeling':
          const feelingOrder: Record<CoachingFeeling, number> = {
            'Angry': 0,
            'Sad': 1,
            'Tired': 2,
            'Neutral': 3,
            'Happy': 4,
          };
          return feelingOrder[a.soulverFeelings] - feelingOrder[b.soulverFeelings];
        case 'date-desc':
        default:
          return new Date(b.feedForwardDate).getTime() - new Date(a.feedForwardDate).getTime();
      }
    });
    return cffs;
  }, [coachingFeedForwards, filterSoulverId, filterFeeling, sortOption]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold text-dark-text flex items-center">
          <ClipboardEdit size={32} className="mr-3 text-primary" /> Coaching Feed Forward
        </h1>
        <button
          onClick={() => openModal('add')}
          className="flex items-center bg-primary hover:bg-primary-dark text-white font-medium py-2.5 px-5 rounded-md text-sm transition-all duration-300 shadow-md hover:shadow-hero-glow-light hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-light-bg focus-visible:ring-primary"
        >
          <PlusCircle size={18} className="mr-2" /> Add New Feed Forward
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
            value={filterFeeling}
            onChange={(e) => setFilterFeeling(e.target.value as CoachingFeeling | 'all')}
            className="form-select flex-grow md:flex-grow-0 rounded-md border-border-color shadow-subtle focus:border-primary focus:ring-1 focus:ring-primary text-xs py-2 bg-input-bg text-dark-text appearance-none"
          >
            <option value="all" className="bg-input-bg text-dark-text">All Feelings</option>
            {COACHING_FEELINGS_OPTIONS.map(level => <option key={level} value={level} className="bg-input-bg text-dark-text">{level}</option>)}
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
            <option value="feeling" className="bg-input-bg text-dark-text">Feeling (Mood)</option>
          </select>
        </div>
      </div>

      {coachingFeedForwards.length === 0 ? (
        <EmptyState
          icon={ClipboardEdit}
          title="No Feed Forward Entries Yet"
          message="Start by creating a new Coaching Feed Forward entry to document coaching sessions."
          actionButtonText="Add New Feed Forward"
          onAction={() => openModal('add')}
        />
      ) : filteredAndSortedCffs.length === 0 ? (
        <EmptyState
          icon={Filter}
          title="No Entries Match Filters"
          message="Try adjusting your filter criteria."
        />
      ) : (
        <div className="bg-input-bg shadow-card rounded-lg overflow-x-auto border border-border-color">
          <table className="min-w-full divide-y divide-border-color">
            <thead className="bg-sidebar-bg">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-light-text uppercase tracking-wider">Soulver</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-light-text uppercase tracking-wider">Feed Forward Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-light-text uppercase tracking-wider">Soulver's Feeling</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-light-text uppercase tracking-wider">Reasons</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-light-text uppercase tracking-wider">Leader Actions (Snippet)</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-light-text uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-input-bg divide-y divide-border-color">
              {filteredAndSortedCffs.map(cff => {
                const { icon: feelingIcon, pillClass: feelingPillClass } = getFeelingIconAndColor(cff.soulverFeelings);
                return (
                  <tr key={cff.id} className="hover:bg-sidebar-bg transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-dark-text font-medium">{getSoulverNameById(cff.soulverId)}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-medium-text">{new Date(cff.feedForwardDate).toLocaleDateString()}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full border flex items-center ${feelingPillClass}`}>
                        {feelingIcon} <span className="ml-1.5">{cff.soulverFeelings}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-medium-text">
                      {cff.reasons.slice(0, 2).join(', ')}
                      {cff.reasons.includes('Other') && cff.otherReasonText ? ` (Other: ${cff.otherReasonText.substring(0,20)}...)` : ''}
                      {cff.reasons.length > 2 && ` +${cff.reasons.length - 2} more`}
                    </td>
                    <td className="px-4 py-3 text-xs text-medium-text truncate max-w-xs" title={cff.leaderActions}>
                      {cff.leaderActions.substring(0, 60)}{cff.leaderActions.length > 60 && '...'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium space-x-1">
                      <button onClick={() => openModal('edit', cff)} className="text-primary hover:text-primary-dark p-1 rounded-md" title="View/Edit Entry">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => onDeleteCoachingFeedForward(cff.id)} className="text-danger hover:text-red-600 p-1 rounded-md" title="Delete Entry">
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
        <Modal isOpen={isModalOpen} onClose={closeModal} title={formMode === 'add' ? 'Add New Coaching Feed Forward' : `Edit Coaching Feed Forward for ${getSoulverNameById(editingCff?.soulverId || '')}`}>
          <NewCoachingFeedForwardForm
            teamMembers={teamMembers}
            currentUser={currentUser}
            onSave={handleSaveCff}
            initialData={editingCff}
            formMode={formMode}
          />
        </Modal>
      )}
    </div>
  );
};
