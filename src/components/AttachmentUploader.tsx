import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileText, Trash2, Upload } from 'lucide-react';
import { toast } from 'sonner';

interface AttachmentUploaderProps {
  attachments: string[];
  onAttachmentsChange: (newAttachments: string[]) => void;
  isEditable: boolean;
}

const AttachmentUploader: React.FC<AttachmentUploaderProps> = ({ attachments, onAttachmentsChange, isEditable }) => {
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!isEditable) return;

    const files = event.target.files;
    if (files && files.length > 0) {
      // Simulate file upload by storing file names
      const newFileNames = Array.from(files).map(file => file.name);
      
      const updatedAttachments = [...attachments, ...newFileNames];
      onAttachmentsChange(updatedAttachments);
      toast.success(`${newFileNames.length} file(s) added.`);
      
      // Reset input value so the same file can be selected again
      event.target.value = '';
    }
  };

  const handleRemoveAttachment = (fileName: string) => {
    if (!isEditable) return;
    const updatedAttachments = attachments.filter(name => name !== fileName);
    onAttachmentsChange(updatedAttachments);
    toast.info(`Attachment '${fileName}' removed.`);
  };

  return (
    <div className="space-y-4">
      <Label className="text-base font-semibold">Attachments (Supporting Evidence)</Label>
      
      {isEditable && (
        <div className="flex items-center space-x-2">
          <Input 
            id="file-upload" 
            type="file" 
            multiple 
            onChange={handleFileChange} 
            className="flex-1"
          />
          <Button variant="outline" asChild>
            <label htmlFor="file-upload" className="cursor-pointer flex items-center">
              <Upload className="mr-2 h-4 w-4" /> Upload Files
            </label>
          </Button>
        </div>
      )}

      {attachments.length > 0 && (
        <div className="space-y-2 p-3 border rounded-md bg-background/50">
          <p className="text-sm font-medium text-muted-foreground">Current Attachments:</p>
          {attachments.map((fileName, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-secondary/50 rounded-sm">
              <div className="flex items-center truncate">
                <FileText className="h-4 w-4 mr-2 text-primary" />
                <span className="text-sm truncate">{fileName}</span>
              </div>
              {isEditable && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => handleRemoveAttachment(fileName)}
                  className="h-6 w-6 text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
      
      {!isEditable && attachments.length === 0 && (
        <p className="text-sm text-muted-foreground italic">No attachments provided for this section.</p>
      )}
    </div>
  );
};

export default AttachmentUploader;