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
          <div className="flex justify-between items-center py-6">
            <Link href="/" className="text-white hover:text-blue-100 transition-colors">
              <h1 className="text-2xl font-bold">TruBridge Pulse</h1>
            </Link>
            <nav className="flex items-center space-x-4">
              <Button
                asChild
                variant="ghost"
                className="text-white hover:text-blue-100 hover:bg-white/20"
              >
                <Link href="/">Home</Link>
              </Button>
              <Button
                asChild
                variant="ghost"
                className="text-white hover:text-blue-100 hover:bg-white/20"
              >
                <Link href="/profile">Profile</Link>
              </Button>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="bg-white text-red-600 hover:bg-red-50 border-white"
              >
                Logout
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="fade-in">
          {/* Welcome Section */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent mb-2">
              Welcome back, {user.name}! 👋
            </h2>
            <p className="text-muted-foreground">
              Here&apos;s what&apos;s happening with your account today.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <Card className="text-center hover-lift">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <CardTitle className="text-lg font-semibold mb-1">Profile</CardTitle>
                <CardDescription>Complete</CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover-lift">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <CardTitle className="text-lg font-semibold mb-1">Security</CardTitle>
                <CardDescription>Protected</CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover-lift">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <CardTitle className="text-lg font-semibold mb-1">Status</CardTitle>
                <CardDescription>Active</CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover-lift">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-gradient-to-r from-emerald-400 to-blue-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <CardTitle className="text-lg font-semibold mb-1">Verified</CardTitle>
                <CardDescription>Account</CardDescription>
              </CardContent>
            </Card>
          </div>

          {/* Main Dashboard Content */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Profile Summary */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                    Account Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <div>
                      <h4 className="font-medium">Username</h4>
                      <p className="text-muted-foreground">@{user.username}</p>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary/20 text-primary">
                        Active
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <div>
                      <h4 className="font-medium">Age Group</h4>
                      <p className="text-muted-foreground">
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

                  <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <div>
                      <h4 className="font-medium">Member Since</h4>
                      <p className="text-muted-foreground">
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
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button asChild className="w-full">
                    <Link href="/speechtotxt">
                      🎙️ Start Speech Chat
                    </Link>
                  </Button>
                  <Button asChild variant="default" className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white">
                    <Link href="/reports">
                      📋 Medical Reports
                    </Link>
                  </Button>
                  <Button asChild variant="default" className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white">
                    <Link href="/organ-donor">
                      ❤️ Register an Organ Donor
                    </Link>
                  </Button>
                  <Button asChild variant="default" className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white">
                    <Link href="/donor-search">
                      🔍 Search Organ Donors
                    </Link>
                  </Button>
                  <Button asChild variant="secondary" className="w-full">
                    <Link href="/profile">
                      View Profile
                    </Link>
                  </Button>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                    Account Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Profile Completion</span>
                    <span className="font-semibold text-primary">100%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Security Level</span>
                    <span className="font-semibold text-accent">High</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Account Type</span>
                    <span className="font-semibold">Standard</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle className="bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center p-4 bg-muted rounded-lg">
                  <div className="w-10 h-10 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full flex items-center justify-center mr-4">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">Dashboard Access</h4>
                    <p className="text-muted-foreground text-sm">You accessed your dashboard</p>
                  </div>
                  <div className="text-right">
                    <p className="text-muted-foreground text-sm">Just now</p>
                  </div>
                </div>

                <div className="flex items-center p-4 bg-muted rounded-lg">
                  <div className="w-10 h-10 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full flex items-center justify-center mr-4">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">Account Created</h4>
                    <p className="text-muted-foreground text-sm">Welcome to TruBridge Pulse!</p>
                  </div>
                  <div className="text-right">
                    <p className="text-muted-foreground text-sm">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}