import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pencil, Trash2, PlusCircle, Save, X } from 'lucide-react';
import { SetupItem } from '@/lib/data-storage';
import { toast } from 'sonner';

interface SetupListManagerProps {
  title: string;
  data: SetupItem[];
  onSave: (data: SetupItem[]) => void;
  itemName: string;
}

const SetupListManager: React.FC<SetupListManagerProps> = ({ title, data: initialData, onSave, itemName }) => {
  const [data, setData] = useState<SetupItem[]>(initialData);
  const [newItemName, setNewItemName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  React.useEffect(() => {
    setData(initialData);
  }, [initialData]);

  const handleAddItem = () => {
    if (newItemName.trim() === '') {
      toast.error(`Please enter a valid ${itemName} name.`);
      return;
    }
    
    const newItem: SetupItem = {
      id: Date.now().toString(),
      name: newItemName.trim(),
    };
    
    const updatedData = [...data, newItem];
    setData(updatedData);
    onSave(updatedData);
    setNewItemName('');
    toast.success(`${itemName} added successfully.`);
  };

  const handleDeleteItem = (id: string) => {
    const updatedData = data.filter(item => item.id !== id);
    setData(updatedData);
    onSave(updatedData);
    toast.success(`${itemName} deleted successfully.`);
  };

  const handleStartEdit = (item: SetupItem) => {
    setEditingId(item.id);
    setEditingName(item.name);
  };

  const handleSaveEdit = () => {
    if (editingName.trim() === '') {
      toast.error(`Please enter a valid ${itemName} name.`);
      return;
    }
    
    const updatedData = data.map(item => 
      item.id === editingId ? { ...item, name: editingName.trim() } : item
    );
    
    setData(updatedData);
    onSave(updatedData);
    setEditingId(null);
    setEditingName('');
    toast.success(`${itemName} updated successfully.`);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex space-x-2 mb-6">
          <Input
            placeholder={`New ${itemName} Name`}
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
          />
          <Button onClick={handleAddItem}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add {itemName}
          </Button>
        </div>

        <div className="max-h-96 overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{itemName}</TableHead>
                <TableHead className="w-[150px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={2} className="text-center text-muted-foreground">
                    No {itemName}s defined yet.
                  </TableCell>
                </TableRow>
              ) : (
                data.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      {editingId === item.id ? (
                        <Input
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit()}
                        />
                      ) : (
                        item.name
                      )}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      {editingId === item.id ? (
                        <>
                          <Button variant="ghost" size="icon" onClick={handleSaveEdit}>
                            <Save className="h-4 w-4 text-green-600" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => setEditingId(null)}>
                            <X className="h-4 w-4 text-red-600" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button variant="ghost" size="icon" onClick={() => handleStartEdit(item)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteItem(item.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default SetupListManager;