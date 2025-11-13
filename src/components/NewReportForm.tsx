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
  
  const handleCreate = () => {
    if (!name.trim() || !departmentId || !clauseId || !iqrNumberId) {
      toast.error("Please fill in all required fields (Report Name, Department, Clause ID, IQR Number).");
      return;
    }

    onCreate({
      name: name.trim(),
      departmentId,
      clauseId,
      iqrNumberId,
    });

    // Reset form
    setName('');
    setDepartmentId('');
    setClauseId('');
    setIqrNumberId('');
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
        
        <Button onClick={handleCreate} className="w-full mt-4">
          <PlusCircle className="mr-2 h-4 w-4" /> Create Report
        </Button>
      </CardContent>
    </Card>
  );
};

export default NewReportForm;