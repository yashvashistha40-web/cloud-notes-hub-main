import { FileText, Plus, Star, Trash2, Save, LogOut, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useNotes } from "@/context/NotesContext";
import { toast } from "sonner";

interface SidebarProps {
  activeFilter: "all" | "favorites" | "trash";
  setActiveFilter: (filter: "all" | "favorites" | "trash") => void;
}

export default function Sidebar({ activeFilter, setActiveFilter }: SidebarProps) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  // ✅ Notes context
  const {
    createNote,
    selectedNoteId,
    notes,
    deleteNoteUnified,
    updateNote,
  } = useNotes();

  const handleLogout = () => {
    logout();
    navigate("/");
    toast.success("Logged out successfully");
  };

  const handleNewNote = () => {
    createNote();
    setActiveFilter("all");
    toast.success("New note created");
  };

  const handleSave = () => {
    if (!selectedNoteId) {
      toast.info("No note selected");
      return;
    }

    const note = notes.find((n) => n.id === selectedNoteId);
    if (note) {
      updateNote(selectedNoteId, { updatedAt: new Date() });
      toast.success("Note saved");
    }
  };

  // ===============================
  // ✅ FIXED DELETE HANDLER
  // ===============================
  const handleDelete = async () => {
    if (!selectedNoteId) {
      toast.info("No note selected");
      return;
    }

    try {
      // ✅ Only pass noteId (email handled inside NotesContext)
      await deleteNoteUnified(selectedNoteId);
      toast.success("Note deleted");
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Failed to delete note");
    }
  };

  const menuItems = [
    { icon: FileText, label: "Notes", filter: "all" as const },
    { icon: Plus, label: "New Note", action: handleNewNote },
    { icon: Star, label: "Favorites", filter: "favorites" as const },
    { icon: X, label: "Delete Note", action: handleDelete }, // ✅ fixed
    { icon: Trash2, label: "Trash", filter: "trash" as const },
  ];

  return (
    <div className="w-56 bg-sidebar-bg h-screen flex flex-col border-r border-sidebar-hover">
      {/* Logo */}
      <div className="p-5 border-b border-sidebar-hover">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
            <FileText className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-semibold text-sidebar-foreground">
            CloudNotes
          </span>
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.label}
            onClick={() => {
              if (item.action) item.action();
              else if (item.filter) setActiveFilter(item.filter);
            }}
            className={`sidebar-item w-full ${
              item.filter && activeFilter === item.filter ? "active" : ""
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span className="text-sm">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-hover space-y-2">
        <button
          onClick={handleSave}
          className="sidebar-item w-full hover:bg-primary hover:text-primary-foreground"
        >
          <Save className="w-5 h-5" />
          <span className="text-sm">Save</span>
        </button>

        <button
          onClick={handleLogout}
          className="sidebar-item w-full hover:bg-destructive hover:text-destructive-foreground"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm">Logout</span>
        </button>
      </div>
    </div>
  );
}

// import { FileText, Plus, Star, Trash2, Save, LogOut, X } from 'lucide-react';
// import { useNavigate } from 'react-router-dom';
// import { useAuth } from '@/context/AuthContext';
// import { useNotes } from '@/context/NotesContext';
// import { toast } from 'sonner';

// interface SidebarProps {
//   activeFilter: 'all' | 'favorites' | 'trash';
//   setActiveFilter: (filter: 'all' | 'favorites' | 'trash') => void;
// }

// export default function Sidebar({ activeFilter, setActiveFilter }: SidebarProps) {
//   const { logout } = useAuth();
//   const { createNote, selectedNoteId, notes, deleteNote, updateNote } = useNotes();
//   const navigate = useNavigate();

//   const handleLogout = () => {
//     logout();
//     navigate('/');
//     toast.success('Logged out successfully');
//   };

//   const handleNewNote = () => {
//     createNote();
//     setActiveFilter('all');
//     toast.success('New note created');
//   };

//   const handleSave = () => {
//     if (selectedNoteId) {
//       const note = notes.find(n => n.id === selectedNoteId);
//       if (note) {
//         updateNote(selectedNoteId, { updatedAt: new Date() });
//         toast.success('Note saved');
//       }
//     } else {
//       toast.info('No note selected');
//     }
//   };
//    const handleDelete = () => {
//   if (!selectedNoteId) return toast.info('No note selected');

//   if (window.confirm("Move this note to trash?")) {
//     deleteNote(selectedNoteId);
//     toast.success('Note moved to trash');
//   }
// };

//   // const handleDelete = () => {
//   //   if (selectedNoteId) {
//   //     deleteNote(selectedNoteId);
//   //     toast.success('Note moved to trash');
//   //   } else {
//   //     toast.info('No note selected');
//   //   }
//   // };

//   const menuItems = [
//     { icon: FileText, label: 'Notes', filter: 'all' as const },
//     { icon: Plus, label: 'New Note', action: handleNewNote },
//     { icon: Star, label: 'Favorites', filter: 'favorites' as const },
//     { icon: X, label: 'Delete Note', action: handleDelete },
//     { icon: Trash2, label: 'Trash', filter: 'trash' as const },
//   ];

//   return (
//     <div className="w-56 bg-sidebar-bg h-screen flex flex-col border-r border-sidebar-hover">
//       {/* Logo */}
//       <div className="p-5 border-b border-sidebar-hover">
//         <div className="flex items-center gap-2">
//           <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
//             <FileText className="w-5 h-5 text-primary-foreground" />
//           </div>
//           <span className="text-lg font-semibold text-sidebar-foreground">CloudNotes</span>
//         </div>
//       </div>

//       {/* Menu Items */}
//       <nav className="flex-1 p-4 space-y-1">
//         {menuItems.map((item) => (
//           <button
//             key={item.label}
//             onClick={() => {
//               if (item.action) {
//                 item.action();
//               } else if (item.filter) {
//                 setActiveFilter(item.filter);
//               }
//             }}
//             className={`sidebar-item w-full ${
//               item.filter && activeFilter === item.filter ? 'active' : ''
//             }`}
//           >
//             <item.icon className="w-5 h-5" />
//             <span className="text-sm">{item.label}</span>
//           </button>
//         ))}
//       </nav>

//       {/* Bottom Actions */}
//       <div className="p-4 border-t border-sidebar-hover space-y-2">
//         <button
//           onClick={handleSave}
//           className="sidebar-item w-full hover:bg-primary hover:text-primary-foreground"
//         >
//           <Save className="w-5 h-5" />
//           <span className="text-sm">Save</span>
//         </button>
//         <button
//           onClick={handleLogout}
//           className="sidebar-item w-full hover:bg-destructive hover:text-destructive-foreground"
//         >
//           <LogOut className="w-5 h-5" />
//           <span className="text-sm">Logout</span>
//         </button>
//       </div>
//     </div>
//   );
// }
