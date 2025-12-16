import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { NotesProvider } from '@/context/NotesContext';
import Sidebar from '@/components/notes/Sidebar';
import NotesList from '@/components/notes/NotesList';
import NoteEditor from '@/components/notes/NoteEditor';

export default function NotesDashboard() {
  const [activeFilter, setActiveFilter] = useState<'all' | 'favorites' | 'trash'>('all');
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <NotesProvider>
      <div className="flex h-screen overflow-hidden">
        <Sidebar activeFilter={activeFilter} setActiveFilter={setActiveFilter} />
        <NotesList filter={activeFilter} />
        <NoteEditor />
      </div>
    </NotesProvider>
  );
}
