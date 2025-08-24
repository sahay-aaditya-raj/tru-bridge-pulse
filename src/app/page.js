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
              TruBridge Pulse offers confidential, AI-powered medical support whenever you need it, with your data always safe and private.
            </p>
            {!isAuthenticated ? (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                    onClick={() => router.push('/auth/signup')}
                    size="lg"
                    className="text-lg px-8 py-4 bg-white text-primary hover:bg-gray-50 transition-transform duration-200 ease-in-out hover:scale-105 hover:shadow-lg cursor-pointer"
                >
                  Get Started Free
                </Button>
                <Button
                    onClick={() => router.push('/auth/login')}
                    variant="outline"
                    size="lg"
                    className="text-lg px-8 py-4 bg-white/20 text-white hover:bg-white/30 border-white/30 transition-transform duration-200 ease-in-out hover:scale-105 hover:shadow-lg cursor-pointer"
                >
                  Sign In
                </Button>
                <Button
                    onClick={() => router.push('/donor-search-public')}
                    size="lg"
                    className="text-lg px-8 py-4 bg-white text-primary hover:bg-gray-50 transition-transform duration-200 ease-in-out hover:scale-105 hover:shadow-lg cursor-pointer"
                >
                  🔎 Search Organ Donors
                </Button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                    onClick={() => router.push('/speechtotxt')}
                    size="lg"
                    className="text-lg px-8 py-4 bg-white text-primary hover:bg-gray-50 transition-transform duration-200 ease-in-out hover:scale-105 hover:shadow-lg cursor-pointer"
                >
                  🎙️ Start Speech Chat
                </Button>
                <Button
                    onClick={() => router.push('/dashboard')}
                    variant="outline"
                    size="lg"
                    className="text-lg px-8 py-4 bg-white/20 text-white hover:bg-white/30 border-white/30 transition-transform duration-200 ease-in-out hover:scale-105 hover:shadow-lg cursor-pointer"
                >
                  Go to Dashboard
                </Button>
                <Button
                    onClick={() => router.push('/donor-search-public')}
                    size="lg"
                    className="text-lg px-8 py-4 bg-white text-primary hover:bg-gray-50 transition-transform duration-200 ease-in-out hover:scale-105 hover:shadow-lg cursor-pointer"
                >
                  🔎 Search Organ Donors
                </Button>
                <Button
                    onClick={() => router.push('/profile')}
                    variant="secondary"
                    size="lg"
                    className="text-lg px-8 py-4 bg-white/10 text-white hover:bg-white/20 transition-transform duration-200 ease-in-out hover:scale-105 hover:shadow-lg cursor-pointer"
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12A4 4 0 118 12a4 4 0 018 0z" />
                  </svg>
                </div>
                <CardTitle className="text-xl font-semibold">Confidential Support</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Get medical help anytime, anywhere, with your privacy always respected.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center slide-up hover-lift">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3" />
                  </svg>
                </div>
                <CardTitle className="text-xl font-semibold">AI-Powered Assistance</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Smart, instant answers and support from advanced medical AI.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center slide-up hover-lift">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <CardTitle className="text-xl font-semibold">Data Privacy</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Your health information is always protected and never shared without consent.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

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
              <Button variant="link" className="text-gray-400 hover:text-white p-0 h-auto cursor-pointer">Privacy</Button>
              <Button variant="link" className="text-gray-400 hover:text-white p-0 h-auto cursor-pointer">Terms</Button>
              <Button variant="link" className="text-gray-400 hover:text-white p-0 h-auto cursor-pointer">Support</Button>
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