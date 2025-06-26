
import React, { useState, useEffect } from 'react';
import { Kpi, KpiHistoricalDataEntry, TeamMember } from '../../types'; // Added TeamMember
import { Modal } from '../Modal';

interface LogKpiDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  kpi: Kpi;
  onSubmit: (kpiId: string, data: Omit<KpiHistoricalDataEntry, 'id' | 'loggedBy'>) => void;
  currentUser: TeamMember; // Added currentUser prop
}

const inputBaseClasses = "mt-1 block w-full px-3 py-2 border border-border-color rounded-md shadow-subtle focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm bg-input-bg text-dark-text placeholder-placeholder-color";
const buttonPrimaryClasses = "inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary";
const labelClasses = "block text-sm font-medium text-medium-text";

export const LogKpiDataModal: React.FC<LogKpiDataModalProps> = ({ isOpen, onClose, kpi, onSubmit, currentUser }) => {
  const [date, setDate] = useState('');
  const [actual, setActual] = useState<number | ''>('');
  const [target, setTarget] = useState<number | ''>(kpi.target); // Pre-fill with main KPI target
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (isOpen) {
      setDate(new Date().toISOString().split('T')[0]); // Default to today
      setActual('');
      setTarget(kpi.target); // Reset target to current KPI target when modal opens
      setNotes('');
    }
  }, [isOpen, kpi.target]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (actual === '' || !date) {
      alert("Please fill in Date and Actual Value.");
      return;
    }
    // The loggedBy field will be set in App.tsx using activeUser
    onSubmit(kpi.id, {
      date: new Date(date).toISOString(),
      actual: Number(actual),
      target: target === '' ? undefined : Number(target),
      notes: notes || undefined,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Log Data for KPI: ${kpi.name}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="kpi-log-date" className={labelClasses}>Date</label>
          <input
            type="date"
            id="kpi-log-date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className={`${inputBaseClasses} dark:[color-scheme:dark]`}
          />
        </div>
        <div>
          <label htmlFor="kpi-log-actual" className={labelClasses}>Actual Value</label>
          <input
            type="number"
            id="kpi-log-actual"
            value={actual}
            onChange={(e) => setActual(e.target.value === '' ? '' : parseFloat(e.target.value))}
            required
            className={inputBaseClasses}
            step="any"
          />
        </div>
        <div>
          <label htmlFor="kpi-log-target" className={labelClasses}>Target Value (Optional for this period)</label>
          <input
            type="number"
            id="kpi-log-target"
            value={target}
            onChange={(e) => setTarget(e.target.value === '' ? '' : parseFloat(e.target.value))}
            className={inputBaseClasses}
            step="any"
            placeholder={`Defaults to main target: ${kpi.target}`}
          />
        </div>
        <div>
          <label htmlFor="kpi-log-notes" className={labelClasses}>Notes (Optional)</label>
          <textarea
            id="kpi-log-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className={inputBaseClasses}
            placeholder="Any relevant notes for this data point..."
          />
        </div>
        <div className="flex justify-end pt-2">
          <button type="submit" className={buttonPrimaryClasses}>
            Log KPI Data
          </button>
        </div>
      </form>
    </Modal>
  );
};
