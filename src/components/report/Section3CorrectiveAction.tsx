import React from 'react';
import { NCARReport } from '@/lib/report-storage';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import PdfTextDisplay from '@/components/PdfTextDisplay';

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

  const renderField = (field: keyof NCARReport['section3'], label: string, type: 'text' | 'date' | 'textarea') => {
    const currentValue = report.section3[field];

    const InputComponent = type === 'textarea' ? Textarea : Input;
    const inputProps = {
        id: field,
        type: type === 'date' ? 'date' : 'text',
        value: currentValue,
        onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => handleInputChange(field, e.target.value),
        readOnly: !isEditable,
        className: !isEditable ? (type === 'textarea' ? 'bg-muted/50 min-h-[100px]' : 'bg-muted/50') : (type === 'textarea' ? 'min-h-[100px]' : ''),
        placeholder: type === 'textarea' ? "Describe the corrective action planned/taken to prevent recurrence..." : undefined,
    };

    return (
        <div className="space-y-2">
            <Label htmlFor={field}>{label}</Label>
            {
                !isEditable && type !== 'date' ? (
                    <PdfTextDisplay value={currentValue} />
                ) : (
                    <InputComponent {...inputProps} />
                )
            }
        </div>
    );
  };

  return (
    <div className="space-y-4">
      {renderField('correctiveAction', 'Corrective Action Details', 'textarea')}
      {renderField('dateCompleted', 'Date Completed', 'date')}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
        {renderField('reviewedBy', 'Action Completed By', 'text')}
        {/* Removed Approved By */}
      </div>
    </div>
  );
};

export default Section3CorrectiveAction;