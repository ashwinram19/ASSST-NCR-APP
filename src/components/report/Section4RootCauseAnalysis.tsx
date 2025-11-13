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

const Section4RootCauseAnalysis: React.FC<SectionProps> = ({ report, onUpdate, isEditable }) => {
  const handleInputChange = (field: keyof NCARReport['section4'], value: string) => {
    if (!isEditable) return;
    onUpdate({
      ...report,
      section4: {
        ...report.section4,
        [field]: value,
      },
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="rootCauseAnalysis">Root Cause Analysis</Label>
        <Textarea
          id="rootCauseAnalysis"
          placeholder="Document the root cause analysis findings..."
          value={report.section4.rootCauseAnalysis}
          onChange={(e) => handleInputChange('rootCauseAnalysis', e.target.value)}
          readOnly={!isEditable}
          className={!isEditable ? 'bg-muted/50 min-h-[100px]' : 'min-h-[100px]'}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="dateCompleted4">Date Completed</Label>
        <Input
          id="dateCompleted4"
          type="date"
          value={report.section4.dateCompleted}
          onChange={(e) => handleInputChange('dateCompleted', e.target.value)}
          readOnly={!isEditable}
          className={!isEditable ? 'bg-muted/50' : ''}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
        <div className="space-y-2">
          <Label htmlFor="reviewedBy4">Reviewed By</Label>
          <Input
            id="reviewedBy4"
            type="text"
            value={report.section4.reviewedBy}
            onChange={(e) => handleInputChange('reviewedBy', e.target.value)}
            readOnly={!isEditable}
            className={!isEditable ? 'bg-muted/50' : ''}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="approvedBy4">Approved By</Label>
          <Input
            id="approvedBy4"
            type="text"
            value={report.section4.approvedBy}
            onChange={(e) => handleInputChange('approvedBy', e.target.value)}
            readOnly={!isEditable}
            className={!isEditable ? 'bg-muted/50' : ''}
          />
        </div>
      </div>
    </div>
  );
};

export default Section4RootCauseAnalysis;