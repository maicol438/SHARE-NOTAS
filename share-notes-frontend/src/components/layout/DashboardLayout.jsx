import { useState, useEffect, useCallback } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Navbar from "./Navbar.jsx";
import Sidebar from "./Sidebar.jsx";

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  useEffect(() => {
    const handler = () => { if (window.innerWidth >= 1024) setSidebarOpen(false); };
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape" && sidebarOpen) closeSidebar(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [sidebarOpen, closeSidebar]);

  const handleNewNote = () => {
    navigate("/dashboard?newNote=1");
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#f0f0ff] dark:bg-[#050510] text-[#1e1b4b] dark:text-[#e2e8f0] transition-colors duration-300">
      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-20 lg:hidden animate-fade-in-fast"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <div className={`${sidebarOpen ? "fixed inset-y-0 left-0 z-30" : "hidden"} lg:relative lg:flex`}>
        <Sidebar onNavClick={closeSidebar} />
      </div>

      {/* Main area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
          onNewNote={handleNewNote}
        />
        <main className="flex-1 overflow-y-auto pb-20 lg:pb-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
