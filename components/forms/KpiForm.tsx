

import React, { useState, useEffect } from 'react';
import { Kpi, FormMode } from '../../types';

interface KpiFormProps {
  onSubmit: (data: Kpi | Omit<Kpi, 'id'>) => void;
  initialData?: Kpi;
  mode: FormMode;
}

export const KpiForm: React.FC<KpiFormProps> = ({ onSubmit, initialData, mode }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [target, setTarget] = useState<number | ''>('');
  const [actual, setActual] = useState<number | ''>('');
  const [category, setCategory] = useState('');
  const [clientNeedAlignment, setClientNeedAlignment] = useState('');
  const [roiDemonstration, setRoiDemonstration] = useState('');
  const [lowerIsBetter, setLowerIsBetter] = useState(false);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setDescription(initialData.description);
      setTarget(initialData.target);
      setActual(initialData.actual);
      setCategory(initialData.category || '');
      setClientNeedAlignment(initialData.clientNeedAlignment || '');
      setRoiDemonstration(initialData.roiDemonstration || '');
      setLowerIsBetter(initialData.lowerIsBetter || false);
    } else {
      setName('');
      setDescription('');
      setTarget('');
      setActual('');
      setCategory('');
      setClientNeedAlignment('');
      setRoiDemonstration('');
      setLowerIsBetter(false);
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (target === '' || actual === '') return; // Basic validation

    const submittedKpiData = {
      name,
      description,
      target: Number(target),
      actual: Number(actual),
      category,
      clientNeedAlignment,
      roiDemonstration,
      lowerIsBetter,
    };

    if (mode === 'edit' && initialData) {
      onSubmit({ 
        ...initialData, 
        ...submittedKpiData,
        historicalData: initialData.historicalData // Preserve existing historical data during edit
      });
    } else {
      const newKpiData: Omit<Kpi, 'id'> = {
        ...submittedKpiData,
        historicalData: [] // Initialize historicalData as empty for new KPIs
      };
      onSubmit(newKpiData);
    }
  };

  const inputClasses = "mt-1 block w-full px-3 py-2 border border-border-color rounded-md shadow-subtle focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm bg-input-bg text-dark-text placeholder-placeholder-color";
  const buttonClasses = "inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary";
  const labelClasses = "block text-sm font-medium text-medium-text";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="kpi-name" className={labelClasses}>KPI Name</label>
        <input
          type="text"
          id="kpi-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className={inputClasses}
        />
      </div>
      <div>
        <label htmlFor="kpi-description" className={labelClasses}>Description</label>
        <textarea
          id="kpi-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className={inputClasses}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
            <label htmlFor="kpi-target" className={labelClasses}>Target Value</label>
            <input
            type="number"
            id="kpi-target"
            value={target}
            onChange={(e) => setTarget(e.target.value === '' ? '' : parseFloat(e.target.value))}
            required
            className={inputClasses}
            step="any"
            />
        </div>
        <div>
            <label htmlFor="kpi-actual" className={labelClasses}>Actual Value</label>
            <input
            type="number"
            id="kpi-actual"
            value={actual}
            onChange={(e) => setActual(e.target.value === '' ? '' : parseFloat(e.target.value))}
            required
            className={inputClasses}
            step="any"
            />
        </div>
      </div>
      <div className="flex items-center space-x-2 p-1.5 hover:bg-border-color rounded cursor-pointer">
        <input
            type="checkbox"
            id="kpi-lower-is-better"
            checked={lowerIsBetter}
            onChange={(e) => setLowerIsBetter(e.target.checked)}
            className="form-checkbox h-4 w-4 text-primary border-light-border rounded focus:ring-primary bg-sidebar-bg"
        />
        <label htmlFor="kpi-lower-is-better" className="text-sm text-medium-text cursor-pointer">
            Lower values are better for this KPI (e.g., for tracking attrition, cancellations).
        </label>
      </div>
      <div>
        <label htmlFor="kpi-category" className={labelClasses}>Category (Optional)</label>
        <input
          type="text"
          id="kpi-category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className={inputClasses}
        />
      </div>
      <div>
        <label htmlFor="kpi-client-need" className={labelClasses}>Client Need Alignment (Optional)</label>
        <textarea
          id="kpi-client-need"
          value={clientNeedAlignment}
          onChange={(e) => setClientNeedAlignment(e.target.value)}
          rows={2}
          className={inputClasses}
          placeholder="How this KPI reflects client needs..."
        />
      </div>
      <div>
        <label htmlFor="kpi-roi" className={labelClasses}>ROI Demonstration (Optional)</label>
        <textarea
          id="kpi-roi"
          value={roiDemonstration}
          onChange={(e) => setRoiDemonstration(e.target.value)}
          rows={2}
          className={inputClasses}
          placeholder="How this KPI demonstrates Return on Investment..."
        />
      </div>
      <div className="flex justify-end pt-2">
        <button
          type="submit"
          className={buttonClasses}
        >
          {mode === 'add' ? 'Add KPI' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
};