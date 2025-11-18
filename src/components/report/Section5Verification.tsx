import React from 'react';
import { NCARReport, VerificationStep } from '@/lib/report-storage';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import PdfTextDisplay from '@/components/PdfTextDisplay';
import { Input } from '@/components/ui/input';

interface SectionProps {
  report: NCARReport;
  onUpdate: (report: NCARReport) => void;
  isEditable: boolean;
}

const VERIFICATION_STEPS: Array<keyof NCARReport['section5']> = ['step1', 'step2'];
const DEFAULT_STEP: VerificationStep = { result: '', details: '' };

const Section5Verification: React.FC<SectionProps> = ({ report, onUpdate, isEditable }) => {
  const { approvedBy } = report.section5;

  const handleStepChange = (stepKey: keyof NCARReport['section5'], field: keyof VerificationStep, value: string) => {
    if (!isEditable) return;
    
    // Ensure stepKey is one of the fixed steps
    if (!VERIFICATION_STEPS.includes(stepKey as 'step1' | 'step2')) return;

    onUpdate({
      ...report,
      section5: {
        ...report.section5,
        [stepKey]: {
            ...report.section5[stepKey as 'step1' | 'step2'],
            [field]: value,
        },
      },
    });
  };

  // Renders the combined approval sentence
  const renderApprovalStamp = () => {
    const approvalText = approvedBy || 'Pending Verification Approval';

    return (
        <div className="space-y-2 col-span-2">
            <Label>Verification Approval</Label>
            <PdfTextDisplay value={approvalText} />
        </div>
    );
  };

  const renderVerificationRow = (stepKey: keyof NCARReport['section5'], index: number) => {
    // Safely access step data, defaulting to an empty structure if missing
    const stepData = report.section5[stepKey as 'step1' | 'step2'] || DEFAULT_STEP;
    
    // Standard UI view
    return (
      <div key={stepKey} className="grid grid-cols-12 gap-4 items-start">
        {/* Verification Result (3/12 width) */}
        <div className="col-span-3 space-y-2">
          {index === 0 && <Label>Verification Result</Label>}
          <Input
            value={stepData.result}
            onChange={(e) => handleStepChange(stepKey, 'result', e.target.value)}
            readOnly={!isEditable}
            className={!isEditable ? 'bg-muted/50' : ''}
            placeholder="Enter Result (e.g., Pass/Fail/N/A)"
          />
        </div>

        {/* Verification Details/Remarks (9/12 width) */}
        <div className="col-span-9 space-y-2">
          {index === 0 && <Label>Verification Details/Remarks</Label>}
          <Textarea
            value={stepData.details}
            onChange={(e) => handleStepChange(stepKey, 'details', e.target.value)}
            readOnly={!isEditable}
            className={!isEditable ? 'bg-muted/50 min-h-[50px]' : 'min-h-[50px]'}
            placeholder={`Step ${index + 1} details...`}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h4 className="text-lg font-semibold">Verification Log</h4>
        
        <div className="space-y-4">
            {VERIFICATION_STEPS.map((stepKey, index) => renderVerificationRow(stepKey, index))}
        </div>
        
        {!isEditable && (
            <p className="text-sm text-muted-foreground">Verification steps are read-only.</p>
        )}
      </div>

      <div className="grid grid-cols-1 pt-4 border-t">
        {renderApprovalStamp()}
      </div>
    </div>
  );
};

export default Section5Verification;