import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { useTheme } from '../context/ThemeContext';
import AIChatbot from './AIChatbot';

const Layout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const { isDark } = useTheme();

  // Apply background directly on <html> with background-attachment: fixed
  // This is the ONLY reliable way to make backdrop-filter work
  // inside scroll containers (overflow-y-auto on <main> breaks fixed backdrop)
  useEffect(() => {
    const bg = isDark ? '/bg-futuristic.png' : '/bg-futuristic-light.jpg';
    document.documentElement.style.backgroundImage = `url(${bg})`;
    document.documentElement.style.backgroundSize = 'cover';
    document.documentElement.style.backgroundPosition = 'center';
    document.documentElement.style.backgroundAttachment = 'fixed';
    document.documentElement.style.backgroundRepeat = 'no-repeat';
    return () => {
      document.documentElement.style.backgroundImage = '';
    };
  }, [isDark]);

  return (
    <div className="min-h-screen text-slate-800 dark:text-slate-100 transition-colors duration-300 relative">
      {/* Subtle dark overlay for dark mode only */}
      {isDark && (
        <div className="fixed inset-0 z-0 bg-black/20 pointer-events-none" />
      )}
      {/* Sidebar navigation */}
      <Sidebar isOpen={isMobileMenuOpen} closeMenu={() => setIsMobileMenuOpen(false)} />

      {/* Main content area */}
      <div className="md:pl-64 min-h-screen flex flex-col w-full transition-all duration-300">
        {/* Top Navbar */}
        <Navbar toggleMobileMenu={toggleMobileMenu} />

        {/* Dynamic page content */}
        <main className="flex-1 p-8 mt-16">
          <Outlet />
        </main>
        {/* AI Chatbot - visible on all pages */}
      <AIChatbot />
    </div>
    </div>
  );
};

export default Layout;
