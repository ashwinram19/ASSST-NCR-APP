import React from 'react';
import { NCARReport } from '@/lib/report-storage';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface SectionProps {
  report: NCARReport;
  onUpdate: (report: NCARReport) => void;
  isEditable: boolean;
}

const Section6Attachments: React.FC<SectionProps> = ({ report, onUpdate, isEditable }) => {
  const handleInputChange = (field: keyof NCARReport['section6'], value: string) => {
    if (!isEditable) return;
    onUpdate({
      ...report,
      section6: {
        ...report.section6,
        [field]: value,
      },
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="attachmentNotes">Attachment Notes / Links (Admin Only)</Label>
        <Textarea
          id="attachmentNotes"
          placeholder="Document details or links related to verification attachments (e.g., image links, file names, notes)..."
          value={report.section6.attachmentNotes}
          onChange={(e) => handleInputChange('attachmentNotes', e.target.value)}
          readOnly={!isEditable}
          className={!isEditable ? 'bg-muted/50 min-h-[100px]' : 'min-h-[100px]'}
        />
      </div>
    </div>
  );
};

export default Section6Attachments;