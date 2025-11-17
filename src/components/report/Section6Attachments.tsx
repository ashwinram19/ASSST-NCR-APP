import React from 'react';
import { NCARReport, Attachment } from '@/lib/report-storage';
import AttachmentManager from './AttachmentManager';

interface SectionProps {
  report: NCARReport;
  onUpdate: (report: NCARReport) => void;
  isEditable: boolean;
}

const Section6Attachments: React.FC<SectionProps> = ({ report, onUpdate, isEditable }) => {
  const handleUpdateAttachments = (newAttachments: Attachment[]) => {
    if (!isEditable) return;
    onUpdate({
      ...report,
      section6: {
        ...report.section6,
        attachments: newAttachments,
      },
    });
  };

  return (
    <AttachmentManager
      attachments={report.section6.attachments}
      onUpdateAttachments={handleUpdateAttachments}
      isEditable={isEditable}
    />
  );
};

export default Section6Attachments;