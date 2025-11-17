import React from 'react';
import { NCARReport, VerificationItem } from '@/lib/report-storage';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Trash2, PlusCircle } from 'lucide-react';
import { toast } from 'sonner';
import PdfTextDisplay from '@/components/PdfTextDisplay';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface SectionProps {
  report: NCARReport;
  onUpdate: (report: NCARReport) => void;
  isEditable: boolean;
  isPdfExporting: boolean;
}

const VERIFICATION_RESULTS = ['Pass', 'Fail', 'N/A'];

const Section5Verification: React.FC<SectionProps> = ({ report, onUpdate, isEditable, isPdfExporting }) => {
  const { verificationItems, dateVerified, approvedBy } = report.section5;

  const handleFixedInputChange = (field: 'dateVerified' | 'approvedBy', value: string) => {
    if (!isEditable) return;
    onUpdate({
      ...report,
      section5: {
        ...report.section5,
        [field]: value,
      },
    });
  };

  const handleItemChange = (id: string, field: keyof VerificationItem, value: string) => {
    if (!isEditable) return;
    const updatedItems = verificationItems.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    );
    onUpdate({
      ...report,
      section5: {
        ...report.section5,
        verificationItems: updatedItems,
      },
    });
  };

  const handleAddItem = () => {
    if (!isEditable) return;
    const newItem: VerificationItem = {
      id: Date.now().toString(),
      result: 'N/A',
      details: '',
    };
    onUpdate({
      ...report,
      section5: {
        ...report.section5,
        verificationItems: [...verificationItems, newItem],
      },
    });
    toast.info("New verification step added.");
  };

  const handleRemoveItem = (id: string) => {
    if (!isEditable) return;
    const updatedItems = verificationItems.filter(item => item.id !== id);
    onUpdate({
      ...report,
      section5: {
        ...report.section5,
        verificationItems: updatedItems,
      },
    });
    toast.success("Verification step removed.");
  };

  const renderFixedField = (field: 'dateVerified' | 'approvedBy', label: string, type: 'text' | 'date') => {
    const currentValue = report.section5[field];

    if (isPdfExporting) {
        return (
            <div className="space-y-2">
                <Label>{label}</Label>
                <PdfTextDisplay value={currentValue} />
            </div>
        );
    }

    return (
        <div className="space-y-2">
            <Label htmlFor={field}>{label}</Label>
            <Input
                id={field}
                type={type}
                value={currentValue}
                onChange={(e) => handleFixedInputChange(field, e.target.value)}
                readOnly={!isEditable}
                className={!isEditable ? 'bg-muted/50' : ''}
            />
        </div>
    );
  };

  const renderVerificationItem = (item: VerificationItem) => {
    if (isPdfExporting) {
        return (
            <div key={item.id} className="grid grid-cols-3 gap-4 border-b py-2 break-inside-avoid">
                <div className="col-span-1 space-y-1">
                    <Label className="font-medium">Result:</Label>
                    <PdfTextDisplay value={item.result} className="!p-0 !border-none !bg-transparent" />
                </div>
                <div className="col-span-2 space-y-1">
                    <Label className="font-medium">Details/Remarks:</Label>
                    <PdfTextDisplay value={item.details} className="!p-0 !border-none !bg-transparent" />
                </div>
            </div>
        );
    }

    return (
      <div key={item.id} className="grid grid-cols-12 gap-4 p-3 border rounded-md bg-background/50 items-start">
        {/* Verification Result */}
        <div className="col-span-4 space-y-2">
          <Label>Verification Result</Label>
          <Select
            value={item.result}
            onValueChange={(value) => handleItemChange(item.id, 'result', value)}
            disabled={!isEditable}
          >
            <SelectTrigger className={!isEditable ? 'bg-muted/50' : ''}>
              <SelectValue placeholder="Select Result" />
            </SelectTrigger>
            <SelectContent>
              {VERIFICATION_RESULTS.map((result) => (
                <SelectItem key={result} value={result}>
                  {result}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Verification Details/Remarks */}
        <div className="col-span-7 space-y-2">
          <Label>Verification Details/Remarks</Label>
          <Textarea
            value={item.details}
            onChange={(e) => handleItemChange(item.id, 'details', e.target.value)}
            readOnly={!isEditable}
            className={!isEditable ? 'bg-muted/50 min-h-[50px]' : 'min-h-[50px]'}
            placeholder="Document verification details..."
          />
        </div>

        {/* Action Button */}
        <div className="col-span-1 flex justify-end pt-8">
          {isEditable && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleRemoveItem(item.id)}
              className="text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    );
  };

  if (isPdfExporting) {
    return (
        <div className="space-y-4">
            <h4 className="text-base font-semibold">Verification Log</h4>
            <div className="space-y-2 border p-2">
                {verificationItems.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No verification steps documented.</p>
                ) : (
                    verificationItems.map(renderVerificationItem)
                )}
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                {renderFixedField('dateVerified', 'Date Verified', 'date')}
                {renderFixedField('approvedBy', 'Approved By', 'text')}
            </div>
        </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h4 className="text-lg font-semibold">Verification Log</h4>
        {verificationItems.length === 0 && (
          <p className="text-sm text-muted-foreground">No verification steps documented yet.</p>
        )}
        <div className="space-y-4">
          {verificationItems.map(renderVerificationItem)}
        </div>
        
        {isEditable && (
          <Button onClick={handleAddItem} variant="outline" className="w-full">
            <PlusCircle className="mr-2 h-4 w-4" /> Add Verification Step
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
        {renderFixedField('dateVerified', 'Date Verified', 'date')}
        {renderFixedField('approvedBy', 'Approved By', 'text')}
      </div>
    </div>
  );
};

export default Section5Verification;