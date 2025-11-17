import React from 'react';
import { NCARReport } from '@/lib/report-storage';
import AttachmentManager from './AttachmentManager';

interface SectionProps {
  report: NCARReport;
  onUpdate: (report: NCARReport) => void;
  isEditable: boolean;
  isPdfExporting: boolean;
}

const Section6Attachments: React.FC<SectionProps> = ({ report, onUpdate, isEditable, isPdfExporting }) => {
  const handleUpdateNotes = (newNotes: string) => {
    if (!isEditable) return;
    onUpdate({
      ...report,
      section6: {
        ...report.section6,
        attachmentNotes: newNotes,
      },
    });
  };

  return (
    <AttachmentManager
      notes={report.section6.attachmentNotes}
      onUpdateNotes={handleUpdateNotes}
      isEditable={isEditable}
      isPdfExporting={isPdfExporting}
    />
  );
};

export default Section6Attachments;