


import React, { useState, useEffect } from 'react';
import { TeamMember, FormMode, Kpi, HomeOfficeStatus, HomeOfficeDetails } from '../../types';

interface TeamMemberFormProps {
  onSubmit: (data: TeamMember | Omit<TeamMember, 'id'>) => void; 
  initialData?: TeamMember;
  mode: FormMode;
  allKpis: Kpi[];
}

const inputBaseClasses = "mt-1 block w-full px-3 py-2 border border-border-color rounded-md shadow-subtle focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm bg-input-bg text-dark-text placeholder-placeholder-color";
const buttonPrimaryClasses = "inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary";
const labelClasses = "block text-sm font-medium text-medium-text";
const checkboxLabelClasses = "flex items-center space-x-2 p-1.5 hover:bg-border-color rounded cursor-pointer";
const checkboxInputClasses = "form-checkbox h-4 w-4 text-primary border-light-border rounded focus:ring-primary bg-sidebar-bg";


export const TeamMemberForm: React.FC<TeamMemberFormProps> = ({ onSubmit, initialData, mode, allKpis }) => {
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [email, setEmail] = useState('');
  const [avatarInitialsInput, setAvatarInitialsInput] = useState('');
  const [assignedKpis, setAssignedKpis] = useState<string[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [currentSkill, setCurrentSkill] = useState('');
  
  // Audit fields
  const [hireDate, setHireDate] = useState('');
  const [department, setDepartment] = useState('');
  
  const [homeOfficeStatus, setHomeOfficeStatus] = useState<HomeOfficeStatus>(HomeOfficeStatus.ON_SITE_ONLY);
  const [hoApprovalDate, setHoApprovalDate] = useState('');
  const [hoDaysPerWeek, setHoDaysPerWeek] = useState<'' | 1 | 2>('');
  const [hoClientApprovalLink, setHoClientApprovalLink] = useState('');
  const [hoNotes, setHoNotes] = useState('');


  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setRole(initialData.role);
      setEmail(initialData.email || '');
      setAvatarInitialsInput(initialData.avatarInitials || '');
      setAssignedKpis(initialData.assignedKpis || []);
      setSkills(initialData.skills || []);
      setDepartment(initialData.department || '');
      
      setHireDate(initialData.hireDate ? new Date(initialData.hireDate).toISOString().substring(0,10) : '');
      
      setHomeOfficeStatus(initialData.homeOffice?.status || HomeOfficeStatus.ON_SITE_ONLY);
      setHoApprovalDate(initialData.homeOffice?.approvalDate ? new Date(initialData.homeOffice.approvalDate).toISOString().substring(0,10) : '');
      setHoDaysPerWeek(initialData.homeOffice?.daysPerWeek || '');
      setHoClientApprovalLink(initialData.homeOffice?.clientApprovalDocumentLink || '');
      setHoNotes(initialData.homeOffice?.notes || '');

    } else {
      // Reset for new form
      setName('');
      setRole('');
      setEmail('');
      setAvatarInitialsInput('');
      setAssignedKpis([]);
      setSkills([]);
      setDepartment('');
      setHireDate('');
      setHomeOfficeStatus(HomeOfficeStatus.ON_SITE_ONLY);
      setHoApprovalDate('');
      setHoDaysPerWeek('');
      setHoClientApprovalLink('');
      setHoNotes('');
    }
  }, [initialData]);

  const handleKpiToggle = (kpiId: string) => {
    setAssignedKpis(prev =>
      prev.includes(kpiId) ? prev.filter(id => id !== kpiId) : [...prev, kpiId]
    );
  };

  const handleAddSkill = () => {
    if (currentSkill && !skills.includes(currentSkill.trim())) {
      setSkills([...skills, currentSkill.trim()]);
      setCurrentSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    let finalAvatarInitials = avatarInitialsInput.trim();
    if (!finalAvatarInitials && name.trim()) {
        const nameParts = name.trim().split(' ');
        finalAvatarInitials = nameParts.length > 1 
            ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase() 
            : name.trim().substring(0,2).toUpperCase();
    }
     if (finalAvatarInitials.length === 1 && name.trim().length > 1) { 
        finalAvatarInitials = name.trim().substring(0,2).toUpperCase();
    }

    const homeOfficeDetails: HomeOfficeDetails = {
      status: homeOfficeStatus,
      approvalDate: hoApprovalDate ? new Date(hoApprovalDate).toISOString() : undefined,
      daysPerWeek: hoDaysPerWeek === '' ? undefined : hoDaysPerWeek,
      clientApprovalDocumentLink: hoClientApprovalLink || undefined,
      notes: hoNotes || undefined,
    };

    const memberData: Omit<TeamMember, 'id'> = {
      name: name.trim(),
      role: role.trim(),
      email: email.trim(),
      avatarInitials: finalAvatarInitials,
      assignedKpis,
      skills,
      department: department.trim() || undefined,
      hireDate: hireDate ? new Date(hireDate).toISOString() : undefined,
      homeOffice: homeOfficeDetails,
    };
    
    if (mode === 'edit' && initialData) {
      onSubmit({ ...memberData, id: initialData.id } as TeamMember);
    } else {
      onSubmit(memberData);
    }
  };
  
  const showKPIWarning = assignedKpis.length > 0 && assignedKpis.length < 2;


  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        <div>
          <label htmlFor="member-name" className={labelClasses}>Full Name</label>
          <input type="text" id="member-name" value={name} onChange={(e) => setName(e.target.value)} required className={inputBaseClasses} />
        </div>
        <div>
          <label htmlFor="member-role" className={labelClasses}>Role</label>
          <input type="text" id="member-role" value={role} onChange={(e) => setRole(e.target.value)} required className={inputBaseClasses} />
        </div>
         <div>
          <label htmlFor="member-email" className={labelClasses}>Email</label>
          <input type="email" id="member-email" value={email} onChange={(e) => setEmail(e.target.value)} required className={inputBaseClasses} />
        </div>
        <div>
            <label htmlFor="member-department" className={labelClasses}>Department (Optional)</label>
            <input type="text" id="member-department" value={department} onChange={(e) => setDepartment(e.target.value)} className={inputBaseClasses} placeholder="e.g., Recruitment, Operations"/>
        </div>
        <div>
            <label htmlFor="member-initials" className={labelClasses}>Avatar Initials (Optional)</label>
            <input type="text" id="member-initials" value={avatarInitialsInput} onChange={(e) => setAvatarInitialsInput(e.target.value.toUpperCase())} maxLength={2} className={inputBaseClasses} placeholder="e.g., JB (auto-generated)"/>
        </div>
        <div>
            <label htmlFor="member-hire-date" className={labelClasses}>Hire Date</label>
            <input type="date" id="member-hire-date" value={hireDate} onChange={(e) => setHireDate(e.target.value)} className={`${inputBaseClasses} dark:[color-scheme:dark]`} />
        </div>
      </div>

       <div>
        <label htmlFor="member-skills" className={labelClasses}>Skills (Optional)</label>
        <div className="flex items-center mt-1">
          <input
            type="text"
            id="member-skills-input"
            value={currentSkill}
            onChange={(e) => setCurrentSkill(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); handleAddSkill();}}}
            className={`flex-grow rounded-r-none ${inputBaseClasses}`}
            placeholder="Add a skill and press Enter"
          />
          <button
            type="button"
            onClick={handleAddSkill}
            className="px-4 py-2 border border-l-0 border-primary bg-primary text-white rounded-l-none rounded-r-md hover:bg-primary-dark focus:outline-none focus:ring-1 focus:ring-primary h-[calc(2.625rem+2px)] mt-1 text-sm"
          >
            Add
          </button>
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {skills.map(skill => (
            <span key={skill} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-tag-blue-bg text-tag-blue-text border border-tag-blue-text/30">
              {skill}
              <button type="button" onClick={() => handleRemoveSkill(skill)} className="ml-1.5 flex-shrink-0 text-tag-blue-text hover:text-primary-dark focus:outline-none" aria-label={`Remove skill ${skill}`}>
                &times;
              </button>
            </span>
          ))}
        </div>
      </div>

      <div>
        <label className={labelClasses}>Assign KPIs (Optional)</label>
        {showKPIWarning && (
            <p className="text-xs text-warning mt-1 mb-1">Audit Alert: Team members should ideally have more than one KPI.</p>
        )}
        <div className="mt-2 space-y-1 max-h-48 overflow-y-auto border border-border-color rounded-md p-2 bg-input-bg custom-scrollbar">
          {allKpis.length === 0 && <p className="text-xs text-light-text">No KPIs available. Add them in the KPI Library.</p>}
          {allKpis.map(kpi => (
            <label key={kpi.id} className={checkboxLabelClasses}>
              <input type="checkbox" checked={assignedKpis.includes(kpi.id)} onChange={() => handleKpiToggle(kpi.id)} className={checkboxInputClasses} />
              <span className="text-sm text-medium-text">{kpi.name} <span className="text-xs text-light-text">({kpi.category || 'General'})</span></span>
            </label>
          ))}
        </div>
      </div>
      
      {/* Audit Fields Section */}
      <fieldset className="p-4 border border-border-color rounded-md space-y-4 bg-sidebar-bg">
        <legend className="text-md font-semibold text-dark-text px-2">Audit & Compliance Details</legend>
        
        {/* Home Office Details */}
        <div className="p-3 border border-light-border rounded-md bg-input-bg">
          <h4 className="text-sm font-semibold text-medium-text mb-2">Home Office Information</h4>
           <div className="space-y-3">
            <div>
                <label htmlFor="ho-status" className={labelClasses}>Home Office Status</label>
                <select id="ho-status" value={homeOfficeStatus} onChange={(e) => setHomeOfficeStatus(e.target.value as HomeOfficeStatus)} className={`${inputBaseClasses} appearance-none`}>
                    {Object.values(HomeOfficeStatus).map(sVal => <option key={sVal} value={sVal} className="bg-input-bg text-dark-text">{sVal}</option>)}
                </select>
            </div>
            {(homeOfficeStatus === HomeOfficeStatus.APPROVED || homeOfficeStatus === HomeOfficeStatus.PENDING_CLIENT_APPROVAL) && (
              <>
                <div>
                  <label htmlFor="ho-approval-date" className={labelClasses}>Client Approval Date (if applicable)</label>
                  <input type="date" id="ho-approval-date" value={hoApprovalDate} onChange={(e) => setHoApprovalDate(e.target.value)} className={`${inputBaseClasses} dark:[color-scheme:dark]`} />
                </div>
                <div>
                  <label htmlFor="ho-days" className={labelClasses}>Days Per Week (if approved)</label>
                  <select id="ho-days" value={hoDaysPerWeek} onChange={(e) => setHoDaysPerWeek(e.target.value === '' ? '' : parseInt(e.target.value) as 1 | 2)} className={`${inputBaseClasses} appearance-none`}>
                    <option value="" className="bg-input-bg text-dark-text">N/A</option>
                    <option value="1" className="bg-input-bg text-dark-text">1 day</option>
                    <option value="2" className="bg-input-bg text-dark-text">2 days</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="ho-approval-link" className={labelClasses}>Client Approval Document Link</label>
                  <input type="url" id="ho-approval-link" value={hoClientApprovalLink} onChange={(e) => setHoClientApprovalLink(e.target.value)} placeholder="https://yoursharepoint.com/..." className={inputBaseClasses} />
                </div>
              </>
            )}
            <div>
                <label htmlFor="ho-notes" className={labelClasses}>Home Office Notes</label>
                <textarea id="ho-notes" value={hoNotes} onChange={(e) => setHoNotes(e.target.value)} rows={2} className={inputBaseClasses} placeholder="E.g., Client preference, eligibility details..."/>
            </div>
           </div>
        </div>
      </fieldset>

      <div className="flex justify-end pt-2">
        <button type="submit" className={buttonPrimaryClasses}>
          {mode === 'add' ? 'Add Team Member' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
};
