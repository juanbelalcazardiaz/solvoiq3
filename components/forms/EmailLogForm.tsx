
import React, { useState, useEffect } from 'react';
import { ClientEmailLog, EmailAttachment, FormMode, TeamMember } from '../../types';

interface EmailLogFormProps {
  onSave: (data: Omit<ClientEmailLog, 'id' | 'loggedAt' | 'loggedBy'>) => void;
  initialData?: ClientEmailLog | null;
  formMode: FormMode;
  clientId: string; 
  currentUser: TeamMember;
}

const inputBaseClasses = "mt-1 block w-full px-3 py-2 border border-border-color rounded-md shadow-subtle focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm bg-input-bg text-dark-text placeholder-placeholder-color";
const buttonPrimaryClasses = "inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary";
const labelClasses = "block text-sm font-medium text-medium-text";
const tagButtonClasses = "px-2 py-0.5 text-xs text-primary-dark bg-primary-light border border-primary rounded-full hover:bg-primary/30 flex items-center";


export const EmailLogForm: React.FC<EmailLogFormProps> = ({
  onSave,
  initialData,
  formMode,
  clientId,
  currentUser,
}) => {
  const [direction, setDirection] = useState<'Sent' | 'Received'>('Sent');
  const [emailDate, setEmailDate] = useState(new Date().toISOString().substring(0, 16)); 
  const [subject, setSubject] = useState('');
  const [fromAddress, setFromAddress] = useState(currentUser.email);
  const [toAddresses, setToAddresses] = useState<string[]>([]);
  const [ccAddresses, setCcAddresses] = useState<string[]>([]);
  const [bccAddresses, setBccAddresses] = useState<string[]>([]);
  const [body, setBody] = useState('');
  const [attachments, setAttachments] = useState<EmailAttachment[]>([]);
  
  const [currentTo, setCurrentTo] = useState('');
  const [currentCc, setCurrentCc] = useState('');
  const [currentBcc, setCurrentBcc] = useState('');


  useEffect(() => {
    if (initialData) {
      setDirection(initialData.direction);
      const initialDate = new Date(initialData.emailDate);
      const localIsoDate = new Date(initialDate.getTime() - (initialDate.getTimezoneOffset() * 60000)).toISOString().substring(0,16);
      setEmailDate(localIsoDate);
      setSubject(initialData.subject);
      setFromAddress(initialData.fromAddress);
      setToAddresses(initialData.toAddresses || []);
      setCcAddresses(initialData.ccAddresses || []);
      setBccAddresses(initialData.bccAddresses || []);
      setBody(initialData.body);
      setAttachments(initialData.attachments || []);
    } else {
      setDirection('Sent');
      setEmailDate(new Date().toISOString().substring(0, 16));
      setSubject('');
      setFromAddress(currentUser.email);
      setToAddresses([]);
      setCcAddresses([]);
      setBccAddresses([]);
      setBody('');
      setAttachments([]);
    }
  }, [initialData, currentUser.email]);

  const handleAddressListChange = (
    value: string,
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    currentSetter: React.Dispatch<React.SetStateAction<string>>
  ) => {
    if (value.endsWith(',') || value.endsWith(';') || value.endsWith(' ')) {
      const emails = value.slice(0, -1).trim();
      if (emails) {
        setter(prev => {
            const newEmails = emails.split(/[\s,;]+/).filter(e => e.trim() !== '' && !prev.includes(e.trim()));
            return [...prev, ...newEmails];
        });
      }
      currentSetter('');
    } else {
      currentSetter(value);
    }
  };

  const removeAddress = (email: string, setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter(prev => prev.filter(e => e !== email));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !fromAddress.trim() || toAddresses.length === 0 || !body.trim()) {
        alert("Please fill in Subject, From, at least one To address, and Body.");
        return;
    }

    const emailLogData = {
      clientId, 
      direction,
      emailDate: new Date(emailDate).toISOString(),
      subject,
      fromAddress,
      toAddresses,
      ccAddresses: ccAddresses.length > 0 ? ccAddresses : undefined,
      bccAddresses: bccAddresses.length > 0 ? bccAddresses : undefined,
      body,
      attachments, // Currently, no UI to add these, so it will always be empty.
    };
    onSave(emailLogData);
  };


  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar pr-2">
       <div>
        <label htmlFor="email-direction" className={labelClasses}>Direction</label>
        <select id="email-direction" value={direction} onChange={(e) => setDirection(e.target.value as 'Sent' | 'Received')} className={`${inputBaseClasses} appearance-none`}>
          <option value="Sent" className="bg-input-bg text-dark-text">Sent</option>
          <option value="Received" className="bg-input-bg text-dark-text">Received</option>
        </select>
      </div>
      <div>
        <label htmlFor="email-date" className={labelClasses}>Email Date & Time</label>
        <input type="datetime-local" id="email-date" value={emailDate} onChange={(e) => setEmailDate(e.target.value)} required className={`${inputBaseClasses} dark:[color-scheme:dark]`} />
      </div>
      <div>
        <label htmlFor="email-subject" className={labelClasses}>Subject</label>
        <input type="text" id="email-subject" value={subject} onChange={(e) => setSubject(e.target.value)} required className={inputBaseClasses} />
      </div>

      <div>
        <label htmlFor="email-from" className={labelClasses}>From</label>
        <input type="email" id="email-from" value={fromAddress} onChange={(e) => setFromAddress(e.target.value)} required className={inputBaseClasses} />
      </div>

      <div>
        <label htmlFor="email-to" className={labelClasses}>To</label>
        <input
          type="text"
          id="email-to"
          value={currentTo}
          onChange={(e) => handleAddressListChange(e.target.value, setToAddresses, setCurrentTo)}
          placeholder="Add email and press comma, semicolon, or space"
          className={inputBaseClasses}
        />
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {toAddresses.map(email => (
            <span key={email} className={tagButtonClasses}>
              {email} <button type="button" onClick={() => removeAddress(email, setToAddresses)} className="ml-1 font-bold hover:text-danger">&times;</button>
            </span>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="email-cc" className={labelClasses}>CC (Optional)</label>
        <input
          type="text"
          id="email-cc"
          value={currentCc}
          onChange={(e) => handleAddressListChange(e.target.value, setCcAddresses, setCurrentCc)}
          placeholder="Add email and press comma, semicolon, or space"
          className={inputBaseClasses}
        />
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {ccAddresses.map(email => (
            <span key={email} className={tagButtonClasses}>
              {email} <button type="button" onClick={() => removeAddress(email, setCcAddresses)} className="ml-1 font-bold hover:text-danger">&times;</button>
            </span>
          ))}
        </div>
      </div>
      
      <div>
        <label htmlFor="email-bcc" className={labelClasses}>BCC (Optional)</label>
        <input
          type="text"
          id="email-bcc"
          value={currentBcc}
          onChange={(e) => handleAddressListChange(e.target.value, setBccAddresses, setCurrentBcc)}
          placeholder="Add email and press comma, semicolon, or space"
          className={inputBaseClasses}
        />
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {bccAddresses.map(email => (
            <span key={email} className={tagButtonClasses}>
              {email} <button type="button" onClick={() => removeAddress(email, setBccAddresses)} className="ml-1 font-bold hover:text-danger">&times;</button>
            </span>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="email-body" className={labelClasses}>Body</label>
        <textarea id="email-body" value={body} onChange={(e) => setBody(e.target.value)} rows={6} required className={inputBaseClasses}></textarea>
      </div>
      
      <div>
        <label className={labelClasses}>Attachments (Manual Log)</label>
        <p className="text-xs text-light-text">Attachment uploading is not supported in this form. Please log attachment names manually if needed, or manage attachments via your email client. Actual files are not stored here.</p>
        {/* Basic attachment name logging - can be expanded later */}
        {attachments.map(att => <span key={att.id} className="text-xs text-medium-text block">{att.name}</span>)}
      </div>

      <div className="flex justify-end pt-2">
        <button type="submit" className={buttonPrimaryClasses}>
          {formMode === 'add' ? 'Log Email' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
}