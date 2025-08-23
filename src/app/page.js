'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Home() {
  const { user, loading, logout, isAuthenticated } = useAuth();
  const router = useRouter();

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-emerald-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-white">
                TruBridge Pulse
              </h1>
            </div>
            <nav className="flex items-center space-x-4">
              {isAuthenticated ? (
                <div className="flex items-center space-x-4">
                  <span className="text-white">
                    Welcome, <span className="font-semibold">{user?.name}</span>!
                  </span>
                  <Button
                    onClick={() => router.push('/profile')}
                    variant="secondary"
                    className="bg-white/20 text-white hover:bg-white/30 border-white/30"
                  >
                    Profile
                  </Button>
                  <Button
                    onClick={logout}
                    variant="outline"
                    className="bg-white text-red-600 hover:bg-red-50 border-white"
                  >
                    Logout
                  </Button>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Button
                    onClick={() => router.push('/auth/login')}
                    variant="secondary"
                    className="bg-white/20 text-white hover:bg-white/30 border-white/30"
                  >
                    Login
                  </Button>
                  <Button
                    onClick={() => router.push('/auth/signup')}
                    variant="outline"
                    className="bg-white text-primary hover:bg-gray-50 border-white"
                  >
                    Sign Up
                  </Button>
                </div>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="fade-in">
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Connect with
              <span className="block bg-gradient-to-r from-white to-cyan-100 bg-clip-text text-transparent">
                Confidence
              </span>
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Experience seamless authentication and user management with our secure, 
              reliable platform designed for the modern web.
            </p>
            {!isAuthenticated ? (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={() => router.push('/auth/signup')}
                  size="lg"
                  className="text-lg px-8 py-4 bg-white text-primary hover:bg-gray-50"
                >
                  Get Started Free
                </Button>
                <Button
                  onClick={() => router.push('/auth/login')}
                  variant="outline"
                  size="lg"
                  className="text-lg px-8 py-4 bg-white/20 text-white hover:bg-white/30 border-white/30"
                >
                  Sign In
                </Button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={() => router.push('/speechtotxt')}
                  size="lg"
                  className="text-lg px-8 py-4 bg-white text-primary hover:bg-gray-50"
                >
                  🎙️ Start Speech Chat
                </Button>
                <Button
                  onClick={() => router.push('/dashboard')}
                  variant="outline"
                  size="lg"
                  className="text-lg px-8 py-4 bg-white/20 text-white hover:bg-white/30 border-white/30"
                >
                  Go to Dashboard
                </Button>
                <Button
                  onClick={() => router.push('/profile')}
                  variant="secondary"
                  size="lg"
                  className="text-lg px-8 py-4 bg-white/10 text-white hover:bg-white/20"
                >
                  View Profile
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 slide-up">
            <h3 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent mb-4">
              Why Choose TruBridge Pulse?
            </h3>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Built with modern security practices and user experience in mind
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center slide-up hover-lift">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <CardTitle className="text-xl font-semibold">Secure Authentication</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Advanced encryption and security measures to protect your data and privacy.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center slide-up hover-lift">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <CardTitle className="text-xl font-semibold">Lightning Fast</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Optimized performance ensuring quick load times and smooth user experience.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center slide-up hover-lift">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <CardTitle className="text-xl font-semibold">User Friendly</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Intuitive design and seamless interactions for the best user experience.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      {isAuthenticated && (
        <section className="py-16 bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-4 gap-8">
              <Card className="text-center bg-white/20 border-white/30 text-white backdrop-blur-sm">
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold mb-2">👋</div>
                  <CardTitle className="text-lg font-semibold text-white">Welcome Back</CardTitle>
                  <CardDescription className="text-blue-100">{user?.name}</CardDescription>
                </CardContent>
              </Card>
              <Card className="text-center bg-white/20 border-white/30 text-white backdrop-blur-sm">
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold mb-2">🔒</div>
                  <CardTitle className="text-lg font-semibold text-white">Secure Login</CardTitle>
                  <CardDescription className="text-blue-100">Protected Account</CardDescription>
                </CardContent>
              </Card>
              <Card className="text-center bg-white/20 border-white/30 text-white backdrop-blur-sm">
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold mb-2">⚡</div>
                  <CardTitle className="text-lg font-semibold text-white">Fast Access</CardTitle>
                  <CardDescription className="text-blue-100">Instant Dashboard</CardDescription>
                </CardContent>
              </Card>
              <Card className="text-center bg-white/20 border-white/30 text-white backdrop-blur-sm">
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold mb-2">🎯</div>
                  <CardTitle className="text-lg font-semibold text-white">Age</CardTitle>
                  <CardDescription className="text-blue-100">{user?.age} years old</CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h4 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent mb-4">
              TruBridge Pulse
            </h4>
            <p className="text-gray-400 mb-6">
              Built with ❤️ using Next.js, MongoDB, and modern web technologies
            </p>
            <div className="flex justify-center space-x-6">
              <Button variant="link" className="text-gray-400 hover:text-white p-0 h-auto">Privacy</Button>
              <Button variant="link" className="text-gray-400 hover:text-white p-0 h-auto">Terms</Button>
              <Button variant="link" className="text-gray-400 hover:text-white p-0 h-auto">Support</Button>
            </div>
            <div className="mt-6 pt-6 border-t border-gray-700">
              <p className="text-gray-400">
                © 2025 TruBridge Pulse. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
