'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';

export default function Dashboard() {
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
              <Link 
                href="/profile" 
                className="text-white hover:text-blue-100 transition-colors"
              >
                Profile
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
      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="fade-in">
          {/* Welcome Section */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold gradient-text mb-2">
              Welcome back, {user.name}! 👋
            </h2>
            <p className="text-gray-600">
              Here&apos;s what&apos;s happening with your account today.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <div className="card text-center">
              <div className="w-12 h-12 gradient-bg rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Profile</h3>
              <p className="text-gray-600 text-sm">Complete</p>
            </div>

            <div className="card text-center">
              <div className="w-12 h-12 gradient-bg rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Security</h3>
              <p className="text-gray-600 text-sm">Protected</p>
            </div>

            <div className="card text-center">
              <div className="w-12 h-12 gradient-bg rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Status</h3>
              <p className="text-gray-600 text-sm">Active</p>
            </div>

            <div className="card text-center">
              <div className="w-12 h-12 gradient-bg rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Verified</h3>
              <p className="text-gray-600 text-sm">Account</p>
            </div>
          </div>

          {/* Main Dashboard Content */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Profile Summary */}
            <div className="lg:col-span-2">
              <div className="card">
                <h3 className="text-xl font-semibold mb-6 gradient-text">
                  Account Overview
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">Username</h4>
                      <p className="text-gray-600">@{user.username}</p>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                        Active
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">Age Group</h4>
                      <p className="text-gray-600">
                        {user.age < 18 ? 'Teen' : user.age < 30 ? 'Young Adult' : user.age < 50 ? 'Adult' : 'Senior'} 
                        ({user.age} years)
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl">
                        {user.age < 18 ? '🧒' : user.age < 30 ? '👨' : user.age < 50 ? '👨‍💼' : '👴'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">Member Since</h4>
                      <p className="text-gray-600">
                        {new Date(user.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl">📅</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-6">
              <div className="card">
                <h3 className="text-xl font-semibold mb-6 gradient-text">
                  Quick Actions
                </h3>
                <div className="space-y-3">
                  <Link 
                    href="/profile"
                    className="btn-primary w-full text-center block"
                  >
                    View Profile
                  </Link>
                  <button className="btn-secondary w-full">
                    Account Settings
                  </button>
                  <button className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors">
                    Help & Support
                  </button>
                </div>
              </div>

              <div className="card">
                <h3 className="text-xl font-semibold mb-4 gradient-text">
                  Account Stats
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Profile Completion</span>
                    <span className="font-semibold text-green-600">100%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Security Level</span>
                    <span className="font-semibold text-blue-600">High</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Account Type</span>
                    <span className="font-semibold text-gray-900">Standard</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="mt-8">
            <div className="card">
              <h3 className="text-xl font-semibold mb-6 gradient-text">
                Recent Activity
              </h3>
              <div className="space-y-4">
                <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 gradient-bg rounded-full flex items-center justify-center mr-4">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">Dashboard Access</h4>
                    <p className="text-gray-600 text-sm">You accessed your dashboard</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-500 text-sm">Just now</p>
                  </div>
                </div>

                <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 gradient-bg rounded-full flex items-center justify-center mr-4">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">Account Created</h4>
                    <p className="text-gray-600 text-sm">Welcome to TruBridge Pulse!</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-500 text-sm">
                      {new Date(user.createdAt).toLocaleDateString()}
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