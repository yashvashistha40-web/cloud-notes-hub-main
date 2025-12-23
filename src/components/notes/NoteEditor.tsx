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

  /* ===============================
     CURSOR FIX (UNCHANGED)
     =============================== */
  useEffect(() => {
    if (!editorRef.current) return;

    if (!selectedNote) {
      setTitle('');
      editorRef.current.innerHTML = '';
      return;
    }

    setTitle(selectedNote.title);

    if (editorRef.current.innerHTML !== selectedNote.content) {
      editorRef.current.innerHTML = selectedNote.content;
    }
  }, [selectedNoteId]);

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
      debouncedUpdate(selectedNoteId, {
        content: editorRef.current.innerHTML,
      });
    }
  };

  const handleSave = () => {
    if (selectedNoteId && editorRef.current) {
      updateNote(selectedNoteId, {
        title,
        content: editorRef.current.innerHTML,
      });
      toast.success('Note saved');
    }
  };

  /* ===============================
     ✅ UPDATED AI SUGGESTION CODE
     =============================== */
     const handleAISuggest = async () => {
  if (!editorRef.current) return;

  const text = editorRef.current.innerText.trim();
  if (!text) {
    toast.error('Nothing to improve');
    return;
  }

  try {
    toast.loading('AI is improving your note...', { id: 'ai' });

    const res = await fetch(
      'https://fkd2b5br2b.execute-api.ap-south-1.amazonaws.com/ps/notes/aiHelper',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'AI failed');
    }

    // ✅ SAFE RESPONSE HANDLING
    let suggestionText = '';

    if (typeof data.suggestion === 'string') {
      suggestionText = data.suggestion;
    } else if (Array.isArray(data.suggestions)) {
      suggestionText = data.suggestions.join(' ');
    }

    if (!suggestionText.trim()) {
      throw new Error('AI returned empty response');
    }

    editorRef.current.innerText = suggestionText;

    if (selectedNoteId) {
      updateNote(selectedNoteId, {
        content: editorRef.current.innerHTML,
      });
    }

    toast.success('AI suggestion applied', { id: 'ai' });
  } catch (err: any) {
    toast.error(err.message || 'AI error', { id: 'ai' });
  }
};

  // const handleAISuggest = async () => {
  //   if (!editorRef.current) return;

  //   const text = editorRef.current.innerText.trim();
  //   if (!text) {
  //     toast.error('Nothing to improve');
  //     return;
  //   }

  //   try {
  //     toast.loading('AI is improving your note...', { id: 'ai' });

  //     const res = await fetch(
  //       'https://fkd2b5br2b.execute-api.ap-south-1.amazonaws.com/ps/notes/aiHelper',
  //       {
  //         method: 'POST',
  //         headers: { 'Content-Type': 'application/json' },
  //         body: JSON.stringify({ text, mode: 'improve' }),
  //       }
  //     );

  //     const data = await res.json();

  //     if (!res.ok) throw new Error(data.error || 'AI failed');

  //     editorRef.current.innerText = data.suggestion;

  //     if (selectedNoteId) {
  //       updateNote(selectedNoteId, {
  //         content: editorRef.current.innerHTML,
  //       });
  //     }

  //     toast.success('AI suggestion applied', { id: 'ai' });
  //   } catch (err: any) {
  //     toast.error(err.message || 'AI error', { id: 'ai' });
  //   }
  // };

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
          <h3 className="text-xl font-semibold mb-2">No note selected</h3>
          <p className="text-muted-foreground">Select or create a note</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 h-screen flex flex-col">
      <div className="p-4 border-b flex justify-between">
        <span className="text-sm text-muted-foreground">Auto-save enabled</span>
        <div className="flex gap-2">
          <button
            onClick={handleAISuggest}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary to-purple-500 text-white rounded-lg"
          >
            <Sparkles className="w-4 h-4" />
            AI Suggest
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 bg-secondary rounded-lg"
          >
            <Save className="w-4 h-4" />
            Save
          </button>
        </div>
      </div>

      <EditorToolbar onFileAttach={handleFileAttach} />

      <div className="flex-1 p-6 overflow-y-auto">
        <input
          value={title}
          onChange={handleTitleChange}
          placeholder="Note title..."
          className="w-full text-3xl font-bold mb-6 bg-transparent outline-none"
        />
        <div
          ref={editorRef}
          contentEditable
          onInput={handleContentChange}
          className="min-h-[300px] border rounded-lg p-4"
          style={{ whiteSpace: 'pre-wrap' }}
        />
      </div>

      <FileAttachments
        attachments={selectedNote.attachments}
        onRemove={handleRemoveAttachment}
      />
    </div>
  );
}
