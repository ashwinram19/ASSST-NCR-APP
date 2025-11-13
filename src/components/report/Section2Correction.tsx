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

const Section2Correction: React.FC<SectionProps> = ({ report, onUpdate, isEditable }) => {
  const handleInputChange = (field: keyof NCARReport['section2'], value: string) => {
    if (!isEditable) return;
    onUpdate({
      ...report,
      section2: {
        ...report.section2,
        [field]: value,
      },
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="correction">Correction Details</Label>
        <Textarea
          id="correction"
          placeholder="Describe the immediate correction taken..."
          value={report.section2.correction}
          onChange={(e) => handleInputChange('correction', e.target.value)}
          readOnly={!isEditable}
          className={!isEditable ? 'bg-muted/50 min-h-[100px]' : 'min-h-[100px]'}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="dateCompleted2">Date Completed</Label>
        <Input
          id="dateCompleted2"
          type="date"
          value={report.section2.dateCompleted}
          onChange={(e) => handleInputChange('dateCompleted', e.target.value)}
          readOnly={!isEditable}
          className={!isEditable ? 'bg-muted/50' : ''}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
        <div className="space-y-2">
          <Label htmlFor="reviewedBy2">Reviewed By</Label>
          <Input
            id="reviewedBy2"
            type="text"
            value={report.section2.reviewedBy}
            onChange={(e) => handleInputChange('reviewedBy', e.target.value)}
            readOnly={!isEditable}
            className={!isEditable ? 'bg-muted/50' : ''}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="approvedBy2">Approved By</Label>
          <Input
            id="approvedBy2"
            type="text"
            value={report.section2.approvedBy}
            onChange={(e) => handleInputChange('approvedBy', e.target.value)}
            readOnly={!isEditable}
            className={!isEditable ? 'bg-muted/50' : ''}
          />
        </div>
      </div>
    </div>
  );
};

export default Section2Correction;