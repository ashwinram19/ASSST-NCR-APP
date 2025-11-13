import React from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

const AdminDashboard = () => {
  // This will eventually hold the list of reports (Step 1. Admin Landing Page)
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Admin Report Management</h1>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Add New Report
        </Button>
      </div>
      
      <p className="text-lg text-muted-foreground">
        Use the sidebar to complete initial setup (Departments, Clause ID, IQR Number) before creating reports.
      </p>
      
      {/* Report List will go here */}
      <div className="mt-8 p-4 border rounded-lg bg-card">
        <h2 className="text-xl font-semibold mb-4">Existing Reports (Coming Soon)</h2>
        <p className="text-muted-foreground">Report listing and management features will be implemented here in the next step.</p>
      </div>
    </div>
  );
};

export default AdminDashboard;