import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, FileText, PlusCircle, Image, Link } from 'lucide-react';
import { toast } from 'sonner';
import { Attachment } from '@/lib/report-storage';
import { Textarea } from '@/components/ui/textarea';

interface AttachmentManagerProps {
  attachments: Attachment[];
  onUpdateAttachments: (attachments: Attachment[]) => void;
  isEditable: boolean;
}

// Helper function to check if a string is a valid image URL or Base64 data URL
const isImageContent = (content: string): boolean => {
  return content.startsWith('http') || content.startsWith('data:image');
};

const AttachmentManager: React.FC<AttachmentManagerProps> = ({ attachments, onUpdateAttachments, isEditable }) => {
  const [newAttachmentName, setNewAttachmentName] = useState('');
  const [newAttachmentContent, setNewAttachmentContent] = useState('');
  const [showContentInput, setShowContentInput] = useState(false);

  const handleAddAttachment = () => {
    if (!isEditable) return;
    const name = newAttachmentName.trim();
    const content = newAttachmentContent.trim();

    if (name === '') {
      toast.error("Please enter a file name or description.");
      return;
    }
    
    let type: Attachment['type'] = 'text';
    let finalContent = name;

    if (showContentInput && content !== '') {
        finalContent = content;
        if (isImageContent(content)) {
            type = 'image';
        }
    }

    const newItem: Attachment = {
      id: Date.now().toString() + Math.random().toString(),
      name: name,
      type: type,
      content: finalContent,
    };

    const updatedAttachments = [...attachments, newItem];
    onUpdateAttachments(updatedAttachments);
    
    setNewAttachmentName('');
    setNewAttachmentContent('');
    setShowContentInput(false);
    toast.success(`Attachment added: ${name}`);
  };

  const handleDeleteAttachment = (id: string) => {
    if (!isEditable) return;
    const updatedAttachments = attachments.filter(item => item.id !== id);
    onUpdateAttachments(updatedAttachments);
    toast.success("Attachment removed.");
  };

  const renderAttachmentItem = (item: Attachment) => {
    const isImage = item.type === 'image' && isImageContent(item.content);
    
    return (
      <div key={item.id} className="flex flex-col p-3 border-b last:border-b-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {isImage ? <Image className="h-4 w-4 text-blue-500" /> : <FileText className="h-4 w-4 text-primary" />}
            <span className="text-sm font-medium">{item.name}</span>
          </div>
          {isEditable && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => handleDeleteAttachment(item.id)}
              className="text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        {isImage && (
          <div className="mt-2 p-2 border rounded-md bg-gray-50 dark:bg-gray-700">
            <p className="text-xs text-muted-foreground mb-1">Image Preview:</p>
            <img 
              src={item.content} 
              alt={item.name} 
              className="max-w-full h-auto max-h-40 object-contain rounded"
              onError={(e) => {
                (e.target as HTMLImageElement).onerror = null; 
                (e.target as HTMLImageElement).src = 'public/placeholder.svg'; // Fallback
              }}
            />
          </div>
        )}
        {!isImage && item.content !== item.name && (
            <div className="mt-2 text-xs text-muted-foreground flex items-center space-x-1">
                <Link className="h-3 w-3" />
                <span>Content/Link: {item.content.substring(0, 50)}...</span>
            </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <Label>Simulated Attachments (Admin Only)</Label>
      
      {isEditable && (
        <Card className="p-4 space-y-3">
            <div className="space-y-2">
                <Label htmlFor="attachmentName">Attachment Name/Description</Label>
                <Input
                    id="attachmentName"
                    placeholder="e.g., Verification Photo 1.jpg"
                    value={newAttachmentName}
                    onChange={(e) => setNewAttachmentName(e.target.value)}
                    disabled={!isEditable}
                />
            </div>
            
            <div className="flex items-center space-x-2">
                <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setShowContentInput(!showContentInput)}
                    className="w-full"
                >
                    {showContentInput ? 'Hide Content Input' : 'Add Image URL / Base64 / Link'}
                </Button>
            </div>

            {showContentInput && (
                <div className="space-y-2">
                    <Label htmlFor="attachmentContent">Image URL / Base64 / Link</Label>
                    <Textarea
                        id="attachmentContent"
                        placeholder="Paste image URL, Base64 data, or a document link here..."
                        value={newAttachmentContent}
                        onChange={(e) => setNewAttachmentContent(e.target.value)}
                        disabled={!isEditable}
                        className="min-h-[80px]"
                    />
                    <p className="text-xs text-muted-foreground">
                        If content is a valid image URL or Base64 string, a preview will be shown. Otherwise, it is stored as a link/text.
                    </p>
                </div>
            )}

            <Button onClick={handleAddAttachment} disabled={!isEditable} className="w-full">
                <PlusCircle className="mr-2 h-4 w-4" /> Add Attachment
            </Button>
        </Card>
      )}

      <div className="space-y-2 border rounded-md bg-background/50">
        {attachments.length === 0 ? (
          <p className="text-sm text-muted-foreground p-4 text-center">
            {isEditable ? "No attachments documented yet." : "No attachments documented."}
          </p>
        ) : (
          attachments.map(renderAttachmentItem)
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