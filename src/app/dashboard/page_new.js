'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-50 via-blue-50 to-emerald-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-foreground text-lg">Loading...</p>
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
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-emerald-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center py-4 sm:py-6 gap-4 sm:gap-0">
            <Link href="/" className="text-white hover:text-blue-100 transition-colors">
              <h1 className="text-xl sm:text-2xl font-bold">TruBridge Pulse</h1>
            </Link>
            <nav className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 w-full sm:w-auto">
              <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="text-white hover:text-blue-100 hover:bg-white/20 text-xs sm:text-sm"
                >
                  <Link href="/">Home</Link>
                </Button>
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="text-white hover:text-blue-100 hover:bg-white/20 text-xs sm:text-sm"
                >
                  <Link href="/profile">Profile</Link>
                </Button>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  size="sm"
                  className="bg-white text-red-600 hover:bg-red-50 border-white text-xs sm:text-sm"
                >
                  Logout
                </Button>
              </div>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="fade-in">
          {/* Welcome Section */}
          <div className="mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent mb-2">
              Welcome back, {user.name}! 👋
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base">
              Here&apos;s what&apos;s happening with your account today.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <Card className="text-center hover-lift">
              <CardContent className="pt-4 sm:pt-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <CardTitle className="text-sm sm:text-lg font-semibold mb-1">Profile</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Complete</CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover-lift">
              <CardContent className="pt-4 sm:pt-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-400 to-emerald-400 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <CardTitle className="text-sm sm:text-lg font-semibold mb-1">Status</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Active</CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover-lift">
              <CardContent className="pt-4 sm:pt-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <CardTitle className="text-sm sm:text-lg font-semibold mb-1">Security</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Protected</CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover-lift">
              <CardContent className="pt-4 sm:pt-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-emerald-400 to-blue-400 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <CardTitle className="text-sm sm:text-lg font-semibold mb-1">Verified</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Account</CardDescription>
              </CardContent>
            </Card>
          </div>

          {/* Main Dashboard Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Profile Summary */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent text-lg sm:text-xl">
                    Account Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 sm:p-4 bg-muted rounded-lg">
                    <div>
                      <h4 className="font-medium text-sm sm:text-base">Username</h4>
                      <p className="text-muted-foreground text-xs sm:text-sm">@{user.username}</p>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-primary/20 text-primary">
                        Active
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 sm:p-4 bg-muted rounded-lg">
                    <div>
                      <h4 className="font-medium text-sm sm:text-base">Age Group</h4>
                      <p className="text-muted-foreground text-xs sm:text-sm">
                        {user.age < 18 ? 'Teen' : user.age < 30 ? 'Young Adult' : user.age < 50 ? 'Adult' : 'Senior'} 
                        ({user.age} years)
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xl sm:text-2xl">
                        {user.age < 18 ? '🧒' : user.age < 30 ? '👨' : user.age < 50 ? '👨‍💼' : '👴'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 sm:p-4 bg-muted rounded-lg">
                    <div>
                      <h4 className="font-medium text-sm sm:text-base">Member Since</h4>
                      <p className="text-muted-foreground text-xs sm:text-sm">
                        {new Date(user.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xl sm:text-2xl">📅</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="space-y-4 sm:space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent text-lg sm:text-xl">
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button asChild className="w-full text-sm sm:text-base">
                    <Link href="/speechtotxt">
                      🎙️ Start Speech Chat
                    </Link>
                  </Button>
                  <Button asChild variant="default" className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white text-sm sm:text-base">
                    <Link href="/reports">
                      📋 Medical Reports
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full text-sm sm:text-base">
                    <Link href="/donor-search-public">
                      🔎 Search Organ Donors
                    </Link>
                  </Button>
                  <Button asChild variant="secondary" className="w-full text-sm sm:text-base">
                    <Link href="/organ-donor">
                      🫀 Organ Donor Portal
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent text-lg sm:text-xl">
                    Account Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm sm:text-base">Last Login</span>
                      <span className="text-sm font-medium">Today</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm sm:text-base">Account Type</span>
                      <span className="text-sm font-medium">Standard</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm sm:text-base">Gender</span>
                      <span className="text-sm font-medium">{user.gender}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
