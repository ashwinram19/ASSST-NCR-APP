import React from 'react';
import { NCARReport } from '@/lib/report-storage';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Check, Lock } from 'lucide-react';
import { getDepartments, getClauseIDs, getIQRNumbers, getNonConformityTypes, SetupItem } from '@/lib/data-storage';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import PdfTextDisplay from '@/components/PdfTextDisplay';

interface Section1DetailsProps {
  report: NCARReport;
  onUpdate: (report: NCARReport) => void;
  isEditable: boolean;
  isAdmin: boolean;
  isPdfExporting: boolean;
}

const Section1Details: React.FC<Section1DetailsProps> = ({ report, onUpdate, isEditable, isAdmin, isPdfExporting }) => {
  const departments = getDepartments();
  const clauseIDs = getClauseIDs();
  const iqrNumbers = getIQRNumbers();
  const nonConformityTypes = getNonConformityTypes();

  // Helper to update fields within section1
  const handleSection1InputChange = (field: keyof NCARReport['section1'], value: string | boolean) => {
    if (!isEditable) return;
    onUpdate({
      ...report,
      section1: {
        ...report.section1,
        [field]: value,
      },
    });
  };

  const handleLockSection = () => {
    if (!isAdmin || report.status !== 'Draft') return;

    // Check if required fields (including identification fields) and nonConformityDetails are filled before attempting to lock
    if (!report.section1.departmentId || !report.section1.clauseId || !report.section1.iqrNumberId || !report.section1.nonConformityTypeId || !report.section1.dateRaised || !report.section1.personResponsible || !report.section1.nonConformityDetails) {
        toast.error("Please ensure all required fields (Identification, Type of Nonconformity, Date Raised, Person Responsible, and Non-Conformity Details) are filled before locking Section 1.");
        return;
    }

    const updatedSection1 = {
      ...report.section1,
      adminAcknowledged: true,
      adminSentMail: true, // Set true for consistency, even though the button is removed
    };

    onUpdate({
      ...report,
      status: 'Section1Locked',
      section1: updatedSection1,
    });
    toast.success("Section 1 locked. Sections 2-5 are now editable by users.");
  };

  const findNameById = (id: string, list: SetupItem[]) => list.find(item => item.id === id)?.name || 'N/A';

  const renderSelectOrInput = (
    field: keyof NCARReport['section1'], 
    label: string, 
    dataList: SetupItem[], 
    placeholder: string
  ) => {
    const currentValue = report.section1[field] as string;
    const displayValue = findNameById(currentValue, dataList);

    if (isPdfExporting) {
        return (
            <div className="space-y-2">
                <Label>{label}</Label>
                <PdfTextDisplay value={displayValue} />
            </div>
        );
    }

    if (isEditable) {
      return (
        <div className="space-y-2">
          <Label>{label} (Required)</Label>
          <Select
            value={currentValue}
            onValueChange={(value) => handleSection1InputChange(field, value)}
          >
            <SelectTrigger>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {dataList.map((item) => (
                <SelectItem key={item.id} value={item.id}>
                  {item.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );
    }

    // Read-only view
    return (
      <div className="space-y-2">
        <Label>{label}</Label>
        <Input readOnly value={displayValue} className="bg-muted/50" />
      </div>
    );
  };
  
  // Helper for standard text/date inputs
  const renderStandardInput = (field: keyof NCARReport['section1'], label: string, type: 'text' | 'date' | 'textarea', placeholder?: string) => {
    const currentValue = report.section1[field] as string;
    
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
        placeholder: placeholder,
        value: currentValue,
        onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => handleSection1InputChange(field, e.target.value),
        readOnly: !isEditable,
        className: !isEditable ? (type === 'textarea' ? 'bg-muted/50 min-h-[100px]' : 'bg-muted/50') : (type === 'textarea' ? 'min-h-[100px]' : ''),
    };

    return (
        <div className="space-y-2">
            <Label htmlFor={field}>{label} {['dateRaised', 'personResponsible', 'nonConformityDetails'].includes(field) ? '(Required)' : ''}</Label>
            <InputComponent {...inputProps} />
        </div>
    );
  };


  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Report Identification</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Department */}
        {renderSelectOrInput(
          'departmentId', 
          'Department', 
          departments, 
          'Select Department'
        )}
        
        {/* Clause ID */}
        {renderSelectOrInput(
          'clauseId', 
          'Clause ID', 
          clauseIDs, 
          'Select Clause ID'
        )}
        
        {/* IQR Number */}
        {renderSelectOrInput(
          'iqrNumberId', 
          'IQR Number', 
          iqrNumbers, 
          'Select IQR Number'
        )}
      </div>
      
      {/* Type of Nonconformity */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {renderSelectOrInput(
          'nonConformityTypeId', 
          'Type of Nonconformity', 
          nonConformityTypes, 
          'Select Type'
        )}
      </div>

      <h3 className="text-lg font-semibold pt-4 border-t">Non-Conformity Details ({isPdfExporting ? 'Finalized' : 'Editable in Draft'})</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Date Raised */}
        {renderStandardInput('dateRaised', 'Date Raised', 'date')}
        
        {/* Person Responsible */}
        {renderStandardInput('personResponsible', 'Person Responsible', 'text', 'Name of person responsible')}
      </div>

      {/* ISO 9001:2015 QMS Clause Reference */}
      {renderStandardInput('qmsClauseReference', 'ISO 9001:2015 QMS Clause Reference', 'text', 'e.g., 8.7.1')}
      
      {/* Associated Risk/ Risk Type */}
      {renderStandardInput('associatedRisk', 'Associated Risk / Risk Type', 'text', 'e.g., Production Delay, Customer Complaint')}

      {/* Non-Conformity Details */}
      {renderStandardInput('nonConformityDetails', 'Non-Conformity Details', 'textarea', 'Describe the non-conformity...')}

      {/* Admin Actions (Locking Mechanism) - Hide in PDF mode */}
      {!isPdfExporting && isAdmin && report.status === 'Draft' && (
        <div className="pt-4 border-t flex items-center space-x-4">
          <Button
            onClick={handleLockSection}
            disabled={report.section1.adminAcknowledged}
            variant={report.section1.adminAcknowledged ? 'secondary' : 'default'}
          >
            {report.section1.adminAcknowledged ? <Check className="mr-2 h-4 w-4" /> : <Lock className="mr-2 h-4 w-4" />}
            Acknowledgment & Lock Section 1
          </Button>
          <p className="text-sm text-muted-foreground">
            {report.section1.adminAcknowledged
              ? 'Section 1 is locked.'
              : 'Click to finalize Section 1 and enable Sections 2-5 for user input.'}
          </p>
        </div>
      )}
      
      {/* Display locked status for users - Hide in PDF mode */}
      {!isPdfExporting && !isEditable && report.status !== 'Draft' && (
        <p className="text-sm text-green-600 font-medium">Section 1 is finalized and locked.</p>
      )}
    </div>
  );
};

export default Section1Details;