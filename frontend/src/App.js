import React, { useEffect, useState } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import axios from "axios";
import StudyHub from "./components/StudyHub";
import { Toaster } from "./components/ui/toaster";
import { Switch } from "./components/ui/switch";
import { Sun, Moon } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function Layout({ children }) {
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem("theme");
    return saved ? saved === "dark" : window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  useEffect(() => {
    const helloWorldApi = async () => {
      try {
        await axios.get(`${API}/`);
      } catch (e) {
        console.debug("/api ping skipped or failed (expected in mock phase)");
      }
    };
    helloWorldApi();
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-20 border-b bg-background/80 backdrop-blur">
        <div className="container mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-6 w-6 rounded bg-emerald-600" />
            <div>
              <div className="font-semibold">Psychology Study Hub</div>
              <div className="text-xs text-muted-foreground">Learn smarter, remember longer</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Sun className={`h-4 w-4 ${!dark ? 'text-emerald-600' : 'text-muted-foreground'}`} />
            <Switch checked={dark} onCheckedChange={setDark} />
            <Moon className={`h-4 w-4 ${dark ? 'text-emerald-500' : 'text-muted-foreground'}`} />
          </div>
        </div>
      </header>
      <main>{children}</main>
      <footer className="border-t mt-10">
        <div className="container mx-auto px-6 py-6 text-sm text-muted-foreground flex justify-between">
          <div>© {new Date().getFullYear()} Psychology Study Hub</div>
          <div>Teal theme · Dark mode supported</div>
        </div>
      </footer>
      <Toaster />
    </div>
  );
}

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout><StudyHub /></Layout>} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;