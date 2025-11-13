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

  const handleInputChange = (field: keyof NCARReport['section1'], value: string | boolean) => {
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

    // Check if required fields are filled before attempting to lock
    if (!updatedSection1.departmentId || !updatedSection1.clauseId || !updatedSection1.iqrNumberId || !updatedSection1.nonConformityDetails) {
        toast.error("Please fill all identification and non-conformity details before locking Section 1.");
        return;
    }

    const isReadyToLock = updatedSection1.adminAcknowledged && updatedSection1.adminSentMail;

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
      <h3 className="text-lg font-semibold">Report Identification</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Department */}
        <div className="space-y-2">
          <Label htmlFor="department">Department</Label>
          {isEditable ? (
            <Select
              value={report.section1.departmentId}
              onValueChange={(value) => handleInputChange('departmentId', value)}
              disabled={!isEditable}
            >
              <SelectTrigger id="department">
                <SelectValue placeholder="Select Department" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Input readOnly value={findNameById(report.section1.departmentId, departments)} />
          )}
        </div>

        {/* Clause ID */}
        <div className="space-y-2">
          <Label htmlFor="clauseId">Clause ID</Label>
          {isEditable ? (
            <Select
              value={report.section1.clauseId}
              onValueChange={(value) => handleInputChange('clauseId', value)}
              disabled={!isEditable}
            >
              <SelectTrigger id="clauseId">
                <SelectValue placeholder="Select Clause ID" />
              </SelectTrigger>
              <SelectContent>
                {clauseIDs.map((clause) => (
                  <SelectItem key={clause.id} value={clause.id}>
                    {clause.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Input readOnly value={findNameById(report.section1.clauseId, clauseIDs)} />
          )}
        </div>

        {/* IQR Number */}
        <div className="space-y-2">
          <Label htmlFor="iqrNumber">IQR Number</Label>
          {isEditable ? (
            <Select
              value={report.section1.iqrNumberId}
              onValueChange={(value) => handleInputChange('iqrNumberId', value)}
              disabled={!isEditable}
            >
              <SelectTrigger id="iqrNumber">
                <SelectValue placeholder="Select IQR Number" />
              </SelectTrigger>
              <SelectContent>
                {iqrNumbers.map((iqr) => (
                  <SelectItem key={iqr.id} value={iqr.id}>
                    {iqr.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Input readOnly value={findNameById(report.section1.iqrNumberId, iqrNumbers)} />
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Date Raised */}
        <div className="space-y-2">
          <Label htmlFor="dateRaised">Date Raised</Label>
          <Input
            id="dateRaised"
            type="date"
            value={report.section1.dateRaised}
            onChange={(e) => handleInputChange('dateRaised', e.target.value)}
            readOnly={!isEditable}
            className={!isEditable ? 'bg-muted/50' : ''}
          />
        </div>
      </div>

      {/* Non-Conformity Details */}
      <div className="space-y-2">
        <Label htmlFor="nonConformityDetails">Non-Conformity Details</Label>
        <Textarea
          id="nonConformityDetails"
          placeholder="Describe the non-conformity..."
          value={report.section1.nonConformityDetails}
          onChange={(e) => handleInputChange('nonConformityDetails', e.target.value)}
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