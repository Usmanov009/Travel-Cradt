import { RouterProvider } from "react-router-dom";
import { router } from "./routes";
import "./i18n";
import { useTelegramWebApp } from "./hooks/useTelegramWebApp";

export default function App() {
  useTelegramWebApp();

  return <RouterProvider router={router} />;
}