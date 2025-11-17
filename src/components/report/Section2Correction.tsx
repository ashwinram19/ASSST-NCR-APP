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
  isPdfExporting: boolean;
}

const Section2Correction: React.FC<SectionProps> = ({ report, onUpdate, isEditable, isPdfExporting }) => {
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

  const renderField = (field: keyof NCARReport['section2'], label: string, type: 'text' | 'date' | 'textarea') => {
    const currentValue = report.section2[field];

    if (isPdfExporting) {
        return (
            <div className="space-y-2">
                <Label>{label}</Label>
                <PdfTextDisplay value={currentValue} />
            </div>
        );
    }

    const InputComponent = type === 'textarea' ? Textarea : Input;
    const inputProps = {
        id: field,
        type: type === 'date' ? 'date' : 'text',
        value: currentValue,
        onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => handleInputChange(field, e.target.value),
        readOnly: !isEditable,
        className: !isEditable ? (type === 'textarea' ? 'bg-muted/50 min-h-[100px]' : 'bg-muted/50') : (type === 'textarea' ? 'min-h-[100px]' : ''),
        placeholder: type === 'textarea' ? "Describe the immediate correction taken..." : undefined,
    };

    return (
        <div className="space-y-2">
            <Label htmlFor={field}>{label}</Label>
            <InputComponent {...inputProps} />
        </div>
    );
  };

  return (
    <div className="space-y-4">
      {renderField('correction', 'Correction Details', 'textarea')}
      {renderField('dateCompleted', 'Date Completed', 'date')}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
        {renderField('reviewedBy', 'Action Completed By', 'text')}
        {/* Removed Approved By */}
      </div>
    </div>
  );
};

export default Section2Correction;