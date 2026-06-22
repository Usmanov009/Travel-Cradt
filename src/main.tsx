import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import { AdminAuthProvider } from "./app/contexts/AdminAuthContext";
import { AuthProvider } from "./app/contexts/AuthContext";
import "./styles/index.css";

createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <AdminAuthProvider>
      <App />
    </AdminAuthProvider>
  </AuthProvider>
);
