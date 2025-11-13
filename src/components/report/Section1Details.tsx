import React from 'react';
import { NCARReport } from '@/lib/report-storage';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Check, Mail, Lock } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getDepartments, getClauseIDs, getIQRNumbers, SetupItem } from '@/lib/data-storage';
import { toast } from 'sonner';

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

  // Helper to update fields that are now in the root of the report object
  const handleRootInputChange = (field: keyof NCARReport, value: string) => {
    if (!isEditable) return;
    onUpdate({
      ...report,
      [field]: value,
    });
  };

  // Helper to update fields that remain in section1
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

  const handleLockSection = (field: 'adminAcknowledged' | 'adminSentMail') => {
    if (!isAdmin || report.status !== 'Draft') return;

    const updatedSection1 = {
      ...report.section1,
      [field]: true,
    };

    // Check if required fields (now root-level) and nonConformityDetails are filled before attempting to lock
    if (!report.departmentId || !report.clauseId || !report.iqrNumberId || !report.personResponsible || !report.dateRaised || !updatedSection1.nonConformityDetails) {
        toast.error("Please ensure all Report Identification fields and Non-Conformity Details are filled before locking Section 1.");
        return;
    }

    const isReadyToLock = (field === 'adminAcknowledged' ? true : report.section1.adminAcknowledged) && 
                         (field === 'adminSentMail' ? true : report.section1.adminSentMail);

    if (isReadyToLock) {
      onUpdate({
        ...report,
        status: 'Section1Locked',
        section1: updatedSection1,
      });
      toast.success("Section 1 locked. Sections 2-5 are now editable by users.");
    } else {
      onUpdate({
        ...report,
        section1: updatedSection1,
      });
      toast.info(`Admin action recorded: ${field === 'adminSentMail' ? 'Mail Sent' : 'Acknowledged'}.`);
    }
  };

  const findNameById = (id: string, list: SetupItem[]) => list.find(item => item.id === id)?.name || 'N/A';

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Report Identification (Read-Only)</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Department */}
        <div className="space-y-2">
          <Label>Department</Label>
          <Input readOnly value={findNameById(report.departmentId, departments)} className="bg-muted/50" />
        </div>

        {/* Clause ID */}
        <div className="space-y-2">
          <Label>Clause ID</Label>
          <Input readOnly value={findNameById(report.clauseId, clauseIDs)} className="bg-muted/50" />
        </div>

        {/* IQR Number */}
        <div className="space-y-2">
          <Label>IQR Number</Label>
          <Input readOnly value={findNameById(report.iqrNumberId, iqrNumbers)} className="bg-muted/50" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Date Raised */}
        <div className="space-y-2">
          <Label>Date Raised</Label>
          <Input readOnly value={report.dateRaised} type="date" className="bg-muted/50" />
        </div>
        
        {/* Person Responsible */}
        <div className="space-y-2">
          <Label>Person Responsible</Label>
          <Input readOnly value={report.personResponsible} className="bg-muted/50" />
        </div>
      </div>

      {/* ISO 9001:2015 QMS Clause Reference */}
      <div className="space-y-2">
        <Label>ISO 9001:2015 QMS Clause Reference</Label>
        <Input readOnly value={report.qmsClauseReference} className="bg-muted/50" />
      </div>
      
      {/* Associated Risk/ Risk Type */}
      <div className="space-y-2">
        <Label>Associated Risk / Risk Type</Label>
        <Input readOnly value={report.associatedRisk} className="bg-muted/50" />
      </div>

      <h3 className="text-lg font-semibold pt-4 border-t">Non-Conformity Details</h3>
      
      {/* Non-Conformity Details (Editable by Admin in Draft state) */}
      <div className="space-y-2">
        <Label htmlFor="nonConformityDetails">Details</Label>
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
        <div className="pt-4 border-t flex space-x-4">
          <Button
            onClick={() => handleLockSection('adminSentMail')}
            disabled={report.section1.adminSentMail}
            variant={report.section1.adminSentMail ? 'secondary' : 'default'}
          >
            {report.section1.adminSentMail ? <Check className="mr-2 h-4 w-4" /> : <Mail className="mr-2 h-4 w-4" />}
            Send Mail
          </Button>
          <Button
            onClick={() => handleLockSection('adminAcknowledged')}
            disabled={report.section1.adminAcknowledged}
            variant={report.section1.adminAcknowledged ? 'secondary' : 'default'}
          >
            {report.section1.adminAcknowledged ? <Check className="mr-2 h-4 w-4" /> : <Lock className="mr-2 h-4 w-4" />}
            Acknowledgment
          </Button>
          <p className="text-sm text-muted-foreground self-center ml-4">
            {report.section1.adminSentMail && report.section1.adminAcknowledged
              ? 'Section 1 is locked.'
              : 'Click both buttons to lock Section 1 and enable Sections 2-5.'}
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