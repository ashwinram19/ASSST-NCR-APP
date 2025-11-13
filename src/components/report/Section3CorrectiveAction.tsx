import React from 'react';
import { NCARReport } from '@/lib/report-storage';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface SectionProps {
  report: NCARReport;
  onUpdate: (report: NCARReport) => void;
  isEditable: boolean;
}

const Section3CorrectiveAction: React.FC<SectionProps> = ({ report, onUpdate, isEditable }) => {
  const handleInputChange = (field: keyof NCARReport['section3'], value: string) => {
    if (!isEditable) return;
    onUpdate({
      ...report,
      section3: {
        ...report.section3,
        [field]: value,
      },
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="correctiveAction">Corrective Action Details</Label>
        <Textarea
          id="correctiveAction"
          placeholder="Describe the corrective action planned/taken to prevent recurrence..."
          value={report.section3.correctiveAction}
          onChange={(e) => handleInputChange('correctiveAction', e.target.value)}
          readOnly={!isEditable}
          className={!isEditable ? 'bg-muted/50 min-h-[100px]' : 'min-h-[100px]'}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="dateCompleted3">Date Completed</Label>
        <Input
          id="dateCompleted3"
          type="date"
          value={report.section3.dateCompleted}
          onChange={(e) => handleInputChange('dateCompleted', e.target.value)}
          readOnly={!isEditable}
          className={!isEditable ? 'bg-muted/50' : ''}
        />
      </div>
    </div>
  );
};

export default Section3CorrectiveAction;