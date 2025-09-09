'use client';

import { useAuthStore } from '@/stores/auth';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function HomePage() {
  const { isAuthenticated, isLoading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/chat');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return null; // Will redirect to /chat
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center text-white">
          <h1 className="text-6xl font-bold mb-6">Quix Messenger</h1>
          <p className="text-xl mb-12 max-w-2xl mx-auto">
            Connect with friends and family through fast, secure, and simple messaging.
          </p>
          
          <div className="space-x-4">
            <Link 
              href="/login"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Sign In
            </Link>
            <Link 
              href="/register"
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
        
        <div className="mt-16 grid md:grid-cols-3 gap-8 text-white">
          <div className="text-center">
            <div className="bg-white/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Instant Messaging</h3>
            <p>Send and receive messages in real-time with your contacts.</p>
          </div>
          
          <div className="text-center">
            <div className="bg-white/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Secure & Private</h3>
            <p>Your conversations are protected with end-to-end encryption.</p>
          </div>
          
          <div className="text-center">
            <div className="bg-white/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Group Chats</h3>
            <p>Create groups and stay connected with multiple friends at once.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
