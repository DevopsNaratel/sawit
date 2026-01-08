// src/app/components/Navigation.js

'use client';

import { useState } from 'react';
import { Activity, Lock, Menu, X, LogOut } from 'lucide-react';
import { signOut } from 'next-auth/react';
import Image from "next/image";

export default function Navigation({ activePage, onPageChange }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  return (
    <>
      {/* Mobile Top Navigation */}
      <nav className="md:hidden bg-neutral-900 border-b border-neutral-800 sticky top-0 z-50 backdrop-blur-sm bg-neutral-900/95">
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
              <span className="text-lg font-bold text-white">DevOps Dashboard</span>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Menu Dropdown */}
          {mobileMenuOpen && (
            <div className="py-4 space-y-2 border-t border-neutral-800">
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
                        ? item.id === 'jenkins'
                          ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                          : 'bg-purple-600/20 text-purple-400 border border-purple-500/30'
                        : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                    }`}
                  >
                    <Icon size={20} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
              >
                <LogOut size={20} />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:flex-col md:fixed md:inset-y-0 md:left-0 md:w-64 md:bg-neutral-900 md:border-r md:border-neutral-800 z-50">
        {/* Logo Section */}
        <div className="flex items-center gap-3 p-6 border-b border-neutral-800">
          <div className="h-12">
            <Image
              src="/Logo.png"
              alt="Logo"
              width={120}
              height={120}
              className="h-full w-auto object-contain"
              priority
            />
          </div>
          <span className="text-lg font-bold text-white">DevOps</span>
        </div>

        {/* Menu Items */}
        <div className="flex-1 px-4 py-6 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onPageChange(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-semibold transition-all ${
                  isActive
                    ? item.id === 'jenkins'
                      ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                      : 'bg-purple-600/20 text-purple-400 border border-purple-500/30'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                }`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Logout Button at Bottom */}
        <div className="p-4 border-t border-neutral-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}