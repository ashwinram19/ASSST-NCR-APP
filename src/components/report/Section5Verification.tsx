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

const Section5Verification: React.FC<SectionProps> = ({ report, onUpdate, isEditable }) => {
  const handleInputChange = (field: keyof NCARReport['section5'], value: string) => {
    if (!isEditable) return;
    onUpdate({
      ...report,
      section5: {
        ...report.section5,
        [field]: value,
      },
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="verificationDetails">Verification of Implementation and Effectiveness</Label>
        <Textarea
          id="verificationDetails"
          placeholder="Document verification details..."
          value={report.section5.verificationDetails}
          onChange={(e) => handleInputChange('verificationDetails', e.target.value)}
          readOnly={!isEditable}
          className={!isEditable ? 'bg-muted/50 min-h-[100px]' : 'min-h-[100px]'}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="dateVerified">Date Verified</Label>
        <Input
          id="dateVerified"
          type="date"
          value={report.section5.dateVerified}
          onChange={(e) => handleInputChange('dateVerified', e.target.value)}
          readOnly={!isEditable}
          className={!isEditable ? 'bg-muted/50' : ''}
        />
      </div>
    </div>
  );
};

export default Section5Verification;