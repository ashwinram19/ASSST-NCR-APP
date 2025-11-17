import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, FileText, PlusCircle } from 'lucide-react';
import { toast } from 'sonner';

interface AttachmentManagerProps {
  notes: string;
  onUpdateNotes: (notes: string) => void;
  isEditable: boolean;
}

// Helper to convert notes string (newline separated) to array
const notesToArray = (notes: string): string[] => 
  notes.split('\n').map(s => s.trim()).filter(s => s.length > 0);

// Helper to convert array back to notes string
const arrayToNotes = (arr: string[]): string => 
  arr.join('\n');

const AttachmentManager: React.FC<AttachmentManagerProps> = ({ notes, onUpdateNotes, isEditable }) => {
  const [newAttachmentName, setNewAttachmentName] = useState('');
  const attachments = notesToArray(notes);

  const handleAddAttachment = () => {
    if (!isEditable) return;
    if (newAttachmentName.trim() === '') {
      toast.error("Please enter a file name or description.");
      return;
    }

    const updatedAttachments = [...attachments, newAttachmentName.trim()];
    onUpdateNotes(arrayToNotes(updatedAttachments));
    setNewAttachmentName('');
    toast.success(`Simulated file added: ${newAttachmentName.trim()}`);
  };

  const handleDeleteAttachment = (index: number) => {
    if (!isEditable) return;
    const updatedAttachments = attachments.filter((_, i) => i !== index);
    onUpdateNotes(arrayToNotes(updatedAttachments));
    toast.success("Attachment removed.");
  };

  return (
    <div className="space-y-4">
      <Label>Simulated Attachments (Admin Only)</Label>
      
      {isEditable && (
        <div className="flex space-x-2">
          <Input
            placeholder="Enter file name or description (e.g., 'Verification Photo 1.jpg')"
            value={newAttachmentName}
            onChange={(e) => setNewAttachmentName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddAttachment()}
            disabled={!isEditable}
          />
          <Button onClick={handleAddAttachment} disabled={!isEditable} className="shrink-0">
            <PlusCircle className="mr-2 h-4 w-4" /> Add File
          </Button>
        </div>
      )}

      <div className="space-y-2 border rounded-md p-4 bg-background/50">
        {attachments.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {isEditable ? "No attachments documented yet. Use the input above to add notes." : "No attachments documented."}
          </p>
        ) : (
          attachments.map((attachment, index) => (
            <div key={index} className="flex items-center justify-between p-2 border-b last:border-b-0">
              <div className="flex items-center space-x-2">
                <FileText className="h-4 w-4 text-primary" />
                <span className="text-sm">{attachment}</span>
              </div>
              {isEditable && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => handleDeleteAttachment(index)}
                  className="text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))
        )}
      </div>
      
      {!isEditable && attachments.length > 0 && (
        <p className="text-xs text-muted-foreground">
            Note: Attachments are read-only in this status.
        </p>
      )}
    </div>
  );
};

export default AttachmentManager;