'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { 
  Menu, 
  X, 
  Home, 
  User, 
  LayoutDashboard, 
  FileText, 
  Mic, 
  Search, 
  Heart,
  LogOut,
  LogIn,
  UserPlus
} from 'lucide-react';

export default function Navbar() {
  const { user, loading, logout, isAuthenticated } = useAuth();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setIsMobileMenuOpen(false);
    router.push('/');
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  // Navigation items for authenticated users
  const authenticatedNavItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/profile', label: 'Profile', icon: User },
    { href: '/reports', label: 'Reports', icon: FileText },
    { href: '/speechtotxt', label: 'Speech Chat', icon: Mic },
    { href: '/donor-search-public', label: 'Donor Search', icon: Search },
    { href: '/organ-donor', label: 'Organ Donor', icon: Heart },
  ];

  // Navigation items for non-authenticated users
  const guestNavItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/donor-search-public', label: 'Donor Search', icon: Search },
  ];

  const navItems = isAuthenticated ? authenticatedNavItems : guestNavItems;

  return (
    <header className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="text-white hover:text-blue-100 transition-colors">
            <h1 className="text-xl sm:text-2xl font-bold">TruBridge Pulse</h1>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.href}
                  asChild
                  variant="ghost"
                  size="sm"
                  className="text-white hover:text-blue-100 hover:bg-white/20 transition-colors"
                >
                  <Link href={item.href} className="flex items-center gap-1">
                    <Icon size={16} />
                    <span className="hidden lg:inline">{item.label}</span>
                  </Link>
                </Button>
              );
            })}

            {/* Authentication Buttons */}
            <div className="ml-4 flex items-center space-x-2">
              {isAuthenticated ? (
                <>
                  {user && (
                    <span className="text-white text-sm hidden xl:inline">
                      Hi, {user.name}!
                    </span>
                  )}
                  <Button
                    onClick={handleLogout}
                    variant="outline"
                    size="sm"
                    className="bg-white text-red-600 hover:bg-red-50 border-white transition-colors"
                  >
                    <LogOut size={16} className="mr-1" />
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className="text-white hover:text-blue-100 hover:bg-white/20"
                  >
                    <Link href="/auth/login" className="flex items-center gap-1">
                      <LogIn size={16} />
                      Login
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="bg-white text-primary hover:bg-gray-50 border-white"
                  >
                    <Link href="/auth/signup" className="flex items-center gap-1">
                      <UserPlus size={16} />
                      Sign Up
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-white hover:text-blue-100 hover:bg-white/20"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white/95 backdrop-blur-sm rounded-lg mt-2 mb-4 shadow-lg border">
            <div className="py-2">
              {/* User Info (if authenticated) */}
              {isAuthenticated && user && (
                <div className="px-4 py-3 border-b border-gray-200">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full flex items-center justify-center mr-3">
                      <span className="text-white font-semibold text-sm">
                        {user.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500">@{user.username}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Links */}
              <div className="px-2 py-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={closeMobileMenu}
                      className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                    >
                      <Icon size={18} className="mr-3 text-gray-500" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>

              {/* Authentication Section */}
              <div className="border-t border-gray-200 px-2 py-2">
                {isAuthenticated ? (
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-3 py-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  >
                    <LogOut size={18} className="mr-3" />
                    Logout
                  </button>
                ) : (
                  <>
                    <Link
                      href="/auth/login"
                      onClick={closeMobileMenu}
                      className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                    >
                      <LogIn size={18} className="mr-3 text-gray-500" />
                      Login
                    </Link>
                    <Link
                      href="/auth/signup"
                      onClick={closeMobileMenu}
                      className="flex items-center px-3 py-2 text-primary hover:bg-primary/10 rounded-md transition-colors font-medium"
                    >
                      <UserPlus size={18} className="mr-3" />
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
