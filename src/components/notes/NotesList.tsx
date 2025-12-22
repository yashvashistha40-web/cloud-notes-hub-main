import { Search, Star, X } from 'lucide-react';
import { useState } from 'react';
import { useNotes, Note } from '@/context/NotesContext';
import { format } from 'date-fns';

interface NotesListProps {
  filter: 'all' | 'favorites' | 'trash';
}

export default function NotesList({ filter }: NotesListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const { getFilteredNotes, selectedNoteId, openAndSelectNote, toggleFavorite, deleteNote } = useNotes();

  const notes = getFilteredNotes(filter).filter((note) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    const title = (note.title || '').toLowerCase();
    const content = (note.content || '').toLowerCase();
    return title.includes(q) || content.includes(q);
  });

  const getFilterTitle = () => {
    switch (filter) {
      case 'favorites':
        return 'Favorites';
      case 'trash':
        return 'Trash';
      default:
        return 'All Notes';
    }
  };

  return (
    <div className="w-72 bg-card h-screen flex flex-col border-r border-border">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground mb-4">{getFilterTitle()}</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for notes"
            className="w-full pl-10 pr-4 py-2.5 bg-secondary/50 border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
          />
        </div>
      </div>

      {/* Notes List */}
      <div className="flex-1 overflow-y-auto p-2">
        {notes.length === 0 ? (
          <div className="text-center text-muted-foreground py-8 text-sm">
            {searchQuery ? 'No notes found' : 'No notes yet'}
          </div>
        ) : (
          <div className="space-y-1">
            {notes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                isSelected={selectedNoteId === note.id}
                onSelect={async () => {
                  try {
                    await openAndSelectNote(note.id);
                  } catch (err) {
                    console.error('Failed to open note:', err);
                  }
                }}
                onToggleFavorite={() => toggleFavorite(note.id)}
                onDelete={() => deleteNote(note.id)}
                isTrash={filter === 'trash'}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface NoteCardProps {
  note: Note;
  isSelected: boolean;
  onSelect: () => void;
  onToggleFavorite: () => void;
  onDelete: () => void;
  isTrash: boolean;
}

function NoteCard({ note, isSelected, onSelect, onToggleFavorite, onDelete, isTrash }: NoteCardProps) {
  return (
    <div
      onClick={onSelect}
      className={`note-card group ${isSelected ? 'selected' : ''}`}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onSelect();
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-medium text-foreground text-sm line-clamp-1 flex-1">
          {note.title || 'Untitled'}
        </h3>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {!isTrash && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite();
              }}
              className="p-1 rounded hover:bg-secondary transition-colors"
              aria-label={note.isFavorite ? 'Unfavorite' : 'Favorite'}
            >
              <Star
                className={`w-4 h-4 ${
                  note.isFavorite ? 'fill-accent text-accent' : 'text-muted-foreground'
                }`}
              />
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-1 rounded hover:bg-destructive/10 transition-colors"
            aria-label="Delete note"
          >
            <X className="w-4 h-4 text-muted-foreground hover:text-destructive" />
          </button>
        </div>
      </div>

      {/* <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
        {note.content || 'No content'}
      </p> */}

      <p className="text-xs text-muted-foreground/60 mt-2">
        {format(new Date(note.updatedAt), 'MMM d, yyyy')}
      </p>
    </div>
  );
}
