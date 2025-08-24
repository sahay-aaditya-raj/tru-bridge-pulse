'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import DonorSearchPublic from './donor-search-public/publicView';
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
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 py-16 sm:py-20 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="fade-in">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6">
              Connect with
              <span className="block bg-gradient-to-r from-white to-cyan-100 bg-clip-text text-transparent">
                Confidence
              </span>
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-blue-100 mb-6 sm:mb-8 max-w-3xl mx-auto px-4">
              Experience seamless authentication and user management with our secure, 
              reliable platform designed for the modern web.
            </p>
            {!isAuthenticated ? (
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center max-w-2xl mx-auto">
                <Button
                    onClick={() => router.push('/auth/signup')}
                    size="lg"
                    className="text-sm sm:text-base md:text-lg px-6 sm:px-8 py-3 sm:py-4 bg-white text-primary hover:bg-gray-50 transition-transform duration-200 ease-in-out hover:scale-105 hover:shadow-lg cursor-pointer w-full sm:w-auto"
                >
                  Get Started Free
                </Button>
                <Button
                    onClick={() => router.push('/auth/login')}
                    variant="outline"
                    size="lg"
                    className="text-sm sm:text-base md:text-lg px-6 sm:px-8 py-3 sm:py-4 bg-white/20 text-white hover:bg-white/30 border-white/30 transition-transform duration-200 ease-in-out hover:scale-105 hover:shadow-lg cursor-pointer w-full sm:w-auto"
                >
                  Sign In
                </Button>
                <Button
                    onClick={() => router.push('/donor-search-public')}
                    size="lg"
                    className="text-sm sm:text-base md:text-lg px-6 sm:px-8 py-3 sm:py-4 bg-white text-primary hover:bg-gray-50 transition-transform duration-200 ease-in-out hover:scale-105 hover:shadow-lg cursor-pointer w-full sm:w-auto"
                >
                  🔎 Search Organ Donors
                </Button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center max-w-3xl mx-auto">
                <Button
                    onClick={() => router.push('/speechtotxt')}
                    size="lg"
                    className="text-sm sm:text-base md:text-lg px-6 sm:px-8 py-3 sm:py-4 bg-white text-primary hover:bg-gray-50 transition-transform duration-200 ease-in-out hover:scale-105 hover:shadow-lg cursor-pointer w-full sm:w-auto"
                >
                  🎙️ Start Speech Chat
                </Button>
                <Button
                    onClick={() => router.push('/dashboard')}
                    variant="outline"
                    size="lg"
                    className="text-sm sm:text-base md:text-lg px-6 sm:px-8 py-3 sm:py-4 bg-white/20 text-white hover:bg-white/30 border-white/30 transition-transform duration-200 ease-in-out hover:scale-105 hover:shadow-lg cursor-pointer w-full sm:w-auto"
                >
                  Go to Dashboard
                </Button>
                <Button
                    onClick={() => router.push('/donor-search-public')}
                    size="lg"
                    className="text-sm sm:text-base md:text-lg px-6 sm:px-8 py-3 sm:py-4 bg-white text-primary hover:bg-gray-50 transition-transform duration-200 ease-in-out hover:scale-105 hover:shadow-lg cursor-pointer w-full sm:w-auto"
                >
                  🔎 Search Organ Donors
                </Button>
                <Button
                    onClick={() => router.push('/profile')}
                    variant="secondary"
                    size="lg"
                    className="text-sm sm:text-base md:text-lg px-6 sm:px-8 py-3 sm:py-4 bg-white/10 text-white hover:bg-white/20 transition-transform duration-200 ease-in-out hover:scale-105 hover:shadow-lg cursor-pointer w-full sm:w-auto"
                >
                  View Profile
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16 slide-up">
            <h3 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent mb-3 sm:mb-4">
              Why Choose TruBridge Pulse?
            </h3>
            <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto px-4">
              Built with modern security practices and user experience in mind
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <Card className="text-center slide-up hover-lift">
              <CardHeader>
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <CardTitle className="text-lg sm:text-xl font-semibold">Secure Authentication</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm sm:text-base">
                  Advanced encryption and security measures to protect your data and privacy.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center slide-up hover-lift">
              <CardHeader>
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <CardTitle className="text-lg sm:text-xl font-semibold">Lightning Fast</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm sm:text-base">
                  Optimized performance ensuring quick load times and smooth user experience.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center slide-up hover-lift">
              <CardHeader>
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-400 to-emerald-400 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <CardTitle className="text-lg sm:text-xl font-semibold">User Friendly</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm sm:text-base">
                  Intuitive design and seamless interactions for the best user experience.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      {isAuthenticated && (
        <section className="py-12 sm:py-16 bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
              <Card className="text-center bg-white/20 border-white/30 text-white backdrop-blur-sm">
                <CardContent className="pt-4 sm:pt-6">
                  <div className="text-2xl sm:text-3xl font-bold mb-2">👋</div>
                  <CardTitle className="text-base sm:text-lg font-semibold text-white">Welcome Back</CardTitle>
                  <CardDescription className="text-blue-100 text-sm sm:text-base">{user?.name}</CardDescription>
                </CardContent>
              </Card>
              <Card className="text-center bg-white/20 border-white/30 text-white backdrop-blur-sm">
                <CardContent className="pt-4 sm:pt-6">
                  <div className="text-2xl sm:text-3xl font-bold mb-2">🔒</div>
                  <CardTitle className="text-base sm:text-lg font-semibold text-white">Secure Login</CardTitle>
                  <CardDescription className="text-blue-100 text-sm sm:text-base">Protected Account</CardDescription>
                </CardContent>
              </Card>
              <Card className="text-center bg-white/20 border-white/30 text-white backdrop-blur-sm">
                <CardContent className="pt-4 sm:pt-6">
                  <div className="text-2xl sm:text-3xl font-bold mb-2">⚡</div>
                  <CardTitle className="text-base sm:text-lg font-semibold text-white">Fast Access</CardTitle>
                  <CardDescription className="text-blue-100 text-sm sm:text-base">Instant Dashboard</CardDescription>
                </CardContent>
              </Card>
              <Card className="text-center bg-white/20 border-white/30 text-white backdrop-blur-sm">
                <CardContent className="pt-4 sm:pt-6">
                  <div className="text-2xl sm:text-3xl font-bold mb-2">🎯</div>
                  <CardTitle className="text-base sm:text-lg font-semibold text-white">Age</CardTitle>
                  <CardDescription className="text-blue-100 text-sm sm:text-base">{user?.age} years old</CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      )}


      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h4 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent mb-3 sm:mb-4">
              TruBridge Pulse
            </h4>
            <p className="text-gray-400 mb-4 sm:mb-6 text-sm sm:text-base">
              Built with ❤️ using Next.js, MongoDB, and modern web technologies
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6">
              <Button variant="link" className="text-gray-400 hover:text-white p-0 h-auto cursor-pointer text-sm sm:text-base">Privacy</Button>
              <Button variant="link" className="text-gray-400 hover:text-white p-0 h-auto cursor-pointer text-sm sm:text-base">Terms</Button>
              <Button variant="link" className="text-gray-400 hover:text-white p-0 h-auto cursor-pointer text-sm sm:text-base">Support</Button>
            </div>
            <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-700">
              <p className="text-gray-400 text-xs sm:text-sm">
                © 2025 TruBridge Pulse. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
