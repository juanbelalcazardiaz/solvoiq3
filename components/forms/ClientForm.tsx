

import React, { useState, useEffect } from 'react';
import { Client, ClientStatus, TeamMember, FormMode, SOPDetails, KpiReportingDetails, ClientDocumentationChecklist, FolderOrganizationStatus } from '../../types';

interface ClientFormProps {
  onSubmit: (data: Client | Omit<Client, 'id'>) => void;
  initialData?: Client;
  mode: FormMode;
  teamMembers: TeamMember[];
}

const inputBaseClasses = "mt-1 block w-full px-3 py-2 border border-border-color rounded-md shadow-subtle focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm bg-input-bg text-dark-text placeholder-placeholder-color";
const buttonPrimaryClasses = "inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary";
const labelClasses = "block text-sm font-medium text-medium-text";
const checkboxLabelClasses = "flex items-center space-x-2 p-1.5 hover:bg-border-color rounded cursor-pointer";
const checkboxInputClasses = "form-checkbox h-4 w-4 text-primary border-light-border rounded focus:ring-primary bg-sidebar-bg";

export const ClientForm: React.FC<ClientFormProps> = ({ onSubmit, initialData, mode, teamMembers }) => {
  const [name, setName] = useState('');
  const [status, setStatus] = useState<ClientStatus>(ClientStatus.HEALTHY);
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [assignedTeamMembers, setAssignedTeamMembers] = useState<string[]>([]);

  // Audit fields
  const [sopExists, setSopExists] = useState(false);
  const [sopLastUpdatedDate, setSopLastUpdatedDate] = useState('');
  const [sopDocumentLink, setSopDocumentLink] = useState('');
  const [sopFormat, setSopFormat] = useState<SOPDetails['format']>('Not Set');

  const [kpiReportingFrequency, setKpiReportingFrequency] = useState<KpiReportingDetails['frequency']>('Not Set');
  const [lastKpiReportSentDate, setLastKpiReportSentDate] = useState('');
  const [kpiReportLocationLink, setKpiReportLocationLink] = useState('');
  const [kpiClientPreferenceNotes, setKpiClientPreferenceNotes] = useState('');

  const [sharepointFolderLink, setSharepointFolderLink] = useState('');
  const [documentationChecklist, setDocumentationChecklist] = useState<ClientDocumentationChecklist>({ accountInfo: false, kpiReports: false, hoApproval: false, sops: false });
  const [folderOrganizationStatus, setFolderOrganizationStatus] = useState<FolderOrganizationStatus>('Not Set');


  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setStatus(initialData.status);
      setTags(initialData.tags || []);
      setEmail(initialData.contactInfo.email);
      setPhone(initialData.contactInfo.phone);
      setAddress(initialData.contactInfo.address);
      setNotes(initialData.notes);
      setAssignedTeamMembers(initialData.assignedTeamMembers || []);
      
      setSopExists(initialData.sop?.exists || false);
      setSopLastUpdatedDate(initialData.sop?.lastUpdatedDate ? new Date(initialData.sop.lastUpdatedDate).toISOString().substring(0,10) : '');
      setSopDocumentLink(initialData.sop?.documentLink || '');
      setSopFormat(initialData.sop?.format || 'Not Set');

      setKpiReportingFrequency(initialData.kpiReporting?.frequency || 'Not Set');
      setLastKpiReportSentDate(initialData.kpiReporting?.lastReportSentDate ? new Date(initialData.kpiReporting.lastReportSentDate).toISOString().substring(0,10) : '');
      setKpiReportLocationLink(initialData.kpiReporting?.reportLocationLink || '');
      setKpiClientPreferenceNotes(initialData.kpiReporting?.clientPreferenceNotes || '');
      
      setSharepointFolderLink(initialData.sharepointFolderLink || '');
      setDocumentationChecklist(initialData.documentationChecklist || { accountInfo: false, kpiReports: false, hoApproval: false, sops: false });
      setFolderOrganizationStatus(initialData.folderOrganizationStatus || 'Not Set');

    } else {
      // Reset for new form
      setName('');
      setStatus(ClientStatus.HEALTHY);
      setTags([]);
      setCurrentTag('');
      setEmail('');
      setPhone('');
      setAddress('');
      setNotes('');
      setAssignedTeamMembers([]);
      setSopExists(false);
      setSopLastUpdatedDate('');
      setSopDocumentLink('');
      setSopFormat('Not Set');
      setKpiReportingFrequency('Not Set');
      setLastKpiReportSentDate('');
      setKpiReportLocationLink('');
      setKpiClientPreferenceNotes('');
      setSharepointFolderLink('');
      setDocumentationChecklist({ accountInfo: false, kpiReports: false, hoApproval: false, sops: false });
      setFolderOrganizationStatus('Not Set');
    }
  }, [initialData]);

  const handleAddTag = () => {
    if (currentTag && !tags.includes(currentTag.trim())) {
      setTags([...tags, currentTag.trim()]);
      setCurrentTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleTeamMemberToggle = (memberId: string) => {
    setAssignedTeamMembers(prev => 
      prev.includes(memberId) ? prev.filter(id => id !== memberId) : [...prev, memberId]
    );
  };

  const handleDocumentationChecklistChange = (field: keyof ClientDocumentationChecklist) => {
    setDocumentationChecklist(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const sopDetails: SOPDetails | undefined = sopExists ? {
      exists: true,
      lastUpdatedDate: sopLastUpdatedDate ? new Date(sopLastUpdatedDate).toISOString() : undefined,
      documentLink: sopDocumentLink || undefined,
      format: sopFormat === 'Not Set' ? undefined : sopFormat,
    } : { exists: false, format: 'Not Set' };

    const kpiReportingDetails: KpiReportingDetails = {
      frequency: kpiReportingFrequency,
      lastReportSentDate: lastKpiReportSentDate ? new Date(lastKpiReportSentDate).toISOString() : undefined,
      reportLocationLink: kpiReportLocationLink || undefined,
      clientPreferenceNotes: kpiClientPreferenceNotes || undefined,
    };
    
    const clientData = {
      name,
      status,
      tags,
      contactInfo: { email, phone, address },
      notes,
      assignedTeamMembers,
      pulseLog: initialData?.pulseLog || [],
      sop: sopDetails,
      kpiReporting: kpiReportingDetails,
      sharepointFolderLink: sharepointFolderLink || undefined,
      documentationChecklist,
      folderOrganizationStatus: folderOrganizationStatus === 'Not Set' ? undefined : folderOrganizationStatus,
    };

    if (mode === 'edit' && initialData) {
      onSubmit({ ...initialData, ...clientData });
    } else {
      onSubmit(clientData as Omit<Client, 'id'>);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        <div>
          <label htmlFor="client-name" className={labelClasses}>Client Name</label>
          <input type="text" id="client-name" value={name} onChange={(e) => setName(e.target.value)} required className={inputBaseClasses} />
        </div>

        <div>
          <label htmlFor="client-status" className={labelClasses}>Status</label>
          <select id="client-status" value={status} onChange={(e) => setStatus(e.target.value as ClientStatus)} className={`${inputBaseClasses} appearance-none`}>
            {Object.values(ClientStatus).map(s => <option key={s} value={s} className="bg-input-bg text-dark-text">{s}</option>)}
          </select>
        </div>
      </div>
      
      <fieldset>
        <legend className={`${labelClasses} mb-1`}>Contact Information</legend>
        <div className="space-y-3">
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className={`block w-full ${inputBaseClasses}`} />
            <input type="tel" placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} className={`block w-full ${inputBaseClasses}`} />
            <input type="text" placeholder="Address" value={address} onChange={(e) => setAddress(e.target.value)} className={`block w-full ${inputBaseClasses}`} />
        </div>
      </fieldset>

      <div>
        <label htmlFor="client-notes" className={labelClasses}>General Notes</label>
        <textarea id="client-notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className={inputBaseClasses} />
      </div>

      <div>
        <label htmlFor="client-tags" className={labelClasses}>Tags</label>
        <div className="flex items-center mt-1">
          <input type="text" value={currentTag} onChange={(e) => setCurrentTag(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); handleAddTag();}}} placeholder="Add a tag..." className={`flex-grow rounded-r-none ${inputBaseClasses}`} />
          <button type="button" onClick={handleAddTag} className="px-4 py-2 border border-l-0 border-primary bg-primary text-white rounded-l-none rounded-r-md hover:bg-primary-dark focus:outline-none focus:ring-1 focus:ring-primary h-[calc(2.625rem+2px)] mt-1 text-sm">Add</button>
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {tags.map(tag => (
            <span key={tag} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-light text-primary border border-primary/30">
              {tag} <button type="button" onClick={() => handleRemoveTag(tag)} className="ml-1.5 text-primary hover:text-primary-dark">&times;</button>
            </span>
          ))}
        </div>
      </div>

      <div>
        <label className={labelClasses}>Assign Team Members</label>
        <div className="mt-2 space-y-1 max-h-40 overflow-y-auto border border-border-color rounded-md p-2 bg-input-bg custom-scrollbar">
          {teamMembers.map(member => (
            <label key={member.id} className={checkboxLabelClasses}>
              <input type="checkbox" checked={assignedTeamMembers.includes(member.id)} onChange={() => handleTeamMemberToggle(member.id)} className={checkboxInputClasses} />
              <span className="text-sm text-medium-text">{member.name} ({member.role})</span>
            </label>
          ))}
        </div>
      </div>
      
      {/* Audit Fields Section */}
      <fieldset className="p-4 border border-border-color rounded-md space-y-4 bg-sidebar-bg">
        <legend className="text-md font-semibold text-dark-text px-2">Audit & Compliance Details</legend>
        
        {/* SOP Details */}
        <div className="p-3 border border-light-border rounded-md bg-input-bg">
          <h4 className="text-sm font-semibold text-medium-text mb-2">SOP Information</h4>
          <div className="space-y-3">
            <label className={checkboxLabelClasses}>
              <input type="checkbox" checked={sopExists} onChange={(e) => setSopExists(e.target.checked)} className={checkboxInputClasses} />
              <span className="text-sm text-medium-text">SOP Exists for this Client</span>
            </label>
            {sopExists && (
              <>
                <div>
                  <label htmlFor="sop-format" className={labelClasses}>SOP Format</label>
                  <select id="sop-format" value={sopFormat} onChange={(e) => setSopFormat(e.target.value as SOPDetails['format'])} className={`${inputBaseClasses} appearance-none`}>
                    <option value="Not Set" className="bg-input-bg text-dark-text">Not Set</option>
                    <option value="Document" className="bg-input-bg text-dark-text">Document</option>
                    <option value="Video" className="bg-input-bg text-dark-text">Video</option>
                    <option value="Template" className="bg-input-bg text-dark-text">Template</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="sop-last-updated" className={labelClasses}>SOP Last Updated Date</label>
                  <input type="date" id="sop-last-updated" value={sopLastUpdatedDate} onChange={(e) => setSopLastUpdatedDate(e.target.value)} className={`${inputBaseClasses} dark:[color-scheme:dark]`} />
                </div>
                <div>
                  <label htmlFor="sop-link" className={labelClasses}>SOP Document Link (SharePoint)</label>
                  <input type="url" id="sop-link" value={sopDocumentLink} onChange={(e) => setSopDocumentLink(e.target.value)} placeholder="https://yoursharepoint.com/..." className={inputBaseClasses} />
                </div>
              </>
            )}
          </div>
        </div>

        {/* KPI Reporting */}
        <div className="p-3 border border-light-border rounded-md bg-input-bg">
          <h4 className="text-sm font-semibold text-medium-text mb-2">KPI Reporting</h4>
           <div className="space-y-3">
            <div>
                <label htmlFor="kpi-reporting-frequency" className={labelClasses}>KPI Reporting Frequency</label>
                <select id="kpi-reporting-frequency" value={kpiReportingFrequency} onChange={(e) => setKpiReportingFrequency(e.target.value as KpiReportingDetails['frequency'])} className={`${inputBaseClasses} appearance-none`}>
                    <option value="Not Set" className="bg-input-bg text-dark-text">Not Set</option>
                    <option value="Weekly" className="bg-input-bg text-dark-text">Weekly</option>
                    <option value="Monthly" className="bg-input-bg text-dark-text">Monthly</option>
                    <option value="Client Declined Weekly" className="bg-input-bg text-dark-text">Monthly (Client Declined Weekly)</option>
                    <option value="As Requested" className="bg-input-bg text-dark-text">As Requested by Client</option>
                </select>
            </div>
            <div>
              <label htmlFor="last-kpi-report-sent" className={labelClasses}>Last KPI Report Sent Date</label>
              <input type="date" id="last-kpi-report-sent" value={lastKpiReportSentDate} onChange={(e) => setLastKpiReportSentDate(e.target.value)} className={`${inputBaseClasses} dark:[color-scheme:dark]`} />
            </div>
            <div>
              <label htmlFor="kpi-report-location" className={labelClasses}>KPI Report Location Link (SharePoint)</label>
              <input type="url" id="kpi-report-location" value={kpiReportLocationLink} onChange={(e) => setKpiReportLocationLink(e.target.value)} placeholder="https://yoursharepoint.com/reports/..." className={inputBaseClasses} />
            </div>
             <div>
              <label htmlFor="kpi-client-preference" className={labelClasses}>Client Reporting Preferences</label>
              <textarea id="kpi-client-preference" value={kpiClientPreferenceNotes} onChange={(e) => setKpiClientPreferenceNotes(e.target.value)} rows={2} className={inputBaseClasses} placeholder="E.g., Prefers PDF, specific metrics to highlight..."/>
            </div>
           </div>
        </div>
        
        {/* SharePoint Details */}
        <div className="p-3 border border-light-border rounded-md bg-input-bg">
            <h4 className="text-sm font-semibold text-medium-text mb-2">SharePoint & Documentation</h4>
            <div className="space-y-3">
                <div>
                    <label htmlFor="sp-folder-link" className={labelClasses}>Main SharePoint Folder Link</label>
                    <input type="url" id="sp-folder-link" value={sharepointFolderLink} onChange={(e) => setSharepointFolderLink(e.target.value)} placeholder="https://yoursharepoint.com/client-folder/" className={inputBaseClasses} />
                </div>
                <div>
                    <label className={labelClasses}>Required Documentation Checklist:</label>
                    <div className="grid grid-cols-2 gap-2 mt-1">
                        {(Object.keys(documentationChecklist) as Array<keyof ClientDocumentationChecklist>).map(key => (
                             <label key={key} className={checkboxLabelClasses}>
                                <input type="checkbox" checked={documentationChecklist[key]} onChange={() => handleDocumentationChecklistChange(key)} className={checkboxInputClasses} />
                                <span className="text-xs text-medium-text">
                                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                </span>
                            </label>
                        ))}
                    </div>
                </div>
                 <div>
                    <label htmlFor="folder-org-status" className={labelClasses}>Folder Organization Status</label>
                    <select id="folder-org-status" value={folderOrganizationStatus} onChange={(e) => setFolderOrganizationStatus(e.target.value as FolderOrganizationStatus)} className={`${inputBaseClasses} appearance-none`}>
                        <option value="Not Set" className="bg-input-bg text-dark-text">Not Set</option>
                        <option value="Organized" className="bg-input-bg text-dark-text">Organized</option>
                        <option value="Needs Review" className="bg-input-bg text-dark-text">Needs Review</option>
                    </select>
                </div>
            </div>
        </div>
      </fieldset>


      <div className="flex justify-end pt-2">
        <button type="submit" className={buttonPrimaryClasses}>
          {mode === 'add' ? 'Add Client' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
};
