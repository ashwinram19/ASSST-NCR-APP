import React from 'react';
import SetupListManager from '@/components/SetupListManager';
import { getClauseIDs, saveClauseIDs, SetupItem } from '@/lib/data-storage';

const ClauseIDSetup = () => {
  const [clauseIDs, setClauseIDs] = React.useState<SetupItem[]>([]);

  React.useEffect(() => {
    setClauseIDs(getClauseIDs());
  }, []);

  const handleSave = (data: SetupItem[]) => {
    saveClauseIDs(data);
    setClauseIDs(data);
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Clause ID Setup</h2>
      <SetupListManager
        title="Manage Clause IDs"
        data={clauseIDs}
        onSave={handleSave}
        itemName="Clause ID"
      />
    </div>
  );
};

export default ClauseIDSetup;