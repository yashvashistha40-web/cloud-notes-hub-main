import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";

// ===============================
// AWS API Gateway Configuration
// ===============================
const API_BASE_URL =
  "https://fkd2b5br2b.execute-api.ap-south-1.amazonaws.com/ps/notes";

// ===============================
// Utility Helpers
// ===============================
function getToken(): string | null {
  // Use Access Token for API requests (validated by API Gateway)
  // ✅ Only use access token for API Gateway
  return localStorage.getItem("id_token");
  //   return localStorage.getItem("id_token");
}

// Normalize headers for Fetch API
function normalizeHeaders(h?: HeadersInit): Record<string, string> {
  const out: Record<string, string> = {};
  if (!h) return out;
  if (h instanceof Headers) h.forEach((v, k) => (out[k] = v));
  else if (Array.isArray(h)) for (const [k, v] of h) out[k] = v;
  else Object.assign(out, h);
  return out;
}

// Generic API wrapper with logging and error handling
async function apiFetch(path: string, opts: RequestInit = {}) {
  const headers = normalizeHeaders(opts.headers);
  const token = getToken();
  if (token) {
    // Remove any unwanted prefix or key=value formatting
    const cleanToken = token
      .replace(/^Bearer\s+/i, "") // remove duplicate "Bearer"
      .replace(/^access_token=/i, "") // remove accidental key=value format
      .replace(/^id_token=/i, "") // remove "id_token=" prefix if present
      .trim();

    headers["Authorization"] = cleanToken; // ✅ remove Bearer prefix — matches old JS
  }

  // if (token)
  //   headers["Authorization"] = token.startsWith("Bearer ")
  //     ? token
  //     : `Bearer ${token}`;
  // if (!headers["Accept"]) headers["Accept"] = "application/json";

  const url = API_BASE_URL + path;
  let bodyPreview: any = opts.body;
  try {
    bodyPreview =
      typeof opts.body === "string"
        ? JSON.parse(opts.body as string)
        : opts.body;
  } catch {}

  console.log("[apiFetch] ->", opts.method || "GET", url, bodyPreview);

  const res = await fetch(url, { ...opts, headers });
  const text = await res.text().catch(() => "");
  console.log("[apiFetch] <-", res.status, text);

  if (!res.ok) throw new Error(text || `Request failed with ${res.status}`);
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

// ===============================
// Type Definitions
// ===============================
export interface NoteAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  isFavorite: boolean;
  isDeleted: boolean;
  attachments: NoteAttachment[];
}

// ===============================
// Context Definition
// ===============================
interface NotesContextType {
  notes: Note[];
  selectedNoteId: string | null;
  setSelectedNoteId: (id: string | null) => void;
  createNote: () => Promise<Note>;
  updateNote: (id: string, updates: Partial<Note>) => Promise<void>;
  deleteNoteUnified: (id: string, permanent?: boolean) => Promise<void>;
  deleteNote: (id: string, permanent?: boolean) => Promise<void>; // add alias to match context
  toggleFavorite: (id: string) => Promise<void>;
  restoreNote: (id: string) => void;
  getFilteredNotes: (filter: "all" | "favorites" | "trash") => Note[];
  addAttachment: (noteId: string, files: FileList) => void;
  removeAttachment: (noteId: string, attachmentId: string) => void;
  openAndSelectNote: (noteId: string) => Promise<void>;
}

const NotesContext = createContext<NotesContextType | undefined>(undefined);

// ===============================
// AWS Backend Calls
// ===============================

// Get notes list (metadata)
async function fetchNotesFromS3(email?: string): Promise<any[]> {
  const q = email
    ? `?email=${encodeURIComponent(email)}&filter=notes`
    : "?filter=notes";
  const res = await apiFetch(`/getNotes${q}`);
  return res.notes || [];
}

// Save or update a note (writes to S3 + DynamoDB)
async function saveNoteToS3(note: Note): Promise<void> {
  const email = localStorage.getItem("email") || "testuser@example.com";

  await apiFetch(`/createNote`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      noteId: note.id,
      title: note.title,
      note: note.content || "",
      attachments: note.attachments.map((a) => ({
        fileName: a.name,
        size: a.size,
        contentType: a.type,
        s3Key: a.id,
      })),
    }),
  });
}

// async function saveNoteToS3(note: Note): Promise<void> {
//   const email = localStorage.getItem("email") || "testuser@example.com";
//   const body = {
//     email,
//     noteId: note.id.startsWith("note-") ? note.id : `note-${note.id}`,
//     title: note.title,
//     note: note.content || "",
//     attachments: note.attachments || [],
//   };

//   console.log("saveNoteToS3 body:", body);

