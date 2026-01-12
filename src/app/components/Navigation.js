// src/app/components/Navigation.js

'use client';

import { useState, useEffect } from 'react';
import { Activity, Lock, Menu, X, LogOut, Sun, Moon } from 'lucide-react';
import { signOut } from 'next-auth/react';
import { useTheme } from 'next-themes';
import Image from "next/image";

export default function Navigation({ activePage, onPageChange }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const menuItems = [
    {
      id: 'jenkins',
      label: 'Jenkins Approval',
      icon: Activity,
    },
    {
      id: 'k8s-secret',
      label: 'K8s Secrets',
      icon: Lock,
    }
  ];

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/auth/signin' });
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <>
      {/* Mobile Top Navigation */}
      <nav className="md:hidden bg-white  dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 sticky top-0 z-50 backdrop-blur-sm bg-white/95 dark:bg-neutral-900/95 transition-colors">
        <div className="px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo/Brand */}
            <div className="flex items-center gap-3">
              <div className="h-10">
                <Image
                  src="/Logo.png"
                  alt="Logo"
                  width={100}
                  height={100}
                  className="h-full w-auto object-contain"
                  priority
                />
              </div>
              <span className="text-lg font-bold text-neutral-900 dark:text-white">DevOps Dashboard</span>
            </div>

            <div className="flex items-center gap-2">
              {/* Theme Toggle Mobile */}
              {mounted && (
                <button
                  onClick={toggleTheme}
                  className="p-2 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                </button>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {/* Mobile Menu Dropdown */}
          {mobileMenuOpen && (
            <div className="py-4 space-y-2 border-t border-neutral-200 dark:border-neutral-800">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activePage === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onPageChange(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-semibold transition-all ${
                      isActive
                        ? 'bg-[#FFA500] text-white shadow-sm'
                        : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800'
                    }`}
                  >
                    <Icon size={20} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all"
              >
                <LogOut size={20} />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:flex-col md:fixed md:inset-y-0 md:left-0 md:w-56 bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 z-50 transition-colors">
        {/* Logo Section */}
        <div className="flex items-center gap-2 p-4 border-b border-neutral-200 dark:border-neutral-800">
          <div className="h-25">
            <Image
              src="/Logo.png"
              alt="Logo"
              width={100}
              height={100}
              className="h-full w-auto object-contain"
              priority
            />
          </div>
          <span className="text-base font-extrabold text-neutral-900 dark:text-white">DevOps Dashboard</span>
        </div>

        {/* Menu Items */}
        <div className="flex-1 py-4 space-y-0.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onPageChange(item.id)}
                className={`w-full flex items-center gap-2 px-4 py-3 font-medium text-sm transition-all ${
                  isActive
                    ? 'bg-[#FFA500] text-white'
                    : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800'
                }`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Bottom Section: Theme & Logout */}
        <div className="py-2 border-t border-neutral-200 dark:border-neutral-800">
          {mounted && (
            <button
              onClick={toggleTheme}
              className="w-full flex items-center gap-2 px-4 py-3 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all text-sm font-medium"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
            </button>
          )}

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-3 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all text-sm font-medium"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
