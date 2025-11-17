import React from 'react';
import SetupListManager from '@/components/SetupListManager';
import { getNonConformityTypes, saveNonConformityTypes, SetupItem } from '@/lib/data-storage';

const NonconformityTypeSetup = () => {
  const [nonConformityTypes, setNonConformityTypes] = React.useState<SetupItem[]>([]);

  React.useEffect(() => {
    setNonConformityTypes(getNonConformityTypes());
  }, []);

  const handleSave = (data: SetupItem[]) => {
    saveNonConformityTypes(data);
    setNonConformityTypes(data);
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Nonconformity Type Setup</h2>
      <SetupListManager
        title="Manage Nonconformity Types"
        data={nonConformityTypes}
        onSave={handleSave}
        itemName="Nonconformity Type"
      />
    </div>
  );
};

export default NonconformityTypeSetup;