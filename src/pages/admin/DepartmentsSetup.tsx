import React from 'react';
import SetupListManager from '@/components/SetupListManager';
import { getDepartments, saveDepartments, SetupItem } from '@/lib/data-storage';

const DepartmentsSetup = () => {
  const [departments, setDepartments] = React.useState<SetupItem[]>([]);

  React.useEffect(() => {
    setDepartments(getDepartments());
  }, []);

  const handleSave = (data: SetupItem[]) => {
    saveDepartments(data);
    setDepartments(data);
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Department Setup</h2>
      <SetupListManager
        title="Manage Departments"
        data={departments}
        onSave={handleSave}
        itemName="Department"
      />
    </div>
  );
};

export default DepartmentsSetup;