'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';

export default function Profile() {
  const { user, loading, logout, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-bg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="gradient-bg shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <Link href="/" className="text-white hover:text-blue-100 transition-colors">
              <h1 className="text-2xl font-bold">TruBridge Pulse</h1>
            </Link>
            <nav className="flex items-center space-x-4">
              <Link 
                href="/" 
                className="text-white hover:text-blue-100 transition-colors"
              >
                Home
              </Link>
              <button
                onClick={handleLogout}
                className="bg-white text-red-600 hover:bg-red-50 px-4 py-2 rounded-md font-medium transition-colors"
              >
                Logout
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="fade-in">
          {/* Profile Header */}
          <div className="text-center mb-8">
            <div className="w-24 h-24 gradient-bg rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl font-bold text-white">
                {user.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <h2 className="text-3xl font-bold gradient-text mb-2">
              {user.name}
            </h2>
            <p className="text-gray-600">@{user.username}</p>
          </div>

          {/* Profile Information */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Personal Information */}
            <div className="card">
              <h3 className="text-xl font-semibold mb-6 gradient-text">
                Personal Information
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="font-medium text-gray-700">Full Name</span>
                  <span className="text-gray-900">{user.name}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="font-medium text-gray-700">Username</span>
                  <span className="text-gray-900">@{user.username}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="font-medium text-gray-700">Age</span>
                  <span className="text-gray-900">{user.age} years old</span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="font-medium text-gray-700">Gender</span>
                  <span className="text-gray-900 capitalize">{user.gender}</span>
                </div>
              </div>
            </div>

            {/* Account Information */}
            <div className="card">
              <h3 className="text-xl font-semibold mb-6 gradient-text">
                Account Information
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="font-medium text-gray-700">Member Since</span>
                  <span className="text-gray-900">
                    {new Date(user.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="font-medium text-gray-700">Account Status</span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    Active
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="font-medium text-gray-700">Last Updated</span>
                  <span className="text-gray-900">
                    {new Date(user.updatedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="font-medium text-gray-700">User ID</span>
                  <span className="text-gray-900 font-mono text-sm">{user._id}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8">
            <div className="card">
              <h3 className="text-xl font-semibold mb-6 gradient-text">
                Quick Actions
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <Link 
                  href="/dashboard"
                  className="btn-primary text-center"
                >
                  Go to Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-md transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>

          {/* Security Notice */}
          <div className="mt-8">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">
                    Security Information
                  </h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <p>
                      Your account is secured with encryption. Never share your login credentials 
                      with anyone. If you suspect unauthorized access, please contact support immediately.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}