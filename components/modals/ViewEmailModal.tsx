
import React from 'react';
import jsPDF from 'jspdf';
import { ClientEmailLog } from '../../types';
import { Modal } from '../Modal';
import { DownloadCloud, FileText as FileTextIcon, Paperclip, User, Mail, Send, CornerDownRight, CalendarDays, Type as TypeIcon, Users, EyeOff, FileType } from 'lucide-react';

interface ViewEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: ClientEmailLog | null;
}

export const ViewEmailModal: React.FC<ViewEmailModalProps> = ({ isOpen, onClose, email }) => {
  if (!isOpen || !email) return null;

  const handleDownloadPdf = () => {
    if (!email) return;
    
    const pdf = new jsPDF();
    let yPos = 10;
    const lineSpacing = 7;
    const sectionSpacing = 10;
    const leftMargin = 10;
    const contentWidth = 180;

    pdf.setFontSize(16);
    pdf.text(`Subject: ${email.subject}`, leftMargin, yPos);
    yPos += sectionSpacing;

    pdf.setFontSize(10);
    pdf.text(`Date: ${new Date(email.emailDate).toLocaleString()}`, leftMargin, yPos);
    yPos += lineSpacing;
    pdf.text(`From: ${email.fromAddress}`, leftMargin, yPos);
    yPos += lineSpacing;
    pdf.text(`To: ${email.toAddresses.join(', ')}`, leftMargin, yPos);
    yPos += lineSpacing;

    if (email.ccAddresses && email.ccAddresses.length > 0) {
      pdf.text(`CC: ${email.ccAddresses.join(', ')}`, leftMargin, yPos);
      yPos += lineSpacing;
    }
    // BCC is intentionally not shown in typical email views/PDFs for privacy.
    // If needed for internal audit, it could be added here.

    yPos += (sectionSpacing / 2);
    pdf.setLineWidth(0.2);
    pdf.line(leftMargin, yPos, leftMargin + contentWidth, yPos); // Separator line
    yPos += sectionSpacing;
    
    pdf.setFontSize(12);
    pdf.text('Body:', leftMargin, yPos);
    yPos += lineSpacing;
    
    pdf.setFontSize(10);
    const bodyLines = pdf.splitTextToSize(email.body, contentWidth);
    pdf.text(bodyLines, leftMargin, yPos);
    yPos += (bodyLines.length * lineSpacing) + sectionSpacing;

    if (email.attachments && email.attachments.length > 0) {
      pdf.setFontSize(12);
      pdf.text('Attachments:', leftMargin, yPos);
      yPos += lineSpacing;
      pdf.setFontSize(10);
      email.attachments.forEach(att => {
        pdf.text(`- ${att.name} (${att.type || 'unknown type'})`, leftMargin + 5, yPos);
        yPos += lineSpacing;
        if (yPos > 280) { // Basic page break
          pdf.addPage();
          yPos = 10;
        }
      });
    }
    
    const filename = `${email.subject.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'email'}_${new Date(email.emailDate).toISOString().split('T')[0]}.pdf`;
    pdf.save(filename);
  };

  const handleDownloadEml = () => {
    if (!email) return;

    const headers = [
      `Date: ${new Date(email.emailDate).toUTCString()}`, // EML standard prefers UTC
      `From: ${email.fromAddress}`,
      `To: ${email.toAddresses.join(', ')}`,
      email.ccAddresses && email.ccAddresses.length > 0 ? `Cc: ${email.ccAddresses.join(', ')}` : null,
      // BCC headers are tricky. Standard EML files generated by clients often don't include BCC of others.
      // If this EML is for archival and the user *is* a BCC recipient, it might be there.
      // For generating an EML of an email *sent* by the user, they might want their BCCs.
      // For simplicity and general compatibility, we'll include BCC if present.
      email.bccAddresses && email.bccAddresses.length > 0 ? `Bcc: ${email.bccAddresses.join(', ')}` : null,
      `Subject: ${email.subject}`,
      'MIME-Version: 1.0',
      // Basic plain text email for now. HTML would require multipart content type.
      `Content-Type: text/plain; charset="UTF-8"`, 
      'Content-Transfer-Encoding: 7bit',
    ];

    if (email.attachments && email.attachments.length > 0) {
      // This is a simplification. Real EML attachments are MIME-encoded parts.
      // For now, just listing them as a custom header or in the body.
      headers.push(`X-Attachments-Logged: ${email.attachments.map(att => att.name).join('; ')}`);
    }

    let emailBody = email.body;
    if (email.attachments && email.attachments.length > 0) {
        emailBody += `\n\n--- Logged Attachments ---\n${email.attachments.map(att => `- ${att.name} (${att.type})`).join('\n')}`;
    }

    const emlContent = `${headers.filter(h => h !== null).join('\r\n')}\r\n\r\n${emailBody}`;

    const blob = new Blob([emlContent], { type: 'message/rfc822' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const filename = `${email.subject.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'email'}_${new Date(email.emailDate).toISOString().split('T')[0]}.eml`;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  
  const DetailRow: React.FC<{icon: React.ElementType, label: string, value?: string | string[] | null, isEmailList?: boolean}> = ({icon: Icon, label, value, isEmailList}) => {
    if (!value || (Array.isArray(value) && value.length === 0)) return null;
    const displayValue = Array.isArray(value) ? value.join(', ') : value;
    return (
        <div className="flex items-start py-1.5 border-b border-border-color/50 last:border-b-0">
            <Icon size={16} className="mr-2.5 mt-0.5 text-primary flex-shrink-0"/>
            <span className="text-xs font-semibold text-light-text w-20 flex-shrink-0">{label}:</span>
            <span className={`text-sm text-medium-text break-words ${isEmailList ? 'leading-tight' : ''}`}>{displayValue}</span>
        </div>
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Email Details: ${email.subject}`}>
      <div className="space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar pr-2">
        <section className="bg-sidebar-bg p-4 rounded-md border border-border-color">
            <DetailRow icon={TypeIcon} label="Subject" value={email.subject} />
            <DetailRow icon={CalendarDays} label="Date" value={new Date(email.emailDate).toLocaleString()} />
            <DetailRow icon={Send} label="From" value={email.fromAddress} />
            <DetailRow icon={CornerDownRight} label="To" value={email.toAddresses} isEmailList/>
            {email.ccAddresses && email.ccAddresses.length > 0 && <DetailRow icon={Users} label="CC" value={email.ccAddresses} isEmailList/>}
            {email.bccAddresses && email.bccAddresses.length > 0 && <DetailRow icon={EyeOff} label="BCC" value={email.bccAddresses} isEmailList/>}
        </section>
        
        <section className="bg-sidebar-bg p-4 rounded-md border border-border-color">
            <h4 className="text-sm font-semibold text-dark-text mb-2 flex items-center">
                <Mail size={16} className="mr-2 text-primary"/> Email Body
            </h4>
            <div className="whitespace-pre-wrap text-sm text-medium-text p-2.5 bg-input-bg rounded max-h-60 overflow-y-auto custom-scrollbar border border-border-color/50">
                {email.body || <span className="italic text-light-text">No body content logged.</span>}
            </div>
        </section>

        {email.attachments && email.attachments.length > 0 && (
          <section className="bg-sidebar-bg p-4 rounded-md border border-border-color">
            <h4 className="text-sm font-semibold text-dark-text mb-2 flex items-center">
                <Paperclip size={16} className="mr-2 text-primary"/> Attachments ({email.attachments.length})
            </h4>
            <ul className="space-y-1 text-sm">
              {email.attachments.map(att => (
                <li key={att.id} className="text-medium-text flex items-center">
                    <FileType size={15} className="mr-1.5 text-light-text"/> {att.name} <span className="text-xs text-light-text ml-1">({att.type || 'unknown'})</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        <div className="flex justify-end space-x-3 pt-3">
          <button
            onClick={handleDownloadPdf}
            className="flex items-center text-sm bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-3 rounded-md transition-colors"
          >
            <FileTextIcon size={16} className="mr-1.5" /> Download PDF
          </button>
          <button
            onClick={handleDownloadEml}
            className="flex items-center text-sm bg-teal-600 hover:bg-teal-700 text-white font-medium py-2 px-3 rounded-md transition-colors"
          >
            <DownloadCloud size={16} className="mr-1.5" /> Download .EML
          </button>
        </div>
      </div>
    </Modal>
  );
};