//   await apiFetch(`/createNote`, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify(body),
//   });
// }

// Toggle favorite flag
async function toggleFavoriteInS3(noteId: string): Promise<boolean> {
  const email = localStorage.getItem("email") || "testuser@example.com";

  const res = await apiFetch(`/updateNote`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, noteId }),
  });

  return res.favorite;
}

// async function toggleFavoriteInS3(noteId: string): Promise<void> {
//   const email = localStorage.getItem("email") || "testuser@example.com";
//   await apiFetch(`/updateNote`, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ email, noteId }),
//   });
// }

// Fetch full note content from S3
export async function openNote(noteId: string): Promise<{
  noteId: string;
  title: string;
  content: string;
  attachments?: any[];
}> {
  const email = localStorage.getItem("email") || "";
  const q = `?email=${encodeURIComponent(email)}&noteId=${encodeURIComponent(
    noteId
  )}`;
  const res: any = await apiFetch(`/getFullNote${q}`);
  return {
    noteId,
    title: res.title ?? "",
    content: res.content ?? "",
    attachments: res.attachments || [],
  };
}

// ===============================
// NotesProvider Component
// ===============================
export function NotesProvider({ children }: { children: React.ReactNode }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);

  // Fetch all notes on startup
  useEffect(() => {
    const email = localStorage.getItem("email");
    if (!email) return;

    fetchNotesFromS3(email)
      .then((data) => {
        setNotes(
          data.map((n: any) => ({
            id: n.noteId,
            title: n.title,
            content: n.content || "",
            createdAt: new Date(n.createdAt || Date.now()),
            updatedAt: new Date(n.updatedAt || Date.now()),
            isFavorite: n.favorite || false,
            isDeleted: n.deleted || false,
            attachments: n.attachments
              ? typeof n.attachments === "string"
                ? JSON.parse(n.attachments)
                : n.attachments
              : [],
          }))
        );
      })
      .catch((err) => console.error("Error fetching notes:", err));
  }, []);

  // Create new note
  const createNote = useCallback(async (): Promise<Note> => {
    const newNote: Note = {
      id: `note-${Date.now()}`,
      title: "Untitled Note",
      content: "",
      createdAt: new Date(),
      updatedAt: new Date(),
      isFavorite: false,
      isDeleted: false,
      attachments: [],
    };
    setNotes((prev) => [newNote, ...prev]);
    setSelectedNoteId(newNote.id);
    await saveNoteToS3(newNote);
    return newNote;
  }, []);

  // Update note (auto-save)
  const updateNote = useCallback(async (id: string, updates: Partial<Note>) => {
    let updatedNote: Note | undefined;
    setNotes((prev) => {
      const updated = prev.map((n) =>
        n.id === id ? { ...n, ...updates, updatedAt: new Date() } : n
      );
      updatedNote = updated.find((n) => n.id === id);
      return updated;
    });
    if (updatedNote) await saveNoteToS3(updatedNote);
  }, []);

  // Unified delete (soft or permanent)
  const deleteNoteUnified = useCallback(
    async (noteId: string) => {
      const email = localStorage.getItem("email");

      if (!email) {
        throw new Error("User email not found in localStorage");
      }

      // 🔹 Call delete Lambda
      await apiFetch("/deleteNote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          noteId, // ✅ SAME ID as getFullNote
        }),
      });

      // 🔹 Update UI after backend success
      setNotes((prev) => prev.filter((n) => n.id !== noteId));

      if (selectedNoteId === noteId) {
        setSelectedNoteId(null);
      }
    },
    [selectedNoteId]
  );

  // const deleteNoteUnified = useCallback(
  //   async (id: string, permanent = false) => {
  //     const email = localStorage.getItem("email") || "testuser@example.com";
  //     const method = permanent ? "DELETE" : "POST";

  //     await apiFetch(`/deleteNote`, {
  //       method,
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ email, noteId: id, permanent }),
  //     });

  //     setNotes((prev) =>
  //       permanent
  //         ? prev.filter((n) => n.id !== id)
  //         : prev.map((n) =>
  //             n.id === id ? { ...n, isDeleted: true } : n
  //           )
  //     );

  //     if (selectedNoteId === id) setSelectedNoteId(null);
  //   },
  //   [selectedNoteId]
  // );

  // Toggle favorite
  const toggleFavorite = useCallback(async (id: string) => {
  // 1️⃣ Optimistic UI update
  setNotes((prev) =>
    prev.map((n) =>
      n.id === id ? { ...n, isFavorite: !n.isFavorite } : n
    )
  );

  // 2️⃣ Persist change in backend
  const favorite = await toggleFavoriteInS3(id);

  // 3️⃣ Sync UI with backend truth
  setNotes((prev) =>
    prev.map((n) =>
      n.id === id ? { ...n, isFavorite: favorite } : n
    )
  );
}, []);

  // const toggleFavorite = useCallback(async (id: string) => {
  //   setNotes((prev) =>
  //     prev.map((n) => (n.id === id ? { ...n, isFavorite: !n.isFavorite } : n))
  //   );
  //   await toggleFavoriteInS3(id);
  // }, []);

  // Restore from trash
  const restoreNote = useCallback((id: string) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isDeleted: false } : n))
    );
  }, []);

  // Manage attachments
  const addAttachment = useCallback(async (noteId: string, files: FileList) => {
    const email = localStorage.getItem("email");
    if (!email) throw new Error("No email");

    const uploaded: NoteAttachment[] = [];

    for (const file of Array.from(files)) {
      // 1️⃣ Ask SAME Lambda for presigned URL
      const presign = await apiFetch("/createNote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "presign",
          email,
          noteId,
          fileName: file.name,
          contentType: file.type,
        }),
      });

      // 2️⃣ Upload directly to S3
      await fetch(presign.uploadUrl, {
        method: "PUT",
        body: file,
      });

      // 3️⃣ Save attachment metadata
      uploaded.push({
        id: presign.s3Key,
        name: presign.fileName,
        type: file.type,
        size: file.size,
        url: presign.s3Key,
      });
    }

    setNotes((prev) =>
      prev.map((n) =>
        n.id === noteId
          ? {
              ...n,
              attachments: [...n.attachments, ...uploaded],
              updatedAt: new Date(),
            }
          : n
      )
    );
  }, []);

  // const addAttachment = useCallback((noteId: string, files: FileList) => {
  //   const newAttachments: NoteAttachment[] = Array.from(files).map((file) => ({
  //     id: `${Date.now()}-${file.name}`,
  //     name: file.name,
  //     type: file.type,
  //     size: file.size,
  //     url: URL.createObjectURL(file),
  //   }));

  //   setNotes((prev) =>
  //     prev.map((n) =>
  //       n.id === noteId
  //         ? {
  //             ...n,
  //             attachments: [...n.attachments, ...newAttachments],
  //             updatedAt: new Date(),
  //           }
  //         : n
  //     )
  //   );
  // }, []);

  const removeAttachment = useCallback(
    (noteId: string, attachmentId: string) => {
      setNotes((prev) =>
        prev.map((n) =>
          n.id === noteId
            ? {
                ...n,
                attachments: n.attachments.filter((a) => a.id !== attachmentId),
                updatedAt: new Date(),
              }
            : n
        )
      );
    },
    []
  );

  // Filter notes (view)
  const getFilteredNotes = useCallback(
    (filter: "all" | "favorites" | "trash") => {
      switch (filter) {
        case "favorites":
          return notes.filter((n) => n.isFavorite && !n.isDeleted);
        case "trash":
          return notes.filter((n) => n.isDeleted);
        default:
          return notes.filter((n) => !n.isDeleted);
      }
    },
    [notes]
  );

  // Open and select full note
  const openAndSelectNote = useCallback(async (noteId: string) => {
    const full = await openNote(noteId);
    setNotes((prev) => {
      const exists = prev.find((n) => n.id === noteId);
      if (exists) {
        return prev.map((n) =>
          n.id === noteId
            ? {
                ...n,
                title: full.title,
                content: full.content,
                attachments: full.attachments || [],
                updatedAt: new Date(),
              }
            : n
        );
      }
      const newNote: Note = {
        id: noteId,
        title: full.title,
        content: full.content,
        createdAt: new Date(),
        updatedAt: new Date(),
        isFavorite: false,
        isDeleted: false,
        attachments: full.attachments || [],
      };
      return [newNote, ...prev];
    });
    setSelectedNoteId(noteId);
  }, []);

  return (
    <NotesContext.Provider
      value={{
        notes,
        selectedNoteId,
        setSelectedNoteId,
        createNote,
        updateNote,
        deleteNoteUnified,
        deleteNote: deleteNoteUnified, // ✅ alias so Sidebar.tsx keeps working
        toggleFavorite,
        restoreNote,
        getFilteredNotes,
        addAttachment,
        removeAttachment,
        openAndSelectNote,
      }}
    >
      {children}
    </NotesContext.Provider>
  );
}

// ===============================
// Hook for Components
// ===============================
export function useNotes() {
  const ctx = useContext(NotesContext);
  if (!ctx) throw new Error("useNotes must be used within a NotesProvider");
  return ctx;
}
