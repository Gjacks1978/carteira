import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { ThemeProvider } from "next-themes"
import { SidebarProvider } from "./contexts/SidebarContext";

createRoot(document.getElementById("root")!).render(
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
    <SidebarProvider>
      <App />
    </SidebarProvider>
  </ThemeProvider>
);
