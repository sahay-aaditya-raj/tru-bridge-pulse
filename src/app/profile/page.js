'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

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
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-emerald-50 pt-4">
      {/* Main Content */}
      <main className="max-w-4xl mx-auto py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="fade-in">
          {/* Profile Header */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <span className="text-2xl sm:text-3xl font-bold text-white">
                {user.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent mb-2">
              {user.name}
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base">@{user.username}</p>
          </div>

          {/* Profile Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent text-lg sm:text-xl">
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center py-2 sm:py-3 border-b">
                  <span className="font-medium text-muted-foreground text-sm sm:text-base">Full Name</span>
                  <span className="text-sm sm:text-base">{user.name}</span>
                </div>
                <div className="flex justify-between items-center py-2 sm:py-3 border-b">
                  <span className="font-medium text-muted-foreground text-sm sm:text-base">Username</span>
                  <span className="text-sm sm:text-base">@{user.username}</span>
                </div>
                <div className="flex justify-between items-center py-2 sm:py-3 border-b">
                  <span className="font-medium text-muted-foreground text-sm sm:text-base">Age</span>
                  <span className="text-sm sm:text-base">{user.age} years old</span>
                </div>
                <div className="flex justify-between items-center py-2 sm:py-3">
                  <span className="font-medium text-muted-foreground text-sm sm:text-base">Gender</span>
                  <span className="capitalize">{user.gender}</span>
                </div>
              </CardContent>
            </Card>

            {/* Account Information */}
            <Card>
              <CardHeader>
                <CardTitle className="bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                  Account Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b">
                  <span className="font-medium text-muted-foreground">Member Since</span>
                  <span>
                    {new Date(user.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-b">
                  <span className="font-medium text-muted-foreground">Account Status</span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary/20 text-primary">
                    Active
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-b">
                  <span className="font-medium text-muted-foreground">Last Updated</span>
                  <span>
                    {new Date(user.updatedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="font-medium text-muted-foreground">User ID</span>
                  <span className="font-mono text-sm">{user._id}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle className="bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Button asChild>
                    <Link href="/dashboard">
                      Go to Dashboard
                    </Link>
                  </Button>
                  <Button
                    onClick={handleLogout}
                    variant="destructive"
                  >
                    Sign Out
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Security Notice */}
          <div className="mt-8">
            <Card className="bg-accent/50 border-accent">
              <CardContent className="pt-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium">
                      Security Information
                    </h3>
                    <div className="mt-2 text-sm text-muted-foreground">
                      <p>
                        Your account is secured with encryption. Never share your login credentials 
                        with anyone. If you suspect unauthorized access, please contact support immediately.
                      </p>
                    </div>
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