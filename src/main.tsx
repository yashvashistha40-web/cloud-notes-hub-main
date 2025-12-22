// import { createRoot } from "react-dom/client";
// import App from "./App.tsx";
// import "./index.css";

// createRoot(document.getElementById("root")!).render(<App />);
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// ✅ Import your context providers
import { AuthProvider } from "./context/AuthContext.tsx";
import { NotesProvider } from "./context/NotesContext.tsx";

// ✅ Wrap App with providers so context persists after refresh
createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <NotesProvider>
      <App />
    </NotesProvider>
  </AuthProvider>
);
