import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, FileText, Upload } from 'lucide-react';
import { toast } from 'sonner';
import PdfTextDisplay from '@/components/PdfTextDisplay';

interface AttachmentManagerProps {
  notes: string;
  onUpdateNotes: (notes: string) => void;
  isEditable: boolean;
  isPdfExporting: boolean;
}

// Helper to convert notes string (newline separated) to array
const notesToArray = (notes: string): string[] => 
  notes.split('\n').map(s => s.trim()).filter(s => s.length > 0);

// Helper to convert array back to notes string
const arrayToNotes = (arr: string[]): string => 
  arr.join('\n');

const AttachmentManager: React.FC<AttachmentManagerProps> = ({ notes, onUpdateNotes, isEditable, isPdfExporting }) => {
  const attachments = notesToArray(notes);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!isEditable) return;
    const file = event.target.files?.[0];
    
    if (file) {
      const fileName = file.name;
      
      // Simulate upload by recording the file name
      const updatedAttachments = [...attachments, fileName];
      onUpdateNotes(arrayToNotes(updatedAttachments));
      
      toast.success(`File selected (simulated upload): ${fileName}`);
      
      // Clear the input value so the same file can be selected again if needed
      event.target.value = ''; 
    }
  };

  const handleDeleteAttachment = (index: number) => {
    if (!isEditable) return;
    const updatedAttachments = attachments.filter((_, i) => i !== index);
    onUpdateNotes(arrayToNotes(updatedAttachments));
    toast.success("Attachment removed.");
  };

  if (isPdfExporting) {
    return (
        <div className="space-y-2">
            <Label>Attachments / Verification Notes</Label>
            {attachments.length === 0 ? (
                <PdfTextDisplay value="No attachments documented." />
            ) : (
                <ul className="list-disc pl-5 space-y-1">
                    {attachments.map((attachment, index) => (
                        <li key={index} className="text-sm">
                            {attachment}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
  }

  return (
    <div className="space-y-4">
      <Label>Attachments (Admin Only)</Label>
      
      {isEditable && (
        <div className="flex items-center space-x-2">
          <Input
            id="file-upload"
            type="file"
            onChange={handleFileSelect}
            className="hidden"
            disabled={!isEditable}
          />
          <Label htmlFor="file-upload" className="cursor-pointer">
            <Button asChild disabled={!isEditable}>
              <div>
                <Upload className="mr-2 h-4 w-4" /> Select File to Attach
              </div>
            </Button>
          </Label>
          <p className="text-sm text-muted-foreground">
            (Only the file name is recorded for now)
          </p>
        </div>
      )}

      <div className="space-y-2 border rounded-md p-4 bg-background/50">
        {attachments.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {isEditable ? "No attachments documented yet. Select a file above." : "No attachments documented."}
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