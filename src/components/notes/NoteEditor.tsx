import { useEffect, useState, useCallback, useRef } from 'react';
import { Save, Sparkles, FileText } from 'lucide-react';
import { useNotes } from '@/context/NotesContext';
import { toast } from 'sonner';
import debounce from '@/lib/debounce';
import EditorToolbar from './EditorToolbar';
import FileAttachments from './FileAttachments';

export default function NoteEditor() {
  const { notes, selectedNoteId, updateNote, addAttachment, removeAttachment } = useNotes();
  const [title, setTitle] = useState('');
  const editorRef = useRef<HTMLDivElement>(null);

  const selectedNote = notes.find((n) => n.id === selectedNoteId);

  useEffect(() => {
    if (selectedNote) {
      setTitle(selectedNote.title);
      if (editorRef.current) {
        editorRef.current.innerHTML = selectedNote.content;
      }
    } else {
      setTitle('');
      if (editorRef.current) {
        editorRef.current.innerHTML = '';
      }
    }
  }, [selectedNote]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedUpdate = useCallback(
    debounce((id: string, updates: { title?: string; content?: string }) => {
      updateNote(id, updates);
    }, 500),
    [updateNote]
  );

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    if (selectedNoteId) {
      debouncedUpdate(selectedNoteId, { title: newTitle });
    }
  };

  const handleContentChange = () => {
    if (selectedNoteId && editorRef.current) {
      const newContent = editorRef.current.innerHTML;
      debouncedUpdate(selectedNoteId, { content: newContent });
    }
  };

  const handleSave = () => {
    if (selectedNoteId && editorRef.current) {
      updateNote(selectedNoteId, { title, content: editorRef.current.innerHTML });
      toast.success('Note saved');
    }
  };

  const handleAISuggest = () => {
    toast.info('AI suggestions coming soon!', {
      description: 'This feature will be powered by AWS Lambda.',
    });
  };

  const handleFileAttach = (files: FileList) => {
    if (selectedNoteId) {
      addAttachment(selectedNoteId, files);
      toast.success(`${files.length} file(s) attached`);
    }
  };

  const handleRemoveAttachment = (attachmentId: string) => {
    if (selectedNoteId) {
      removeAttachment(selectedNoteId, attachmentId);
      toast.success('Attachment removed');
    }
  };

  if (!selectedNote) {
    return (
      <div className="flex-1 bg-background h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-muted flex items-center justify-center">
            <FileText className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">No note selected</h3>
          <p className="text-muted-foreground">Select a note from the list or create a new one</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-background h-screen flex flex-col">
      {/* Top Toolbar */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Auto-save enabled</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleAISuggest}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary to-purple-500 text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Sparkles className="w-4 h-4" />
            AI Suggest
          </button>
          <button
            onClick={handleSave}
            className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium hover:bg-secondary/80 transition-colors"
          >
            <Save className="w-4 h-4" />
            Save
          </button>
        </div>
      </div>

      {/* Formatting Toolbar */}
      <EditorToolbar onFileAttach={handleFileAttach} />

      {/* Editor */}
      <div className="flex-1 p-6 overflow-y-auto flex flex-col">
        <input
          type="text"
          value={title}
          onChange={handleTitleChange}
          placeholder="Note title..."
          className="w-full text-3xl font-bold text-foreground bg-transparent border-none outline-none placeholder:text-muted-foreground/50 mb-6"
        />
        <div
          ref={editorRef}
          contentEditable
          onInput={handleContentChange}
          className="flex-1 min-h-[300px] text-foreground bg-transparent border border-border rounded-lg p-4 outline-none focus:border-primary/50 transition-colors leading-relaxed overflow-y-auto"
          style={{ whiteSpace: 'pre-wrap' }}
          data-placeholder="Start writing your note..."
        />
      </div>

      {/* File Attachments */}
      <FileAttachments 
        attachments={selectedNote.attachments} 
        onRemove={handleRemoveAttachment} 
      />
    </div>
  );
}
