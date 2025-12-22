import { File, X, Download, Image, FileText, FileArchive, FileAudio, FileVideo } from 'lucide-react';
import { NoteAttachment } from '@/context/NotesContext';

interface FileAttachmentsProps {
  attachments: NoteAttachment[];
  onRemove: (id: string) => void;
}

const getFileIcon = (type: string) => {
  if (type.startsWith('image/')) return Image;
  if (type.startsWith('audio/')) return FileAudio;
  if (type.startsWith('video/')) return FileVideo;
  if (type.includes('zip') || type.includes('rar') || type.includes('tar')) return FileArchive;
  if (type.includes('pdf') || type.includes('doc') || type.includes('text')) return FileText;
  return File;
};

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

export default function FileAttachments({ attachments, onRemove }: FileAttachmentsProps) {
  if (attachments.length === 0) return null;

  const handleDownload = (attachment: NoteAttachment) => {
    const link = document.createElement('a');
    link.href = attachment.url;
    link.download = attachment.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="border-t border-border p-4">
      <h4 className="text-sm font-medium text-foreground mb-3">
        Attachments ({attachments.length})
      </h4>
      <div className="flex flex-wrap gap-2">
        {attachments.map((attachment) => {
          const IconComponent = getFileIcon(attachment.type);
          const isImage = attachment.type.startsWith('image/');

          return (
            <div
              key={attachment.id}
              className="group relative flex items-center gap-2 p-2 pr-8 bg-muted rounded-lg border border-border hover:border-primary/50 transition-colors max-w-xs"
            >
              {isImage ? (
                <img
                  src={attachment.url}
                  alt={attachment.name}
                  className="w-10 h-10 object-cover rounded"
                />
              ) : (
                <div className="w-10 h-10 flex items-center justify-center bg-background rounded">
                  <IconComponent className="w-5 h-5 text-muted-foreground" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground truncate">{attachment.name}</p>
                <p className="text-xs text-muted-foreground">{formatFileSize(attachment.size)}</p>
              </div>
              <div className="absolute right-1 top-1 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleDownload(attachment)}
                  className="p-1 rounded hover:bg-background text-muted-foreground hover:text-foreground transition-colors"
                  title="Download"
                >
                  <Download className="w-3 h-3" />
                </button>
                <button
                  onClick={() => onRemove(attachment.id)}
                  className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                  title="Remove"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
