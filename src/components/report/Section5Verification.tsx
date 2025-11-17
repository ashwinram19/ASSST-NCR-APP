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
  isPdfExporting: boolean;
}

const VERIFICATION_STEPS: Array<keyof NCARReport['section5']> = ['step1', 'step2', 'step3'];
const DEFAULT_STEP: VerificationStep = { result: '', details: '' };

const Section5Verification: React.FC<SectionProps> = ({ report, onUpdate, isEditable, isPdfExporting }) => {
  const { approvedBy } = report.section5;

  const handleStepChange = (stepKey: keyof NCARReport['section5'], field: keyof VerificationStep, value: string) => {
    if (!isEditable) return;
    
    // Ensure stepKey is one of the fixed steps
    if (!VERIFICATION_STEPS.includes(stepKey as 'step1' | 'step2' | 'step3')) return;

    onUpdate({
      ...report,
      section5: {
        ...report.section5,
        [stepKey]: {
            ...report.section5[stepKey as 'step1' | 'step2' | 'step3'],
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
    const stepData = report.section5[stepKey as 'step1' | 'step2' | 'step3'] || DEFAULT_STEP;
    
    if (isPdfExporting) {
        // Use a simple block layout for PDF to ensure content flows and breaks correctly
        return (
            <div key={stepKey} className="grid grid-cols-3 border-b border-gray-300 dark:border-gray-700 break-inside-avoid">
                {/* Result Column (1/3 width) */}
                <div className="p-1 border-r border-gray-300 dark:border-gray-700">
                    <PdfTextDisplay value={stepData.result} className="!p-0 !border-none !bg-transparent !text-xs" />
                </div>
                {/* Details Column (2/3 width) */}
                <div className="col-span-2 p-1">
                    <PdfTextDisplay value={stepData.details} className="!p-0 !border-none !bg-transparent !text-xs" />
                </div>
            </div>
        );
    }

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

  // PDF Header for the table - now plain text/border
  const renderPdfHeader = () => (
    <div className="grid grid-cols-3 bg-gray-100 text-foreground font-bold text-center text-xs border-b border-gray-400">
        <div className="pt-1 pb-0.5 px-1 border-r border-gray-400">Verification Result</div>
        <div className="col-span-2 pt-1 pb-0.5 px-1">Verification Details/Remarks</div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {!isPdfExporting && <h4 className="text-lg font-semibold">Verification Log</h4>}
        
        {isPdfExporting ? (
            <div className="border border-gray-300 dark:border-gray-700">
                {renderPdfHeader()}
                {VERIFICATION_STEPS.map((stepKey, index) => renderVerificationRow(stepKey, index))}
            </div>
        ) : (
            <div className="space-y-4">
                {VERIFICATION_STEPS.map((stepKey, index) => renderVerificationRow(stepKey, index))}
            </div>
        )}
        
        {!isEditable && !isPdfExporting && (
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