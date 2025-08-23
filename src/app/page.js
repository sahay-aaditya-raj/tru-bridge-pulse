'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const { user, loading, logout, isAuthenticated } = useAuth();
  const router = useRouter();

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

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="gradient-bg shadow-lg">
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
                  <button
                    onClick={() => router.push('/profile')}
                    className="btn-secondary"
                  >
                    Profile
                  </button>
                  <button
                    onClick={logout}
                    className="bg-white text-red-600 hover:bg-red-50 px-4 py-2 rounded-md font-medium transition-colors"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => router.push('/auth/login')}
                    className="btn-secondary"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => router.push('/auth/signup')}
                    className="bg-white text-blue-600 hover:bg-gray-50 px-4 py-2 rounded-md font-medium transition-colors"
                  >
                    Sign Up
                  </button>
                </div>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="gradient-bg py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="fade-in">
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Connect with
              <span className="block gradient-text bg-white">
                Confidence
              </span>
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Experience seamless authentication and user management with our secure, 
              reliable platform designed for the modern web.
            </p>
            {!isAuthenticated ? (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => router.push('/auth/signup')}
                  className="btn-primary text-lg px-8 py-4"
                >
                  Get Started Free
                </button>
                <button
                  onClick={() => router.push('/auth/login')}
                  className="btn-secondary text-lg px-8 py-4"
                >
                  Sign In
                </button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => router.push('/speechtotxt')}
                  className="btn-primary text-lg px-8 py-4"
                >
                  🎙️ Start Speech Chat
                </button>
                <button
                  onClick={() => router.push('/dashboard')}
                  className="btn-secondary text-lg px-8 py-4"
                >
                  Go to Dashboard
                </button>
                <button
                  onClick={() => router.push('/profile')}
                  className="bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 text-lg px-8 py-4 rounded-md font-medium transition-colors"
                >
                  View Profile
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 slide-up">
            <h3 className="text-3xl font-bold gradient-text mb-4">
              Why Choose TruBridge Pulse?
            </h3>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Built with modern security practices and user experience in mind
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="card text-center slide-up">
              <div className="w-16 h-16 gradient-bg rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h4 className="text-xl font-semibold mb-4">Secure Authentication</h4>
              <p className="text-gray-600">
                Advanced encryption and security measures to protect your data and privacy.
              </p>
            </div>

            <div className="card text-center slide-up">
              <div className="w-16 h-16 gradient-bg rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h4 className="text-xl font-semibold mb-4">Lightning Fast</h4>
              <p className="text-gray-600">
                Optimized performance ensuring quick load times and smooth user experience.
              </p>
            </div>

            <div className="card text-center slide-up">
              <div className="w-16 h-16 gradient-bg rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h4 className="text-xl font-semibold mb-4">User Friendly</h4>
              <p className="text-gray-600">
                Intuitive design and seamless interactions for the best user experience.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      {isAuthenticated && (
        <section className="py-16 gradient-bg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-4 gap-8 text-center text-white">
              <div>
                <div className="text-3xl font-bold mb-2">👋</div>
                <div className="text-lg font-semibold">Welcome Back</div>
                <div className="text-blue-100">{user?.name}</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-2">🔒</div>
                <div className="text-lg font-semibold">Secure Login</div>
                <div className="text-blue-100">Protected Account</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-2">⚡</div>
                <div className="text-lg font-semibold">Fast Access</div>
                <div className="text-blue-100">Instant Dashboard</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-2">🎯</div>
                <div className="text-lg font-semibold">Age</div>
                <div className="text-blue-100">{user?.age} years old</div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h4 className="text-xl font-bold gradient-text mb-4">TruBridge Pulse</h4>
            <p className="text-gray-400 mb-6">
              Built with ❤️ using Next.js, MongoDB, and modern web technologies
            </p>
            <div className="flex justify-center space-x-6">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Terms</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Support</a>
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
