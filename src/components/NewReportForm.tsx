import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle } from 'lucide-react';
import { toast } from 'sonner';

interface NewReportFormProps {
  onCreate: (reportData: {
    name: string;
    section1: {
      departmentId: string;
      clauseId: string;
      iqrNumberId: string;
    }
  }) => void;
}

const NewReportForm: React.FC<NewReportFormProps> = ({ onCreate }) => {
  const [name, setName] = useState('');
  
  const handleCreate = () => {
    if (!name.trim()) {
      toast.error("Please enter a Report Name.");
      return;
    }

    onCreate({
      name: name.trim(),
      section1: {
        departmentId: '', // Initialized empty
        clauseId: '',     // Initialized empty
        iqrNumberId: '',  // Initialized empty
      }
    });

    // Reset form
    setName('');
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
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
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