import React from 'react';
import SetupListManager from '@/components/SetupListManager';
import { getIQRNumbers, saveIQRNumbers, SetupItem } from '@/lib/data-storage';

const IQRNumberSetup = () => {
  const [iqrNumbers, setIqrNumbers] = React.useState<SetupItem[]>([]);

  React.useEffect(() => {
    setIqrNumbers(getIQRNumbers());
  }, []);

  const handleSave = (data: SetupItem[]) => {
    saveIQRNumbers(data);
    setIqrNumbers(data);
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">IQR Number Setup</h2>
      <SetupListManager
        title="Manage IQR Numbers"
        data={iqrNumbers}
        onSave={handleSave}
        itemName="IQR Number"
      />
    </div>
  );
};

export default IQRNumberSetup;