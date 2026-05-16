import { useState, useEffect, useCallback } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar.jsx";
import Sidebar from "./Sidebar.jsx";

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const closeSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && sidebarOpen) {
        closeSidebar();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [sidebarOpen, closeSidebar]);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-dark-950">
      <div className={`${sidebarOpen ? "fixed inset-y-0 left-0 z-30" : "hidden"} lg:relative lg:flex transition-all duration-300 ease-out`}>
        <Sidebar onNavClick={closeSidebar} />
      </div>
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 lg:hidden animate-fade-in"
          onClick={closeSidebar}
        />
      )}
      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
