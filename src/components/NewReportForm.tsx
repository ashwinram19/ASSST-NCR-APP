import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle } from 'lucide-react';
import { getDepartments, getClauseIDs, getIQRNumbers } from '@/lib/data-storage';
import { toast } from 'sonner';

interface NewReportFormProps {
  onCreate: (reportData: {
    name: string;
    departmentId: string;
    clauseId: string;
    iqrNumberId: string;
    dateRaised: string;
    qmsClauseReference: string;
    associatedRisk: string;
    personResponsible: string;
  }) => void;
}

const NewReportForm: React.FC<NewReportFormProps> = ({ onCreate }) => {
  const departments = getDepartments();
  const clauseIDs = getClauseIDs();
  const iqrNumbers = getIQRNumbers();

  const [name, setName] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [clauseId, setClauseId] = useState('');
  const [iqrNumberId, setIqrNumberId] = useState('');
  const [dateRaised, setDateRaised] = useState(new Date().toISOString().split('T')[0]);
  const [personResponsible, setPersonResponsible] = useState('');
  const [qmsClauseReference, setQmsClauseReference] = useState('');
  const [associatedRisk, setAssociatedRisk] = useState('');

  const handleCreate = () => {
    if (!name.trim() || !departmentId || !clauseId || !iqrNumberId || !dateRaised || !personResponsible) {
      toast.error("Please fill in all required Report Identification fields (Name, Department, Clause ID, IQR Number, Date Raised, Person Responsible).");
      return;
    }

    onCreate({
      name: name.trim(),
      departmentId,
      clauseId,
      iqrNumberId,
      dateRaised,
      personResponsible: personResponsible.trim(),
      qmsClauseReference: qmsClauseReference.trim(),
      associatedRisk: associatedRisk.trim(),
    });

    // Reset form
    setName('');
    setDepartmentId('');
    setClauseId('');
    setIqrNumberId('');
    setDateRaised(new Date().toISOString().split('T')[0]);
    setPersonResponsible('');
    setQmsClauseReference('');
    setAssociatedRisk('');
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Create New NC/CAR Report</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="reportName">Report Name (Required)</Label>
          <Input
            id="reportName"
            placeholder="e.g., NCAR-2024-001"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <h3 className="text-lg font-semibold pt-2 border-t">Report Identification</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Department */}
          <div className="space-y-2">
            <Label htmlFor="department">Department (Required)</Label>
            <Select
              value={departmentId}
              onValueChange={setDepartmentId}
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
          </div>

          {/* Clause ID */}
          <div className="space-y-2">
            <Label htmlFor="clauseId">Clause ID (Required)</Label>
            <Select
              value={clauseId}
              onValueChange={setClauseId}
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
          </div>

          {/* IQR Number */}
          <div className="space-y-2">
            <Label htmlFor="iqrNumber">IQR Number (Required)</Label>
            <Select
              value={iqrNumberId}
              onValueChange={setIqrNumberId}
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
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Date Raised */}
          <div className="space-y-2">
            <Label htmlFor="dateRaised">Date Raised (Required)</Label>
            <Input
              id="dateRaised"
              type="date"
              value={dateRaised}
              onChange={(e) => setDateRaised(e.target.value)}
            />
          </div>
          
          {/* Person Responsible */}
          <div className="space-y-2">
            <Label htmlFor="personResponsible">Person Responsible (Required)</Label>
            <Input
              id="personResponsible"
              type="text"
              placeholder="Name of person responsible"
              value={personResponsible}
              onChange={(e) => setPersonResponsible(e.target.value)}
            />
          </div>
        </div>

        {/* ISO 9001:2015 QMS Clause Reference */}
        <div className="space-y-2">
          <Label htmlFor="qmsClauseReference">ISO 9001:2015 QMS Clause Reference</Label>
          <Input
            id="qmsClauseReference"
            type="text"
            placeholder="e.g., 8.7.1"
            value={qmsClauseReference}
            onChange={(e) => setQmsClauseReference(e.target.value)}
          />
        </div>
        
        {/* Associated Risk/ Risk Type */}
        <div className="space-y-2">
          <Label htmlFor="associatedRisk">Associated Risk / Risk Type</Label>
          <Input
            id="associatedRisk"
            type="text"
            placeholder="e.g., Production Delay, Customer Complaint"
            value={associatedRisk}
            onChange={(e) => setAssociatedRisk(e.target.value)}
          />
        </div>

        <Button onClick={handleCreate} className="w-full mt-4">
          <PlusCircle className="mr-2 h-4 w-4" /> Create Report
        </Button>
      </CardContent>
    </Card>
  );
};

export default NewReportForm;