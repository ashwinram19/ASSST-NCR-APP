import React from 'react';
import { NCARReport } from '@/lib/report-storage';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Check, Lock } from 'lucide-react';
import { getDepartments, getClauseIDs, getIQRNumbers, SetupItem } from '@/lib/data-storage';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Section1DetailsProps {
  report: NCARReport;
  onUpdate: (report: NCARReport) => void;
  isEditable: boolean;
  isAdmin: boolean;
}

const Section1Details: React.FC<Section1DetailsProps> = ({ report, onUpdate, isEditable, isAdmin }) => {
  const departments = getDepartments();
  const clauseIDs = getClauseIDs();
  const iqrNumbers = getIQRNumbers();

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
    if (!report.section1.departmentId || !report.section1.clauseId || !report.section1.iqrNumberId || !report.section1.dateRaised || !report.section1.personResponsible || !report.section1.nonConformityDetails) {
        toast.error("Please ensure all required fields (Identification, Date Raised, Person Responsible, and Non-Conformity Details) are filled before locking Section 1.");
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
        <Input readOnly value={findNameById(currentValue, dataList)} className="bg-muted/50" />
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

      <h3 className="text-lg font-semibold pt-4 border-t">Non-Conformity Details (Editable in Draft)</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Date Raised (EDITABLE) */}
        <div className="space-y-2">
          <Label htmlFor="dateRaised">Date Raised (Required)</Label>
          <Input
            id="dateRaised"
            type="date"
            value={report.section1.dateRaised}
            onChange={(e) => handleSection1InputChange('dateRaised', e.target.value)}
            readOnly={!isEditable}
            className={!isEditable ? 'bg-muted/50' : ''}
          />
        </div>
        
        {/* Person Responsible (EDITABLE) */}
        <div className="space-y-2">
          <Label htmlFor="personResponsible">Person Responsible (Required)</Label>
          <Input
            id="personResponsible"
            type="text"
            placeholder="Name of person responsible"
            value={report.section1.personResponsible}
            onChange={(e) => handleSection1InputChange('personResponsible', e.target.value)}
            readOnly={!isEditable}
            className={!isEditable ? 'bg-muted/50' : ''}
          />
        </div>
      </div>

      {/* ISO 9001:2015 QMS Clause Reference (EDITABLE) */}
      <div className="space-y-2">
        <Label htmlFor="qmsClauseReference">ISO 9001:2015 QMS Clause Reference</Label>
        <Input
          id="qmsClauseReference"
          type="text"
          placeholder="e.g., 8.7.1"
          value={report.section1.qmsClauseReference}
          onChange={(e) => handleSection1InputChange('qmsClauseReference', e.target.value)}
          readOnly={!isEditable}
          className={!isEditable ? 'bg-muted/50' : ''}
        />
      </div>
      
      {/* Associated Risk/ Risk Type (EDITABLE) */}
      <div className="space-y-2">
        <Label htmlFor="associatedRisk">Associated Risk / Risk Type</Label>
        <Input
          id="associatedRisk"
          type="text"
          placeholder="e.g., Production Delay, Customer Complaint"
          value={report.section1.associatedRisk}
          onChange={(e) => handleSection1InputChange('associatedRisk', e.target.value)}
          readOnly={!isEditable}
          className={!isEditable ? 'bg-muted/50' : ''}
        />
      </div>

      {/* Non-Conformity Details (Editable by Admin in Draft state) */}
      <div className="space-y-2">
        <Label htmlFor="nonConformityDetails">Non-Conformity Details (Required)</Label>
        <Textarea
          id="nonConformityDetails"
          placeholder="Describe the non-conformity..."
          value={report.section1.nonConformityDetails}
          onChange={(e) => handleSection1InputChange('nonConformityDetails', e.target.value)}
          readOnly={!isEditable}
          className={!isEditable ? 'bg-muted/50 min-h-[100px]' : 'min-h-[100px]'}
        />
      </div>

      {/* Admin Actions (Locking Mechanism) */}
      {isAdmin && report.status === 'Draft' && (
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
      
      {/* Display locked status for users */}
      {!isEditable && report.status !== 'Draft' && (
        <p className="text-sm text-green-600 font-medium">Section 1 is finalized and locked.</p>
      )}
    </div>
  );
};

export default Section1Details;